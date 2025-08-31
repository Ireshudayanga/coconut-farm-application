'use client';
import { useState } from "react";

export default function OwnerBackupPage() {
  const [mode, setMode] = useState("month"); // "month" | "range"
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const handleDownload = async () => {
    let url = "";
    if (mode === "month") {
      url = `/api/backup/month?month=${month}`;
    } else {
      if (!start || !end) return alert("Pick start and end dates");
      url = `/api/backup/range?start=${start}&end=${end}`;
    }
    try {
      const res = await fetch(url);
      if (!res.ok) return alert("Backup failed");
      const blob = await res.blob();
      const dl = document.createElement("a");
      dl.href = URL.createObjectURL(blob);
      dl.download = mode === "month"
        ? `backup-${month}.json`
        : `backup-${start}_to_${end}.json`;
      dl.click();
      URL.revokeObjectURL(dl.href);
    } catch (err) {
      console.error(err);
      alert("Download failed");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-green-400">Backup</h1>
      <p className="text-gray-400 text-sm">
        Download farm data either by month or by custom date range.
      </p>

      {/* Mode switch */}
      <div className="flex gap-4">
        <button
          className={`px-3 py-1 rounded ${mode === "month" ? "bg-green-600" : "bg-gray-700"}`}
          onClick={() => setMode("month")}
        >
          By Month
        </button>
        <button
          className={`px-3 py-1 rounded ${mode === "range" ? "bg-green-600" : "bg-gray-700"}`}
          onClick={() => setMode("range")}
        >
          By Date Range
        </button>
      </div>

      {mode === "month" ? (
        <div className="bg-gray-900 p-4 rounded-xl space-y-3 max-w-md">
          <label className="block text-sm text-gray-400">Month</label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2"
          />
        </div>
      ) : (
        <div className="bg-gray-900 p-4 rounded-xl space-y-3 max-w-md">
          <label className="block text-sm text-gray-400">Start Date</label>
          <input
            type="date"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 w-full"
          />
          <label className="block text-sm text-gray-400">End Date</label>
          <input
            type="date"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 w-full"
          />
        </div>
      )}

      <button
        onClick={handleDownload}
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
      >
        Download
      </button>
    </div>
  );
}
