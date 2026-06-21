'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TreePine, ArrowLeft, Trash2, AlertTriangle, X } from 'lucide-react';

export default function AllTreesPage() {
  const [treeList, setTreeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [treeToDelete, setTreeToDelete] = useState(null);
  const [warningChecked, setWarningChecked] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
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
                onClick={(e) => {
                  e.preventDefault(); // prevent Link navigation
                  e.stopPropagation();
                  setTreeToDelete(tree);
                  setWarningChecked(false);
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

      {/* Deletion Warning Modal */}
      {treeToDelete && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            {/* Close button */}
            <button
              onClick={() => setTreeToDelete(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 text-red-400">
              <div className="p-2 bg-red-950/50 rounded-lg">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Delete {treeToDelete.id}?</h3>
            </div>

            <p className="text-sm text-gray-400 leading-relaxed">
              This action is <span className="text-red-400 font-semibold">permanent</span> and cannot be undone. 
              It will permanently delete the tree record along with all daily updates, watering logs, and fertilizer history.
            </p>

            <div className="bg-gray-950/50 border border-gray-800/80 rounded-xl p-4">
              <label className="flex items-start space-x-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="mt-1 w-4 h-4 rounded border-gray-800 bg-gray-950 text-red-500 focus:ring-red-500 accent-red-500 cursor-pointer"
                  checked={warningChecked}
                  onChange={(e) => setWarningChecked(e.target.checked)}
                />
                <span className="text-sm text-gray-300">
                  I understand this will permanently delete all details and logs associated with <span className="font-semibold text-white">{treeToDelete.id}</span>.
                </span>
              </label>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setTreeToDelete(null)}
                className="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-medium transition"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!warningChecked || isDeleting) return;
                  setIsDeleting(true);
                  try {
                    const res = await fetch(`/api/tree?id=${treeToDelete.id}`, {
                      method: 'DELETE',
                    });
                    const data = await res.json();

                    if (data.ok) {
                      setTreeList((prev) => prev.filter((t) => t.id !== treeToDelete.id));
                      setTreeToDelete(null);
                    } else {
                      alert(data.message || 'Failed to delete tree');
                    }
                  } catch (err) {
                    console.error('Delete failed', err);
                    alert('Delete error');
                  } finally {
                    setIsDeleting(false);
                  }
                }}
                disabled={!warningChecked || isDeleting}
                className={`flex-1 px-4 py-2.5 rounded-xl font-medium text-white transition flex items-center justify-center space-x-2 ${
                  warningChecked && !isDeleting
                    ? 'bg-red-600 hover:bg-red-700 cursor-pointer shadow-lg shadow-red-900/20'
                    : 'bg-red-800/40 text-gray-500 cursor-not-allowed border border-red-950'
                }`}
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Tree</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
