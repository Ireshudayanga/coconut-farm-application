'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import DailyUpdateForm from '@/components/DailyUpdateForm';

function TreeUpdatePage() {
  const params = useParams();
  const [treeId, setTreeId] = useState(null);

  useEffect(() => {
    if (params?.id && typeof params.id === 'string') {
      setTreeId(params.id);
    }
  }, [params]);

  if (!treeId) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400 text-base">
        Loading tree information...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4">
      <div className="max-w-xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-center">🌴 Update Tree: {treeId}</h1>
        <DailyUpdateForm treeId={treeId} />
      </div>
    </div>
  );
}

export default TreeUpdatePage;
