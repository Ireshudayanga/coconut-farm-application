'use client';

import { useEffect, useState } from 'react';
import './globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SessionTracker from '../components/SessionTracker';
import { usePathname } from 'next/navigation';

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isOwnerRoute = pathname.startsWith('/owner');
  const [swRegistered, setSwRegistered] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((reg) => {
          console.log('SW registered:', reg.scope);
          setSwRegistered(true);
        })
        .catch((err) => {
          console.warn('SW registration failed:', err);
          setSwRegistered(true);
        });
    } else {
      setSwRegistered(true);
    }
  }, []);

  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#16a34a" />
        <link rel="apple-touch-icon" href="/favicon.ico" />
      </head>
      <body className="bg-gray-950 text-white">
        {!isOwnerRoute && <Navbar />}
        {!isOwnerRoute && <SessionTracker />}
        <main className="min-h-screen">{children}</main>
        {!isOwnerRoute && <Footer />}

        {/* Hidden same-origin iframes to load page resources for SW caching */}
        {swRegistered && !isOwnerRoute && (
          <>
            <iframe src="/qr-scan" style={{ display: 'none', width: 0, height: 0, border: 0 }} />
            <iframe src="/tree-update" style={{ display: 'none', width: 0, height: 0, border: 0 }} />
          </>
        )}
      </body>
    </html>
  );
}
