import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Home, Search, Calendar, MessageCircle, User } from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const { isLoggedIn, unreadNotificationCount } = useApp();
  const location = useLocation();

  // Hide on admin routes to prevent cluttering admin operations
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-purple-100 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-3 py-1.5 pb-safe">
      <div className="flex items-center justify-around relative">
        {/* Home */}
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-2.5 rounded-xl transition-colors ${
              isActive ? 'text-purple-900 font-bold' : 'text-slate-500 hover:text-purple-700'
            }`
          }
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Home</span>
        </NavLink>

        {/* Find Partner */}
        <NavLink
          to="/find-partner"
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-2.5 rounded-xl transition-colors ${
              isActive ? 'text-purple-900 font-bold' : 'text-slate-500 hover:text-purple-700'
            }`
          }
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Find</span>
        </NavLink>

        {/* Events */}
        <NavLink
          to="/events"
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-2.5 rounded-xl transition-colors ${
              isActive ? 'text-purple-900 font-bold' : 'text-slate-500 hover:text-purple-700'
            }`
          }
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Events</span>
        </NavLink>

        {/* Messages or Login */}
        <NavLink
          to={isLoggedIn ? '/messages' : '/login'}
          className={({ isActive }) =>
            `relative flex flex-col items-center py-1 px-2.5 rounded-xl transition-colors ${
              isActive ? 'text-purple-900 font-bold' : 'text-slate-500 hover:text-purple-700'
            }`
          }
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">{isLoggedIn ? 'Chat' : 'Login'}</span>
        </NavLink>

        {/* Profile */}
        <NavLink
          to={isLoggedIn ? '/profile' : '/register'}
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-2.5 rounded-xl transition-colors ${
              isActive ? 'text-purple-900 font-bold' : 'text-slate-500 hover:text-purple-700'
            }`
          }
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">{isLoggedIn ? 'Profile' : 'Join'}</span>
        </NavLink>
      </div>
    </div>
  );
};
