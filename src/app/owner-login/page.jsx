// src/app/owner-login/page.jsx
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function OwnerLoginPage() {
  const [password, setPassword] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleLogin = () => {
    if (password === process.env.NEXT_PUBLIC_OWNER_PASSWORD) {
      document.cookie = `owner_token=valid; path=/`;
      const redirect = searchParams.get('redirect') || '/owner/dashboard';
      router.replace(redirect);
    } else {
      alert('Invalid password');
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-6 space-y-4">
      <h1 className="text-2xl font-bold text-green-400">Owner Login</h1>
      <input
        type="password"
        placeholder="Enter owner password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="bg-gray-800 border border-gray-700 px-4 py-2 rounded-lg w-full max-w-xs text-sm"
      />
      <button
        onClick={handleLogin}
        className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg text-sm"
      >
        Login
      </button>
    </div>
  );
}
