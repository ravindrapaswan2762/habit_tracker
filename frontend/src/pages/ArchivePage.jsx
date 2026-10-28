import React, { useState, useEffect } from 'react';
import { Search, Archive as ArchiveIcon } from 'lucide-react';
import HabitCard from '../components/HabitCard';
import { api } from '../api/client';

export default function ArchivePage({ onOpenHabitDetails }) {
  const [habits, setHabits] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArchivedHabits();
  }, [search]);

  const loadArchivedHabits = async () => {
    setLoading(true);
    try {
      const data = await api.habits.list({ status: 'archived', search });
      setHabits(data.habits || []);
    } catch (err) {
      console.error('Failed to load archived habits:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnarchive = async (habitId) => {
    try {
      await api.habits.unarchive(habitId);
      setHabits(habits.filter(h => h.id !== habitId));
    } catch (err) {
      console.error('Failed to unarchive:', err);
    }
  };

  const handleDelete = async (habitId) => {
    try {
      await api.habits.delete(habitId); // moves to trash
      setHabits(habits.filter(h => h.id !== habitId));
    } catch (err) {
      console.error('Failed to move to trash:', err);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Search Bar matching Figma */}
      <div className="relative">
        <div className="flex items-center px-4 py-3 bg-white rounded-2xl border border-slate-200 shadow-sm max-w-lg">
          <Search size={18} className="text-slate-400 mr-3 flex-shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Posts, People, anything..."
            className="w-full text-xs sm:text-sm bg-transparent border-none focus:outline-none text-slate-800 placeholder-slate-400"
          />
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-1">Archive</h1>
        <p className="text-xs text-slate-400">Archived habits are paused but preserve full completion history</p>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-400 text-xs">Loading archived habits...</div>
      ) : habits.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200 max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <ArchiveIcon size={22} />
          </div>
          <p className="text-sm font-bold text-slate-700">No archived habits</p>
          <p className="text-xs text-slate-400">
            When you pause or complete a habit long term, you can archive it to keep your active dashboard clean.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {habits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              isArchiveView={true}
              onUnarchive={handleUnarchive}
              onDelete={handleDelete}
              onOpenDetails={onOpenHabitDetails}
            />
          ))}
        </div>
      )}
    </div>
  );
}

