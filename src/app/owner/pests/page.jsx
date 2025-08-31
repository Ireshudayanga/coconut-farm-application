// src/app/owner/pests/page.jsx
'use client';

import { useEffect, useState } from 'react';

export default function PestManager() {
  const [name, setName] = useState('');
  const [pests, setPests] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPests = async () => {
    try {
      const res = await fetch('/api/pests');
      const data = await res.json();
      setPests(data.pests || []);
    } catch (err) {
      console.error('Fetch pests error:', err);
    }
  };

  useEffect(() => {
    fetchPests();
  }, []);

  const handleAdd = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setLoading(true);
    try {
      const res = await fetch('/api/pests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed }),
      });
      const data = await res.json();
      if (data.ok) {
        setName('');
        await fetchPests();
      } else {
        alert(data.message || 'Add failed');
      }
    } catch (err) {
      console.error('Add pest error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (n) => {
    if (!confirm(`Delete "${n}"?`)) return;
    try {
      await fetch('/api/pests', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: n }),
      });
      await fetchPests();
    } catch (err) {
      console.error('Delete pest error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 py-6 sm:px-6 lg:px-8 space-y-10">
      {/* Header */}
      <header className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-green-400">Pest Manager</h1>
        <p className="text-gray-400 text-sm sm:text-base">
          Add, view, or remove pests/diseases for the Daily Update dropdown.
        </p>
      </header>

      {/* Add Form */}
      <section className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
        <h2 className="text-lg font-semibold text-white">Add Pest</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Rhinoceros beetle"
            className="flex-1 px-4 py-2 rounded-md bg-gray-800 border border-gray-700 text-sm text-white focus:ring-2 focus:ring-green-500 focus:outline-none"
          />
          <button
            onClick={handleAdd}
            disabled={loading}
            className="px-4 py-2 rounded-md bg-green-600 hover:bg-green-700 text-sm font-semibold transition disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add'}
          </button>
        </div>
      </section>

      {/* List */}
      <section className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
        <h2 className="text-lg font-semibold text-white">Current Pests</h2>
        {pests.length === 0 ? (
          <p className="text-gray-500 text-sm">No pests added yet.</p>
        ) : (
          <ul className="divide-y divide-gray-800">
            {pests.map((n) => (
              <li key={n} className="flex items-center justify-between py-3">
                <span className="text-sm text-white truncate">{n}</span>
                <button
                  onClick={() => handleDelete(n)}
                  className="text-sm text-red-400 hover:text-red-600 transition"
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
