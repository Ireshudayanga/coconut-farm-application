'use client';

import { useEffect, useState } from 'react';

export default function ManageFarmersPage() {
  const [farmers, setFarmers] = useState([]);
  const [form, setForm] = useState({ name: '', username: '', password: '' });
  const [loading, setLoading] = useState(false);

  const fetchFarmers = async () => {
    try {
      const res = await fetch('/api/farmers');
      const data = await res.json();
      setFarmers(data.farmers || []);
    } catch (err) {
      console.error('Fetch farmers error:', err);
    }
  };

  useEffect(() => {
    fetchFarmers();
  }, []);

  const handleAdd = async () => {
    if (!form.name || !form.username || !form.password) return;
    setLoading(true);
    try {
      const res = await fetch('/api/farmers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (data.ok) {
        setForm({ name: '', username: '', password: '' });
        fetchFarmers();
      } else {
        alert(data.error || 'Add failed');
      }
    } catch (err) {
      console.error('Add error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this farmer?')) return;
    try {
      await fetch(`/api/farmers?id=${id}`, { method: 'DELETE' });
      fetchFarmers();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 py-6 space-y-10">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold text-green-400">Manage Farmers</h1>
        <p className="text-gray-400 text-sm">Add, view, or delete farmer accounts.</p>
      </header>

      {/* Add Farmer */}
      <section className="bg-gray-900 border border-gray-800 rounded-xl p-6 max-w-2xl space-y-4">
        <h2 className="text-lg font-semibold">Add New Farmer</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Full name"
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-sm"
          />
          <input
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            placeholder="Username"
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-sm"
          />
          <input
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="Password"
            type="password"
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-sm"
          />
        </div>
        <button
          onClick={handleAdd}
          disabled={loading}
          className="mt-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-md text-sm font-semibold disabled:opacity-50"
        >
          {loading ? 'Adding...' : 'Add Farmer'}
        </button>
      </section>

      {/* Farmer List */}
      <section className="bg-gray-900 border border-gray-800 rounded-xl p-6 max-w-2xl">
        <h2 className="text-lg font-semibold mb-4">Registered Farmers</h2>
        {farmers.length === 0 ? (
          <p className="text-gray-500 text-sm">No farmers registered.</p>
        ) : (
          <ul className="divide-y divide-gray-800">
            {farmers.map((farmer) => (
              <li key={farmer.id} className="flex justify-between items-center py-3">
                <div>
                  <p className="text-white text-sm font-medium">{farmer.name}</p>
                  <p className="text-gray-500 text-xs">@{farmer.username}</p>
                </div>
                <button
                  onClick={() => handleDelete(farmer.id)}
                  className="text-red-400 hover:text-red-600 text-sm"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
