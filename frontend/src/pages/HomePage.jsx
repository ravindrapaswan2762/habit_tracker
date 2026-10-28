import React, { useState, useEffect } from 'react';
import { Plus, ChevronDown, Sparkles, Calendar as CalendarIcon } from 'lucide-react';
import HabitCard from '../components/HabitCard';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { getTodayString } from '../utils/helpers';

export default function HomePage({ onOpenNewHabit, onOpenHabitDetails }) {
  const { user } = useAuth();

  const [habits, setHabits] = useState([]);
  const [labels, setLabels] = useState([]);
  const [selectedLabel, setSelectedLabel] = useState(null);
  const [stats, setStats] = useState({ completed: 0, inProgress: 0, overdue: 0, total: 0 });
  const [selectedPeriod, setSelectedPeriod] = useState('Today');
  const [isPeriodMenuOpen, setIsPeriodMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const todayStr = getTodayString();

  useEffect(() => {
    loadData();
  }, [selectedLabel]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [habitsRes, labelsRes, statsRes] = await Promise.all([
        api.habits.list({ status: 'active', label: selectedLabel }),
        api.labels.list(),
        api.dashboard.getStats(todayStr)
      ]);

      setHabits(habitsRes.habits || []);
      setLabels(labelsRes.labels || []);
      if (statsRes.stats) {
        setStats(statsRes.stats);
      }
    } catch (err) {
      setError(err.message || 'Failed to load habits');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async (habit) => {
    const isCurrentlyDone = habit.isCompletedToday;
    try {
      if (isCurrentlyDone) {
        await api.completions.undo(habit.id, todayStr);
      } else {
        await api.completions.mark(habit.id, todayStr, habit.goal);
      }
      await loadData();
    } catch (err) {
      console.error('Failed to toggle completion:', err);
    }
  };

  const activeHabits = habits.filter((h) => !h.isCompletedToday);
  const completedHabits = habits.filter((h) => h.isCompletedToday);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in" onClick={() => isPeriodMenuOpen && setIsPeriodMenuOpen(false)}>
      {/* Top Bar: Welcome & Date Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Welcome, {user?.firstName || 'Tanay'}</span>
            <span className="text-2xl">👋</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track your daily progress and boost consistency
          </p>
        </div>

        {/* Date / Period selector dropdown */}
        <div className="relative inline-block text-left self-start sm:self-auto">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsPeriodMenuOpen(!isPeriodMenuOpen);
            }}
            className="flex items-center gap-2 px-3.5 py-2 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
          >
            <span className="text-[#5B4DFC]">Today</span>
            <ChevronDown size={14} className="text-slate-400" />
          </button>

          {isPeriodMenuOpen && (
            <div className="absolute right-0 mt-1 w-32 bg-white rounded-xl border border-slate-100 shadow-lg py-1 z-20 text-xs font-medium text-slate-700">
              {['Today', 'This Week', 'This Month', 'All Time'].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    setSelectedPeriod(p);
                    setIsPeriodMenuOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-slate-50"
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stats Summary Cards Row matching Figma */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Completed */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-2xs hover:shadow-sm transition-shadow">
          <p className="text-xs font-semibold text-slate-600 mb-1.5">Completed</p>
          <p className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1">
            {stats.completed}
          </p>
          <p className="text-[11px] font-medium text-slate-400">Total Count</p>
        </div>

        {/* In Progress */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-2xs hover:shadow-sm transition-shadow">
          <p className="text-xs font-semibold text-slate-600 mb-1.5">In progress</p>
          <p className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1">
            {stats.inProgress}
          </p>
          <p className="text-[11px] font-medium text-slate-400">Total Count</p>
        </div>

        {/* Overdue */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-2xs hover:shadow-sm transition-shadow">
          <p className="text-xs font-semibold text-slate-600 mb-1.5">Overdue</p>
          <p className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1">
            {stats.overdue}
          </p>
          <p className="text-[11px] font-medium text-slate-400">Total Count</p>
        </div>

        {/* Total */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-2xs hover:shadow-sm transition-shadow">
          <p className="text-xs font-semibold text-slate-600 mb-1.5">Total</p>
          <p className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1">
            {stats.total}
          </p>
          <p className="text-[11px] font-medium text-slate-400">Total Count</p>
        </div>
      </div>

      {/* Habits Section */}
      <div className="space-y-6 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
              <span>My Habits</span>
              <span className="text-rose-500">🎯</span>
            </h2>
          </div>

          <button
            onClick={onOpenNewHabit}
            className="flex items-center gap-1.5 text-xs font-bold text-[#5B4DFC] hover:text-[#483cd4] transition-colors"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Create Habit</span>
          </button>
        </div>

        {/* Label Filters */}
        {labels.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedLabel(null)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                selectedLabel === null
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              All Habits
            </button>
            {labels.map((lbl) => (
              <button
                key={lbl.id}
                onClick={() => setSelectedLabel(selectedLabel === lbl.id ? null : lbl.id)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                  selectedLabel === lbl.id
                    ? 'bg-[#5B4DFC] text-white shadow-2xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {lbl.name}
              </button>
            ))}
          </div>
        )}

        {/* Loading and Error states */}
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs font-medium">
            Loading your habits...
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-rose-50 text-rose-700 text-xs font-medium">
            {error}
          </div>
        ) : habits.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200 max-w-md mx-auto space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-indigo-50 flex items-center justify-center text-[#5B4DFC]">
              <Sparkles size={24} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">No habits yet</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Pick a positive habit to track today and build your streak!
              </p>
            </div>
            <button
              onClick={onOpenNewHabit}
              className="px-5 py-2.5 bg-[#5B4DFC] text-white text-xs font-bold rounded-xl shadow-sm hover:bg-[#4d3fe6] transition-all"
            >
              + Create First Habit
            </button>
          </div>
        ) : (
          <div className="space-y-7">
            {/* ACTIVE Habits Subsection matching Figma */}
            {activeHabits.length > 0 && (
              <div className="space-y-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Active
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {activeHabits.map((habit) => (
                    <HabitCard
                      key={habit.id}
                      habit={habit}
                      onToggleComplete={handleToggleComplete}
                      onOpenDetails={onOpenHabitDetails}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* COMPLETED Habits Subsection matching Figma */}
            {completedHabits.length > 0 && (
              <div className="space-y-3 pt-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Completed
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {completedHabits.map((habit) => (
                    <HabitCard
                      key={habit.id}
                      habit={habit}
                      onToggleComplete={handleToggleComplete}
                      onOpenDetails={onOpenHabitDetails}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
