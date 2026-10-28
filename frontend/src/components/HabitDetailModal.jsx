import React, { useState, useEffect } from 'react';
import { X, Edit3, Archive, Trash2, Check, RotateCcw, Calendar as CalendarIcon } from 'lucide-react';
import { api } from '../api/client';
import { getTodayString, formatDateDisplay, COLOR_THEMES, getTheme } from '../utils/helpers';

export default function HabitDetailModal({
  isOpen,
  habitId,
  onClose,
  onHabitUpdated,
  onHabitDeleted
}) {
  const [habit, setHabit] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [editGoal, setEditGoal] = useState('1');
  const [editFrequency, setEditFrequency] = useState('DAILY');
  const [editColor, setEditColor] = useState('blue');
  const [editStatus, setEditStatus] = useState('active');
  const [editLabelIds, setEditLabelIds] = useState([]);
  const [availableLabels, setAvailableLabels] = useState([]);

  // Calendar completions
  const [completions, setCompletions] = useState([]);
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());

  useEffect(() => {
    if (isOpen && habitId) {
      loadHabit();
      loadLabels();
      setIsEditing(false);
    }
  }, [isOpen, habitId]);

  const loadLabels = async () => {
    try {
      const data = await api.labels.list();
      setAvailableLabels(data.labels || []);
    } catch (err) {}
  };

  const loadHabit = async () => {
    setLoading(true);
    try {
      const data = await api.habits.get(habitId);
      const h = data.habit;
      setHabit(h);
      setEditName(h.name);
      setEditDesc(h.description || '');
      setEditStartDate(h.startDate);
      setEditEndDate(h.endDate || '');
      setEditGoal(String(h.goal));
      setEditFrequency(h.frequency);
      setEditColor(h.color);
      setEditStatus(h.status);
      setEditLabelIds(h.labels ? h.labels.map(l => l.id) : []);

      // Load completions
      const comps = await api.completions.list(h.id);
      setCompletions(comps.completions || []);
    } catch (err) {
      setError(err.message || 'Failed to load habit');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editName.trim()) return;

    try {
      const payload = {
        name: editName.trim(),
        description: editDesc.trim(),
        startDate: editStartDate,
        endDate: editEndDate || null,
        goal: parseInt(editGoal, 10),
        frequency: editFrequency,
        color: editColor,
        status: editStatus,
        labelIds: editLabelIds
      };

      const res = await api.habits.update(habit.id, payload);
      setHabit(res.habit);
      setIsEditing(false);
      onHabitUpdated(res.habit);
    } catch (err) {
      setError(err.message || 'Failed to update habit');
    }
  };

  const handleArchive = async () => {
    try {
      await api.habits.archive(habit.id);
      onHabitUpdated({ ...habit, status: 'archived' });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to archive');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Move this habit to trash?')) {
      try {
        await api.habits.delete(habit.id);
        onHabitDeleted(habit.id);
        onClose();
      } catch (err) {
        setError(err.message || 'Failed to delete');
      }
    }
  };

  const toggleDateCompletion = async (dateStr) => {
    const isCompleted = completions.some(c => c.date === dateStr);
    try {
      if (isCompleted) {
        await api.completions.undo(habit.id, dateStr);
        setCompletions(completions.filter(c => c.date !== dateStr));
      } else {
        const res = await api.completions.mark(habit.id, dateStr);
        setCompletions([...completions, res.completion]);
      }
      // notify parent to refresh stats
      onHabitUpdated(habit);
    } catch (err) {
      console.error('Error toggling completion:', err);
    }
  };

  if (!isOpen) return null;

  // Calendar rendering calculations
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = currentMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const theme = habit ? getTheme(habit.color) : COLOR_THEMES.blue;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-100 p-6 md:p-8">
        {loading ? (
          <div className="py-12 text-center text-slate-400 font-medium">Loading habit details...</div>
        ) : error ? (
          <div className="p-4 bg-rose-50 text-rose-700 rounded-xl">{error}</div>
        ) : (
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">
                {isEditing ? 'Edit Habit' : 'My Habit'}
              </h2>

              <div className="flex items-center gap-2">
                {!isEditing && (
                  <>
                    <button
                      onClick={handleArchive}
                      title="Archive Habit"
                      className="p-2 rounded-xl text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                    >
                      <Archive size={18} />
                    </button>
                    <button
                      onClick={() => setIsEditing(true)}
                      title="Edit Habit"
                      className="p-2 rounded-xl text-slate-400 hover:text-[#5B4DFC] hover:bg-indigo-50 transition-colors"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button
                      onClick={handleDelete}
                      title="Delete Habit"
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </>
                )}

                <button
                  onClick={onClose}
                  className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Content: View Mode vs Edit Mode */}
            {!isEditing ? (
              <div className="space-y-5">
                {/* Habit details read-only */}
                <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Title</span>
                    <p className="text-base font-bold text-slate-800">{habit.name}</p>
                    {habit.description && <p className="text-xs text-slate-500 mt-0.5">{habit.description}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Start Date</span>
                      <span className="font-semibold text-slate-700">{formatDateDisplay(habit.startDate)}</span>
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">End Date</span>
                      <span className="font-semibold text-slate-700">{habit.endDate ? formatDateDisplay(habit.endDate) : 'Ongoing'}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Goal</span>
                      <span className="font-semibold text-slate-700">{habit.goal} times</span>
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Repeat</span>
                      <span className="font-semibold text-slate-700">{habit.frequency}</span>
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Status</span>
                      <span className="font-semibold capitalize text-emerald-600">{habit.status}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Labels</span>
                    <div className="flex flex-wrap gap-1.5">
                      {habit.labels && habit.labels.length > 0 ? (
                        habit.labels.map(l => (
                          <span key={l.id} className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700">
                            {l.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 italic">None</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Calendar Completion History */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                      <CalendarIcon size={14} className="text-[#5B4DFC]" />
                      <span>Completion Calendar ({monthName})</span>
                    </h3>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setCurrentMonthDate(new Date(year, month - 1, 1))}
                        className="px-2 py-0.5 rounded border border-slate-200 text-xs text-slate-600 hover:bg-slate-50"
                      >
                        ‹
                      </button>
                      <button
                        onClick={() => setCurrentMonthDate(new Date(year, month + 1, 1))}
                        className="px-2 py-0.5 rounded border border-slate-200 text-xs text-slate-600 hover:bg-slate-50"
                      >
                        ›
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 mb-2">
                    Click any day below to mark or unmark completion for that date.
                  </p>

                  <div className="grid grid-cols-7 gap-1 text-center text-xs bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                      <div key={day} className="text-[10px] font-bold text-slate-400 py-1">
                        {day}
                      </div>
                    ))}

                    {/* Leading blanks */}
                    {Array.from({ length: firstDay }).map((_, i) => (
                      <div key={`empty-${i}`} className="p-2"></div>
                    ))}

                    {/* Month Days */}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const dayNum = i + 1;
                      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                      const isComp = completions.some(c => c.date === dateStr);
                      const isToday = dateStr === getTodayString();

                      return (
                        <button
                          key={dayNum}
                          onClick={() => toggleDateCompletion(dateStr)}
                          className={`aspect-square rounded-xl flex flex-col items-center justify-center font-semibold text-xs transition-all ${
                            isComp
                              ? 'bg-[#5B4DFC] text-white shadow-sm'
                              : isToday
                              ? 'bg-indigo-50 text-[#5B4DFC] border border-[#5B4DFC]/30'
                              : 'hover:bg-white text-slate-700'
                          }`}
                        >
                          <span>{dayNum}</span>
                          {isComp && <span className="w-1 h-1 bg-white rounded-full mt-0.5"></span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              /* Edit Form State */
              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B4DFC]/30 focus:border-[#5B4DFC]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B4DFC]/30 focus:border-[#5B4DFC]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={editStartDate}
                      onChange={(e) => setEditStartDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={editEndDate}
                      onChange={(e) => setEditEndDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Goal
                    </label>
                    <select
                      value={editGoal}
                      onChange={(e) => setEditGoal(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs bg-white"
                    >
                      <option value="1">1 time</option>
                      <option value="2">2 times</option>
                      <option value="3">3 times</option>
                      <option value="5">5 times</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Repeat
                    </label>
                    <select
                      value={editFrequency}
                      onChange={(e) => setEditFrequency(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs bg-white"
                    >
                      <option value="DAILY">Daily</option>
                      <option value="WEEKLY">Weekly</option>
                      <option value="MONTHLY">Monthly</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Colour
                  </label>
                  <div className="flex items-center gap-2">
                    {Object.entries(COLOR_THEMES).map(([key, val]) => (
                      <button
                        type="button"
                        key={key}
                        onClick={() => setEditColor(key)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-semibold ${
                          editColor === key
                            ? `${val.bg} ${val.border} ${val.text} ring-2 ring-[#5B4DFC]`
                            : 'bg-white border-slate-200 text-slate-600'
                        }`}
                      >
                        <span className={`w-2.5 h-2.5 rounded-full ${val.dot}`}></span>
                        <span>{val.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Labels
                  </label>
                  <div className="space-y-1.5 max-h-28 overflow-y-auto p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    {availableLabels.map(l => (
                      <label key={l.id} className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editLabelIds.includes(l.id)}
                          onChange={() => {
                            if (editLabelIds.includes(l.id)) {
                              setEditLabelIds(editLabelIds.filter(id => id !== l.id));
                            } else {
                              setEditLabelIds([...editLabelIds, l.id]);
                            }
                          }}
                          className="rounded text-[#5B4DFC]"
                        />
                        <span>{l.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#5B4DFC] hover:bg-[#4d3fe6] text-white text-xs font-bold rounded-xl shadow-md"
                  >
                    Done
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
