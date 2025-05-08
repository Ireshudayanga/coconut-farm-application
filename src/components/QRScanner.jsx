'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeScanType } from 'html5-qrcode';

export default function QRScanner({ onScan, onError }) {
  const [internalResult, setInternalResult] = useState('');
  const [isClient, setIsClient] = useState(false);
  const scannerRef = useRef(null);

  useEffect(() => {
    setIsClient(true); // Trigger once React has hydrated client-side
  }, []);

  useEffect(() => {
    if (!isClient || scannerRef.current || typeof window === 'undefined') return;

    const qrCode = new Html5Qrcode('qr-reader');
    scannerRef.current = qrCode;

    qrCode.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: 250 },
      (decodedText) => {
        if (!internalResult) {
          setInternalResult(decodedText);
          onScan?.(decodedText);
          qrCode.stop();
        }
      },
      (err) => {
        if (
          typeof err === 'string' &&
          (err.includes('NotFoundException') || err.includes('No barcode or QR code'))
        ) return;
        onError?.(err);
      }
    );

    return () => {
      qrCode.stop().then(() => qrCode.clear()).catch(console.warn);
    };
  }, [isClient, internalResult, onScan, onError]);

  return (
    <div className="relative bg-white p-4 rounded-xl text-black w-full shadow-lg">
      {!isClient && (
        <div className="w-full h-[200px] flex items-center justify-center text-sm text-gray-500">
          Initializing camera...
        </div>
      )}
      <div id="qr-reader" className="w-full" />
      {internalResult && (
        <div className="mt-4 text-green-600 font-semibold text-center">
         Scanned: {internalResult}
        </div>
      )}
    </div>
  );
}
