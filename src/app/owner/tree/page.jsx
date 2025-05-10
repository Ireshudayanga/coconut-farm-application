'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TreePine, ArrowLeft, Trash2 } from 'lucide-react';




export default function AllTreesPage() {
  const [treeList, setTreeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchTrees = async () => {
      try {
        const res = await fetch('/api/tree/all');
        const data = await res.json();
        setTreeList(data.trees || []);
      } catch (err) {
        console.error('Failed to fetch trees:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrees();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pl-1">
        <h1 className="text-3xl font-bold text-green-400 mb-1"> All Trees</h1>
        <p className="text-gray-400 text-sm">Tap any card to view full tree history.</p>
      </div>

      {/* Tree Cards */}
      {loading ? (
        <div className="flex justify-center items-center py-10">
          <div className="w-6 h-6 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : treeList.length === 0 ? (
        <p className="text-gray-500">No trees found.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {treeList.map((tree) => (
            <Link
              key={tree.id}
              href={`/owner/tree/${tree.id}`}
              className="relative group block bg-gray-900 border border-gray-800 rounded-xl p-4 shadow hover:shadow-lg hover:border-green-600 transition duration-200"
            >
              {/* Delete button */}
              <button
                onClick={async (e) => {
                  e.preventDefault(); // prevent Link navigation
                  const confirm = window.confirm(`Delete ${tree.id}?`);
                  if (!confirm) return;

                  try {
                    const res = await fetch(`/api/tree?id=${tree.id}`, {
                      method: 'DELETE',
                    });
                    const data = await res.json();

                    if (data.ok) {
                      alert(`Tree ${tree.id} deleted successfully`);
                      setTreeList((prev) => prev.filter((t) => t.id !== tree.id));
                    } else {
                      alert(data.message || 'Failed to delete tree');
                    }
                  } catch (err) {
                    console.error('Delete failed', err);
                    alert('Delete error');
                  }
                }}
                className="absolute top-2 right-2 text-red-400 hover:text-red-600 z-10"
                title="Delete Tree"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {/* Tree icon */}
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-700 mb-3 mx-auto">
                <TreePine className="w-5 h-5 text-white" />
              </div>

              {/* Tree ID */}
              <h2 className="text-lg font-semibold text-center text-white group-hover:text-green-400">
                {tree.id}
              </h2>
              <p className="text-xs text-gray-500 text-center mt-1">View history</p>
            </Link>

          ))}
        </div>
      )}
    </div>
  );
}
