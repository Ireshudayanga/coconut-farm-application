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
  const [showScanner, setShowScanner] = useState(true);
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
    setShowScanner(false); // Unmount scanner immediately to release camera stream!
    
    const isValidTreeIdFormat = (id) => {
      return typeof id === 'string' && id.trim().toUpperCase().startsWith('TREE-');
    };

    // If offline, route instantly without fetch timeout delay
    if (typeof window !== 'undefined' && !navigator.onLine) {
      if (isValidTreeIdFormat(data)) {
        router.push(`/tree/${data}`);
      } else {
        alert('❌ Scanned Tree ID format is invalid.');
        setShowScanner(true);
        setPause(false);
      }
      return;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 500); // 500ms fast timeout

      const response = await fetch(`/api/tree?id=${encodeURIComponent(data)}`, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (response.ok) {
        const result = await response.json();
        if (result.exists) {
          router.push(`/tree/${data}`);
        } else {
          alert('❌ Tree ID not found in the database.');
          setShowScanner(true);
          setPause(false);
        }
      } else {
        // Server error or DB offline. Allow if format matches.
        if (isValidTreeIdFormat(data)) {
          router.push(`/tree/${data}`);
        } else {
          alert('❌ Tree ID not found in the database.');
          setShowScanner(true);
          setPause(false);
        }
      }
    } catch (error) {
      console.error('Scan error (offline or DB stopped):', error);
      // Connection failure. Allow if format matches.
      if (isValidTreeIdFormat(data)) {
        router.push(`/tree/${data}`);
      } else {
        alert('❌ Connection failure and scanned ID is invalid.');
        setShowScanner(true);
        setPause(false);
      }
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
        <div className="flex justify-center min-h-[420px] items-center">
          {showScanner ? (
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
          ) : (
            <div className="flex flex-col items-center space-y-3">
              <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-500 text-sm">Processing scan, releasing camera...</p>
            </div>
          )}
        </div>

        {/* Tip */}
        <p className="text-sm text-center text-gray-600">
          Ensure good lighting and camera focus for better scanning.
        </p>
      </div>
    </div>
  );
}
