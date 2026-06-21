// src/app/owner/dashboard/page.jsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";


export default function OwnerDashboard() {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters (only these four now)
  const [searchNumber, setSearchNumber] = useState(""); // numeric part after TREE-
  const [wateredFilter, setWateredFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [fertilizerFilter, setFertilizerFilter] = useState("");

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        const res = await fetch("/api/daily-update");
        const data = await res.json();
        setUpdates(data.updates || []);
      } catch (err) {
        console.error("Failed to fetch updates:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUpdates();
  }, []);

  // 1) Add a small formatter near the top (below imports)
  const fmtLocalTime = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    // e.g. "10:42" or "10:42 AM" depending on user locale
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const filteredUpdates = updates.filter((item) => {
    // Tree ID: user types only digits; we match against "TREE-<digits>"
    const matchesId =
      searchNumber === "" ||
      item.treeId.toLowerCase().includes(`tree-${searchNumber}`.toLowerCase());

    const matchesWater =
      wateredFilter === "" || item.watered === (wateredFilter === "yes");

    const matchesDate = dateFilter === "" || item.date === dateFilter;

    const matchesFertilizer =
      fertilizerFilter === "" ||
      (Array.isArray(item.fertilizers) &&
        item.fertilizers.some((f) =>
          f.toLowerCase().includes(fertilizerFilter.toLowerCase())
        ));

    return matchesId && matchesWater && matchesDate && matchesFertilizer;
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-green-400">Dashboard</h1>
      <p className="text-gray-400">Latest activities from farmers</p>

      {/* Filters */}
      <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl space-y-4">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {/* Tree ID with fixed prefix */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Tree ID</label>
            <div className="flex items-center bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
              <span className="px-3 py-2 text-gray-400 bg-gray-900 border-r border-gray-700">
                TREE-
              </span>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={searchNumber}
                onChange={(e) => {
                  // keep only digits
                  const digits = e.target.value.replace(/\D/g, "");
                  setSearchNumber(digits);
                }}
                placeholder="Enter number"
                className="flex-1 bg-transparent text-white px-3 py-2 outline-none"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Type only the number part (e.g., 12 → matches TREE-012, TREE-12,
              etc.)
            </p>
          </div>

          {/* Watered? */}
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

          {/* Date */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Date</label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2"
            />
          </div>

          {/* Fertilizer */}
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
              className="block bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4 shadow-sm hover:border-green-600/50 hover:bg-gray-900/80 transition duration-200"
            >
              {/* Top Row: Tree ID & Date */}
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Tree ID</span>
                  <h3 className="text-lg font-bold text-green-400 mt-0.5">{update.treeId}</h3>
                </div>
                <span className="text-xs text-gray-400 bg-gray-950 px-2.5 py-1 rounded-md border border-gray-800">
                  {update.date}
                  {update.createdAt ? ` · ${fmtLocalTime(update.createdAt)}` : ""}
                </span>
              </div>

              {/* Status Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 font-medium">Watering:</span>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      update.watered
                        ? "bg-green-950/80 text-green-400 border border-green-800/40"
                        : "bg-red-950/80 text-red-400 border border-red-800/40"
                    }`}
                  >
                    {update.watered ? "Watered" : "Not Watered"}
                  </span>
                </div>

                {/* Fertilizers applied */}
                <div>
                  <span className="block text-xs text-gray-400 font-medium mb-1.5">Fertilizers Applied:</span>
                  {Array.isArray(update.fertilizers) && update.fertilizers.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {update.fertilizers.map((f, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-950 text-blue-300 border border-blue-800/50"
                        >
                          🧪 {f}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-gray-500 italic">None</span>
                  )}
                </div>
              </div>

              {/* Image Preview */}
              {update.imageUrl && (
                <div className="relative rounded-lg overflow-hidden border border-gray-700 mt-2 aspect-video bg-black/20">
                  <img
                    src={update.imageUrl}
                    alt="tree"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
