import React from 'react';
import { Check, RotateCcw, Trash2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { getTheme } from '../utils/helpers';

export default function HabitCard({
  habit,
  onToggleComplete,
  onOpenDetails,
  onUnarchive,
  onDelete,
  onRestore,
  isArchiveView = false,
  isTrashView = false
}) {
  const theme = getTheme(habit.color);

  const handleCheckClick = (e) => {
    e.stopPropagation();
    if (isArchiveView || isTrashView) return;

    if (!habit.isCompletedToday) {
      try {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (rect.left + rect.width / 2) / window.innerWidth;
        const y = (rect.top + rect.height / 2) / window.innerHeight;
        confetti({
          particleCount: 28,
          spread: 45,
          origin: { x, y },
          colors: ['#5B4DFC', '#3B82F6', '#10B981', '#F43F5E', '#EAB308'],
          disableForReducedMotion: true
        });
      } catch (err) {}
    }

    onToggleComplete(habit);
  };

  const isCompleted = habit.isCompletedToday;
  const currentCount = habit.todayCompletedCount || 0;
  const goal = habit.goal || 1;
  const frequencyText = habit.frequency === 'DAILY' ? 'today' : habit.frequency === 'WEEKLY' ? 'this week' : 'this month';

  return (
    <div
      onClick={() => onOpenDetails && onOpenDetails(habit)}
      className={`relative group rounded-2xl p-5 border transition-all duration-200 cursor-pointer hover:shadow-md hover:-translate-y-0.5 ${theme.bg} ${theme.border}`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0 pr-1">
          <h3 className={`font-bold text-sm sm:text-base tracking-tight truncate ${theme.text}`}>
            {habit.name}
          </h3>
          {habit.description && (
            <p className="text-xs text-slate-500 line-clamp-1 mt-0.5 font-normal">
              {habit.description}
            </p>
          )}
        </div>

        {/* Circular Checkmark Button matching Figma */}
        {!isArchiveView && !isTrashView && (
          <button
            type="button"
            onClick={handleCheckClick}
            title={isCompleted ? "Mark incomplete" : "Mark complete"}
            className={`w-6 h-6 rounded-full flex items-center justify-center transition-all active:scale-90 flex-shrink-0 ${
              isCompleted
                ? `${theme.checkBg} text-white shadow-xs`
                : `bg-white/80 border border-slate-300 text-transparent hover:border-slate-400 hover:text-slate-300`
            }`}
          >
            <Check size={13} strokeWidth={3} className={isCompleted ? "text-white" : "currentColor"} />
          </button>
        )}

        {/* Action icons on Archive view */}
        {isArchiveView && (
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => onUnarchive && onUnarchive(habit.id)}
              title="Restore to active"
              className="p-1.5 rounded-lg bg-white/80 hover:bg-white text-slate-600 hover:text-[#5B4DFC] shadow-xs transition-colors"
            >
              <RotateCcw size={14} />
            </button>
            <button
              onClick={() => onDelete && onDelete(habit.id)}
              title="Move to trash"
              className="p-1.5 rounded-lg bg-white/80 hover:bg-white text-slate-600 hover:text-rose-600 shadow-xs transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}

        {/* Action icons on Trash view */}
        {isTrashView && (
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => onRestore && onRestore(habit.id)}
              title="Restore habit"
              className="p-1.5 rounded-lg bg-white/80 hover:bg-white text-slate-600 hover:text-emerald-600 shadow-xs transition-colors"
            >
              <RotateCcw size={14} />
            </button>
            <button
              onClick={() => onDelete && onDelete(habit.id, true)}
              title="Permanently delete"
              className="p-1.5 rounded-lg bg-white/80 hover:bg-white text-slate-600 hover:text-rose-600 shadow-xs transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Label Chips */}
      <div className="flex flex-wrap items-center gap-1.5 mb-4 min-h-[20px]">
        {habit.labels && habit.labels.length > 0 ? (
          habit.labels.map((lbl) => (
            <span
              key={lbl.id}
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${theme.tagBg} ${theme.tagText}`}
            >
              {lbl.name}
            </span>
          ))
        ) : (
          <span className="text-[10px] text-slate-400 italic">No labels</span>
        )}
      </div>

      {/* Frequency & Progress text matching Figma */}
      <div className="flex items-center justify-between text-xs font-semibold text-slate-600 pt-2 border-t border-black/5">
        <span className="text-[11px] font-medium text-slate-500">
          {currentCount}/{goal} times {frequencyText}
        </span>
        {isCompleted && (
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/90 px-1.5 py-0.5 rounded-md">
            Done
          </span>
        )}
      </div>
    </div>
  );
}
