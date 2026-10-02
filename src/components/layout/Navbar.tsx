import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useConversations } from '../../hooks/chat/useChat';
import { GarbaLogo } from '../common/GarbaLogo';
import {
  MapPin,
  Bell,
  User as UserIcon,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Heart,
  MessageCircle,
  Calendar,
  CheckCircle
} from 'lucide-react';

import { State, City } from 'country-state-city';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    isLoggedIn,
    isAdmin,
    logout,
    cities,
    selectedStateCode,
    setSelectedStateCode,
    selectedCity,
    setSelectedCity,
    notifications,
    unreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead
  } = useApp();

  const { data: apiConversations } = useConversations();
  const totalChats = React.useMemo(() => {
    return apiConversations ? apiConversations.length : 0;
  }, [apiConversations]);

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isStateDropdownOpen, setIsStateDropdownOpen] = useState(false);
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Search terms for separate State & City dropdowns
  const [stateSearchTerm, setStateSearchTerm] = useState<string>('');
  const [citySearchTerm, setCitySearchTerm] = useState<string>('');

  const stateDropdownRef = useRef<HTMLDivElement>(null);
  const cityDropdownRef = useRef<HTMLDivElement>(null);
  const notifDropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // All Indian States
  const allIndianStates = React.useMemo(() => {
    return State.getStatesOfCountry('IN');
  }, []);

  // Cities for currently selected State
  const citiesForState = React.useMemo(() => {
    if (!selectedStateCode) return City.getCitiesOfCountry('IN') || [];
    return City.getCitiesOfState('IN', selectedStateCode) || [];
  }, [selectedStateCode]);

  // Selected State Object
  const currentStateObj = React.useMemo(() => {
    return allIndianStates.find((s) => s.isoCode === selectedStateCode);
  }, [allIndianStates, selectedStateCode]);

  // Filtered States by search term
  const filteredStates = React.useMemo(() => {
    if (!stateSearchTerm) return allIndianStates;
    return allIndianStates.filter((s) =>
      s.name.toLowerCase().includes(stateSearchTerm.toLowerCase()) ||
      s.isoCode.toLowerCase().includes(stateSearchTerm.toLowerCase())
    );
  }, [allIndianStates, stateSearchTerm]);

  // Filtered Cities by search term
  const filteredCities = React.useMemo(() => {
    if (!citySearchTerm) return citiesForState;
    return citiesForState.filter((c) =>
      c.name.toLowerCase().includes(citySearchTerm.toLowerCase())
    );
  }, [citiesForState, citySearchTerm]);

  // Popular State Quick Filters
  const popularStates = [
    { name: 'Gujarat', code: 'GJ', defaultCity: 'Ahmedabad' },
    { name: 'Maharashtra', code: 'MH', defaultCity: 'Mumbai' },
    { name: 'Jharkhand', code: 'JH', defaultCity: 'Ranchi' },
    { name: 'Rajasthan', code: 'RJ', defaultCity: 'Jaipur' },
    { name: 'Madhya Pradesh', code: 'MP', defaultCity: 'Indore' },
    { name: 'Karnataka', code: 'KA', defaultCity: 'Bengaluru' },
    { name: 'Delhi', code: 'DL', defaultCity: 'New Delhi' }
  ];

  // Popular Garba Hotspots for quick city selection
  const popularHotspotsInState = React.useMemo(() => {
    const popularMap: Record<string, string[]> = {
      'GJ': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar', 'Bhavnagar'],
      'MH': ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik'],
      'JH': ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro Steel City', 'Deoghar'],
      'RJ': ['Jaipur', 'Udaipur', 'Jodhpur', 'Kota', 'Ajmer'],
      'MP': ['Indore', 'Bhopal', 'Gwalior', 'Jabalpur', 'Ujjain'],
      'KA': ['Bengaluru', 'Mysuru', 'Hubballi', 'Mangaluru'],
      'DL': ['Delhi', 'New Delhi']
    };
    return popularMap[selectedStateCode] || [];
  }, [selectedStateCode]);

  // Handle scroll shadow with hysteresis to prevent boundary flicker
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled((prev) => {
        if (!prev && currentScrollY > 30) return true;
        if (prev && currentScrollY < 10) return false;
        return prev;
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (stateDropdownRef.current && !stateDropdownRef.current.contains(event.target as Node)) {
        setIsStateDropdownOpen(false);
      }
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target as Node)) {
        setIsCityDropdownOpen(false);
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsNotifOpen(false);
    setIsUserMenuOpen(false);
    setIsStateDropdownOpen(false);
    setIsCityDropdownOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Find Partner', path: '/find-partner', badge: 'Popular' },
    { label: 'Events', path: '/events' },
    { label: 'Groups', path: '/groups' }
  ];

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-colors duration-200 h-[72px] sm:h-[78px] md:h-[82px] flex items-center border-b ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-xs border-slate-200/90'
          : 'bg-white/80 backdrop-blur-sm border-slate-100'
      }`}
    >
      <div className="max-w-[1550px] mx-auto px-4 sm:px-6 lg:px-8 w-full flex items-center justify-between">
        {/* Left: Logo */}
        <GarbaLogo showTagline={true} hideTextOnMobile={true} />

        {/* Center: Search Bar (when logged in) or Desktop Nav Links (when public) */}
        {isLoggedIn ? (
          <div className="hidden md:flex items-center relative flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search events, partners or groups..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const val = (e.target as HTMLInputElement).value;
                    if (val) navigate(`/find-partner?q=${encodeURIComponent(val)}`);
                  }
                }}
                className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs text-slate-800 placeholder-slate-400 pl-9 pr-4 py-2 rounded-full border border-slate-200/90 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all shadow-inner/10"
              />
              <svg
                className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        ) : (
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `relative px-3.5 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                    isActive
                      ? 'text-purple-900 bg-purple-100/70 font-bold'
                      : 'text-slate-600 hover:text-purple-900 hover:bg-purple-50/70'
                  }`
                }
              >
                {link.label}
                {link.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white leading-none">
                    {link.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        )}

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
          {/* 1. SEPARATE STATE SELECTOR DROPDOWN */}
          <div className="relative" ref={stateDropdownRef}>
            <button
              onClick={() => {
                setIsStateDropdownOpen(!isStateDropdownOpen);
                setIsCityDropdownOpen(false);
              }}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-bold text-purple-950 bg-purple-50 hover:bg-purple-100/80 border border-purple-200/90 rounded-full transition-all shadow-xs"
              title="Select State"
            >
              <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-pink-600 flex-shrink-0" />
              <span className="max-w-[55px] sm:max-w-[110px] truncate font-bold">
                {currentStateObj ? currentStateObj.name : 'State'}
              </span>
              <span className="text-[10px] px-1 py-0.2 rounded bg-purple-200/80 text-purple-900 font-extrabold hidden md:inline">
                {selectedStateCode}
              </span>
              <ChevronDown className={`w-3 h-3 text-purple-700 flex-shrink-0 transition-transform ${isStateDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isStateDropdownOpen && (
              <div className="fixed inset-x-3 top-16 sm:absolute sm:inset-auto sm:left-0 sm:top-full sm:mt-2 w-auto sm:w-80 rounded-2xl bg-white shadow-2xl border border-purple-100 p-3 z-50 animate-in fade-in-50 zoom-in-95 duration-150 space-y-2.5">
                {/* Header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-pink-600" />
                      Select State
                    </h4>
                    <p className="text-[10px] text-slate-500">All Indian States &amp; UTs</p>
                  </div>
                  <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                    {filteredStates.length} States
                  </span>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <input
                    type="text"
                    value={stateSearchTerm}
                    onChange={(e) => setStateSearchTerm(e.target.value)}
                    placeholder="Search State (e.g. Gujarat, Maharashtra)..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
                    autoFocus
                  />
                  <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  {stateSearchTerm && (
                    <button
                      onClick={() => setStateSearchTerm('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* Popular Garba States Chips */}
                {!stateSearchTerm && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Top States
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {popularStates.map((st) => (
                        <button
                          key={st.code}
                          onClick={() => {
                            setSelectedStateCode(st.code, st.name, '');
                            setSelectedCity('');
                            setIsStateDropdownOpen(false);
                            setIsCityDropdownOpen(true);
                          }}
                          className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border transition-all ${
                            selectedStateCode === st.code
                              ? 'bg-purple-900 text-white border-purple-900'
                              : 'bg-purple-50 hover:bg-purple-100 text-purple-900 border-purple-100'
                          }`}
                        >
                          {st.name} ({st.code})
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* State List */}
                <div className="max-h-56 overflow-y-auto py-1 space-y-0.5 border-t border-slate-50">
                  {filteredStates.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">
                      No state found matching "{stateSearchTerm}"
                    </div>
                  ) : (
                    filteredStates.map((st) => {
                      const isSelected = selectedStateCode === st.isoCode;
                      return (
                        <button
                          key={st.isoCode}
                          onClick={() => {
                            setSelectedStateCode(st.isoCode, st.name, '');
                            setSelectedCity('');
                            setIsStateDropdownOpen(false);
                            setIsCityDropdownOpen(true);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs text-left transition-colors ${
                            isSelected
                              ? 'bg-gradient-to-r from-purple-900 to-indigo-900 text-white font-bold shadow-sm'
                              : 'text-slate-700 hover:bg-purple-50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-pink-400' : 'bg-slate-300'}`} />
                            <span className="font-semibold">{st.name}</span>
                          </div>
                          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {st.isoCode}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 2. SEPARATE CITY SELECTOR DROPDOWN */}
          <div className="relative" ref={cityDropdownRef}>
            <button
              onClick={() => {
                setIsCityDropdownOpen(!isCityDropdownOpen);
                setIsStateDropdownOpen(false);
              }}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-bold text-slate-800 bg-slate-50/90 hover:bg-slate-100 border border-slate-200/80 rounded-full transition-all shadow-xs"
              title="Select City"
            >
              <span className="text-pink-600 text-xs flex-shrink-0">🏙️</span>
              <span className="max-w-[65px] sm:max-w-[120px] truncate font-bold text-slate-800">
                {selectedCity || 'All Cities'}
              </span>
              <ChevronDown className={`w-3 h-3 text-slate-600 flex-shrink-0 transition-transform ${isCityDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isCityDropdownOpen && (
              <div className="fixed inset-x-3 top-16 sm:absolute sm:inset-auto sm:left-auto sm:right-0 sm:top-full sm:mt-2 w-auto sm:w-88 rounded-2xl bg-white shadow-2xl border border-pink-100 p-3 z-50 animate-in fade-in-50 zoom-in-95 duration-150 space-y-2.5">
                {/* Header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="text-pink-600">🏙️</span>
                      Select City
                    </h4>
                    <p className="text-[10px] text-slate-500">
                      In {currentStateObj?.name || 'Selected State'} ({currentStateObj?.isoCode || 'IN'})
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setIsCityDropdownOpen(false);
                      setIsStateDropdownOpen(true);
                    }}
                    className="text-[10px] font-bold text-pink-600 hover:text-pink-700 bg-pink-50 px-2 py-0.5 rounded-full hover:bg-pink-100 transition-colors"
                    title="Change State"
                  >
                    Change State ↺
                  </button>
                </div>

                {/* Option 1: View Entire State (All Cities) */}
                <button
                  onClick={() => {
                    setSelectedCity('');
                    setIsCityDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-left transition-all border ${
                    !selectedCity
                      ? 'bg-gradient-to-r from-[#FF1E6A] to-rose-500 text-white font-bold border-transparent shadow-sm'
                      : 'bg-pink-50/50 hover:bg-pink-100/70 text-slate-800 border-pink-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">🌐</span>
                    <span className="font-semibold">All Cities in {currentStateObj?.name || 'State'}</span>
                  </div>
                  {!selectedCity && (
                    <span className="text-[10px] font-bold bg-white/25 px-1.5 py-0.5 rounded text-white">
                      Active
                    </span>
                  )}
                </button>

                {/* Search Bar */}
                <div className="relative">
                  <input
                    type="text"
                    value={citySearchTerm}
                    onChange={(e) => setCitySearchTerm(e.target.value)}
                    placeholder={`Search city in ${currentStateObj?.name || 'state'}...`}
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
                    autoFocus
                  />
                  <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  {citySearchTerm && (
                    <button
                      onClick={() => setCitySearchTerm('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* Popular Hotspots for currently selected State */}
                {popularHotspotsInState.length > 0 && !citySearchTerm && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Popular Hubs
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {popularHotspotsInState.map((city) => (
                        <button
                          key={city}
                          onClick={() => {
                            setSelectedCity(city);
                            setIsCityDropdownOpen(false);
                          }}
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border transition-all ${
                            selectedCity.toLowerCase() === city.toLowerCase()
                              ? 'bg-[#FF1E6A] text-white border-[#FF1E6A]'
                              : 'bg-pink-50/60 hover:bg-pink-100 text-slate-700 border-pink-100'
                          }`}
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cities List */}
                <div className="max-h-56 overflow-y-auto py-1 space-y-0.5 border-t border-slate-50">
                  {filteredCities.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">
                      No cities found matching "{citySearchTerm}" in {currentStateObj?.name}
                    </div>
                  ) : (
                    filteredCities.map((c) => {
                      const isSelected = selectedCity.toLowerCase() === c.name.toLowerCase();

                      return (
                        <button
                          key={`${c.name}-${c.stateCode}`}
                          onClick={() => {
                            setSelectedCity(c.name);
                            setIsCityDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs text-left transition-colors ${
                            isSelected
                              ? 'bg-[#FF1E6A] text-white font-bold shadow-sm'
                              : 'text-slate-700 hover:bg-pink-50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-[#FF1E6A]'}`} />
                            <span className="font-medium">{c.name}</span>
                          </div>
                          {isSelected && (
                            <span className="text-[10px] font-bold bg-white/20 px-1.5 py-0.5 rounded text-white">
                              Selected
                            </span>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* If Logged In: Messages + User Avatar */}
          {isLoggedIn && currentUser ? (
            <>
              {/* Messages Icon Button (Desktop only, mobile has bottom bar) */}
              <Link
                to="/messages"
                className="relative p-2 text-slate-700 hover:text-pink-600 hover:bg-pink-50/50 rounded-full transition-colors flex-shrink-0"
                aria-label="Messages"
              >
                <MessageCircle className="w-5 h-5" />
                {totalChats > 0 && (
                  <span className="absolute top-1 right-1 px-1 min-w-[16px] h-4 bg-[#FF1E6A] text-white text-[10px] font-extrabold rounded-full flex items-center justify-center">
                    {totalChats > 99 ? '99+' : totalChats}
                  </span>
                )}
              </Link>

              {/* User Avatar & Menu */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-1 sm:gap-2 p-0.5 sm:p-1 pl-0.5 sm:pl-1 pr-1 sm:pr-2 rounded-full border border-slate-200/80 bg-white hover:bg-slate-50 transition-colors shadow-sm flex-shrink-0"
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover ring-2 ring-pink-500 flex-shrink-0"
                  />
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-xs font-bold text-slate-900 leading-tight">
                      {currentUser.name.split(' ')[0]}
                    </span>
                    <span className="text-[10px] font-semibold text-amber-500 leading-none flex items-center gap-0.5">
                      👑 Premium
                    </span>
                  </div>
                  <ChevronDown className={`w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-500 flex-shrink-0 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-white shadow-2xl border border-purple-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2.5 border-b border-purple-50 mb-1">
                      <p className="text-xs text-slate-400 font-medium">Signed in as</p>
                      <p className="text-sm font-bold text-slate-900 truncate">{currentUser.name}</p>
                      <p className="text-[11px] text-purple-600 truncate">{currentUser.email}</p>
                    </div>

                    <div className="space-y-0.5 text-xs font-semibold text-slate-700">
                      <Link
                        to="/dashboard"
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-purple-50"
                      >
                        <UserIcon className="w-4 h-4 text-pink-600" />
                        My Dashboard
                      </Link>
                      <Link
                        to="/profile"
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-purple-50"
                      >
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        My Profile
                      </Link>
                      <Link
                        to="/matches"
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-purple-50"
                      >
                        <Heart className="w-4 h-4 text-rose-500" />
                        My Matches
                      </Link>
                      <Link
                        to="/messages"
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-purple-50"
                      >
                        <MessageCircle className="w-4 h-4 text-violet-600" />
                        Messages
                      </Link>
                      <Link
                        to="/events/my-events"
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-purple-50"
                      >
                        <Calendar className="w-4 h-4 text-amber-600" />
                        My Events
                      </Link>
                    </div>

                    <div className="pt-2 mt-1 border-t border-purple-50">
                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50"
                      >
                        <LogOut className="w-4 h-4" />
                        Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* If Guest: Login & Register CTA buttons */
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold text-purple-900 hover:bg-purple-50 border border-purple-200 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold text-white festive-gradient hover:opacity-95 shadow-md shadow-pink-500/20 transition-all transform active:scale-95"
              >
                Sign Up
              </Link>
            </div>
          )}

          </div>
      </div>
    </header>
  );
};
