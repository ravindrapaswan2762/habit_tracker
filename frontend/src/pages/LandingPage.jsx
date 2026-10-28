import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';

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
      // First try logging into default demo user
      await login('tanay@example.com', 'password123');
    } catch (err) {
      // If not yet created, create demo user
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
    <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center p-4 md:p-8 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Main Container Card matching Figma Landing Page */}
      <div className="w-full max-w-5xl bg-white rounded-[36px] shadow-xl border border-slate-100 overflow-hidden p-8 md:p-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Copy & Actions */}
        <div className="lg:col-span-7 space-y-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 flex items-center gap-2">
              My<span className="text-[#5B4DFC]">Website</span>
            </h1>
          </div>

          <div className="space-y-4">
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
              Meet your modern <br />
              <span className="text-[#5B4DFC]">Habit Tracker App</span>
            </h2>

            <p className="text-slate-500 text-base md:text-lg max-w-lg leading-relaxed font-normal">
              Manage your daily tasks and workflow in a modern way and boost your efficiency without any efforts.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => openAuth('signup')}
                className="px-8 py-3.5 rounded-2xl bg-[#5B4DFC] hover:bg-[#4d3fe6] active:scale-95 text-white font-bold text-base shadow-lg shadow-indigo-200 transition-all duration-150 flex items-center gap-2"
              >
                <span>Join Now</span>
                <ArrowRight size={18} />
              </button>

              <button
                onClick={handleDemoLogin}
                disabled={loading}
                className="px-6 py-3.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 active:scale-95 text-[#5B4DFC] font-bold text-sm transition-all duration-150 flex items-center gap-2 border border-indigo-100"
              >
                <Sparkles size={16} />
                <span>Demo One-Click Login</span>
              </button>
            </div>

            <div>
              <button
                onClick={() => openAuth('login')}
                className="text-sm font-semibold text-[#5B4DFC] hover:underline cursor-pointer"
              >
                Already have an account?
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: High Fidelity 3D Explorer Illustration */}
        <div className="lg:col-span-5 flex items-center justify-center">
          <div className="relative w-full max-w-[340px] aspect-square flex items-center justify-center">
            {/* Soft decorative background circles */}
            <div className="absolute w-72 h-72 rounded-full bg-gradient-to-tr from-indigo-100/60 to-purple-50 blur-xl"></div>
            
            {/* SVG Visual Representation of the Flag Climber Character */}
            <svg viewBox="0 0 400 400" className="w-full h-full relative z-10 drop-shadow-xl" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366F1" />
                  <stop offset="100%" stopColor="#4338CA" />
                </linearGradient>
                <linearGradient id="flagGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="100%" stopColor="#E2E8F0" />
                </linearGradient>
                <linearGradient id="backpackGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F97316" />
                  <stop offset="100%" stopColor="#EA580C" />
                </linearGradient>
                <filter id="shadow" x="-10%" y="-10%" width="130%" height="130%">
                  <feDropShadow dx="0" dy="8" stdDeviation="6" floodOpacity="0.15" />
                </filter>
              </defs>

              {/* Base Platform / Rock */}
              <ellipse cx="200" cy="360" rx="140" ry="24" fill="#E2E8F0" />
              <ellipse cx="200" cy="358" rx="120" ry="18" fill="#CBD5E1" />

              {/* Backpack */}
              <rect x="235" y="165" width="45" height="75" rx="20" fill="url(#backpackGrad)" filter="url(#shadow)" />

              {/* Character Legs */}
              {/* Back Leg */}
              <path d="M 230 240 L 255 330 L 275 335 L 260 345 L 225 340 Z" fill="#334155" />
              {/* Front Leg on Step */}
              <path d="M 185 240 L 155 290 L 185 320 L 195 325 L 150 330 Z" fill="#1E293B" />

              {/* Character Body / Torso (Blue Puffer Jacket) */}
              <rect x="175" y="150" width="70" height="95" rx="32" fill="url(#bodyGrad)" filter="url(#shadow)" />

              {/* Head / Face */}
              <circle cx="210" cy="115" r="24" fill="#FCD34D" filter="url(#shadow)" />
              {/* Hair / Cap */}
              <path d="M 188 112 C 188 95, 232 95, 232 112 Z" fill="#1E293B" />

              {/* Raised Left Arm with Victory Fist */}
              <path d="M 235 165 Q 260 145 250 120" stroke="#6366F1" strokeWidth="22" strokeLinecap="round" />
              <circle cx="250" cy="115" r="13" fill="#FCD34D" />

              {/* Right Hand Holding Flagpole */}
              <path d="M 185 175 Q 160 195 150 205" stroke="#4F46E5" strokeWidth="20" strokeLinecap="round" />
              <circle cx="148" cy="208" r="13" fill="#FCD34D" />

              {/* Flagpole */}
              <line x1="140" y1="60" x2="155" y2="355" stroke="#78350F" strokeWidth="6" strokeLinecap="round" />

              {/* White Flag Flying */}
              <path d="M 143 65 L 230 75 Q 215 95 230 115 L 145 105 Z" fill="url(#flagGrad)" filter="url(#shadow)" />

              {/* Floating Success Badges */}
              <g transform="translate(60, 120)" className="animate-bounce" style={{ animationDuration: '3s' }}>
                <rect width="44" height="44" rx="14" fill="#10B981" filter="url(#shadow)" />
                <path d="M 14 22 L 20 28 L 30 16" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              </g>

              <g transform="translate(290, 210)" className="animate-bounce" style={{ animationDuration: '4s' }}>
                <rect width="40" height="40" rx="12" fill="#5B4DFC" filter="url(#shadow)" />
                <text x="12" y="26" fill="#FFFFFF" fontSize="20" fontWeight="bold">🔥</text>
              </g>
            </svg>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      {isAuthOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 p-8 relative">
            <button
              onClick={() => setIsAuthOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X size={20} />
            </button>

            {/* Modal Title & Tabs */}
            <div className="mb-6">
              <h3 className="text-2xl font-black text-slate-800">
                {authMode === 'signup' ? 'Create Account' : 'Welcome Back'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {authMode === 'signup'
                  ? 'Start building lasting habits today'
                  : 'Log in to track your habits and streaks'}
              </p>
            </div>

            {/* Tab switch */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl mb-6">
              <button
                type="button"
                onClick={() => { setAuthMode('signup'); setError(null); }}
                className={`py-2 text-xs font-bold rounded-xl transition-all ${
                  authMode === 'signup'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Sign Up
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('login'); setError(null); }}
                className={`py-2 text-xs font-bold rounded-xl transition-all ${
                  authMode === 'login'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Log In
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {authMode === 'signup' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">First Name</label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Tanay"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B4DFC]/30 focus:border-[#5B4DFC]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Last Name</label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Pratap"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B4DFC]/30 focus:border-[#5B4DFC]"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B4DFC]/30 focus:border-[#5B4DFC]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B4DFC]/30 focus:border-[#5B4DFC]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-[#5B4DFC] hover:bg-[#4d3fe6] text-white font-bold text-sm shadow-md shadow-indigo-100 transition-all disabled:opacity-50"
                >
                  {loading
                    ? 'Please wait...'
                    : authMode === 'signup'
                    ? 'Create Free Account'
                    : 'Sign In'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
