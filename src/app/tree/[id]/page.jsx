'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import DailyUpdateForm from '@/components/DailyUpdateForm';
import { motion } from 'framer-motion';

export default function TreeUpdatePage() {
  const params = useParams();
  const [treeId, setTreeId] = useState(null);
  const [isValidTree, setIsValidTree] = useState(null);
  const [dateTime, setDateTime] = useState({

    date: '',
    time: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      if (params?.id && typeof params.id === 'string') {
        setTreeId(params.id);

        try {
          const res = await fetch(`/api/tree?id=${params.id}`);
          const data = await res.json();

          setIsValidTree(data.exists);
        } catch (error) {
          console.error('Error validating tree ID:', error);
          setIsValidTree(false);
        }

        const now = new Date();
        setDateTime({
          date: now.toISOString().slice(0, 10),
          time: now.toTimeString().slice(0, 5),
        });
      }
    };

    fetchData();
  }, [params]);

  if (!treeId || isValidTree === null) {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-400 flex items-center justify-center text-base">
        Checking tree information...
      </div>
    );
  }

  if (!isValidTree) {
    return (
      <div className="min-h-screen bg-gray-950 text-red-400 flex items-center justify-center text-center px-4 text-base">
       Tree ID not found. Please check the link or contact support.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 py-10 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-green-400">
            🌴 Tree Update
          </h1>
          <p className="text-gray-400 text-sm sm:text-base mt-2">
            Tree ID: <span className="text-white font-semibold">{treeId}</span>
          </p>
          <p className="text-gray-500 text-xs mt-1">
            Date: {dateTime.date} • Time: {dateTime.time}
          </p>
        </motion.div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-md p-6 sm:p-8 space-y-6">
          <DailyUpdateForm treeId={treeId} date={dateTime.date} time={dateTime.time} />
        </div>
      </div>
    </div>
  );
}
