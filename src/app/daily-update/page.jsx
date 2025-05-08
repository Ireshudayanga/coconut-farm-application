'use client';

import DailyUpdateForm from '@/components/DailyUpdateForm';
import QRScanner from '@/components/QRScanner';
import { useState } from 'react';

export default function DailyUpdatePage() {
  const [treeId, setTreeId] = useState('');

  const handleScan = (data) => {
    if (data) {
      console.log('Scanned:', data);
  
      // Delay navigation to avoid hydration/layout crash
      setTimeout(() => {
        setTreeId(data);
      }, 300);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-center mb-4">Daily Update</h1>

        {!treeId && (
          <div className="bg-gray-800 p-4 rounded-lg">
            <p className="text-sm mb-2 text-gray-300">Scan a tree QR to begin:</p>
            <QRScanner onScan={handleScan} />
          </div>
        )}

        {treeId && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2 text-green-400">🌴 Tree ID: {treeId}</h2>
            <DailyUpdateForm treeId={treeId} />
          </div>
        )}
      </div>
    </div>
  );
}
