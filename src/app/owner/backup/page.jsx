'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OwnerBackupPage() {
  const [month, setMonth] = useState(() => {
    // default to current month in "YYYY-MM"
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const router = useRouter();

  // optional: soft-guard—if not logged in as owner, push to /owner-login
  useEffect(() => {
    const isOwner = document.cookie.includes('owner_token=valid');
    if (!isOwner) router.replace(`/owner-login?redirect=/owner/backup`);
  }, [router]);

  const handleDownload = async () => {
    if (!month) return;
    try {
      const res = await fetch(`/api/backup/month?month=${encodeURIComponent(month)}`);
      if (!res.ok) {
        const msg = await res.json().catch(() => ({}));
        alert(msg.error || 'Failed to generate backup');
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-${month}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Download failed');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-green-400">Monthly Backup</h1>
      <p className="text-gray-400 text-sm">
        Pick a month to download a JSON backup (updates for that month, trees created in that month, plus farmers/fertilizers/pests).
      </p>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-4 max-w-md">
        <label className="block text-sm text-gray-400 mb-1">Month</label>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2"
        />
        <button
          onClick={handleDownload}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
        >
          Download `.json`
        </button>
      </div>
    </div>
  );
}
