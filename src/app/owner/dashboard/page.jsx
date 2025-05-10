'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const flagMap = {
  0: '🌴',
  1: '🐛',
  2: '⚠️',
  3: '🌧️',
};

const flagOptions = [0, 1, 2, 3];

export default function OwnerDashboard() {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchId, setSearchId] = useState('');
  const [wateredFilter, setWateredFilter] = useState('');
  const [activeFlags, setActiveFlags] = useState([]);
  const [dateFilter, setDateFilter] = useState('');
  const [fertilizerFilter, setFertilizerFilter] = useState('');
  const [showTooltip, setShowTooltip] = useState(false);


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

  const toggleFlag = (flag) => {
    setActiveFlags((prev) =>
      prev.includes(flag) ? prev.filter((f) => f !== flag) : [...prev, flag]
    );
  };

  const filteredUpdates = updates.filter((item) => {
    const matchesId =
      searchId === '' ||
      item.treeId.toLowerCase().includes(searchId.toLowerCase());

    const matchesWater =
      wateredFilter === '' || item.watered === (wateredFilter === 'yes');

    const matchesFlags =
      activeFlags.length === 0 ||
      activeFlags.every((flag) => item.flags?.includes(flag));

    const matchesDate = dateFilter === '' || item.date === dateFilter;

    const matchesFertilizer =
      fertilizerFilter === '' ||
      item.fertilizers?.includes(fertilizerFilter);

    return (
      matchesId &&
      matchesWater &&
      matchesFlags &&
      matchesDate &&
      matchesFertilizer
    );
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-green-400">Dashboard</h1>
      <p className="text-gray-400">Latest activities from farmers</p>

      {/* Filters */}
      <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl space-y-4">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Tree ID</label>
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Search by Tree ID"
              className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Watered?</label>
            <select
              value={wateredFilter}
              onChange={(e) => setWateredFilter(e.target.value)}
              className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2"
            >
              <option value="">All</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Date</label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Fertilizer
            </label>
            <input
              type="text"
              value={fertilizerFilter}
              onChange={(e) => setFertilizerFilter(e.target.value)}
              placeholder="e.g. Urea"
              className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm text-gray-400">Filter by Flags</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowTooltip((prev) => !prev)}
                className="text-sm text-gray-400 hover:text-white transition"
              >
                ⓘ
              </button>

              {showTooltip && (
                <div className="absolute z-10 top-6 right-0 w-64 bg-gray-900 text-gray-200 text-xs p-3 rounded-lg shadow-lg border border-gray-700">
                  <p>🌴 — Healthy condition</p>
                  <p>🐛 — Pests observed</p>
                  <p>⚠️ — Needs attention</p>
                  <p>🌧️ — Affected by rain</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {flagOptions.map((flagNum) => (
              <button
                key={flagNum}
                type="button"
                onClick={() => toggleFlag(flagNum)}
                className={`px-3 py-2 rounded-full text-xl ${activeFlags.includes(flagNum) ? 'bg-blue-600' : 'bg-gray-700'
                  }`}
              >
                {flagMap[flagNum]}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center py-10">
          <div className="w-6 h-6 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredUpdates.length === 0 ? (
        <p className="text-gray-600">No updates match selected filters.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUpdates.map((update, index) => (
            <Link
              href={`/owner/tree/${update.treeId}`}
              key={`${update.treeId}-${index}`}
              className="block bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-2 shadow-sm hover:bg-gray-800 transition"
            >
              <div className="flex justify-between items-center">
                <span className="text-green-400 font-semibold">
                  {update.treeId}
                </span>
                <span className="text-xs text-gray-500">{update.date}</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${update.watered ? 'bg-green-700' : 'bg-red-700'
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
