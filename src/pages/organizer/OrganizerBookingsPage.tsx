import React, { useState } from 'react';
import {
  Ticket,
  Search,
  Download,
  Filter,
  CheckCircle,
  Clock,
  QrCode,
  User,
  Calendar,
  Sparkles,
  Phone,
  Mail,
  Building,
} from 'lucide-react';

const mockBookings = [
  {
    id: 'BK-94810',
    attendeeName: 'Priya Sharma',
    phone: '+91 98765 43210',
    email: 'priya.sharma@example.com',
    eventTitle: 'Maha Navratri Raas Utsav 2026',
    slotTitle: 'Day 1 - Inauguration Night',
    slotDate: '2026-10-15',
    ticketsCount: 2,
    amount: '₹1,200',
    status: 'CONFIRMED',
    bookingDate: '2026-10-01 10:30 AM',
  },
  {
    id: 'BK-94811',
    attendeeName: 'Rahul Patel',
    phone: '+91 98250 12345',
    email: 'rahul.patel@example.com',
    eventTitle: 'Maha Navratri Raas Utsav 2026',
    slotTitle: 'Day 2 - Weekend Prime Pass',
    slotDate: '2026-10-16',
    ticketsCount: 4,
    amount: '₹3,200',
    status: 'CHECKED_IN',
    bookingDate: '2026-10-01 11:15 AM',
  },
  {
    id: 'BK-94812',
    attendeeName: 'Ananya Mehta',
    phone: '+91 97123 98765',
    email: 'ananya.mehta@example.com',
    eventTitle: 'Rangilo Dandiya Night',
    slotTitle: 'Day 1 - Celebrity Pass',
    slotDate: '2026-10-18',
    ticketsCount: 1,
    amount: '₹800',
    status: 'CONFIRMED',
    bookingDate: '2026-10-01 01:20 PM',
  },
  {
    id: 'BK-94813',
    attendeeName: 'Jayesh Dave',
    phone: '+91 99090 55443',
    email: 'jayesh.dave@example.com',
    eventTitle: 'Vibrant Youth Garba Carnival',
    slotTitle: 'Weekend Pass',
    slotDate: '2026-10-20',
    ticketsCount: 3,
    amount: '₹1,500',
    status: 'CONFIRMED',
    bookingDate: '2026-10-01 02:45 PM',
  },
  {
    id: 'BK-94814',
    attendeeName: 'Kavita Joshi',
    phone: '+91 94280 88776',
    email: 'kavita.joshi@example.com',
    eventTitle: 'Maha Navratri Raas Utsav 2026',
    slotTitle: 'Day 5 - Dandiya Workshop + Pass',
    slotDate: '2026-10-19',
    ticketsCount: 2,
    amount: '₹1,400',
    status: 'REFUNDED',
    bookingDate: '2026-09-30 04:10 PM',
  },
];

export const OrganizerBookingsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [scannedId, setScannedId] = useState<string | null>(null);

  const filtered = mockBookings.filter((b) => {
    const matchesSearch =
      b.attendeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.eventTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.phone.includes(searchTerm);

    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-100 text-pink-800 text-xs font-bold uppercase tracking-wider mb-1">
            <Ticket className="w-3.5 h-3.5 text-pink-600" />
            Ticket &amp; Passes Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
            Attendee Bookings &amp; Passes
          </h1>
          <p className="text-sm text-slate-500">Overview of attendee ticket bookings and gate check-in status.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => alert('CSV report downloaded for current bookings!')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs transition"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-1">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Confirmed Passes</p>
          <p className="text-2xl font-black text-slate-900 font-heading">1,420</p>
          <p className="text-xs text-emerald-600 font-semibold">✓ 100% Verified Payments</p>
        </div>
        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-1">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gate Check-Ins</p>
          <p className="text-2xl font-black text-purple-900 font-heading">940</p>
          <p className="text-xs text-slate-500 font-semibold">66% Checked in at venue gates</p>
        </div>
        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-1">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gross Booking Value</p>
          <p className="text-2xl font-black text-pink-600 font-heading">₹7,85,000</p>
          <p className="text-xs text-slate-500 font-semibold">Across all active event slots</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search attendee, booking ID, phone…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'CONFIRMED', 'CHECKED_IN', 'REFUNDED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-purple-900 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4 pl-6">Booking ID &amp; Attendee</th>
                <th className="p-4">Event &amp; Slot Details</th>
                <th className="p-4">Pass Count</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right pr-6">Gate Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No bookings found matching your search.
                  </td>
                </tr>
              ) : (
                filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/60 transition">
                    <td className="p-4 pl-6 space-y-0.5">
                      <div className="font-bold text-slate-900">{b.attendeeName}</div>
                      <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
                        <span>{b.id}</span>
                        <span>•</span>
                        <span>{b.phone}</span>
                      </div>
                    </td>
                    <td className="p-4 space-y-0.5 max-w-xs">
                      <div className="font-bold text-slate-900 truncate">{b.eventTitle}</div>
                      <div className="text-[11px] text-pink-600 font-semibold">{b.slotTitle}</div>
                      <div className="text-[10px] text-slate-400">{b.slotDate}</div>
                    </td>
                    <td className="p-4 font-bold text-slate-900">
                      {b.ticketsCount} {b.ticketsCount > 1 ? 'Passes' : 'Pass'}
                    </td>
                    <td className="p-4 font-black text-slate-900">{b.amount}</td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                          b.status === 'CONFIRMED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : b.status === 'CHECKED_IN'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {b.status === 'CHECKED_IN' && <CheckCircle className="w-3 h-3" />}
                        {b.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      {b.status === 'CONFIRMED' ? (
                        <button
                          onClick={() => {
                            setScannedId(b.id);
                            b.status = 'CHECKED_IN';
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold text-[11px] transition"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          Check-In Gate
                        </button>
                      ) : b.status === 'CHECKED_IN' ? (
                        <span className="text-[11px] text-emerald-600 font-bold">✓ Admitted</span>
                      ) : (
                        <span className="text-[11px] text-slate-400">N/A</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default OrganizerBookingsPage;
