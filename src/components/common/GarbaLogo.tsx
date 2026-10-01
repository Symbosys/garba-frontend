import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

interface GarbaLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  isDark?: boolean;
  className?: string;
  hideTextOnMobile?: boolean;
}

export const GarbaLogo: React.FC<GarbaLogoProps> = ({
  size = 'md',
  showTagline = false,
  isDark = false,
  className = '',
  hideTextOnMobile = false,
}) => {
  const { isLoggedIn, isAdmin } = useApp();
  const targetPath = isLoggedIn ? (isAdmin ? '/admin' : '/dashboard') : '/';

  const iconSize = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-12 h-12' : 'w-10 h-10';
  const titleSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl md:text-3xl' : 'text-xl md:text-2xl';

  return (
    <Link to={targetPath} className={`inline-flex items-center gap-2.5 group transition-transform active:scale-95 ${className}`}>
      {/* Festive Icon with Dancing Figure & Dandiya Sticks Motif */}
      <div className={`relative ${iconSize} flex-shrink-0`}>
        <div className="absolute inset-0 rounded-2xl festive-gradient transform -rotate-6 group-hover:rotate-0 transition-transform duration-300 shadow-md shadow-fuchsia-500/20" />
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-purple-900 via-pink-600 to-amber-400 opacity-90" />
        <svg
          viewBox="0 0 40 40"
          className="relative z-10 w-full h-full p-1.5 text-white filter drop-shadow"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Dandiya Stick 1 */}
          <line x1="8" y1="32" x2="32" y2="8" stroke="#FDE047" strokeWidth="3" strokeLinecap="round" />
          {/* Dandiya Stick 2 */}
          <line x1="10" y1="10" x2="30" y2="30" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" opacity="0.9" />
          {/* Festive Swirl / Dancing Motion */}
          <circle cx="20" cy="14" r="4.5" fill="#F43F5E" />
          <path
            d="M12 28 C16 20, 24 20, 28 28"
            stroke="#F59E0B"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle cx="20" cy="20" r="1.5" fill="#FFFFFF" />
        </svg>
      </div>

      <div className={`flex-col ${hideTextOnMobile ? 'hidden sm:flex' : 'flex'}`}>
        <div className="flex items-center tracking-tight">
          <span className={`font-black ${titleSize} font-heading tracking-tight ${isDark ? 'text-white' : 'text-purple-950'}`}>
            Garba
          </span>
          <span className={`font-black ${titleSize} font-heading bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 bg-clip-text text-transparent`}>
            Mitra
          </span>
        </div>
        {showTagline && (
          <span className={`text-[10px] font-medium tracking-wide -mt-1 ${isDark ? 'text-purple-200/70' : 'text-purple-600/80'}`}>
            No Partner? We’ve Got You.
          </span>
        )}
      </div>
    </Link>
  );
};
