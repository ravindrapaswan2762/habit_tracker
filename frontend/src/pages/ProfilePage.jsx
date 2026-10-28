import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { getTodayString } from '../utils/helpers';

export default function ProfilePage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    currentStreak: 0,
    todayCount: 0,
    habitScore: 0,
    moodScore: 4
  });
  const [mood, setMood] = useState(4);
  const [quote, setQuote] = useState({
    quote: "It always seems impossible until it's done.",
    author: "Nelson Mandela"
  });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    setLoading(true);
    try {
      const [statsRes, quoteRes] = await Promise.all([
        api.dashboard.getStats(getTodayString()),
        api.quotes.getDaily()
      ]);
      if (statsRes.stats) {
        setStats(statsRes.stats);
        if (statsRes.stats.moodScore) setMood(statsRes.stats.moodScore);
      }
      if (quoteRes.quote) {
        setQuote(quoteRes);
      }
    } catch (err) {
      console.error('Failed to load profile data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      await api.exportCsv();
    } catch (err) {
      console.error('Failed to export CSV:', err);
      alert('Failed to export CSV');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto space-y-6 sm:space-y-10 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">My Profile</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Review your personal progress, daily streak, and performance
        </p>
      </div>

      {/* 4 Stat Cards Row matching Figma: 2 cols on mobile, 4 cols on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Current Streak */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-100 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center gap-1 text-xs font-bold text-slate-600 mb-1.5">
            <span>Current Streak</span>
            <span className="text-orange-500">🔥</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {stats.currentStreak}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              {stats.currentStreak === 1 ? 'day' : 'days'}
            </span>
          </div>
        </div>

        {/* Today Completed Times */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-100 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center gap-1 text-xs font-bold text-slate-600 mb-1.5">
            <span>Today completed</span>
            <span>⏱</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {stats.todayCount}
            </span>
            <span className="text-xs font-semibold text-slate-500">times</span>
          </div>
        </div>

        {/* Habit Score */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-100 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center gap-1 text-xs font-bold text-slate-600 mb-1.5">
            <span>Habit Score</span>
            <span className="text-[#5B4DFC]">🎯</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {stats.habitScore}
            </span>
            <span className="text-xs font-semibold text-slate-400">/ 100</span>
          </div>
        </div>

        {/* Mood Score */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-100 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1 text-xs font-bold text-slate-600">
              <span>Mood Score</span>
              <span>🎯</span>
            </div>
          </div>
          <div className="flex items-baseline gap-1 mb-2">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {mood}
            </span>
            <span className="text-xs font-semibold text-slate-400">/ 5</span>
          </div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setMood(val)}
                className={`w-5 h-5 rounded-md text-[10px] font-bold flex items-center justify-center transition-all ${
                  mood >= val ? 'bg-[#5B4DFC] text-white' : 'bg-slate-100 text-slate-400'
                }`}
              >
                {val}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quote of the Day Section */}
      <div className="bg-white rounded-2xl sm:rounded-[32px] p-6 sm:p-10 border border-slate-100 shadow-2xs relative overflow-hidden">
        <h3 className="text-center text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-widest mb-4 sm:mb-6">
          Quote of the day
        </h3>

        <div className="max-w-2xl mx-auto text-center relative py-2 sm:py-4">
          <span className="text-4xl sm:text-5xl font-serif text-[#5B4DFC]/20 font-black absolute -top-4 left-0 select-none">
            “
          </span>
          <span className="text-4xl sm:text-5xl font-serif text-[#5B4DFC]/20 font-black absolute -bottom-6 right-0 select-none">
            ”
          </span>

          <p className="text-base sm:text-lg md:text-xl font-medium text-slate-800 leading-relaxed italic px-6 sm:px-8">
            {quote.quote}
          </p>

          <p className="mt-3 text-xs font-bold uppercase tracking-wider text-slate-500">
            {quote.author}
          </p>
        </div>
      </div>

      {/* Account Info & Data Export Section */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-slate-100 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm">
            {user ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : 'TP'}
          </div>
          <div>
            <p className="text-sm sm:text-base font-bold text-slate-800">
              {user ? `${user.firstName} ${user.lastName}` : 'Tanay Pratap'}
            </p>
            <p className="text-xs text-slate-400">{user?.email || 'tanay@example.com'}</p>
          </div>
        </div>

        <button
          onClick={handleExportCsv}
          disabled={exporting}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold text-xs shadow-sm transition-all disabled:opacity-50 cursor-pointer"
        >
          <Download size={15} />
          <span>{exporting ? 'Exporting...' : 'Export Habits to CSV'}</span>
        </button>
      </div>
    </div>
  );
}
