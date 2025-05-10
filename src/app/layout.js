// src/app/layout.js
'use client';

import './globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { usePathname } from 'next/navigation';

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isOwnerRoute = pathname.startsWith('/owner');

  return (
    <html lang="en">
      <body className="bg-gray-950 text-white">
        {!isOwnerRoute && <Navbar />}
        <main className="min-h-screen">{children}</main>
        {!isOwnerRoute && <Footer />}
      </body>
    </html>
  );
}
