import React, { useState, useEffect } from 'react';
import { X, Edit3, Archive, Trash2, Check, RotateCcw, Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
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
  const [isColorDropdownOpen, setIsColorDropdownOpen] = useState(false);

  // Calendar completions
  const [completions, setCompletions] = useState([]);
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());

  useEffect(() => {
    if (isOpen && habitId) {
      loadHabit();
      loadLabels();
      setIsEditing(false);
      setIsColorDropdownOpen(false);
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
      onHabitUpdated(habit);
    } catch (err) {
      console.error('Error toggling completion:', err);
    }
  };

  if (!isOpen) return null;

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = currentMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const currentColorTheme = COLOR_THEMES[editColor] || COLOR_THEMES.blue;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white rounded-2xl w-full max-w-[480px] max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-100 transform transition-all"
        onClick={() => isColorDropdownOpen && setIsColorDropdownOpen(false)}
      >
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs font-medium">Loading habit details...</div>
        ) : error ? (
          <div className="p-6">
            <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl">{error}</div>
            <button onClick={onClose} className="mt-4 px-4 py-2 bg-slate-100 rounded-xl text-xs font-semibold">Close</button>
          </div>
        ) : (
          <div>
            {/* Header matching Figma */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                {isEditing ? 'Edit Habit' : 'My Habit'}
              </h2>

              <div className="flex items-center gap-1.5">
                {!isEditing && (
                  <>
                    <button
                      onClick={handleArchive}
                      title="Archive Habit"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                    >
                      <Archive size={17} />
                    </button>
                    <button
                      onClick={() => setIsEditing(true)}
                      title="Edit Habit"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-[#5B4DFC] hover:bg-indigo-50 transition-colors"
                    >
                      <Edit3 size={17} />
                    </button>
                    <button
                      onClick={handleDelete}
                      title="Delete Habit"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 size={17} />
                    </button>
                  </>
                )}

                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors ml-1"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Content: View Mode vs Edit Mode */}
            {!isEditing ? (
              <div className="p-6 space-y-6">
                {/* Details Card */}
                <div className="space-y-4 bg-slate-50/70 p-5 rounded-2xl border border-slate-100">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">Title</span>
                    <p className="text-base font-bold text-slate-800">{habit.name}</p>
                    {habit.description && <p className="text-xs text-slate-500 mt-1">{habit.description}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">Start Date</span>
                      <span className="font-semibold text-slate-700">{formatDateDisplay(habit.startDate)}</span>
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">End Date</span>
                      <span className="font-semibold text-slate-700">{habit.endDate ? formatDateDisplay(habit.endDate) : 'Ongoing'}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">Goal</span>
                      <span className="font-semibold text-slate-700">{habit.goal} times</span>
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">Repeat</span>
                      <span className="font-semibold text-slate-700 capitalize">{habit.frequency.toLowerCase()}</span>
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">Status</span>
                      <span className="font-semibold capitalize text-emerald-600">{habit.status}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Labels</span>
                    <div className="flex flex-wrap gap-1.5">
                      {habit.labels && habit.labels.length > 0 ? (
                        habit.labels.map(l => (
                          <span key={l.id} className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700 shadow-2xs">
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
                    <h3 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <CalendarIcon size={14} className="text-[#5B4DFC]" />
                      <span>Completion Calendar ({monthName})</span>
                    </h3>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setCurrentMonthDate(new Date(year, month - 1, 1))}
                        className="px-2 py-0.5 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 transition-colors"
                      >
                        ‹
                      </button>
                      <button
                        onClick={() => setCurrentMonthDate(new Date(year, month + 1, 1))}
                        className="px-2 py-0.5 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 transition-colors"
                      >
                        ›
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 mb-2">
                    Click any day below to mark or undo completion for that date.
                  </p>

                  <div className="grid grid-cols-7 gap-1 text-center text-xs bg-slate-50/60 p-3 rounded-2xl border border-slate-100">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                      <div key={day} className="text-[10px] font-bold text-slate-400 py-1">
                        {day}
                      </div>
                    ))}

                    {Array.from({ length: firstDay }).map((_, i) => (
                      <div key={`empty-${i}`} className="p-2"></div>
                    ))}

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
              /* Edit Form State matching Figma */
              <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Title
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#5B4DFC] focus:ring-2 focus:ring-[#5B4DFC]/10 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Description
                  </label>
                  <input
                    type="text"
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#5B4DFC] focus:ring-2 focus:ring-[#5B4DFC]/10 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={editStartDate}
                      onChange={(e) => setEditStartDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:border-[#5B4DFC] focus:ring-2 focus:ring-[#5B4DFC]/10"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={editEndDate}
                      onChange={(e) => setEditEndDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:border-[#5B4DFC] focus:ring-2 focus:ring-[#5B4DFC]/10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Goal
                    </label>
                    <div className="relative">
                      <select
                        value={editGoal}
                        onChange={(e) => setEditGoal(e.target.value)}
                        className="w-full appearance-none px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:border-[#5B4DFC] pr-8 cursor-pointer"
                      >
                        <option value="1">1 time</option>
                        <option value="2">2 times</option>
                        <option value="3">3 times</option>
                        <option value="5">5 times</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Repeat
                    </label>
                    <div className="relative">
                      <select
                        value={editFrequency}
                        onChange={(e) => setEditFrequency(e.target.value)}
                        className="w-full appearance-none px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:border-[#5B4DFC] pr-8 cursor-pointer"
                      >
                        <option value="DAILY">Daily</option>
                        <option value="WEEKLY">Weekly</option>
                        <option value="MONTHLY">Monthly</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Colour
                  </label>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsColorDropdownOpen(!isColorDropdownOpen);
                    }}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:border-[#5B4DFC] transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`w-3 h-3 rounded-full ${currentColorTheme.dot}`}></span>
                      <span>{currentColorTheme.name}</span>
                    </div>
                    <ChevronDown size={14} className="text-slate-400" />
                  </button>

                  {isColorDropdownOpen && (
                    <div 
                      className="absolute z-30 left-0 right-0 mt-1.5 bg-white rounded-xl border border-slate-100 shadow-xl py-1.5 animate-fade-in"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {Object.entries(COLOR_THEMES).map(([key, val]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => {
                            setEditColor(key);
                            setIsColorDropdownOpen(false);
                          }}
                          className="w-full flex items-center justify-between px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className={`w-3 h-3 rounded-full ${val.dot}`}></span>
                            <span>{val.name}</span>
                          </div>
                          {editColor === key && <Check size={14} className="text-[#5B4DFC]" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Labels
                  </label>
                  <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                    {availableLabels.map(l => (
                      <label key={l.id} className="flex items-center gap-2.5 py-1 text-xs font-medium text-slate-700 cursor-pointer select-none">
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
                          className="w-4 h-4 rounded border-slate-300 text-[#5B4DFC] focus:ring-[#5B4DFC] cursor-pointer"
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
                    className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-7 py-2.5 bg-[#5B4DFC] hover:bg-[#4d3fe6] text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-100 transition-all"
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
