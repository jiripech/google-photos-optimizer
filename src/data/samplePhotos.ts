import { PhotoItem } from '../types';
import { calculateDHashFromCanvas } from '../utils/imageAnalyzer';

// Helper to generate a photo-like SVG data URL with canvas rendering
function createPhotoDataUrl(
  title: string,
  subtitle: string,
  gradientStart: string,
  gradientEnd: string,
  accentColor: string,
  pattern: 'landscape' | 'portrait' | 'document' | 'burst1' | 'burst2' | 'burst3',
  width: number,
  height: number
): string {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 800 600">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${gradientStart}" />
        <stop offset="100%" stop-color="${gradientEnd}" />
      </linearGradient>
      <linearGradient id="sun" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#FFF7ED" />
        <stop offset="100%" stop-color="#F97316" />
      </linearGradient>
      <filter id="shadow">
        <feDropShadow dx="0" dy="4" stdDeviation="6" flood-opacity="0.25" />
      </filter>
    </defs>
    
    <!-- Background Scene -->
    <rect width="800" height="600" fill="url(#bg)" />

    ${
      pattern === 'landscape' || pattern.startsWith('burst')
        ? `
      <!-- Sun/Sky Element -->
      <circle cx="${pattern === 'burst1' ? 410 : pattern === 'burst2' ? 420 : 400}" cy="240" r="90" fill="url(#sun)" opacity="0.9" />
      
      <!-- Mountain Layer 1 -->
      <path d="M-50 600 L250 280 L480 600 Z" fill="${accentColor}" opacity="0.75" />
      <!-- Mountain Layer 2 -->
      <path d="M180 600 L440 230 L720 600 Z" fill="${accentColor}" opacity="0.88" />
      <!-- Mountain Layer 3 -->
      <path d="M420 600 L680 310 L900 600 Z" fill="${accentColor}" opacity="0.7" />

      <!-- Water or Foreground Reflection -->
      <rect y="460" width="800" height="140" fill="#0F172A" opacity="0.35" />
      <ellipse cx="400" cy="510" rx="140" ry="8" fill="#FEF08A" opacity="0.45" />
      `
        : pattern === 'portrait'
        ? `
      <!-- Portrait Silhouette Scene -->
      <circle cx="400" cy="220" r="85" fill="${accentColor}" opacity="0.85" />
      <path d="M260 520 C260 370, 540 370, 540 520 Z" fill="${accentColor}" opacity="0.9" />
      <circle cx="400" cy="220" r="60" fill="#FFE4E6" opacity="0.95" />
      <ellipse cx="375" cy="210" rx="6" ry="8" fill="#1E293B" />
      <ellipse cx="425" cy="210" rx="6" ry="8" fill="#1E293B" />
      <path d="M375 250 Q400 270 425 250" stroke="#E11D48" stroke-width="4" fill="none" stroke-linecap="round" />
      `
        : `
      <!-- Document / Receipt Clutter Scene -->
      <rect x="180" y="80" width="440" height="460" rx="8" fill="#FFFFFF" filter="url(#shadow)" />
      <rect x="220" y="130" width="240" height="20" rx="4" fill="#334155" />
      <rect x="220" y="170" width="360" height="8" rx="2" fill="#94A3B8" />
      <rect x="220" y="190" width="320" height="8" rx="2" fill="#CBD5E1" />
      <rect x="220" y="210" width="340" height="8" rx="2" fill="#E2E8F0" />
      <line x1="220" y1="245" x2="580" y2="245" stroke="#E2E8F0" stroke-width="2" stroke-dasharray="6,6" />
      <rect x="220" y="270" width="180" height="12" rx="2" fill="#64748B" />
      <rect x="490" y="270" width="90" height="12" rx="2" fill="#0F172A" />
      <rect x="220" y="300" width="200" height="12" rx="2" fill="#64748B" />
      <rect x="490" y="300" width="90" height="12" rx="2" fill="#0F172A" />
      <rect x="220" y="340" width="360" height="16" rx="3" fill="#F1F5F9" />
      <rect x="440" y="380" width="140" height="24" rx="4" fill="#0284C7" />
      `
    }

    <!-- Photo Overlay Badge -->
    <g transform="translate(30, 40)">
      <rect width="320" height="74" rx="10" fill="#0F172A" fill-opacity="0.82" />
      <text x="18" y="30" font-family="system-ui, -apple-system, sans-serif" font-size="17" font-weight="700" fill="#FFFFFF">${title}</text>
      <text x="18" y="54" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="500" fill="#94A3B8">${subtitle}</text>
    </g>
  </svg>
  `.trim();

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export async function createSamplePhotos(): Promise<PhotoItem[]> {
  const baseTime = Date.now() - 1000 * 60 * 60 * 24 * 7; // 7 days ago

  const rawSamples = [
    {
      id: 'photo-burst-1',
      name: 'IMG_8492_BURST_01.JPG',
      title: 'Golden Sunset Coast #1',
      subtitle: 'Sharpest focus • Crisp edges • 24 MP',
      gradientStart: '#1E1B4B',
      gradientEnd: '#BE185D',
      accentColor: '#431407',
      pattern: 'burst1' as const,
      fileSize: 9840210, // ~9.4 MB
      width: 6000,
      height: 4000,
      megapixels: 24.0,
      timestamp: baseTime,
      sharpnessScore: 94,
    },
    {
      id: 'photo-burst-2',
      name: 'IMG_8493_BURST_02.JPG',
      title: 'Golden Sunset Coast #2',
      subtitle: 'Slightly softer focus • Burst clone',
      gradientStart: '#1E1B4B',
      gradientEnd: '#BE185D',
      accentColor: '#431407',
      pattern: 'burst2' as const,
      fileSize: 9650110, // ~9.2 MB
      width: 6000,
      height: 4000,
      megapixels: 24.0,
      timestamp: baseTime + 1200, // 1.2 seconds later
      sharpnessScore: 78,
    },
    {
      id: 'photo-burst-3',
      name: 'IMG_8494_BURST_03.JPG',
      title: 'Golden Sunset Coast #3',
      subtitle: 'Motion micro-shake • Redundant shot',
      gradientStart: '#1E1B4B',
      gradientEnd: '#BE185D',
      accentColor: '#431407',
      pattern: 'burst3' as const,
      fileSize: 9420000, // ~9.0 MB
      width: 6000,
      height: 4000,
      megapixels: 24.0,
      timestamp: baseTime + 2500, // 2.5s later
      sharpnessScore: 68,
    },
    {
      id: 'photo-exact-dup-1',
      name: 'DSC_0921_Alps_Morning.JPG',
      title: 'Alpine Peak Sunrise',
      subtitle: 'Original high-res copy • 32 MP',
      gradientStart: '#0C4A6E',
      gradientEnd: '#0284C7',
      accentColor: '#0F172A',
      pattern: 'landscape' as const,
      fileSize: 14200000, // ~13.5 MB
      width: 6960,
      height: 4640,
      megapixels: 32.3,
      timestamp: baseTime - 1000 * 60 * 60 * 36,
      sharpnessScore: 91,
    },
    {
      id: 'photo-exact-dup-2',
      name: 'DSC_0921_Alps_Morning(1).JPG',
      title: 'Alpine Peak Sunrise (Copy)',
      subtitle: 'Exact redundant copy in WhatsApp backup',
      gradientStart: '#0C4A6E',
      gradientEnd: '#0284C7',
      accentColor: '#0F172A',
      pattern: 'landscape' as const,
      fileSize: 14200000, // Identical 13.5 MB
      width: 6960,
      height: 4640,
      megapixels: 32.3,
      timestamp: baseTime - 1000 * 60 * 60 * 36,
      sharpnessScore: 91,
    },
    {
      id: 'photo-portrait-1',
      name: 'IMG_7701_Family_Park.JPG',
      title: 'Weekend Portrait (Smile A)',
      subtitle: 'Great lighting & focus • 18 MP',
      gradientStart: '#312E81',
      gradientEnd: '#4F46E5',
      accentColor: '#1E1B4B',
      pattern: 'portrait' as const,
      fileSize: 8400000, // 8.0 MB
      width: 5184,
      height: 3456,
      megapixels: 17.9,
      timestamp: baseTime - 1000 * 60 * 60 * 72,
      sharpnessScore: 89,
    },
    {
      id: 'photo-portrait-2',
      name: 'IMG_7702_Family_Park.JPG',
      title: 'Weekend Portrait (Smile B)',
      subtitle: 'Near-duplicate second pose',
      gradientStart: '#312E81',
      gradientEnd: '#4F46E5',
      accentColor: '#1E1B4B',
      pattern: 'portrait' as const,
      fileSize: 8100000, // 7.7 MB
      width: 5184,
      height: 3456,
      megapixels: 17.9,
      timestamp: baseTime - 1000 * 60 * 60 * 72 + 4000,
      sharpnessScore: 82,
    },
    {
      id: 'photo-doc-1',
      name: 'PXL_20260814_ReceiptNotes.JPG',
      title: 'Appliance Receipt & Warranty',
      subtitle: 'Uncompressed document photo • 4.8 MB',
      gradientStart: '#334155',
      gradientEnd: '#64748B',
      accentColor: '#0F172A',
      pattern: 'document' as const,
      fileSize: 5033164, // 4.8 MB
      width: 4032,
      height: 3024,
      megapixels: 12.2,
      timestamp: baseTime - 1000 * 60 * 60 * 120,
      sharpnessScore: 85,
    },
    {
      id: 'photo-doc-2',
      name: 'PXL_20260814_ReceiptNotes_dup.JPG',
      title: 'Appliance Receipt & Warranty (Backup)',
      subtitle: 'Near-duplicate photo of receipt',
      gradientStart: '#334155',
      gradientEnd: '#64748B',
      accentColor: '#0F172A',
      pattern: 'document' as const,
      fileSize: 4980000, // 4.7 MB
      width: 4032,
      height: 3024,
      megapixels: 12.2,
      timestamp: baseTime - 1000 * 60 * 60 * 120 + 3000,
      sharpnessScore: 83,
    },
    {
      id: 'photo-heavy-panorama',
      name: 'PANORAMA_20260719_Highlands.JPG',
      title: 'Scottish Highlands Panorama',
      subtitle: 'Gigantic raw panorama • 48 MP • 22 MB',
      gradientStart: '#064E3B',
      gradientEnd: '#059669',
      accentColor: '#022C22',
      pattern: 'landscape' as const,
      fileSize: 23068672, // 22 MB!
      width: 12000,
      height: 4000,
      megapixels: 48.0,
      timestamp: baseTime - 1000 * 60 * 60 * 240,
      sharpnessScore: 92,
    },
  ];

  const results: PhotoItem[] = [];

  for (const raw of rawSamples) {
    const dataUrl = createPhotoDataUrl(
      raw.title,
      raw.subtitle,
      raw.gradientStart,
      raw.gradientEnd,
      raw.accentColor,
      raw.pattern,
      800,
      600
    );

    // Compute synthetic dHash by loading into an image or calculating
    const img = new Image();
    img.src = dataUrl;
    await new Promise<void>((res) => {
      img.onload = () => res();
    });

    const { dHash, avgBrightness } = calculateDHashFromCanvas(img);

    results.push({
      id: raw.id,
      name: raw.name,
      fileSize: raw.fileSize,
      width: raw.width,
      height: raw.height,
      megapixels: raw.megapixels,
      mimeType: 'image/jpeg',
      dataUrl: dataUrl,
      thumbnailUrl: dataUrl,
      dHash,
      averageBrightness: avgBrightness,
      timestamp: raw.timestamp,
      sharpnessScore: raw.sharpnessScore,
      category: 'optimized',
    });
  }

  return results;
}
