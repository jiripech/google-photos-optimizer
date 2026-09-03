import React from 'react';
import {
  X,
  ExternalLink,
  Info,
  CheckCircle2,
  AlertTriangle,
  HardDrive,
  Copy,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface GooglePhotosGuideModalProps {
  onClose: () => void;
}

export const GooglePhotosGuideModal: React.FC<GooglePhotosGuideModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
              <Info className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Google Photos Storage &amp; Duplicate Guide
              </h3>
              <p className="text-xs text-slate-500">
                Understanding Google’s storage limits, API constraints, and best workflow
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-600 leading-relaxed">
          {/* Why Google's Built-in Tool Isn't Enough */}
          <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/80">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-sm mb-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Why "Recover Storage" in Google Photos Misses Burst &amp; Duplicates</span>
            </div>
            <p className="text-amber-800">
              Google Photos’ built-in "Convert to Storage saver" tool converts original quality files to 16 MP, but it <strong>completely ignores duplicates, near-identical burst shots, and redundant screenshots</strong>. If you took 5 burst shots of the same smile or landscape, Google keeps all 5—wasting 80% of that storage space.
            </p>
          </div>

          {/* Step by Step Workflow */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Recommended 3-Step Clean Up Workflow</span>
            </h4>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-white flex gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                  1
                </span>
                <div>
                  <div className="font-semibold text-slate-900 mb-0.5">Scan Your Photos or Albums in this App</div>
                  <p className="text-slate-500">
                    Drag and drop your photos, albums, or Google Takeout export folder into this app. The app uses perceptual difference hashing to immediately cluster burst shots, exact duplicates, and &gt;16MP heavy files.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-white flex gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                  2
                </span>
                <div>
                  <div className="font-semibold text-slate-900 mb-0.5">Keep the Best Shot &amp; Verify Quality</div>
                  <p className="text-slate-500">
                    Use the <strong>Interactive Split Comparison Slider</strong> to inspect detail at 100% and 200% zoom. The app automatically flags the sharpest focus shot in each burst group.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-white flex gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                  3
                </span>
                <div>
                  <div className="font-semibold text-slate-900 mb-0.5">Export Optimized Files &amp; Reclaim Google Quota</div>
                  <p className="text-slate-500">
                    Download the optimized WebP/JPEG package and review the included savings report. In Google Photos, delete redundant duplicate burst shots and empty your Trash to permanently free up gigabytes of account quota.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Direct Google Photos Links */}
          <div className="pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Official Google Storage Tools
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <a
                href="https://photos.google.com/quotamanagement"
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <span>Google Storage Management</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </div>
                  <p className="text-[11px] text-slate-500">Review large files and blurry photos</p>
                </div>
              </a>

              <a
                href="https://photos.google.com/settings"
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <span>Google Photos Settings</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </div>
                  <p className="text-[11px] text-slate-500">"Recover storage" one-click button</p>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-medium text-xs rounded-xl transition-colors"
          >
            Got it, thanks
          </button>
        </div>
      </div>
    </div>
  );
};
