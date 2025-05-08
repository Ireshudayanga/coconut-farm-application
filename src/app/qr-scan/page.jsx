'use client';

import { useRouter } from 'next/navigation';
import QRScanner from '@/components/QRScanner';

export default function QRScanPage() {
  const router = useRouter();

  const handleScan = (data) => {
    if (data) {
      console.log('Scanned:', data);
  
      // Delay navigation to avoid hydration/layout crash
      setTimeout(() => {
        router.push(`/tree/${encodeURIComponent(data)}`);
      }, 300);
    }
  };
  
  
  const handleError = (error) => {
    if (
      typeof error === 'string' &&
      (error.includes('NotFoundException') || error.includes('No barcode or QR code'))
    ) {
      return;
    }
    console.error('QR scan error:', error);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Scan Tree QR Code</h1>
          <p className="text-gray-400 text-sm sm:text-base">
            Point your camera at the QR code on the tree to begin tracking.
          </p>
        </div>

        <QRScanner onScan={handleScan} onError={handleError} />

        <p className="text-center text-xs text-gray-500 mt-6">
          Ensure your camera has permission and the QR code is well-lit.
        </p>
      </div>
    </div>
  );
}
