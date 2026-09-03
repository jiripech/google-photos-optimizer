import React from 'react';
import {
  Copy,
  Sparkles,
  CheckCircle2,
  Trash2,
  ArrowLeftRight,
  Sliders,
  Check,
  Eye,
  AlertCircle,
} from 'lucide-react';
import { DuplicateCluster, PhotoItem } from '../types';
import { formatBytes } from '../utils/imageAnalyzer';

interface DuplicateClustersViewProps {
  clusters: DuplicateCluster[];
  similarityThreshold: number;
  onThresholdChange: (newThreshold: number) => void;
  onToggleSelectPhoto: (photoId: string) => void;
  onKeepOnlyBestInCluster: (cluster: DuplicateCluster) => void;
  onOpenCompare: (photo: PhotoItem) => void;
}

export const DuplicateClustersView: React.FC<DuplicateClustersViewProps> = ({
  clusters,
  similarityThreshold,
  onThresholdChange,
  onToggleSelectPhoto,
  onKeepOnlyBestInCluster,
  onOpenCompare,
}) => {
  if (clusters.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center max-w-xl mx-auto shadow-xs my-6">
        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-800">No Duplicates or Bursts Detected</h3>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          All imported photos appear visually distinct at the current {similarityThreshold}% similarity threshold.
        </p>
        <div className="flex items-center justify-center gap-3">
          <span className="text-xs text-slate-600 font-medium">Try lowering sensitivity:</span>
          <input
            type="range"
            min="70"
            max="95"
            value={similarityThreshold}
            onChange={(e) => onThresholdChange(parseInt(e.target.value, 10))}
            className="w-36 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <span className="text-xs font-mono font-semibold text-slate-700">{similarityThreshold}%</span>
        </div>
      </div>
    );
  }

  const totalWastedBytes = clusters.reduce((acc, c) => acc + c.wastedSizeBytes, 0);

  return (
    <div className="space-y-5">
      {/* Cluster Controls & Sensitivity Bar */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900">
              Found {clusters.length} Duplicate &amp; Burst Cluster{clusters.length !== 1 ? 's' : ''}
            </h2>
            <span className="text-xs bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full font-medium">
              {formatBytes(totalWastedBytes)} Redundant Space
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            The sharpest, highest-quality shot in each group is pre-selected as the "Best Shot".
          </p>
        </div>

        {/* Similarity Slider */}
        <div className="flex items-center gap-3 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200/70 shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Sliders className="w-3.5 h-3.5 text-blue-600" />
            <span>Sensitivity:</span>
          </div>
          <input
            type="range"
            min="70"
            max="98"
            step="1"
            value={similarityThreshold}
            onChange={(e) => onThresholdChange(parseInt(e.target.value, 10))}
            className="w-28 sm:w-36 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            title="Adjust similarity threshold"
          />
          <span className="text-xs font-mono font-semibold text-slate-800 w-9">{similarityThreshold}%</span>
        </div>
      </div>

      {/* Cluster Cards List */}
      <div className="space-y-4">
        {clusters.map((cluster, index) => {
          const isExact = cluster.type === 'exact';
          const isBurst = cluster.type === 'burst';

          return (
            <div
              key={cluster.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden"
            >
              {/* Cluster Card Header */}
              <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center">
                    {index + 1}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        isExact
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : isBurst
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      }`}
                    >
                      {isExact
                        ? 'Exact Duplicates (100%)'
                        : isBurst
                        ? `Rapid Burst Shot (${cluster.similarity}% match)`
                        : `Near-Duplicate (${cluster.similarity}% match)`}
                    </span>
                    <span className="text-xs text-slate-500">
                      {cluster.items.length} photos • {formatBytes(cluster.totalSizeBytes)} total
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onKeepOnlyBestInCluster(cluster)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
                  >
                    <Check className="w-3.5 h-3.5 text-blue-600" />
                    <span>Keep Best Shot (Select {cluster.items.length - 1} Redundant)</span>
                  </button>
                </div>
              </div>

              {/* Photos in Cluster Grid */}
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {cluster.items.map((item) => {
                  const isBest = item.id === cluster.recommendedKeepId;

                  return (
                    <div
                      key={item.id}
                      className={`relative rounded-xl border-2 transition-all overflow-hidden flex flex-col ${
                        isBest
                          ? 'border-emerald-500 bg-emerald-50/20 shadow-xs'
                          : item.selectedForAction
                          ? 'border-amber-400 bg-amber-50/30'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {/* Badge in top corner */}
                      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
                        {isBest ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                            <Sparkles className="w-3 h-3" />
                            Best Shot
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-slate-800/85 text-slate-200 text-[10px] font-medium px-2 py-0.5 rounded-md">
                            Redundant Copy
                          </span>
                        )}
                      </div>

                      {/* Selection Checkbox in top right */}
                      <div className="absolute top-2 right-2 z-10">
                        <button
                          onClick={() => onToggleSelectPhoto(item.id)}
                          className={`w-6 h-6 rounded-md flex items-center justify-center transition-all ${
                            item.selectedForAction
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-black/50 hover:bg-black/70 text-white'
                          }`}
                          title={item.selectedForAction ? 'Selected for action' : 'Click to select'}
                        >
                          {item.selectedForAction && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>
                      </div>

                      {/* Image Thumbnail Preview */}
                      <div className="h-44 bg-slate-900 relative group overflow-hidden flex items-center justify-center">
                        <img
                          src={item.thumbnailUrl}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />

                        {/* Hover Overlay with Compare Trigger */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            onClick={() => onOpenCompare(item)}
                            className="p-2 bg-white/90 hover:bg-white text-slate-900 rounded-lg shadow-sm text-xs font-semibold flex items-center gap-1.5"
                          >
                            <ArrowLeftRight className="w-3.5 h-3.5 text-blue-600" />
                            <span>Compare Quality</span>
                          </button>
                        </div>
                      </div>

                      {/* Info & Metrics */}
                      <div className="p-3 bg-white flex-1 flex flex-col justify-between text-xs">
                        <div>
                          <div className="font-semibold text-slate-900 truncate mb-1" title={item.name}>
                            {item.name}
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5">
                            <span>Size: <strong className="text-slate-800">{formatBytes(item.fileSize)}</strong></span>
                            <span>{item.megapixels} MP</span>
                          </div>
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-500">Sharpness:</span>
                            <span
                              className={`font-semibold ${
                                item.sharpnessScore >= 90
                                  ? 'text-emerald-600'
                                  : item.sharpnessScore >= 80
                                  ? 'text-blue-600'
                                  : 'text-amber-600'
                              }`}
                            >
                              {item.sharpnessScore}% focus
                            </span>
                          </div>
                        </div>

                        {/* Status Note */}
                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                          {isBest ? (
                            <span className="text-emerald-700 font-medium flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Recommended to Keep
                            </span>
                          ) : (
                            <span className="text-amber-700 font-medium">
                              Can be safely deleted / compressed
                            </span>
                          )}
                          <button
                            onClick={() => onOpenCompare(item)}
                            className="text-blue-600 hover:text-blue-800 font-medium underline-offset-2 hover:underline"
                          >
                            Inspect
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
