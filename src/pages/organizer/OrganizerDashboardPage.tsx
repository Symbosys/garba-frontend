import React from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays,
  TrendingUp,
  Ticket,
  Users,
  PlusCircle,
  Clock,
  Sparkles,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const OrganizerDashboardPage: React.FC = () => {
  const { user } = useAuth();

  const stats = [
    {
      title: 'Published Events',
      value: '3',
      subtitle: 'Active festivals listed',
      icon: CalendarDays,
      color: 'from-amber-500 to-rose-500',
      textColor: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      title: 'Total Passes Sold',
      value: '1,420',
      subtitle: '+18% from last week',
      icon: Ticket,
      color: 'from-pink-500 to-rose-600',
      textColor: 'text-pink-600',
      bgColor: 'bg-pink-50',
    },
    {
      title: 'Estimated Ticket Revenue',
      value: '₹7,85,000',
      subtitle: 'Direct attendee bookings',
      icon: TrendingUp,
      color: 'from-purple-600 to-indigo-600',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Checked-in Attendees',
      value: '940',
      subtitle: '66% scan rate',
      icon: Users,
      color: 'from-emerald-500 to-teal-600',
      textColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
  ];

  const upcomingSlots = [
    {
      id: 'slot-1',
      eventTitle: 'Maha Navratri Raas Utsav 2026',
      date: 'Tonight, 7:00 PM',
      venue: 'Riverfront Ground, Ahmedabad',
      slot: 'Day 3 - Prime Garba Pass',
      entryFee: '₹600',
      booked: '480 / 500',
      status: 'Almost Full',
      statusColor: 'text-rose-700 bg-rose-50 border-rose-200',
    },
    {
      id: 'slot-2',
      eventTitle: 'Rangilo Dandiya Night',
      date: 'Tomorrow, 6:30 PM',
      venue: 'Gymkhana Arena, Surat',
      slot: 'Day 4 - Celebrity Night Pass',
      entryFee: '₹800',
      booked: '320 / 600',
      status: 'Open',
      statusColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    },
    {
      id: 'slot-3',
      eventTitle: 'Vibrant Youth Garba Carnival',
      date: 'Fri, Oct 10, 8:00 PM',
      venue: 'Town Center, Vadodara',
      slot: 'Weekend Mega Slot',
      entryFee: '₹500',
      booked: '210 / 400',
      status: 'Selling Fast',
      statusColor: 'text-amber-700 bg-amber-50 border-amber-200',
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-950 via-indigo-900 to-rose-950 p-6 md:p-8 text-white shadow-xl shadow-purple-950/20">
        <div className="absolute right-0 top-0 -mt-12 -mr-12 h-64 w-64 rounded-full bg-pink-500/20 blur-3xl" />
        <div className="absolute left-1/3 bottom-0 -mb-12 h-48 w-48 rounded-full bg-amber-500/20 blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-amber-300">
              <Sparkles className="w-3.5 h-3.5" />
              Navratri Season 2026 Live Portal
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-heading tracking-tight">
              Welcome Back, {user?.name || 'Festival Organizer'}! 👋
            </h1>
            <p className="text-sm text-purple-200 max-w-2xl leading-relaxed">
              Manage your event listings, track multi-day slots and ticket bookings, and update venue passes in real time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/organizer/events"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-rose-500 to-pink-500 hover:from-amber-300 hover:to-pink-400 text-purple-950 font-black text-sm shadow-lg shadow-pink-950/30 transition transform active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              Manage Events &amp; Slots
            </Link>
            <Link
              to="/organizer/bookings"
              className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm backdrop-blur-md transition"
            >
              <Ticket className="w-4 h-4" />
              View Bookings
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{item.title}</span>
                <div className={`p-2.5 rounded-2xl ${item.bgColor}`}>
                  <Icon className={`w-5 h-5 ${item.textColor}`} />
                </div>
              </div>
              <div>
                <p className="text-2xl lg:text-3xl font-black text-slate-900 font-heading">{item.value}</p>
                <p className="text-xs font-semibold text-slate-500 mt-0.5">{item.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Upcoming Slots + Quick Action Guide */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Slots List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900 font-heading">Upcoming Event Slots</h2>
              <p className="text-xs text-slate-500">Live sessions and venue pass statuses</p>
            </div>
            <Link
              to="/organizer/events"
              className="text-xs font-bold text-pink-600 hover:text-pink-700 flex items-center gap-1"
            >
              All Events <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {upcomingSlots.map((slot) => (
              <div
                key={slot.id}
                className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-pink-200 transition shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm sm:text-base text-slate-900 truncate">
                      {slot.eventTitle}
                    </span>
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${slot.statusColor}`}>
                      {slot.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      {slot.date}
                    </span>
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="w-3.5 h-3.5 text-pink-500" />
                      {slot.venue}
                    </span>
                    <span className="font-semibold text-purple-900">
                      {slot.slot}
                    </span>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                  <span className="text-sm sm:text-base font-black text-slate-900">{slot.entryFee}</span>
                  <span className="text-xs font-semibold text-slate-500">{slot.booked} passes</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Organizer Checklist & Verification Status */}
        <div className="space-y-4">
          <h2 className="text-lg font-black text-slate-900 font-heading">Organizer Guidelines</h2>

          <div className="p-5 rounded-3xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 space-y-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">Account Status</p>
                <p className="text-xs font-bold text-emerald-700">Approved &amp; Live for Booking</p>
              </div>
            </div>

            <div className="border-t border-purple-100 pt-3 space-y-2.5 text-xs text-slate-700">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <span>Upload high-resolution event banners (16:9 ratio recommended).</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <span>Set specific dates and start/end times for each slot.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <span>Provide exact entry fees in standard INR (₹).</span>
              </div>
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <span>Ensure venue address and Google Map coordinates are accurate.</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/organizer/events"
                className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl bg-purple-900 hover:bg-purple-950 text-white font-bold text-xs transition"
              >
                Create New Event
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default OrganizerDashboardPage;
