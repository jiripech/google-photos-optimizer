import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Layers,
  Copy,
  LayoutGrid,
  Maximize2,
  Sparkles,
  RefreshCw,
  FolderUp,
  Upload,
  Info,
  CheckCircle2,
  HardDrive,
  Trash2,
  Download,
} from 'lucide-react';
import { PhotoItem, DuplicateCluster, StorageStats } from './types';
import { detectClusters, computeStorageStats } from './utils/clusterEngine';
import { createSamplePhotos } from './data/samplePhotos';
import { Header } from './components/Header';
import { StorageSummaryCard } from './components/StorageSummaryCard';
import { DuplicateClustersView } from './components/DuplicateClustersView';
import { PhotoGridView } from './components/PhotoGridView';
import { QualityComparisonModal } from './components/QualityComparisonModal';
import { BatchExportModal } from './components/BatchExportModal';
import { GooglePhotosGuideModal } from './components/GooglePhotosGuideModal';
import { ImportModal } from './components/ImportModal';
import { formatBytes } from './utils/imageAnalyzer';

export default function App() {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [similarityThreshold, setSimilarityThreshold] = useState<number>(84);
  const [activeTab, setActiveTab] = useState<'duplicates' | 'all' | 'oversized'>('duplicates');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals state
  const [comparingPhoto, setComparingPhoto] = useState<PhotoItem | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState<boolean>(false);
  const [isBatchExportModalOpen, setIsBatchExportModalOpen] = useState<boolean>(false);

  // Load initial demo photos on startup so the app is instantly rich & interactive
  const loadDemoPhotos = useCallback(() => {
    setIsLoading(true);
    try {
      const demo = createSamplePhotos();
      setPhotos(demo);
    } catch (err) {
      console.error('Failed to load demo photos:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDemoPhotos();
  }, [loadDemoPhotos]);

  // Compute clusters whenever photos or similarity threshold changes
  const { clusters, updatedPhotos } = useMemo(() => {
    if (photos.length === 0) {
      return { clusters: [], updatedPhotos: [] };
    }
    return detectClusters(photos, similarityThreshold);
  }, [photos, similarityThreshold]);

  // Compute storage statistics
  const stats: StorageStats = useMemo(() => {
    return computeStorageStats(photos, clusters);
  }, [photos, clusters]);

  // Toggle selection on a photo
  const handleToggleSelect = (photoId: string) => {
    setPhotos((prev) =>
      prev.map((p) =>
        p.id === photoId ? { ...p, selectedForAction: !p.selectedForAction } : p
      )
    );
  };

  // Quick Action: Select all redundant duplicates (keep the best in each cluster)
  const handleSelectRedundantDuplicates = () => {
    const redundantIds = new Set<string>();
    clusters.forEach((c) => {
      c.items.forEach((item) => {
        if (item.id !== c.recommendedKeepId) {
          redundantIds.add(item.id);
        }
      });
    });

    setPhotos((prev) =>
      prev.map((p) => ({
        ...p,
        selectedForAction: redundantIds.has(p.id),
      }))
    );
    setActiveTab('duplicates');
  };

  // Quick Action: Select all oversized >16MP photos
  const handleSelectOversized = () => {
    setPhotos((prev) =>
      prev.map((p) => ({
        ...p,
        selectedForAction: p.megapixels > 16 || p.fileSize > 4 * 1024 * 1024,
      }))
    );
    setActiveTab('all');
  };

  // Quick Action: Select / Deselect All
  const handleSelectAll = () => {
    const allSelected = photos.every((p) => p.selectedForAction);
    setPhotos((prev) =>
      prev.map((p) => ({
        ...p,
        selectedForAction: !allSelected,
      }))
    );
  };

  // Keep only best shot in a specific cluster (marks redundant copies for action)
  const handleKeepOnlyBestInCluster = (cluster: DuplicateCluster) => {
    setPhotos((prev) =>
      prev.map((p) => {
        const inCluster = cluster.items.some((item) => item.id === p.id);
        if (!inCluster) return p;
        return {
          ...p,
          selectedForAction: p.id !== cluster.recommendedKeepId,
        };
      })
    );
  };

  // Delete / Remove photo from scanning list
  const handleDeletePhoto = (photoId: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
  };

  // Add imported photos
  const handleAddPhotos = (newPhotos: PhotoItem[]) => {
    setPhotos((prev) => [...newPhotos, ...prev]);
  };

  // Apply single photo compression update
  const handleApplyCompression = (
    photoId: string,
    compressedDataUrl: string,
    sizeBytes: number,
    width: number,
    height: number
  ) => {
    setPhotos((prev) =>
      prev.map((p) =>
        p.id === photoId
          ? {
              ...p,
              compressedDataUrl,
              compressedSize: sizeBytes,
              compressedWidth: width,
              compressedHeight: height,
            }
          : p
      )
    );
  };

  // Batch compression completed
  const handleBatchCompleted = (updated: PhotoItem[]) => {
    setPhotos(updated);
  };

  const selectedCount = photos.filter((p) => p.selectedForAction).length;

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      {/* Navigation Header */}
      <Header
        stats={stats}
        onImportClick={() => setIsImportModalOpen(true)}
        onFolderImportClick={() => setIsImportModalOpen(true)}
        onLoadSamples={loadDemoPhotos}
        onOpenGuide={() => setIsGuideModalOpen(true)}
        onBatchExport={() => setIsBatchExportModalOpen(true)}
        selectedCount={selectedCount}
        isLoading={isLoading}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Loading Indicator */}
        {isLoading && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center shadow-xs">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-800">Analyzing Photo Library...</p>
            <p className="text-xs text-slate-500">Computing difference hashes, resolution, and sharpness focus scores</p>
          </div>
        )}

        {/* Storage Summary & Quota Reclaim Card */}
        {!isLoading && (
          <StorageSummaryCard
            stats={stats}
            onSelectRedundantDuplicates={handleSelectRedundantDuplicates}
            onSelectOversized={handleSelectOversized}
            onSelectAll={handleSelectAll}
            selectedCount={selectedCount}
          />
        )}

        {/* View Switcher Tabs */}
        {!isLoading && photos.length > 0 && (
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <button
                id="tab-duplicates"
                onClick={() => setActiveTab('duplicates')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'duplicates'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Duplicate &amp; Burst Inspector ({clusters.length})</span>
              </button>

              <button
                id="tab-all-photos"
                onClick={() => setActiveTab('all')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'all'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>All Photos &amp; Compression Explorer ({photos.length})</span>
              </button>
            </div>

            {selectedCount > 0 && (
              <div className="hidden sm:flex items-center gap-2 text-xs">
                <span className="font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                  {selectedCount} photos selected
                </span>
                <button
                  onClick={() => setIsBatchExportModalOpen(true)}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
                >
                  <Download className="w-3 h-3" />
                  <span>Export Optimized</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Active Tab View */}
        {!isLoading && (
          <>
            {activeTab === 'duplicates' && (
              <DuplicateClustersView
                clusters={clusters}
                similarityThreshold={similarityThreshold}
                onThresholdChange={setSimilarityThreshold}
                onToggleSelectPhoto={handleToggleSelect}
                onKeepOnlyBestInCluster={handleKeepOnlyBestInCluster}
                onOpenCompare={(photo) => setComparingPhoto(photo)}
              />
            )}

            {activeTab === 'all' && (
              <PhotoGridView
                photos={photos}
                onToggleSelect={handleToggleSelect}
                onOpenCompare={(photo) => setComparingPhoto(photo)}
                onDeletePhoto={handleDeletePhoto}
              />
            )}
          </>
        )}

        {/* Empty State */}
        {!isLoading && photos.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-xs my-8">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Upload className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No Photos Loaded</h3>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              Import photos from your device, Google Takeout, or test immediately with our pre-loaded burst &amp; duplicate set.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" />
                <span>Import Photos</span>
              </button>
              <button
                onClick={loadDemoPhotos}
                className="w-full sm:w-auto px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Load Demo Set</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Photo Storage &amp; Duplicate Optimizer • Client-Side Perceptual Hashing &amp; WebP Engine</span>
          <button
            onClick={() => setIsGuideModalOpen(true)}
            className="text-blue-600 hover:underline inline-flex items-center gap-1 font-medium"
          >
            <Info className="w-3.5 h-3.5" />
            <span>Google Photos Integration &amp; Quota Guide</span>
          </button>
        </div>
      </footer>

      {/* Split Quality Comparison Modal */}
      {comparingPhoto && (
        <QualityComparisonModal
          photo={comparingPhoto}
          onClose={() => setComparingPhoto(null)}
          onApplyCompression={handleApplyCompression}
        />
      )}

      {/* Batch Export & Compression Modal */}
      {isBatchExportModalOpen && (
        <BatchExportModal
          photos={photos}
          onClose={() => setIsBatchExportModalOpen(false)}
          onCompleted={handleBatchCompleted}
        />
      )}

      {/* Google Photos Guide Modal */}
      {isGuideModalOpen && (
        <GooglePhotosGuideModal onClose={() => setIsGuideModalOpen(false)} />
      )}

      {/* Import Modal */}
      {isImportModalOpen && (
        <ImportModal
          onClose={() => setIsImportModalOpen(false)}
          onAddPhotos={handleAddPhotos}
          onLoadSamples={loadDemoPhotos}
        />
      )}
    </div>
  );
}
