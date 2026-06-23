// src/components/DailyUpdateForm.jsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import ImageUploader from './ImageUploader';

// Native HTML5 Canvas image compression helper (Zero npm dependency, works offline)
const compressImage = (file, maxWidth = 1024, maxHeight = 1024, quality = 0.7) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Canvas toBlob failed'));
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

// Simple i18n dictionary (Sinhala default)
const DICT = {
  si: {
    langName: 'සිංහල',
    switch: 'English',
    date: 'දිනය',
    watered: 'ජලය දැමුවාද?',
    yes: 'ඔව්',
    no: 'නැහැ',
    fertilizers: 'පොහොර',
    pest: 'පීඩක / රෝග',
    pestOptionalHint: 'ඕනෑම විටෙක හිස්ව තැබිය හැක.',
    none: 'නැත',
    uploadImage: 'රූපයක් උඩුගත කරන්න',
    selected: 'තෝරාගත්',
    submit: 'යාවත්කාල කිරීම යවන්න',
    submitting: 'යැවෙමින්...',
    treeIdMissing: 'වෘක්ෂ ID එක අස්ථානගතයි හෝ වැරදියි.',
    success: 'වෘක්ෂ යාවත්කාල කිරීම සාර්ථකයි!',
    fail: 'යැවීම අසාර්ථක විය. නැවත උත්සාහ කරන්න.',
    error: 'යැවීමේ දෝෂයක්!',
    placeholderPest: 'තෝරන්න (ඕනෑම විටෙක හිස්ව තැබිය හැක)',
    dailyLog: 'දෛනික සටහන',
    harvestLog: 'අස්වැන්න සටහන',
    nutsCount: 'නෙළන ලද පොල් ගණන',
    harvestSuccess: 'අස්වැන්න සාර්ථකව සටහන් කරන ලදී!',
    submitHarvest: 'අස්වැන්න සටහන් කරන්න',
  },
  en: {
    langName: 'English',
    switch: 'සිංහල',
    date: 'Date',
    watered: 'Watered?',
    yes: 'Yes',
    no: 'No',
    fertilizers: 'Fertilizers',
    pest: 'Pest / Disease',
    pestOptionalHint: 'Optional — can be left empty.',
    none: 'None',
    uploadImage: 'Upload Image',
    selected: 'Selected',
    submit: 'Submit Update',
    submitting: 'Submitting...',
    treeIdMissing: 'Tree ID is missing or invalid.',
    success: 'Tree update submitted!',
    fail: 'Failed to submit. Try again.',
    error: 'Error submitting form.',
    placeholderPest: 'Select (optional)',
    dailyLog: 'Daily Log',
    harvestLog: 'Log Harvest',
    nutsCount: 'Nuts Harvested',
    harvestSuccess: 'Harvest logged successfully!',
    submitHarvest: 'Log Harvest',
  },
};

export default function DailyUpdateForm({ treeId }) {
  const [lang, setLang] = useState('si');
  const t = DICT[lang];

  // Tab State
  const [activeTab, setActiveTab] = useState('daily'); // 'daily' | 'harvest'
  const [harvestEnabled, setHarvestEnabled] = useState(false);

  // Daily Log State
  const [watered, setWatered] = useState(null); // true | false | null
  const [fertilizers, setFertilizers] = useState([]); // string[]
  const [availableFertilizers, setAvailableFertilizers] = useState([]);
  const [pestList, setPestList] = useState([]); // from /api/pests
  const [selectedPest, setSelectedPest] = useState(''); // optional
  const [imageFile, setImageFile] = useState(null);

  // Harvest Log State
  const [nutsCount, setNutsCount] = useState('');

  // Common State
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Fetch Settings
  useEffect(() => {
    // 1. Initial load from cache
    try {
      const cached = localStorage.getItem('cached_settings');
      if (cached) {
        const settings = JSON.parse(cached);
        setHarvestEnabled(!!settings.harvest_tracking_enabled);
      }
    } catch (e) {
      console.error('Failed to load cached settings:', e);
    }

    // 2. Fetch from network
    fetch('/api/settings')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch settings');
        return res.json();
      })
      .then((data) => {
        if (data && data.settings) {
          setHarvestEnabled(!!data.settings.harvest_tracking_enabled);
          localStorage.setItem('cached_settings', JSON.stringify(data.settings));
        }
      })
      .catch(console.error);
  }, []);

  // Load fertilizers
  useEffect(() => {
    // 1. Initial load from cache
    try {
      const cached = localStorage.getItem('cached_fertilizers');
      if (cached) {
        setAvailableFertilizers(JSON.parse(cached));
      }
    } catch (e) {
      console.error('Failed to load cached fertilizers:', e);
    }

    // 2. Fetch from network
    fetch('/api/fertilizers')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch fertilizers');
        return res.json();
      })
      .then((data) => {
        if (data && Array.isArray(data.fertilizers)) {
          setAvailableFertilizers(data.fertilizers);
          localStorage.setItem('cached_fertilizers', JSON.stringify(data.fertilizers));
        }
      })
      .catch(console.error);
  }, []);

  // Load pests
  useEffect(() => {
    // 1. Initial load from cache
    try {
      const cached = localStorage.getItem('cached_pests');
      if (cached) {
        setPestList(JSON.parse(cached));
      }
    } catch (e) {
      console.error('Failed to load cached pests:', e);
    }

    // 2. Fetch from network
    fetch('/api/pests')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch pests');
        return res.json();
      })
      .then((data) => {
        if (data && Array.isArray(data.pests)) {
          setPestList(data.pests);
          localStorage.setItem('cached_pests', JSON.stringify(data.pests));
        }
      })
      .catch(console.error);
  }, []);

  // Toggle fertilizer chips
  const toggleFertilizer = (value) => {
    setFertilizers((prev) =>
      prev.includes(value) ? prev.filter((f) => f !== value) : [...prev, value]
    );
  };

  const queueDailyOffline = async (farmerId) => {
    try {
      let imageBlob = null;
      if (imageFile) {
        let fileToStore = imageFile;
        try {
          fileToStore = await compressImage(imageFile, 800, 800, 0.6);
        } catch (compErr) {
          console.error('Offline image compression failed, using original:', compErr);
        }
        imageBlob = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(fileToStore);
        });
      }
      const offlineQueue = JSON.parse(localStorage.getItem('offline_updates') || '[]');
      offlineQueue.push({
        treeId,
        date: today,
        watered,
        fertilizers,
        farmerId,
        imageBlob,
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem('offline_updates', JSON.stringify(offlineQueue));

      alert(lang === 'si' ? 'Offline: නැවත අන්තර්ජාල සබදතාවය ඇති වූ පසු යාවත්කාලීන වේ. එතෙක් දුරකතනයේ ගබඩාකරගනු ලබයි.' : 'Offline: Update saved locally. It will auto-sync when network is restored.');
      setSubmitting(false);
      window.location.href = '/farmer';
    } catch (err) {
      console.error('Offline save failed:', err);
      alert('Failed to save update locally.');
      setSubmitting(false);
    }
  };

  const queueHarvestOffline = async (payload) => {
    try {
      const offlineQueue = JSON.parse(localStorage.getItem('offline_harvests') || '[]');
      offlineQueue.push(payload);
      localStorage.setItem('offline_harvests', JSON.stringify(offlineQueue));

      alert(lang === 'si' ? 'Offline: නැවත අන්තර්ජාල සබදතාවය ඇති වූ පසු යාවත්කාලීන වේ. එතෙක් දුරකතනයේ ගබඩාකරගනු ලබයි.' : 'Offline: Harvest logged locally. It will auto-sync when network is restored.');
      setSubmitting(false);
      window.location.href = '/farmer';
    } catch (err) {
      console.error('Offline save failed:', err);
      alert('Failed to save harvest locally.');
      setSubmitting(false);
    }
  };

  // Submit Daily Log
  const handleDailySubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    if (watered === null) {
      alert(lang === 'si' ? 'කරුණාකර ජලය දැමුවාද යන්න තෝරන්න.' : 'Please select if the tree was watered.');
      return;
    }
    setSubmitting(true);

    // Retrieve unique farmer username
    let farmerId = 'unknown';
    try {
      const auth = localStorage.getItem('farmerAuth');
      if (auth) {
        farmerId = JSON.parse(auth).username || 'unknown';
      }
    } catch (err) {
      console.error(err);
    }

    if (!navigator.onLine) {
      await queueDailyOffline(farmerId);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('treeId', treeId);
      formData.append('date', today);
      formData.append('watered', watered);
      formData.append('fertilizers', JSON.stringify(fertilizers));
      formData.append('pestNotes', selectedPest || '');
      formData.append('farmerId', farmerId);
      if (imageFile) {
        let fileToSend = imageFile;
        try {
          fileToSend = await compressImage(imageFile, 1024, 1024, 0.7);
        } catch (compErr) {
          console.error('Online image compression failed, using original:', compErr);
        }
        formData.append('image', fileToSend);
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500); // 1.5s fast timeout

      const res = await fetch('/api/daily-update', { 
        method: 'POST', 
        body: formData,
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        alert(t.success);
        router.push('/farmer');
      } else {
        console.warn('Server error during submit. Saving to offline queue.');
        await queueDailyOffline(farmerId);
      }
    } catch (err) {
      console.error('Fetch exception during submit, falling back to offline queue:', err);
      await queueDailyOffline(farmerId);
    }
  };

  // Submit Harvest Log
  const handleHarvestSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    if (!nutsCount || isNaN(nutsCount) || Number(nutsCount) < 0) {
      alert(lang === 'si' ? 'කරුණාකර වලංගු පොල් ගණනක් ඇතුළත් කරන්න.' : 'Please enter a valid count of nuts.');
      return;
    }
    setSubmitting(true);

    // Retrieve unique farmer username
    let farmerId = 'unknown';
    try {
      const auth = localStorage.getItem('farmerAuth');
      if (auth) {
        farmerId = JSON.parse(auth).username || 'unknown';
      }
    } catch (err) {
      console.error(err);
    }

    const payload = {
      treeId,
      nutsCount: Number(nutsCount),
      date: today,
      farmerId,
      createdAt: new Date().toISOString(),
    };

    if (!navigator.onLine) {
      await queueHarvestOffline(payload);
      return;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1000); // 1s fast timeout

      const res = await fetch('/api/harvests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        alert(t.harvestSuccess);
        router.push('/farmer');
      } else {
        console.warn('Server error during submit. Saving harvest to offline queue.');
        await queueHarvestOffline(payload);
      }
    } catch (err) {
      console.error('Fetch exception during submit, falling back to offline queue:', err);
      await queueHarvestOffline(payload);
    }
  };

  if (!treeId || typeof treeId !== 'string') {
    return <div className="text-red-500 text-center mt-4">{t.treeIdMissing}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header Controls: Lang Switch & Optional Tabs */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        {/* Navigation Tabs (Only if enabled by owner) */}
        {harvestEnabled ? (
          <div className="flex bg-gray-950 p-1 rounded-xl border border-gray-800 self-start">
            <button
              onClick={() => setActiveTab('daily')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${activeTab === 'daily' ? 'bg-green-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
            >
              {t.dailyLog}
            </button>
            <button
              onClick={() => setActiveTab('harvest')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${activeTab === 'harvest' ? 'bg-green-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
            >
              {t.harvestLog}
            </button>
          </div>
        ) : (
          <div className="text-xs font-semibold text-green-400 bg-green-950/40 border border-green-900/60 px-3 py-1.5 rounded-lg">
            🌴 {DICT[lang].dailyLog}
          </div>
        )}

        {/* Language switch */}
        <button
          type="button"
          onClick={() => setLang((prev) => (prev === 'si' ? 'en' : 'si'))}
          className="px-3 py-1 text-xs rounded-md bg-gray-800 border border-gray-700 text-gray-200 hover:bg-gray-700 self-end sm:self-auto cursor-pointer"
        >
          {t.switch}
        </button>
      </div>

      {activeTab === 'daily' ? (
        <form onSubmit={handleDailySubmit} className="space-y-5 text-sm">
          {/* Date (read-only) */}
          <div>
            <label className="block mb-1 text-gray-400 font-medium">{t.date}</label>
            <input
              type="text"
              value={today}
              readOnly
              className="w-full rounded-lg bg-gray-950 text-white border border-gray-850 px-3 py-2 outline-none"
            />
          </div>

          {/* Watered? */}
          <div>
            <label className="block mb-1 text-gray-400 font-medium">{t.watered}</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setWatered(true)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition border cursor-pointer ${watered === true
                    ? 'bg-green-600 text-white border-green-500'
                    : 'bg-gray-950 text-gray-400 border-gray-850 hover:text-white'
                  }`}
              >
                {t.yes}
              </button>
              <button
                type="button"
                onClick={() => setWatered(false)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition border cursor-pointer ${watered === false
                    ? 'bg-red-650 text-white border-red-500'
                    : 'bg-gray-950 text-gray-400 border-gray-850 hover:text-white'
                  }`}
              >
                {t.no}
              </button>
            </div>
          </div>

          {/* Fertilizers */}
          <div>
            <label className="block mb-2 text-gray-400 font-medium">{t.fertilizers}</label>
            <div className="flex flex-wrap gap-2.5">
              {availableFertilizers.map((f) => (
                <label
                  key={f}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition select-none ${fertilizers.includes(f)
                      ? 'bg-green-950/60 text-green-300 border-green-800/80'
                      : 'bg-gray-950 text-gray-400 border-gray-850 hover:border-gray-700'
                    }`}
                >
                  <input
                    type="checkbox"
                    value={f}
                    checked={fertilizers.includes(f)}
                    onChange={() => toggleFertilizer(f)}
                    className="sr-only"
                  />
                  <span>{f}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Pest/Disease */}
          <div>
            <label className="block mb-1 text-gray-400 font-medium">{t.pest}</label>
            <select
              value={selectedPest}
              onChange={(e) => setSelectedPest(e.target.value)}
              className="w-full bg-gray-950 text-white border border-gray-850 rounded-lg px-3 py-2 focus:border-green-500 outline-none"
            >
              <option value="">{t.none}</option>
              {pestList.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">{t.pestOptionalHint}</p>
          </div>

          {/* Image upload */}
          <div className="space-y-1">
            <label className="block text-gray-400 font-medium">{t.uploadImage}</label>
            <ImageUploader onImageSelect={setImageFile} />
            {imageFile && (
              <p className="text-xs text-gray-400">
                {t.selected}: <span className="text-white font-medium">{imageFile.name}</span>
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-800/40 text-white py-3 rounded-xl font-bold text-sm transition shadow-lg shadow-green-950/20 cursor-pointer"
          >
            {submitting ? t.submitting : t.submit}
          </button>
        </form>
      ) : (
        <form onSubmit={handleHarvestSubmit} className="space-y-5 text-sm">
          {/* Date (read-only) */}
          <div>
            <label className="block mb-1 text-gray-400 font-medium">{t.date}</label>
            <input
              type="text"
              value={today}
              readOnly
              className="w-full rounded-lg bg-gray-950 text-white border border-gray-850 px-3 py-2 outline-none"
            />
          </div>

          {/* Coconuts Harvested Count */}
          <div>
            <label className="block mb-1 text-gray-400 font-medium">{t.nutsCount}</label>
            <input
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              min="0"
              placeholder="e.g. 15"
              value={nutsCount}
              onChange={(e) => setNutsCount(e.target.value.replace(/\D/g, ''))}
              required
              className="w-full rounded-lg bg-gray-950 text-white border border-gray-850 px-3 py-2 outline-none focus:border-green-500"
            />
          </div>

          {/* Submit Harvest */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-800/40 text-white py-3 rounded-xl font-bold text-sm transition shadow-lg shadow-green-950/20 cursor-pointer"
          >
            {submitting ? t.submitting : t.submitHarvest}
          </button>
        </form>
      )}
    </div>
  );
}
