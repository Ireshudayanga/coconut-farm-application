'use client';

import { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useRouter } from 'next/navigation';

export default function QRCodeScanner() {
  const hasScanned = useRef(false);
  const html5QrCodeRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    const startScanner = async () => {
      try {
        html5QrCodeRef.current = new Html5Qrcode('reader');

        await html5QrCodeRef.current.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: 250 },
          (decodedText) => {
            if (!hasScanned.current) {
              hasScanned.current = true;
              html5QrCodeRef.current.stop().catch(() => {});
              router.push(`/tree/${decodedText}`);
            }
          },
          (error) => {
            // optional: console.log('Scan error', error);
          }
        );
      } catch (err) {
        console.error('Scanner init failed:', err);
      }
    };

    setTimeout(() => {
      if (isMounted) startScanner();
    }, 300);

    return () => {
      isMounted = false;
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
  }, [router]);

  return <div id="reader" className="w-full h-[300px] rounded-lg shadow-md" />;
}
