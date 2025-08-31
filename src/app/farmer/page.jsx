// src/app/farmer/page.jsx
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  QrCode,
  ClipboardList,
  ChevronRight,
  Camera,
  FileEdit,
} from "lucide-react";
import { useEffect } from "react";

export default function FarmerPage() {
  // optional: lock viewport height for mobile browsers to reduce jump
  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = "";
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="px-4 pt-6 pb-3 sm:px-6">
        <motion.h1
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold tracking-tight"
        >
          Farmer Dashboard
        </motion.h1>
        <p className="text-gray-400 text-sm mt-1">
          Quick actions for daily work
        </p>
      </header>

      {/* Primary actions (mobile-first, big tap targets) */}
      <main className="px-4 sm:px-6 space-y-4 pb-28">
        {/* Scan QR */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="fixed inset-0 z-40 flex flex-col justify-center items-center bg-gray-900 text-center p-6"
        >
          <div className="flex flex-col items-center space-y-6 max-w-sm w-full">
            {/* Icon */}
            <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-green-600/20 text-green-400">
              <QrCode className="w-12 h-12" aria-hidden="true" />
            </div>

            {/* Title + description */}
            <div>
              <h2 className="text-2xl font-bold mb-2">Scan Tree QR</h2>
              <p className="text-gray-400 text-base">
                Point your phone at the tree tag to open the update form
                instantly.
              </p>
            </div>

            {/* Action button */}
            <Link
              href="/qr-scan"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition"
            >
              Start Scanning
            </Link>
          </div>
        </motion.div>
      </main>

      {/* Sticky bottom action bar (thumb-reachable) */}
      <nav className="fixed inset-x-0 bottom-0 z-50 bg-gray-900/95 border-t border-gray-800 backdrop-blur supports-[backdrop-filter]:bg-gray-900/70">
        <div className="mx-auto max-w-3xl px-4 py-3">
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/qr-scan"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 hover:bg-green-700 px-4 py-3 text-sm font-semibold"
            >
              <QrCode className="w-5 h-5" />
              Scan QR
            </Link>
            <Link
              href="/daily-update"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 px-4 py-3 text-sm font-semibold"
            >
              <ClipboardList className="w-5 h-5" />
              Fill Form
            </Link>
          </div>
          {/* iOS safe-area padding */}
          <div className="pt-[env(safe-area-inset-bottom)]" />
        </div>
      </nav>
    </div>
  );
}
