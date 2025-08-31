// src/components/DailyUpdateForm.jsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import ImageUploader from './ImageUploader';

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
    fail: 'යැවීම අසාර්ථක විය. නැවත ശ്രമ කරන්න.',
    error: 'යැවීමේ අසාර්තකයි!',
    placeholderPest: 'තෝරන්න (ඕනෑම විටෙක හිස්ව තැබිය හැක)',
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
  },
};

export default function DailyUpdateForm({ treeId }) {
  // language state: Sinhala by default
  const [lang, setLang] = useState('si');
  const t = DICT[lang];

  if (!treeId || typeof treeId !== 'string') {
    return (
      <div className="text-red-500 text-center mt-4">
        {t.treeIdMissing}
      </div>
    );
  }

  // core state
  const [watered, setWatered] = useState(null); // true | false | null
  const [fertilizers, setFertilizers] = useState([]); // string[]
  const [availableFertilizers, setAvailableFertilizers] = useState([]);
  const [pestList, setPestList] = useState([]); // from /api/pests
  const [selectedPest, setSelectedPest] = useState(''); // optional
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const router = useRouter();
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  // load fertilizers
  useEffect(() => {
    fetch('/api/fertilizers')
      .then((res) => res.json())
      .then((data) => setAvailableFertilizers(data?.fertilizers ?? []))
      .catch(console.error);
  }, []);

  // load pests
  useEffect(() => {
    fetch('/api/pests')
      .then((res) => res.json())
      .then((data) => setPestList(data?.pests ?? []))
      .catch(console.error);
  }, []);

  // toggle fertilizer chips
  const toggleFertilizer = (value) => {
    setFertilizers((prev) =>
      prev.includes(value) ? prev.filter((f) => f !== value) : [...prev, value]
    );
  };

  // submit handler — keeps your existing /api/daily-update contract
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('treeId', treeId);
      formData.append('date', today);
      formData.append('watered', watered);
      formData.append('fertilizers', JSON.stringify(fertilizers));
      formData.append('pestNotes', selectedPest || ''); // optional
      if (imageFile) formData.append('image', imageFile);

      const res = await fetch('/api/daily-update', { method: 'POST', body: formData });

      if (res.ok) {
        alert(t.success);
        // reset minimal state
        setWatered(null);
        setFertilizers([]);
        setSelectedPest('');
        setImageFile(null);
        setSubmitting(false);
        router.push('/farmer');
      } else {
        alert('❌ ' + t.fail);
        setSubmitting(false);
      }
    } catch (err) {
      console.error(err);
      alert('❌ ' + t.error);
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-sm  ">
      {/* Language toggle */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setLang((prev) => (prev === 'si' ? 'en' : 'si'))}
          className="px-3 py-1 rounded-md bg-gray-800 border border-gray-700 text-gray-200 hover:bg-gray-700"
          aria-label="Switch language"
          title={`Switch to ${DICT[lang === 'si' ? 'en' : 'si'].langName}`}
        >
          {t.switch}
        </button>
      </div>

      <input type="hidden" name="treeId" value={treeId} />

      {/* Date (read-only) */}
      <div>
        <label className="block mb-1 text-gray-300">{t.date}</label>
        <input
          type="text"
          value={today}
          readOnly
          className="w-full rounded-lg bg-gray-800 text-white border border-gray-600 px-3 py-2"
        />
      </div>

      {/* Watered? */}
      <div>
        <label className="block mb-1 text-gray-300">{t.watered}</label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setWatered(true)}
            className={`px-4 py-2 rounded-lg ${watered ? 'bg-green-600' : 'bg-gray-700'}`}
          >
            {t.yes}
          </button>
          <button
            type="button"
            onClick={() => setWatered(false)}
            className={`px-4 py-2 rounded-lg ${watered === false ? 'bg-red-600' : 'bg-gray-700'}`}
          >
            {t.no}
          </button>
        </div>
      </div>

      {/* Fertilizers */}
      <div>
        <label className="block mb-1 text-gray-300">{t.fertilizers}</label>
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
        <label className="block mb-1 text-gray-300">{t.pest}</label>
        <select
          value={selectedPest}
          onChange={(e) => setSelectedPest(e.target.value)}
          className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2"
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

      {/* Image upload — icon-only trigger */}
      <div>
        <label className="block mb-1 text-gray-300">{t.uploadImage}</label>
        <ImageUploader onImageSelect={setImageFile} />
        {imageFile && (
          <p className="text-xs text-gray-500 mt-2">
            {t.selected}: <span className="text-gray-300">{imageFile.name}</span>
          </p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition"
      >
        {submitting ? t.submitting : t.submit}
      </button>
    </form>
  );
}
