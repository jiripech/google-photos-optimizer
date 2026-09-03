import React, { useRef, useState } from 'react';
import {
  X,
  Upload,
  FolderUp,
  Sparkles,
  Image,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { PhotoItem } from '../types';
import { calculateDHashFromCanvas } from '../utils/imageAnalyzer';

interface ImportModalProps {
  onClose: () => void;
  onAddPhotos: (newPhotos: PhotoItem[]) => void;
  onLoadSamples: () => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  onClose,
  onAddPhotos,
  onLoadSamples,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const processFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList).filter((f) => f.type.startsWith('image/'));
    if (files.length === 0) return;

    setIsProcessing(true);
    const newItems: PhotoItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setStatusText(`Analyzing photo ${i + 1} of ${files.length}: ${file.name}`);

      try {
        const dataUrl = await readFileAsDataURL(file);
        const img = await loadImage(dataUrl);

        const width = img.naturalWidth || 1920;
        const height = img.naturalHeight || 1080;
        const megapixels = parseFloat(((width * height) / 1000000).toFixed(1));

        const { dHash, avgBrightness, sharpness } = calculateDHashFromCanvas(img);

        newItems.push({
          id: `imported-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 5)}`,
          name: file.name,
          fileSize: file.size,
          width,
          height,
          megapixels,
          mimeType: file.type || 'image/jpeg',
          dataUrl,
          thumbnailUrl: dataUrl,
          dHash,
          averageBrightness: avgBrightness,
          timestamp: file.lastModified || Date.now(),
          sharpnessScore: sharpness,
          category: megapixels > 16 || file.size > 4 * 1024 * 1024 ? 'oversized' : 'optimized',
        });
      } catch (err) {
        console.error('Failed to process file:', file.name, err);
      }
    }

    setIsProcessing(false);
    onAddPhotos(newItems);
    onClose();
  };

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          disabled={isProcessing}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Import Photos for Duplicate Scan</h3>
            <p className="text-xs text-slate-500">
              Drag &amp; drop photos, select folders, or load the demo test library
            </p>
          </div>
        </div>

        {/* Drag & Drop Area */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors cursor-pointer ${
            isDragging
              ? 'border-blue-500 bg-blue-50/50'
              : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files && processFiles(e.target.files)}
            multiple
            accept="image/*"
            className="hidden"
          />
          <input
            type="file"
            ref={folderInputRef}
            onChange={(e) => e.target.files && processFiles(e.target.files)}
            // @ts-ignore
            webkitdirectory="true"
            directory="true"
            className="hidden"
          />

          <div className="w-12 h-12 bg-white rounded-xl shadow-xs border border-slate-200 flex items-center justify-center mx-auto mb-3 text-slate-500">
            <Image className="w-6 h-6 text-blue-500" />
          </div>

          <p className="text-xs font-semibold text-slate-800 mb-1">
            Click to browse photos, or drag &amp; drop here
          </p>
          <p className="text-[11px] text-slate-500">
            Supports JPEG, PNG, WebP, AVIF, HEIC camera images
          </p>

          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                folderInputRef.current?.click();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg shadow-2xs"
            >
              <FolderUp className="w-3.5 h-3.5" />
              <span>Select Entire Folder</span>
            </button>
          </div>
        </div>

        {isProcessing && (
          <div className="mt-4 p-3 rounded-xl bg-blue-50 text-blue-800 text-xs flex items-center gap-2 border border-blue-200">
            <Sparkles className="w-4 h-4 animate-spin text-blue-600 shrink-0" />
            <span className="truncate">{statusText}</span>
          </div>
        )}

        {/* Demo Set Shortcut */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-800">Don't have photos ready?</div>
            <div className="text-[11px] text-slate-500">Test with pre-configured burst and duplicate sets</div>
          </div>

          <button
            type="button"
            onClick={() => {
              onLoadSamples();
              onClose();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Load Demo Set</span>
          </button>
        </div>
      </div>
    </div>
  );
};
