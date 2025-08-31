'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

// Mapping numeric flag values to emoji symbols
const flagMap = {
  0: '🌴',
  1: '🐛',
  2: '⚠️',
  3: '🌧️',
};

const flagOptions = [0, 1, 2, 3];

export default function DailyUpdateDashboard() {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchId, setSearchId] = useState('');
  const [wateredFilter, setWateredFilter] = useState('');
  const [activeFlags, setActiveFlags] = useState([]);
  const [dateFilter, setDateFilter] = useState('');


  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        const res = await fetch('/api/daily-update');
        const data = await res.json();
        setUpdates(data.updates || []);
      } catch (err) {
        console.error('Error fetching updates:', err);
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
    const matchesId = searchId === '' || item.treeId.toLowerCase().includes(searchId.toLowerCase());
    const matchesWater = wateredFilter === '' || item.watered === (wateredFilter === 'yes');
    const matchesFlags =
      activeFlags.length === 0 || activeFlags.every((flag) => item.flags?.includes(flag));
    const matchesDate = dateFilter === '' || item.date === dateFilter;
  
    return matchesId && matchesWater && matchesFlags && matchesDate;
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

          {/* Date Filter */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Date</label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2"
            />
          </div>
        </div>

        {/* Updates List */}
        <div className="space-y-4">
          {loading ? (
            <p className="text-center text-gray-400">Loading updates...</p>
          ) : filteredUpdates.length === 0 ? (
            <p className="text-center text-gray-500">No updates match the selected filters.</p>
          ) : (
            filteredUpdates.map((update, i) => (
              <motion.div
                key={`${update.treeId}-${update.date}-${i}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-900 border border-gray-800 rounded-xl p-4 shadow-md space-y-2"
              >
                {/* Header row */}
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-green-400 text-lg">{update.treeId}</span>
                  <span className="text-xs text-gray-400">{update.date}</span>
                </div>

                {/* Status badges */}
                <div className="flex items-center gap-2 text-sm">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${update.watered ? 'bg-green-700' : 'bg-red-700'
                      }`}
                  >
                    {update.watered ? 'Watered' : 'Not Watered'}
                  </span>

                  {/* ✅ Render numeric flags as emojis */}
                  {Array.isArray(update.flags) && update.flags.length > 0 ? (
                    update.flags.map((flagNum, idx) => (
                      <span key={idx} className="text-xl">{flagMap[flagNum]}</span>
                    ))
                  ) : (
                    <span className="text-gray-500 text-xs italic">No Flags</span>
                  )}
                </div>

                {/* Notes */}
                {update.notes && (
                  <p className="text-gray-400 text-sm">{update.notes}</p>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}