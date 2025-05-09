'use client';

import { useEffect, useState } from 'react';

export default function AddFertilizerPage() {
  const [fertilizerName, setFertilizerName] = useState('');
  const [fertilizers, setFertilizers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchFertilizers = async () => {
    try {
      const res = await fetch('/api/fertilizers');
      const data = await res.json();
      setFertilizers(data.fertilizers || []);
    } catch (err) {
      console.error('Failed to load fertilizers:', err);
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
        alert(data.message || 'Error adding fertilizer');
      }
    } catch (err) {
      console.error('Add error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (name) => {
    if (!confirm(`Delete fertilizer "${name}"?`)) return;
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
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <h1 className="text-2xl font-bold mb-6">🌿 Add Fertilizer</h1>

      <div className="flex gap-4 mb-6">
        <input
          type="text"
          value={fertilizerName}
          onChange={(e) => setFertilizerName(e.target.value)}
          placeholder="Enter fertilizer name"
          className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white w-full max-w-xs"
        />
        <button
          onClick={handleAdd}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
        >
          {loading ? 'Adding...' : 'Add'}
        </button>
      </div>

      <h2 className="text-xl font-semibold mb-3">Current Fertilizers</h2>
      <ul className="space-y-2">
        {fertilizers.map((name) => (
          <li key={name} className="flex justify-between items-center bg-gray-800 rounded-lg px-4 py-2">
            <span>{name}</span>
            <button
              onClick={() => handleDelete(name)}
              className="text-red-400 hover:text-red-600 text-sm"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
