import { PhotoItem, DuplicateCluster, StorageStats } from '../types';
import { computeHashSimilarity } from './imageAnalyzer';

export function detectClusters(
  photos: PhotoItem[],
  similarityThreshold = 84
): {
  clusters: DuplicateCluster[];
  updatedPhotos: PhotoItem[];
} {
  const n = photos.length;
  const visited = new Set<string>();
  const clusters: DuplicateCluster[] = [];

  // Clone photos array so we don't mutate input
  const updatedPhotos: PhotoItem[] = photos.map((p) => ({
    ...p,
    clusterId: undefined,
    isBestInCluster: false,
  }));

  const photoMap = new Map<string, PhotoItem>();
  updatedPhotos.forEach((p) => photoMap.set(p.id, p));

  for (let i = 0; i < n; i++) {
    const photoA = updatedPhotos[i];
    if (visited.has(photoA.id)) continue;

    const clusterMembers: PhotoItem[] = [photoA];
    let minSimilarityInCluster = 100;
    let isExact = true;
    let isBurst = false;

    for (let j = i + 1; j < n; j++) {
      const photoB = updatedPhotos[j];
      if (visited.has(photoB.id)) continue;

      const { similarity } = computeHashSimilarity(photoA.dHash, photoB.dHash);

      // Check if matches threshold
      if (similarity >= similarityThreshold) {
        clusterMembers.push(photoB);
        visited.add(photoB.id);

        if (similarity < 100) isExact = false;
        minSimilarityInCluster = Math.min(minSimilarityInCluster, similarity);

        // Check if burst shot (taken within 90 seconds of each other)
        const timeDiffSec = Math.abs(photoA.timestamp - photoB.timestamp) / 1000;
        if (timeDiffSec <= 90) {
          isBurst = true;
        }
      }
    }

    if (clusterMembers.length > 1) {
      visited.add(photoA.id);
      const clusterId = `cluster-${clusters.length + 1}`;

      // Pick the best shot:
      // Score = (sharpness * 1.5) + (megapixels * 2)
      clusterMembers.sort((a, b) => {
        const scoreA = a.sharpnessScore * 1.5 + Math.min(24, a.megapixels) * 2;
        const scoreB = b.sharpnessScore * 1.5 + Math.min(24, b.megapixels) * 2;
        return scoreB - scoreA;
      });

      const bestItem = clusterMembers[0];
      const clusterType: DuplicateCluster['type'] = isExact
        ? 'exact'
        : isBurst
        ? 'burst'
        : 'near-duplicate';

      let totalSize = 0;
      clusterMembers.forEach((item) => {
        totalSize += item.fileSize;
        item.clusterId = clusterId;
        if (item.id === bestItem.id) {
          item.isBestInCluster = true;
          item.category = 'near-duplicate';
        } else {
          item.isBestInCluster = false;
          item.category = isExact ? 'exact-duplicate' : isBurst ? 'burst' : 'near-duplicate';
        }
      });

      const wastedSize = totalSize - bestItem.fileSize;

      clusters.push({
        id: clusterId,
        type: clusterType,
        similarity: minSimilarityInCluster,
        items: clusterMembers,
        recommendedKeepId: bestItem.id,
        totalSizeBytes: totalSize,
        wastedSizeBytes: wastedSize,
      });
    } else {
      // Check if oversized standalone
      if (photoA.megapixels > 16 || photoA.fileSize > 4 * 1024 * 1024) {
        photoA.category = 'oversized';
      } else {
        photoA.category = 'optimized';
      }
    }
  }

  // Calculate stats
  return { clusters, updatedPhotos };
}

export function computeStorageStats(
  photos: PhotoItem[],
  clusters: DuplicateCluster[]
): StorageStats {
  const totalCount = photos.length;
  let totalSizeBytes = 0;
  let estimatedCompressedBytes = 0;
  let duplicateWastedBytes = 0;
  let oversizedCount = 0;

  clusters.forEach((c) => {
    duplicateWastedBytes += c.wastedSizeBytes;
  });

  photos.forEach((p) => {
    totalSizeBytes += p.fileSize;

    if (p.megapixels > 16 || p.fileSize > 4 * 1024 * 1024) {
      oversizedCount++;
    }

    if (p.compressedSize) {
      estimatedCompressedBytes += p.compressedSize;
    } else {
      // Realistic estimate based on target WebP storage saver
      if (p.megapixels > 16) {
        // High megapixel RAW/camera photos compress down by ~75-85%
        estimatedCompressedBytes += Math.round(p.fileSize * 0.22);
      } else if (p.fileSize > 2 * 1024 * 1024) {
        estimatedCompressedBytes += Math.round(p.fileSize * 0.35);
      } else {
        estimatedCompressedBytes += Math.round(p.fileSize * 0.6);
      }
    }
  });

  // Potential savings includes eliminating duplicate waste + compressing remaining photos
  const potentialSavingsBytes = Math.max(0, totalSizeBytes - estimatedCompressedBytes);

  return {
    totalCount,
    totalSizeBytes,
    estimatedCompressedBytes,
    potentialSavingsBytes,
    duplicateClusterCount: clusters.length,
    duplicateWastedBytes,
    oversizedCount,
  };
}
