import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Upload,
  Calendar,
  Clock,
  MapPin,
  IndianRupee,
  Sparkles,
  Image as ImageIcon,
  Building,
} from 'lucide-react';
import { toast } from 'sonner';
import { organizerApi } from '../../api/organizer';
import type { SlotPayload } from '../../api/organizer';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormSlot {
  title: string;
  slotDate: string;
  startTime: string;
  endTime: string;
  entryFee: number;
  capacity?: number;
}

const defaultSlot: FormSlot = {
  title: 'Day 1 - Opening Pass',
  slotDate: new Date().toISOString().split('T')[0] || '',
  startTime: '18:00',
  endTime: '23:30',
  entryFee: 500,
  capacity: 500,
};

export const CreateEventModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Event basic fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [venueName, setVenueName] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('Ahmedabad');
  const [state, setState] = useState('Gujarat');
  const [postalCode, setPostalCode] = useState('');
  const [latitude, setLatitude] = useState('23.0225');
  const [longitude, setLongitude] = useState('72.5714');
  const [capacity, setCapacity] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>('PUBLISHED');

  // Images
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Slots
  const [slots, setSlots] = useState<FormSlot[]>([defaultSlot]);

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    if (selectedImages.length + files.length > 10) {
      toast.error('You can upload at most 10 images');
      return;
    }
    const combined = [...selectedImages, ...files];
    setSelectedImages(combined);
    setImagePreviews(combined.map((f) => URL.createObjectURL(f)));
  };

  const removeImage = (idx: number) => {
    const updatedFiles = selectedImages.filter((_, i) => i !== idx);
    setSelectedImages(updatedFiles);
    setImagePreviews(updatedFiles.map((f) => URL.createObjectURL(f)));
  };

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
        capacity: 500,
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
    if (selectedImages.length === 0) {
      toast.error('Please upload at least 1 banner/photo for the event');
      return;
    }
    if (slots.length === 0) {
      toast.error('Please add at least 1 slot');
      return;
    }

    // Build payload slots with proper ISO strings
    const formattedSlots: SlotPayload[] = slots.map((s) => {
      const [sh, sm] = s.startTime.split(':');
      const [eh, em] = s.endTime.split(':');

      const start = new Date(s.slotDate);
      start.setHours(Number(sh) || 18, Number(sm) || 0, 0, 0);

      const end = new Date(s.slotDate);
      end.setHours(Number(eh) || 23, Number(em) || 30, 0, 0);

      // If end time is before start time (e.g. 02:00 AM next morning), bump end date by 1 day
      if (end <= start) {
        end.setDate(end.getDate() + 1);
      }

      return {
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
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('venueName', venueName);
      formData.append('addressLine', addressLine);
      formData.append('city', city);
      formData.append('state', state);
      if (postalCode) formData.append('postalCode', postalCode);
      formData.append('latitude', latitude);
      formData.append('longitude', longitude);
      if (capacity) formData.append('capacity', capacity);
      if (contactEmail) formData.append('contactEmail', contactEmail);
      if (contactPhone) formData.append('contactPhone', contactPhone);
      formData.append('status', status);

      // Pass slots as serialized JSON string
      formData.append('slots', JSON.stringify(formattedSlots));

      // Append image files
      selectedImages.forEach((img) => {
        formData.append('images', img);
      });

      await organizerApi.createEvent(formData);
      toast.success('Festival event created successfully with all slots!');
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create event');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 md:p-6 border-b border-slate-100 bg-gradient-to-r from-purple-50 via-pink-50 to-amber-50">
          <div>
            <h2 className="text-xl font-black text-purple-950 font-heading flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-pink-600" />
              Create Festival Event
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Publish your Dandiya/Garba festival with multi-day pass slots.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 md:p-6 space-y-6 flex-1 text-xs">
          {/* SECTION 1: Basic Info */}
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
                  placeholder="e.g. Navratri Raas Mahotsav 2026"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 font-medium"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="font-bold text-slate-700">Description *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe traditional folk music, celebrity singers, dress code, dandiya rules, and special highlights..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Publication Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-800 bg-white"
                >
                  <option value="PUBLISHED">Published (Live for discovery)</option>
                  <option value="DRAFT">Draft (Unlisted)</option>
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
                  placeholder="e.g. Riverfront Sabarmati Grounds"
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
                  placeholder="Ahmedabad"
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
                  placeholder="e.g. Gate 4, Behind Tagore Hall"
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
                  placeholder="Gujarat"
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
                  placeholder="23.0225"
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
                  placeholder="72.5714"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Postal Code</label>
                <input
                  type="text"
                  placeholder="380001"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: Event Photos / Banners */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider pb-1 border-b border-slate-100">
              3. Event Images &amp; Banners (At least 1 required)
            </h3>

            <div>
              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-pink-200 rounded-2xl bg-pink-50/40 hover:bg-pink-50/80 cursor-pointer transition">
                <Upload className="w-8 h-8 text-pink-500 mb-2" />
                <span className="font-bold text-slate-800">Click to upload event images (Max 10)</span>
                <span className="text-[11px] text-slate-500 mt-1">JPEG, PNG, or WebP up to 5MB each</span>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>

              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 mt-3">
                  {imagePreviews.map((src, idx) => (
                    <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 group">
                      <img src={src} alt="preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 p-1 rounded-full bg-slate-900/80 text-white hover:bg-rose-600 transition"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* SECTION 4: Event Slots & Pass Timings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider">
                4. Event Passes &amp; Daily Slots ({slots.length})
              </h3>
              <button
                type="button"
                onClick={addSlot}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 font-bold text-xs transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Another Slot
              </button>
            </div>

            <div className="space-y-3">
              {slots.map((slot, index) => (
                <div
                  key={index}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-900 text-xs">Slot #{index + 1}</span>
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
                      <label className="font-bold text-slate-600 text-[11px]">Slot Label / Pass Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Day 1 - General Pass"
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
                        placeholder="500"
                        value={slot.entryFee}
                        onChange={(e) => handleSlotChange(index, 'entryFee', Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-black text-pink-700"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-600 text-[11px]">Slot Quota (Optional)</label>
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

          {/* SECTION 5: Contact Information */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider pb-1 border-b border-slate-100">
              5. Organizer Contact Info (Optional)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Contact Email</label>
                <input
                  type="email"
                  placeholder="organizer@festivals.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Contact Phone</label>
                <input
                  type="tel"
                  placeholder="+919876543210"
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
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-pink-600 hover:from-amber-600 hover:to-pink-700 text-white font-black shadow-lg shadow-pink-500/20 disabled:opacity-50 transition"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Creating Event &amp; Uploading…
                </>
              ) : (
                'Create & Publish Event'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
