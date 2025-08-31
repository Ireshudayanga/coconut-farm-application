// src/app/owner/qr/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import QRCode from 'qrcode';

export default function OwnerQrPage() {
  const [newTreeId, setNewTreeId] = useState('');
  const [existingTreeId, setExistingTreeId] = useState('');
  const [generatedQR, setGeneratedQR] = useState('');
  const [lastTreeNumber, setLastTreeNumber] = useState(0);
  const [svgDataUrl, setSvgDataUrl] = useState('');

  // fetch last numeric id to suggest next one
  const fetchLastTree = async () => {
    try {
      const res = await fetch('/api/tree/last');
      const data = await res.json();
      setLastTreeNumber(data.lastNumber || 0);
    } catch (err) {
      console.error('Failed to fetch last tree number', err);
    }
  };

  useEffect(() => {
    fetchLastTree();
  }, []);

  // generate QR SVG with label at top and TREE-xxx at bottom
  const generateSvgQr = async (treeId) => {
    try {
      const rawSvg = await QRCode.toString(treeId, {
        type: 'svg',
        errorCorrectionLevel: 'H',
      });

      const qrContent = rawSvg
        .replace(/^.*?<svg[^>]*?>/s, '')
        .replace(/<\/svg>.*$/s, '');

      const finalSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="300" height="400" viewBox="0 0 300 400">
          <style>
            .label { font: bold 18px sans-serif; fill: black; text-anchor: middle; }
          </style>
          <text x="150" y="40" class="label">🌿 Coconut Tree Tag</text>
          <g transform="translate(0,45) scale(10.8)">
            ${qrContent}
          </g>
          <text x="150" y="380" class="label">${treeId}</text>
        </svg>
      `;
      const blob = new Blob([finalSvg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      setSvgDataUrl(url);
    } catch (err) {
      console.error('QR generation failed:', err);
      alert('QR generation failed.');
    }
  };

  const handleSvgDownload = () => {
    if (!svgDataUrl || !generatedQR) return;
    const link = document.createElement('a');
    link.href = svgDataUrl;
    link.download = `${generatedQR}.svg`;
    link.click();
  };

  const handlePngDownload = () => {
    if (!svgDataUrl || !generatedQR) return;
    const img = new Image();
    img.src = svgDataUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 300;
      canvas.height = 400;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const pngUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = pngUrl;
      link.download = `${generatedQR}.png`;
      link.click();
    };
  };

  return (
    <div className="min-h-screen w-full bg-gray-950 text-white px-4 sm:px-6 py-10">
      <div className="max-w-5xl mx-auto space-y-10">
        <header className="space-y-1">
          <h1 className="text-3xl font-bold text-green-400">QR Codes</h1>
          <p className="text-gray-400">Create and regenerate QR codes for tree tags</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Generate for NEW tree */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900 border border-gray-700 rounded-xl p-6 sm:p-8 shadow-md"
          >
            <h2 className="text-2xl font-semibold mb-6">Generate QR for New Tree</h2>
            <div className="flex flex-col w-full">
              <div className="flex items-center border border-gray-700 bg-gray-800 rounded-lg overflow-hidden">
                <span className="px-3 text-gray-400 bg-gray-900 border-r border-gray-700">TREE-</span>
                <input
                  type="text"
                  value={newTreeId}
                  onChange={(e) => setNewTreeId(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter number"
                  className="flex-1 px-4 py-2 bg-transparent text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>

              <p className="text-sm text-gray-500 mt-1 pl-1">
                Suggested next ID:{' '}
                <span className="text-green-400 font-medium">
                  TREE-{String(lastTreeNumber + 1).padStart(3, '0')}
                </span>
              </p>

              <button
                onClick={async () => {
                  if (!newTreeId.trim()) return;
                  const fullTreeId = `TREE-${newTreeId.padStart(3, '0')}`;
                  if (!window.confirm(`Create new tree with ID "${fullTreeId}"?`)) return;

                  // minimal record via /api/tree (same API you already have)
                  const formData = new FormData();
                  formData.append('treeId', fullTreeId);
                  formData.append('date', new Date().toISOString().slice(0, 10));

                  try {
                    const res = await fetch('/api/tree', { method: 'POST', body: formData });
                    const result = await res.json();
                    if (result.ok) {
                      alert(`New tree entry created with ID: ${fullTreeId}`);
                      fetchLastTree();
                      setNewTreeId('');
                      setGeneratedQR(fullTreeId);
                      generateSvgQr(fullTreeId);
                    } else {
                      alert(result.message || 'Failed to create tree.');
                    }
                  } catch (err) {
                    console.error('Create tree error:', err);
                    alert('Error creating tree.');
                  }
                }}
                className="mt-4 w-full bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition font-semibold"
              >
                Generate QR
              </button>
            </div>
          </motion.div>

          {/* Regenerate for EXISTING tree */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900 border border-gray-700 rounded-xl p-6 sm:p-8 shadow-md"
          >
            <h2 className="text-2xl font-semibold mb-6">Regenerate QR for Existing Tree</h2>
            <div className="flex flex-col w-full">
              <div className="flex items-center border border-gray-700 bg-gray-800 rounded-lg overflow-hidden">
                <span className="px-3 text-gray-400 bg-gray-900 border-r border-gray-700">TREE-</span>
                <input
                  type="text"
                  value={existingTreeId}
                  onChange={(e) => setExistingTreeId(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter number"
                  className="flex-1 px-4 py-2 bg-transparent text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>

              <button
                onClick={async () => {
                  if (!existingTreeId.trim()) return;
                  const fullId = `TREE-${existingTreeId.padStart(3, '0')}`;
                  const res = await fetch(`/api/tree?id=${fullId}`);
                  const data = await res.json();

                  if (data.exists) {
                    setGeneratedQR(fullId);
                    generateSvgQr(fullId);
                  } else {
                    alert('Tree ID not found in database.');
                  }
                }}
                className="mt-4 w-full border border-amber-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 transition font-semibold"
              >
                Regenerate QR
              </button>
            </div>
          </motion.div>
        </div>

        {/* QR Preview & Downloads */}
        {svgDataUrl && generatedQR && (
          <div className="flex flex-col items-center justify-center mt-4 space-y-6">
            <p className="text-white text-lg">
              QR Code for Tree ID: <span className="text-green-400 font-semibold">{generatedQR}</span>
            </p>

            <div className="bg-white p-4 rounded shadow border w-fit text-black text-center">
              <img src={svgDataUrl} alt="Tree QR Code" width={300} height={400} />
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleSvgDownload}
                className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition font-medium"
              >
                Download SVG
              </button>

              <button
                onClick={handlePngDownload}
                className="bg-amber-600 text-white px-5 py-2 rounded-md hover:bg-amber-700 transition font-medium"
              >
                Download PNG
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
