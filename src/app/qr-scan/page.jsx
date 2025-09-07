'use client';

import QRCodeScanner from '../../components/QRCodeScanner';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function QRScanPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <header>
          <h1 className="text-2xl font-bold">QR Scanner</h1>
          <p className="text-gray-600">Scan a tree tag to open details.</p>
        </header>

        {/* The scanner component below is also converted to light */}
        <QRCodeScanner />

        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center"
        >
          <Link
            href="/daily-update"
            className="text-green-700 hover:text-green-800 underline"
          >
            Go to Daily Updates
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
