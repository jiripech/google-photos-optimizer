import React from 'react';
import {
  HardDrive,
  Copy,
  Maximize2,
  TrendingDown,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { StorageStats } from '../types';
import { formatBytes } from '../utils/imageAnalyzer';

interface StorageSummaryCardProps {
  stats: StorageStats;
  onSelectRedundantDuplicates: () => void;
  onSelectOversized: () => void;
  onSelectAll: () => void;
  selectedCount: number;
}

export const StorageSummaryCard: React.FC<StorageSummaryCardProps> = ({
  stats,
  onSelectRedundantDuplicates,
  onSelectOversized,
  onSelectAll,
  selectedCount,
}) => {
  if (stats.totalCount === 0) return null;

  const originalSize = stats.totalSizeBytes;
  const optimizedSize = Math.max(0, originalSize - stats.potentialSavingsBytes);
  const savingsPercent = originalSize > 0 ? Math.round((stats.potentialSavingsBytes / originalSize) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        {/* Storage Bar & Main Reclaimable Figure */}
        <div className="flex-1 min-w-[280px]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-md bg-blue-50 text-blue-600">
                <HardDrive className="w-4 h-4" />
              </span>
              <span className="text-sm font-semibold text-slate-800">Storage Optimization Potential</span>
            </div>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Save ~{savingsPercent}% Space
            </span>
          </div>

          {/* Visual Bar */}
          <div className="space-y-1.5">
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
              <div
                className="bg-emerald-500 h-full transition-all duration-500"
                style={{ width: `${Math.max(8, 100 - savingsPercent)}%` }}
                title={`Optimized Size: ${formatBytes(optimizedSize)}`}
              />
              <div
                className="bg-amber-400/80 h-full transition-all duration-500"
                style={{ width: `${Math.min(92, savingsPercent)}%` }}
                title={`Reclaimable Savings: ${formatBytes(stats.potentialSavingsBytes)}`}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-500">
              <span>Optimized: <strong className="text-slate-800">{formatBytes(optimizedSize)}</strong></span>
              <span className="text-emerald-700 font-medium">Reclaimable: <strong>{formatBytes(stats.potentialSavingsBytes)}</strong></span>
              <span>Current: <strong className="text-slate-800">{formatBytes(originalSize)}</strong></span>
            </div>
          </div>
        </div>

        {/* 3 Metric Badges */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4 shrink-0">
          <div className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
              <Copy className="w-3.5 h-3.5 text-amber-500" />
              <span>Duplicate Waste</span>
            </div>
            <div className="text-base font-bold text-slate-900">
              {formatBytes(stats.duplicateWastedBytes)}
            </div>
            <div className="text-[11px] text-slate-500">
              {stats.duplicateClusterCount} cluster{stats.duplicateClusterCount !== 1 ? 's' : ''}
            </div>
          </div>

          <div className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
              <Maximize2 className="w-3.5 h-3.5 text-indigo-500" />
              <span>Oversized &gt;16MP</span>
            </div>
            <div className="text-base font-bold text-slate-900">
              {stats.oversizedCount} <span className="text-xs font-normal text-slate-500">photos</span>
            </div>
            <div className="text-[11px] text-slate-500">
              Heavy camera files
            </div>
          </div>

          <div className="px-3.5 py-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/70">
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 mb-1">
              <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
              <span>Total Reclaimable</span>
            </div>
            <div className="text-base font-bold text-emerald-800">
              {formatBytes(stats.potentialSavingsBytes)}
            </div>
            <div className="text-[11px] text-emerald-700">
              {savingsPercent}% quota saved
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-600">
          <Zap className="w-3.5 h-3.5 text-blue-600" />
          <span className="font-medium">Quick Selection:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-select-redundant"
            onClick={onSelectRedundantDuplicates}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 transition-colors font-medium"
          >
            <Copy className="w-3 h-3 text-amber-600" />
            <span>Select Redundant Duplicates (Keep Best)</span>
          </button>

          <button
            id="btn-select-oversized"
            onClick={onSelectOversized}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-800 hover:bg-indigo-100 transition-colors font-medium"
          >
            <Maximize2 className="w-3 h-3 text-indigo-600" />
            <span>Select Oversized &gt;16MP</span>
          </button>

          <button
            id="btn-select-all"
            onClick={onSelectAll}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors font-medium"
          >
            <CheckCircle2 className="w-3 h-3" />
            <span>{selectedCount === stats.totalCount ? 'Deselect All' : 'Select All'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
