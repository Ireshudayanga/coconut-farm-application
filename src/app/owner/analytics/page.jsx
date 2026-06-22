'use client';

import { useEffect, useState } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Sprout,
  Activity,
  Droplets,
  Calendar,
  RefreshCw,
  TrendingUp,
  TreePalm,
  ShieldAlert,
  Dna,
} from 'lucide-react';

const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6', '#ec4899'];

export default function AnalyticsPage() {
  const [selectedTree, setSelectedTree] = useState('');
  const [trees, setTrees] = useState([]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch trees list for dropdown filter
  useEffect(() => {
    fetch('/api/tree/all')
      .then((res) => res.json())
      .then((data) => setTrees(data.trees || []))
      .catch((err) => console.error('Failed to load trees:', err));
  }, []);

  // Fetch dashboard stats & charts
  const fetchAnalytics = async (treeId = '') => {
    setRefreshing(true);
    try {
      const url = treeId ? `/api/analytics/dashboard?treeId=${treeId}` : '/api/analytics/dashboard';
      const res = await fetch(url);
      const analyticsData = await res.json();
      if (analyticsData.ok) {
        setData(analyticsData);
      }
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(selectedTree);
  }, [selectedTree]);

  const handleTreeChange = (e) => {
    setSelectedTree(e.target.value);
  };

  const Spinner = () => (
    <div className="flex flex-col justify-center items-center h-64 space-y-4">
      <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-400 text-sm animate-pulse font-medium">Loading premium insights...</p>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white p-6">
        <Spinner />
      </div>
    );
  }

  const { summary, updatesPerDay, harvestsPerDay, wateringSummary, fertilizerBreakdown, pestBreakdown } = data || {};

  return (
    <div className="space-y-6 text-white pb-12">
      {/* Title & Filter bar */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-gray-900 border border-gray-800 p-5 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-green-950/80 text-green-400 border border-green-900/50">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">Farm Analytics</h1>
          </div>
          <p className="text-gray-400 text-xs mt-1 sm:text-sm">
            Live insights, health monitoring, and yield tracking configurations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <label className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1">
              Select Target Tree
            </label>
            <select
              value={selectedTree}
              onChange={handleTreeChange}
              className="bg-gray-950 text-white border border-gray-800 rounded-lg px-3 py-2 text-sm focus:border-green-500 focus:outline-none min-w-44"
            >
              <option value="">🌴 All Trees (Overview)</option>
              {trees.map((t) => (
                <option key={t.id} value={t.id}>
                  🌴 {t.id} {t.name ? `(${t.name})` : ''}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => fetchAnalytics(selectedTree)}
            disabled={refreshing}
            className="mt-5 p-2.5 rounded-lg bg-gray-950 border border-gray-800 hover:bg-gray-850 hover:border-gray-700 text-gray-400 hover:text-white transition disabled:opacity-50"
            title="Refresh statistics"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Trees Card */}
        <div className="relative overflow-hidden bg-gray-900 border border-gray-800 p-5 rounded-2xl shadow-lg flex items-center gap-4 group hover:border-green-800/40 transition">
          <div className="p-3.5 rounded-xl bg-green-950 text-green-400 border border-green-900/50">
            <TreePalm className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Trees</p>
            <h3 className="text-2xl font-black mt-0.5">{summary?.totalTrees || 0}</h3>
          </div>
          <div className="absolute right-0 bottom-0 opacity-5 transform translate-x-2 translate-y-4">
            <TreePalm className="w-32 h-32 text-green-400" />
          </div>
        </div>

        {/* Total Updates Card */}
        <div className="relative overflow-hidden bg-gray-900 border border-gray-800 p-5 rounded-2xl shadow-lg flex items-center gap-4 group hover:border-blue-800/40 transition">
          <div className="p-3.5 rounded-xl bg-blue-950 text-blue-400 border border-blue-900/50">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Logs Logged</p>
            <h3 className="text-2xl font-black mt-0.5">{summary?.totalUpdates || 0}</h3>
          </div>
          <div className="absolute right-0 bottom-0 opacity-5 transform translate-x-2 translate-y-4">
            <Activity className="w-32 h-32 text-blue-400" />
          </div>
        </div>

        {/* Coconuts Harvested Card */}
        <div className="relative overflow-hidden bg-gray-900 border border-gray-800 p-5 rounded-2xl shadow-lg flex items-center gap-4 group hover:border-yellow-800/40 transition">
          <div className="p-3.5 rounded-xl bg-yellow-950 text-yellow-400 border border-yellow-900/50">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Yield Count</p>
            <h3 className="text-2xl font-black mt-0.5">{summary?.totalHarvested || 0}</h3>
          </div>
          <div className="absolute right-0 bottom-0 opacity-5 transform translate-x-2 translate-y-4">
            <Sprout className="w-32 h-32 text-yellow-400" />
          </div>
        </div>

        {/* Average Yield Card */}
        <div className="relative overflow-hidden bg-gray-900 border border-gray-800 p-5 rounded-2xl shadow-lg flex items-center gap-4 group hover:border-purple-800/40 transition">
          <div className="p-3.5 rounded-xl bg-purple-950 text-purple-400 border border-purple-900/50">
            <Dna className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Avg Yield/Tree</p>
            <h3 className="text-2xl font-black mt-0.5">{summary?.averageYield || 0} <span className="text-xs text-gray-500 font-medium">nuts</span></h3>
          </div>
          <div className="absolute right-0 bottom-0 opacity-5 transform translate-x-2 translate-y-4">
            <Dna className="w-32 h-32 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Activity Trend (Area Chart) */}
        <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl shadow-lg space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-800 pb-3">
            <Calendar className="w-5 h-5 text-green-400" />
            <h2 className="text-lg font-bold text-white">Farmer Daily Activity Trend</h2>
          </div>
          {updatesPerDay?.length === 0 ? (
            <div className="flex justify-center items-center h-64 text-gray-500 text-sm">
              No activity logs logged in the last 30 days.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={updatesPerDay} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: 10 }} />
                <YAxis stroke="#6b7280" style={{ fontSize: 10 }} />
                <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#fff' }}
                  labelStyle={{ fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="count" name="Logs" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Harvest Yield Progress (Bar Chart) */}
        <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl shadow-lg space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-800 pb-3">
            <Sprout className="w-5 h-5 text-yellow-400" />
            <h2 className="text-lg font-bold text-white">Daily Coconut Yield Count</h2>
          </div>
          {harvestsPerDay?.length === 0 ? (
            <div className="flex justify-center items-center h-64 text-gray-500 text-sm">
              No yield records logged in the last 30 days.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={harvestsPerDay} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: 10 }} />
                <YAxis stroke="#6b7280" style={{ fontSize: 10 }} />
                <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#fff' }}
                  labelStyle={{ fontWeight: 'bold' }}
                />
                <Bar dataKey="count" name="Coconuts" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Watering Status Ratio (Pie/Donut Chart) */}
        <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl shadow-lg flex flex-col space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-800 pb-3">
            <Droplets className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold text-white">Watering Distribution</h2>
          </div>
          {wateringSummary?.length === 0 ? (
            <div className="flex justify-center items-center flex-1 h-64 text-gray-500 text-sm">
              No watering updates recorded.
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 flex-1 py-4">
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie
                    data={wateringSummary}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {wateringSummary.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#ef4444'} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>

              <div className="space-y-3">
                {wateringSummary.map((item, index) => {
                  const total = wateringSummary.reduce((a, b) => a + b.value, 0);
                  const percentage = total > 0 ? ((item.value / total) * 100).toFixed(0) : 0;
                  return (
                    <div key={item.name} className="flex items-center gap-3">
                      <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: index === 0 ? '#10b981' : '#ef4444' }} />
                      <div>
                        <p className="text-sm font-semibold text-white">{item.name}</p>
                        <p className="text-xs text-gray-400">
                          {item.value} times ({percentage}%)
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Fertilizer Breakdown (Horizontal Bar Chart) */}
        <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl shadow-lg space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-800 pb-3">
            <Sprout className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">Fertilizer Application Usage</h2>
          </div>
          {fertilizerBreakdown?.length === 0 ? (
            <div className="flex justify-center items-center h-64 text-gray-500 text-sm">
              No fertilizers applied yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart layout="vertical" data={fertilizerBreakdown} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <XAxis type="number" stroke="#6b7280" style={{ fontSize: 10 }} />
                <YAxis dataKey="name" type="category" stroke="#6b7280" style={{ fontSize: 10 }} width={70} />
                <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" />
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#fff' }} />
                <Bar dataKey="count" name="Applications" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pest and Disease Incident breakdown */}
        <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl shadow-lg space-y-4 lg:col-span-2">
          <div className="flex items-center gap-2 border-b border-gray-800 pb-3">
            <ShieldAlert className="w-5 h-5 text-red-500" />
            <h2 className="text-lg font-bold text-white">Pest & Disease Flags Breakdown</h2>
          </div>
          {pestBreakdown?.length === 0 ? (
            <div className="flex justify-center items-center h-48 text-gray-500 text-sm">
              🎉 No pests or disease infections reported.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={pestBreakdown} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: 10 }} />
                  <YAxis stroke="#6b7280" style={{ fontSize: 10 }} />
                  <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#fff' }} />
                  <Bar dataKey="count" name="Reports" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>

              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wider font-bold text-gray-400 mb-2">Detailed Incidents</p>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {pestBreakdown.map((item, idx) => (
                    <div key={item.name} className="flex justify-between items-center p-2 rounded-lg bg-gray-950 border border-gray-850 text-sm">
                      <span className="font-semibold text-red-400 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        {item.name}
                      </span>
                      <span className="font-bold text-white bg-red-950 px-2 py-0.5 rounded text-xs border border-red-900/50">
                        {item.count} report(s)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
