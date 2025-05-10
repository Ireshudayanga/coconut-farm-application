'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BarChart,
  TreePine,
  Home,
  Menu,
  X,
  ArrowLeft,
  FlaskConical,
} from 'lucide-react';
import '@/app/globals.css';

const navItems = [
  { label: 'Dashboard', href: '/owner/dashboard', icon: <Home className="w-5 h-5" /> },
  { label: 'Analytics', href: '/owner/analytics', icon: <BarChart className="w-5 h-5" /> },
  { label: 'All Trees', href: '/owner/tree', icon: <TreePine className="w-5 h-5" /> },
  { label: 'Fertilizers', href: '/owner/fertilizers', icon: <FlaskConical className="w-5 h-5" /> }, // ✅ New item
];

export default function OwnerLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const isRootPage =
    pathname === '/owner/dashboard' ||
    pathname === '/owner/tree' ||
    pathname === '/owner/analytics' ||
    pathname === '/owner/fertilizers';

  return (
    <div className="bg-gray-950 text-white min-h-screen">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-gray-900 border-r border-gray-800 p-6 z-40 transition-transform duration-300 transform md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
      >
        <h2 className="text-xl mt-11 font-bold text-green-400 mb-6">Owner Panel</h2>

        {/* Main Nav */}
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${pathname.startsWith(item.href)
                  ? 'bg-green-700'
                  : 'hover:bg-gray-800 text-gray-300'
                }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Footer Nav */}
        <div className="mt-auto pt-6 border-t border-gray-800 space-y-2">
          <Link
            href="/farmer"
            onClick={() => setIsOpen(false)}
            className="block w-full text-center px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm font-medium transition"
          >
            Go to Farmer View
          </Link>
          <Link
            href="/owner/manage-farmers"
            onClick={() => setIsOpen(false)}
            className="block w-full text-center px-3 py-2 rounded-lg bg-green-700 hover:bg-green-600 text-sm font-medium transition text-white"
          >
            Manage Farmers
          </Link>
        </div>

        <div className='pt-6 border-t border-gray-800 space-y-2'>
          <button
          onClick={() => {
            document.cookie = 'owner_token=; Max-Age=0; path=/';
            location.href = '/owner-login';
          }}
         className="block  w-full text-center px-3 py-2 rounded-lg bg-red-500 hover:bg-red-800 text-sm font-medium transition text-white"
        >
          Logout
        </button>
        </div>

      </aside>


      {/* Mobile Toggle or Back */}
      <div
        className="md:hidden fixed z-50 p-2"
        style={{
          top: 'env(safe-area-inset-top, 1rem)',
          left: 'env(safe-area-inset-left, 1rem)',
        }}
      >
        {isRootPage ? (
          <button
            onClick={() => setIsOpen((prev) => !prev)}
            className="bg-gray-800 p-2 rounded-md"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        ) : (
          <button
            onClick={() => router.back()}
            className="bg-gray-800 p-2 rounded-md flex items-center text-sm text-gray-300 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="ml-0 md:ml-64 pt-14 p-4 sm:p-6 min-h-screen overflow-x-hidden transition-all">
        {children}
      </main>
    </div>
  );
}
