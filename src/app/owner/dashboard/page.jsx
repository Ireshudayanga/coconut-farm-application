// src/app/owner/dashboard/page.jsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// still used for read-only display on the cards
const flagMap = {
  0: "🌴",
  1: "🐛",
  2: "⚠️",
  3: "🌧️",
};

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
              className="block bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-2 shadow-sm hover:bg-gray-800 transition"
            >
              <div className="flex justify-between items-center">
                <span className="text-green-400 font-semibold">
                  {update.treeId}
                </span>

                {/* Date + local time */}
                <span className="text-xs text-gray-500">
                  {update.date}
                  {update.createdAt
                    ? ` · ${fmtLocalTime(update.createdAt)}`
                    : ""}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    update.watered ? "bg-green-700" : "bg-red-700"
                  }`}
                >
                  {update.watered ? "Watered" : "Not Watered"}
                </span>

                {/* read-only flags display retained */}
                {Array.isArray(update.flags) && update.flags.length > 0 ? (
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
