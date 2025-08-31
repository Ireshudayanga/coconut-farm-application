'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  ResponsiveContainer,
} from 'recharts';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';

const COLORS = ['#22c55e', '#ef4444', '#facc15', '#3b82f6'];

export default function TreeAnalyticsPage() {
  const { id: treeId } = useParams();

  const [updatesPerDay, setUpdatesPerDay] = useState([]);
  const [wateringSummary, setWateringSummary] = useState([]);
  const [flagBreakdown, setFlagBreakdown] = useState([]);
  const [loadingUpdates, setLoadingUpdates] = useState(true);
  const [loadingWatering, setLoadingWatering] = useState(true);
  const [loadingFlags, setLoadingFlags] = useState(true);

  useEffect(() => {
    if (!treeId) return;

    fetch(`/api/analytics/updates-per-day?treeId=${treeId}`)
      .then((res) => res.json())
      .then((data) => setUpdatesPerDay(data.updates || []))
      .catch(console.error)
      .finally(() => setLoadingUpdates(false));

    fetch(`/api/analytics/watering-summary?treeId=${treeId}`)
      .then((res) => res.json())
      .then((data) => setWateringSummary(data.summary || []))
      .catch(console.error)
      .finally(() => setLoadingWatering(false));

    fetch(`/api/analytics/flag-breakdown?treeId=${treeId}`)
      .then((res) => res.json())
      .then((data) => setFlagBreakdown(data.summary || []))
      .catch(console.error)
      .finally(() => setLoadingFlags(false));
  }, [treeId]);

  const Spinner = () => (
    <div className="flex justify-center items-center h-40">
      <div className="w-6 h-6 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-green-400">Analytics: {treeId}</h1>
        <p className="text-gray-400">Insights for this specific tree.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Updates per Day */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <h2 className="text-lg font-semibold mb-3 text-white">Updates per Day</h2>
          {loadingUpdates ? (
            <Spinner />
          ) : updatesPerDay.length === 0 ? (
            <p className="text-gray-500 text-sm">No update data available.</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={updatesPerDay}>
                <XAxis dataKey="date" stroke="#ccc" />
                <YAxis stroke="#ccc" />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#22c55e" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Watering Summary */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <h2 className="text-lg font-semibold mb-3 text-white">Watering Status</h2>
          {loadingWatering ? (
            <Spinner />
          ) : wateringSummary.length === 0 ? (
            <p className="text-gray-500 text-sm">No watering data available.</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={wateringSummary}
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  label
                  dataKey="value"
                >
                  {wateringSummary.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Flag Breakdown */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <h2 className="text-lg font-semibold mb-3 text-white">Flag Breakdown</h2>
          {loadingFlags ? (
            <Spinner />
          ) : flagBreakdown.length === 0 ? (
            <p className="text-gray-500 text-sm">No flag data available.</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={flagBreakdown}>
                <XAxis dataKey="name" stroke="#ccc" />
                <YAxis stroke="#ccc" />
                <Tooltip />
                <Bar dataKey="value">
                  {flagBreakdown.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Tree Activity Feed */}
      <div>
        <h2 className="text-2xl font-semibold text-green-400 mb-4">
          Latest Activity for {treeId}
        </h2>
        <TreeActivity treeId={treeId} />
      </div>
    </div>
  );
}

function TreeActivity({ treeId }) {
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  // NEW: simple lightbox state for full image viewing
  const [lightboxUrl, setLightboxUrl] = useState(null);
  const openLightbox = useCallback((url) => setLightboxUrl(url), []);
  const closeLightbox = useCallback(() => setLightboxUrl(null), []);

  useEffect(() => {
    if (!treeId) return;

    fetch(`/api/daily-update?treeId=${treeId}`)
      .then((res) => res.json())
      .then((data) => {
        const items = Array.isArray(data.updates) ? data.updates : [];

        // ✅ Ensure "recent first" on the client too
        // Your API already sorts by date desc, but we enforce here as well.
        items.sort((a, b) => {
          const da = new Date(a.date);
          const db = new Date(b.date);
          return db - da; // newest first
        });

        setActivity(items);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [treeId]);

  if (loading) {
    return <div className="text-gray-400">Loading activity...</div>;
  }

  if (activity.length === 0) {
    return <div className="text-gray-500 italic">No activity yet for this tree.</div>;
  }

  return (
    <>
      <div className="space-y-4">
        {activity.map((update, index) => (
          <div
            key={`${update.date}-${index}`}
            className="bg-gray-900 border border-gray-800 p-4 rounded-xl space-y-2 shadow"
          >
            <div className="flex justify-between items-center">
              <span className="text-green-400 font-semibold">{update.treeId}</span>
              <span className="text-sm text-gray-500">{update.date}</span>
            </div>

            <div className="flex gap-2 text-sm">
              <span
                className={`px-2 py-1 rounded text-xs ${
                  update.watered ? 'bg-green-700' : 'bg-red-700'
                }`}
              >
                {update.watered ? 'Watered' : 'Not Watered'}
              </span>

              {update.flags?.length > 0 ? (
                update.flags.map((flag, i) => (
                  <span key={i} className="text-xl">
                    {['🌴', '🐛', '⚠️', '🌧️'][flag]}
                  </span>
                ))
              ) : (
                <span className="text-xs text-gray-500 italic">No flags</span>
              )}
            </div>

            {update.notes && <p className="text-gray-300 text-sm">{update.notes}</p>}

            {update.imageUrl && (
              <div className="space-y-2">
                {/* Thumbnail that opens the lightbox */}
                <img
                  src={update.imageUrl}
                  alt="tree"
                  className="w-full h-40 object-cover rounded-lg border border-gray-700 cursor-zoom-in"
                  onClick={() => openLightbox(update.imageUrl)}
                />
                {/* Also provide an explicit button for owners */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => openLightbox(update.imageUrl)}
                    className="px-3 py-1 rounded bg-gray-800 border border-gray-700 text-sm hover:bg-gray-700"
                  >
                    View full image
                  </button>
                  <a
                    href={update.imageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1 rounded bg-gray-800 border border-gray-700 text-sm hover:bg-gray-700"
                  >
                    Open in new tab
                  </a>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Simple lightbox modal */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative max-w-5xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeLightbox}
              className="absolute -top-10 right-0 text-gray-200 bg-gray-800 border border-gray-700 px-3 py-1 rounded hover:bg-gray-700"
            >
              Close
            </button>
            <img
              src={lightboxUrl}
              alt="Full view"
              className="w-full h-auto rounded-lg border border-gray-700"
            />
          </div>
        </div>
      )}
    </>
  );
}
