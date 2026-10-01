import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Search,
  MapPin,
  Sparkles,
  Clock,
  Users,
  Heart,
  ArrowRight,
  Loader2,
  CalendarX,
  Tag,
  Filter
} from 'lucide-react';
import { useLocationStore } from '../../store/useLocationStore';
import { useInfiniteEvents, EventItem } from '../../hooks/events/useEvents';
import { useApp } from '../../context/AppContext';

export const EventsPage: React.FC = () => {
  const { selectedStateName, selectedCity } = useLocationStore();
  const { favorites, toggleFavorite } = useApp();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [isFreeFilter, setIsFreeFilter] = useState<boolean | undefined>(undefined);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const isAllCities = !selectedCity || !selectedCity.trim();
  const locationLabel = isAllCities ? `All Cities in ${selectedStateName}` : `${selectedCity}, ${selectedStateName}`;

  // Fetch Infinite Events dynamically from the API
  const {
    events,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    totalCount
  } = useInfiniteEvents({
    state: selectedStateName || undefined,
    city: isAllCities ? undefined : selectedCity.trim(),
    search: debouncedSearch || undefined,
    isFree: isFreeFilter,
    status: 'PUBLISHED',
    sortBy: 'upcoming',
  });

  // IntersectionObserver for Infinite Scrolling
  const observerTargetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = observerTargetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1, rootMargin: '250px' }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="max-w-[1550px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. HEADER FESTIVE BANNER */}
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-purple-900 via-pink-900 to-purple-950 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-3 max-w-xl z-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-pink-500/30 text-pink-300 text-xs font-bold uppercase tracking-wider border border-pink-500/40">
            <Sparkles className="w-3.5 h-3.5" />
            Navratri 2026 Celebrations
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-heading tracking-tight">
            Garba &amp; Dandiya Events
          </h1>
          <p className="text-xs sm:text-sm text-purple-200/80 leading-relaxed">
            Discover premier open-air grounds, stadium arenas, and luxury rooftop Dandiya nights in{' '}
            <strong className="text-pink-300">{locationLabel}</strong>. Infinite scroll to explore all festival events!
          </p>
        </div>

        {/* Quick Search */}
        <div className="w-full md:w-80 z-10">
          <div className="relative">
            <Search className="w-4 h-4 text-purple-300 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search event title, venue..."
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-purple-300/40 text-xs sm:text-sm text-white placeholder:text-purple-300/60 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-purple-300 hover:text-white text-xs font-bold"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Decorative Background Accents */}
        <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-pink-600/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 2. FILTER & COUNT BAR */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Active Location Badge */}
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-white px-4 py-2 rounded-2xl border border-slate-200/80 shadow-xs">
          <MapPin className="w-4 h-4 text-[#FF1E6A]" />
          <span>Showing events for:</span>
          <span className="text-[#FF1E6A] font-extrabold">{locationLabel}</span>
          {totalCount > 0 && (
            <span className="ml-1.5 px-2 py-0.5 rounded-full bg-pink-50 text-[#FF1E6A] text-[11px] font-bold">
              {totalCount} total
            </span>
          )}
        </div>

        {/* Free / All Price Filter */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFreeFilter(undefined)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              isFreeFilter === undefined
                ? 'bg-[#FF1E6A] text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-pink-50 border border-slate-200'
            }`}
          >
            All Events
          </button>
          <button
            onClick={() => setIsFreeFilter(true)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              isFreeFilter === true
                ? 'bg-[#FF1E6A] text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-pink-50 border border-slate-200'
            }`}
          >
            Free Entry Only
          </button>
        </div>
      </div>

      {/* 3. DYNAMIC EVENTS INFINITE FEED / EMPTY STATE */}
      {isLoading ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-100 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF1E6A]" />
          <p className="text-xs font-semibold text-slate-500">Loading events in {locationLabel}…</p>
        </div>
      ) : events.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-100 space-y-3 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-pink-50 text-[#FF1E6A] mx-auto flex items-center justify-center">
            <CalendarX className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No events found in {locationLabel}</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            {debouncedSearch
              ? `No events match "${debouncedSearch}". Try clearing your search.`
              : `There are currently no published Garba or Dandiya events registered in this region. You can switch your state or city in the top navigation bar to explore other locations.`}
          </p>
          {debouncedSearch && (
            <button
              onClick={() => setSearchQuery('')}
              className="px-5 py-2 rounded-xl bg-[#FF1E6A] text-white text-xs font-bold shadow-md shadow-pink-500/20"
            >
              Clear Search Filter
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {events.map((event: EventItem) => {
            const isFav = favorites.includes(event.id);
            const dateVal = event.startsAt || event.createdAt;
            const endDateVal = event.endsAt || event.startsAt || event.createdAt;
            const displayDate = dateVal
              ? new Date(dateVal).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })
              : 'Navratri 2026';
            const startTime = dateVal
              ? new Date(dateVal).toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '7:00 PM';
            const endTime = endDateVal
              ? new Date(endDateVal).toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '11:00 PM';
            const bannerUrl =
              event.images?.[0]?.url ||
              'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80';
            const fee = event.entryFee ?? (event.entryFeePaise !== undefined ? Math.round(event.entryFeePaise / 100) : (event.slots?.[0]?.entryFee ?? 0));

            return (
              <div
                key={event.id}
                className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                {/* Event Image Banner */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900">
                  <img
                    src={bannerUrl}
                    alt={event.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                    <span className="px-2.5 py-1 rounded-full bg-pink-500/90 text-white text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-sm shadow-sm">
                      Verified Event
                    </span>

                    <button
                      onClick={() => toggleFavorite(event.id)}
                      className="w-8 h-8 rounded-full bg-white/95 text-[#FF1E6A] shadow-md flex items-center justify-center hover:scale-110 active:scale-90 transition-transform"
                      title="Save Event"
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-[#FF1E6A]' : ''}`} />
                    </button>
                  </div>

                  {/* Price Badge on Banner */}
                  <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-amber-300 font-extrabold text-xs border border-white/10">
                    {fee === 0 ? 'FREE ENTRY' : `₹${fee}`}
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 space-y-3.5 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 line-clamp-1 group-hover:text-[#FF1E6A] transition-colors">
                      {event.title}
                    </h3>

                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-[#FF1E6A] flex-shrink-0" />
                      <span className="truncate">{event.venueName}, {event.city}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-600 pt-1 border-t border-slate-50">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                        <Calendar className="w-3.5 h-3.5 text-[#FF1E6A]" />
                        <span>{displayDate}</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-500 text-[11px]">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{startTime} - {endTime}</span>
                      </div>
                    </div>

                    {event.capacity ? (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Users className="w-3.5 h-3.5 text-purple-600" />
                        <span>Capacity: {event.capacity} people</span>
                      </div>
                    ) : null}
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex items-center gap-2">
                    <Link
                      to={`/events/${event.id}`}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-[#FF1E6A] hover:bg-[#E1145A] text-white text-xs font-bold shadow-md shadow-pink-500/20 flex items-center justify-center gap-1.5 transition-transform active:scale-95"
                    >
                      <span>View Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <Link
                      to={`/find-partner?event=${event.id}`}
                      className="py-2.5 px-3 rounded-xl border border-pink-200 text-[#FF1E6A] hover:bg-pink-50 text-xs font-semibold transition-colors"
                      title="Find Dance Partners Going"
                    >
                      Find Partner
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. INFINITE SCROLL SENTINEL & LOADER */}
      {events.length > 0 && (
        <div ref={observerTargetRef} className="py-8 flex flex-col items-center justify-center text-center">
          {isFetchingNextPage && (
            <div className="flex items-center gap-2.5 text-xs font-bold text-[#FF1E6A] bg-pink-50 px-4 py-2 rounded-full border border-pink-100 shadow-xs animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin text-[#FF1E6A]" />
              <span>Loading more festival events…</span>
            </div>
          )}

          {!hasNextPage && (
            <div className="text-xs font-semibold text-slate-400 py-4 flex items-center gap-1.5">
              <span>✨ You've reached the end of all events in {locationLabel} ✨</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EventsPage;
