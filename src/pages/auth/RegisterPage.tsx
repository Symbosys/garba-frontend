import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { State, City } from 'country-state-city';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  CreditCard,
  Eye,
  EyeOff,
  ImagePlus,
  IndianRupee,
  LoaderCircle,
  MapPin,
  QrCode,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  UserCheck,
  UserRound,
  X,
  XCircle,
} from 'lucide-react';
import { apiRequest, ApiError } from '../../lib/api-client';
import { useApp } from '../../context/AppContext';
import { compressImage, formatFileSize } from '../../utils/image-compression.util';
import { GarbaLogo } from '../../components/common/GarbaLogo';

type Role = 'PARTNER' | 'ORGANIZER';
interface RegistrationConfig {
  feePaise: number;
  feeRupees: number;
  currency: string;
  roles: Role[];
}

const initialForm = {
  role: 'PARTNER' as Role,
  name: '',
  age: '',
  email: '',
  phone: '',
  password: '',
  addressLine: '',
  city: '',
  state: '',
  gender: 'PREFER_NOT_TO_SAY',
};

interface PhotoItem {
  file: File;
  previewUrl: string;
  originalSize: number;
  compressedSize: number;
}

export const RegisterPage: React.FC = () => {
  const { showToast } = useApp();
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [form, setForm] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [proof, setProof] = useState<PhotoItem | null>(null);
  const [isCompressingPhotos, setIsCompressingPhotos] = useState(false);
  const [isCompressingProof, setIsCompressingProof] = useState(false);
  const [submitted, setSubmitted] = useState<{ id: string; role: Role } | null>(null);
  const [selectedStateCode, setSelectedStateCode] = useState<string>('');

  const allStates = useMemo(() => {
    return State.getStatesOfCountry('IN') || [];
  }, []);

  const availableCities = useMemo(() => {
    let stateCode = selectedStateCode;
    if (!stateCode && form.state) {
      const found = allStates.find((s) => s.name.toLowerCase() === form.state.toLowerCase());
      if (found) stateCode = found.isoCode;
    }
    if (!stateCode) return [];
    return City.getCitiesOfState('IN', stateCode) || [];
  }, [allStates, form.state, selectedStateCode]);

  const config = useQuery({
    queryKey: ['registration-config'],
    queryFn: () => apiRequest<RegistrationConfig>('/public/registration-config'),
    staleTime: 300_000,
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const body = new FormData();
      Object.entries(form).forEach(([key, value]) => body.append(key, value));
      photos.forEach((item) => body.append('profilePhotos', item.file));
      if (proof) body.append('paymentScreenshot', proof.file);
      return apiRequest<{ id: string; role: Role; status: string }>('/auth/register', {
        method: 'POST',
        body,
      });
    },
    onSuccess: (data) => {
      showToast('Registration Received! 🎊', 'Your profile and payment screenshot are under review.', 'success');
      setSubmitted({ id: data.id, role: data.role });
    },
    onError: (error) => {
      const message = error instanceof ApiError ? error.message : 'Registration failed. Please try again.';
      showToast(message, undefined, 'error');
    },
  });

  const handleRoleSelect = (role: Role) => {
    setForm((current) => ({ ...current, role }));
    showToast('Role Selected', role === 'PARTNER' ? 'Registering as Partner User' : 'Registering as Event Organizer', 'info');
  };

  const handlePhotosChange = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setIsCompressingPhotos(true);

    try {
      const incomingFiles = Array.from(fileList);
      const availableSlots = 5 - photos.length;
      if (availableSlots <= 0) {
        showToast('Limit Reached', 'You can upload up to 5 photos max.', 'warning');
        return;
      }

      const filesToProcess = incomingFiles.slice(0, availableSlots);
      const newItems: PhotoItem[] = [];

      for (const file of filesToProcess) {
        const compressed = await compressImage(file, 100 * 1024);
        const previewUrl = URL.createObjectURL(compressed);
        newItems.push({
          file: compressed,
          previewUrl,
          originalSize: file.size,
          compressedSize: compressed.size,
        });
      }

      setPhotos((prev) => [...prev, ...newItems]);
      showToast('Photos Processed 📸', `${newItems.length} photo(s) compressed under 100KB & ready.`, 'success');
    } catch {
      showToast('Compression Error', 'Failed to optimize selected photos.', 'error');
    } finally {
      setIsCompressingPhotos(false);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => {
      const itemToRemove = prev[index];
      if (itemToRemove) {
        URL.revokeObjectURL(itemToRemove.previewUrl);
      }
      return prev.filter((_, i) => i !== index);
    });
    showToast('Photo Removed', '', 'info');
  };

  const handleProofChange = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const file = fileList[0];
    if (!file) return;

    setIsCompressingProof(true);
    try {
      const compressed = await compressImage(file, 100 * 1024);
      if (proof) {
        URL.revokeObjectURL(proof.previewUrl);
      }
      const previewUrl = URL.createObjectURL(compressed);
      setProof({
        file: compressed,
        previewUrl,
        originalSize: file.size,
        compressedSize: compressed.size,
      });
      showToast('Payment Proof Ready 💳', `Screenshot compressed to ${formatFileSize(compressed.size)} (<100KB)`, 'success');
    } catch {
      showToast('Compression Error', 'Failed to process payment screenshot.', 'error');
    } finally {
      setIsCompressingProof(false);
    }
  };

  const removeProof = () => {
    if (proof) {
      URL.revokeObjectURL(proof.previewUrl);
      setProof(null);
      showToast('Payment Screenshot Cleared', '', 'info');
    }
  };

  const setField = (key: keyof typeof initialForm, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  // Validate Step 1 and proceed to Step 2
  const handleProceedToPayment = (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.phone.trim() || !form.password || !form.age) {
      showToast('Required Fields Missing', 'Please fill in your name, age, email, phone, and password.', 'warning');
      return;
    }
    const parsedAge = Number(form.age);
    if (isNaN(parsedAge) || parsedAge < 14 || parsedAge > 100) {
      showToast('Invalid Age', 'Please enter a valid age between 14 and 100 years.', 'warning');
      return;
    }
    if (!form.city.trim() || !form.state.trim() || !form.addressLine.trim()) {
      showToast('Address Incomplete', 'Please provide your city, state, and address.', 'warning');
      return;
    }
    if (photos.length < 1) {
      showToast('Profile Photo Required', 'Please upload at least 1 profile photo.', 'warning');
      return;
    }

    setCurrentStep(2);
    showToast('Step 1 Completed 👍', 'Please scan the QR code to make payment & upload screenshot.', 'info');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step 2 Submission
  const handleSubmitRegistration = (event: React.FormEvent) => {
    event.preventDefault();
    if (!proof) {
      showToast('Payment Screenshot Required', 'Please upload your payment screenshot before submitting.', 'warning');
      return;
    }
    mutation.mutate();
  };

  if (submitted) {
    return (
      <div
        className="relative min-h-screen bg-cover bg-center bg-no-repeat px-4 py-16 text-slate-900 flex items-center justify-center"
        style={{ backgroundImage: "url('/login-bg.jpg')" }}
      >
        <div className="absolute inset-0 bg-white/85 backdrop-blur-[2px]" />
        <div className="relative mx-auto max-w-lg rounded-3xl border border-emerald-200 bg-white/95 p-8 sm:p-10 text-center shadow-2xl shadow-emerald-950/10 backdrop-blur-xl">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h1 className="mt-5 text-2xl sm:text-3xl font-black text-slate-900">Registration Received</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Your {submitted.role === 'PARTNER' ? 'partner' : 'event organizer'} profile and payment screenshot have been submitted. Our super-admin team will verify your account within <strong>10 to 15 minutes</strong>.
          </p>
          <div className="mt-6 rounded-2xl bg-slate-50 border border-slate-200 p-4 text-left">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Registration Reference ID</p>
            <p className="mt-1 font-mono text-xs font-bold text-slate-900 break-all">{submitted.id}</p>
          </div>
          <Link
            to="/login"
            className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-rose-600/20 hover:from-rose-700 hover:to-amber-700 transition"
          >
            Return to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen bg-cover bg-center bg-no-repeat px-4 py-10 text-slate-900"
      style={{ backgroundImage: "url('/login-bg.jpg')" }}
    >
      {/* Light Frosted Backdrop Overlay */}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px]" />

      <div className="relative mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mb-3 flex justify-center">
            <GarbaLogo size="md" />
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3.5 py-1 text-xs font-bold text-rose-700 border border-rose-200 shadow-xs mb-2">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            Join the GarbaMitra Community
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
            Create Your Verified Account
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Select your account type below, complete your details, and submit your payment screenshot.
          </p>
        </div>

        {/* Top Level Account Type Selector */}
        <div className="mb-6 grid grid-cols-2 gap-3.5">
          <RoleHeaderCard
            active={form.role === 'PARTNER'}
            onClick={() => handleRoleSelect('PARTNER')}
            icon={UserRound}
            title="Partner User"
            subtitle="Find Garba &amp; Dandiya partners"
          />
          <RoleHeaderCard
            active={form.role === 'ORGANIZER'}
            onClick={() => handleRoleSelect('ORGANIZER')}
            icon={Building2}
            title="Event Organizer"
            subtitle="Host, manage &amp; publish events"
          />
        </div>

        {/* Main Registration Card */}
        <div className="rounded-3xl border border-rose-100/90 bg-white/95 p-6 sm:p-9 shadow-2xl shadow-rose-950/10 backdrop-blur-xl">
          {/* 2-Step Icon Progress Indicator inside Card */}
          <div className="mb-8 flex items-center justify-between border-b border-slate-100 pb-5">
            {/* Step 1 Indicator Button */}
            <button
              type="button"
              onClick={() => {
                setCurrentStep(1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-3 text-left transition hover:opacity-90 cursor-pointer group"
            >
              <div
                className={`grid h-10 w-10 place-items-center rounded-2xl transition-all shadow-sm ${
                  currentStep === 1
                    ? 'bg-gradient-to-br from-rose-600 to-pink-600 text-white ring-4 ring-rose-500/15'
                    : 'bg-emerald-100 text-emerald-700 group-hover:ring-2 group-hover:ring-emerald-400'
                }`}
              >
                {currentStep === 2 ? <Check className="h-5 w-5" /> : <UserCheck className="h-5 w-5" />}
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {currentStep === 2 ? 'Step 1 (Click to edit)' : 'Step 1'}
                </p>
                <p className="text-xs sm:text-sm font-bold text-slate-900">Basic Information &amp; Photos</p>
              </div>
            </button>

            <div className="hidden sm:block h-0.5 flex-1 mx-4 bg-gradient-to-r from-rose-300 to-amber-300 rounded-full" />

            {/* Step 2 Indicator Button */}
            <div className="flex items-center gap-3">
              <div
                className={`grid h-10 w-10 place-items-center rounded-2xl transition-all shadow-sm ${
                  currentStep === 2
                    ? 'bg-gradient-to-br from-rose-600 via-pink-600 to-amber-600 text-white ring-4 ring-amber-500/15'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                <QrCode className="h-5 w-5" />
              </div>
              <div className="text-right sm:text-left">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Step 2</p>
                <p className="text-xs sm:text-sm font-bold text-slate-900">QR Payment &amp; Verify</p>
              </div>
            </div>
          </div>

          {/* ================= STEP 1: Basic Information & Profile Photos ================= */}
          {currentStep === 1 && (
            <form onSubmit={handleProceedToPayment} className="space-y-6">
              {/* Form Fields Grid */}
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Full Name"
                  value={form.name}
                  onChange={(v) => setField('name', v)}
                  placeholder="e.g. Aarohi Verma"
                />
                <Field
                  label="Age (in years)"
                  type="number"
                  value={form.age}
                  onChange={(v) => setField('age', v)}
                  placeholder="e.g. 21"
                  hint="Mandatory for partner discovery & verification (14–100)"
                />
                <Field
                  label="Email Address"
                  type="email"
                  value={form.email}
                  onChange={(v) => setField('email', v)}
                  placeholder="name@example.com"
                />
                <Field
                  label="Phone Number"
                  type="tel"
                  value={form.phone}
                  onChange={(v) => setField('phone', v)}
                  placeholder="Enter 10-digit mobile number"
                  hint="Direct mobile number (e.g. 9876543210)"
                />

                {/* Password with Eye Toggle and No Complex Regex Restrictions */}
                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold text-slate-700">Password</span>
                  <div className="relative">
                    <input
                      required
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={(e) => setField('password', e.target.value)}
                      minLength={4}
                      maxLength={72}
                      placeholder="Enter your password"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 pr-11 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-rose-500 focus:bg-white focus:ring-4 focus:ring-rose-500/10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <span className="mt-1 block text-[10px] text-slate-400">Easy to remember password</span>
                </label>

                {/* State Searchable Dropdown */}
                <SearchableSelect
                  label="State"
                  value={form.state}
                  onChange={(stateName, meta) => {
                    setField('state', stateName);
                    setSelectedStateCode(meta?.isoCode || '');
                    setField('city', '');
                  }}
                  options={allStates.map((s) => ({
                    label: s.name,
                    value: s.name,
                    hint: s.isoCode,
                    meta: s,
                  }))}
                  placeholder="Select State"
                  searchPlaceholder="Search state (e.g. Gujarat, Jharkhand, Maharashtra)..."
                />

                {/* City Searchable Dropdown */}
                <SearchableSelect
                  label="City"
                  value={form.city}
                  onChange={(cityName) => setField('city', cityName)}
                  options={availableCities.map((c) => ({
                    label: c.name,
                    value: c.name,
                  }))}
                  placeholder={form.state ? 'Select City' : 'Select State First'}
                  searchPlaceholder="Search city (e.g. Ahmedabad, Surat, Ranchi, Mumbai)..."
                  disabled={!form.state}
                  disabledMessage="Please select a state above first"
                />

                <label className="sm:col-span-2">
                  <span className="mb-1.5 block text-xs font-bold text-slate-700">Complete Address / Locality</span>
                  <textarea
                    required
                    minLength={3}
                    maxLength={250}
                    value={form.addressLine}
                    onChange={(e) => setField('addressLine', e.target.value)}
                    placeholder="Enter your street address, area or locality"
                    className="min-h-20 w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-rose-500 focus:bg-white focus:ring-4 focus:ring-rose-500/10"
                  />
                </label>

                <label className="sm:col-span-2">
                  <span className="mb-1.5 block text-xs font-bold text-slate-700">Gender</span>
                  <select
                    value={form.gender}
                    onChange={(e) => setField('gender', e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 text-sm text-slate-900 outline-none transition focus:border-rose-500 focus:bg-white focus:ring-4 focus:ring-rose-500/10 cursor-pointer"
                  >
                    <option value="FEMALE">Female</option>
                    <option value="MALE">Male</option>
                    <option value="NON_BINARY">Non-binary</option>
                    <option value="OTHER">Other</option>
                    <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                  </select>
                </label>
              </div>

              {/* Profile Photos (1 to 5) with Compression & Previews */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Profile Photos ({photos.length}/5)
                    </span>
                    <p className="text-[11px] text-slate-500">Auto-compressed under 100KB for maximum clarity & speed.</p>
                  </div>
                  {photos.length > 0 && (
                    <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                      {photos.length} uploaded
                    </span>
                  )}
                </div>

                {/* Photo Previews Grid */}
                {photos.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {photos.map((item, idx) => (
                      <div
                        key={item.previewUrl}
                        className="group relative aspect-square overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm"
                      >
                        <img src={item.previewUrl} alt={`Profile ${idx + 1}`} className="h-full w-full object-cover" />
                        {idx === 0 && (
                          <span className="absolute top-1.5 left-1.5 rounded-md bg-rose-600/90 px-1.5 py-0.5 text-[9px] font-bold text-white shadow">
                            Main
                          </span>
                        )}
                        <span className="absolute bottom-1.5 left-1.5 rounded-md bg-black/70 px-1.5 py-0.5 text-[9px] font-medium text-white backdrop-blur-xs">
                          {formatFileSize(item.compressedSize)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removePhoto(idx)}
                          className="absolute top-1.5 right-1.5 grid h-6 w-6 place-items-center rounded-full bg-rose-600 text-white shadow-md transition hover:bg-rose-700 cursor-pointer"
                          title="Remove photo"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Dropzone for Photos */}
                {photos.length < 5 && (
                  <label className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-rose-200/90 bg-rose-50/40 p-6 text-center transition hover:border-rose-400 hover:bg-rose-50/70 cursor-pointer">
                    {isCompressingPhotos ? (
                      <div className="flex items-center gap-2 text-rose-600">
                        <LoaderCircle className="h-5 w-5 animate-spin" />
                        <span className="text-xs font-bold">Compressing &amp; optimizing photos under 100KB…</span>
                      </div>
                    ) : (
                      <>
                        <div className="grid h-10 w-10 place-items-center rounded-xl bg-rose-100 text-rose-600">
                          <ImagePlus className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">
                            {photos.length === 0 ? 'Upload Profile Photos' : 'Add More Photos'}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Upload 1 to 5 images (JPEG, PNG or WebP). Automatically scaled &amp; compressed.
                          </p>
                        </div>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      hidden
                      disabled={isCompressingPhotos}
                      onChange={(e) => handlePhotosChange(e.target.files)}
                    />
                  </label>
                )}
              </div>

              {/* Next Step Button */}
              <button
                type="submit"
                disabled={isCompressingPhotos}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 py-4 text-sm font-bold text-white shadow-lg shadow-rose-600/20 hover:from-rose-700 hover:to-amber-700 transition active:scale-[0.99] cursor-pointer"
              >
                <span>Proceed to QR Payment (Step 2)</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <p className="text-center text-xs text-slate-600 pt-1">
                Already have an account?{' '}
                <Link to="/login" className="font-bold text-rose-600 hover:text-rose-700 underline underline-offset-2">
                  Sign In
                </Link>
              </p>
            </form>
          )}

          {/* ================= STEP 2: QR Code Payment & Screenshot Upload ================= */}
          {currentStep === 2 && (
            <form onSubmit={handleSubmitRegistration} className="space-y-6">
              {/* Back to Step 1 Button */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep(1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 transition cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4 text-rose-600" />
                  <span>Back to Step 1 (Edit Details)</span>
                </button>
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                  Step 2 of 2
                </span>
              </div>

              {/* QR Code Presentation & Detailed Steps */}
              <div className="space-y-4 rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50/60 via-rose-50/30 to-white p-5 sm:p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/70 pb-3">
                  <div>
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-900">
                      <QrCode className="h-3.5 w-3.5 text-amber-700" />
                      Registration Payment via QR Code
                    </span>
                    <h3 className="mt-1 text-base font-black text-slate-900">Scan &amp; Pay Registration Fee</h3>
                  </div>
                  <div className="rounded-xl bg-white px-3.5 py-1.5 border border-amber-200 shadow-xs text-left sm:text-right">
                    <p className="text-[10px] font-bold uppercase text-slate-500">Fixed Registration Fee</p>
                    <p className="text-lg font-black text-rose-600">
                      {config.data ? `₹${config.data.feeRupees}` : 'Loading…'}
                    </p>
                  </div>
                </div>

                {/* QR Code and Instructions */}
                <div className="grid sm:grid-cols-[160px_1fr] gap-5 items-center rounded-2xl bg-white p-4 border border-amber-100 shadow-xs">
                  <div className="flex flex-col items-center">
                    <div className="overflow-hidden rounded-2xl border-2 border-amber-400 p-1 bg-white shadow-md">
                      <img
                        src="/qr/qr.jpg"
                        alt="GarbaMitra Official Payment QR Code"
                        className="h-36 w-36 object-contain rounded-xl"
                      />
                    </div>
                    <p className="mt-1.5 text-[10px] font-bold text-amber-800">Scan with any UPI App</p>
                  </div>

                  <div className="space-y-2 text-xs text-slate-700">
                    <p className="font-bold text-slate-900 text-sm">Payment Instructions:</p>
                    <ol className="list-decimal pl-4 space-y-1 text-slate-600">
                      <li>Scan the official QR code using Google Pay, PhonePe, Paytm, or BHIM.</li>
                      <li>
                        Pay the registration fee of{' '}
                        <strong className="text-slate-900 font-black">
                          {config.data ? `₹${config.data.feeRupees}` : 'the fixed server fee'}
                        </strong>
                        .
                      </li>
                      <li>Take a clear screenshot of the successful transaction.</li>
                      <li>Upload the payment screenshot below.</li>
                    </ol>
                    <div className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-800 border border-emerald-200">
                      <Clock3 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span>Account will be verified within 10 to 15 minutes</span>
                    </div>
                  </div>
                </div>

                {/* Screenshot Upload / Preview Box */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Upload Payment Screenshot
                    </span>
                    {proof && (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        ✓ Screenshot Attached
                      </span>
                    )}
                  </div>

                  {proof ? (
                    <div className="relative flex flex-col sm:flex-row items-center gap-4 rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4">
                      <img
                        src={proof.previewUrl}
                        alt="Payment screenshot proof"
                        className="h-28 w-28 sm:h-32 sm:w-32 rounded-xl object-contain border border-emerald-200 bg-white"
                      />
                      <div className="flex-1 text-left">
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Screenshot Processed (&lt;100KB)
                        </div>
                        <p className="mt-1.5 text-xs font-bold text-slate-900 truncate max-w-xs">{proof.file.name}</p>
                        <p className="text-[11px] text-slate-500">
                          Optimized Size:{' '}
                          <span className="font-bold text-slate-700">{formatFileSize(proof.compressedSize)}</span>{' '}
                          (Original: {formatFileSize(proof.originalSize)})
                        </p>
                        <button
                          type="button"
                          onClick={removeProof}
                          className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 cursor-pointer"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Change Screenshot
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-amber-300 bg-white p-6 text-center transition hover:border-amber-500 hover:bg-amber-50/40 cursor-pointer">
                      {isCompressingProof ? (
                        <div className="flex items-center gap-2 text-amber-700">
                          <LoaderCircle className="h-5 w-5 animate-spin" />
                          <span className="text-xs font-bold">Compressing payment screenshot under 100KB…</span>
                        </div>
                      ) : (
                        <>
                          <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-100 text-amber-700">
                            <Upload className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800">Click to Upload Payment Screenshot</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Attach your transaction confirmation screenshot. Auto-optimized under 100KB.
                            </p>
                          </div>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        hidden
                        disabled={isCompressingProof}
                        onChange={(e) => handleProofChange(e.target.files)}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Informational Alert Box */}
              <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-xs leading-relaxed text-amber-900">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <span>
                  Your account starts in a <strong>PENDING</strong> state. Our super-admin verifies the transaction screenshot, and your account will be activated within <strong>10 to 15 minutes</strong>.
                </span>
              </div>

              {/* Bottom Action Buttons */}
              <div className="flex flex-col-reverse sm:flex-row items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep(1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 py-4 px-6 text-sm font-bold text-slate-700 transition cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Step 1</span>
                </button>

                <button
                  disabled={mutation.isPending || !proof || isCompressingProof}
                  type="submit"
                  className="flex flex-1 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 py-4 px-6 text-sm font-bold text-white shadow-lg shadow-rose-600/20 hover:from-rose-700 hover:to-amber-700 transition active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {mutation.isPending ? (
                    <>
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      <span>Uploading &amp; Submitting Registration…</span>
                    </>
                  ) : (
                    <>
                      <IndianRupee className="h-4 w-4" />
                      <span>
                        Complete Registration
                        {config.data ? ` · ₹${config.data.feeRupees}` : ''}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

const RoleHeaderCard = ({
  active,
  onClick,
  icon: Icon,
  title,
  subtitle,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  title: string;
  subtitle: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex items-center gap-3.5 rounded-2xl p-4 text-left transition-all cursor-pointer backdrop-blur-md ${
      active
        ? 'border-2 border-rose-500 bg-white/95 shadow-lg shadow-rose-950/10 ring-2 ring-rose-500/20'
        : 'border border-white/80 bg-white/70 hover:bg-white/90 shadow-sm'
    }`}
  >
    <div
      className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl transition-all ${
        active
          ? 'bg-gradient-to-br from-rose-600 to-pink-600 text-white shadow-sm'
          : 'bg-rose-50 text-rose-600'
      }`}
    >
      <Icon className="h-6 w-6" />
    </div>
    <div className="min-w-0">
      <p className="text-sm sm:text-base font-black text-slate-900">{title}</p>
      <p className="text-[11px] sm:text-xs text-slate-600 truncate">{subtitle}</p>
    </div>
  </button>
);

const Field = ({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  hint?: string;
}) => (
  <label className="block">
    <span className="mb-1.5 block text-xs font-bold text-slate-700">{label}</span>
    <input
      required
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      minLength={type === 'password' ? 4 : 2}
      maxLength={type === 'password' ? 72 : 254}
      placeholder={placeholder}
      className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-rose-500 focus:bg-white focus:ring-4 focus:ring-rose-500/10"
    />
    {hint && <span className="mt-1 block text-[10px] text-slate-400">{hint}</span>}
  </label>
);

interface SearchableSelectOption {
  label: string;
  value: string;
  hint?: string;
  meta?: any;
}

const SearchableSelect = ({
  label,
  value,
  onChange,
  options,
  placeholder,
  searchPlaceholder = 'Type to search...',
  disabled = false,
  disabledMessage,
}: {
  label: string;
  value: string;
  onChange: (value: string, meta?: any) => void;
  options: SearchableSelectOption[];
  placeholder: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  disabledMessage?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      setTimeout(() => searchInputRef.current?.focus(), 60);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return options;
    const term = searchTerm.toLowerCase();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(term) ||
        (opt.hint && opt.hint.toLowerCase().includes(term))
    );
  }, [options, searchTerm]);

  const handleSelect = (val: string, meta?: any) => {
    onChange(val, meta);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative block" ref={containerRef}>
      <span className="mb-1.5 block text-xs font-bold text-slate-700">
        {label} <span className="text-rose-500">*</span>
      </span>

      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
            setSearchTerm('');
          }
        }}
        className={`flex w-full items-center justify-between rounded-xl border p-3.5 text-sm transition outline-none cursor-pointer ${
          disabled
            ? 'border-slate-200 bg-slate-100/70 text-slate-400 cursor-not-allowed'
            : isOpen
            ? 'border-rose-500 bg-white ring-4 ring-rose-500/10 text-slate-900 shadow-sm'
            : value
            ? 'border-slate-200 bg-slate-50/70 text-slate-900 hover:bg-white hover:border-slate-300'
            : 'border-slate-200 bg-slate-50/70 text-slate-400 hover:bg-white hover:border-slate-300'
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          <MapPin className={`h-4 w-4 shrink-0 ${value ? 'text-rose-500' : 'text-slate-400'}`} />
          <span className="truncate font-medium">{value || placeholder}</span>
        </div>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${
            isOpen ? 'rotate-180 text-rose-500' : ''
          }`}
        />
      </button>

      {disabled && disabledMessage && (
        <span className="mt-1 block text-[10px] text-slate-400">{disabledMessage}</span>
      )}

      {isOpen && (
        <div className="absolute left-0 right-0 z-50 mt-1.5 overflow-hidden rounded-2xl border border-rose-100 bg-white/98 shadow-2xl shadow-rose-950/15 backdrop-blur-xl animate-in fade-in-50 zoom-in-95 duration-150">
          {/* Search Input Bar inside Dropdown */}
          <div className="border-b border-slate-100 p-2.5 bg-slate-50/70">
            <div className="relative flex items-center">
              <Search className="absolute left-3 h-3.5 w-3.5 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-8 pr-8 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-56 overflow-y-auto p-1.5 space-y-0.5">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const isSelected = option.value.toLowerCase() === value.toLowerCase();
                return (
                  <button
                    key={`${option.value}-${option.hint || ''}`}
                    type="button"
                    onClick={() => handleSelect(option.value, option.meta)}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition cursor-pointer ${
                      isSelected
                        ? 'bg-rose-50 font-bold text-rose-700'
                        : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate text-left">
                      <span className="truncate">{option.label}</span>
                      {option.hint && (
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-500">
                          {option.hint}
                        </span>
                      )}
                    </div>
                    {isSelected && <Check className="h-3.5 w-3.5 text-rose-600 shrink-0" />}
                  </button>
                );
              })
            ) : (
              <div className="p-3 text-center">
                <p className="text-xs text-slate-500">No matches found</p>
                {searchTerm.trim() && (
                  <button
                    type="button"
                    onClick={() => handleSelect(searchTerm.trim())}
                    className="mt-2 inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 hover:bg-rose-100 cursor-pointer"
                  >
                    Use "{searchTerm.trim()}"
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

