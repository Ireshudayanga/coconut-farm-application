'use client';

import QRCodeScanner from '../../components/QRCodeScanner';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function ScanPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 py-10 sm:px-6">
      <div className="max-w-xl mx-auto space-y-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-green-400">
            Scan Tree QR
          </h1>
          <p className="text-gray-400 text-sm sm:text-base mt-2">
            Align the QR code inside the frame to scan and update tree info.
          </p>
        </motion.div>

        {/* Scanner Frame */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-gray-900 border border-gray-700 rounded-2xl shadow-lg p-4"
        >
          <QRCodeScanner />
        </motion.div>

        {/* Tip + Back Link */}
        <div className="text-center text-gray-500 text-sm">
          Make sure your camera is clear and well-lit.
        </div>

        <div className="text-center">
          <Link
            href="/"
            className="inline-block mt-4 text-sm text-green-500 hover:underline transition"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
