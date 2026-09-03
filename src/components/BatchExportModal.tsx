import React, { useState } from 'react';
import {
  X,
  Download,
  CheckCircle2,
  Sparkles,
  FileArchive,
  ArrowRight,
  TrendingDown,
} from 'lucide-react';
import JSZip from 'jszip';
import { PhotoItem, CompressionSettings } from '../types';
import { compressImage, formatBytes } from '../utils/imageAnalyzer';

interface BatchExportModalProps {
  photos: PhotoItem[];
  onClose: () => void;
  onCompleted: (updatedPhotos: PhotoItem[]) => void;
}

export const BatchExportModal: React.FC<BatchExportModalProps> = ({
  photos,
  onClose,
  onCompleted,
}) => {
  const [preset, setPreset] = useState<'google_storage_saver' | 'balanced' | 'high_compression'>('google_storage_saver');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [resultSummary, setResultSummary] = useState<{
    originalTotal: number;
    compressedTotal: number;
    savingsBytes: number;
    savingsPct: number;
  } | null>(null);

  const targetPhotos = photos.filter((p) => p.selectedForAction).length > 0
    ? photos.filter((p) => p.selectedForAction)
    : photos;

  const handleStartExport = async () => {
    setIsProcessing(true);
    setProgress(0);
    setCurrentFileIndex(0);

    const zip = new JSZip();
    const updatedPhotos: PhotoItem[] = [...photos];

    const settings: CompressionSettings = {
      preset,
      maxDimension: preset === 'google_storage_saver' ? 4096 : preset === 'high_compression' ? 2048 : 0,
      quality: preset === 'google_storage_saver' ? 0.8 : preset === 'high_compression' ? 0.72 : 0.85,
      format: 'image/webp',
    };

    let originalTotal = 0;
    let compressedTotal = 0;

    for (let i = 0; i < targetPhotos.length; i++) {
      const item = targetPhotos[i];
      setCurrentFileIndex(i + 1);
      setProgress(Math.round(((i + 1) / targetPhotos.length) * 100));

      originalTotal += item.fileSize;

      try {
        const compressed = await compressImage(item.dataUrl, settings);
        compressedTotal += compressed.sizeBytes;

        // Base name without extension
        const baseName = item.name.replace(/\.[^/.]+$/, '');
        const outFileName = `${baseName}_optimized.webp`;

        zip.file(outFileName, compressed.blob);

        // Update photo record
        const idx = updatedPhotos.findIndex((p) => p.id === item.id);
        if (idx !== -1) {
          updatedPhotos[idx] = {
            ...updatedPhotos[idx],
            compressedDataUrl: compressed.dataUrl,
            compressedSize: compressed.sizeBytes,
            compressedWidth: compressed.width,
            compressedHeight: compressed.height,
          };
        }
      } catch (err) {
        console.error('Failed to compress item', item.name, err);
      }
    }

    const savings = Math.max(0, originalTotal - compressedTotal);
    const savingsPct = originalTotal > 0 ? Math.round((savings / originalTotal) * 100) : 0;

    // Add manifest text file to zip
    const report = [
      '==================================================',
      'PHOTO STORAGE SAVER & DUPLICATE OPTIMIZATION REPORT',
      '==================================================',
      `Processed Date: ${new Date().toLocaleString()}`,
      `Total Photos Processed: ${targetPhotos.length}`,
      `Original Total Size: ${formatBytes(originalTotal)}`,
      `Optimized Total Size: ${formatBytes(compressedTotal)}`,
      `Storage Saved: ${formatBytes(savings)} (${savingsPct}% reduction)`,
      '',
      'RECOMMENDED NEXT STEPS FOR GOOGLE PHOTOS:',
      '1. Review the optimized photos in this ZIP archive.',
      '2. Upload these Storage-Saver photos to your Google Photos library.',
      '3. Search for the corresponding original duplicate/oversized files in Google Photos and delete them to free up quota.',
      '4. Empty your Google Photos Trash folder to finalize quota reclamation.',
      '==================================================',
    ].join('\n');

    zip.file('storage-savings-report.txt', report);

    // Generate zip and download
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const downloadUrl = URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `google_photos_optimized_${new Date().toISOString().slice(0, 10)}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(downloadUrl);

    setResultSummary({
      originalTotal,
      compressedTotal,
      savingsBytes: savings,
      savingsPct,
    });
    setIsProcessing(false);
    onCompleted(updatedPhotos);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <FileArchive className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Batch Compress &amp; Export ZIP</h3>
            <p className="text-xs text-slate-500">
              {targetPhotos.length} photo{targetPhotos.length !== 1 ? 's' : ''} ready for optimization
            </p>
          </div>
        </div>

        {!resultSummary ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Select Optimization Target:
              </label>
              <div className="space-y-2">
                <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="radio"
                    name="preset"
                    checked={preset === 'google_storage_saver'}
                    onChange={() => setPreset('google_storage_saver')}
                    className="mt-1 accent-blue-600"
                  />
                  <div className="text-xs">
                    <div className="font-semibold text-slate-900">Google Storage Saver Quality (Recommended)</div>
                    <p className="text-slate-500">Downscales &gt;16MP to 16MP, 80% WebP. Typically saves 70–85% storage with crisp fidelity.</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="radio"
                    name="preset"
                    checked={preset === 'balanced'}
                    onChange={() => setPreset('balanced')}
                    className="mt-1 accent-blue-600"
                  />
                  <div className="text-xs">
                    <div className="font-semibold text-slate-900">Preserve Original Megapixels (Visually Lossless)</div>
                    <p className="text-slate-500">Maintains exact pixel dimensions, 85% WebP encoding. Saves 40–60% space.</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="radio"
                    name="preset"
                    checked={preset === 'high_compression'}
                    onChange={() => setPreset('high_compression')}
                    className="mt-1 accent-blue-600"
                  />
                  <div className="text-xs">
                    <div className="font-semibold text-slate-900">Maximum Space Saver (2048px / 72% Q)</div>
                    <p className="text-slate-500">Ideal for receipts, whiteboards, notes, and casual backups. Reclaims up to 90% space.</p>
                  </div>
                </label>
              </div>
            </div>

            {isProcessing ? (
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs text-slate-600 font-medium">
                  <span>Compressing {currentFileIndex} of {targetPhotos.length}...</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all duration-200"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ) : (
              <button
                onClick={handleStartExport}
                className="w-full mt-3 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Start Compression &amp; Download ZIP</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-emerald-900">Optimization Complete!</h4>
              <p className="text-xs text-emerald-700 mt-0.5">
                Your ZIP package with optimized photos and savings manifest has downloaded.
              </p>

              <div className="mt-3 pt-3 border-t border-emerald-200/60 grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white/70 p-2 rounded-lg">
                  <div className="text-slate-500">Original Size</div>
                  <div className="font-bold text-slate-800">{formatBytes(resultSummary.originalTotal)}</div>
                </div>
                <div className="bg-white/70 p-2 rounded-lg">
                  <div className="text-emerald-700">Space Saved</div>
                  <div className="font-bold text-emerald-700">
                    {formatBytes(resultSummary.savingsBytes)} (-{resultSummary.savingsPct}%)
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-900 text-white font-medium text-xs rounded-xl transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
