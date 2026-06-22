'use client';

import { useState, useEffect } from 'react';
import { Settings, ShieldAlert, Check } from 'lucide-react';

export default function OwnerSettings() {
  const [settings, setSettings] = useState({ harvest_tracking_enabled: false });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        if (data.settings) {
          setSettings(data.settings);
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleToggle = async () => {
    setSaving(true);
    setSaveSuccess(false);
    const newValue = !settings.harvest_tracking_enabled;
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'harvest_tracking_enabled',
          value: newValue,
        }),
      });
      if (res.ok) {
        setSettings((prev) => ({ ...prev, harvest_tracking_enabled: newValue }));
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        alert('Failed to update settings');
      }
    } catch (err) {
      console.error(err);
      alert('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-green-400">Settings</h1>
        <p className="text-gray-400">Manage agricultural features and permissions for workers.</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <div className="w-6 h-6 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">
          <div className="flex items-center gap-3 border-b border-gray-800 pb-4">
            <Settings className="w-6 h-6 text-green-400" />
            <h2 className="text-xl font-semibold text-white">Feature Toggles</h2>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-gray-950/60 border border-gray-800 rounded-xl">
            <div className="space-y-1">
              <h3 className="text-lg font-medium text-white flex items-center gap-2">
                Yield & Harvest Tracking
              </h3>
              <p className="text-sm text-gray-400 max-w-xl">
                When enabled, the farmer is presented with a "Log Harvest" tab on scanned tree pages, allowing them to record the count of coconuts harvested. Turn this off to simplify the mobile view for regular maintenance.
              </p>
            </div>

            <div className="flex items-center">
              <button
                type="button"
                onClick={handleToggle}
                disabled={saving}
                className={`relative inline-flex h-6.5 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings.harvest_tracking_enabled ? 'bg-green-600' : 'bg-gray-800'
                }`}
                role="switch"
                aria-checked={settings.harvest_tracking_enabled}
              >
                <span
                  className={`pointer-events-none inline-block h-5.5 w-5.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    settings.harvest_tracking_enabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {saveSuccess && (
            <div className="flex items-center gap-2 text-green-400 bg-green-950/40 border border-green-900/60 p-3 rounded-lg text-sm animate-fade-in">
              <Check className="w-4 h-4" />
              <span>Settings updated successfully!</span>
            </div>
          )}

          <div className="flex items-start gap-3 p-4 bg-yellow-950/20 border border-yellow-900/40 rounded-xl text-yellow-300">
            <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="text-sm leading-relaxed">
              <span className="font-semibold text-white">Notice:</span> Feature changes take effect instantly for the farmer. If the worker has the app open, the new forms will be rendered on their next tree scan.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
