'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import QRCode from 'qrcode';

export default function FarmerPage() {
  const [newTreeId, setNewTreeId] = useState('');
  const [existingTreeId, setExistingTreeId] = useState('');
  const [generatedQR, setGeneratedQR] = useState('');
  const [lastTreeNumber, setLastTreeNumber] = useState(0);
  const [svgDataUrl, setSvgDataUrl] = useState('');

  useEffect(() => {
    const fetchLastTree = async () => {
      try {
        const res = await fetch('/api/tree/last');
        const data = await res.json();
        setLastTreeNumber(data.lastNumber);
      } catch (err) {
        console.error('Failed to fetch last tree number', err);
      }
    };
    fetchLastTree();
  }, []);

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
    <div className="min-h-screen w-full max-w-full bg-gray-950 text-white px-4 sm:px-6 py-10 overflow-x-hidden">
      <div className="max-w-6xl mx-auto space-y-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold sm:text-5xl mb-2">Farmer Dashboard</h1>
          <p className="text-gray-400 text-base sm:text-lg">Manage your trees with ease</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="bg-gray-900 border border-gray-700 p-6 rounded-xl shadow-md flex flex-col"
          >
            <h2 className="text-xl font-semibold mb-4">Scan Tree QR</h2>
            <p className="text-gray-400 text-sm mb-6">
              Use your mobile camera to scan the QR code on a tree and submit updates quickly.
            </p>
            <Link
              href="/qr-scan"
              className="mt-auto bg-green-600 text-white text-center py-2 rounded-lg hover:bg-green-700 transition font-semibold block"
            >
              Start Scanning
            </Link>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.01 }}
            className="bg-gray-900 border border-gray-700 p-6 rounded-xl shadow-md flex flex-col"
          >
            <h2 className="text-xl font-semibold mb-4">Daily Update Form</h2>
            <p className="text-gray-400 text-sm mb-6">
              Enter daily details like watering status, medicine, and pest/disease notes manually.
            </p>
            <Link
              href="/daily-update"
              className="mt-auto bg-yellow-500 text-white text-center py-2 rounded-lg hover:bg-yellow-600 transition font-semibold block"
            >
              Fill Form
            </Link>
          </motion.div>
        </div>

      
      </div>
    </div>
  );
}
