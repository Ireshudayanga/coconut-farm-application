'use client';

import { useEffect } from 'react';
import './globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SessionTracker from '../components/SessionTracker';
import { usePathname } from 'next/navigation';

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isOwnerRoute = pathname.startsWith('/owner');

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((reg) => console.log('SW registered:', reg.scope))
          .catch((err) => console.warn('SW registration failed:', err));
      });
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
      </body>
    </html>
  );
}
