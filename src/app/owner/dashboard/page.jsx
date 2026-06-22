'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";

export default function OwnerDashboard() {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters (only these four now)
  const [searchNumber, setSearchNumber] = useState(""); // numeric part after TREE-
  const [wateredFilter, setWateredFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [fertilizerFilter, setFertilizerFilter] = useState("");
  const [limit, setLimit] = useState(5); // 5 updates limit by default for mobile/desktop
  
  // New features state
  const [tasks, setTasks] = useState([]);
  const [selectedTrees, setSelectedTrees] = useState([]);
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [submittingTask, setSubmittingTask] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [harvestEnabled, setHarvestEnabled] = useState(false);
  const [treesList, setTreesList] = useState([]);

  const toggleTreeSelection = (id) => {
    setSelectedTrees((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        const res = await fetch("/api/daily-update");
        const data = await res.json();
        setUpdates(data.updates || []);
      } catch (err) {
        console.error("Failed to fetch updates:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUpdates();

    // Fetch settings
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          setHarvestEnabled(!!data.settings.harvest_tracking_enabled);
        }
      })
      .catch(console.error);

    // Fetch tasks
    fetch("/api/tasks")
      .then((res) => res.json())
      .then((data) => setTasks(data.tasks || []))
      .catch(console.error);

    // Fetch leaderboard
    fetch("/api/harvests?leaderboard=true")
      .then((res) => res.json())
      .then((data) => setLeaderboard(data.leaderboard || []))
      .catch(console.error);

    // Fetch all trees
    fetch("/api/tree/all")
      .then((res) => res.json())
      .then((data) => setTreesList(data.trees || []))
      .catch(console.error);
  }, []);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskDesc) return;
    setSubmittingTask(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ treeIds: selectedTrees, description: newTaskDesc }),
      });
      if (res.ok) {
        // Reload tasks
        const tasksRes = await fetch("/api/tasks");
        const tasksData = await tasksRes.json();
        setTasks(tasksData.tasks || []);
        // Reset
        setNewTaskDesc("");
        setSelectedTrees([]);
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to create task");
      }
    } catch (err) {
      console.error(err);
      alert("Error creating task");
    } finally {
      setSubmittingTask(false);
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (res.ok) {
        setTasks((prev) => prev.filter((t) => t._id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 1) Add a small formatter near the top (below imports)
  const fmtLocalTime = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    // e.g. "10:42" or "10:42 AM" depending on user locale
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const filteredUpdates = updates.filter((item) => {
    // Tree ID: user types only digits; we match against "TREE-<digits>"
    const matchesId =
      searchNumber === "" ||
      item.treeId.toLowerCase().includes(`tree-${searchNumber}`.toLowerCase());

    const matchesWater =
      wateredFilter === "" || item.watered === (wateredFilter === "yes");

    const matchesDate = dateFilter === "" || item.date === dateFilter;

    const matchesFertilizer =
      fertilizerFilter === "" ||
      (Array.isArray(item.fertilizers) &&
        item.fertilizers.some((f) =>
          f.toLowerCase().includes(fertilizerFilter.toLowerCase())
        ));

    return matchesId && matchesWater && matchesDate && matchesFertilizer;
  });

  const displayedUpdates = limit === 0 ? filteredUpdates : filteredUpdates.slice(0, limit);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-green-400">Dashboard</h1>
        <p className="text-gray-400">Latest activities, task tracking, and yield summaries</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left/Main Column: Activity Feed & Filters (spans 2 cols) */}
        <div className="xl:col-span-2 space-y-6">
          {/* Filters */}
          <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl space-y-4">
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {/* Tree ID with fixed prefix */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Tree ID</label>
                <div className="flex items-center bg-gray-850 border border-gray-700 rounded-lg overflow-hidden">
                  <span className="px-3 py-2 text-gray-400 bg-gray-900 border-r border-gray-750 text-sm">
                    TREE-
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={searchNumber}
                    onChange={(e) => {
                      // keep only digits
                      const digits = e.target.value.replace(/\D/g, "");
                      setSearchNumber(digits);
                    }}
                    placeholder="Enter number"
                    className="flex-1 bg-transparent text-white px-3 py-2 outline-none text-sm"
                  />
                </div>
              </div>

              {/* Watered? */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Watered?</label>
                <select
                  value={wateredFilter}
                  onChange={(e) => setWateredFilter(e.target.value)}
                  className="w-full bg-gray-850 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">All</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Date</label>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full bg-gray-850 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm"
                />
              </div>

              {/* Fertilizer */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Fertilizer
                </label>
                <input
                  type="text"
                  value={fertilizerFilter}
                  onChange={(e) => setFertilizerFilter(e.target.value)}
                  placeholder="e.g. Urea"
                  className="w-full bg-gray-850 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm"
                />
              </div>

              {/* Show Limit Dropdown */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Show Updates</label>
                <select
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                  className="w-full bg-gray-850 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
                >
                  <option value={5}>Last 5</option>
                  <option value={10}>Last 10</option>
                  <option value={20}>Last 20</option>
                  <option value={50}>Last 50</option>
                  <option value={0}>All Updates</option>
                </select>
              </div>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <div className="w-6 h-6 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : displayedUpdates.length === 0 ? (
            <p className="text-gray-600">No updates match selected filters.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayedUpdates.map((update, index) => (
                <Link
                  href={`/owner/tree/${update.treeId}`}
                  key={`${update.treeId}-${index}`}
                  className="block bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4 shadow-sm hover:border-green-600/50 hover:bg-gray-900/80 transition duration-200"
                >
                  {/* Top Row: Tree ID & Date */}
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Tree ID</span>
                      <h3 className="text-lg font-bold text-green-400 mt-0.5">{update.treeId}</h3>
                    </div>
                    <span className="text-xs text-gray-400 bg-gray-950 px-2.5 py-1 rounded-md border border-gray-800">
                      {update.date}
                      {update.createdAt ? ` · ${fmtLocalTime(update.createdAt)}` : ""}
                    </span>
                  </div>

                  {/* Status Section */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 font-medium">Watering:</span>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          update.watered
                            ? "bg-green-950/80 text-green-400 border border-green-800/40"
                            : "bg-red-950/80 text-red-400 border border-red-800/40"
                        }`}
                      >
                        {update.watered ? "Watered" : "Not Watered"}
                      </span>
                    </div>

                    {/* Fertilizers applied */}
                    <div>
                      <span className="block text-xs text-gray-400 font-medium mb-1.5">Fertilizers Applied:</span>
                      {Array.isArray(update.fertilizers) && update.fertilizers.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {update.fertilizers.map((f, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-950 text-blue-300 border border-blue-800/50"
                            >
                              🧪 {f}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500 italic">None</span>
                      )}
                    </div>

                    {/* Recorded By (Farmer unique ID audit field) */}
                    {update.farmerId && (
                      <div className="text-[11px] text-gray-500 mt-1">
                        Logged by: <span className="text-gray-400 font-medium">{update.farmerId}</span>
                      </div>
                    )}
                  </div>

                  {/* Image Preview */}
                  {update.imageUrl && (
                    <div className="relative rounded-lg overflow-hidden border border-gray-700 mt-2 aspect-video bg-black/20">
                      <img
                        src={update.imageUrl}
                        alt="tree"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right Sidebar Column: Task Management & Leaderboard */}
        <div className="space-y-6">
          
          {/* Task Management Panel */}
          <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl space-y-5 shadow-xl">
            <h2 className="text-lg font-bold text-white border-b border-gray-800 pb-3 flex items-center gap-2">
              📋 Task Assignment
            </h2>
            
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs text-gray-400 font-medium">Select Trees (Optional)</label>
                  {selectedTrees.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedTrees([])}
                      className="text-[10px] text-red-400 hover:text-red-300 transition"
                    >
                      Clear Selection ({selectedTrees.length})
                    </button>
                  )}
                </div>
                
                <div className="bg-gray-950/60 border border-gray-800 rounded-xl p-3 max-h-40 overflow-y-auto space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    {treesList.map((t) => (
                      <label
                        key={t.id}
                        className={`flex items-center gap-2 p-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition select-none ${
                          selectedTrees.includes(t.id)
                            ? 'bg-green-950/50 text-green-300 border-green-800/60'
                            : 'bg-transparent text-gray-400 border-gray-850 hover:border-gray-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedTrees.includes(t.id)}
                          onChange={() => toggleTreeSelection(t.id)}
                          className="w-3.5 h-3.5 rounded border-gray-750 bg-gray-950 text-green-600 focus:ring-green-500 accent-green-600 cursor-pointer"
                        />
                        <span>{t.id}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <p className="text-[10px] text-gray-500 mt-1">
                  Leave unchecked to assign as a general task.
                </p>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Task Action</label>
                <input
                  type="text"
                  placeholder="e.g. Fertilize with Urea, check pests..."
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  required
                  className="w-full bg-gray-850 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={submittingTask}
                className="w-full py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800/40 text-white font-bold text-sm rounded-lg transition cursor-pointer"
              >
                {submittingTask ? "Assigning..." : "Assign Task"}
              </button>
            </form>

            {tasks.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Active Tasks</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {tasks.map((task) => (
                    <div
                      key={task._id}
                      className="flex justify-between items-start p-3 rounded-xl bg-gray-950/60 border border-gray-800/80 text-sm gap-2"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {task.treeId ? (
                            <span className="font-semibold text-green-400 text-[10px] bg-green-950 px-1.5 py-0.5 rounded border border-green-900/60">
                              {task.treeId}
                            </span>
                          ) : (
                            <span className="font-semibold text-gray-450 text-[10px] bg-gray-950 px-1.5 py-0.5 rounded border border-gray-800">
                              General
                            </span>
                          )}
                          <span className={`text-[10px] font-medium ${task.completed ? 'text-green-500' : 'text-yellow-500'}`}>
                            {task.completed ? '● Done' : '○ Pending'}
                          </span>
                        </div>
                        <p className={`text-xs ${task.completed ? 'line-through text-gray-500' : 'text-gray-300'}`}>
                          {task.description}
                        </p>
                      </div>

                      <button
                        onClick={() => handleDeleteTask(task._id)}
                        className="text-red-400 hover:text-red-600 transition shrink-0 p-0.5 hover:bg-red-950/40 rounded"
                        title="Delete Task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Yield Leaderboard Panel (Conditional on Harvest Tracking) */}
          {harvestEnabled && (
            <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl space-y-4 shadow-xl">
              <h2 className="text-lg font-bold text-white border-b border-gray-800 pb-3 flex items-center gap-2">
                👑 Yield Leaderboard
              </h2>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {leaderboard.length === 0 ? (
                  <p className="text-xs text-gray-500 italic">No harvests recorded yet.</p>
                ) : (
                  leaderboard.map((item, index) => (
                    <div
                      key={item._id}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-gray-950/60 border border-gray-800 text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-xs flex items-center justify-center w-5 h-5 rounded-full ${
                          index === 0 ? 'bg-yellow-500 text-black' : index === 1 ? 'bg-gray-400 text-black' : index === 2 ? 'bg-amber-600 text-white' : 'bg-gray-800 text-gray-400'
                        }`}>
                          {index + 1}
                        </span>
                        <span className="font-semibold text-white">{item._id}</span>
                      </div>

                      <div className="text-right">
                        <span className="font-bold text-green-400">{item.totalNuts}</span>
                        <span className="text-xs text-gray-500 block">coconuts</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
