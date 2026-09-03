import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowDownUp,
  Maximize2,
  CheckCircle2,
  Copy,
  Sparkles,
  ArrowLeftRight,
  Download,
  Trash2,
} from 'lucide-react';
import { PhotoItem } from '../types';
import { formatBytes } from '../utils/imageAnalyzer';

interface PhotoGridViewProps {
  photos: PhotoItem[];
  onToggleSelect: (photoId: string) => void;
  onOpenCompare: (photo: PhotoItem) => void;
  onDeletePhoto: (photoId: string) => void;
}

export const PhotoGridView: React.FC<PhotoGridViewProps> = ({
  photos,
  onToggleSelect,
  onOpenCompare,
  onDeletePhoto,
}) => {
  const [filterTab, setFilterTab] = useState<'all' | 'duplicates' | 'oversized' | 'selected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'size' | 'megapixels' | 'sharpness' | 'name'>('size');

  const filteredPhotos = useMemo(() => {
    return photos.filter((photo) => {
      // Search
      if (searchQuery.trim() !== '' && !photo.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Tab filter
      if (filterTab === 'duplicates') {
        return photo.clusterId !== undefined;
      }
      if (filterTab === 'oversized') {
        return photo.megapixels > 16 || photo.fileSize > 4 * 1024 * 1024;
      }
      if (filterTab === 'selected') {
        return photo.selectedForAction === true;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'size') return b.fileSize - a.fileSize;
      if (sortBy === 'megapixels') return b.megapixels - a.megapixels;
      if (sortBy === 'sharpness') return b.sharpnessScore - a.sharpnessScore;
      return a.name.localeCompare(b.name);
    });
  }, [photos, filterTab, searchQuery, sortBy]);

  const duplicateCount = photos.filter((p) => p.clusterId !== undefined).length;
  const oversizedCount = photos.filter((p) => p.megapixels > 16 || p.fileSize > 4 * 1024 * 1024).length;
  const selectedCount = photos.filter((p) => p.selectedForAction).length;

  return (
    <div className="space-y-4">
      {/* Search, Filter Tabs & Sort Controls */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterTab === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Photos ({photos.length})
          </button>

          <button
            onClick={() => setFilterTab('duplicates')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
              filterTab === 'duplicates'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            <Copy className="w-3 h-3" />
            <span>Duplicates &amp; Bursts ({duplicateCount})</span>
          </button>

          <button
            onClick={() => setFilterTab('oversized')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
              filterTab === 'oversized'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-indigo-50 text-indigo-800 border border-indigo-200 hover:bg-indigo-100'
            }`}
          >
            <Maximize2 className="w-3 h-3" />
            <span>Oversized &gt;16MP ({oversizedCount})</span>
          </button>

          <button
            onClick={() => setFilterTab('selected')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
              filterTab === 'selected'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            <span>Selected ({selectedCount})</span>
          </button>
        </div>

        {/* Search & Sort */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by file name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs bg-slate-50 px-2.5 py-1.5 border border-slate-200 rounded-lg shrink-0">
            <ArrowDownUp className="w-3 h-3 text-slate-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent border-none text-xs text-slate-700 font-medium focus:outline-hidden cursor-pointer"
            >
              <option value="size">Largest Size</option>
              <option value="megapixels">Megapixels</option>
              <option value="sharpness">Sharpness</option>
              <option value="name">File Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Photos */}
      {filteredPhotos.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
          No photos match the selected filter.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
          {filteredPhotos.map((photo) => {
            const isOversized = photo.megapixels > 16 || photo.fileSize > 4 * 1024 * 1024;
            const isDuplicate = photo.clusterId !== undefined;
            const isBest = photo.isBestInCluster;

            return (
              <div
                key={photo.id}
                className={`bg-white rounded-xl border transition-all overflow-hidden flex flex-col group relative ${
                  photo.selectedForAction
                    ? 'border-blue-500 ring-2 ring-blue-500/30'
                    : 'border-slate-200 hover:border-slate-300 shadow-xs'
                }`}
              >
                {/* Overlay Badges */}
                <div className="absolute top-2 left-2 z-10 flex flex-col gap-1 pointer-events-none">
                  {isDuplicate && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-xs ${
                        isBest
                          ? 'bg-emerald-600 text-white'
                          : 'bg-amber-600 text-white'
                      }`}
                    >
                      {isBest ? 'Best Shot' : 'Duplicate'}
                    </span>
                  )}
                  {isOversized && !isDuplicate && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-600 text-white shadow-xs">
                      {photo.megapixels} MP
                    </span>
                  )}
                </div>

                {/* Checkbox Trigger */}
                <button
                  onClick={() => onToggleSelect(photo.id)}
                  className={`absolute top-2 right-2 z-10 w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                    photo.selectedForAction
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-black/40 hover:bg-black/70 text-white'
                  }`}
                  title="Select for batch action"
                >
                  {photo.selectedForAction && <CheckCircle2 className="w-3.5 h-3.5" />}
                </button>

                {/* Thumbnail Image */}
                <div className="h-32 bg-slate-900 relative overflow-hidden flex items-center justify-center">
                  <img
                    src={photo.thumbnailUrl}
                    alt={photo.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Hover action to compare */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                    <button
                      onClick={() => onOpenCompare(photo)}
                      className="px-2.5 py-1.5 bg-white text-slate-900 rounded-lg shadow-xs text-xs font-semibold flex items-center gap-1"
                    >
                      <ArrowLeftRight className="w-3 h-3 text-blue-600" />
                      <span>Compare</span>
                    </button>
                  </div>
                </div>

                {/* Card Meta */}
                <div className="p-2.5 flex-1 flex flex-col justify-between text-xs">
                  <div>
                    <div className="font-semibold text-slate-800 truncate mb-1" title={photo.name}>
                      {photo.name}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                      <span className="font-medium text-slate-700">{formatBytes(photo.fileSize)}</span>
                      <span>{photo.megapixels} MP</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>Sharpness: {photo.sharpnessScore}%</span>
                      {photo.compressedSize ? (
                        <span className="text-emerald-600 font-semibold">
                          Optimized: {formatBytes(photo.compressedSize)}
                        </span>
                      ) : (
                        <span className="text-slate-400">Uncompressed</span>
                      )}
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <button
                      onClick={() => onOpenCompare(photo)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Inspect
                    </button>

                    <button
                      onClick={() => onDeletePhoto(photo.id)}
                      className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                      title="Remove from scanning list"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
