import React from 'react';
import {
  Sparkles,
  Upload,
  FolderUp,
  Download,
  Info,
  Layers,
  HardDrive,
} from 'lucide-react';
import { StorageStats } from '../types';
import { formatBytes } from '../utils/imageAnalyzer';

interface HeaderProps {
  stats: StorageStats;
  onImportClick: () => void;
  onFolderImportClick: () => void;
  onLoadSamples: () => void;
  onOpenGuide: () => void;
  onBatchExport: () => void;
  selectedCount: number;
  isLoading: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  stats,
  onImportClick,
  onFolderImportClick,
  onLoadSamples,
  onOpenGuide,
  onBatchExport,
  selectedCount,
  isLoading,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Brand / Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-slate-900 tracking-tight">
                Photo Storage &amp; Duplicate Optimizer
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                Storage Saver Engine
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Detect duplicate bursts &amp; optimize high-res photos to reclaim Google account quota
            </p>
          </div>
        </div>

        {/* Stats and Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {stats.totalCount > 0 && (
            <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
              <div className="flex items-center gap-1.5 text-slate-600">
                <HardDrive className="w-3.5 h-3.5 text-blue-500" />
                <span>Total: <strong className="text-slate-900">{formatBytes(stats.totalSizeBytes)}</strong></span>
              </div>
              <div className="w-px h-3.5 bg-slate-200" />
              <div className="text-emerald-700 font-medium">
                Save up to: <strong>{formatBytes(stats.potentialSavingsBytes)}</strong>
              </div>
            </div>
          )}

          <a
            id="btn-cloud-colab"
            href="https://colab.research.google.com/github/jiripech/google-photos-optimizer/blob/main/google_photos_optimizer.ipynb"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-amber-900 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
            title="Run zero-download duplicate cleaner in Google Cloud using Colab"
          >
            <HardDrive className="w-3.5 h-3.5 text-amber-700" />
            <span className="hidden sm:inline">Cloud Colab</span>
            <span className="text-[10px] text-amber-600 font-mono">0 MB DL</span>
          </a>

          <button
            id="btn-google-guide"
            onClick={onOpenGuide}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors"
            title="Google Photos Integration Guide"
          >
            <Info className="w-4 h-4 text-blue-600" />
            <span className="hidden sm:inline">Google Guide</span>
          </button>

          <button
            id="btn-load-demo"
            onClick={onLoadSamples}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Load Demo Set</span>
          </button>

          <div className="flex items-center gap-1">
            <button
              id="btn-import-files"
              onClick={onImportClick}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import Photos</span>
            </button>

            <button
              id="btn-import-folder"
              onClick={onFolderImportClick}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-2.5 py-2 text-xs font-medium text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              title="Import Whole Folder / Takeout Folder"
            >
              <FolderUp className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Folder</span>
            </button>
          </div>

          <button
            id="btn-export-zip"
            onClick={onBatchExport}
            disabled={stats.totalCount === 0 || isLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Zip {selectedCount > 0 ? `(${selectedCount})` : ''}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
