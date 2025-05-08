'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react'; // Make sure this is installed

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-gray-900 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-green-400 tracking-tight">
          🌴 TreeFarm
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link href="/qr-scan" className="hover:text-green-400 transition">Scan QR</Link>
          <Link href="/daily-update" className="hover:text-yellow-400 transition">Daily Update</Link>
          <Link href="/generate-qr" className="hover:text-green-300 transition">Generate QR</Link>
        </div>

        {/* Mobile Toggle */}
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden">
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden px-4 pb-4 space-y-2 text-sm font-medium bg-gray-800">
          <Link href="/qr-scan" onClick={() => setIsOpen(false)} className="block hover:text-green-400">Scan QR</Link>
          <Link href="/daily-update" onClick={() => setIsOpen(false)} className="block hover:text-yellow-400">Daily Update</Link>
          <Link href="/generate-qr" onClick={() => setIsOpen(false)} className="block hover:text-green-300">Generate QR</Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
