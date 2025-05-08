'use client';

import { useState } from 'react';

export default function ImageUploader({ onImageSelect }) {
  const [preview, setPreview] = useState(null);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      onImageSelect(file);
    }
  };

  return (
    <div className="space-y-2">
      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFile}
        className="block w-full text-sm text-white bg-gray-800 rounded-lg border border-gray-600 file:border-0 file:bg-gray-700 file:text-white"
      />
      {preview && (
        <img
          src={preview}
          alt="Preview"
          className="w-full h-48 object-cover rounded-lg border border-gray-500"
        />
      )}
    </div>
  );
}
