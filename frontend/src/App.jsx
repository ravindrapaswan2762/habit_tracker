import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import Sidebar from './components/Sidebar';
import HomePage from './pages/HomePage';
import LabelsPage from './pages/LabelsPage';
import ArchivePage from './pages/ArchivePage';
import TrashPage from './pages/TrashPage';
import ProfilePage from './pages/ProfilePage';
import NewHabitModal from './components/NewHabitModal';
import HabitDetailModal from './components/HabitDetailModal';
import { Menu, Plus, Home, Tag, Archive, Trash2, User } from 'lucide-react';

export default function App() {
  const { user, loading } = useAuth();

  const [activeTab, setActiveTab] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNewHabitOpen, setIsNewHabitOpen] = useState(false);
  const [selectedHabitId, setSelectedHabitId] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Key to force refresh lists when a habit is created or updated
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#5B4DFC]/20 border-t-[#5B4DFC] rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Loading Habit Tracker...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  const handleOpenHabitDetails = (habit) => {
    setSelectedHabitId(habit.id);
    setIsDetailOpen(true);
  };

  const handleHabitCreated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleHabitUpdated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleHabitDeleted = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col md:flex-row font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* Mobile Top Navigation Bar (Only on mobile < md) */}
      <header className="md:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 py-3 flex items-center justify-between shadow-2xs">
        {/* Left: Brand */}
        <div 
          className="flex items-center gap-1 cursor-pointer" 
          onClick={() => setActiveTab('home')}
        >
          <span className="text-lg font-black tracking-tight text-slate-900">
            My<span className="text-[#5B4DFC]">Website</span>
          </span>
        </div>

        {/* Right: Quick + Habit button & Hamburger Menu */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsNewHabitOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#5B4DFC] text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
          >
            <Plus size={14} strokeWidth={2.5} />
            <span>Habit</span>
          </button>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Open Menu"
          >
            <Menu size={22} />
          </button>
        </div>
      </header>

      {/* Sidebar: Desktop Persistent + Mobile Slide-over Drawer */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewHabit={() => setIsNewHabitOpen(true)}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content View (Full width on mobile, flexible on desktop) */}
      <main className="flex-1 w-full min-w-0 pb-20 md:pb-6 overflow-x-hidden">
        {activeTab === 'home' && (
          <HomePage
            key={`home-${refreshTrigger}`}
            onOpenNewHabit={() => setIsNewHabitOpen(true)}
            onOpenHabitDetails={handleOpenHabitDetails}
          />
        )}
        {activeTab === 'labels' && (
          <LabelsPage key={`labels-${refreshTrigger}`} />
        )}
        {activeTab === 'archive' && (
          <ArchivePage
            key={`archive-${refreshTrigger}`}
            onOpenHabitDetails={handleOpenHabitDetails}
          />
        )}
        {activeTab === 'trash' && (
          <TrashPage key={`trash-${refreshTrigger}`} />
        )}
        {activeTab === 'profile' && (
          <ProfilePage key={`profile-${refreshTrigger}`} />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar for ultra-fast 1-tap switching (Only on mobile < md) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-100 px-3 py-2 flex items-center justify-around shadow-lg">
        {[
          { id: 'home', label: 'Home', icon: Home },
          { id: 'labels', label: 'Labels', icon: Tag },
          { id: 'archive', label: 'Archive', icon: Archive },
          { id: 'trash', label: 'Trash', icon: Trash2 },
          { id: 'profile', label: 'Profile', icon: User }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-all ${
                isActive
                  ? 'text-[#5B4DFC]'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[10px] mt-0.5 ${isActive ? 'font-bold' : 'font-medium'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Modals */}
      <NewHabitModal
        isOpen={isNewHabitOpen}
        onClose={() => setIsNewHabitOpen(false)}
        onHabitCreated={handleHabitCreated}
      />

      {selectedHabitId && (
        <HabitDetailModal
          isOpen={isDetailOpen}
          habitId={selectedHabitId}
          onClose={() => {
            setIsDetailOpen(false);
            setSelectedHabitId(null);
          }}
          onHabitUpdated={handleHabitUpdated}
          onHabitDeleted={handleHabitDeleted}
        />
      )}
    </div>
  );
}
