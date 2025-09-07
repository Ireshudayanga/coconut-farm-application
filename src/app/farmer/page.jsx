"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { QrCode, ClipboardList, ChevronRight } from "lucide-react";
import { useEffect } from "react";

function useLockBodyScroll(lock = true) {
  useEffect(() => {
    if (!lock) return;
    const { style } = document.body;
    const prev = style.overflow;
    style.overflow = "hidden";
    return () => {
      style.overflow = prev;
    };
  }, [lock]);
}

export default function FarmerPage() {
  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = "";
    };
  }, []);

  useLockBodyScroll(true);

  return (
    <div className="min-h-[100dvh] bg-white text-gray-900 overscroll-none">
      {/* Header */}
      <header className="px-4 pt-6 pb-3 sm:px-6">
        <motion.h1
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold tracking-tight"
        >
          Farmer Dashboard
        </motion.h1>
        <p className="text-gray-600 text-sm mt-1">Quick actions for daily work</p>
      </header>

      {/* Primary actions */}
      <main className="px-4 sm:px-6 space-y-4 pb-28">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="fixed inset-0 z-40 flex flex-col justify-center items-center bg-white text-center p-6 h-[100dvh]"
        >
          <div className="flex flex-col items-center space-y-6 max-w-sm w-full">
            {/* Icon */}
            <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-green-50 text-green-600 ring-1 ring-green-200">
              <QrCode className="w-12 h-12" aria-hidden="true" />
            </div>

            {/* Title + description */}
            <div>
              <h2 className="text-2xl font-bold mb-2">Scan Tree QR</h2>
              <p className="text-gray-600 text-base">
                Point your phone at the tree tag to open the update form instantly.
              </p>
            </div>

            {/* Action button */}
            <Link
              href="/qr-scan"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition"
            >
              Start Scanning
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </main>

      {/* Sticky bottom action bar */}
      <nav className="fixed inset-x-0 bottom-0 z-50 bg-white/95 border-t border-gray-200 backdrop-blur supports-[backdrop-filter]:bg-white/70">
        <div className="mx-auto max-w-3xl px-4 py-3">
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/qr-scan"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 hover:bg-green-700 px-4 py-3 text-sm font-semibold text-white"
            >
              <QrCode className="w-5 h-5" />
              Scan QR
            </Link>
            <Link
              href="/daily-update"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white hover:bg-gray-50 border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-900"
            >
              <ClipboardList className="w-5 h-5" />
              Fill Form
            </Link>
          </div>
          <div className="pt-[env(safe-area-inset-bottom)]" />
        </div>
      </nav>
    </div>
  );
}
