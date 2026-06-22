"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { QrCode, CheckCircle, Circle, RefreshCw, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

let globalSyncing = false;

export default function FarmerPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [farmerName, setFarmerName] = useState("");
  const [offlineCount, setOfflineCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [hasCachedAssets, setHasCachedAssets] = useState(false);
  const isSyncingRef = useRef(false);

  const preCacheAssets = async () => {
    if (typeof window !== 'undefined' && navigator.onLine) {
      try {
        const [settingsRes, fertilizersRes, pestsRes] = await Promise.all([
          fetch('/api/settings').then(r => r.ok ? r.json() : null).catch(() => null),
          fetch('/api/fertilizers').then(r => r.ok ? r.json() : null).catch(() => null),
          fetch('/api/pests').then(r => r.ok ? r.json() : null).catch(() => null),
        ]);
        if (settingsRes?.settings) {
          localStorage.setItem('cached_settings', JSON.stringify(settingsRes.settings));
        }
        if (fertilizersRes?.fertilizers) {
          localStorage.setItem('cached_fertilizers', JSON.stringify(fertilizersRes.fertilizers));
        }
        if (pestsRes?.pests) {
          localStorage.setItem('cached_pests', JSON.stringify(pestsRes.pests));
        }
        const cachedFertilizers = localStorage.getItem('cached_fertilizers');
        const cachedPests = localStorage.getItem('cached_pests');
        setHasCachedAssets(!!(cachedFertilizers && cachedPests));
      } catch (cacheErr) {
        console.error('Offline caching during dashboard mount failed:', cacheErr);
      }
    }
  };

  useEffect(() => {
    // Check initial online status and cached assets existence
    const checkStatus = () => {
      const online = typeof window !== 'undefined' ? navigator.onLine : true;
      setIsOnline(online);
      const cachedFertilizers = localStorage.getItem('cached_fertilizers');
      const cachedPests = localStorage.getItem('cached_pests');
      setHasCachedAssets(!!(cachedFertilizers && cachedPests));
    };

    checkStatus();

    // Check auth username
    try {
      const auth = localStorage.getItem('farmerAuth');
      if (auth) {
        setFarmerName(JSON.parse(auth).username || 'Farmer');
      } else {
        setFarmerName('Farmer');
      }
    } catch {
      setFarmerName('Farmer');
    }

    // Try loading cached tasks list
    try {
      const cached = localStorage.getItem('cached_tasks');
      if (cached) {
        setTasks(JSON.parse(cached));
      }
    } catch (e) {
      console.error('Failed to load cached tasks:', e);
    }

    fetchTasks();
    checkOfflineQueue();
    preCacheAssets();

    const handleOnline = () => {
      setIsOnline(true);
      checkStatus();
      syncOfflineQueue();
    };

    const handleOffline = () => {
      setIsOnline(false);
      checkStatus();
    };

    // Listen to network status
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks");
      const data = await res.json();
      const list = data.tasks || [];
      setTasks(list);
      localStorage.setItem('cached_tasks', JSON.stringify(list));
    } catch (err) {
      console.error("Failed to load tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  const checkOfflineQueue = () => {
    try {
      const updates = JSON.parse(localStorage.getItem('offline_updates') || '[]');
      const harvests = JSON.parse(localStorage.getItem('offline_harvests') || '[]');
      const taskCompletions = JSON.parse(localStorage.getItem('offline_task_completions') || '[]');
      setOfflineCount(updates.length + harvests.length + taskCompletions.length);
    } catch {
      setOfflineCount(0);
    }
  };

  const handleToggleTask = async (taskId, currentStatus) => {
    const newStatus = !currentStatus;

    // Optimistic UI update
    setTasks(prev => {
      const updated = prev.map(t => t._id === taskId ? { ...t, completed: newStatus } : t);
      localStorage.setItem('cached_tasks', JSON.stringify(updated));
      return updated;
    });

    if (!navigator.onLine) {
      // Queue offline task completion
      try {
        const completions = JSON.parse(localStorage.getItem('offline_task_completions') || '[]');
        const filtered = completions.filter(c => c.taskId !== taskId);
        filtered.push({ taskId, completed: newStatus });
        localStorage.setItem('offline_task_completions', JSON.stringify(filtered));
        checkOfflineQueue();
        alert('Offline: Task status update queued locally. It will sync automatically when you are back online.');
      } catch (err) {
        console.error(err);
      }
      return;
    }

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: newStatus }),
      });
      if (!res.ok) {
        // Rollback
        setTasks(prev => {
          const rolledBack = prev.map(t => t._id === taskId ? { ...t, completed: currentStatus } : t);
          localStorage.setItem('cached_tasks', JSON.stringify(rolledBack));
          return rolledBack;
        });
        alert('Failed to update task');
      }
    } catch (err) {
      console.error(err);
      // Rollback
      setTasks(prev => {
        const rolledBack = prev.map(t => t._id === taskId ? { ...t, completed: currentStatus } : t);
        localStorage.setItem('cached_tasks', JSON.stringify(rolledBack));
        return rolledBack;
      });
    }
  };

  const syncOfflineQueue = async () => {
    if (globalSyncing) return;
    if (isSyncingRef.current) return;
    if (syncing) return;
    if (typeof window !== 'undefined' && !navigator.onLine) {
      alert('⚠️ Cannot sync: You are currently offline. Please connect to the internet.');
      return;
    }
    globalSyncing = true;
    isSyncingRef.current = true;
    setSyncing(true);

    let hasErrors = false;

    // 1. Task completions
    try {
      const taskCompletions = JSON.parse(localStorage.getItem('offline_task_completions') || '[]');
      const failedCompletions = [];
      for (const tc of taskCompletions) {
        try {
          const res = await fetch(`/api/tasks/${tc.taskId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ completed: tc.completed }),
          });
          if (!res.ok) {
            failedCompletions.push(tc);
            hasErrors = true;
          }
        } catch (e) {
          failedCompletions.push(tc);
          hasErrors = true;
        }
      }
      localStorage.setItem('offline_task_completions', JSON.stringify(failedCompletions));
    } catch (err) {
      console.error(err);
      hasErrors = true;
    }

    // 2. Daily updates
    try {
      const updates = JSON.parse(localStorage.getItem('offline_updates') || '[]');
      const failedUpdates = [];
      for (const upd of updates) {
        try {
          const formData = new FormData();
          formData.append('treeId', upd.treeId);
          formData.append('date', upd.date);
          formData.append('watered', String(upd.watered));
          formData.append('fertilizers', JSON.stringify(upd.fertilizers));
          formData.append('farmerId', upd.farmerId || 'unknown');
          if (upd.createdAt) {
            formData.append('createdAt', upd.createdAt);
          }
          if (upd.imageBlob) {
            const blobRes = await fetch(upd.imageBlob);
            const blob = await blobRes.blob();
            formData.append('image', blob, 'offline_photo.jpg');
          }

          const res = await fetch('/api/daily-update', { method: 'POST', body: formData });
          if (!res.ok) {
            failedUpdates.push(upd);
            hasErrors = true;
          }
        } catch (e) {
          failedUpdates.push(upd);
          hasErrors = true;
        }
      }
      localStorage.setItem('offline_updates', JSON.stringify(failedUpdates));
    } catch (err) {
      console.error(err);
      hasErrors = true;
    }

    // 3. Harvests
    try {
      const harvests = JSON.parse(localStorage.getItem('offline_harvests') || '[]');
      const failedHarvests = [];
      for (const h of harvests) {
        try {
          const res = await fetch('/api/harvests', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(h),
          });
          if (!res.ok) {
            failedHarvests.push(h);
            hasErrors = true;
          }
        } catch (e) {
          failedHarvests.push(h);
          hasErrors = true;
        }
      }
      localStorage.setItem('offline_harvests', JSON.stringify(failedHarvests));
    } catch (err) {
      console.error(err);
      hasErrors = true;
    }

    checkOfflineQueue();
    fetchTasks();
    setSyncing(false);
    isSyncingRef.current = false;
    globalSyncing = false;

    if (hasErrors) {
      alert('⚠️ Sync completed with errors. Some items failed to upload (the database/server might be unreachable) and remain stored locally.');
    } else {
      alert('All offline updates synced successfully!');
    }
  };

  const handleLogout = () => {
    document.cookie = 'farmer_token=; Max-Age=0; path=/';
    localStorage.removeItem('farmerAuth');
    router.replace('/login');
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-20">
      {/* Header */}
      <header className="px-4 py-6 bg-gray-900 border-b border-gray-800 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-green-400">Ayubowan, {farmerName}!</h1>
          <p className="text-xs text-gray-400 mt-0.5 font-medium">Farmer Dashboard</p>
        </div>
        <button
          onClick={handleLogout}
          className="p-2 rounded-lg bg-gray-800 hover:bg-red-900/40 text-gray-400 hover:text-red-400 transition"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      {/* Main Container */}
      <main className="max-w-md mx-auto p-4 space-y-6">

        {/* Offline Sync Widget */}
        {offlineCount > 0 && (
          <div className="bg-yellow-950/20 border border-yellow-900/50 p-4 rounded-xl flex items-center justify-between">
            <div className="space-y-0.5">
              <h2 className="text-sm font-semibold text-yellow-300">Offline Logs Pending</h2>
              <p className="text-xs text-gray-400">{offlineCount} item(s) stored locally.</p>
            </div>
            <button
              onClick={syncOfflineQueue}
              disabled={syncing}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-700/40 text-black font-semibold text-xs rounded-lg transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Syncing' : 'Sync Now'}</span>
            </button>
          </div>
        )}

        {/* Start Scanning QR Code Button (Main Action) */}
        <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl text-center space-y-4 shadow-lg">
          <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-green-950 text-green-400 mx-auto ring-1 ring-green-900/50">
            <QrCode className="w-9 h-9" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white">Scan Tree QR</h2>
            <p className="text-xs text-gray-400 max-w-xs mx-auto">
              Scan a tree's barcode tag to submit updates or record yield logs.
            </p>
          </div>
          {!isOnline && !hasCachedAssets ? (
            <div className="p-3.5 bg-red-950/40 border border-red-900/50 text-red-200 rounded-xl text-xs font-semibold space-y-2 text-left">
              <p className="flex items-center gap-1 text-sm font-bold text-red-400">⚠️ Offline Warning</p>
              <p className="text-[11px] text-gray-400 font-normal leading-relaxed">
                Your application has no local snapshot of fertilizers and pests. Please connect to the internet to initialize application data before you can scan trees.
              </p>
              <button
                disabled
                className="w-full py-2.5 bg-gray-800 text-gray-550 font-bold text-xs rounded-xl cursor-not-allowed border border-gray-850 mt-1"
              >
                Scanner Locked (Offline)
              </button>
            </div>
          ) : (
            <Link
              href="/qr-scan"
              className="block w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold text-sm rounded-xl transition shadow-lg shadow-green-950/30"
            >
              Start Scanner
            </Link>
          )}
        </div>

        {/* Tasks Checklist */}
        {loading ? (
          <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl flex justify-center items-center shadow-lg">
            <div className="w-5 h-5 border-3 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : tasks.length > 0 ? (
          <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl space-y-4 shadow-lg">
            <h2 className="text-base font-bold text-white border-b border-gray-800 pb-2 flex items-center gap-2">
              📋 Today's Assigned Tasks
            </h2>
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {tasks.map((task) => (
                <button
                  key={task._id}
                  onClick={() => handleToggleTask(task._id, task.completed)}
                  className="w-full text-left flex items-start gap-3 p-3 rounded-xl bg-gray-950/60 border border-gray-850 hover:bg-gray-900/50 transition cursor-pointer"
                >
                  <span className="mt-0.5 shrink-0">
                    {task.completed ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-555 hover:text-green-400 transition" />
                    )}
                  </span>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {task.treeId && (
                        <span className="font-semibold text-green-400 text-[10px] bg-green-950 px-1.5 py-0.2 rounded border border-green-900/60">
                          {task.treeId}
                        </span>
                      )}
                    </div>
                    <p className={`text-xs ${task.completed ? 'line-through text-gray-500' : 'text-gray-250 font-medium'}`}>
                      {task.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : null}

      </main>
    </div>
  );
}