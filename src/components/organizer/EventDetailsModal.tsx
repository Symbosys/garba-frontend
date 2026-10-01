import React from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  IndianRupee,
  Users,
  Mail,
  Phone,
  Building2,
  Tag,
  Sparkles,
} from 'lucide-react';
import type { OrganizerEvent } from '../../api/types';

interface Props {
  event: OrganizerEvent | null;
  onClose: () => void;
  onEdit: (event: OrganizerEvent) => void;
}

export const EventDetailsModal: React.FC<Props> = ({ event, onClose, onEdit }) => {
  if (!event) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 md:p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <span
              className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${
                event.status === 'PUBLISHED'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : event.status === 'DRAFT'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}
            >
              {event.status}
            </span>
            <span className="text-xs font-semibold text-slate-400 font-mono">ID: {event.id.slice(0, 8)}</span>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Scrollable */}
        <div className="p-5 md:p-6 space-y-6 overflow-y-auto flex-1">
          {/* Cover & Gallery preview */}
          {event.images && event.images.length > 0 && (
            <div className="grid grid-cols-3 gap-2 rounded-2xl overflow-hidden">
              <div className="col-span-2 h-48 sm:h-64">
                <img
                  src={event.images[0]?.url}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="grid grid-rows-2 gap-2 h-48 sm:h-64">
                {event.images.slice(1, 3).map((img, idx) => (
                  <img
                    key={img.id || idx}
                    src={img.url}
                    alt="preview"
                    className="w-full h-full object-cover rounded-xl"
                  />
                ))}
                {event.images.length === 1 && (
                  <div className="h-full bg-slate-100 rounded-xl grid place-items-center text-xs text-slate-400">
                    No extra images
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Title & Description */}
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">{event.title}</h2>
            <p className="text-xs sm:text-sm text-slate-600 whitespace-pre-line leading-relaxed">
              {event.description}
            </p>
          </div>

          {/* Venue & Location info */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-pink-600" />
                Venue &amp; City
              </span>
              <p className="font-bold text-slate-900">{event.venueName}</p>
              <p className="text-slate-600">{event.addressLine}, {event.city}, {event.state}</p>
            </div>

            <div className="space-y-1">
              <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-600" />
                Coordinates &amp; Capacity
              </span>
              <p className="font-mono text-slate-700">
                Lat: {Number(event.latitude).toFixed(4)}, Lng: {Number(event.longitude).toFixed(4)}
              </p>
              <p className="text-slate-600">Max Capacity: {event.capacity ? `${event.capacity} people` : 'Unlimited'}</p>
            </div>
          </div>

          {/* Slots Schedule */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-pink-600" />
                Festival Schedule &amp; Slots ({event.slots?.length || 0})
              </h3>
            </div>

            {(!event.slots || event.slots.length === 0) ? (
              <div className="p-4 rounded-xl bg-amber-50 text-amber-800 text-xs text-center font-medium">
                No slots configured for this event.
              </div>
            ) : (
              <div className="space-y-2">
                {event.slots.map((slot, index) => (
                  <div
                    key={slot.id || index}
                    className="p-3.5 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-purple-900">
                          {slot.title || `Slot ${index + 1}`}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                          {new Date(slot.slotDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-500" />
                          {new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                          {new Date(slot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {slot.capacity && (
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3 text-purple-500" />
                            {slot.capacity} max
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:text-right">
                      <div className="px-3 py-1.5 rounded-xl bg-pink-50 border border-pink-100">
                        <span className="text-xs font-black text-pink-700">
                          {slot.entryFee === 0 ? 'FREE ENTRY' : `₹${slot.entryFee}`}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 md:p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 transition"
          >
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              onEdit(event);
            }}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-pink-600 hover:from-amber-600 hover:to-pink-700 text-white font-bold text-xs shadow-md shadow-pink-500/20 transition"
          >
            Edit Event &amp; Slots
          </button>
        </div>
      </div>
    </div>
  );
};
