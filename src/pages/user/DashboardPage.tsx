import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  Heart,
  MessageSquare,
  MessageCircle,
  Calendar,
  Clock,
  MapPin,
  ChevronRight,
  Sparkles,
  Zap,
  Send,
  Camera,
  Check,
  Eye,
  ArrowRight,
  Loader2,
  CalendarX,
  UserX
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLocationStore } from '../../store/useLocationStore';
import { useEvents, EventItem } from '../../hooks/events/useEvents';
import { useInfiniteUsers, PublicUser } from '../../hooks/users/useUsers';
import { RequestPartnerModal } from '../../components/modals/RequestPartnerModal';
import { User, FestivalEvent } from '../../types';
import { useStartConversation, useConversations } from '../../hooks/chat/useChat';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentUser,
    favorites,
    toggleFavorite,
    hasRequestedPartner,
  } = useApp();

  const { selectedStateName, selectedCity } = useLocationStore();

  const isAllCities = !selectedCity || !selectedCity.trim();
  const locationLabel = isAllCities ? `All Cities in ${selectedStateName}` : `${selectedCity}, ${selectedStateName}`;
  const eventsHeading = isAllCities ? `Events across ${selectedStateName}` : `Events in ${selectedCity}`;
  const partnersHeading = isAllCities ? `Recommended Partners in ${selectedStateName}` : `Recommended Partners in ${selectedCity}`;
  const emptyEventsLabel = isAllCities ? `No events found across ${selectedStateName}` : `No events found in ${selectedCity}, ${selectedStateName}`;
  const emptyPartnersLabel = isAllCities ? `No partners found across ${selectedStateName}` : `No partners found in ${selectedCity}, ${selectedStateName}`;

  // 1. Fetch Dynamic Events based on selected Navbar location (State & optional City)
  const {
    events: apiEvents,
    isLoading: isEventsLoading
  } = useEvents({
    state: selectedStateName || undefined,
    city: isAllCities ? undefined : selectedCity.trim(),
    status: 'PUBLISHED',
    limit: 20,
  });

  // Strictly dynamic events list (NO static/mock fallback)
  const displayEvents = useMemo(() => {
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
        title: evt.title,
        venue: evt.venueName,
        addressLine: evt.addressLine,
        city: evt.city,
        state: evt.state,
        displayDate,
        startTime,
        endTime,
        bannerImage: evt.images?.[0]?.url || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
        isFeatured: true,
        registeredCount: evt.capacity || 0,
        lookingForPartnerCount: 0,
      };
    });
  }, [apiEvents]);

  // 2. Fetch Dynamic Infinite Partners based on selected Navbar location (State & optional City)
  const {
    users: apiUsers,
    isLoading: isUsersLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    totalCount: totalUsersCount
  } = useInfiniteUsers({
    state: selectedStateName || undefined,
    city: isAllCities ? undefined : selectedCity.trim(),
    role: 'PARTNER',
  });

  // Strictly dynamic partners list (NO static/mock fallback & exclude current user)
  const displayPartners = useMemo(() => {
    if (!apiUsers || apiUsers.length === 0) return [];
    return apiUsers
      .filter((u: PublicUser) => !currentUser || u.id !== currentUser.id)
      .map((u: PublicUser) => ({
        id: u.id,
        name: u.name,
        age: u.age || 18,
        gender: u.gender,
        city: u.city,
        state: u.state,
        garbaLevel: 'Beginner',
        dandiyaLevel: 'Beginner',
        date: new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        matchScore: 'Verified Partner',
        matchColor: 'bg-[#0D9488]',
        tag: { label: u.role === 'PARTNER' ? 'Partner' : 'Member', color: 'bg-pink-50 text-[#FF1E6A]', hasStar: true },
        online: true,
        photosCount: `${u.photos?.length || 0} Photos`,
        avatar: u.photos?.[0]?.url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
        rawUser: u,
      }));
  }, [apiUsers, currentUser]);

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

  const handleOpenViewPartner = (partnerItem: typeof displayPartners[0]) => {
    navigate(`/partners/${partnerItem.id}`);
  };

  // Real-time Chat Initiation
  const startConversation = useStartConversation();
  const { data: conversations } = useConversations();
  const [chatLoadingPartnerId, setChatLoadingPartnerId] = useState<string | null>(null);

  const handleStartChatWithPartner = async (partnerId: string) => {
    try {
      setChatLoadingPartnerId(partnerId);
      const res = await startConversation.mutateAsync(partnerId);
      if (res?.conversationId) {
        navigate(`/messages?id=${res.conversationId}`);
      } else {
        navigate('/messages');
      }
    } catch (err) {
      console.error('Failed to initiate conversation:', err);
      navigate('/messages');
    } finally {
      setChatLoadingPartnerId(null);
    }
  };

  // Selected candidate for request modal
  const [selectedPartner, setSelectedPartner] = useState<User | null>(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  // Dynamic KPI counts
  const pendingRequestsCount = 0;
  const matchesCount = 0;
  const messagesCount = conversations?.reduce((acc, c) => acc + (c.unreadCount || 0), 0) || 0;
  const upcomingEventsCount = displayEvents.length;

  const handleOpenRequest = (partnerItem: typeof displayPartners[0]) => {
    const userToRequest: User = {
      id: partnerItem.id,
      name: partnerItem.name,
      email: `${partnerItem.name.toLowerCase().replace(/\s+/g, '')}@example.com`,
      avatar: partnerItem.avatar,
      age: partnerItem.age,
      city: partnerItem.city,
      area: partnerItem.state,
      gender: partnerItem.gender as any,
      garbaLevel: partnerItem.garbaLevel as any,
      dandiyaLevel: partnerItem.dandiyaLevel as any,
      danceStyle: 'Traditional',
      lookingFor: ['Partner'],
      preferredGender: 'Any',
      preferredAgeMin: 18,
      preferredAgeMax: 35,
      preferredEvents: [],
      availability: { dates: [], startTime: '19:00', endTime: '23:00' },
      bio: `Attending Garba night in ${partnerItem.city}! Looking for enthusiastic dance partner.`,
      isVerified: { mobile: true, email: true, photo: true },
      role: 'user',
      isPremium: true,
      profileCompletion: 90,
      joinedAt: '2026-09-01',
      status: 'active'
    };

    setSelectedPartner(userToRequest);
    setIsRequestModalOpen(true);
  };

  // Slider State for Events
  const [currentEventSlide, setCurrentEventSlide] = useState(0);
  const [isEventAutoScrollPaused, setIsEventAutoScrollPaused] = useState(false);

  // Automatic horizontal scrolling timer
  useEffect(() => {
    if (isEventAutoScrollPaused || displayEvents.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentEventSlide((prev) => (prev + 1) % displayEvents.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [isEventAutoScrollPaused, displayEvents.length]);

  const handlePrevEvent = () => {
    setCurrentEventSlide((prev) => (prev - 1 + displayEvents.length) % displayEvents.length);
  };

  const handleNextEvent = () => {
    setCurrentEventSlide((prev) => (prev + 1) % displayEvents.length);
  };

  const handleEventClick = (eventId?: string) => {
    if (eventId) {
      navigate(`/events/${eventId}`);
    } else if (displayEvents[currentEventSlide]) {
      navigate(`/events/${displayEvents[currentEventSlide].id}`);
    } else {
      navigate('/events');
    }
  };

  return (
    <div className="w-full max-w-[1550px] mx-auto px-3 sm:px-6 lg:px-8 py-5 pb-12 space-y-7 overflow-x-hidden">
      {/* 1. HERO FESTIVE BANNER IMAGE */}
      <div className="w-full relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-md border border-pink-100 bg-slate-900">
        <img
          src="/dashboard-hero.png"
          alt="Navratri Garba Celebration"
          className="w-full h-auto min-h-[200px] max-h-[480px] object-cover object-center block transition-all"
        />
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-pink-200 text-xs font-bold text-slate-800 shadow-md flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-[#FF1E6A]" />
          <span>Location:</span>
          <span className="text-[#FF1E6A] font-extrabold">{locationLabel}</span>
        </div>
      </div>

      {/* 2. FOUR KPI STATS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Link
          to="/requests"
          className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#FF1E6A] text-white flex items-center justify-center flex-shrink-0 shadow-sm shadow-pink-500/20">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-slate-900 leading-none">
                {pendingRequestsCount}
              </div>
              <div className="text-xs font-medium text-slate-500 mt-1">
                Partner Requests
              </div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#FF1E6A] group-hover:translate-x-0.5 transition-all" />
        </Link>

        <Link
          to="/matches"
          className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#7C3AED] text-white flex items-center justify-center flex-shrink-0 shadow-sm shadow-purple-500/20">
              <Heart className="w-6 h-6 fill-white" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-slate-900 leading-none">
                {matchesCount}
              </div>
              <div className="text-xs font-medium text-slate-500 mt-1">
                Matches
              </div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#7C3AED] group-hover:translate-x-0.5 transition-all" />
        </Link>

        <Link
          to="/messages"
          className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#0284C7] text-white flex items-center justify-center flex-shrink-0 shadow-sm shadow-blue-500/20">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-slate-900 leading-none">
                {messagesCount}
              </div>
              <div className="text-xs font-medium text-slate-500 mt-1">
                New Messages
              </div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#0284C7] group-hover:translate-x-0.5 transition-all" />
        </Link>

        <Link
          to="/events"
          className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#F59E0B] text-white flex items-center justify-center flex-shrink-0 shadow-sm shadow-amber-500/20">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-slate-900 leading-none">
                {upcomingEventsCount}
              </div>
              <div className="text-xs font-medium text-slate-500 mt-1">
                Upcoming Events
              </div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#F59E0B] group-hover:translate-x-0.5 transition-all" />
        </Link>
      </div>

      {/* 3. DYNAMIC EVENTS SECTION (HORIZONTAL SLIDER) */}
      <div className="space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-1.5 truncate">
              <span>{eventsHeading}</span>
              {!isAllCities && (
                <span className="text-xs font-normal text-slate-500 truncate">({selectedStateName})</span>
              )}
            </h2>
            {displayEvents.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-pink-50 text-[#FF1E6A] text-[11px] font-bold flex-shrink-0">
                {currentEventSlide + 1} / {displayEvents.length}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {displayEvents.length > 1 && (
              <div className="hidden sm:flex items-center gap-1.5">
                <button
                  onClick={handlePrevEvent}
                  className="p-1.5 rounded-full bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors shadow-sm"
                  aria-label="Previous Event"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                </button>
                <button
                  onClick={handleNextEvent}
                  className="p-1.5 rounded-full bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors shadow-sm"
                  aria-label="Next Event"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            <Link
              to="/events"
              className="text-xs font-semibold text-[#FF1E6A] hover:underline flex items-center gap-1 flex-shrink-0"
            >
              <span>Explore All Events</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Loading Spinner */}
        {isEventsLoading ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-100 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-[#FF1E6A]" />
            <p className="text-xs font-semibold text-slate-500">Loading events for {locationLabel}…</p>
          </div>
        ) : displayEvents.length === 0 ? (
          /* Empty State Card when no events found */
          <div className="p-10 text-center bg-white rounded-2xl border border-slate-100 space-y-2 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-pink-50 text-[#FF1E6A] mx-auto flex items-center justify-center">
              <CalendarX className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">{emptyEventsLabel}</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              There are currently no published events registered for this selection. You can switch your state or city from the top bar to explore other locations.
            </p>
          </div>
        ) : (
          /* Events Slider Container */
          <div
            className="relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-sm cursor-pointer"
            onMouseEnter={() => setIsEventAutoScrollPaused(true)}
            onMouseLeave={() => setIsEventAutoScrollPaused(false)}
            onTouchStart={() => setIsEventAutoScrollPaused(true)}
            onTouchEnd={() => setIsEventAutoScrollPaused(false)}
          >
            <div
              className="flex transition-transform duration-700 ease-out"
              style={{ transform: `translateX(-${currentEventSlide * 100}%)` }}
            >
              {displayEvents.map((event, idx) => {
                const isFav = favorites.includes(event.id);

                return (
                  <div
                    key={event.id || idx}
                    onClick={() => handleEventClick(event.id)}
                    className="w-full flex-shrink-0"
                  >
                    <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-slate-100 flex flex-col md:flex-row items-center gap-5 hover:border-pink-200 transition-colors">
                      <div className="relative w-full md:w-80 h-44 rounded-2xl overflow-hidden flex-shrink-0 bg-slate-900">
                        <img
                          src={event.bannerImage}
                          alt={event.title}
                          className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-500"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleFavorite(event.id);
                          }}
                          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white text-[#FF1E6A] shadow-md flex items-center justify-center hover:scale-105 transition-transform"
                          title="Save Event"
                        >
                          <Heart className={`w-4 h-4 ${isFav ? 'fill-[#FF1E6A]' : ''}`} />
                        </button>
                      </div>

                      <div className="flex-1 w-full space-y-3">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                            {event.title}
                          </h3>
                          <span className="px-2.5 py-0.5 rounded-full bg-[#FF1E6A] text-white text-[11px] font-semibold flex items-center gap-1 shadow-sm">
                            <Sparkles className="w-3 h-3" />
                            Event
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                          <Calendar className="w-3.5 h-3.5 text-[#FF1E6A]" />
                          <span>{event.displayDate}</span>
                          <span>•</span>
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{event.startTime} - {event.endTime}</span>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                          <MapPin className="w-3.5 h-3.5 text-[#FF1E6A]" />
                          <span>{event.venue}, {event.city}</span>
                        </div>

                        <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              navigate(`/events/${event.id}`);
                            }}
                            className="px-5 py-2.5 rounded-xl bg-[#FF1E6A] hover:bg-[#E1145A] text-white text-xs font-semibold shadow-md shadow-pink-500/20 flex items-center gap-1.5 transition-transform active:scale-95"
                          >
                            <span>Explore Event Details</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {displayEvents.length > 1 && (
              <div
                className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/20 backdrop-blur-sm px-2.5 py-1 rounded-full pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {displayEvents.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentEventSlide(idx)}
                    className={`h-1.5 rounded-full transition-all ${
                      currentEventSlide === idx ? 'w-5 bg-[#FF1E6A]' : 'w-1.5 bg-white/70 hover:bg-white'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. DYNAMIC RECOMMENDED PARTNERS IN INFINITE SCROLLING MODE (NO VIEW ALL BUTTON) */}
      <div className="relative space-y-5 pt-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-tr from-[#FF1E6A] via-pink-500 to-rose-400 flex items-center justify-center text-white shadow-md shadow-pink-500/25 flex-shrink-0">
              <Heart className="w-5 h-5 sm:w-6 sm:h-6 fill-white drop-shadow-sm" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-heading flex items-center gap-1.5">
                <span>{partnersHeading}</span>
                <span className="text-amber-400 text-lg">✨</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Verified festival partners registered in {locationLabel}.
              </p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-3 select-none transform -rotate-1 hover:rotate-0 transition-transform duration-300">
            <div className="relative flex-shrink-0">
              <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-sm">
                <line x1="8" y1="36" x2="36" y2="8" stroke="#FF1E6A" strokeWidth="4" strokeLinecap="round" />
                <line x1="29" y1="15" x2="36" y2="8" stroke="#FDE047" strokeWidth="4" strokeLinecap="round" />
                <line x1="10" y1="8" x2="36" y2="34" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" />
                <line x1="10" y1="8" x2="17" y2="15" stroke="#FF1E6A" strokeWidth="4" strokeLinecap="round" />
                <circle cx="22" cy="21" r="3.5" fill="#E11D48" />
                <circle cx="22" cy="21" r="1.5" fill="#FFFBEB" />
              </svg>
            </div>

            <div className="font-script text-lg sm:text-xl text-slate-800 font-bold leading-tight">
              <span className="text-slate-700 block">{isAllCities ? 'All Cities' : 'Same City'}</span>
              <span className="flex items-center gap-1.5">
                <span className="text-slate-800">Same Vibe</span>
                <span className="text-[#FF1E6A] font-extrabold flex items-center gap-0.5">
                  Dynamic Matches! <span className="inline-block animate-pulse text-base">💖</span>
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Partner Cards Grid / Empty State */}
        {isUsersLoading ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-100 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#FF1E6A]" />
            <p className="text-xs font-semibold text-slate-500">Searching partners across {locationLabel}…</p>
          </div>
        ) : displayPartners.length === 0 ? (
          /* Empty State Card when no dynamic users found */
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-100 space-y-3 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-pink-50 text-[#FF1E6A] mx-auto flex items-center justify-center">
              <UserX className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800">{emptyPartnersLabel}</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              There are currently no verified partner accounts registered in {locationLabel}. Switch to another state or city from the top bar to discover partners across other regions.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {displayPartners.map((partner) => {
              const isFav = favorites.includes(partner.id);
              const isRequested = hasRequestedPartner(partner.id, 'default-event');

              return (
                <div
                  key={partner.id}
                  className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group"
                >
                  <Link
                    to={`/partners/${partner.id}`}
                    className="relative h-48 sm:h-44 w-full overflow-hidden bg-slate-900 block"
                  >
                    <img
                      src={partner.avatar}
                      alt={partner.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />

                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

                    <div className={`absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full ${partner.matchColor} text-white text-[11px] font-extrabold flex items-center gap-1 shadow-md`}>
                      <Zap className="w-3 h-3 fill-white" />
                      <span>{partner.matchScore}</span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleFavorite(partner.id);
                      }}
                      className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white text-[#FF1E6A] shadow-md flex items-center justify-center hover:scale-110 active:scale-90 transition-transform"
                      title="Favorite partner"
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-[#FF1E6A]' : ''}`} />
                    </button>

                    {partner.online && (
                      <div className="absolute bottom-2 left-2.5 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-white text-[10px] font-semibold flex items-center gap-1.5 border border-white/10">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Online</span>
                      </div>
                    )}

                    <div className="absolute bottom-2 right-2.5 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-white text-[10px] font-semibold flex items-center gap-1 border border-white/10">
                      <Camera className="w-3 h-3" />
                      <span>{partner.photosCount}</span>
                    </div>
                  </Link>

                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-1">
                        <Link
                          to={`/partners/${partner.id}`}
                          className="flex items-center gap-1.5 min-w-0 hover:text-[#FF1E6A] transition-colors"
                        >
                          <h4 className="text-sm sm:text-base font-bold text-slate-900 hover:text-[#FF1E6A] truncate">
                            {partner.name}, {partner.age}
                          </h4>
                          <svg className="w-4 h-4 text-[#0284C7] fill-[#0284C7] flex-shrink-0" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                          </svg>
                        </Link>

                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold flex-shrink-0 ${partner.tag.color}`}>
                          {partner.tag.hasStar ? '★ ' : ''}{partner.tag.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-[#FF1E6A]" />
                        <span>{partner.city}, {partner.state}</span>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center gap-2">
                      <button
                        onClick={() => handleOpenViewPartner(partner)}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#FF1E6A] to-pink-500 hover:from-[#E1145A] hover:to-pink-600 text-white text-xs font-bold shadow-md shadow-pink-500/20 flex items-center justify-center gap-1.5 transition-transform active:scale-95"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Partner</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleStartChatWithPartner(partner.id);
                        }}
                        disabled={chatLoadingPartnerId === partner.id}
                        className="w-10 h-10 rounded-xl bg-white hover:bg-pink-50 text-[#FF1E6A] border border-pink-200 flex items-center justify-center shadow-sm transition-all active:scale-95 flex-shrink-0 cursor-pointer disabled:opacity-50"
                        title={`Chat with ${partner.name}`}
                      >
                        {chatLoadingPartnerId === partner.id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-[#FF1E6A]" />
                        ) : (
                          <MessageCircle className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Infinite Scroll Sentinel */}
        {displayPartners.length > 0 && (
          <div ref={observerTargetRef} className="py-6 flex flex-col items-center justify-center text-center">
            {isFetchingNextPage && (
              <div className="flex items-center gap-2.5 text-xs font-bold text-[#FF1E6A] bg-pink-50 px-4 py-2 rounded-full border border-pink-100 shadow-xs animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin text-[#FF1E6A]" />
                <span>Loading more verified partners in {locationLabel}…</span>
              </div>
            )}

            {!hasNextPage && (
              <div className="text-xs font-semibold text-slate-400 py-4 flex items-center gap-1.5">
                <span>✨ You've reached the end of partners in {locationLabel} ✨</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Interactive Request Partner Modal */}
      <RequestPartnerModal
        candidate={selectedPartner}
        event={null}
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        matchScore={92}
      />
    </div>
  );
};

export default DashboardPage;
