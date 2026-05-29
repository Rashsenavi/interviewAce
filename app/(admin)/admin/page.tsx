"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { 
  ArrowRight, Clock3, FileBadge2, ShieldCheck, Users, 
  Briefcase, Video, CheckCircle, Ban, DollarSign, Wallet, 
  TrendingUp, Sparkles, AlertCircle 
} from "lucide-react";

type PendingInterviewer = {
  id: number;
  nicUrl?: string | null;
  appointmentLetterUrl?: string | null;
};

interface AnalyticsData {
  users: { total: number; jobSeekers: number; interviewers: number; activeInterviewers: number };
  sessions: { total: number; completed: number; cancelled: number; disputed?: number; awaitingConfirmation?: number };
  financials: { totalRevenue: number; platformRevenue: number; interviewerPayouts: number };
  recentBookings: Array<{
    id: number;
    scheduledDate: string;
    sessionStatus: string;
    priceAmount: string;
    jobSeeker: { firstName: string; lastName: string };
    interviewer: { firstName: string; lastName: string };
  }>;
  topInterviewers: Array<{
    id: number;
    ratingAverage: string;
    totalInterviews: number;
    totalEarnings: string;
    firstName: string;
    lastName: string;
    jobTitle: string;
    company: string;
  }>;
}

export default function AdminDashboardPage() {
  const [pendingInterviewers, setPendingInterviewers] = useState<PendingInterviewer[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/verification/pending", { cache: "no-store" }).then(res => res.json()),
      fetch("/api/admin/analytics", { cache: "no-store" }).then(res => res.json())
    ])
      .then(([pendingData, analyticsData]) => {
        // Handle Pending Data
        if (pendingData.error) throw new Error(pendingData.error.message);
        let rows = [];
        if (Array.isArray(pendingData)) rows = pendingData;
        else if (Array.isArray(pendingData?.data)) rows = pendingData.data;
        else if (Array.isArray(pendingData?.interviewers)) rows = pendingData.interviewers;
        setPendingInterviewers(rows);

        // Handle Analytics Data
        if (analyticsData.error) throw new Error(analyticsData.error.message);
        setAnalytics(analyticsData.data);
        setError(null);
      })
      .catch((err: Error) => {
        setError(err.message || "Failed to load admin metrics");
      })
      .finally(() => setLoading(false));
  }, []);

  const docsCompleteCount = useMemo(
    () => pendingInterviewers.filter((i) => Boolean(i.nicUrl) && Boolean(i.appointmentLetterUrl)).length,
    [pendingInterviewers]
  );
  const docsMissingCount = Math.max(0, pendingInterviewers.length - docsCompleteCount);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-8">
      {/* OPERATIONS HUB SECTION */}
      <div className="space-y-6">
        <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-cyan-50 via-white to-orange-50 p-6 md:p-8">
          <div className="pointer-events-none absolute -right-16 -top-12 h-44 w-44 rounded-full bg-cyan-300/20 blur-3xl" />
          <div className="pointer-events-none absolute -left-12 -bottom-16 h-48 w-48 rounded-full bg-orange-300/20 blur-3xl" />
          <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Control Center</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Admin Operations Hub</h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-600">
                Monitor interviewer onboarding health and take action on pending verifications with confidence.
              </p>
            </div>
            <Link
              href="/admin/interviewers"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Review Verifications
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" /> {error}
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            title="Pending Reviews"
            value={String(pendingInterviewers.length)}
            subtitle="Awaiting admin decision"
            icon={<Clock3 className="h-4 w-4" />}
            tone="amber"
          />
          <KpiCard
            title="Docs Complete"
            value={String(docsCompleteCount)}
            subtitle="NIC + appointment letter"
            icon={<FileBadge2 className="h-4 w-4" />}
            tone="emerald"
          />
          <KpiCard
            title="Docs Missing"
            value={String(docsMissingCount)}
            subtitle="Needs follow-up"
            icon={<ShieldCheck className="h-4 w-4" />}
            tone="rose"
          />
          <KpiCard
            title="Action Board"
            value="Live"
            subtitle="Verification queue online"
            icon={<Users className="h-4 w-4" />}
            tone="cyan"
          />
        </section>
      </div>

      <hr className="border-slate-200" />

      {/* ANALYTICS SECTION */}
      {analytics && (
        <div className="space-y-6">
          <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-900 p-8 shadow-xl shadow-slate-900/5">
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
            <div className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl" />
            <div className="relative z-10">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-400" />
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">Platform Analytics</p>
              </div>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-white">Performance Metrics</h2>
              <p className="mt-2 max-w-2xl text-slate-400">
                Real-time insights into platform growth, session metrics, and financial performance.
              </p>
            </div>
          </section>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Total Users"
              value={analytics.users.total.toLocaleString()}
              subtitle={`${analytics.users.jobSeekers} Seekers / ${analytics.users.interviewers} Interviewers`}
              icon={Users}
              color="indigo"
            />
            <MetricCard
              title="Total Revenue"
              value={`LKR ${analytics.financials.totalRevenue.toLocaleString()}`}
              subtitle={`Platform profit: LKR ${analytics.financials.platformRevenue.toLocaleString()}`}
              icon={DollarSign}
              color="emerald"
            />
            <MetricCard
              title="Total Sessions"
              value={analytics.sessions.total.toLocaleString()}
              subtitle={`${analytics.sessions.completed} Completed`}
              icon={Video}
              color="cyan"
            />
            <MetricCard
              title="Active Interviewers"
              value={analytics.users.activeInterviewers.toLocaleString()}
              subtitle="Verified & active on platform"
              icon={Briefcase}
              color="orange"
            />
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">Session Health</h2>
              <p className="mb-6 text-sm text-slate-500">Breakdown of all booked sessions.</p>
              <div className="space-y-6">
                <ProgressRow 
                  label="Completed" 
                  value={analytics.sessions.completed} 
                  total={analytics.sessions.total} 
                  icon={CheckCircle} 
                  color="bg-emerald-500" 
                />
                <ProgressRow 
                  label="Cancelled/No Show" 
                  value={analytics.sessions.cancelled} 
                  total={analytics.sessions.total} 
                  icon={Ban} 
                  color="bg-rose-500" 
                />
                <ProgressRow 
                  label="Disputed (Needs Action)" 
                  value={analytics.sessions.disputed || 0} 
                  total={analytics.sessions.total} 
                  icon={AlertCircle} 
                  color="bg-red-500 animate-pulse font-semibold" 
                />
                <ProgressRow 
                  label="Awaiting Confirmation" 
                  value={analytics.sessions.awaitingConfirmation || 0} 
                  total={analytics.sessions.total} 
                  icon={Clock3} 
                  color="bg-amber-500" 
                />
                <ProgressRow 
                  label="Pending/Scheduled" 
                  value={analytics.sessions.total - analytics.sessions.completed - analytics.sessions.cancelled - (analytics.sessions.disputed || 0) - (analytics.sessions.awaitingConfirmation || 0)} 
                  total={analytics.sessions.total} 
                  icon={TrendingUp} 
                  color="bg-blue-500" 
                />
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">Revenue Distribution</h2>
              <p className="mb-6 text-sm text-slate-500">How total revenue is split.</p>
              <div className="space-y-6">
                 <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                     <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
                       <Wallet className="h-5 w-5" />
                     </div>
                     <div>
                       <p className="font-semibold text-slate-900">Interviewer Payouts</p>
                       <p className="text-xs text-slate-500">Money owed/paid to interviewers</p>
                     </div>
                   </div>
                   <p className="font-bold text-slate-900">LKR {analytics.financials.interviewerPayouts.toLocaleString()}</p>
                 </div>
                 <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                     <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                       <DollarSign className="h-5 w-5" />
                     </div>
                     <div>
                       <p className="font-semibold text-slate-900">Platform Commission</p>
                       <p className="text-xs text-slate-500">Gross profit for InterviewAce</p>
                     </div>
                   </div>
                   <p className="font-bold text-emerald-600">LKR {analytics.financials.platformRevenue.toLocaleString()}</p>
                 </div>
              </div>
            </section>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-slate-100 p-6 bg-slate-50/50">
                <h2 className="text-lg font-bold text-slate-900">Recent Bookings</h2>
                <p className="text-sm text-slate-500">Latest sessions created on the platform.</p>
              </div>
              <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto">
                {analytics.recentBookings.length === 0 ? (
                  <p className="p-6 text-center text-sm text-slate-500">No bookings yet.</p>
                ) : (
                  analytics.recentBookings.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-4 px-6 transition hover:bg-slate-50">
                      <div>
                        <p className="font-medium text-slate-900">
                          {session.jobSeeker.firstName} {session.jobSeeker.lastName}
                        </p>
                        <p className="text-xs text-slate-500">
                          with {session.interviewer.firstName} {session.interviewer.lastName}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${
                          session.sessionStatus === "disputed"
                            ? "bg-red-100 text-red-700 border border-red-200"
                            : "bg-slate-100 text-slate-700"
                        }`}>
                          {session.sessionStatus === "disputed" && <AlertCircle className="w-3 h-3 text-red-600" />}
                          {session.sessionStatus.replace("_", " ")}
                        </span>
                        <p className="mt-1 text-xs text-slate-500">
                          {new Date(session.scheduledDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-slate-100 p-6 bg-slate-50/50">
                <h2 className="text-lg font-bold text-slate-900">Top Interviewers</h2>
                <p className="text-sm text-slate-500">Highest rated and most active interviewers.</p>
              </div>
              <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto">
                {analytics.topInterviewers.length === 0 ? (
                  <p className="p-6 text-center text-sm text-slate-500">No interviewers yet.</p>
                ) : (
                  analytics.topInterviewers.map((int) => (
                    <div key={int.id} className="flex items-center justify-between p-4 px-6 transition hover:bg-slate-50">
                      <div>
                        <p className="font-medium text-slate-900">
                          {int.firstName} {int.lastName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {int.jobTitle} at {int.company}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-amber-500">★ {Number(int.ratingAverage).toFixed(1)}</p>
                        <p className="text-xs text-slate-500">{int.totalInterviews} sessions</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}

function KpiCard({ title, value, subtitle, icon, tone }: any) {
  const toneClasses: any = {
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
    rose: "border-rose-200 bg-rose-50 text-rose-700",
    cyan: "border-cyan-200 bg-cyan-50 text-cyan-700",
  };
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{title}</p>
        <span className={`rounded-full border px-2 py-1 ${toneClasses[tone]}`}>{icon}</span>
      </div>
      <p className="mt-3 text-3xl font-black tracking-tight text-slate-900">{value}</p>
      <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
    </article>
  );
}

function MetricCard({ title, value, subtitle, icon: Icon, color }: any) {
  const colorMap: any = {
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-200",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-200",
    cyan: "bg-cyan-50 text-cyan-600 border-cyan-200",
    orange: "bg-orange-50 text-orange-600 border-orange-200",
  };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300 hover:shadow-md">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-500">{title}</p>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${colorMap[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-4 text-3xl font-black tracking-tight text-slate-900">{value}</p>
      <p className="mt-1 text-xs font-medium text-slate-500">{subtitle}</p>
    </div>
  );
}

function ProgressRow({ label, value, total, icon: Icon, color }: any) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 font-medium text-slate-700">
          <Icon className="h-4 w-4 text-slate-400" />
          {label}
        </div>
        <div className="font-semibold text-slate-900">
          {value} <span className="text-slate-400 font-normal">({percentage}%)</span>
        </div>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div 
          className={`h-full rounded-full ${color} transition-all duration-1000 ease-out`} 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
