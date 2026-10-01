import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CalendarDays, Eye, EyeOff, LoaderCircle, Lock, Mail, ShieldCheck, Sparkles, UsersRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { ApiError } from '../../lib/api-client';
import { GarbaLogo } from '../../components/common/GarbaLogo';

const destination = (role?: string) =>
  role === 'SUPER_ADMIN' ? '/admin' : role === 'ORGANIZER' ? '/events/my-events' : '/dashboard';

export const LoginPage: React.FC = () => {
  const { user, isAuthenticated, isRestoring, login } = useAuth();
  const { showToast } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isRestoring && isAuthenticated) {
      navigate(destination(user?.role), { replace: true });
    }
  }, [isAuthenticated, isRestoring, navigate, user?.role]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const result = await login(email, password, remember);
      showToast('Welcome back! 🎉', `Signed in successfully as ${result.user.name}`, 'success');
      navigate(destination(result.user.role), { replace: true });
    } catch (caught) {
      const message = caught instanceof ApiError ? caught.message : 'Unable to sign in. Please verify your credentials.';
      setError(message);
      showToast('Sign In Failed', message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="relative min-h-screen bg-cover bg-center bg-no-repeat text-slate-900 px-4 py-8 md:py-12 overflow-hidden flex flex-col justify-center"
      style={{ backgroundImage: "url('/login-bg.jpg')" }}
    >
      {/* Light Frosted Backdrop Overlay for Garba Aesthetic & Readability */}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px]" />
      <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-rose-200/40 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 -right-24 h-96 w-96 rounded-full bg-amber-200/35 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-1/3 h-80 w-80 rounded-full bg-orange-200/30 blur-3xl" />

      <div className="relative mx-auto w-full max-w-6xl grid items-center gap-10 lg:grid-cols-[1.1fr_.9fr]">
        {/* Left Side: Festive Branding and Highlights */}
        <section className="hidden lg:flex flex-col justify-center pr-4">
          <div className="mb-6">
            <GarbaLogo size="lg" />
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white/90 px-4 py-2 text-xs font-bold text-rose-700 w-fit mb-6 shadow-sm">
            <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
            <span>Celebrate Navratri 2026 With Joy & Safety</span>
          </div>

          <h1 className="text-5xl font-black leading-[1.15] tracking-tight text-slate-900">
            Find Your Garba Partner.{' '}
            <span className="bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 bg-clip-text text-transparent">
              Dance, Celebrate & Connect.
            </span>
          </h1>

          <p className="mt-5 text-base leading-relaxed text-slate-700 max-w-lg font-medium">
            Join India’s premier verified community for Garba & Dandiya enthusiasts. Meet compatible dance partners, discover top venue passes, and enjoy safe celebrations.
          </p>

          <div className="mt-8 grid max-w-lg grid-cols-3 gap-3.5">
            <div className="rounded-2xl border border-rose-100 bg-white/90 p-4 shadow-sm backdrop-blur-sm transition-transform hover:-translate-y-0.5">
              <div className="mb-2.5 grid h-9 w-9 place-items-center rounded-xl bg-rose-100 text-rose-600">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <p className="text-xs font-bold text-slate-900">Verified Dancers</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Reviewed profiles</p>
            </div>

            <div className="rounded-2xl border border-amber-100 bg-white/90 p-4 shadow-sm backdrop-blur-sm transition-transform hover:-translate-y-0.5">
              <div className="mb-2.5 grid h-9 w-9 place-items-center rounded-xl bg-amber-100 text-amber-600">
                <CalendarDays className="h-5 w-5" />
              </div>
              <p className="text-xs font-bold text-slate-900">Festival Events</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Citywide nights</p>
            </div>

            <div className="rounded-2xl border border-orange-100 bg-white/90 p-4 shadow-sm backdrop-blur-sm transition-transform hover:-translate-y-0.5">
              <div className="mb-2.5 grid h-9 w-9 place-items-center rounded-xl bg-orange-100 text-orange-600">
                <UsersRound className="h-5 w-5" />
              </div>
              <p className="text-xs font-bold text-slate-900">Dance Squads</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Group meetups</p>
            </div>
          </div>
        </section>

        {/* Right Side: Clean Professional Light Mode Card */}
        <section className="rounded-3xl border border-rose-100/90 bg-white/95 p-6 sm:p-10 shadow-2xl shadow-rose-950/10 backdrop-blur-xl">
          <div className="lg:hidden mb-6 flex justify-center">
            <GarbaLogo size="md" />
          </div>

          <div className="mb-7">
            <div className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-800 border border-amber-200/60 mb-2">
              <Sparkles className="h-3 w-3 text-amber-600" />
              Welcome to GarbaMitra
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Sign In to Your Account</h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">Enter your credentials to access your dashboard</p>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700 flex items-start gap-3">
              <span className="mt-0.5 inline-block h-2 w-2 rounded-full bg-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-slate-700">Email Address</span>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  required
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-3 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-rose-500 focus:bg-white focus:ring-4 focus:ring-rose-500/10"
                  placeholder="name@example.com"
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-slate-700">Password</span>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  required
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-3 pl-10 pr-11 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-rose-500 focus:bg-white focus:ring-4 focus:ring-rose-500/10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </label>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 font-medium select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500 accent-rose-600 cursor-pointer"
                />
                Remember me
              </label>
              <Link to="/forgot-password" className="font-bold text-rose-600 hover:text-rose-700 transition">
                Forgot password?
              </Link>
            </div>

            <button
              disabled={submitting}
              type="submit"
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-rose-600/20 hover:from-rose-700 hover:to-amber-700 transition-all transform active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  <span>Signing In…</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-600">
              New to GarbaMitra?{' '}
              <Link to="/register" className="font-bold text-rose-600 hover:text-rose-700 underline underline-offset-2">
                Create a verified account
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};
