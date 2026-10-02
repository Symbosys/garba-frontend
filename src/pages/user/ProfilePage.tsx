import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  User,
  CheckCircle2,
  MapPin,
  Calendar,
  Share2,
  Edit,
  ShieldCheck,
  Phone,
  Mail,
  Building,
  UserCheck,
  Sparkles,
  ArrowLeft,
  Clock,
  Check
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { currentUser, showToast } = useApp();
  const { user: authUser } = useAuth();
  const navigate = useNavigate();
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  const activeUser = authUser || currentUser;
  if (!activeUser) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">No profile found</h2>
        <p className="text-xs text-slate-500">Please log in to view your profile credentials.</p>
        <Link
          to="/login"
          className="px-5 py-2.5 rounded-2xl bg-[#FF1E6A] text-white text-xs font-bold shadow-md hover:bg-[#E1145A] transition-all"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  // Database photos list
  const photos = authUser?.photos && authUser.photos.length > 0
    ? authUser.photos.map((p) => p.url)
    : currentUser?.avatar
    ? [currentUser.avatar]
    : ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'];

  const currentPhoto = photos[selectedPhotoIndex] || photos[0];

  const joinedDate = activeUser.createdAt
    ? new Date(activeUser.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'Navratri 2026';

  const userRole = activeUser.role === 'SUPER_ADMIN' ? 'Admin' : activeUser.role === 'ORGANIZER' ? 'Event Organizer' : 'Dancer Partner';
  const userStatus = activeUser.status || 'APPROVED';

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${activeUser.name}'s Profile`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Profile link copied to clipboard!', '', 'info');
    }
  };

  const formattedGender = activeUser.gender === 'FEMALE' ? 'Female' : activeUser.gender === 'MALE' ? 'Male' : activeUser.gender === 'NON_BINARY' ? 'Non-Binary' : activeUser.gender === 'OTHER' ? 'Other' : activeUser.gender || 'Not specified';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Top Header / Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="p-2.5 rounded-2xl text-slate-600 hover:text-purple-900 bg-white hover:bg-purple-50 border border-slate-200 transition-colors shadow-xs"
            title="Share Profile"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <Link
            to="/profile/edit"
            className="py-2.5 px-5 rounded-2xl font-bold text-xs text-white bg-gradient-to-r from-[#FF1E6A] via-pink-500 to-[#9333EA] hover:opacity-95 shadow-md shadow-pink-500/20 flex items-center gap-1.5 transition-transform active:scale-95"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </Link>
        </div>
      </div>

      {/* 1. MAIN PROFILE CARD */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 text-center sm:text-left">
          {/* Avatar with Photo Selector */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <img
                src={currentPhoto}
                alt={activeUser.name}
                className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl object-cover ring-4 ring-pink-500 shadow-xl bg-slate-900"
              />
              <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-pink-600 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md whitespace-nowrap">
                <Sparkles className="w-3 h-3 fill-white" />
                <span>{userRole}</span>
              </div>
            </div>

            {/* Thumbnail selector if multiple database photos */}
            {photos.length > 1 && (
              <div className="flex items-center gap-1.5 pt-2 overflow-x-auto max-w-[160px]">
                {photos.map((pUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedPhotoIndex(idx)}
                    className={`w-8 h-8 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedPhotoIndex === idx ? 'border-pink-500 scale-105' : 'border-transparent opacity-60'
                    }`}
                  >
                    <img src={pUrl} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Info Details */}
          <div className="flex-1 space-y-4">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading flex items-center justify-center sm:justify-start gap-2">
                  <span>{activeUser.name}</span>
                  {activeUser.age ? (
                    <span className="text-slate-500 font-bold text-xl">({activeUser.age} yrs)</span>
                  ) : null}
                  <CheckCircle2 className="w-5 h-5 text-pink-600 fill-pink-100 flex-shrink-0" />
                </h1>

                <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200/80 self-center sm:self-auto">
                  <Check className="w-3.5 h-3.5" />
                  <span>{userStatus === 'APPROVED' ? 'Verified Profile' : userStatus}</span>
                </div>
              </div>

              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-slate-600 font-semibold mt-1">
                <MapPin className="w-3.5 h-3.5 text-[#FF1E6A]" />
                <span>
                  {activeUser.city}
                  {activeUser.state ? `, ${activeUser.state}` : ''}
                </span>
              </div>
            </div>

            {/* Quick Badges based on database info */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
              <span className="px-3 py-1 rounded-xl bg-purple-50 text-purple-900 text-xs font-bold border border-purple-100 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-purple-600" />
                Gender: {formattedGender}
              </span>
              <span className="px-3 py-1 rounded-xl bg-pink-50 text-pink-700 text-xs font-bold border border-pink-100 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-pink-600" />
                Member Since: {joinedDate}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. DATABASE CREDENTIALS & ACCOUNT DETAILS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Information (Database) */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-purple-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-purple-50">
            <Mail className="w-5 h-5 text-[#FF1E6A]" />
            <h3 className="text-base font-bold text-slate-900 font-heading">
              Contact & Authentication
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Registered Email</span>
                <span className="text-xs sm:text-sm font-bold text-slate-800 break-all">{activeUser.email || 'Not specified'}</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                ✓ Verified
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Registered Mobile</span>
                <span className="text-xs sm:text-sm font-bold text-slate-800">{activeUser.phone || 'Not specified'}</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                ✓ Verified
              </span>
            </div>
          </div>
        </div>

        {/* Residential Location & Address (Database) */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-purple-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-purple-50">
            <Building className="w-5 h-5 text-purple-600" />
            <h3 className="text-base font-bold text-slate-900 font-heading">
              Address & Location Details
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Address Line</span>
              <span className="text-xs sm:text-sm font-bold text-slate-800 block">
                {activeUser.addressLine || (currentUser as any)?.area || 'Address details on file'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">City</span>
                <span className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5 block">{activeUser.city}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">State</span>
                <span className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5 block">{activeUser.state}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
