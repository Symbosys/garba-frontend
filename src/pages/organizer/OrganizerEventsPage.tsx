import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CalendarDays,
  PlusCircle,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Image as ImageIcon,
  MapPin,
  Clock,
  Sparkles,
  Building,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { organizerApi } from '../../api/organizer';
import type { OrganizerEvent } from '../../api/types';
import { CreateEventModal } from '../../components/organizer/CreateEventModal';
import { EditEventModal } from '../../components/organizer/EditEventModal';
import { EventDetailsModal } from '../../components/organizer/EventDetailsModal';
import { AddImagesModal } from '../../components/organizer/AddImagesModal';

export const OrganizerEventsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedDetailsEvent, setSelectedDetailsEvent] = useState<OrganizerEvent | null>(null);
  const [selectedEditEvent, setSelectedEditEvent] = useState<OrganizerEvent | null>(null);
  const [selectedImagesEvent, setSelectedImagesEvent] = useState<OrganizerEvent | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<OrganizerEvent | null>(null);

  // TanStack Query for fetching organizer events
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['organizer', 'events', page],
    queryFn: () => organizerApi.getEvents(page, 20),
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (eventId: string) => organizerApi.deleteEvent(eventId),
    onSuccess: () => {
      toast.success('Event cancelled/deleted successfully');
      setDeletingEvent(null);
      queryClient.invalidateQueries({ queryKey: ['organizer', 'events'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to delete event');
    },
  });

  const allItems = data?.items || [];

  const filteredItems = allItems.filter((e) => {
    const matchesSearch =
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.venueName.toLowerCase().includes(search.toLowerCase()) ||
      e.city.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getFeeRange = (event: OrganizerEvent) => {
    if (!event.slots || event.slots.length === 0) return 'No slots';
    const fees = event.slots.map((s) => s.entryFee);
    const min = Math.min(...fees);
    const max = Math.max(...fees);
    if (min === max) {
      return min === 0 ? 'FREE' : `₹${min}`;
    }
    return `₹${min} - ₹${max}`;
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-100 text-pink-800 text-xs font-bold uppercase tracking-wider mb-1">
            <CalendarDays className="w-3.5 h-3.5 text-pink-600" />
            Organizer Console
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
            My Festival Events
          </h1>
          <p className="text-sm text-slate-500">
            Create, manage daily slots, update ticket fees, and oversee your live festival listings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="p-2.5 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition shadow-xs"
            title="Refresh events"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin text-pink-600' : ''}`} />
          </button>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 via-rose-500 to-pink-500 hover:from-amber-300 hover:to-pink-400 text-purple-950 font-black text-xs sm:text-sm shadow-lg shadow-pink-950/20 transition transform active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            Create New Event
          </button>
        </div>
      </div>

      {/* Controls Bar: Search & Status Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-88">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by event title, venue, or city…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'PUBLISHED', 'DRAFT', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-purple-900 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Content States */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="rounded-3xl bg-white border border-slate-200/80 p-5 space-y-4 animate-pulse">
              <div className="aspect-video bg-slate-100 rounded-2xl" />
              <div className="h-5 bg-slate-100 rounded-lg w-3/4" />
              <div className="h-4 bg-slate-100 rounded-lg w-1/2" />
              <div className="h-10 bg-slate-100 rounded-xl" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="p-8 rounded-3xl bg-rose-50 border border-rose-200 text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-rose-600 mx-auto" />
          <p className="font-bold text-rose-900 text-sm">Failed to load events</p>
          <p className="text-xs text-rose-700">{(error as any)?.message || 'Something went wrong while fetching events.'}</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition"
          >
            Retry
          </button>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 border border-slate-200/80 shadow-xs text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-pink-50 text-pink-600 grid place-items-center mx-auto">
            <CalendarDays className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 font-heading">
              {search || statusFilter !== 'ALL' ? 'No events matching your filters' : 'No festival events created yet'}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              {search || statusFilter !== 'ALL'
                ? 'Try clearing your search query or selecting a different status filter.'
                : 'Click the button below to add your first Garba/Dandiya festival with multi-day passes and timings.'}
            </p>
          </div>
          <button
            onClick={() => {
              setSearch('');
              setStatusFilter('ALL');
              if (allItems.length === 0) setIsCreateOpen(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-purple-900 hover:bg-purple-950 text-white font-bold text-xs transition"
          >
            {allItems.length === 0 ? 'Create First Event' : 'Clear Filters'}
          </button>
        </div>
      ) : (
        /* Event Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((event) => {
            const coverUrl = event.images?.[0]?.url || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=800';
            const slotsCount = event.slots?.length || 0;
            const feeString = getFeeRange(event);

            return (
              <div
                key={event.id}
                className="rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition flex flex-col overflow-hidden group"
              >
                {/* Event Image Banner */}
                <div className="relative aspect-video bg-slate-100 overflow-hidden">
                  <img
                    src={coverUrl}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/20" />

                  {/* Status Badge */}
                  <div className="absolute top-3 left-3">
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full backdrop-blur-md shadow-xs ${
                        event.status === 'PUBLISHED'
                          ? 'bg-emerald-500/90 text-white'
                          : event.status === 'DRAFT'
                          ? 'bg-amber-500/90 text-white'
                          : 'bg-rose-500/90 text-white'
                      }`}
                    >
                      {event.status}
                    </span>
                  </div>

                  {/* Gallery count */}
                  <button
                    onClick={() => setSelectedImagesEvent(event)}
                    className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md text-white text-[10px] font-bold transition"
                    title="Manage Photos"
                  >
                    <ImageIcon className="w-3 h-3" />
                    {event.images?.length || 0} Photos
                  </button>

                  {/* Fee & Slot overlay */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                    <span className="font-bold flex items-center gap-1 drop-shadow-xs">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      {slotsCount} {slotsCount === 1 ? 'Slot' : 'Slots'}
                    </span>
                    <span className="font-black px-2 py-0.5 rounded-lg bg-pink-600/90 backdrop-blur-xs">
                      {feeString}
                    </span>
                  </div>
                </div>

                {/* Event Body Info */}
                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <h3 className="font-bold text-base text-slate-900 font-heading line-clamp-1 group-hover:text-pink-600 transition">
                      {event.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 truncate">
                      <Building className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                      <span className="truncate font-semibold">{event.venueName}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 truncate">
                      <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span className="truncate">{event.city}, {event.state}</span>
                    </div>
                  </div>

                  {/* Actions Grid */}
                  <div className="pt-4 border-t border-slate-100 grid grid-cols-4 gap-1.5 text-xs">
                    <button
                      onClick={() => setSelectedDetailsEvent(event)}
                      className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 hover:bg-purple-50 text-purple-900 font-bold transition"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4 mb-0.5 text-purple-600" />
                      <span className="text-[10px]">View</span>
                    </button>

                    <button
                      onClick={() => setSelectedEditEvent(event)}
                      className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 hover:bg-pink-50 text-pink-900 font-bold transition"
                      title="Edit Event & Slots"
                    >
                      <Edit className="w-4 h-4 mb-0.5 text-pink-600" />
                      <span className="text-[10px]">Edit</span>
                    </button>

                    <button
                      onClick={() => setSelectedImagesEvent(event)}
                      className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 hover:bg-amber-50 text-amber-900 font-bold transition"
                      title="Gallery Photos"
                    >
                      <ImageIcon className="w-4 h-4 mb-0.5 text-amber-600" />
                      <span className="text-[10px]">Photos</span>
                    </button>

                    <button
                      onClick={() => setDeletingEvent(event)}
                      className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 hover:bg-rose-50 text-rose-700 font-bold transition"
                      title="Delete Event"
                    >
                      <Trash2 className="w-4 h-4 mb-0.5 text-rose-600" />
                      <span className="text-[10px]">Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Footer */}
      {data?.pagination && data.pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white font-bold text-xs disabled:opacity-40 hover:bg-slate-50"
          >
            Previous
          </button>
          <span className="text-xs font-semibold text-slate-500">
            Page {page} of {data.pagination.pages}
          </span>
          <button
            disabled={page >= data.pagination.pages}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white font-bold text-xs disabled:opacity-40 hover:bg-slate-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Create Modal */}
      <CreateEventModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['organizer', 'events'] })}
      />

      {/* Edit Modal */}
      <EditEventModal
        event={selectedEditEvent}
        onClose={() => setSelectedEditEvent(null)}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['organizer', 'events'] })}
      />

      {/* Details Modal */}
      <EventDetailsModal
        event={selectedDetailsEvent}
        onClose={() => setSelectedDetailsEvent(null)}
        onEdit={(e) => setSelectedEditEvent(e)}
      />

      {/* Add Images Modal */}
      <AddImagesModal
        event={selectedImagesEvent}
        onClose={() => setSelectedImagesEvent(null)}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['organizer', 'events'] })}
      />

      {/* Delete Confirmation Modal */}
      {deletingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 grid place-items-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 font-heading">Cancel / Delete Event?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to cancel and remove <strong>"{deletingEvent.title}"</strong>? This will soft-delete the event and cancel all associated passes.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingEvent(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50"
              >
                No, Keep Event
              </button>
              <button
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(deletingEvent.id)}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Deleting…' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default OrganizerEventsPage;
