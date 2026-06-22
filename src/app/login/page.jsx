'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function FarmerLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  useEffect(() => {
    // If already logged in, redirect to dashboard
    const isLoggedIn = document.cookie.includes('farmer_token=1');
    if (isLoggedIn) {
      router.replace('/daily-update');
    }
  }, [router]);

  const handleLogin = async () => {
    if (!username || !password) {
      alert('Please enter both username and password');
      return;
    }

    try {
      const res = await fetch('/api/farmers');
      const data = await res.json();

      const match = data.farmers.find((f) => f.username === username);
      if (!match) return alert('User not found');

      const check = await fetch('/api/farmer-login', {
        method: 'POST',
        body: JSON.stringify({ password, hash: match.passwordHash }),
      });

      const valid = await check.json();
      if (!valid.ok) return alert('Incorrect password');

      // ✅ Set cookie valid for 2 days
      document.cookie = `farmer_token=1; max-age=172800; path=/`;
      localStorage.setItem('farmerAuth', JSON.stringify({ username }));

      // Fetch snapshot of DB elements for offline use
      try {
        const [settingsRes, fertilizersRes, pestsRes, tasksRes] = await Promise.all([
          fetch('/api/settings').then(r => r.json()).catch(() => null),
          fetch('/api/fertilizers').then(r => r.json()).catch(() => null),
          fetch('/api/pests').then(r => r.json()).catch(() => null),
          fetch('/api/tasks').then(r => r.json()).catch(() => null),
        ]);
        if (settingsRes?.settings) {
          localStorage.setItem('cached_settings', JSON.stringify(settingsRes.settings));
        }
        if (fertilizersRes?.fertilizers) {
          localStorage.setItem('cached_fertilizers', JSON.stringify(fertilizersRes.fertilizers));
        }
        if (pestsRes?.pests) {
          localStorage.setItem('cached_pests', JSON.stringify(pestsRes.pests));
        }
        if (tasksRes?.tasks) {
          localStorage.setItem('cached_tasks', JSON.stringify(tasksRes.tasks));
        }
      } catch (cacheErr) {
        console.error('Offline pre-cache failed:', cacheErr);
      }

      router.replace('/farmer');
    } catch (err) {
      console.error('Login error:', err);
      alert('Login failed. Try again.');
    }
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
