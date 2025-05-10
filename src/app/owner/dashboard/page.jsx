'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const flagMap = {
  0: '🌴',
  1: '🐛',
  2: '⚠️',
  3: '🌧️',
};

export default function OwnerDashboard() {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        const res = await fetch('/api/daily-update');
        const data = await res.json();
        setUpdates(data.updates || []);
      } catch (err) {
        console.error('Failed to fetch updates:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUpdates();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-green-400">Dashboard</h1>
      <p className="text-gray-400">Latest activities from farmers</p>

      {loading ? (
        <p className="text-gray-500">Loading updates...</p>
      ) : updates.length === 0 ? (
        <p className="text-gray-600">No updates available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {updates.map((update, index) => (
            <Link
              href={`/owner/tree/${update.treeId}`}
              key={`${update.treeId}-${index}`}
              className="block bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-2 shadow-sm hover:bg-gray-800 transition"
            >
              <div className="flex justify-between items-center">
                <span className="text-green-400 font-semibold">{update.treeId}</span>
                <span className="text-xs text-gray-500">{update.date}</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    update.watered ? 'bg-green-700' : 'bg-red-700'
                  }`}
                >
                  {update.watered ? 'Watered' : 'Not Watered'}
                </span>

                {update.flags?.length > 0 ? (
                  update.flags.map((flag, i) => (
                    <span key={i} className="text-xl">
                      {flagMap[flag]}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-gray-500 italic">No flags</span>
                )}
              </div>

              {update.notes && (
                <p className="text-gray-300 text-sm">{update.notes}</p>
              )}

              {update.imageUrl && (
                <img
                  src={update.imageUrl}
                  alt="tree"
                  className="w-full h-40 object-cover rounded-lg border border-gray-700 mt-2"
                />
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
