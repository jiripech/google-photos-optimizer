export interface PhotoItem {
  id: string;
  name: string;
  fileSize: number; // bytes
  width: number;
  height: number;
  megapixels: number;
  mimeType: string;
  dataUrl: string;
  thumbnailUrl: string;
  dHash: string; // 64-bit binary string
  averageBrightness: number;
  timestamp: number;
  sharpnessScore: number; // 0 - 100 estimated sharpness
  compressedDataUrl?: string;
  compressedSize?: number;
  compressedWidth?: number;
  compressedHeight?: number;
  selectedForAction?: boolean;
  markedForDeletion?: boolean;
  clusterId?: string;
  isBestInCluster?: boolean;
  category: 'exact-duplicate' | 'near-duplicate' | 'burst' | 'oversized' | 'optimized';
}

export interface DuplicateCluster {
  id: string;
  type: 'exact' | 'near-duplicate' | 'burst';
  similarity: number; // percentage (0 - 100)
  items: PhotoItem[];
  recommendedKeepId: string;
  totalSizeBytes: number;
  wastedSizeBytes: number;
}

export interface CompressionSettings {
  preset: 'google_storage_saver' | 'balanced' | 'high_compression' | 'custom';
  maxDimension: number; // e.g. 4096 for ~16MP or 2048 or 0 (no resize)
  quality: number; // 0.1 to 1.0
  format: 'image/webp' | 'image/jpeg';
}

export interface StorageStats {
  totalCount: number;
  totalSizeBytes: number;
  estimatedCompressedBytes: number;
  potentialSavingsBytes: number;
  duplicateClusterCount: number;
  duplicateWastedBytes: number;
  oversizedCount: number;
}
