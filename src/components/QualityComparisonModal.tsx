import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Sliders,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sparkles,
  Check,
  RotateCcw,
  ArrowLeftRight,
} from 'lucide-react';
import { PhotoItem, CompressionSettings } from '../types';
import { compressImage, formatBytes } from '../utils/imageAnalyzer';

interface QualityComparisonModalProps {
  photo: PhotoItem | null;
  onClose: () => void;
  onApplyCompression: (photoId: string, compressedDataUrl: string, sizeBytes: number, width: number, height: number) => void;
}

export const QualityComparisonModal: React.FC<QualityComparisonModalProps> = ({
  photo,
  onClose,
  onApplyCompression,
}) => {
  const [sliderPosition, setSliderPosition] = useState(50); // percentage 0 - 100
  const [zoom, setZoom] = useState(1);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);

  // Settings
  const [preset, setPreset] = useState<'google_storage_saver' | 'balanced' | 'high_compression'>('google_storage_saver');
  const [quality, setQuality] = useState(0.8);
  const [maxDimension, setMaxDimension] = useState(4096); // ~16MP for Google Storage Saver
  const [format, setFormat] = useState<'image/webp' | 'image/jpeg'>('image/webp');

  // Compressed result state
  const [compressedResult, setCompressedResult] = useState<{
    dataUrl: string;
    sizeBytes: number;
    width: number;
    height: number;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // When preset changes, update parameters
  const handlePresetChange = (newPreset: 'google_storage_saver' | 'balanced' | 'high_compression') => {
    setPreset(newPreset);
    if (newPreset === 'google_storage_saver') {
      setMaxDimension(4096);
      setQuality(0.8);
      setFormat('image/webp');
    } else if (newPreset === 'balanced') {
      setMaxDimension(0); // keep original dimension
      setQuality(0.85);
      setFormat('image/webp');
    } else if (newPreset === 'high_compression') {
      setMaxDimension(2048);
      setQuality(0.72);
      setFormat('image/webp');
    }
  };

  // Run compression whenever settings or photo changes
  useEffect(() => {
    if (!photo) return;

    let isMounted = true;
    setIsCompressing(true);

    const run = async () => {
      try {
        const settings: CompressionSettings = {
          preset,
          maxDimension,
          quality,
          format,
        };

        const res = await compressImage(photo.dataUrl, settings);
        if (isMounted) {
          setCompressedResult({
            dataUrl: res.dataUrl,
            sizeBytes: res.sizeBytes,
            width: res.width,
            height: res.height,
          });
          setIsCompressing(false);
        }
      } catch (err) {
        console.error('Compression preview error', err);
        if (isMounted) setIsCompressing(false);
      }
    };

    run();

    return () => {
      isMounted = false;
    };
  }, [photo, quality, maxDimension, format, preset]);

  // Handle slider mouse / touch drag
  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDraggingSlider || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const offsetX = clientX - rect.left;
    const percentage = Math.max(5, Math.min(95, (offsetX / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleApply = () => {
    if (!photo || !compressedResult) return;
    onApplyCompression(
      photo.id,
      compressedResult.dataUrl,
      compressedResult.sizeBytes,
      compressedResult.width,
      compressedResult.height
    );
    onClose();
  };

  if (!photo) return null;

  const originalSize = photo.fileSize;
  const compressedSize = compressedResult ? compressedResult.sizeBytes : Math.round(originalSize * 0.25);
  const savingsPct = originalSize > 0 ? Math.round(((originalSize - compressedSize) / originalSize) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
              <ArrowLeftRight className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900">{photo.name}</h3>
              <p className="text-xs text-slate-500">
                Interactive Split Comparison: Original vs Optimized Storage Saver
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Body: Viewer & Settings Toolbar */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Visual Canvas Area */}
          <div className="flex-1 bg-slate-950 p-4 flex flex-col items-center justify-center relative overflow-hidden select-none">
            {/* Zoom Controls Overlay */}
            <div className="absolute top-3 left-3 z-20 flex items-center gap-1 bg-slate-900/80 backdrop-blur-xs px-2 py-1 rounded-lg border border-slate-700/50 text-white text-xs">
              <button
                onClick={() => setZoom((z) => Math.max(0.75, z - 0.25))}
                className="p-1 hover:text-blue-400"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="w-10 text-center font-mono">{Math.round(zoom * 100)}%</span>
              <button
                onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
                className="p-1 hover:text-blue-400"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoom(1)}
                className="p-1 hover:text-blue-400 ml-1 border-l border-slate-700 pl-1.5"
                title="Reset Zoom"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>

            {/* Interactive Split View Container */}
            <div
              ref={containerRef}
              onMouseDown={() => setIsDraggingSlider(true)}
              onMouseUp={() => setIsDraggingSlider(false)}
              onMouseLeave={() => setIsDraggingSlider(false)}
              onMouseMove={handleMouseMove}
              onTouchStart={() => setIsDraggingSlider(true)}
              onTouchEnd={() => setIsDraggingSlider(false)}
              onTouchMove={handleMouseMove}
              className="relative w-full h-[380px] sm:h-[450px] max-w-2xl rounded-xl overflow-hidden shadow-2xl border border-slate-800 cursor-ew-resize"
            >
              {/* Layer 1: Compressed Image (Full Background) */}
              <div
                className="absolute inset-0 flex items-center justify-center overflow-hidden"
                style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
              >
                <img
                  src={compressedResult?.dataUrl || photo.dataUrl}
                  alt="Optimized"
                  className="w-full h-full object-contain pointer-events-none"
                />
              </div>

              {/* Layer 2: Original Image (Clipped to Slider Left) */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{
                  width: `${sliderPosition}%`,
                  borderRight: '2px solid #3B82F6',
                }}
              >
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{
                    width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%',
                    height: '100%',
                    transform: `scale(${zoom})`,
                    transformOrigin: 'center',
                  }}
                >
                  <img
                    src={photo.dataUrl}
                    alt="Original"
                    className="w-full h-full object-contain pointer-events-none"
                  />
                </div>
              </div>

              {/* Split Drag Handle */}
              <div
                className="absolute top-0 bottom-0 z-10 flex items-center justify-center pointer-events-none"
                style={{ left: `calc(${sliderPosition}% - 14px)` }}
              >
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white shadow-lg border-2 border-white flex items-center justify-center">
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Labels on sides */}
              <div className="absolute top-3 left-3 pointer-events-none bg-black/60 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-md">
                Original ({formatBytes(photo.fileSize)})
              </div>
              <div className="absolute top-3 right-3 pointer-events-none bg-blue-600/80 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-md">
                Optimized ({formatBytes(compressedSize)})
              </div>

              {isCompressing && (
                <div className="absolute bottom-3 right-3 bg-slate-900/90 text-blue-300 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  <span>Computing compression...</span>
                </div>
              )}
            </div>

            {/* Slider hint */}
            <div className="mt-2 text-xs text-slate-400 flex items-center gap-2">
              <span>◄ Drag slider left / right to inspect optical quality difference ►</span>
            </div>
          </div>

          {/* Right Sidebar: Optimization Settings & Metrics */}
          <div className="w-full md:w-80 bg-white border-t md:border-t-0 md:border-l border-slate-200 p-5 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-5">
              {/* Savings Box */}
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200/80">
                <div className="text-xs font-medium text-emerald-800 mb-1">
                  Storage Reduction
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-emerald-700">-{savingsPct}%</span>
                  <span className="text-xs text-emerald-800">
                    Saves {formatBytes(Math.max(0, originalSize - compressedSize))}
                  </span>
                </div>
                <div className="mt-2 text-[11px] text-emerald-700 flex justify-between border-t border-emerald-200/60 pt-2">
                  <span>From: {formatBytes(originalSize)}</span>
                  <span>To: {formatBytes(compressedSize)}</span>
                </div>
              </div>

              {/* Presets */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Compression Preset
                </label>
                <div className="space-y-1.5">
                  <button
                    onClick={() => handlePresetChange('google_storage_saver')}
                    className={`w-full text-left px-3 py-2.5 rounded-lg border text-xs transition-all ${
                      preset === 'google_storage_saver'
                        ? 'border-blue-600 bg-blue-50/70 text-blue-900 font-medium shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Google Storage Saver</span>
                      {preset === 'google_storage_saver' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Max 16 MP (4096px) • WebP 80% • Ideal for phone &amp; camera shots
                    </p>
                  </button>

                  <button
                    onClick={() => handlePresetChange('balanced')}
                    className={`w-full text-left px-3 py-2.5 rounded-lg border text-xs transition-all ${
                      preset === 'balanced'
                        ? 'border-blue-600 bg-blue-50/70 text-blue-900 font-medium shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Original Resolution (Visually Lossless)</span>
                      {preset === 'balanced' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      No downscaling • WebP 85% • Preserves full megapixels
                    </p>
                  </button>

                  <button
                    onClick={() => handlePresetChange('high_compression')}
                    className={`w-full text-left px-3 py-2.5 rounded-lg border text-xs transition-all ${
                      preset === 'high_compression'
                        ? 'border-blue-600 bg-blue-50/70 text-blue-900 font-medium shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Aggressive Economy</span>
                      {preset === 'high_compression' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      2048px • 72% Q • Best for receipts, whiteboards &amp; notes
                    </p>
                  </button>
                </div>
              </div>

              {/* Quality Fine Tuning */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-1.5 text-xs">
                  <span className="text-slate-600 font-medium">Quality Tuning:</span>
                  <span className="font-mono text-slate-900 font-semibold">{Math.round(quality * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="0.95"
                  step="0.05"
                  value={quality}
                  onChange={(e) => {
                    setQuality(parseFloat(e.target.value));
                    setPreset('google_storage_saver');
                  }}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>High Compression (50%)</span>
                  <span>Lossless (95%)</span>
                </div>
              </div>

              {/* Resolution details */}
              <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1 text-slate-600 border border-slate-200/60">
                <div className="flex justify-between">
                  <span>Original:</span>
                  <span className="font-mono text-slate-800">{photo.width} × {photo.height} ({photo.megapixels} MP)</span>
                </div>
                <div className="flex justify-between">
                  <span>Output:</span>
                  <span className="font-mono text-slate-800">
                    {compressedResult ? `${compressedResult.width} × ${compressedResult.height}` : 'Calculating...'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Target Format:</span>
                  <span className="font-mono uppercase text-blue-600">{format.split('/')[1]}</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-5 pt-4 border-t border-slate-200 flex flex-col gap-2">
              <button
                onClick={handleApply}
                disabled={isCompressing || !compressedResult}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>Apply Optimization to this Photo</span>
              </button>

              <button
                onClick={onClose}
                className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
