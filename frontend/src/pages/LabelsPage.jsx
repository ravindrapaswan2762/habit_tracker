import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Tag, Check } from 'lucide-react';
import { api } from '../api/client';

export default function LabelsPage() {
  const [labels, setLabels] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState('#5B4DFC');

  const [editingLabelId, setEditingLabelId] = useState(null);
  const [editLabelName, setEditLabelName] = useState('');

  useEffect(() => {
    loadLabels();
  }, []);

  const loadLabels = async () => {
    setLoading(true);
    try {
      const data = await api.labels.list();
      setLabels(data.labels || []);
    } catch (err) {
      console.error('Failed to load labels:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLabel = async (e) => {
    e.preventDefault();
    if (!newLabelName.trim()) return;
    try {
      const data = await api.labels.create({
        name: newLabelName.trim(),
        color: newLabelColor
      });
      setLabels([...labels, data.label]);
      setNewLabelName('');
      setIsCreating(false);
    } catch (err) {
      console.error('Failed to create label:', err);
    }
  };

  const handleUpdateLabel = async (id) => {
    if (!editLabelName.trim()) return;
    try {
      await api.labels.update(id, { name: editLabelName.trim() });
      setLabels(labels.map(l => l.id === id ? { ...l, name: editLabelName.trim() } : l));
      setEditingLabelId(null);
    } catch (err) {
      console.error('Failed to update label:', err);
    }
  };

  const handleDeleteLabel = async (id) => {
    if (window.confirm('Delete this label? (Habits with this label will stay active)')) {
      try {
        await api.labels.delete(id);
        setLabels(labels.filter(l => l.id !== id));
      } catch (err) {
        console.error('Failed to delete label:', err);
      }
    }
  };

  const filteredLabels = labels.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-fade-in">
      {/* Top Search Bar matching Figma */}
      <div className="relative">
        <div className="flex items-center px-4 py-3 bg-white rounded-2xl border border-slate-200 shadow-sm max-w-lg">
          <Search size={18} className="text-slate-400 mr-3 flex-shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Labels, Habits, anything..."
            className="w-full text-xs sm:text-sm bg-transparent border-none focus:outline-none text-slate-800 placeholder-slate-400"
          />
        </div>
      </div>

      {/* Header and Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">LABELS</h1>
          <p className="text-xs text-slate-400 mt-0.5">Organize and categorize your habits</p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#5B4DFC] hover:bg-[#4d3fe6] text-white text-xs font-bold shadow-md shadow-indigo-100 transition-all"
        >
          <Plus size={16} />
          <span>Create Label</span>
        </button>
      </div>

      {/* Create Label inline form */}
      {isCreating && (
        <form onSubmit={handleCreateLabel} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm max-w-md space-y-3">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">New Label</h3>
          <div className="flex items-center gap-2">
            <input
              type="text"
              required
              value={newLabelName}
              onChange={(e) => setNewLabelName(e.target.value)}
              placeholder="e.g. Mindfulness"
              className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#5B4DFC]"
            />
            <input
              type="color"
              value={newLabelColor}
              onChange={(e) => setNewLabelColor(e.target.value)}
              className="w-9 h-9 p-0.5 rounded-lg border border-slate-200 cursor-pointer"
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-[#5B4DFC] text-white text-xs font-bold rounded-lg shadow-sm"
            >
              Save Label
            </button>
          </div>
        </form>
      )}

      {/* Labels List */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-100">
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs">Loading labels...</div>
        ) : filteredLabels.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            {search ? 'No labels matching search' : 'No labels found. Click "+ Create Label" to add one!'}
          </div>
        ) : (
          filteredLabels.map((lbl) => (
            <div
              key={lbl.id}
              className="flex items-center justify-between p-4 px-6 hover:bg-slate-50/70 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span
                  className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: lbl.color || '#5B4DFC' }}
                ></span>
                {editingLabelId === lbl.id ? (
                  <input
                    type="text"
                    value={editLabelName}
                    onChange={(e) => setEditLabelName(e.target.value)}
                    className="px-2 py-1 text-xs border border-[#5B4DFC] rounded-lg focus:outline-none"
                    autoFocus
                  />
                ) : (
                  <span className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wide">
                    {lbl.name}
                  </span>
                )}
                <span className="text-[11px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  {lbl.habitCount || 0} habits
                </span>
              </div>

              <div className="flex items-center gap-2">
                {editingLabelId === lbl.id ? (
                  <button
                    onClick={() => handleUpdateLabel(lbl.id)}
                    className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                  >
                    <Check size={16} />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setEditingLabelId(lbl.id);
                      setEditLabelName(lbl.name);
                    }}
                    className="p-1.5 text-slate-400 hover:text-[#5B4DFC] hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                )}
                <button
                  onClick={() => handleDeleteLabel(lbl.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
