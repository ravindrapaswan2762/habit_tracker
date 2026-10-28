import React, { useState, useEffect } from 'react';
import { X, Plus, ChevronDown, Check } from 'lucide-react';
import { api } from '../api/client';
import { getTodayString, COLOR_THEMES } from '../utils/helpers';

export default function NewHabitModal({ isOpen, onClose, onHabitCreated }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(getTodayString());
  const [endDate, setEndDate] = useState('');
  const [goal, setGoal] = useState('1');
  const [frequency, setFrequency] = useState('DAILY');
  const [color, setColor] = useState('blue');
  const [selectedLabels, setSelectedLabels] = useState([]);
  const [availableLabels, setAvailableLabels] = useState([]);
  const [newLabelName, setNewLabelName] = useState('');
  const [showAddLabel, setShowAddLabel] = useState(false);
  const [isColorDropdownOpen, setIsColorDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadLabels();
      setName('');
      setDescription('');
      setStartDate(getTodayString());
      setEndDate('');
      setGoal('1');
      setFrequency('DAILY');
      setColor('blue');
      setSelectedLabels([]);
      setError(null);
      setShowAddLabel(false);
      setIsColorDropdownOpen(false);
    }
  }, [isOpen]);

  const loadLabels = async () => {
    try {
      const data = await api.labels.list();
      setAvailableLabels(data.labels || []);
    } catch (err) {
      console.error('Error fetching labels:', err);
    }
  };

  const handleCreateLabel = async (e) => {
    e.preventDefault();
    if (!newLabelName.trim()) return;
    try {
      const data = await api.labels.create({ name: newLabelName.trim() });
      setAvailableLabels([...availableLabels, data.label]);
      setSelectedLabels([...selectedLabels, data.label.id]);
      setNewLabelName('');
      setShowAddLabel(false);
    } catch (err) {
      console.error('Error creating label:', err);
    }
  };

  const toggleLabel = (labelId) => {
    if (selectedLabels.includes(labelId)) {
      setSelectedLabels(selectedLabels.filter((id) => id !== labelId));
    } else {
      setSelectedLabels([...selectedLabels, labelId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a habit name');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        startDate,
        endDate: endDate || null,
        goal: parseInt(goal, 10),
        frequency,
        color,
        labelIds: selectedLabels
      };

      const res = await api.habits.create(payload);
      onHabitCreated(res.habit);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create habit');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const currentColorTheme = COLOR_THEMES[color] || COLOR_THEMES.blue;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white rounded-2xl w-full max-w-[440px] shadow-2xl border border-slate-100 overflow-hidden transform transition-all"
        onClick={() => isColorDropdownOpen && setIsColorDropdownOpen(false)}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">New Habit</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter name of your habit"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm placeholder-slate-400 focus:outline-none focus:border-[#5B4DFC] focus:ring-2 focus:ring-[#5B4DFC]/10 transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Description <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Read at least 20 minutes before bedtime"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm placeholder-slate-400 focus:outline-none focus:border-[#5B4DFC] focus:ring-2 focus:ring-[#5B4DFC]/10 transition-all"
            />
          </div>

          {/* Dates row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Start Date
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:border-[#5B4DFC] focus:ring-2 focus:ring-[#5B4DFC]/10 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:border-[#5B4DFC] focus:ring-2 focus:ring-[#5B4DFC]/10 transition-all"
              />
            </div>
          </div>

          {/* Goal & Repeat row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Goal
              </label>
              <div className="relative">
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full appearance-none px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:border-[#5B4DFC] focus:ring-2 focus:ring-[#5B4DFC]/10 transition-all pr-8 cursor-pointer"
                >
                  <option value="1">1 time</option>
                  <option value="2">2 times</option>
                  <option value="3">3 times</option>
                  <option value="4">4 times</option>
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
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="w-full appearance-none px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:border-[#5B4DFC] focus:ring-2 focus:ring-[#5B4DFC]/10 transition-all pr-8 cursor-pointer"
                >
                  <option value="DAILY">Daily</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="MONTHLY">Monthly</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Colour - Elegant dropdown matching Figma */}
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
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:border-[#5B4DFC] focus:ring-2 focus:ring-[#5B4DFC]/10 transition-all"
            >
              <div className="flex items-center gap-2.5">
                <span className={`w-3 h-3 rounded-full ${currentColorTheme.dot}`}></span>
                <span>{currentColorTheme.name}</span>
              </div>
              <ChevronDown size={14} className="text-slate-400" />
            </button>

            {/* Dropdown menu */}
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
                      setColor(key);
                      setIsColorDropdownOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`w-3 h-3 rounded-full ${val.dot}`}></span>
                      <span>{val.name}</span>
                    </div>
                    {color === key && <Check size={14} className="text-[#5B4DFC]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Select Labels */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-700">
                Select Labels
              </label>
              <button
                type="button"
                onClick={() => setShowAddLabel(!showAddLabel)}
                className="text-xs font-semibold text-[#5B4DFC] hover:text-[#483cd4] flex items-center gap-1 transition-colors"
              >
                <Plus size={13} strokeWidth={2.5} />
                <span>New Label</span>
              </button>
            </div>

            {showAddLabel && (
              <div className="flex items-center gap-2 mb-2.5 p-2 bg-slate-50 rounded-xl border border-slate-200">
                <input
                  type="text"
                  value={newLabelName}
                  onChange={(e) => setNewLabelName(e.target.value)}
                  placeholder="Label name"
                  className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs focus:outline-none focus:border-[#5B4DFC]"
                />
                <button
                  type="button"
                  onClick={handleCreateLabel}
                  className="px-3 py-1.5 bg-[#5B4DFC] text-white rounded-lg text-xs font-semibold hover:bg-[#483cd4]"
                >
                  Add
                </button>
              </div>
            )}

            <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
              {availableLabels.length > 0 ? (
                availableLabels.map((lbl) => {
                  const isChecked = selectedLabels.includes(lbl.id);
                  return (
                    <label
                      key={lbl.id}
                      className="flex items-center gap-2.5 py-1 text-xs text-slate-700 cursor-pointer select-none group"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleLabel(lbl.id)}
                        className="w-4 h-4 rounded border-slate-300 text-[#5B4DFC] focus:ring-[#5B4DFC] cursor-pointer"
                      />
                      <span className="font-medium text-slate-700 group-hover:text-slate-900 transition-colors">
                        {lbl.name}
                      </span>
                    </label>
                  );
                })
              ) : (
                <p className="text-xs text-slate-400 italic py-1">No labels yet. Click "+ New Label" to add one.</p>
              )}
            </div>
          </div>

          {/* Action Button - Right Aligned matching Figma */}
          <div className="flex items-center justify-end pt-3 border-t border-slate-100">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-2.5 rounded-xl bg-[#5B4DFC] hover:bg-[#4d3fe6] active:scale-[0.98] text-white font-semibold text-xs shadow-md shadow-indigo-100 transition-all disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Done'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
