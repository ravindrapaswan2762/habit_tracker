import React from 'react';
import { Home, Tag, Archive, Trash2, Plus, LogOut, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({
  activeTab,
  setActiveTab,
  onOpenNewHabit,
  isMobileOpen = false,
  onCloseMobile = () => {}
}) {
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'labels', label: 'Labels', icon: Tag },
    { id: 'archive', label: 'Archive', icon: Archive },
    { id: 'trash', label: 'Trash', icon: Trash2 },
  ];

  const fullName = user ? `${user.firstName} ${user.lastName}` : 'Tanay Pratap';
  const initials = user ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : 'TP';

  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    onCloseMobile();
  };

  const handleCreateHabitClick = () => {
    onOpenNewHabit();
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full p-6 select-none">
      <div>
        {/* Brand Logo & Mobile Close button */}
        <div className="flex items-center justify-between mb-8 px-1">
          <div 
            className="flex items-center gap-1.5 cursor-pointer" 
            onClick={() => handleNavClick('home')}
          >
            <span className="text-xl font-extrabold tracking-tight text-slate-900">
              My<span className="text-[#5B4DFC]">Website</span>
            </span>
          </div>

          {/* Close button for mobile drawer */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1 mb-8">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-slate-100 text-[#5B4DFC]'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon size={17} className={isActive ? 'text-[#5B4DFC]' : 'text-slate-400'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Create Habit Button */}
        <button
          onClick={handleCreateHabitClick}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#5B4DFC] hover:bg-[#4d3fe6] active:scale-[0.98] text-white font-semibold text-xs shadow-md shadow-indigo-100 transition-all duration-150 cursor-pointer"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>Create New Habit</span>
        </button>
      </div>

      {/* User Footer */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        <div
          onClick={() => handleNavClick('profile')}
          className="flex items-center gap-2.5 cursor-pointer group flex-1 mr-2 overflow-hidden"
        >
          <div className="w-8 h-8 rounded-full bg-slate-300 text-slate-700 flex items-center justify-center font-bold text-xs flex-shrink-0 group-hover:ring-2 ring-[#5B4DFC]/30 transition-all">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-800 truncate group-hover:text-[#5B4DFC] transition-colors leading-tight">
              {fullName}
            </p>
            <p className="text-[10px] text-slate-400 group-hover:underline">
              View Profile
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          title="Sign out"
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
        >
          <LogOut size={16} />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop Persistent Sidebar (Hidden on mobile < md) */}
      <aside className="hidden md:flex w-60 min-h-screen bg-white border-r border-slate-100 flex-col flex-shrink-0 sticky top-0 h-screen overflow-y-auto">
        {sidebarContent}
      </aside>

      {/* 2. Mobile Drawer Overlay (Visible on mobile when isMobileOpen is true) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop blur */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity animate-fade-in"
            onClick={onCloseMobile}
          />

          {/* Slide-over panel */}
          <div className="relative w-72 max-w-[80vw] h-full bg-white shadow-2xl flex flex-col z-10 animate-slide-right">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
