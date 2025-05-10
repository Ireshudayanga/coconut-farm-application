'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function FarmerLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Auto-login from localStorage
    const saved = localStorage.getItem('farmerAuth');
    if (saved) {
      document.cookie = `farmer_token=1; path=/`;
      router.replace('/daily-update');
    }
  }, []);

  const handleLogin = async () => {
    if (!username || !password) return;

    const res = await fetch('/api/farmers');
    const data = await res.json();

    const match = data.farmers.find((f) => f.username === username);

    if (!match) return alert('User not found');

    const check = await fetch('/api/farmer-login', {
      method: 'POST',
      body: JSON.stringify({ password, hash: match.passwordHash }),
    });

    const valid = await check.json();

    if (!valid.ok) return alert('Wrong password');

    // ✅ Save session
    document.cookie = `farmer_token=1; path=/`;
    localStorage.setItem('farmerAuth', JSON.stringify({ username }));
    router.replace('/daily-update');
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-6 space-y-6">
      <h1 className="text-2xl font-bold text-green-400">Farmer Login</h1>
      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="bg-gray-800 border border-gray-700 px-4 py-2 rounded-md text-sm w-full max-w-xs"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="bg-gray-800 border border-gray-700 px-4 py-2 rounded-md text-sm w-full max-w-xs"
      />
      <button
        onClick={handleLogin}
        className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-md text-white text-sm font-semibold"
      >
        Login
      </button>
    </div>
  );
}
