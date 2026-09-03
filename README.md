# Google Photos Optimizer

> A client-side web app and cloud runner that detects near-duplicates, burst shots, and oversized photos in your Google Photos library, recommends the best shots, and helps reclaim cloud storage space.

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/jiripech/google-photos-optimizer/blob/main/google_photos_optimizer.ipynb)

## Two Ways to Run

### 1. Zero-Bandwidth Cloud Runner (Google Colab)

If you do not want to download photos to your local computer:

1. Go to [Google Takeout](https://takeout.google.com), select **Google Photos**, and choose **"Add to Drive"** as the destination. Google transfers the archive directly inside Google's cloud (0 MB local download).
2. Open [`google_photos_optimizer.ipynb`](google_photos_optimizer.ipynb) in [Google Colab](https://colab.research.google.com/).
3. Mount Google Drive and run the notebook. It computes 64-bit difference hashes (`dHash`) and Laplacian focus sharpness to group burst shots and redundant duplicates in Google's cloud.
4. Generates an interactive HTML cleanup report with 1-click links to Google Photos dates/searches to delete burst duplicates directly.

### 2. Client-Side Web Application

Drag-and-drop photos, folders, or Takeout archives locally into this interactive React dashboard to inspect clusters with visual split-sliders and export WebP compressed packages.

## Features

This project was created with the following prompt to Gemini AI:

> _"I'd like to have an app which goes through my Google photos and suggests saving some of them in lower quality to save my storage space. Could it be done?"_

- **Perceptual duplicate detection** — uses dHash (difference hashing) to find near-duplicates and exact copies, not just byte-identical files
- **Burst shot detection** — groups photos taken within 90 seconds that are perceptually similar
- **Smart "best shot" recommendation** — scores each photo by sharpness and resolution to suggest which to keep
- **Quality comparison** — interactive split-slider before/after view with zoom controls
- **Oversized photo detection** — flags photos over 16 MP or 4 MB that can benefit from compression
- **Batch compression to WebP** — configurable quality presets (Google Storage Saver, Balanced, High Compression)
- **ZIP export with savings report** — download optimized photos as a ZIP with a manifest of space saved
- **100% client-side** — no photo data ever leaves your browser; all processing uses the Canvas API
- **Import via drag-and-drop** — supports JPEG, PNG, WebP, AVIF, and HEIC files

## Tech Stack

| Layer           | Technology                       |
| --------------- | -------------------------------- |
| Framework       | React 19                         |
| Language        | TypeScript                       |
| Build Tool.     | Vite                             |
| CSS             | Tailwind CSS v4                  |
| Icons           | Lucide React                     |
| Animations      | Motion (Framer Motion successor) |
| ZIP Creation    | JSZip                            |
| Package Manager | Bun                              |

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (or Node.js with npm)

### Install & Run

```bash
bun install
bun run dev
```

The app starts at [localhost, port 3000](http://localhost:3000).

### Other Commands

| Command           | Description                    |
| ----------------- | ------------------------------ |
| `bun run build`   | Production build               |
| `bun run preview` | Preview production build       |
| `bun run lint`    | Type-check with `tsc --noEmit` |

## Configuration

No configuration is required for local use. The `.env.example` defines optional variables used only within Google AI Studio:

| Variable         | Purpose                                   |
|------------------|-------------------------------------------|
| `GEMINI_API_KEY` | Gemini AI API key (injected by AI Studio) |
| `APP_URL`        | Hosted URL (injected by AI Studio)        |

## How It Works

1. **Import photos** — drag-and-drop, file picker, or load the built-in demo set
2. **Perceptual hashing** — each image is resized to 9x8 pixels, converted to grayscale, and a 64-bit difference hash is computed from adjacent pixel comparisons
3. **Cluster detection** — all pairwise Hamming distances are computed; photos with ≥84% similarity (configurable via sensitivity slider) are grouped into clusters of type "exact", "burst", or "near-duplicate"
4. **Best shot scoring** — within each cluster, photos are scored with the formula `(sharpness × 1.5) + (min(24, megapixels) × 2)` to recommend which to keep
5. **Compression** — selected photos are rendered to canvas, optionally downscaled to a max dimension, and exported as WebP at the chosen quality level
6. **Export** — optimized files are packaged into a ZIP with a `storage-savings-report.txt` manifest

All analysis runs entirely in the browser — nothing is uploaded to any server.

## Project Structure

```text
├── index.html                  # SPA entry point
├── package.json                # Dependencies & scripts
├── vite.config.ts              # Vite + Tailwind + React
├── src/
│   ├── main.tsx                # React root
│   ├── App.tsx                 # State management & layout
│   ├── types.ts                # TypeScript interfaces
│   ├── index.css               # Tailwind import
│   ├── data/
│   │   └── samplePhotos.ts     # 10 synthetic demo photos
│   ├── utils/
│   │   ├── imageAnalyzer.ts    # dHash, sharpness, compression
│   │   └── clusterEngine.ts    # Cluster detection & stats
│   └── components/
│       ├── Header.tsx
│       ├── StorageSummaryCard.tsx
│       ├── DuplicateClustersView.tsx
│       ├── PhotoGridView.tsx
│       ├── QualityComparisonModal.tsx
│       ├── BatchExportModal.tsx
│       ├── GooglePhotosGuideModal.tsx
│       └── ImportModal.tsx
└── public/
    └── assets/
```

## Usage

1. Open the app — demo photos load automatically
2. Click **Import Photos** to add your own (or drag-and-drop onto the grid)
3. Browse the **Duplicates** tab to review detected clusters
4. Adjust the **sensitivity slider** (70–98%) to fine-tune duplicate detection
5. Click **Compare Quality** on any photo to see a before/after split view
6. Use **Select Redundant** or **Select Oversized** to quickly mark photos for removal
7. Click **Export ZIP** to compress selected photos to WebP and download them
8. Follow the **Google Photos Guide** to upload the optimized files and recover storage
