'use client';

import { useEffect, useState } from 'react';

export default function FertilizerManager() {
  const [fertilizerName, setFertilizerName] = useState('');
  const [fertilizers, setFertilizers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchFertilizers = async () => {
    try {
      const res = await fetch('/api/fertilizers');
      const data = await res.json();
      setFertilizers(data.fertilizers || []);
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  useEffect(() => {
    fetchFertilizers();
  }, []);

  const handleAdd = async () => {
    if (!fertilizerName.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/fertilizers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: fertilizerName.trim() }),
      });
      const data = await res.json();
      if (data.ok) {
        setFertilizerName('');
        await fetchFertilizers();
      } else {
        alert(data.message || 'Add failed');
      }
    } catch (err) {
      console.error('Add error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (name) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await fetch('/api/fertilizers', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      await fetchFertilizers();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 py-6 sm:px-6 lg:px-8 space-y-10">
      {/* Header */}
      <header className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-green-400">Fertilizer Manager</h1>
        <p className="text-gray-400 text-sm sm:text-base">
          Add, view, or remove fertilizer types used by farmers.
        </p>
      </header>

      {/* Add Form */}
      <section className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
        <h2 className="text-lg font-semibold text-white">Add Fertilizer</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={fertilizerName}
            onChange={(e) => setFertilizerName(e.target.value)}
            placeholder="Fertilizer name"
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

      {/* Fertilizer List */}
      <section className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
        <h2 className="text-lg font-semibold text-white">Current Fertilizers</h2>
        {fertilizers.length === 0 ? (
          <p className="text-gray-500 text-sm">No fertilizers added yet.</p>
        ) : (
          <ul className="divide-y divide-gray-800">
            {fertilizers.map((name) => (
              <li key={name} className="flex items-center justify-between py-3">
                <span className="text-sm text-white truncate">{name}</span>
                <button
                  onClick={() => handleDelete(name)}
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
