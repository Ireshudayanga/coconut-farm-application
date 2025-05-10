'use client';

import Link from 'next/link';

export default function LoginChoicePage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center space-y-6">
      <h1 className="text-3xl font-bold">Welcome to TreeFarm</h1>
      <p className="text-gray-400">Please choose a login method</p>
      <div className="space-y-4">
        <Link
          href="/login"
          className="block px-6 py-3 bg-green-600 rounded-md hover:bg-green-700 text-white text-center"
        >
          Farmer Login
        </Link>
        <Link
          href="/owner-login"
          className="block px-6 py-3 bg-blue-600 rounded-md hover:bg-blue-700 text-white text-center"
        >
          Owner Login
        </Link>
      </div>
    </div>
  );
}
