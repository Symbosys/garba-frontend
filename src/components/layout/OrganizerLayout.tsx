import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  Sparkles,
  LayoutDashboard,
  LogOut,
  Menu,
  Ticket,
  X,
  PlusCircle,
  Building2,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ToastContainer } from '../common/ToastContainer';

const navItems = [
  { label: 'Dashboard', path: '/organizer/dashboard', icon: LayoutDashboard, end: true },
  { label: 'Festival Events', path: '/organizer/events', icon: CalendarDays },
  { label: 'Ticket Bookings', path: '/organizer/bookings', icon: Ticket },
];

export const OrganizerLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const navigation = (mobile = false) => (
    <nav className="space-y-1.5">
      {navItems.map(({ label, path, icon: Icon, end }) => (
        <NavLink
          key={path}
          to={path}
          end={end}
          onClick={() => mobile && setOpen(false)}
          className={({ isActive }) =>
            `group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all ${
              isActive
                ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-pink-600 text-white shadow-lg shadow-pink-950/15'
                : 'text-slate-600 hover:bg-pink-50 hover:text-pink-700'
            }`
          }
        >
          <Icon className="h-4 w-4" />
          {label}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 md:flex">
      {/* Sidebar (Desktop Fixed) */}
      <aside className="hidden md:flex w-72 shrink-0 flex-col justify-between border-r border-slate-200 bg-white p-5 shadow-sm sticky top-0 h-screen overflow-hidden">
        <div>
          <div className="mb-8 flex items-center gap-3 px-2">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-amber-400 via-pink-500 to-purple-600 shadow-md shadow-pink-950/20 text-white">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-black tracking-tight text-purple-950 font-heading">GarbaMitra</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-600">Organizer Portal</p>
            </div>
          </div>

          {navigation()}

          <div className="mt-8 px-2">
            <NavLink
              to="/events"
              target="_blank"
              className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 text-purple-900 text-xs font-bold hover:shadow-xs transition"
            >
              <span className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-pink-600" />
                Live Festival Page
              </span>
              <ExternalLink className="w-3.5 h-3.5 text-purple-400" />
            </NavLink>
          </div>
        </div>

        <div className="mt-auto rounded-3xl border border-slate-200 bg-slate-50/80 p-4">
          <div className="mb-4 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-amber-100 text-amber-800 font-black text-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'O'}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-900">{user?.name || 'Festival Organizer'}</p>
              <p className="truncate text-[10px] font-bold text-amber-600 uppercase tracking-wider">EVENT ORGANIZER</p>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="min-w-0 flex-1 flex flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur-xl md:px-8 shadow-xs">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-pink-600 font-heading">Event Management</p>
            <p className="text-sm font-semibold text-slate-500">Festivals, Daily Slots &amp; Bookings</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen(!open)}
              className="rounded-xl border border-slate-200 p-2 text-slate-700 hover:bg-slate-100 md:hidden"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-[11px] font-bold text-amber-900">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Verified Organizer
            </div>
          </div>
        </header>

        {open && <div className="border-b border-slate-200 bg-white p-4 md:hidden">{navigation(true)}</div>}
        <main className="p-4 md:p-8 flex-1 bg-slate-50/70">
          <Outlet />
        </main>
      </div>
      <ToastContainer />
    </div>
  );
};
export default OrganizerLayout;
