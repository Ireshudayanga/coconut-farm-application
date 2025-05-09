'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { QRCodeCanvas } from 'qrcode.react';
import html2canvas from 'html2canvas';

export default function FarmerPage() {
  const [newTreeId, setNewTreeId] = useState('');
  const [existingTreeId, setExistingTreeId] = useState('');
  const [generatedQR, setGeneratedQR] = useState('');
  const qrRef = useRef(null);

  const handleDownloadQR = async () => {
    if (!qrRef.current) return;

    const canvas = await html2canvas(qrRef.current, {
      backgroundColor: '#ffffff',
    });

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${generatedQR}_qr_with_text.png`;
    link.click();
  };

  return (
    <div className="min-h-screen w-full max-w-full bg-gray-950 text-white px-4 sm:px-6 py-10 overflow-x-hidden">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold sm:text-5xl mb-2">Farmer Dashboard</h1>
          <p className="text-gray-400 text-base sm:text-lg">Manage your trees with ease</p>
        </motion.div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Scan QR */}
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

          {/* Daily Update */}
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

        {/* Generate QR for New Tree */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900 border border-gray-700 rounded-xl p-6 sm:p-8 shadow-md"
        >
          <h2 className="text-2xl font-semibold mb-6">Generate QR for New Tree</h2>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <input
              type="text"
              value={newTreeId}
              onChange={(e) => setNewTreeId(e.target.value)}
              placeholder="Enter New Tree ID"
              className="flex-1 px-4 py-2 rounded-lg border border-gray-700 bg-gray-800 text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:outline-none"
            />
            <button
              onClick={async () => {
                if (!newTreeId.trim()) return;

                const confirm = window.confirm(`Do you want to create a new tree entry for ID "${newTreeId}"?`);

                if (!confirm) return;

                // Prepare form data
                const formData = new FormData();
                formData.append('treeId', newTreeId);
                formData.append('date', new Date().toISOString().slice(0, 10)); // yyyy-mm-dd
               
                try {
                  const res = await fetch('/api/tree', {
                    method: 'POST',
                    body: formData,
                  });

                  const result = await res.json();

                  if (result.ok) {
                    alert('Tree data uploaded successfully!');
                    setGeneratedQR(newTreeId);
                  } else {
                    alert('Failed to upload tree data.');
                  }
                } catch (err) {
                  console.error('Error uploading new tree:', err);
                  alert('Something went wrong while creating the tree.');
                }
              }}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition font-semibold"
            >
              Generate QR
            </button>

          </div>
        </motion.div>

        {/* Regenerate QR for Existing Tree */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900 border border-gray-700 rounded-xl p-6 sm:p-8 shadow-md"
        >
          <h2 className="text-2xl font-semibold mb-6">Regenerate QR for Existing Tree</h2>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <input
              type="text"
              value={existingTreeId}
              onChange={(e) => setExistingTreeId(e.target.value)}
              placeholder="Enter Tree ID (e.g., TREE-001)"
              className="flex-1 px-4 py-2 rounded-lg border border-gray-700 bg-gray-800 text-white placeholder-gray-500 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
            />
            <button
              onClick={async () => {
                if (!existingTreeId.trim()) return;
                const res = await fetch(`/api/tree?id=${existingTreeId}`);
                const data = await res.json();
                if (data.exists) {
                  setGeneratedQR(existingTreeId);
                } else {
                  alert('Tree ID not found in database.');
                }
              }}
              className="border border-amber-400 text-white px-6 py-2 rounded-lg hover:bg-yellow-600 transition font-semibold"
            >
              Regenerate QR
            </button>
          </div>
        </motion.div>

        {/* Shared QR Output Area */}
        {generatedQR && (
          <div className="flex flex-col items-center justify-center mt-10 space-y-6">
            <p className="text-white text-lg">
              QR Code for Tree ID: <span className="text-green-400 font-semibold">{generatedQR}</span>
            </p>

            <div
              ref={qrRef}
              style={{
                backgroundColor: '#ffffff',
                padding: '24px',
                borderRadius: '12px',
                border: '1px solid #ccc',
                textAlign: 'center',
                color: '#000',
                fontFamily: 'sans-serif',
              }}
            >
              <QRCodeCanvas value={generatedQR} size={200} />
              <p style={{ marginTop: '10px', fontWeight: 'bold', fontSize: '14px' }}>
                {generatedQR}
              </p>
            </div>

            <button
              onClick={handleDownloadQR}
              className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition font-medium"
            >
              Download QR Code
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
