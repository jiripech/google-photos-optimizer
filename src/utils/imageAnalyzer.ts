import { CompressionSettings } from '../types';

/**
 * Calculates a 64-bit difference hash (dHash) from an Image element.
 * Scales image to 9x8 grayscale, then compares adjacent horizontal pixels.
 */
export function calculateDHashFromCanvas(
  source: HTMLImageElement | HTMLCanvasElement
): { dHash: string; avgBrightness: number; sharpness: number } {
  const canvas = document.createElement('canvas');
  canvas.width = 9;
  canvas.height = 8;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    return { dHash: '0'.repeat(64), avgBrightness: 128, sharpness: 50 };
  }

  ctx.drawImage(source, 0, 0, 9, 8);
  const imgData = ctx.getImageData(0, 0, 9, 8).data;

  // Convert to grayscale values
  const grays: number[][] = [];
  let totalBrightness = 0;
  for (let y = 0; y < 8; y++) {
    const row: number[] = [];
    for (let x = 0; x < 9; x++) {
      const idx = (y * 9 + x) * 4;
      const r = imgData[idx];
      const g = imgData[idx + 1];
      const b = imgData[idx + 2];
      // Luminance
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      row.push(lum);
      totalBrightness += lum;
    }
    grays.push(row);
  }

  // 64-bit hash: row by row, 8 bits each
  let hashBits = '';
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      hashBits += grays[y][x] > grays[y][x + 1] ? '1' : '0';
    }
  }

  // Calculate sharpness on a 64x64 sample
  const sharpness = estimateSharpness(source);

  return {
    dHash: hashBits,
    avgBrightness: Math.round(totalBrightness / 72),
    sharpness,
  };
}

/**
 * Estimates sharpness using horizontal & vertical edge gradient variance.
 */
export function estimateSharpness(
  source: HTMLImageElement | HTMLCanvasElement
): number {
  const canvas = document.createElement('canvas');
  const size = 64;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return 50;

  ctx.drawImage(source, 0, 0, size, size);
  const data = ctx.getImageData(0, 0, size, size).data;

  let totalDiff = 0;
  let count = 0;

  for (let y = 0; y < size - 1; y++) {
    for (let x = 0; x < size - 1; x++) {
      const i1 = (y * size + x) * 4;
      const iRight = (y * size + (x + 1)) * 4;
      const iDown = ((y + 1) * size + x) * 4;

      const lum = 0.299 * data[i1] + 0.587 * data[i1 + 1] + 0.114 * data[i1 + 2];
      const lumRight = 0.299 * data[iRight] + 0.587 * data[iRight + 1] + 0.114 * data[iRight + 2];
      const lumDown = 0.299 * data[iDown] + 0.587 * data[iDown + 1] + 0.114 * data[iDown + 2];

      const diff = Math.abs(lum - lumRight) + Math.abs(lum - lumDown);
      totalDiff += diff;
      count++;
    }
  }

  const avgEdge = count > 0 ? totalDiff / count : 0;
  // Map average edge to 0-100 score
  const score = Math.min(100, Math.max(10, Math.round(avgEdge * 3.8)));
  return score;
}

/**
 * Computes Hamming distance between two 64-bit hashes.
 * Returns distance (0 to 64) and similarity percentage (0 to 100).
 */
export function computeHashSimilarity(hashA: string, hashB: string): {
  distance: number;
  similarity: number;
} {
  if (!hashA || !hashB || hashA.length !== hashB.length) {
    return { distance: 64, similarity: 0 };
  }

  let distance = 0;
  for (let i = 0; i < hashA.length; i++) {
    if (hashA[i] !== hashB[i]) {
      distance++;
    }
  }

  const similarity = Math.round(((64 - distance) / 64) * 100);
  return { distance, similarity };
}

/**
 * Compresses an image according to target settings.
 */
export async function compressImage(
  imageSource: HTMLImageElement | string,
  settings: CompressionSettings
): Promise<{
  dataUrl: string;
  blob: Blob;
  sizeBytes: number;
  width: number;
  height: number;
}> {
  return new Promise((resolve, reject) => {
    const img = typeof imageSource === 'string' ? new Image() : imageSource;
    
    const process = () => {
      let targetWidth = img.naturalWidth || img.width;
      let targetHeight = img.naturalHeight || img.height;

      // Check maxDimension constraint (e.g. 4096 for 16MP "Storage Saver")
      if (settings.maxDimension > 0) {
        const maxDim = Math.max(targetWidth, targetHeight);
        if (maxDim > settings.maxDimension) {
          const scale = settings.maxDimension / maxDim;
          targetWidth = Math.round(targetWidth * scale);
          targetHeight = Math.round(targetHeight * scale);
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context unavailable'));
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      const mime = settings.format || 'image/webp';
      const quality = settings.quality || 0.8;

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            // Fallback to toDataURL
            const dataUrl = canvas.toDataURL(mime, quality);
            // approximate size
            const size = Math.round((dataUrl.length * 3) / 4);
            resolve({
              dataUrl,
              blob: new Blob([]),
              sizeBytes: size,
              width: targetWidth,
              height: targetHeight,
            });
            return;
          }

          const reader = new FileReader();
          reader.onload = () => {
            resolve({
              dataUrl: reader.result as string,
              blob,
              sizeBytes: blob.size,
              width: targetWidth,
              height: targetHeight,
            });
          };
          reader.readAsDataURL(blob);
        },
        mime,
        quality
      );
    };

    if (typeof imageSource === 'string') {
      img.crossOrigin = 'anonymous';
      img.onload = process;
      img.onerror = (e) => reject(e);
      img.src = imageSource;
    } else {
      if (img.complete) {
        process();
      } else {
        img.onload = process;
        img.onerror = (e) => reject(e);
      }
    }
  });
}

/**
 * Formats byte size to human readable (KB, MB, GB).
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
