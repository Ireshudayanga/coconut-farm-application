// src/components/DailyUpdateForm.jsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import ImageUploader from './ImageUploader'; // updated icon-only version below

export default function DailyUpdateForm({ treeId }) {
  if (!treeId || typeof treeId !== 'string') {
    return (
      <div className="text-red-500 text-center mt-4">
        Tree ID is missing or invalid.
      </div>
    );
  }

  // core state
  const [watered, setWatered] = useState(null);
  const [fertilizers, setFertilizers] = useState([]); // unchanged
  const [availableFertilizers, setAvailableFertilizers] = useState([]);
  const [pestList, setPestList] = useState([]);  // fetched from /api/pests
  const [selectedPest, setSelectedPest] = useState(''); // dropdown selection (optional)
  const [pestsObserved, setPestsObserved] = useState(false); // one and only status flag
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false); // info bubble

  const router = useRouter();
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  // 1) load fertilizers (unchanged from your repo)
  useEffect(() => {
    fetch('/api/fertilizers')
      .then((res) => res.json())
      .then((data) => setAvailableFertilizers(data?.fertilizers ?? []))
      .catch(console.error);
  }, []);

  // 2) load pest options for dropdown (NEW)
  useEffect(() => {
    fetch('/api/pests')
      .then((res) => res.json())
      .then((data) => setPestList(data?.pests ?? []))
      .catch(console.error);
  }, []);

  // helper to toggle fertilizer chips
  const toggleFertilizer = (value) => {
    setFertilizers((prev) =>
      prev.includes(value) ? prev.filter((f) => f !== value) : [...prev, value]
    );
  };

  // submit handler — mirrors your existing /api/daily-update contract
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('treeId', treeId);
      formData.append('date', today);
      formData.append('watered', watered);
      formData.append('fertilizers', JSON.stringify(fertilizers));

      // pestNotes carries dropdown selection (or empty if none selected)
      formData.append('pestNotes', selectedPest || '');

      if (imageFile) formData.append('image', imageFile);

      const res = await fetch('/api/daily-update', { method: 'POST', body: formData });

      if (res.ok) {
        alert('Tree update submitted!');
        // reset minimal state
        setWatered(null);
        setFertilizers([]);
        setSelectedPest('');
        setPestsObserved(false);
        setImageFile(null);
        setSubmitting(false);
        router.push('/farmer');
      } else {
        alert('❌ Failed to submit. Try again.');
        setSubmitting(false);
      }
    } catch (err) {
      console.error(err);
      alert('❌ Error submitting form');
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-sm">
      <input type="hidden" name="treeId" value={treeId} />

      {/* Date (read-only) */}
      <div>
        <label className="block mb-1 text-gray-300">Date</label>
        <input
          type="text"
          value={today}
          readOnly
          className="w-full rounded-lg bg-gray-800 text-white border border-gray-600 px-3 py-2"
        />
      </div>

      {/* Watered? (unchanged UI) */}
      <div>
        <label className="block mb-1 text-gray-300">Watered?</label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setWatered(true)}
            className={`px-4 py-2 rounded-lg ${watered ? 'bg-green-600' : 'bg-gray-700'}`}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => setWatered(false)}
            className={`px-4 py-2 rounded-lg ${watered === false ? 'bg-red-600' : 'bg-gray-700'}`}
          >
            No
          </button>
        </div>
      </div>

      {/* Fertilizers (chips, unchanged logic) */}
      <div>
        <label className="block mb-1 text-gray-300">Fertilizers</label>
        <div className="flex flex-wrap gap-3">
          {availableFertilizers.map((f) => (
            <label key={f} className="flex items-center gap-2 text-white">
              <input
                type="checkbox"
                value={f}
                checked={fertilizers.includes(f)}
                onChange={() => toggleFertilizer(f)}
                className="accent-green-500"
              />
              <span>{f}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Pest/Disease (dropdown from DB) — optional */}
      <div>
        <label className="block mb-1 text-gray-300">Pest / Disease</label>
        <select
          value={selectedPest}
          onChange={(e) => setSelectedPest(e.target.value)}
          className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2"
        >
          <option value="">None</option>
          {pestList.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1">
          This field is optional. Leave blank if nothing observed.
        </p>
      </div>


      {/* Image upload — icon-only trigger */}
      <div>
        <label className="block mb-1 text-gray-300">Upload Image</label>
        <ImageUploader onImageSelect={setImageFile} />
        {imageFile && (
          <p className="text-xs text-gray-500 mt-2">
            Selected: <span className="text-gray-300">{imageFile.name}</span>
          </p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition"
      >
        {submitting ? 'Submitting...' : 'Submit Update'}
      </button>
    </form>
  );
}
