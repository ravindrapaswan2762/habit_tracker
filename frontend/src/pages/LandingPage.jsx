import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  X,
  ArrowRight,
  Play,
  CheckCircle2,
  Zap,
  ShieldCheck,
  Dumbbell,
  Sparkles
} from 'lucide-react';
import heroCharacter from '../assets/hero-character.png';

export default function LandingPage() {
  const { login, signup } = useAuth();

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signup'); // 'signup' or 'login'

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const openAuth = (mode) => {
    setAuthMode(mode);
    setError(null);
    setIsAuthOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (authMode === 'signup') {
        await signup(firstName, lastName, email, password);
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await login('tanay@example.com', 'password123');
    } catch (err) {
      try {
        await signup('Tanay', 'Pratap', 'tanay@example.com', 'password123');
      } catch (signupErr) {
        setError(signupErr.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] via-white to-[#F1F5F9] font-['Plus_Jakarta_Sans',sans-serif] flex flex-col justify-between">
      
      {/* Top Header Navbar */}
      <header className="w-full max-w-7xl mx-auto px-6 sm:px-10 py-6 flex items-center justify-between">
        <div className="flex items-center gap-1.5 cursor-pointer">
          <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            My<span className="text-[#5B4DFC]">Website</span>
          </span>
        </div>

        {/* Top Navbar Actions */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => openAuth('login')}
            className="px-4 py-2 text-xs sm:text-sm font-bold text-slate-700 hover:text-[#5B4DFC] transition-colors cursor-pointer"
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => openAuth('signup')}
            className="px-5 py-2.5 rounded-xl bg-[#5B4DFC] hover:bg-[#483cd4] text-white text-xs sm:text-sm font-bold shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            Sign Up
          </button>
        </div>
      </header>

      {/* Main Hero Container */}
      <main className="w-full max-w-7xl mx-auto px-6 sm:px-10 py-6 sm:py-10 lg:py-14 flex-1 flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center w-full">
          
          {/* Left Column: Pill badge, Headline, Description, CTAs, Feature Badges */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-left">
            
            {/* Top Pill Badge matching image */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50/80 border border-indigo-100 text-[#5B4DFC] text-xs font-semibold shadow-2xs">
              <Dumbbell size={14} className="text-[#5B4DFC]" />
              <span>Fitness • Health • Better You</span>
            </div>

            {/* Headline matching image */}
            <div className="space-y-1">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
                Meet your modern
              </h1>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#5B4DFC] tracking-tight leading-[1.15]">
                Habit Tracker App
              </h1>
            </div>

            {/* Subtitle matching image */}
            <p className="text-slate-500 text-base sm:text-lg max-w-lg font-normal leading-relaxed">
              Manage your daily tasks and workflow in a modern way and boost your efficiency without any efforts.
            </p>

            {/* CTAs matching image */}
            <div className="space-y-3.5 pt-2">
              <div className="flex flex-wrap items-center gap-4">
                {/* Join Now Button */}
                <button
                  type="button"
                  onClick={() => openAuth('signup')}
                  className="px-8 py-3.5 rounded-2xl bg-[#5B4DFC] hover:bg-[#483cd4] active:scale-[0.98] text-white font-bold text-sm sm:text-base shadow-lg shadow-indigo-200 transition-all duration-150 inline-flex items-center gap-2 cursor-pointer"
                >
                  <span>Join Now</span>
                  <ArrowRight size={17} />
                </button>

                {/* Watch Demo / Login Button */}
                <button
                  type="button"
                  onClick={() => openAuth('login')}
                  className="px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 active:scale-[0.98] text-slate-700 font-bold text-sm sm:text-base border border-slate-200 shadow-2xs transition-all duration-150 inline-flex items-center gap-2.5 cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-[#5B4DFC] text-white flex items-center justify-center">
                    <Play size={11} fill="white" className="ml-0.5" />
                  </div>
                  <span>Watch Demo</span>
                </button>

                {/* Fast One-Click Tester Login */}
                <button
                  type="button"
                  onClick={handleDemoLogin}
                  disabled={loading}
                  className="px-4 py-3.5 rounded-2xl bg-indigo-50/70 hover:bg-indigo-100/70 text-[#5B4DFC] font-bold text-xs border border-indigo-100 transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Instant Evaluator Demo Login"
                >
                  <Sparkles size={14} />
                  <span>One-Click Login</span>
                </button>
              </div>

              {/* Already have an account? link */}
              <div>
                <button
                  type="button"
                  onClick={() => openAuth('login')}
                  className="text-xs sm:text-sm font-semibold text-[#5B4DFC] hover:underline cursor-pointer"
                >
                  Already have an account?
                </button>
              </div>
            </div>

            {/* Feature Badges Row matching image */}
            <div className="pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-5">
              {/* Feature 1 */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#5B4DFC] flex-shrink-0">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-800 leading-tight">
                    Track Progress
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Stay consistent</p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-[#5B4DFC] flex-shrink-0">
                  <Zap size={20} />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-800 leading-tight">
                    Build Habits
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Create better you</p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#5B4DFC] flex-shrink-0">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-800 leading-tight">
                    Achieve Goals
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">One step at a time</p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Hero Character Visual matching uploaded image */}
          <div className="lg:col-span-5 flex items-center justify-center relative">
            <div className="relative w-full max-w-[480px] flex items-center justify-center">
              {/* Soft decorative ambient glow */}
              <div className="absolute w-72 h-72 rounded-full bg-indigo-100/60 blur-3xl -z-10"></div>
              
              <img
                src={heroCharacter}
                alt="Fitness & Habit Tracker App"
                className="w-full h-auto object-contain select-none drop-shadow-xl"
              />
            </div>
          </div>

        </div>
      </main>

      {/* Footer copyright */}
      <footer className="w-full max-w-7xl mx-auto px-6 sm:px-10 py-6 text-center text-xs text-slate-400">
        © 2026 MyWebsite Habit Tracker. Designed for consistency & efficiency.
      </footer>

      {/* Auth Modal (Sign Up & Log In) */}
      {isAuthOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-[420px] shadow-2xl border border-slate-100 p-7 sm:p-8 relative">
            {/* Close button */}
            <button
              onClick={() => setIsAuthOpen(false)}
              className="absolute top-6 right-6 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X size={18} />
            </button>

            {/* Modal Title */}
            <div className="mb-5">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {authMode === 'signup' ? 'Create Account' : 'Welcome Back'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {authMode === 'signup'
                  ? 'Start building lasting habits today'
                  : 'Log in to track your habits and streaks'}
              </p>
            </div>

            {/* Tab switch */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl mb-5">
              <button
                type="button"
                onClick={() => { setAuthMode('login'); setError(null); }}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  authMode === 'login'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('signup'); setError(null); }}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  authMode === 'signup'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Sign Up
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {authMode === 'signup' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">First Name</label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Tanay"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#5B4DFC] focus:ring-2 focus:ring-[#5B4DFC]/10 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Pratap"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#5B4DFC] focus:ring-2 focus:ring-[#5B4DFC]/10 transition-all"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#5B4DFC] focus:ring-2 focus:ring-[#5B4DFC]/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#5B4DFC] focus:ring-2 focus:ring-[#5B4DFC]/10 transition-all"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-[#5B4DFC] hover:bg-[#483cd4] text-white font-bold text-xs shadow-md shadow-indigo-100 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {loading
                    ? 'Please wait...'
                    : authMode === 'signup'
                    ? 'Create Free Account'
                    : 'Sign In'}
                </button>
              </div>

              {/* Bottom toggle link */}
              <div className="text-center pt-2">
                {authMode === 'signup' ? (
                  <button
                    type="button"
                    onClick={() => { setAuthMode('login'); setError(null); }}
                    className="text-xs text-slate-500 hover:text-[#5B4DFC] font-medium"
                  >
                    Already have an account? <span className="font-bold text-[#5B4DFC] underline">Log In</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => { setAuthMode('signup'); setError(null); }}
                    className="text-xs text-slate-500 hover:text-[#5B4DFC] font-medium"
                  >
                    Don't have an account? <span className="font-bold text-[#5B4DFC] underline">Sign Up</span>
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
