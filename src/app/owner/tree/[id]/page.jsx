'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const flagMap = {
  0: '🌴',
  1: '🐛',
  2: '⚠️',
  3: '🌧️',
};

export default function TreeDetailPage() {
  const { id } = useParams(); // 👈 catches TREE-004
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTreeUpdates = async () => {
      try {
        const res = await fetch(`/api/daily-update?treeId=${id}`); // ✅ request specific tree only
        const data = await res.json();
        setUpdates(data.updates || []);
      } catch (err) {
        console.error('Error fetching tree updates', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchTreeUpdates();
  }, [id]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-green-400">🌳 {id} History</h1>
      <p className="text-gray-400">Showing updates for this tree only.</p>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : updates.length === 0 ? (
        <p className="text-gray-600">No updates yet for this tree.</p>
      ) : (
        <div className="space-y-4">
          {updates.map((u, i) => (
            <div
              key={i}
              className="bg-gray-900 border border-gray-800 rounded-xl p-4 shadow space-y-2"
            >
              <div className="flex justify-between text-sm text-gray-400">
                <span>{u.date}</span>
                <span className={`${u.watered ? 'text-green-500' : 'text-red-500'}`}>
                  {u.watered ? 'Watered' : 'Not Watered'}
                </span>
              </div>
              <div className="flex gap-2">
                {u.flags?.length > 0 ? (
                  u.flags.map((f, i) => <span key={i}>{flagMap[f]}</span>)
                ) : (
                  <span className="italic text-xs text-gray-500">No flags</span>
                )}
              </div>
              {u.notes && <p className="text-sm text-gray-300">{u.notes}</p>}
              {u.imageUrl && (
                <img
                  src={u.imageUrl}
                  alt="tree update"
                  className="w-full h-40 object-cover rounded-lg border border-gray-700"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
