'use client';

import { useEffect } from 'react';

// Fallback for random UUID if not in secure context
function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export default function SessionTracker() {
  useEffect(() => {
    // Only track if logged in as farmer
    const isFarmerLoggedIn = document.cookie.includes('farmer_token=1');
    if (!isFarmerLoggedIn) return;

    let authData;
    try {
      authData = JSON.parse(localStorage.getItem('farmerAuth') || '{}');
    } catch (e) {
      authData = {};
    }

    if (!authData.username) return;

    let sessionId = sessionStorage.getItem('farmerSessionId');

    // Auto-start session if missing (e.g. new tab or returning to app while still logged in)
    if (!sessionId) {
      sessionId = generateUUID();
      sessionStorage.setItem('farmerSessionId', sessionId);

      // Fire and forget session start
      fetch('/api/sessions/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: authData.username, sessionId }),
      }).catch(console.error);
    }

    // Heartbeat mechanism every 1 minute
    const interval = setInterval(() => {
      fetch('/api/sessions/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      }).catch(console.error);
    }, 1 * 60 * 1000); // 1 minute

    // Handle sudden browser close or navigation away
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        const payload = JSON.stringify({ sessionId });
        // Use sendBeacon for reliable delivery on page unload
        if (navigator.sendBeacon) {
          navigator.sendBeacon('/api/sessions/end', payload);
        } else {
          // Fallback if sendBeacon not supported
          fetch('/api/sessions/end', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload,
            keepalive: true
          }).catch(() => {});
        }
      } else if (document.visibilityState === 'visible') {
        // App came back to foreground, maybe it was a new session or we just need to heartbeat
        fetch('/api/sessions/heartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        }).catch(console.error);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return null; // This component doesn't render anything
}
