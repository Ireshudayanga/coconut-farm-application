// src/components/ImageUploader.jsx
"use client";

import { useRef } from "react";
import { Upload } from "lucide-react";

export default function ImageUploader({ onImageSelect }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && onImageSelect) onImageSelect(file);
  };

  return (
    <div className="flex items-center gap-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 px-3 py-2 rounded-lg transition"
      >
        <Upload className="w-5 h-5" aria-hidden="true" />
        <span className="sr-only">Choose image</span>
      </button>
      <span className="text-xs text-gray-500">
        Tap the icon to pick a photo
      </span>
    </div>
  );
}
