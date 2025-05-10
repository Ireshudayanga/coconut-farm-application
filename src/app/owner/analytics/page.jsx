'use client';

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-green-400">Analytics</h1>
      <p className="text-gray-400">Visual insights into farm activity</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Replace below divs with <ChartSection title="..." data={...} /> later */}
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 text-center">
          <p className="text-sm text-gray-400 mb-2">Watering Trends</p>
          <div className="text-gray-600 text-xs">[ Chart goes here ]</div>
        </div>
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 text-center">
          <p className="text-sm text-gray-400 mb-2">Fertilizer Usage</p>
          <div className="text-gray-600 text-xs">[ Chart goes here ]</div>
        </div>
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 text-center">
          <p className="text-sm text-gray-400 mb-2">Flag Frequency</p>
          <div className="text-gray-600 text-xs">[ Chart goes here ]</div>
        </div>
      </div>
    </div>
  );
}
