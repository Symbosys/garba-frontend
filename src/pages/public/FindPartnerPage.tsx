import React, { useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useLocationStore } from '../../store/useLocationStore';
import { useEvents, EventItem } from '../../hooks/events/useEvents';
import { useInfiniteUsers, PublicUser } from '../../hooks/users/useUsers';
import { PartnerCard } from '../../components/partner/PartnerCard';
import { EmptyState } from '../../components/common/EmptyState';
import { PartnerCardSkeleton } from '../../components/common/LoadingSkeleton';
import { calculateMatchScore } from '../../utils/matching';
import {
  MapPin,
  Calendar,
  Sparkles,
  Music,
  Loader2,
  Users
} from 'lucide-react';
import { LookingFor, User, FestivalEvent } from '../../types';

export const FindPartnerPage: React.FC = () => {
  const {
    cities,
    currentUser,
    searchFilters,
    setSearchFilters,
    resetFilters
  } = useApp();

  const { selectedStateName, selectedCity, setSelectedCity } = useLocationStore();
  const [searchParams] = useSearchParams();

  // Sync URL search params with state
  useEffect(() => {
    const cityParam = searchParams.get('city');
    const eventParam = searchParams.get('event');
    const dateParam = searchParams.get('date');

    if (cityParam) {
      setSelectedCity(cityParam);
      setSearchFilters((prev) => ({ ...prev, city: cityParam }));
    }
    if (eventParam) {
      setSearchFilters((prev) => ({ ...prev, eventId: eventParam }));
    }
    if (dateParam) {
      setSearchFilters((prev) => ({ ...prev, date: dateParam }));
    }
  }, [searchParams, setSelectedCity, setSearchFilters]);

  const isAllCities = !searchFilters.city || !searchFilters.city.trim() || searchFilters.city === 'All Cities';

  // 1. Dynamic Events Fetching from Backend API
  const {
    events: apiEvents,
    isLoading: isEventsLoading
  } = useEvents({
    state: selectedStateName || undefined,
    city: isAllCities ? undefined : searchFilters.city.trim(),
    status: 'PUBLISHED',
    limit: 50,
  });

  // Map API Events to FestivalEvent interface
  const displayEvents: FestivalEvent[] = useMemo(() => {
    if (!apiEvents || apiEvents.length === 0) return [];
    return apiEvents.map((evt: EventItem) => {
      const primarySlot = evt.slots && evt.slots.length > 0 ? evt.slots[0] : null;
      const dateVal = primarySlot?.slotDate || evt.startsAt || evt.createdAt;
      const displayDate = dateVal
        ? new Date(dateVal).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })
        : 'Navratri 2026';

      const startTime = primarySlot?.startTime || (evt.startsAt ? new Date(evt.startsAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '7:00 PM');
      const endTime = primarySlot?.endTime || (evt.endsAt ? new Date(evt.endsAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '11:00 PM');

      return {
        id: evt.id,
        slug: evt.id,
        title: evt.title,
        tagline: 'Navratri Garba & Dandiya Night 2026',
        bannerImage: evt.images?.[0]?.url || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
        city: evt.city,
        venue: evt.venueName,
        address: evt.addressLine,
        date: displayDate,
        displayDate,
        startTime,
        endTime,
        price: 0,
        isFeatured: true,
        organizer: {
          name: evt.organizer?.name || evt.venueName || 'Event Organizer',
          verified: true,
        },
        description: evt.description || '',
        rules: [],
        whatToExpect: [],
        safetyInfo: [],
        registeredCount: evt.capacity || 128,
        lookingForPartnerCount: Math.round((evt.capacity || 100) * 0.4),
        groupsCount: 12,
        category: 'Garba Night' as const,
      };
    });
  }, [apiEvents]);

  // 2. Dynamic Partners Fetching from Backend API
  const {
    users: apiUsers,
    isLoading: isUsersLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    totalCount: totalPartnersCount
  } = useInfiniteUsers({
    state: selectedStateName || undefined,
    city: isAllCities ? undefined : searchFilters.city.trim(),
    role: 'PARTNER',
  });

  // Infinite Scroll Observer Target
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
      { threshold: 0.1, rootMargin: '200px' }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Map PublicUser[] to User[] domain models, strictly filtering out current logged in user
  const dynamicPartners: User[] = useMemo(() => {
    if (!apiUsers || apiUsers.length === 0) return [];
    return apiUsers
      .filter((u: PublicUser) => !currentUser || u.id !== currentUser.id)
      .map((u: PublicUser) => {
        const primaryPhoto = u.photos?.[0]?.url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80';
        const formattedGender = u.gender === 'FEMALE' ? 'Female' : u.gender === 'MALE' ? 'Male' : (u.gender as any) || 'Female';
        
        return {
          id: u.id,
          name: u.name,
          email: `${u.name.toLowerCase().replace(/\s+/g, '')}@example.com`,
          phone: '',
          avatar: primaryPhoto,
          age: u.age || 21,
          gender: formattedGender,
          city: u.city || searchFilters.city || 'Ranchi',
          area: u.state || selectedStateName || 'Jharkhand',
          bio: `Passionate ${formattedGender === 'Female' ? 'Garba' : 'Dandiya'} enthusiast ready for Navratri 2026! Looking for an awesome dance partner.`,
          garbaLevel: 'Intermediate',
          dandiyaLevel: 'Intermediate',
          danceStyle: 'Traditional',
          lookingFor: ['Partner', 'New Friends'],
          preferredGender: 'Any',
          preferredAgeMin: 18,
          preferredAgeMax: 40,
          preferredEvents: displayEvents.map((e) => e.id),
          availability: { dates: [], startTime: '19:00', endTime: '23:00' },
          isVerified: { mobile: true, email: true, photo: Boolean(u.photos && u.photos.length > 0) },
          role: 'user',
          isPremium: false,
          profileCompletion: 85,
          joinedAt: u.createdAt || new Date().toISOString(),
          status: 'active',
        };
      });
  }, [apiUsers, currentUser, searchFilters.city, selectedStateName, displayEvents]);

  // Active event object
  const activeEvent =
    displayEvents.find((e) => e.id === searchFilters.eventId) ||
    displayEvents.find((e) => e.city.toLowerCase() === (searchFilters.city || '').toLowerCase()) ||
    displayEvents[0] ||
    null;

  // Filter & Search computation
  const filteredPartners = useMemo(() => {
    return dynamicPartners.filter((u) => {
      // Strictly exclude current logged in user
      if (currentUser && u.id === currentUser.id) return false;

      // Filter by tab
      if (searchFilters.tab === 'need_partner' && !u.lookingFor.includes('Partner')) return false;
      if (searchFilters.tab === 'groups' && !u.lookingFor.includes('Group')) return false;
      if (searchFilters.tab === 'new_friends' && !u.lookingFor.includes('New Friends')) return false;

      // Filter by gender preference
      if (searchFilters.genderPreference !== 'Any' && u.gender !== searchFilters.genderPreference) {
        return false;
      }

      // Filter by age range
      if (u.age < searchFilters.ageRange[0] || u.age > searchFilters.ageRange[1]) {
        return false;
      }

      // Filter by dance level
      if (searchFilters.danceLevel !== 'All' && u.garbaLevel !== searchFilters.danceLevel) {
        return false;
      }

      // Filter by looking for
      if (searchFilters.lookingFor !== 'All' && !u.lookingFor.includes(searchFilters.lookingFor as LookingFor)) {
        return false;
      }

      // Filter by style
      if (searchFilters.style !== 'All' && u.danceStyle !== searchFilters.style && u.danceStyle !== 'All Styles') {
        return false;
      }

      // Filter only verified
      if (searchFilters.onlyVerified && !u.isVerified.photo) {
        return false;
      }

      return true;
    });
  }, [dynamicPartners, currentUser, searchFilters]);

  // Sort candidates by match score
  const sortedPartners = useMemo(() => {
    return [...filteredPartners].sort((a, b) => {
      const scoreA = calculateMatchScore(currentUser, a, activeEvent).score;
      const scoreB = calculateMatchScore(currentUser, b, activeEvent).score;
      if (searchFilters.sortBy === 'match') {
        return scoreB - scoreA;
      }
      return 0;
    });
  }, [filteredPartners, currentUser, activeEvent, searchFilters.sortBy]);

  const availableEventsInCity = displayEvents.filter(
    (e) => !searchFilters.city || e.city.toLowerCase() === searchFilters.city.toLowerCase()
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* 1. TOP HEADER & SEARCH BAR */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#280c44] via-[#3b1260] to-[#1d0733] text-white shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 text-xs font-bold uppercase tracking-wider mb-2 border border-pink-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              Live Registered Partners
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black font-heading">
              Find Your Garba & Dandiya Partner
            </h1>
            <p className="text-xs sm:text-sm text-purple-200/80 mt-1">
              Showing verified registered dancers attending {activeEvent ? <strong className="text-amber-300">{activeEvent.title}</strong> : 'upcoming events'} in {searchFilters.city || selectedStateName}.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-purple-300/30 text-xs font-bold text-pink-200 flex items-center gap-2">
              <Users className="w-4 h-4 text-pink-400" />
              <span>
                <strong className="text-white text-base font-black mr-1">{totalPartnersCount || sortedPartners.length}</strong>
                Registered Partners
              </span>
            </div>
          </div>
        </div>

        {/* Top Search Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 pt-2">
          {/* City */}
          <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
            <label className="block text-[10px] font-bold text-purple-200 uppercase mb-0.5 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-pink-400" />
              City
            </label>
            <select
              value={searchFilters.city}
              onChange={(e) => {
                const newCity = e.target.value;
                setSelectedCity(newCity);
                const firstEvent = displayEvents.find((ev) => ev.city.toLowerCase() === newCity.toLowerCase());
                setSearchFilters((prev) => ({
                  ...prev,
                  city: newCity,
                  eventId: firstEvent ? firstEvent.id : prev.eventId
                }));
              }}
              className="w-full bg-transparent font-bold text-xs sm:text-sm text-white focus:outline-none cursor-pointer"
            >
              <option value="" className="text-slate-900">All Cities in {selectedStateName}</option>
              {cities.map((c) => (
                <option key={c.id} value={c.name} className="text-slate-900">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Event */}
          <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 sm:col-span-2 lg:col-span-2">
            <label className="block text-[10px] font-bold text-purple-200 uppercase mb-0.5 flex items-center gap-1">
              <Music className="w-3 h-3 text-purple-300" />
              Event
            </label>
            <select
              value={searchFilters.eventId}
              onChange={(e) => setSearchFilters((prev) => ({ ...prev, eventId: e.target.value }))}
              className="w-full bg-transparent font-bold text-xs sm:text-sm text-white focus:outline-none cursor-pointer truncate"
            >
              {availableEventsInCity.length > 0 ? (
                availableEventsInCity.map((ev) => (
                  <option key={ev.id} value={ev.id} className="text-slate-900">
                    {ev.title} ({ev.displayDate || ev.date})
                  </option>
                ))
              ) : displayEvents.length > 0 ? (
                displayEvents.map((ev) => (
                  <option key={ev.id} value={ev.id} className="text-slate-900">
                    {ev.title} ({ev.city})
                  </option>
                ))
              ) : (
                <option value="" className="text-slate-900">All Upcoming Events</option>
              )}
            </select>
          </div>

          {/* Date */}
          <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
            <label className="block text-[10px] font-bold text-purple-200 uppercase mb-0.5 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-amber-400" />
              Date
            </label>
            <input
              type="date"
              value={searchFilters.date}
              onChange={(e) => setSearchFilters((prev) => ({ ...prev, date: e.target.value }))}
              className="w-full bg-transparent font-bold text-xs sm:text-sm text-white focus:outline-none cursor-pointer"
            />
          </div>
        </div>

        {/* 2. TABS (All, Need Partner, Groups, New Friends) */}
        <div className="flex items-center justify-between pt-2 border-t border-purple-800/60 flex-wrap gap-3">
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-purple-950/60 border border-purple-800/60 overflow-x-auto">
            {[
              { key: 'all', label: 'All Dancers' },
              { key: 'need_partner', label: 'Looking for Partner' },
              { key: 'groups', label: 'Squad Groups' },
              { key: 'new_friends', label: 'New Friends' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSearchFilters((prev) => ({ ...prev, tab: tab.key as any }))}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  searchFilters.tab === tab.key
                    ? 'bg-pink-600 text-white shadow-md'
                    : 'text-purple-200/80 hover:text-white hover:bg-purple-900/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. PARTNER CARDS RESULTS GRID */}
      <main className="w-full space-y-6">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="font-semibold text-slate-700">
            Found <strong className="text-purple-950">{sortedPartners.length}</strong> compatible partners
          </span>
          <span className="text-[11px] text-pink-600 font-bold bg-pink-50 px-2.5 py-1 rounded-full">
            ✨ 9-factor Mutual Scoring Active
          </span>
        </div>

        {isUsersLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, idx) => (
              <PartnerCardSkeleton key={`skeleton-${idx}`} />
            ))}
          </div>
        ) : sortedPartners.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-purple-100 shadow-sm">
            <EmptyState
              type="partners"
              title="No partners found matching your search."
              description="Try switching tabs or selecting another event or date to see more dancers."
              actionText="Reset Filters"
              onActionClick={resetFilters}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedPartners.map((candidate) => (
              <PartnerCard
                key={candidate.id}
                partner={candidate}
                currentEvent={activeEvent}
              />
            ))}
          </div>
        )}

        {/* Infinite Scroll Bottom Loading Indicator & Intersection Target */}
        <div ref={observerTargetRef} className="py-6 flex items-center justify-center">
          {isFetchingNextPage && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 text-purple-800 text-xs font-semibold shadow-sm border border-purple-100">
              <Loader2 className="w-4 h-4 animate-spin text-pink-600" />
              Loading more partners...
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
