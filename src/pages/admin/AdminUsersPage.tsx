import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import {
  BadgeCheck,
  Building2,
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  ImageOff,
  LoaderCircle,
  Search,
  UserRound,
  X,
  XCircle,
} from 'lucide-react';
import { adminApi } from '../../api/admin';
import { useApp } from '../../context/AppContext';
import type { AccountStatus, AdminUser } from '../../api/types';

const statuses: Array<{ value: '' | AccountStatus; label: string }> = [
  { value: '', label: 'All statuses' },
  { value: 'PENDING', label: 'Unverified / Pending' },
  { value: 'APPROVED', label: 'Verified / Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'SUSPENDED', label: 'Suspended' },
];

export const AdminUsersPage: React.FC = () => {
  const [params, setParams] = useSearchParams();
  const { showToast } = useApp();
  const queryClient = useQueryClient();
  const role = params.get('role') === 'ORGANIZER' ? 'ORGANIZER' : 'PARTNER';
  const status = (params.get('status') || '') as '' | AccountStatus;
  const page = Math.max(1, Number(params.get('page')) || 1);
  const selectedId = params.get('id');
  const [searchInput, setSearchInput] = useState(params.get('search') || '');
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    const timeout = setTimeout(() => {
      const next = new URLSearchParams(params);
      if (searchInput) next.set('search', searchInput);
      else next.delete('search');
      next.set('page', '1');
      setParams(next, { replace: true });
    }, 350);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const listQuery = useQuery({
    queryKey: ['super-admin', 'users', role, status, params.get('search') || '', page],
    queryFn: () =>
      adminApi.users({
        role,
        status: status || undefined,
        search: params.get('search') || undefined,
        page,
        limit: 12,
      }),
  });

  const detailQuery = useQuery({
    queryKey: ['super-admin', 'user', selectedId],
    queryFn: () => adminApi.user(selectedId!),
    enabled: Boolean(selectedId),
  });

  const review = useMutation({
    mutationFn: ({ id, decision, reason }: { id: string; decision: 'APPROVE' | 'REJECT'; reason?: string }) =>
      adminApi.reviewUser(id, decision === 'APPROVE' ? { decision } : { decision, reason: reason! }),
    onSuccess: async (_, variables) => {
      setRejectionReason('');
      showToast(
        variables.decision === 'APPROVE' ? 'User Approved Successfully! 🎉' : 'User Registration Rejected',
        variables.decision === 'APPROVE' ? 'Account is now verified and active.' : 'Rejection reason recorded.',
        variables.decision === 'APPROVE' ? 'success' : 'info'
      );
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['super-admin', 'dashboard'] }),
        queryClient.invalidateQueries({ queryKey: ['super-admin', 'users'] }),
        queryClient.invalidateQueries({ queryKey: ['super-admin', 'user', selectedId] }),
      ]);
    },
    onError: (err) => {
      showToast('Review Failed', err.message, 'error');
    },
  });

  const updateParams = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(params);
    Object.entries(updates).forEach(([key, value]) => (value ? next.set(key, value) : next.delete(key)));
    setParams(next);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 text-slate-900">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-rose-600">Identity &amp; Payment Review</p>
        <h1 className="mt-1 text-3xl font-black text-slate-900">Users &amp; Organizers</h1>
        <p className="mt-1 text-sm text-slate-500">
          Review submitted profile photos and payment proofs before activating accounts.
        </p>
      </div>

      {/* Tabs */}
      <div className="inline-flex rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xs">
        <Tab active={role === 'PARTNER'} onClick={() => updateParams({ role: 'PARTNER', page: '1', id: null })} icon={UserRound}>
          Normal Users (Partners)
        </Tab>
        <Tab active={role === 'ORGANIZER'} onClick={() => updateParams({ role: 'ORGANIZER', page: '1', id: null })} icon={Building2}>
          Event Organizers
        </Tab>
      </div>

      {/* Filter Bar */}
      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_240px_auto]">
        <label className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search name, email, phone or city…"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-rose-500 focus:bg-white"
          />
        </label>
        <select
          value={status}
          onChange={(event) => updateParams({ status: event.target.value || null, page: '1' })}
          className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-rose-500 cursor-pointer"
        >
          {statuses.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
        <div className="grid place-items-center rounded-xl bg-slate-100 px-4 text-xs font-bold text-slate-600">
          {listQuery.data?.pagination.total ?? 0} Records
        </div>
      </div>

      {/* Table & Content */}
      {listQuery.isPending ? (
        <TableSkeleton />
      ) : listQuery.isError ? (
        <InlineError message={listQuery.error.message} retry={() => listQuery.refetch()} />
      ) : listQuery.data.items.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
                <tr>
                  <th className="p-4">Profile</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {listQuery.data.items.map((user) => (
                  <UserRow key={user.id} user={user} onOpen={() => updateParams({ id: user.id })} />
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            page={listQuery.data.pagination.page}
            pages={listQuery.data.pagination.pages}
            onPage={(nextPage) => updateParams({ page: String(nextPage) })}
          />
        </div>
      )}

      {/* Drawer */}
      {selectedId && (
        <UserDrawer
          user={detailQuery.data}
          loading={detailQuery.isPending}
          error={detailQuery.isError ? detailQuery.error.message : undefined}
          onClose={() => updateParams({ id: null })}
          rejectionReason={rejectionReason}
          setRejectionReason={setRejectionReason}
          onApprove={() => detailQuery.data && review.mutate({ id: detailQuery.data.id, decision: 'APPROVE' })}
          onReject={() =>
            detailQuery.data &&
            rejectionReason.trim().length >= 3 &&
            review.mutate({ id: detailQuery.data.id, decision: 'REJECT', reason: rejectionReason.trim() })
          }
          reviewing={review.isPending}
          reviewError={review.error?.message}
        />
      )}
    </div>
  );
};

const Tab = ({
  active,
  onClick,
  icon: Icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  children: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
      active
        ? 'bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 text-white shadow-sm'
        : 'text-slate-600 hover:text-rose-600 hover:bg-slate-50'
    }`}
  >
    <Icon className="h-4 w-4" />
    {children}
  </button>
);

const UserRow = ({ user, onOpen }: { user: AdminUser; onOpen: () => void }) => (
  <tr className="hover:bg-rose-50/20 transition">
    <td className="p-4">
      <div className="flex items-center gap-3">
        <img src={user.photos[0]?.url || '/favicon.svg'} alt="" className="h-11 w-11 rounded-2xl bg-slate-100 object-cover border border-slate-200" />
        <div>
          <p className="font-bold text-slate-900">{user.name}</p>
          <p className="text-xs text-slate-500">
            {user.age ? `${user.age} yrs · ` : ''}Joined {new Date(user.createdAt).toLocaleDateString('en-IN')}
          </p>
        </div>
      </div>
    </td>
    <td className="p-4">
      <p className="text-slate-800 font-medium">{user.email}</p>
      <p className="text-xs text-slate-500">{user.phone}</p>
    </td>
    <td className="p-4 text-slate-600">
      {user.city}, {user.state}
    </td>
    <td className="p-4">
      <StatusBadge status={user.registrationPayment?.status || 'PENDING'} />
    </td>
    <td className="p-4">
      <StatusBadge status={user.status} />
    </td>
    <td className="p-4 text-right">
      <button
        onClick={onOpen}
        className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition"
      >
        <Eye className="h-3.5 w-3.5" />
        Review
      </button>
    </td>
  </tr>
);

const StatusBadge = ({ status }: { status: string }) => {
  const style =
    status === 'APPROVED'
      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
      : status === 'PENDING'
      ? 'bg-amber-50 text-amber-700 border border-amber-200'
      : status === 'REJECTED'
      ? 'bg-rose-50 text-rose-700 border border-rose-200'
      : 'bg-slate-100 text-slate-700 border border-slate-200';
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${style}`}>{status}</span>;
};

const UserDrawer = ({
  user,
  loading,
  error,
  onClose,
  rejectionReason,
  setRejectionReason,
  onApprove,
  onReject,
  reviewing,
  reviewError,
}: {
  user?: AdminUser;
  loading: boolean;
  error?: string;
  onClose: () => void;
  rejectionReason: string;
  setRejectionReason: (value: string) => void;
  onApprove: () => void;
  onReject: () => void;
  reviewing: boolean;
  reviewError?: string;
}) => (
  <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
    <aside className="h-full w-full max-w-xl overflow-y-auto border-l border-slate-200 bg-white p-6 sm:p-8 shadow-2xl text-slate-900">
      <button onClick={onClose} className="ml-auto grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200">
        <X className="h-4 w-4" />
      </button>

      {loading ? (
        <div className="grid h-96 place-items-center">
          <LoaderCircle className="h-8 w-8 animate-spin text-rose-600" />
        </div>
      ) : error || !user ? (
        <InlineError message={error || 'User not found'} retry={() => location.reload()} />
      ) : (
        <div className="space-y-6 mt-4">
          <div className="flex items-center gap-4">
            <img src={user.photos[0]?.url || '/favicon.svg'} alt="" className="h-20 w-20 rounded-2xl object-cover border border-slate-200" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-rose-600">
                {user.role === 'PARTNER' ? 'Normal User' : 'Event Organizer'}
              </p>
              <h2 className="text-2xl font-black text-slate-900">{user.name}</h2>
              <div className="mt-1">
                <StatusBadge status={user.status} />
              </div>
            </div>
          </div>

          <section className="grid grid-cols-2 gap-3">
            {[
              ['Age', user.age ? `${user.age} years` : '—'],
              ['Gender', user.gender],
              ['Email', user.email],
              ['Phone', user.phone],
              ['City', `${user.city}, ${user.state}`],
              ['Address', user.addressLine || '—'],
              ['Fee', user.registrationPayment ? `₹${(user.registrationPayment.amountPaise / 100).toLocaleString('en-IN')}` : '—'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-slate-50 border border-slate-100 p-3.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
                <p className="mt-1 break-words text-xs font-semibold text-slate-800">{value}</p>
              </div>
            ))}
          </section>

          <section>
            <p className="mb-2.5 text-xs font-bold uppercase tracking-wider text-slate-600">
              Profile Photos ({user.photos.length})
            </p>
            <div className="grid grid-cols-3 gap-2.5">
              {user.photos.map((photo) => (
                <img key={photo.id} src={photo.url} alt="Profile" className="aspect-square rounded-2xl object-cover border border-slate-200" />
              ))}
            </div>
          </section>

          <section>
            <p className="mb-2.5 text-xs font-bold uppercase tracking-wider text-slate-600">Payment Screenshot</p>
            {user.registrationPayment?.proofUrl ? (
              <a href={user.registrationPayment.proofUrl} target="_blank" rel="noreferrer">
                <img
                  src={user.registrationPayment.proofUrl}
                  alt="Payment proof"
                  className="max-h-72 w-full rounded-2xl border border-slate-200 bg-slate-50 object-contain"
                />
              </a>
            ) : (
              <div className="grid h-36 place-items-center rounded-2xl border border-dashed border-slate-200 text-slate-400">
                <ImageOff className="h-6 w-6" />
              </div>
            )}
          </section>

          {user.status === 'PENDING' && (
            <section className="rounded-3xl border border-rose-100 bg-rose-50/40 p-4">
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Rejection reason (required when rejecting)…"
                className="min-h-20 w-full resize-none rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900 outline-none focus:border-rose-500"
              />
              <div className="mt-3 grid grid-cols-2 gap-3">
                <button
                  disabled={reviewing || rejectionReason.trim().length < 3}
                  onClick={onReject}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-100/70 py-2.5 text-xs font-bold text-rose-700 disabled:opacity-40"
                >
                  <XCircle className="h-4 w-4" />
                  Reject
                </button>
                <button
                  disabled={reviewing}
                  onClick={onApprove}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-2.5 text-xs font-bold text-white shadow-sm disabled:opacity-40"
                >
                  {reviewing ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Approve Account
                </button>
              </div>
              {reviewError && <p className="mt-2 text-xs text-rose-600">{reviewError}</p>}
            </section>
          )}
        </div>
      )}
    </aside>
  </div>
);

const Pagination = ({ page, pages, onPage }: { page: number; pages: number; onPage: (page: number) => void }) => (
  <div className="flex items-center justify-between border-t border-slate-100 p-4">
    <p className="text-xs text-slate-500">
      Page {page} of {Math.max(1, pages)}
    </p>
    <div className="flex gap-2">
      <button
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
        className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-30 cursor-pointer"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        disabled={page >= pages}
        onClick={() => onPage(page + 1)}
        className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-30 cursor-pointer"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  </div>
);

const TableSkeleton = () => (
  <div className="space-y-2 rounded-3xl bg-white p-4 border border-slate-200">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="h-16 animate-pulse rounded-2xl bg-slate-100" />
    ))}
  </div>
);

const EmptyState = () => (
  <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-14 text-center">
    <BadgeCheck className="mx-auto mb-3 h-10 w-10 text-emerald-600" />
    <p className="font-bold text-slate-900">No registrations found</p>
    <p className="mt-1 text-xs text-slate-500">Try adjusting your filters or search query.</p>
  </div>
);

const InlineError = ({ message, retry }: { message: string; retry: () => void }) => (
  <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center text-slate-900">
    <p className="font-bold text-rose-700">{message}</p>
    <button onClick={retry} className="mt-3 rounded-xl bg-white border border-rose-200 px-4 py-2 text-xs font-bold text-rose-700 shadow-sm">
      Retry
    </button>
  </div>
);
