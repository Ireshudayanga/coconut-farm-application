'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const mockUpdates = [
  {
    treeId: 'TREE-001',
    watered: true,
    flags: ['🌴'],
    date: '2024-05-09',
    notes: 'Healthy and hydrated',
  },
  {
    treeId: 'TREE-002',
    watered: false,
    flags: ['🐛', '⚠️'],
    date: '2024-05-09',
    notes: 'Pest signs observed',
  },
];

const flagOptions = ['🌴', '🐛', '⚠️', '🌧️'];

export default function DailyUpdateDashboard() {
  const [searchId, setSearchId] = useState('');
  const [wateredFilter, setWateredFilter] = useState('');
  const [activeFlags, setActiveFlags] = useState([]);

  const toggleFlag = (flag) => {
    setActiveFlags((prev) =>
      prev.includes(flag) ? prev.filter((f) => f !== flag) : [...prev, flag]
    );
  };

  const filteredUpdates = mockUpdates.filter((item) => {
    const matchesId = searchId === '' || item.treeId.toLowerCase().includes(searchId.toLowerCase());
    const matchesWater = wateredFilter === '' || item.watered === (wateredFilter === 'yes');
    const matchesFlags =
      activeFlags.length === 0 || activeFlags.every((flag) => item.flags.includes(flag));

    return matchesId && matchesWater && matchesFlags;
  });

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 sm:p-6">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Daily Tree Updates</h1>
          <Link
            href="/qr-scan"
            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition"
          >
            Scan QR
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-gray-900 p-4 rounded-xl border border-gray-800 space-y-4">
          {/* Tree ID */}
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

          {/* Watered */}
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

          {/* Flags */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Filter by Flags</label>
            <div className="flex flex-wrap gap-2">
              {flagOptions.map((flag) => (
                <button
                  key={flag}
                  type="button"
                  onClick={() => toggleFlag(flag)}
                  className={`px-3 py-2 rounded-full text-xl ${
                    activeFlags.includes(flag) ? 'bg-blue-600' : 'bg-gray-700'
                  }`}
                >
                  {flag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Updates List */}
        <div className="space-y-4">
          {filteredUpdates.length === 0 ? (
            <p className="text-center text-gray-500">No updates match the selected filters.</p>
          ) : (
            filteredUpdates.map((update) => (
              <motion.div
                key={update.treeId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-900 border border-gray-800 rounded-xl p-4 shadow-md"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-green-400">{update.treeId}</span>
                  <span className="text-xs text-gray-400">{update.date}</span>
                </div>
                <div className="flex items-center gap-2 text-sm mb-1">
                  <span
                    className={`px-2 py-1 rounded ${
                      update.watered ? 'bg-green-700' : 'bg-red-700'
                    }`}
                  >
                    {update.watered ? 'Watered' : 'Not Watered'}
                  </span>
                  {update.flags.map((flag) => (
                    <span key={flag}>{flag}</span>
                  ))}
                </div>
                <p className="text-gray-400 text-sm">{update.notes}</p>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
