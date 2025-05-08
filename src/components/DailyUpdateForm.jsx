'use client';

import { useState } from 'react';
import ImageUploader from './ImageUploader';

export default function DailyUpdateForm({ treeId }) {
  if (!treeId || typeof treeId !== 'string') {
    return (
      <div className="text-red-500 text-center mt-4">
        ❌ Tree ID is missing or invalid.
      </div>
    );
  }
  
  const [watered, setWatered] = useState(null);
  const [fertilizers, setFertilizers] = useState([]);
  const [pestNotes, setPestNotes] = useState('');
  const [notes, setNotes] = useState('');
  const [flags, setFlags] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const flagOptions = ['🌴', '🐛', '⚠️', '🌧️'];

  const toggleFlag = (flag) => {
    setFlags((prev) =>
      prev.includes(flag) ? prev.filter((f) => f !== flag) : [...prev, flag]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData();
    formData.append('treeId', treeId);
    formData.append('date', today);
    formData.append('watered', watered);
    formData.append('fertilizers', JSON.stringify(fertilizers));
    formData.append('pestNotes', pestNotes);
    formData.append('notes', notes);
    formData.append('flags', JSON.stringify(flags));
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      const res = await fetch('/api/daily-update', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        alert('✅ Tree update submitted!');
      } else {
        alert('❌ Failed to submit. Try again.');
      }
    } catch (err) {
      console.error(err);
      alert('❌ Error submitting form');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-sm">
      <input type="hidden" name="treeId" value={treeId} />
      <div>
        <label className="block mb-1 text-gray-300">Date</label>
        <input
          type="text"
          value={today}
          readOnly
          className="w-full rounded-lg bg-gray-800 text-white border border-gray-600 px-3 py-2"
        />
      </div>

      <div>
        <label className="block mb-1 text-gray-300">Watered?</label>
        <div className="flex space-x-4">
          <button type="button" onClick={() => setWatered(true)} className={`px-4 py-2 rounded-lg ${watered ? 'bg-green-600' : 'bg-gray-700'}`}>Yes</button>
          <button type="button" onClick={() => setWatered(false)} className={`px-4 py-2 rounded-lg ${watered === false ? 'bg-red-600' : 'bg-gray-700'}`}>No</button>
        </div>
      </div>

      <div>
        <label className="block mb-1 text-gray-300">Fertilizers</label>
        <select
          multiple
          className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg p-2"
          onChange={(e) =>
            setFertilizers(Array.from(e.target.selectedOptions).map((o) => o.value))
          }
        >
          <option value="Urea">Urea</option>
          <option value="Compost">Compost</option>
          <option value="NPK">NPK</option>
          <option value="Organic Mix">Organic Mix</option>
        </select>
      </div>

      <div>
        <label className="block mb-1 text-gray-300">Pest / Disease Notes</label>
        <input
          type="text"
          value={pestNotes}
          onChange={(e) => setPestNotes(e.target.value)}
          className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2"
        />
      </div>

      <div>
        <label className="block mb-1 text-gray-300">General Notes</label>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2"
        />
      </div>

      <div>
        <label className="block mb-1 text-gray-300">Status Flags</label>
        <div className="flex flex-wrap gap-2">
          {flagOptions.map((flag) => (
            <button
              key={flag}
              type="button"
              onClick={() => toggleFlag(flag)}
              className={`px-3 py-2 rounded-full text-xl ${flags.includes(flag) ? 'bg-blue-600' : 'bg-gray-700'}`}
            >
              {flag}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block mb-1 text-gray-300">Upload Image</label>
        <ImageUploader onImageSelect={setImageFile} />
      </div>

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
