import React, { useState, useEffect, useRef } from 'react';
import lottie from 'lottie-web';
import loginAnimation from '../assets/login.json';
import { useAuth } from '../context/AuthContext';
import { X, Sparkles } from 'lucide-react';

function CharacterAnimation() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let anim = null;
    try {
      anim = lottie.loadAnimation({
        container: containerRef.current,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        animationData: loginAnimation,
        rendererSettings: {
          preserveAspectRatio: 'xMidYMid meet',
          progressiveLoad: true,
          hideOnTransparent: false
        }
      });
    } catch (err) {
      console.error('Failed to load lottie animation:', err);
    }

    return () => {
      if (anim) {
        try {
          anim.destroy();
        } catch (e) {}
      }
    };
  }, []);

  return (
    <div className="w-full max-w-[280px] sm:max-w-[340px] md:max-w-[390px] lg:max-w-[440px] h-[340px] sm:h-[420px] md:h-[480px] lg:h-[520px] flex items-center justify-center relative select-none">
      <div
        ref={containerRef}
        className="w-full h-full flex items-center justify-center [&_svg]:max-h-full [&_svg]:w-auto [&_svg]:mx-auto"
      />
    </div>
  );
}

export default function LandingPage() {
  const { login, signup } = useAuth();

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'

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
    <div className="min-h-screen bg-[#F0F2F5] sm:bg-[#EAEAEA] flex items-center justify-center p-0 sm:p-6 md:p-10 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Main Hero Card matching exact Figma design */}
      <div className="w-full max-w-6xl min-h-screen sm:min-h-0 bg-white sm:rounded-[36px] sm:shadow-xl sm:border border-slate-100 overflow-hidden flex flex-col justify-between p-6 sm:p-10 md:p-14 lg:p-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Branding, Headline, Paragraph, Actions */}
          <div className="lg:col-span-7 flex flex-col justify-center order-2 lg:order-1 text-left">
            {/* Brand Logo matching image: 'My' in purple, 'Website' in dark black */}
            <div className="mb-8 sm:mb-12 md:mb-16">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight select-none">
                <span className="text-[#5B4DFC]">My</span>
                <span className="text-[#111827]">Website</span>
              </h1>
            </div>

            {/* Headline matching image */}
            <div className="space-y-1 mb-5 sm:mb-6">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#111827] tracking-tight leading-tight">
                Meet your modern
              </h2>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#5B4DFC] tracking-tight leading-tight">
                Habit Tracker App
              </h2>
            </div>

            {/* Description matching image */}
            <p className="text-slate-700 text-sm sm:text-base md:text-lg max-w-md font-normal leading-relaxed mb-8 sm:mb-10">
              Manage your daily tasks and workflow in a modern way and boost your efficiency without any efforts.
            </p>

            {/* Actions */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                {/* Clicking on Join Now / Login button opens the LOGIN form */}
                <button
                  type="button"
                  onClick={() => openAuth('login')}
                  className="px-8 sm:px-9 py-3 rounded-md bg-[#5B4DFC] hover:bg-[#483cd4] active:scale-[0.98] text-white font-medium text-sm sm:text-base shadow-sm transition-all duration-150 inline-flex items-center justify-center cursor-pointer"
                >
                  Join Now
                </button>

                <button
                  type="button"
                  onClick={handleDemoLogin}
                  disabled={loading}
                  className="px-5 py-3 rounded-md bg-indigo-50 hover:bg-indigo-100 text-[#5B4DFC] font-semibold text-xs sm:text-sm border border-indigo-100 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles size={15} />
                  <span>Demo One-Click</span>
                </button>
              </div>

              <div>
                {/* Clicking on 'Already have an account?' opens the SIGNUP form popup */}
                <button
                  type="button"
                  onClick={() => openAuth('signup')}
                  className="text-xs sm:text-sm font-medium text-[#5B4DFC] hover:underline cursor-pointer block pt-1"
                >
                  Already have an account?
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Lottie Animation from assets/login.json */}
          <div className="lg:col-span-5 flex items-center justify-center order-1 lg:order-2 py-4 lg:py-0">
            <CharacterAnimation />
          </div>

        </div>
      </div>

      {/* Auth Modal (Sign Up & Log In) */}
      {isAuthOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-[420px] shadow-2xl border border-slate-100 p-7 relative">
            <button
              onClick={() => setIsAuthOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X size={18} />
            </button>

            {/* Modal Title & Subtitle */}
            <div className="mb-5">
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {authMode === 'login'
                  ? 'Log in to track your habits and streaks'
                  : 'Start building lasting habits today'}
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
                    : authMode === 'login'
                    ? 'Sign In'
                    : 'Create Free Account'}
                </button>
              </div>

              {/* Sub-link inside modal to toggle between login and signup */}
              <div className="text-center pt-1">
                {authMode === 'login' ? (
                  <p className="text-xs text-slate-500">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => { setAuthMode('signup'); setError(null); }}
                      className="text-[#5B4DFC] font-semibold hover:underline"
                    >
                      Sign Up
                    </button>
                  </p>
                ) : (
                  <p className="text-xs text-slate-500">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => { setAuthMode('login'); setError(null); }}
                      className="text-[#5B4DFC] font-semibold hover:underline"
                    >
                      Log In
                    </button>
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
