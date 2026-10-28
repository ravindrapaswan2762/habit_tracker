import React from 'react';
import { Home, Tag, Archive, Trash2, Plus, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ activeTab, setActiveTab, onOpenNewHabit }) {
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'labels', label: 'Labels', icon: Tag },
    { id: 'archive', label: 'Archive', icon: Archive },
    { id: 'trash', label: 'Trash', icon: Trash2 },
  ];

  const fullName = user ? `${user.firstName} ${user.lastName}` : 'Guest User';
  const initials = user ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : 'G';

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-slate-200 flex flex-col justify-between p-6 select-none flex-shrink-0">
      <div>
        {/* Brand Logo */}
        <div className="flex items-center gap-2 mb-10 px-2 cursor-pointer" onClick={() => setActiveTab('home')}>
          <span className="text-2xl font-bold tracking-tight text-[#1E293B]">
            My<span className="text-[#5B4DFC]">Website</span>
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1 mb-8">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-slate-100 text-[#5B4DFC] shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon size={19} className={isActive ? 'text-[#5B4DFC]' : 'text-slate-500'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Create Habit Button */}
        <button
          onClick={onOpenNewHabit}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#5B4DFC] hover:bg-[#4d3fe6] active:scale-[0.98] text-white font-semibold text-sm shadow-md shadow-indigo-100 transition-all duration-150"
        >
          <Plus size={18} strokeWidth={2.5} />
          <span>Create New Habit</span>
        </button>
      </div>

      {/* User Footer */}
      <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
        <div
          onClick={() => setActiveTab('profile')}
          className="flex items-center gap-3 cursor-pointer group flex-1 mr-2 overflow-hidden"
        >
          <div className="w-10 h-10 rounded-full bg-slate-300 text-slate-700 flex items-center justify-center font-bold text-sm flex-shrink-0 group-hover:ring-2 ring-[#5B4DFC]/30 transition-all">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-[#5B4DFC] transition-colors">
              {fullName}
            </p>
            <p className="text-xs text-slate-400 group-hover:underline">
              View Profile
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          title="Sign out"
          className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
        >
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
}
