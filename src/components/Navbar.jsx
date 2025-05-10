'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    document.cookie = 'farmer_token=; Max-Age=0; path=/';
    localStorage.removeItem('farmerAuth');
    location.href = '/login-choice';
  };

  return (
    <nav className="bg-gray-950 text-white sticky top-0 z-50 shadow border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="text-2xl font-bold text-green-400 hover:text-green-300 transition tracking-tight"
        >
          🌴 TreeFarm
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link
            href="/qr-scan"
            className="hover:text-green-400 transition"
          >
            Scan QR
          </Link>
          <Link
            href="/daily-update"
            className="hover:text-yellow-400 transition"
          >
            Daily Update
          </Link>
        
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="text-red-400 hover:text-red-600 transition"
          >
            Logout
          </button>

          {/* Owner Login CTA */}
          <Link
            href="/owner/dashboard"
            className="ml-6 px-4 py-2 rounded-md bg-green-600 hover:bg-green-700 transition text-white text-sm font-semibold"
          >
            Owner Login
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-gray-900 px-4 pb-4 space-y-3 text-sm font-medium border-t border-gray-800">
          <Link
            href="/qr-scan"
            onClick={() => setIsOpen(false)}
            className="block hover:text-green-400"
          >
            Scan QR
          </Link>
          <Link
            href="/daily-update"
            onClick={() => setIsOpen(false)}
            className="block hover:text-yellow-400"
          >
            Daily Update
          </Link>
        
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="block text-left  text-red-400 hover:text-red-600 transition"
          >
            Logout
          </button>

          <Link
            href="/owner/dashboard"
            onClick={() => setIsOpen(false)}
            className="block bg-green-600 text-white px-4 py-2 rounded-md text-center hover:bg-green-700 transition"
          >
            Owner Login
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
