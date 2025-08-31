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
import { useEffect, useState } from 'react';

const COLORS = ['#22c55e', '#ef4444', '#facc15', '#3b82f6'];

export default function AnalyticsPage() {
  const [updatesPerDay, setUpdatesPerDay] = useState([]);
  const [wateringSummary, setWateringSummary] = useState([]);
  const [flagBreakdown, setFlagBreakdown] = useState([]);

  const [loadingUpdates, setLoadingUpdates] = useState(true);
  const [loadingWatering, setLoadingWatering] = useState(true);
  const [loadingFlags, setLoadingFlags] = useState(true);

  useEffect(() => {
    fetch('/api/analytics/updates-per-day')
      .then((res) => res.json())
      .then((data) => setUpdatesPerDay(data.updates || []))
      .catch(console.error)
      .finally(() => setLoadingUpdates(false));

    fetch('/api/analytics/watering-summary')
      .then((res) => res.json())
      .then((data) => setWateringSummary(data.summary || []))
      .catch(console.error)
      .finally(() => setLoadingWatering(false));

    fetch('/api/analytics/flag-breakdown')
      .then((res) => res.json())
      .then((data) => setFlagBreakdown(data.summary || []))
      .catch(console.error)
      .finally(() => setLoadingFlags(false));
  }, []);

  const Spinner = () => (
    <div className="flex justify-center items-center h-40">
      <div className="w-6 h-6 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-green-400">Analytics</h1>
      <p className="text-gray-400">Visual insights into farm activity, watering, and health.</p>

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

      
      </div>
    </div>
  );
}
