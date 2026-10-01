import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useEvent, EventSlotItem } from '../../hooks/events/useEvents';
import {
  Calendar,
  Clock,
  MapPin,
  ArrowLeft,
  Share2,
  Heart,
  Loader2,
  CalendarX,
  Mail,
  Phone,
  Users,
  Building,
  CheckCircle,
  ExternalLink,
  Ticket
} from 'lucide-react';

export const EventDetailPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { favorites, toggleFavorite, showToast } = useApp();

  // Fetch Event details directly from database API
  const { data: event, isLoading, error } = useEvent(eventId);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-[#FF1E6A]" />
        <p className="text-sm font-bold text-slate-600">Loading event details from database…</p>
      </div>
    );
  }

  if (!event || error) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-100 shadow-xl text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-pink-50 text-[#FF1E6A] mx-auto flex items-center justify-center">
          <CalendarX className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Event Not Found</h2>
        <p className="text-xs sm:text-sm text-slate-500">
          The requested event could not be found in the database.
        </p>
        <button
          onClick={() => navigate('/events')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#FF1E6A] text-white text-xs font-bold hover:bg-[#E1145A] shadow-md transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Events</span>
        </button>
      </div>
    );
  }

  const isFav = favorites.includes(event.id);
  const images = event.images && event.images.length > 0
    ? event.images.map((img) => img.url)
    : ['https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80'];

  const currentPhoto = images[activePhotoIdx] || images[0];
  const slots: EventSlotItem[] = event.slots || [];
  const selectedSlot = slots.find((s) => s.id === selectedSlotId) || slots[0] || null;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: `${event.title} in ${event.city}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Link Copied!', 'Event link copied to clipboard.', 'info');
    }
  };

  const mapQueryUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${event.venueName}, ${event.addressLine}, ${event.city}, ${event.state}`
  )}`;

  const createdDate = event.createdAt
    ? new Date(event.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-300">
      {/* 1. TOP NAVIGATION & ACTION BAR */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 text-xs font-bold shadow-xs transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="p-2.5 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-xs transition-all"
            title="Share Event"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => toggleFavorite(event.id)}
            className="p-2.5 rounded-2xl bg-white border border-slate-200 text-[#FF1E6A] hover:bg-pink-50 shadow-xs transition-all"
            title="Save Event"
          >
            <Heart className={`w-4 h-4 ${isFav ? 'fill-[#FF1E6A]' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. MAIN EVENT SHOWCASE CARD */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
        {/* Photo Gallery Banner */}
        <div className="relative w-full h-[320px] sm:h-[420px] bg-slate-900">
          <img
            src={currentPhoto}
            alt={event.title}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

          {/* Status Badge */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold text-white shadow-md ${
              event.status === 'PUBLISHED' ? 'bg-emerald-600' : 'bg-amber-600'
            }`}>
              {event.status}
            </span>
          </div>

          {/* Photo count indicator */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-semibold">
              {activePhotoIdx + 1} / {images.length} Photos
            </div>
          )}
        </div>

        {/* Gallery Thumbnails (if multiple images) */}
        {images.length > 1 && (
          <div className="flex items-center gap-2 p-4 bg-slate-50 border-b border-slate-100 overflow-x-auto">
            {images.map((imgUrl, idx) => (
              <button
                key={idx}
                onClick={() => setActivePhotoIdx(idx)}
                className={`w-16 h-12 rounded-xl overflow-hidden border-2 transition-transform flex-shrink-0 ${
                  activePhotoIdx === idx
                    ? 'border-[#FF1E6A] scale-105 ring-2 ring-pink-400/50 shadow-md'
                    : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <img src={imgUrl} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Event Body Content */}
        <div className="p-6 sm:p-8 space-y-8">
          {/* Header Title & Location */}
          <div className="space-y-2 border-b border-slate-100 pb-6">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
              {event.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-500 font-medium">
              <div className="flex items-center gap-1 text-[#FF1E6A]">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span>{event.venueName}, {event.city}, {event.state}</span>
              </div>
              {createdDate && (
                <div className="flex items-center gap-1 text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Created on {createdDate}</span>
                </div>
              )}
            </div>
          </div>

          {/* Description Section */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Description</h2>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-5 rounded-2xl border border-slate-100">
              {event.description}
            </p>
          </div>

          {/* Event Slots Section (Stored in Database) */}
          {slots.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#FF1E6A]" />
                  <span>Event Slots ({slots.length})</span>
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {slots.map((slot) => {
                  const isSelected = selectedSlot?.id === slot.id;
                  const slotDateFormatted = new Date(slot.slotDate).toLocaleDateString('en-IN', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  });

                  return (
                    <div
                      key={slot.id}
                      onClick={() => setSelectedSlotId(slot.id)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                        isSelected
                          ? 'border-[#FF1E6A] bg-pink-50/50 shadow-md'
                          : 'border-slate-100 hover:border-pink-200 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">{slot.title || 'Event Slot'}</h3>
                          <p className="text-xs font-semibold text-[#FF1E6A] flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{slotDateFormatted}</span>
                          </p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          slot.status === 'OPEN' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {slot.status}
                        </span>
                      </div>

                      <div className="space-y-1 pt-2 border-t border-slate-100 text-xs">
                        <div className="flex items-center justify-between text-slate-600">
                          <span>Timing:</span>
                          <span className="font-semibold text-slate-900">{slot.startTime} - {slot.endTime}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-600">
                          <span>Entry Fee:</span>
                          <span className="font-bold text-pink-600 text-sm">₹{slot.entryFee}</span>
                        </div>
                        {slot.capacity ? (
                          <div className="flex items-center justify-between text-slate-600">
                            <span>Capacity:</span>
                            <span className="font-semibold text-slate-900">{slot.capacity}</span>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Venue & Location Details (From Database) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Address & Venue Box */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Building className="w-4 h-4 text-[#FF1E6A]" />
                <span>Venue & Address</span>
              </h2>

              <div className="space-y-1.5 text-xs sm:text-sm text-slate-700">
                <p><strong>Venue Name:</strong> {event.venueName}</p>
                <p><strong>Address:</strong> {event.addressLine}</p>
                <p><strong>City & State:</strong> {event.city}, {event.state} {event.postalCode ? `- ${event.postalCode}` : ''}</p>
              </div>

              <a
                href={mapQueryUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF1E6A] hover:underline pt-1"
              >
                <span>Open in Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Organizer & Contact Info Box */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#FF1E6A]" />
                <span>Organizer & Contact</span>
              </h2>

              <div className="space-y-1.5 text-xs sm:text-sm text-slate-700">
                {event.organizer ? (
                  <p><strong>Organizer Name:</strong> {event.organizer.name}</p>
                ) : null}
                {event.organizer ? (
                  <p><strong>Organizer Location:</strong> {event.organizer.city}, {event.organizer.state}</p>
                ) : null}
                {event.contactEmail ? (
                  <p className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span><strong>Email:</strong> {event.contactEmail}</span>
                  </p>
                ) : null}
                {event.contactPhone ? (
                  <p className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span><strong>Phone:</strong> {event.contactPhone}</span>
                  </p>
                ) : null}
                {event.capacity ? (
                  <p><strong>Total Event Capacity:</strong> {event.capacity}</p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;
