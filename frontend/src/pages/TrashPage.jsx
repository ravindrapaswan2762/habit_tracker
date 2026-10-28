import React, { useState, useEffect } from 'react';
import { Search, Trash2, RotateCcw } from 'lucide-react';
import HabitCard from '../components/HabitCard';
import { api } from '../api/client';

export default function TrashPage() {
  const [habits, setHabits] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrashedHabits();
  }, [search]);

  const loadTrashedHabits = async () => {
    setLoading(true);
    try {
      const data = await api.habits.list({ status: 'trashed', search });
      setHabits(data.habits || []);
    } catch (err) {
      console.error('Failed to load trash:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (habitId) => {
    try {
      await api.habits.restore(habitId);
      setHabits(habits.filter(h => h.id !== habitId));
    } catch (err) {
      console.error('Failed to restore habit:', err);
    }
  };

  const handlePermanentDelete = async (habitId) => {
    if (window.confirm('Permanently delete this habit and all its history? This action cannot be undone.')) {
      try {
        await api.habits.delete(habitId, true);
        setHabits(habits.filter(h => h.id !== habitId));
      } catch (err) {
        console.error('Failed to delete permanently:', err);
      }
    }
  };

  const handleEmptyTrash = async () => {
    if (habits.length === 0) return;
    if (window.confirm('Empty trash and permanently delete all these habits?')) {
      for (const h of habits) {
        try {
          await api.habits.delete(h.id, true);
        } catch (e) {}
      }
      setHabits([]);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-fade-in">
      {/* Search Bar matching Figma */}
      <div className="relative">
        <div className="flex items-center px-3.5 py-2.5 sm:px-4 sm:py-3 bg-white rounded-2xl border border-slate-200 shadow-2xs max-w-lg">
          <Search size={17} className="text-slate-400 mr-2.5 flex-shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Posts, People, anything..."
            className="w-full text-xs sm:text-sm bg-transparent border-none focus:outline-none text-slate-800 placeholder-slate-400"
          />
        </div>
      </div>

      <div className="flex flex-row items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-0.5">Trash</h1>
          <p className="text-xs text-slate-400">Deleted habits stay here until permanently removed</p>
        </div>

        {habits.length > 0 && (
          <button
            onClick={handleEmptyTrash}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold transition-colors flex-shrink-0"
          >
            <Trash2 size={14} />
            <span>Empty Trash</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-400 text-xs">Loading trash...</div>
      ) : habits.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-dashed border-slate-200 max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <Trash2 size={22} />
          </div>
          <p className="text-sm font-bold text-slate-700">Trash is empty</p>
          <p className="text-xs text-slate-400">
            Deleted habits will appear here so you can easily restore them if needed.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {habits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              isTrashView={true}
              onRestore={handleRestore}
              onDelete={handlePermanentDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
