import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadLabels();
      // Reset form
      setName('');
      setDescription('');
      setStartDate(getTodayString());
      setEndDate('');
      setGoal('1');
      setFrequency('DAILY');
      setColor('blue');
      setSelectedLabels([]);
      setError(null);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-md max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-100 p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">New Habit</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Habit Name */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter name of your habit"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B4DFC]/30 focus:border-[#5B4DFC]"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Description <span className="font-normal text-slate-400 lowercase">(optional)</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Read at least 20 minutes before bedtime"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B4DFC]/30 focus:border-[#5B4DFC]"
            />
          </div>

          {/* Dates row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Start Date
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#5B4DFC]/30 focus:border-[#5B4DFC]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#5B4DFC]/30 focus:border-[#5B4DFC]"
              />
            </div>
          </div>

          {/* Goal & Repeat row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Goal
              </label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#5B4DFC]/30 focus:border-[#5B4DFC] bg-white"
              >
                <option value="1">1 time</option>
                <option value="2">2 times</option>
                <option value="3">3 times</option>
                <option value="4">4 times</option>
                <option value="5">5 times</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Repeat
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#5B4DFC]/30 focus:border-[#5B4DFC] bg-white"
              >
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
              </select>
            </div>
          </div>

          {/* Colour */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Colour
            </label>
            <div className="flex items-center gap-3">
              {Object.entries(COLOR_THEMES).map(([key, val]) => (
                <button
                  type="button"
                  key={key}
                  onClick={() => setColor(key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                    color === key
                      ? `${val.bg} ${val.border} ${val.text} ring-2 ring-offset-1 ring-[#5B4DFC]`
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className={`w-3 h-3 rounded-full ${val.dot}`}></span>
                  <span>{val.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Select Labels */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                Select Labels
              </label>
              <button
                type="button"
                onClick={() => setShowAddLabel(!showAddLabel)}
                className="text-xs text-[#5B4DFC] hover:underline flex items-center gap-1 font-semibold"
              >
                <Plus size={13} />
                <span>New Label</span>
              </button>
            </div>

            {showAddLabel && (
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="text"
                  value={newLabelName}
                  onChange={(e) => setNewLabelName(e.target.value)}
                  placeholder="Label name"
                  className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-[#5B4DFC]"
                />
                <button
                  type="button"
                  onClick={handleCreateLabel}
                  className="px-3 py-1.5 bg-[#5B4DFC] text-white rounded-lg text-xs font-semibold"
                >
                  Add
                </button>
              </div>
            )}

            <div className="space-y-2 max-h-32 overflow-y-auto p-3 rounded-xl border border-slate-100 bg-slate-50/50">
              {availableLabels.length > 0 ? (
                availableLabels.map((lbl) => (
                  <label
                    key={lbl.id}
                    className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={selectedLabels.includes(lbl.id)}
                      onChange={() => toggleLabel(lbl.id)}
                      className="w-4 h-4 rounded text-[#5B4DFC] focus:ring-[#5B4DFC] border-slate-300"
                    />
                    <span className="font-medium">{lbl.name}</span>
                  </label>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">No labels available. Create one above!</p>
              )}
            </div>
          </div>

          {/* Done Button */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#5B4DFC] hover:bg-[#4d3fe6] text-white font-semibold text-sm shadow-md shadow-indigo-100 transition-all disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Done'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
