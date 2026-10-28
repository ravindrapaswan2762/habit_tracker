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

export default function App() {
  const { user, loading } = useAuth();

  const [activeTab, setActiveTab] = useState('home');
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
    <div className="min-h-screen bg-[#F8F9FA] flex font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewHabit={() => setIsNewHabitOpen(true)}
      />

      {/* Main Content View */}
      <main className="flex-1 min-w-0 overflow-y-auto">
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

