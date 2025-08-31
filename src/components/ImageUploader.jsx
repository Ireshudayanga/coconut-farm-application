// src/components/ImageUploader.jsx
"use client";

import { useRef } from "react";
import { Upload } from "lucide-react";

// Minimal inline SVG to avoid extra deps. You can also swap to lucide-react's <Image /> icon if you already use it.
const CameraIcon = (props) => (
  <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" {...props}>
    <path
      d="M20 7h-3.2l-1.2-2H8.4L7.2 7H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Zm-8 11a5 5 0 1 1 0-10 5 5 0 0 1 0 10Zm0-2a3 3 0 1 0 .001-6.001A3 3 0 0 0 12 16Z"
      fill="currentColor"
    />
  </svg>
);

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
