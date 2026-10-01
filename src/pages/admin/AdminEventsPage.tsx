import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CalendarDays, ChevronLeft, ChevronRight, Eye, LoaderCircle, MapPin, Search, Ticket, X } from 'lucide-react';
import { adminApi } from '../../api/admin';
import type { AdminEvent, EventStatus } from '../../api/types';

export const AdminEventsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState<'' | EventStatus>('');
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(timeout);
  }, [search]);

  const events = useQuery({
    queryKey: ['super-admin', 'events', status, debouncedSearch, page],
    queryFn: () =>
      adminApi.events({
        status: status || undefined,
        search: debouncedSearch || undefined,
        page,
        limit: 12,
      }),
  });

  const detail = useQuery({
    queryKey: ['super-admin', 'event', selectedId],
    queryFn: () => adminApi.event(selectedId!),
    enabled: Boolean(selectedId),
  });

  return (
    <div className="mx-auto max-w-7xl space-y-6 text-slate-900">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-600">Live Event Directory</p>
        <h1 className="mt-1 text-3xl font-black text-slate-900">Platform Events</h1>
        <p className="mt-1 text-sm text-slate-500">View and oversee every event published by approved event organizers.</p>
      </div>

      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_240px_auto]">
        <label className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search event, organizer, venue or city…"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-rose-500 focus:bg-white"
          />
        </label>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as '' | EventStatus);
            setPage(1);
          }}
          className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-rose-500 cursor-pointer"
        >
          <option value="">All statuses</option>
          <option value="PUBLISHED">Published</option>
          <option value="DRAFT">Draft</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <div className="grid place-items-center rounded-xl bg-slate-100 px-5 text-xs font-bold text-slate-600">
          {events.data?.pagination.total ?? 0} Events
        </div>
      </div>

      {events.isPending ? (
        <LoadingRows />
      ) : events.isError ? (
        <ErrorBox message={events.error.message} retry={() => events.refetch()} />
      ) : events.data.items.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-14 text-center text-slate-500">
          <CalendarDays className="mx-auto mb-3 h-10 w-10 text-slate-400" />
          No events match your current filter.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {events.data.items.map((event) => (
              <EventCard key={event.id} event={event} onOpen={() => setSelectedId(event.id)} />
            ))}
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs text-slate-500">
              Page {events.data.pagination.page} of {Math.max(1, events.data.pagination.pages)}
            </p>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-30 cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                disabled={page >= events.data.pagination.pages}
                onClick={() => setPage(page + 1)}
                className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-30 cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedId && (
        <EventDrawer
          event={detail.data}
          loading={detail.isPending}
          error={detail.isError ? detail.error.message : undefined}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
};

const EventCard = ({ event, onOpen }: { event: AdminEvent; onOpen: () => void }) => (
  <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition">
    <div className="relative aspect-[16/9] bg-slate-100">
      <img src={event.images[0]?.url || '/dashboard-banner.jpg'} alt="" className="h-full w-full object-cover" />
      <span
        className={`absolute right-3 top-3 rounded-full px-2.5 py-0.5 text-[10px] font-bold shadow-sm ${
          event.status === 'PUBLISHED'
            ? 'bg-emerald-500 text-white'
            : event.status === 'DRAFT'
            ? 'bg-amber-500 text-white'
            : 'bg-slate-600 text-white'
        }`}
      >
        {event.status}
      </span>
    </div>
    <div className="p-5">
      <h2 className="truncate text-base font-black text-slate-900">{event.title}</h2>
      <p className="mt-0.5 truncate text-xs font-semibold text-rose-600">by {event.organizer.name}</p>
      <div className="mt-3.5 space-y-1.5 text-xs text-slate-600">
        <p className="flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5 text-amber-600" />
          {event.venueName}, {event.city}
        </p>
        <p className="flex items-center gap-2">
          <CalendarDays className="h-3.5 w-3.5 text-rose-600" />
          {new Date(event.startsAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
        </p>
        <p className="flex items-center gap-2">
          <Ticket className="h-3.5 w-3.5 text-emerald-600" />₹{(event.entryFeePaise / 100).toLocaleString('en-IN')}
        </p>
      </div>
      <button
        onClick={onOpen}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition"
      >
        <Eye className="h-3.5 w-3.5" />
        View Details
      </button>
    </div>
  </article>
);

const EventDrawer = ({
  event,
  loading,
  error,
  onClose,
}: {
  event?: AdminEvent;
  loading: boolean;
  error?: string;
  onClose: () => void;
}) => (
  <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
    <aside className="h-full w-full max-w-2xl overflow-y-auto border-l border-slate-200 bg-white p-6 sm:p-8 shadow-2xl text-slate-900">
      <button onClick={onClose} className="ml-auto grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200">
        <X className="h-4 w-4" />
      </button>

      {loading ? (
        <div className="grid h-96 place-items-center">
          <LoaderCircle className="h-8 w-8 animate-spin text-rose-600" />
        </div>
      ) : error || !event ? (
        <ErrorBox message={error || 'Event not found'} retry={() => location.reload()} />
      ) : (
        <div className="space-y-6 mt-4">
          <div className="grid grid-cols-2 gap-2.5">
            {event.images.map((image, index) => (
              <img
                key={image.id}
                src={image.url}
                alt={`${event.title} ${index + 1}`}
                className={`rounded-2xl object-cover border border-slate-200 ${index === 0 ? 'col-span-2 aspect-[16/9] w-full' : 'aspect-square'}`}
              />
            ))}
          </div>

          <div>
            <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-200">
              {event.status}
            </span>
            <h2 className="mt-2 text-2xl font-black text-slate-900">{event.title}</h2>
            <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-600">{event.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              ['Organizer', event.organizer.name],
              ['Organizer Status', event.organizer.status],
              ['Venue', event.venueName],
              ['Location', `${event.city}, ${event.state}`],
              ['Starts', new Date(event.startsAt).toLocaleString('en-IN')],
              ['Ends', new Date(event.endsAt).toLocaleString('en-IN')],
              ['Entry Fee', `₹${(event.entryFeePaise / 100).toLocaleString('en-IN')}`],
              ['Capacity', event.capacity?.toLocaleString('en-IN') || 'Not Set'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-slate-50 border border-slate-100 p-3.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
                <p className="mt-1 text-xs font-semibold text-slate-800">{value}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
            <p className="font-bold text-slate-900">Organizer Contact</p>
            <p className="mt-1">
              {event.organizer.email} · {event.organizer.phone}
            </p>
          </div>
        </div>
      )}
    </aside>
  </div>
);

const LoadingRows = () => (
  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="h-80 animate-pulse rounded-3xl bg-slate-200/70" />
    ))}
  </div>
);

const ErrorBox = ({ message, retry }: { message: string; retry: () => void }) => (
  <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center">
    <p className="font-bold text-rose-700">{message}</p>
    <button onClick={retry} className="mt-3 rounded-xl bg-white border border-rose-200 px-4 py-2 text-xs font-bold text-rose-700 shadow-sm">
      Retry
    </button>
  </div>
);
