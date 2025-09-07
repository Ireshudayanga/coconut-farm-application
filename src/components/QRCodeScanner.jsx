'use client';

import { useState } from 'react';
import {
  Scanner,
  useDevices,
  outline,
  boundingBox,
  centerText,
} from '@yudiel/react-qr-scanner';
import { useRouter } from 'next/navigation';

export default function ScannerPage() {
  const router = useRouter();
  const [deviceId, setDeviceId] = useState(undefined);
  const [tracker, setTracker] = useState('centerText');
  const [pause, setPause] = useState(false);
  const devices = useDevices();

  const getTracker = () => {
    switch (tracker) {
      case 'outline':
        return outline;
      case 'boundingBox':
        return boundingBox;
      case 'centerText':
        return centerText;
      default:
        return undefined;
    }
  };

  const handleScan = async (data) => {
    setPause(true);
    try {
      const response = await fetch(`/api/tree?id=${encodeURIComponent(data)}`);
      const result = await response.json();

      if (response.ok && result.exists) {
        router.push(`/tree/${data}`);
      } else {
        alert('❌ Tree ID not found in the database.');
      }
    } catch (error) {
      console.error('Scan error:', error);
      alert('Error checking tree ID.');
    } finally {
      setPause(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 px-4 py-10 sm:px-6">
      <div className="max-w-xl mx-auto space-y-6">
        {/* Controls */}
        <div className="flex flex-wrap gap-4 justify-center">
          <select
            value={deviceId}
            onChange={(e) => setDeviceId(e.target.value)}
            className="bg-white text-gray-900 p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">Select Camera</option>
            {devices.map((device, index) => (
              <option key={index} value={device.deviceId}>
                {device.label}
              </option>
            ))}
          </select>

          <select
            value={tracker}
            onChange={(e) => setTracker(e.target.value)}
            className="bg-white text-gray-900 p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="centerText">Center Text</option>
            <option value="outline">Outline</option>
            <option value="boundingBox">Bounding Box</option>
            <option value="">No Tracker</option>
          </select>
        </div>

        {/* Scanner */}
        <div className="flex justify-center">
          <Scanner
            formats={['qr_code']}
            constraints={{ deviceId }}
            onScan={(codes) => codes[0] && handleScan(codes[0].rawValue)}
            onError={(err) => console.error('Scanner error:', err)}
            styles={{ container: { height: '420px', width: '360px' } }}
            components={{
              audio: true,
              onOff: true,
              torch: true,
              zoom: true,
              finder: true,
              tracker: getTracker(),
            }}
            allowMultiple={false}
            scanDelay={2000}
            paused={pause}
          />
        </div>

        {/* Tip */}
        <p className="text-sm text-center text-gray-600">
          Ensure good lighting and camera focus for better scanning.
        </p>
      </div>
    </div>
  );
}
