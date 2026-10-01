import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  X,
  MapPin,
  Heart,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Camera,
  Check,
  User,
  Music,
  Calendar,
  Zap
} from 'lucide-react';
import { PublicUser } from '../../hooks/users/useUsers';

export interface ViewPartnerModalProps {
  partner: {
    id: string;
    name: string;
    age: number;
    gender: string;
    city: string;
    state: string;
    garbaLevel?: string;
    dandiyaLevel?: string;
    date?: string;
    matchScore?: string;
    online?: boolean;
    photosCount?: string;
    avatar: string;
    rawUser?: PublicUser;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
}

export const ViewPartnerModal: React.FC<ViewPartnerModalProps> = ({
  partner,
  isOpen,
  onClose,
  isFavorite = false,
  onToggleFavorite,
}) => {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  if (!isOpen || !partner) return null;

  const photos = partner.rawUser?.photos && partner.rawUser.photos.length > 0
    ? partner.rawUser.photos.map((p) => p.url)
    : [partner.avatar];

  const currentPhoto = photos[selectedPhotoIndex] || partner.avatar;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl border border-pink-100 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/50 hover:bg-black/75 text-white backdrop-blur-sm flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-md"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Image Preview Banner */}
        <div className="relative h-64 sm:h-72 w-full bg-slate-900 overflow-hidden flex-shrink-0">
          <img
            src={currentPhoto}
            alt={partner.name}
            className="w-full h-full object-cover object-center transition-all duration-300"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

          {/* Verified Badge & Online indicator */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#0D9488] text-white text-xs font-black flex items-center gap-1 shadow-md">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Partner
            </span>
            {partner.online && (
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/90 text-white text-[11px] font-bold flex items-center gap-1.5 backdrop-blur-sm shadow-md">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                Online
              </span>
            )}
          </div>

          {/* Favorite Toggle Button */}
          {onToggleFavorite && (
            <button
              onClick={() => onToggleFavorite(partner.id)}
              className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-[#FF1E6A] shadow-lg flex items-center justify-center transition-transform hover:scale-110 active:scale-90"
              title="Favorite Partner"
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-[#FF1E6A]' : ''}`} />
            </button>
          )}

          {/* Partner Basic Info Overlay */}
          <div className="absolute bottom-4 left-4 right-16 text-white space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black truncate">{partner.name}, {partner.age}</h2>
              <span className="text-pink-400 font-extrabold text-sm capitalize">({partner.gender})</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 flex items-center gap-1 font-medium">
              <MapPin className="w-3.5 h-3.5 text-pink-400 flex-shrink-0" />
              <span>{partner.city}, {partner.state}</span>
            </p>
          </div>
        </div>

        {/* Thumbnail selector if multiple photos */}
        {photos.length > 1 && (
          <div className="flex items-center gap-2 px-6 pt-3 pb-1 bg-slate-50 border-b border-slate-100 overflow-x-auto">
            <Camera className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="text-[11px] font-bold text-slate-500 mr-1 flex-shrink-0">Photos:</span>
            {photos.map((imgUrl, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedPhotoIndex(idx)}
                className={`w-10 h-10 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                  selectedPhotoIndex === idx ? 'border-[#FF1E6A] scale-105 shadow-sm' : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <img src={imgUrl} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Dancing Skill & Match Highlights */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-pink-50/70 border border-pink-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-pink-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <Music className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-pink-600 uppercase tracking-wider">Garba Style</p>
                <p className="text-xs font-extrabold text-slate-800">Traditional & 3-Taali</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Skill Level</p>
                <p className="text-xs font-extrabold text-slate-800">Enthusiast Dancer</p>
              </div>
            </div>
          </div>

          {/* Bio / About Partner */}
          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#FF1E6A]" />
              About Partner
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
              Passionate Garba & Dandiya dancer looking forward to celebrating Navratri festival in {partner.city}, {partner.state}. Looking for positive vibes, rhythm sync, and safe community celebration!
            </p>
          </div>

          {/* Badges / Preferences */}
          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Festival Highlights</h4>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-xl bg-purple-50 text-purple-700 text-xs font-bold border border-purple-100">
                ✨ Navratri 2026 Ready
              </span>
              <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100 flex items-center gap-1">
                <Check className="w-3 h-3" /> Identity Verified
              </span>
              <span className="px-3 py-1 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold border border-rose-100">
                📍 {partner.city} Local
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
          <button
            onClick={onClose}
            className="py-3 px-5 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors"
          >
            Close
          </button>

          <Link
            to="/messages"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-[#FF1E6A] to-pink-500 hover:from-[#E1145A] hover:to-pink-600 text-white text-xs font-bold shadow-lg shadow-pink-500/25 flex items-center justify-center gap-2 transition-transform active:scale-95 text-center"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat / Send Message</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
