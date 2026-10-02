import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import garbaLogoImg from '../../assets/image.png';

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

  // Significantly increased emblem dimensions for crisp visibility
  const iconSize =
    size === 'sm'
      ? 'w-10 h-10 sm:w-11 sm:h-11'
      : size === 'lg'
      ? 'w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28'
      : 'w-13 h-13 sm:w-16 sm:h-16 md:w-[68px] md:h-[68px]';

  const titleSize =
    size === 'sm'
      ? 'text-lg sm:text-xl'
      : size === 'lg'
      ? 'text-3xl sm:text-4xl md:text-5xl'
      : 'text-2xl sm:text-[28px] md:text-3xl';

  return (
    <Link
      to={targetPath}
      className={`inline-flex items-center gap-2.5 sm:gap-3 group transition-transform active:scale-95 ${className}`}
    >
      {/* High-visibility Brand Emblem */}
      <div className={`relative ${iconSize} flex-shrink-0 flex items-center justify-center`}>
        <img
          src={garbaLogoImg}
          alt="Garba Mitra Official Logo"
          className="w-full h-full object-contain filter drop-shadow-md group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      <div className={`flex flex-col justify-center ${hideTextOnMobile ? 'hidden sm:flex' : 'flex'}`}>
        <div className="flex items-center tracking-tight leading-none">
          <span
            className={`font-black ${titleSize} font-heading tracking-tight ${
              isDark ? 'text-white' : 'text-purple-950'
            }`}
          >
            Garba
          </span>
          <span
            className={`font-black ${titleSize} font-heading bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 bg-clip-text text-transparent ml-0.5`}
          >
            Mitra
          </span>
        </div>
        {showTagline && (
          <span
            className={`text-[11px] sm:text-xs font-semibold tracking-wide mt-1 leading-none ${
              isDark ? 'text-purple-200/80' : 'text-purple-600'
            }`}
          >
            No Partner? We’ve Got You.
          </span>
        )}
      </div>
    </Link>
  );
};
