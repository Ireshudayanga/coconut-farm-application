'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Clock, Activity, Users, ChevronDown, ChevronUp } from 'lucide-react';

export default function SessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/sessions')
      .then(res => res.json())
      .then(data => {
        if (data.ok) {
          setSessions(data.sessions);
        } else {
          setError(data.error);
        }
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load sessions');
      })
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    let totalMinutes = 0;
    let onlineCount = 0;
    const farmerHours = {};

    sessions.forEach(s => {
      totalMinutes += s.durationMinutes;
      if (s.isOnline) onlineCount++;
      
      const hours = s.durationMinutes / 60;
      if (!farmerHours[s.username]) {
        farmerHours[s.username] = 0;
      }
      farmerHours[s.username] += hours;
    });

    const chartData = Object.keys(farmerHours).map(username => ({
      username,
      hours: parseFloat(farmerHours[username].toFixed(1))
    })).sort((a, b) => b.hours - a.hours);

    return {
      totalHours: Math.floor(totalMinutes / 60),
      totalMinutes: totalMinutes % 60,
      onlineCount,
      chartData
    };
  }, [sessions]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-4">
        <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 text-sm animate-pulse font-medium">Loading session data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-400 p-6 bg-red-900/20 border border-red-900/50 rounded-xl">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6 text-white pb-12">
      <div className="flex items-center gap-3 bg-gray-900 border border-gray-800 p-5 rounded-2xl shadow-xl">
        <div className="p-2 rounded-lg bg-green-950/80 text-green-400 border border-green-900/50">
          <Clock className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">Farmer Sessions</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Currently Online</p>
              <h3 className="text-3xl font-bold mt-1 text-green-400">{stats.onlineCount}</h3>
            </div>
            <div className="p-3 bg-green-900/30 rounded-full text-green-400 border border-green-800/50">
              <Activity className="w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Total Recorded Time</p>
              <h3 className="text-3xl font-bold mt-1 text-blue-400">
                {stats.totalHours}h {stats.totalMinutes}m
              </h3>
            </div>
            <div className="p-3 bg-blue-900/30 rounded-full text-blue-400 border border-blue-800/50">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Total Sessions</p>
              <h3 className="text-3xl font-bold mt-1 text-purple-400">{sessions.length}</h3>
            </div>
            <div className="p-3 bg-purple-900/30 rounded-full text-purple-400 border border-purple-800/50">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Chart */}
        <div className="lg:col-span-1 bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-xl">
          <h3 className="text-lg font-bold mb-6 text-white flex items-center gap-2">
            Hours Worked per Farmer
          </h3>
          <div className="h-64">
            {stats.chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                  <XAxis dataKey="username" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    cursor={{ fill: '#1f2937' }}
                    contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '0.5rem', color: '#fff' }}
                  />
                  <Bar dataKey="hours" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                No session data yet.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Table */}
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl shadow-xl overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-800">
            <h3 className="text-lg font-bold text-white">Session History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-gray-800/50 text-gray-400 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Farmer</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Started</th>
                  <th className="px-6 py-4">Ended</th>
                  <th className="px-6 py-4">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {sessions.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      No sessions recorded.
                    </td>
                  </tr>
                ) : (
                  sessions.map((s) => (
                    <tr key={s._id} className="hover:bg-gray-800/30 transition">
                      <td className="px-6 py-4 font-medium text-white">{s.username}</td>
                      <td className="px-6 py-4">
                        {s.isOnline ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-900/50 text-green-400 border border-green-800/50">
                            Online
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-800 text-gray-400 border border-gray-700">
                            Offline
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-400">
                        {new Date(s.startTime).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-gray-400">
                        {s.isOnline ? '-' : (s.endTime ? new Date(s.endTime).toLocaleString() : new Date(s.lastActive).toLocaleString())}
                      </td>
                      <td className="px-6 py-4 font-medium">
                        {s.durationMinutes} min
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
