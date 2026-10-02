import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useUser } from '../../hooks/users/useUsers';
import { useStartConversation } from '../../hooks/chat/useChat';
import {
  ArrowLeft,
  MapPin,
  Heart,
  MessageCircle,
  ShieldCheck,
  Camera,
  Calendar,
  Loader2,
  UserX,
  Share2,
  UserCheck,
  Building,
  Mail,
  Phone
} from 'lucide-react';

export const PartnerDetailPage: React.FC = () => {
  const { partnerId } = useParams<{ partnerId: string }>();
  const navigate = useNavigate();
  const { favorites, toggleFavorite, showToast } = useApp();
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const startConvMutation = useStartConversation();

  // Fetch partner details directly from database API
  const { data: user, isLoading, error } = useUser(partnerId);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-[#FF1E6A]" />
        <p className="text-sm font-bold text-slate-600">Loading partner details from database…</p>
      </div>
    );
  }

  if (!user || error) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-100 shadow-xl text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-pink-50 text-[#FF1E6A] mx-auto flex items-center justify-center">
          <UserX className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Partner Not Found</h2>
        <p className="text-xs sm:text-sm text-slate-500">
          The requested partner profile could not be found in the database.
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#FF1E6A] text-white text-xs font-bold hover:bg-[#E1145A] shadow-md transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Discovery</span>
        </button>
      </div>
    );
  }

  const isFav = favorites.includes(user.id);
  const photos = user.photos && user.photos.length > 0
    ? user.photos.map((p) => p.url)
    : ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80'];

  const currentPhoto = photos[selectedPhotoIndex] || photos[0];

  const joinedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${user.name}'s Profile`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Profile link copied to clipboard!', '', 'info');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-300">
      {/* Navigation Top Bar */}
      <div className="flex items-center justify-between gap-4">
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
            title="Share Profile"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => toggleFavorite(user.id)}
            className="p-2.5 rounded-2xl bg-white border border-slate-200 text-[#FF1E6A] hover:bg-pink-50 shadow-xs transition-all"
            title="Save to favorites"
          >
            <Heart className={`w-4 h-4 ${isFav ? 'fill-[#FF1E6A]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-12">
          {/* Photo Gallery Column */}
          <div className="md:col-span-6 bg-slate-900 relative flex flex-col justify-between min-h-[360px] sm:min-h-[440px]">
            <img
              src={currentPhoto}
              alt={user.name}
              className="w-full h-full object-cover object-center absolute inset-0 transition-opacity duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

            {/* Status Badge */}
            <div className="relative z-10 p-4 flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-[#0D9488] text-white text-xs font-bold flex items-center gap-1.5 shadow-md">
                <ShieldCheck className="w-3.5 h-3.5" />
                {user.role === 'PARTNER' ? 'Registered Partner' : user.role}
              </span>

              {user.status && (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/90 text-white text-[10px] font-bold shadow-sm">
                  {user.status}
                </span>
              )}
            </div>

            {/* Thumbnails if multiple photos */}
            {photos.length > 1 && (
              <div className="relative z-10 p-4 flex items-center gap-2 overflow-x-auto">
                {photos.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedPhotoIndex(idx)}
                    className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-transform flex-shrink-0 ${
                      selectedPhotoIndex === idx
                        ? 'border-pink-500 scale-105 ring-2 ring-pink-400/50 shadow-md'
                        : 'border-white/50 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Database Details Column */}
          <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              {/* Name & Basic DB Fields */}
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
                    {user.name}
                  </h1>
                  {user.age ? (
                    <span className="text-xl font-bold text-slate-500">
                      {user.age} yrs
                    </span>
                  ) : null}
                </div>

                <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 font-medium mt-1">
                  <MapPin className="w-4 h-4 text-[#FF1E6A] flex-shrink-0" />
                  <span>{user.city}, {user.state}</span>
                </div>
              </div>

              {/* Database Attributes Grid */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Gender:</span>
                  <span className="font-bold text-slate-900 capitalize">{user.gender || 'Not specified'}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Account Role:</span>
                  <span className="font-bold text-pink-600">{user.role}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Location:</span>
                  <span className="font-bold text-slate-900">{user.city}, {user.state}</span>
                </div>

                {joinedDate && (
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                    <span className="text-slate-500 font-medium">Member Since:</span>
                    <span className="font-bold text-slate-900">{joinedDate}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Direct Message Action Button */}
            <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
              <button
                onClick={async () => {
                  try {
                    const res = await startConvMutation.mutateAsync(user.id);
                    navigate(`/messages?id=${res.conversationId}`);
                  } catch {
                    navigate('/messages');
                  }
                }}
                disabled={startConvMutation.isPending}
                className="flex-1 py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#FF1E6A] to-pink-500 hover:from-[#E1145A] hover:to-pink-600 text-white text-xs sm:text-sm font-bold shadow-lg shadow-pink-500/25 flex items-center justify-center gap-2 transition-transform active:scale-95 text-center disabled:opacity-60 cursor-pointer"
              >
                {startConvMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <MessageCircle className="w-4 h-4" />
                )}
                <span>{startConvMutation.isPending ? 'Opening Chat…' : 'Send Message'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerDetailPage;
