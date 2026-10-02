import React, { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { State, City } from 'country-state-city';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { compressImage } from '../../utils/image-compression.util';
import {
  Sparkles,
  ArrowLeft,
  Check,
  User as UserIcon,
  MapPin,
  Building,
  Mail,
  Phone,
  Save,
  Loader2,
  Camera,
  Upload,
  Image as ImageIcon
} from 'lucide-react';

export const EditProfilePage: React.FC = () => {
  const { currentUser, updateUserProfile, showToast } = useApp();
  const { user: authUser } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const activeUser = authUser || currentUser;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile Picture State
  const [avatar, setAvatar] = useState<string>(
    currentUser?.avatar || authUser?.photos?.[0]?.url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'
  );
  const [isCompressingPhoto, setIsCompressingPhoto] = useState(false);

  // Real Database Fields State
  const [name, setName] = useState(activeUser?.name || '');
  const [age, setAge] = useState<number | string>(activeUser?.age || 21);
  const [gender, setGender] = useState<string>(
    activeUser?.gender === 'Female' ? 'FEMALE' : activeUser?.gender === 'Male' ? 'MALE' : activeUser?.gender || 'FEMALE'
  );
  const [addressLine, setAddressLine] = useState(
    activeUser?.addressLine || (currentUser as any)?.area || ''
  );
  const [selectedStateName, setSelectedStateName] = useState(activeUser?.state || 'Jharkhand');
  const [selectedCityName, setSelectedCityName] = useState(activeUser?.city || 'Ranchi');
  const [isSaving, setIsSaving] = useState(false);

  // Indian States & Cities List from country-state-city
  const indianStates = useMemo(() => {
    return State.getStatesOfCountry('IN');
  }, []);

  const selectedStateObj = useMemo(() => {
    return indianStates.find(
      (s) => s.name.toLowerCase() === selectedStateName.toLowerCase() || s.isoCode === selectedStateName
    );
  }, [indianStates, selectedStateName]);

  const availableCities = useMemo(() => {
    if (!selectedStateObj) return [];
    return City.getCitiesOfState('IN', selectedStateObj.isoCode);
  }, [selectedStateObj]);

  const handleStateChange = (stateName: string) => {
    setSelectedStateName(stateName);
    const foundState = indianStates.find((s) => s.name === stateName);
    if (foundState) {
      const citiesInState = City.getCitiesOfState('IN', foundState.isoCode);
      if (citiesInState.length > 0) {
        setSelectedCityName(citiesInState[0].name);
      } else {
        setSelectedCityName('');
      }
    }
  };

  // Handle Photo File Upload & Compression
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      showToast('Invalid Format', 'Please upload a JPG, PNG, or WebP image.', 'warning');
      return;
    }

    try {
      setIsCompressingPhoto(true);
      const compressed = await compressImage(file, 100 * 1024);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatar(event.target.result as string);
          showToast('Photo selected!', 'Click Save Changes to apply.', 'info');
        }
        setIsCompressingPhoto(false);
      };
      reader.onerror = () => {
        setIsCompressingPhoto(false);
        showToast('Photo Error', 'Failed to read photo.', 'error');
      };
      reader.readAsDataURL(compressed);
    } catch (err) {
      console.error('Photo compression error:', err);
      setIsCompressingPhoto(false);
      showToast('Photo Error', 'Failed to process image.', 'error');
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Name is required', 'Please enter your full name', 'warning');
      return;
    }

    const parsedAge = typeof age === 'string' ? parseInt(age, 10) : age;
    if (isNaN(parsedAge) || parsedAge < 14 || parsedAge > 100) {
      showToast('Invalid Age', 'Age must be between 14 and 100', 'warning');
      return;
    }

    setIsSaving(true);

    try {
      updateUserProfile({
        name: name.trim(),
        age: parsedAge,
        gender: gender === 'FEMALE' ? 'Female' : gender === 'MALE' ? 'Male' : (gender as any),
        avatar,
        city: selectedCityName.trim() || selectedStateName,
        area: addressLine.trim() || selectedStateName,
        addressLine: addressLine.trim(),
        state: selectedStateName,
      });

      queryClient.setQueryData(['auth', 'me'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          name: name.trim(),
          age: parsedAge,
          gender,
          city: selectedCityName.trim() || selectedStateName,
          state: selectedStateName,
          addressLine: addressLine.trim(),
          photos: avatar ? [{ id: 'custom-avatar', url: avatar, sortOrder: 0 }] : old.photos,
        };
      });

      showToast('Profile Updated Successfully', 'Your photo and profile details have been saved.', 'success');
      navigate('/profile');
    } catch (err) {
      console.error('Failed to update profile:', err);
      showToast('Update Failed', 'An error occurred while saving your profile.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-300">
      {/* Header & Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/profile')}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Profile</span>
        </button>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-900 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-pink-600" />
          <span>Database Profile Editor</span>
        </div>
      </div>

      {/* Main Edit Form Card */}
      <form onSubmit={handleSaveProfile} className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-xl space-y-7">
        <div className="border-b border-slate-100 pb-4">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
            Edit Account Information
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Update your profile picture and database information.
          </p>
        </div>

        {/* 1. PROFILE PICTURE UPLOAD SECTION */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-50/70 via-pink-50/50 to-purple-50/70 border border-purple-100 flex flex-col sm:flex-row items-center gap-5">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handlePhotoSelect}
            className="hidden"
          />

          <div className="relative group">
            <img
              src={avatar}
              alt="Profile avatar preview"
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover ring-4 ring-pink-500 shadow-lg bg-slate-900"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isCompressingPhoto}
              className="absolute inset-0 bg-black/40 hover:bg-black/60 rounded-3xl flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:opacity-50"
              title="Click to change photo"
            >
              {isCompressingPhoto ? (
                <Loader2 className="w-6 h-6 animate-spin text-pink-400" />
              ) : (
                <>
                  <Camera className="w-6 h-6" />
                  <span className="text-[10px] font-bold mt-1">Change</span>
                </>
              )}
            </button>
            <div className="absolute -bottom-1.5 -right-1.5 p-1.5 rounded-full bg-[#FF1E6A] text-white shadow-md">
              <Camera className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="flex-1 space-y-2 text-center sm:text-left">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Profile Picture</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload a clear photo of yourself (JPG, PNG, or WebP).
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isCompressingPhoto}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-pink-50 text-xs font-bold text-slate-800 border border-slate-200 shadow-xs transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {isCompressingPhoto ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FF1E6A]" />
                ) : (
                  <Upload className="w-3.5 h-3.5 text-[#FF1E6A]" />
                )}
                <span>{isCompressingPhoto ? 'Processing…' : 'Upload New Photo'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2. EDITABLE DATABASE FIELDS */}
        <div className="space-y-5">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <UserIcon className="w-3.5 h-3.5 text-[#FF1E6A]" />
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Aarohi Verma"
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:border-[#FF1E6A] focus:outline-none text-xs sm:text-sm font-semibold text-slate-800 transition-all"
            />
          </div>

          {/* Age & Gender Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Age */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Age (Years) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={14}
                max={100}
                required
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="21"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:border-[#FF1E6A] focus:outline-none text-xs sm:text-sm font-semibold text-slate-800 transition-all"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Gender <span className="text-rose-500">*</span>
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:border-[#FF1E6A] focus:outline-none text-xs sm:text-sm font-semibold text-slate-800 transition-all cursor-pointer"
              >
                <option value="FEMALE">Female</option>
                <option value="MALE">Male</option>
                <option value="NON_BINARY">Non-Binary</option>
                <option value="OTHER">Other</option>
                <option value="PREFER_NOT_TO_SAY">Prefer Not to Say</option>
              </select>
            </div>
          </div>

          {/* State & City Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* State */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-purple-600" />
                State <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedStateName}
                onChange={(e) => handleStateChange(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:border-[#FF1E6A] focus:outline-none text-xs sm:text-sm font-semibold text-slate-800 transition-all cursor-pointer"
              >
                {indianStates.map((s) => (
                  <option key={s.isoCode} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* City */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                City <span className="text-rose-500">*</span>
              </label>
              {availableCities.length > 0 ? (
                <select
                  value={selectedCityName}
                  onChange={(e) => setSelectedCityName(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:border-[#FF1E6A] focus:outline-none text-xs sm:text-sm font-semibold text-slate-800 transition-all cursor-pointer"
                >
                  {availableCities.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  required
                  value={selectedCityName}
                  onChange={(e) => setSelectedCityName(e.target.value)}
                  placeholder="Enter your city"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:border-[#FF1E6A] focus:outline-none text-xs sm:text-sm font-semibold text-slate-800 transition-all"
                />
              )}
            </div>
          </div>

          {/* Address Line */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-purple-600" />
              Address Line / Area
            </label>
            <input
              type="text"
              value={addressLine}
              onChange={(e) => setAddressLine(e.target.value)}
              placeholder="e.g. Morabadi, Near Tagore Hill"
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:border-[#FF1E6A] focus:outline-none text-xs sm:text-sm font-semibold text-slate-800 transition-all"
            />
          </div>
        </div>

        {/* 3. PROTECTED / READ-ONLY CREDENTIALS (Registered DB Info) */}
        <div className="pt-3 border-t border-slate-100 space-y-3">
          <span className="text-[11px] font-bold uppercase text-slate-400 block tracking-wider">
            Protected Registration Credentials (Read Only)
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Registered Email</span>
                <span className="text-xs font-bold text-slate-700">{activeUser?.email || 'N/A'}</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                ✓ Verified
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Registered Phone</span>
                <span className="text-xs font-bold text-slate-700">{activeUser?.phone || 'N/A'}</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                ✓ Verified
              </span>
            </div>
          </div>
        </div>

        {/* Submit Action Buttons */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="px-5 py-3 rounded-2xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSaving || isCompressingPhoto}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#FF1E6A] via-pink-500 to-[#9333EA] hover:opacity-95 text-white text-xs sm:text-sm font-bold shadow-lg shadow-pink-500/25 flex items-center gap-2 transition-transform active:scale-95 disabled:opacity-60 cursor-pointer"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{isSaving ? 'Saving Changes…' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
