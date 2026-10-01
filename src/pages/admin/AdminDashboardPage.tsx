import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, CalendarDays, CircleDollarSign, Clock3, RefreshCw, ShieldCheck, Sparkles, UserRoundCheck, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/admin';

const formatMoney = (paise: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(paise / 100);

export const AdminDashboardPage: React.FC = () => {
  const query = useQuery({ queryKey: ['super-admin', 'dashboard'], queryFn: adminApi.dashboard });
  if (query.isPending) return <DashboardSkeleton />;
  if (query.isError) return <ErrorState retry={() => query.refetch()} message={query.error.message} />;
  const data = query.data;

  const cards = [
    { label: 'Verified Payments', value: data.payments.verified, hint: formatMoney(data.payments.verifiedRevenuePaise), icon: CircleDollarSign, tone: 'emerald' },
    { label: 'Unverified Payments', value: data.payments.unverified, hint: 'Waiting for review', icon: Clock3, tone: 'amber' },
    { label: 'Verified Users', value: data.users.verified, hint: `${data.users.total} total accounts`, icon: UserRoundCheck, tone: 'rose' },
    { label: 'Unverified Users', value: data.users.unverified, hint: `${data.users.rejected} rejected`, icon: UsersRound, tone: 'violet' },
  ] as const;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Banner */}
      <section className="relative overflow-hidden rounded-3xl border border-rose-100 bg-gradient-to-br from-rose-600 via-pink-600 to-amber-600 p-7 shadow-xl shadow-rose-950/10 md:p-10 text-white">
        <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-amber-300/30 blur-3xl" />
        <div className="relative max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-amber-200" />
            Live Verification Console
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">
            Platform Overview &amp; Verification
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-rose-50">
            Review partner and organizer registrations, verify payment screenshots, approve accounts, and oversee all platform events.
          </p>
        </div>
      </section>

      {/* Metric Cards */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, hint, icon: Icon, tone }) => (
          <MetricCard key={label} label={label} value={value} hint={hint} icon={Icon} tone={tone} />
        ))}
      </section>

      {/* Split Grid */}
      <section className="grid gap-6 lg:grid-cols-[1.3fr_.7fr]">
        {/* Needs Attention */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900">Needs Your Attention</h2>
              <p className="text-xs text-slate-500">Oldest pending registrations first</p>
            </div>
            <Link to="/admin/users" className="flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700">
              Review All <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {data.recentPending.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/50 p-8 text-center text-sm font-semibold text-emerald-800">
                ✨ All registrations and payments are up to date!
              </div>
            ) : (
              data.recentPending.map((user) => (
                <Link
                  key={user.id}
                  to={`/admin/users?id=${user.id}`}
                  className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-4 hover:border-rose-300 hover:bg-rose-50/40 transition"
                >
                  <img src={user.photos[0]?.url || '/favicon.svg'} alt="" className="h-11 w-11 rounded-2xl object-cover bg-slate-200" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-900">{user.name}</p>
                    <p className="truncate text-xs text-slate-500">
                      {user.role === 'PARTNER' ? 'Partner' : 'Event Organizer'} · {user.city}, {user.state}
                    </p>
                  </div>
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-[10px] font-bold text-amber-800 border border-amber-200">
                    PENDING
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Right Column Stats */}
        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-2xl bg-violet-100 p-3 text-violet-700">
                <UsersRound className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Account Mix</h3>
                <p className="text-xs text-slate-500">Registered profiles</p>
              </div>
            </div>
            <Progress label="Partners" value={data.users.partners} total={data.users.total} color="bg-rose-500" />
            <Progress label="Event Organizers" value={data.users.organizers} total={data.users.total} color="bg-violet-600" />
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl bg-amber-100 p-2.5 text-amber-700">
                <CalendarDays className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-900">Platform Events</h3>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <MiniStat label="Published" value={data.events.published} />
              <MiniStat label="Draft" value={data.events.draft} />
              <MiniStat label="Cancelled" value={data.events.cancelled} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const MetricCard = ({
  label,
  value,
  hint,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  hint: string;
  icon: React.ElementType;
  tone: 'emerald' | 'amber' | 'rose' | 'violet';
}) => {
  const styles = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    rose: 'bg-rose-50 text-rose-700 border-rose-100',
    violet: 'bg-violet-50 text-violet-700 border-violet-100',
  }[tone];

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-black text-slate-900">{value.toLocaleString()}</p>
        </div>
        <div className={`rounded-2xl p-3 border ${styles}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-4 text-[11px] font-semibold text-slate-500">{hint}</p>
    </div>
  );
};

const Progress = ({ label, value, total, color }: { label: string; value: number; total: number; color: string }) => (
  <div className="mb-4">
    <div className="mb-1.5 flex justify-between text-xs">
      <span className="text-slate-600 font-medium">{label}</span>
      <strong className="text-slate-900">{value}</strong>
    </div>
    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${total ? (value / total) * 100 : 0}%` }} />
    </div>
  </div>
);

const MiniStat = ({ label, value }: { label: string; value: number }) => (
  <div className="rounded-2xl bg-slate-50 border border-slate-100 p-3">
    <p className="text-xl font-black text-slate-900">{value}</p>
    <p className="text-[10px] font-bold text-slate-500">{label}</p>
  </div>
);

const DashboardSkeleton = () => (
  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="h-36 animate-pulse rounded-3xl bg-slate-200/70" />
    ))}
  </div>
);

const ErrorState = ({ retry, message }: { retry: () => void; message: string }) => (
  <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center text-slate-900">
    <ShieldCheck className="mx-auto mb-3 h-8 w-8 text-rose-600" />
    <p className="font-bold text-slate-900">Dashboard could not load</p>
    <p className="mt-1 text-xs text-slate-600">{message}</p>
    <button
      onClick={retry}
      className="mx-auto mt-4 flex items-center gap-2 rounded-xl bg-white border border-rose-200 px-4 py-2 text-xs font-bold text-rose-700 shadow-sm"
    >
      <RefreshCw className="h-3.5 w-3.5" />
      Try Again
    </button>
  </div>
);
