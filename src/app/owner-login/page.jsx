'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Home } from 'lucide-react';

export default function OwnerLoginPage() {
  const [password, setPassword] = useState('');
  const [redirectTo, setRedirectTo] = useState('/owner/dashboard');
  const router = useRouter();

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const redirect = searchParams.get('redirect');
    if (redirect) setRedirectTo(redirect);
  }, []);

  const handleLogin = async () => {
    try {
      const res = await fetch('/api/owner-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (data.ok) {
        document.cookie = `owner_token=valid; max-age=172800; path=/`;
        router.replace(redirectTo);
      } else {
        alert('Invalid password');
      }
    } catch (err) {
      console.error('Login failed', err);
      alert('Error logging in.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-6 space-y-4 relative">
      {/* Home button */}
      <button
        onClick={() => router.push('/')}
        className="absolute top-4 left-4 text-gray-400 hover:text-white transition"
        title="Back to Home"
      >
        <Home className="w-6 h-6" />
      </button>

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
