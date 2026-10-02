import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { EventCard } from '../../components/event/EventCard';
import { PartnerCard } from '../../components/partner/PartnerCard';
import { CityCard } from '../../components/common/CityCard';
import {
  Sparkles,
  Search,
  MapPin,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Users,
  Music,
  Lock,
  UserCheck,
  Zap
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { events, users, cities, selectedCity, setSelectedCity, setSearchFilters, currentUser } = useApp();
  const navigate = useNavigate();

  // Search card state
  const [searchCity, setSearchCity] = useState(selectedCity || 'Ranchi');
  const [searchEventId, setSearchEventId] = useState('event-ranchi-01');
  const [searchDate, setSearchDate] = useState('2026-10-18');

  // Filter events based on chosen search city
  const cityFilteredEvents = events.filter(
    (e) => e.city.toLowerCase() === searchCity.toLowerCase()
  );
  const activeEventsList = cityFilteredEvents.length > 0 ? cityFilteredEvents : events;

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSelectedCity(searchCity);
    setSearchFilters((prev) => ({
      ...prev,
      city: searchCity,
      eventId: searchEventId,
      date: searchDate
    }));
    navigate(
      `/find-partner?city=${encodeURIComponent(searchCity)}&event=${encodeURIComponent(
        searchEventId
      )}&date=${encodeURIComponent(searchDate)}`
    );
  };

  // Top featured events
  const featuredEvents = events.slice(0, 4);

  // Recommended partners preview (strictly exclude logged in user)
  const featuredPartners = users.filter((u) => !currentUser || u.id !== currentUser.id).slice(0, 3);

  return (
    <div className="space-y-16 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[92vh] flex items-center justify-center pt-8 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden bg-[#150624]">
        {/* Festive Background Image with Rich Dark Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=2000&q=85"
            alt="Navratri Garba Night Extravaganza"
            className="w-full h-full object-cover object-center filter brightness-45 scale-105"
          />
          {/* Multi-tier gradient overlay for readability and festival glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-purple-950/80 via-[#19082bd0] to-[#FAF7FD]" />
          <div className="absolute inset-0 bg-radial-at-c from-pink-600/20 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Hero Content Container */}
        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8 pt-6">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-pink-500/40 text-xs sm:text-sm font-bold text-pink-300 shadow-xl shadow-pink-900/20 animate-pulse-subtle">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>India’s #1 Festival Partner Platform · Navratri 2026</span>
          </div>

          {/* Main Heading */}
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black font-heading text-white tracking-tight leading-[1.1] drop-shadow-lg">
              No Partner for Garba? <br className="hidden sm:inline" />
              <span className="text-gradient-gold">We’ve Got You.</span>
            </h1>
            <p className="max-w-2xl mx-auto text-sm sm:text-lg md:text-xl text-purple-100/90 font-medium leading-relaxed pt-2">
              Find verified Garba & Dandiya partners near you, choose your event, and make your Navratri unforgettable.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/find-partner"
              className="py-4 px-8 rounded-full font-bold text-base sm:text-lg text-white festive-gradient hover:opacity-95 shadow-xl shadow-pink-600/30 flex items-center gap-2 transform active:scale-95 transition-all"
            >
              <Sparkles className="w-5 h-5 text-amber-300" />
              Find a Partner
            </Link>
            <Link
              to="/register"
              className="py-4 px-8 rounded-full font-bold text-base sm:text-lg text-purple-100 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-purple-300/40 transition-all flex items-center gap-2"
            >
              <UserCheck className="w-5 h-5 text-pink-400" />
              Join as a Partner
            </Link>
          </div>

          {/* 2. LARGE SEARCH / MATCHING CARD */}
          <div className="max-w-4xl mx-auto mt-8 p-3 sm:p-5 rounded-3xl bg-white/95 backdrop-blur-xl shadow-2xl border border-purple-100 text-left">
            <form onSubmit={handleHeroSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Field 1: Select City */}
              <div className="p-3 rounded-2xl bg-purple-50/60 border border-purple-100/80 hover:border-purple-300 transition-colors">
                <label className="block text-[11px] font-bold text-purple-900 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-pink-600" />
                  Select City
                </label>
                <select
                  value={searchCity}
                  onChange={(e) => {
                    setSearchCity(e.target.value);
                    const firstEv = events.find((ev) => ev.city.toLowerCase() === e.target.value.toLowerCase());
                    if (firstEv) setSearchEventId(firstEv.id);
                  }}
                  className="w-full bg-transparent font-bold text-sm text-slate-900 focus:outline-none cursor-pointer"
                >
                  {cities.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name} ({c.partnerCount}+ dancers)
                    </option>
                  ))}
                </select>
              </div>

              {/* Field 2: Select Event */}
              <div className="p-3 rounded-2xl bg-purple-50/60 border border-purple-100/80 hover:border-purple-300 transition-colors">
                <label className="block text-[11px] font-bold text-purple-900 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Music className="w-3.5 h-3.5 text-purple-600" />
                  Select Event
                </label>
                <select
                  value={searchEventId}
                  onChange={(e) => setSearchEventId(e.target.value)}
                  className="w-full bg-transparent font-bold text-sm text-slate-900 focus:outline-none cursor-pointer truncate"
                >
                  {activeEventsList.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Field 3: Select Date */}
              <div className="p-3 rounded-2xl bg-purple-50/60 border border-purple-100/80 hover:border-purple-300 transition-colors">
                <label className="block text-[11px] font-bold text-purple-900 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-600" />
                  Select Date
                </label>
                <input
                  type="date"
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                  className="w-full bg-transparent font-bold text-sm text-slate-900 focus:outline-none cursor-pointer"
                />
              </div>

              {/* Action Button */}
              <div className="flex items-center">
                <button
                  type="submit"
                  className="w-full h-full min-h-[52px] py-3 px-6 rounded-2xl font-bold text-sm text-white festive-gradient hover:opacity-95 shadow-lg shadow-pink-500/25 flex items-center justify-center gap-2 transition-transform active:scale-95"
                >
                  <Search className="w-4 h-4" />
                  Find Partners →
                </button>
              </div>
            </form>

            <div className="mt-3 px-2 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
              <span className="flex items-center gap-1 text-purple-900 font-semibold">
                <Users className="w-3.5 h-3.5 text-pink-600" />
                <span>128+ dancers looking for partners in {searchCity} right now</span>
              </span>
              <span className="text-[11px] text-slate-400">
                Example default: Ranchi · Ranchi Garba Night · 18 Oct 2026
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. TRUST BAR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 p-4 sm:p-6 rounded-3xl bg-white shadow-xl border border-purple-100">
          <div className="flex items-center gap-3 p-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Verified Profiles</h4>
              <p className="text-[11px] text-slate-500">Photo & mobile checked</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Safe & Secure</h4>
              <p className="text-[11px] text-slate-500">Encrypted in-app chat</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2">
            <div className="w-10 h-10 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Event Matching</h4>
              <p className="text-[11px] text-slate-500">Same ground & timing</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">18+ Adult Community</h4>
              <p className="text-[11px] text-slate-500">Strict safety standard</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. POPULAR FESTIVAL CITIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-pink-100 text-pink-800 text-xs font-bold uppercase tracking-wider mb-2">
              <MapPin className="w-3.5 h-3.5" />
              Pan-India Festive Network
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-purple-950 font-heading">
              Popular Cities
            </h2>
          </div>
          <Link
            to="/cities"
            className="text-xs sm:text-sm font-bold text-purple-700 hover:text-pink-600 flex items-center gap-1"
          >
            All 15 Cities →
          </Link>
        </div>

        {/* Scrollable City Cards */}
        <div className="flex items-center gap-4 overflow-x-auto pb-4 pt-1 no-scrollbar">
          {cities.map((city) => (
            <CityCard key={city.id} city={city} />
          ))}
        </div>
      </section>

      {/* 5. UPCOMING FESTIVAL EVENTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider mb-2">
              <Calendar className="w-3.5 h-3.5" />
              Navratri 2026 Season
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-purple-950 font-heading">
              Featured Festival Events
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Select your ground, see how many dancers need partners, and join in 1 click.
            </p>
          </div>

          <Link
            to="/events"
            className="hidden sm:flex items-center gap-1 text-sm font-bold text-purple-700 hover:text-pink-600"
          >
            Explore All Events →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link
            to="/events"
            className="inline-block py-2.5 px-6 rounded-full font-bold text-xs text-purple-900 bg-purple-100 hover:bg-purple-200"
          >
            View All Festival Events →
          </Link>
        </div>
      </section>

      {/* 6. SPOTLIGHT PARTNERS PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-purple-900 via-[#320f54] to-[#1a052e] text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <span className="px-3 py-1 rounded-full bg-pink-500/30 text-pink-300 text-xs font-bold uppercase tracking-wider border border-pink-400/40">
                  Ready to Dance
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black font-heading mt-2">
                  Dancers Looking for Partners Tonight
                </h2>
                <p className="text-xs sm:text-sm text-purple-200/80 max-w-xl mt-1">
                  100% verified 18+ profiles with compatible dance levels and event schedules.
                </p>
              </div>

              <Link
                to="/find-partner"
                className="py-3 px-6 rounded-full font-bold text-xs sm:text-sm text-slate-900 bg-amber-400 hover:bg-amber-300 shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 self-start sm:self-auto"
              >
                Browse All 148+ Partners →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              {featuredPartners.map((p) => (
                <PartnerCard key={p.id} partner={p} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 7. BOTTOM FESTIVAL CALL TO ACTION */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 pt-6">
        <div className="p-10 sm:p-14 rounded-3xl bg-gradient-to-tr from-purple-800 via-pink-600 to-amber-500 text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10 space-y-4">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-heading tracking-tight">
              Ready to find your Garba partner?
            </h2>
            <p className="text-sm sm:text-lg text-purple-100 max-w-xl mx-auto">
              Join thousands of dancers across Ranchi, Ahmedabad, Mumbai, and beyond. Free registration in under 60 seconds!
            </p>
            <div className="pt-4">
              <Link
                to="/register"
                className="inline-block py-4 px-10 rounded-full font-black text-base sm:text-lg text-purple-950 bg-white hover:bg-purple-50 shadow-xl transition-transform active:scale-95"
              >
                Sign Up Now — It’s Free! 💃
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
