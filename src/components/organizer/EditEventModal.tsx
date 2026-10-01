import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Sparkles,
  Building,
} from 'lucide-react';
import { toast } from 'sonner';
import { organizerApi } from '../../api/organizer';
import type { OrganizerEvent } from '../../api/types';
import type { SlotPayload } from '../../api/organizer';

interface Props {
  event: OrganizerEvent | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormSlot {
  id?: string;
  title: string;
  slotDate: string;
  startTime: string;
  endTime: string;
  entryFee: number;
  capacity?: number;
}

export const EditEventModal: React.FC<Props> = ({ event, onClose, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [venueName, setVenueName] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [capacity, setCapacity] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED' | 'CANCELLED'>('PUBLISHED');

  const [slots, setSlots] = useState<FormSlot[]>([]);

  useEffect(() => {
    if (!event) return;
    setTitle(event.title || '');
    setDescription(event.description || '');
    setVenueName(event.venueName || '');
    setAddressLine(event.addressLine || '');
    setCity(event.city || '');
    setState(event.state || '');
    setPostalCode(event.postalCode || '');
    setLatitude(String(event.latitude || '23.0225'));
    setLongitude(String(event.longitude || '72.5714'));
    setCapacity(event.capacity ? String(event.capacity) : '');
    setContactEmail(event.contactEmail || '');
    setContactPhone(event.contactPhone || '');
    setStatus(event.status || 'PUBLISHED');

    if (event.slots && event.slots.length > 0) {
      setSlots(
        event.slots.map((s) => {
          const sDate = s.slotDate ? new Date(s.slotDate).toISOString().split('T')[0] || '' : '';
          const sTime = s.startTime ? new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '18:00';
          const eTime = s.endTime ? new Date(s.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '23:30';

          return {
            id: s.id,
            title: s.title || '',
            slotDate: sDate,
            startTime: sTime,
            endTime: eTime,
            entryFee: s.entryFee ?? 0,
            capacity: s.capacity || undefined,
          };
        })
      );
    } else {
      setSlots([
        {
          title: 'General Pass',
          slotDate: new Date().toISOString().split('T')[0] || '',
          startTime: '18:00',
          endTime: '23:30',
          entryFee: 500,
        },
      ]);
    }
  }, [event]);

  if (!event) return null;

  const handleSlotChange = (index: number, field: keyof FormSlot, value: any) => {
    setSlots((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index]!, [field]: value };
      return copy;
    });
  };

  const addSlot = () => {
    const nextDay = new Date();
    nextDay.setDate(nextDay.getDate() + slots.length);
    const dateStr = nextDay.toISOString().split('T')[0] || '';
    setSlots((prev) => [
      ...prev,
      {
        title: `Day ${prev.length + 1} Pass`,
        slotDate: dateStr,
        startTime: '18:00',
        endTime: '23:30',
        entryFee: 500,
      },
    ]);
  };

  const removeSlot = (index: number) => {
    if (slots.length <= 1) {
      toast.error('An event must have at least one slot');
      return;
    }
    setSlots((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (slots.length === 0) {
      toast.error('Please configure at least 1 slot');
      return;
    }

    const formattedSlots: SlotPayload[] = slots.map((s) => {
      const [sh, sm] = s.startTime.split(':');
      const [eh, em] = s.endTime.split(':');

      const start = new Date(s.slotDate);
      start.setHours(Number(sh) || 18, Number(sm) || 0, 0, 0);

      const end = new Date(s.slotDate);
      end.setHours(Number(eh) || 23, Number(em) || 30, 0, 0);

      if (end <= start) {
        end.setDate(end.getDate() + 1);
      }

      return {
        id: s.id,
        title: s.title,
        slotDate: s.slotDate,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        entryFee: Number(s.entryFee) || 0,
        currency: 'INR',
        capacity: s.capacity ? Number(s.capacity) : undefined,
      };
    });

    try {
      setIsSubmitting(true);
      await organizerApi.updateEvent(event.id, {
        title,
        description,
        venueName,
        addressLine,
        city,
        state,
        postalCode: postalCode || undefined,
        latitude: Number(latitude),
        longitude: Number(longitude),
        capacity: capacity ? Number(capacity) : undefined,
        contactEmail: contactEmail || undefined,
        contactPhone: contactPhone || undefined,
        status,
        slots: formattedSlots,
      });

      toast.success('Event and slots updated successfully!');
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update event');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 md:p-6 border-b border-slate-100 bg-gradient-to-r from-purple-50 via-pink-50 to-amber-50">
          <div>
            <h2 className="text-xl font-black text-purple-950 font-heading flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-pink-600" />
              Edit Festival Event &amp; Slots
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Modify event metadata, timings, ticket pricing, and status.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 md:p-6 space-y-6 flex-1 text-xs">
          {/* SECTION 1: Basic Details */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider pb-1 border-b border-slate-100">
              1. Event Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1 md:col-span-2">
                <label className="font-bold text-slate-700">Festival Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="font-bold text-slate-700">Description *</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-800 bg-white"
                >
                  <option value="PUBLISHED">Published (Live)</option>
                  <option value="DRAFT">Draft</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Total Venue Capacity (Optional)</label>
                <input
                  type="number"
                  placeholder="e.g. 5000"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Venue & Location */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider pb-1 border-b border-slate-100">
              2. Venue &amp; Location
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1 md:col-span-2">
                <label className="font-bold text-slate-700">Venue Name *</label>
                <input
                  type="text"
                  required
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">City *</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="font-bold text-slate-700">Address Line *</label>
                <input
                  type="text"
                  required
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">State *</label>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Latitude *</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Longitude *</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Postal Code</label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: Slots Management */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider">
                3. Event Passes &amp; Daily Slots ({slots.length})
              </h3>
              <button
                type="button"
                onClick={addSlot}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 font-bold text-xs transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Slot
              </button>
            </div>

            <div className="space-y-3">
              {slots.map((slot, index) => (
                <div
                  key={index}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-900 text-xs">
                      Slot #{index + 1} {slot.id && <span className="text-[10px] text-slate-400 font-mono font-normal">(Existing)</span>}
                    </span>
                    {slots.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSlot(index)}
                        className="text-rose-600 hover:text-rose-800 p-1 text-xs flex items-center gap-1 font-bold"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                    <div className="sm:col-span-2 space-y-1">
                      <label className="font-bold text-slate-600 text-[11px]">Pass Title</label>
                      <input
                        type="text"
                        value={slot.title}
                        onChange={(e) => handleSlotChange(index, 'title', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-600 text-[11px]">Date *</label>
                      <input
                        type="date"
                        required
                        value={slot.slotDate}
                        onChange={(e) => handleSlotChange(index, 'slotDate', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-600 text-[11px]">Start Time *</label>
                      <input
                        type="time"
                        required
                        value={slot.startTime}
                        onChange={(e) => handleSlotChange(index, 'startTime', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-600 text-[11px]">End Time *</label>
                      <input
                        type="time"
                        required
                        value={slot.endTime}
                        onChange={(e) => handleSlotChange(index, 'endTime', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-600 text-[11px]">Entry Fee (₹) *</label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={slot.entryFee}
                        onChange={(e) => handleSlotChange(index, 'entryFee', Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-black text-pink-700"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-600 text-[11px]">Capacity</label>
                      <input
                        type="number"
                        placeholder="500"
                        value={slot.capacity || ''}
                        onChange={(e) => handleSlotChange(index, 'capacity', e.target.value ? Number(e.target.value) : undefined)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 4: Contact Info */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider pb-1 border-b border-slate-100">
              4. Organizer Contact Info (Optional)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Contact Email</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Contact Phone</label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Form Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-pink-600 hover:from-amber-600 hover:to-pink-700 text-white font-black shadow-lg shadow-pink-500/20 disabled:opacity-50 transition"
            >
              {isSubmitting ? 'Saving Changes…' : 'Save & Update Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
