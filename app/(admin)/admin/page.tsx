"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { 
  ArrowRight, Clock3, FileBadge2, ShieldCheck, Users, 
  Briefcase, Video, CheckCircle, Ban, DollarSign, Wallet, 
  TrendingUp, Sparkles, AlertCircle, Mail, Calendar, Copy, Check, ExternalLink, X, PlayCircle
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
    meetingLink?: string | null;
    sessionType?: string;
    duration?: number;
    notes?: string | null;
    recordingUrl?: string | null;
    cancellationReason?: string | null;
    disputeReason?: string | null;
    jobSeeker: { firstName: string; lastName: string; email: string };
    interviewer: { firstName: string; lastName: string; email: string };
    sampleVideo?: {
      id: number;
      videoUrl: string;
      adminApprovalStatus: string;
    } | null;
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
  const [selectedSession, setSelectedSession] = useState<any | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

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
                    <div 
                      key={session.id} 
                      onClick={() => setSelectedSession(session)}
                      className="flex items-center justify-between p-4 px-6 transition hover:bg-slate-50 cursor-pointer group"
                    >
                      <div>
                        <p className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
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
                            : session.sessionStatus === "completed"
                            ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                            : session.sessionStatus === "scheduled"
                            ? "bg-indigo-100 text-indigo-700 border border-indigo-200"
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

      {/* Session Details Modal */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl animate-in slide-in-from-bottom-8 duration-300">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Session Details</h3>
                <p className="text-xs text-slate-500">Session ID: #{selectedSession.id}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                  selectedSession.sessionStatus === "completed"
                    ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                    : selectedSession.sessionStatus === "cancelled"
                    ? "bg-rose-100 text-rose-700 border border-rose-200"
                    : selectedSession.sessionStatus === "disputed"
                    ? "bg-red-100 text-red-700 border border-red-200"
                    : selectedSession.sessionStatus === "scheduled"
                    ? "bg-indigo-100 text-indigo-700 border border-indigo-200"
                    : "bg-amber-100 text-amber-700 border border-amber-200"
                }`}>
                  {selectedSession.sessionStatus === "disputed" && <AlertCircle className="w-3 h-3 text-red-600" />}
                  {selectedSession.sessionStatus.replace("_", " ")}
                </span>
                <button
                  onClick={() => setSelectedSession(null)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="max-h-[60vh] overflow-y-auto p-6 space-y-6">
              {/* Meeting Link / Recording Section */}
              {selectedSession.sessionStatus === "completed" ? (
                /* Completed (Past) Session Recording Display */
                <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 space-y-4">
                  <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Video className="h-4 w-4 text-slate-600" /> Session Recording & Moderation
                  </h4>
                  {selectedSession.sampleVideo && selectedSession.sampleVideo.id ? (
                    selectedSession.sampleVideo.adminApprovalStatus === "approved" ? (
                      <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4">
                        <p className="text-sm font-semibold text-emerald-800 mb-1 flex items-center gap-1.5">
                          <CheckCircle className="h-4 w-4 text-emerald-600" /> Recording Approved
                        </p>
                        <p className="text-xs text-emerald-600 mb-3">
                          This session's recording is verified and live for users to watch.
                        </p>
                        <div className="flex gap-2">
                          <a
                            href={selectedSession.sampleVideo.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 shadow-sm"
                          >
                            <PlayCircle className="h-4 w-4" />
                            Watch Video
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-amber-100 bg-amber-50/40 p-4">
                        <p className="text-sm font-semibold text-amber-800 mb-1 flex items-center gap-1.5">
                          <AlertCircle className="h-4 w-4 text-amber-600" /> Pending Moderation
                        </p>
                        <p className="text-xs text-amber-600 mb-3">
                          A recording has been uploaded and is waiting for administrator review.
                        </p>
                        <Link
                          href="/admin/videos"
                          className="flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700 shadow-sm w-full"
                        >
                          <ArrowRight className="h-4 w-4" />
                          Moderate Video Upload
                        </Link>
                      </div>
                    )
                  ) : (
                    <div className="p-3 text-slate-500 italic text-xs bg-white border border-slate-100 rounded-xl">
                      No interview recording/sample video has been uploaded for this session yet.
                    </div>
                  )}

                  {/* Show raw meeting link info subtly just in case */}
                  {selectedSession.meetingLink && (
                    <div className="pt-2 border-t border-slate-100">
                      <p className="text-xs text-slate-400 font-semibold mb-1 uppercase tracking-wider">Past Meeting Link</p>
                      <div className="flex items-center justify-between gap-2 bg-white border border-slate-100 rounded-xl p-2.5 text-xs text-slate-600 font-mono">
                        <span className="truncate">{selectedSession.meetingLink}</span>
                        <button
                          onClick={() => handleCopyLink(selectedSession.meetingLink)}
                          className="p-1 text-slate-400 hover:text-slate-700 transition flex-shrink-0"
                          title="Copy meeting link"
                        >
                          {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Live/Future Meeting Link Section */
                <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4">
                  <h4 className="text-sm font-bold text-indigo-900 mb-2 flex items-center gap-2">
                    <Video className="h-4 w-4" /> Meeting Information
                  </h4>
                  {selectedSession.meetingLink ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 bg-white border border-indigo-100 rounded-xl p-3 text-xs text-slate-700 break-all select-all font-mono">
                        {selectedSession.meetingLink}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCopyLink(selectedSession.meetingLink)}
                          className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-white px-4 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50"
                        >
                          {copiedLink ? (
                            <>
                              <Check className="h-4 w-4 text-emerald-600" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4" />
                              Copy Link
                            </>
                          )}
                        </button>
                        <a
                          href={selectedSession.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 shadow-sm"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Join Meeting
                        </a>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 italic">No meeting link has been generated yet for this session.</p>
                  )}
                </div>
              )}

              {/* Grid info */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Date & Time</h4>
                  <p className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-500" />
                    {new Date(selectedSession.scheduledDate).toLocaleString([], {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Duration & Price</h4>
                  <p className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                    <Clock3 className="h-4 w-4 text-slate-500" />
                    {selectedSession.duration} Minutes / LKR {Number(selectedSession.priceAmount).toLocaleString()}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Session Type</h4>
                  <p className="text-sm font-semibold text-slate-800 capitalize">
                    {selectedSession.sessionType?.replace("_", " ") || "N/A"}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Recording URL</h4>
                  {selectedSession.recordingUrl ? (
                    <a
                      href={selectedSession.recordingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-indigo-600 hover:underline flex items-center gap-1.5"
                    >
                      <ExternalLink className="h-3.5 w-3.5" /> View Recording
                    </a>
                  ) : (
                    <p className="text-sm font-medium text-slate-500">Not recorded</p>
                  )}
                </div>
              </div>

              {/* Users details */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-100 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Job Seeker</h4>
                    <Users className="h-4 w-4 text-slate-400" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">
                      {selectedSession.jobSeeker.firstName} {selectedSession.jobSeeker.lastName}
                    </p>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <Mail className="h-3 w-3" />
                      {selectedSession.jobSeeker.email}
                    </p>
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-100 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Interviewer</h4>
                    <Briefcase className="h-4 w-4 text-slate-400" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">
                      {selectedSession.interviewer.firstName} {selectedSession.interviewer.lastName}
                    </p>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <Mail className="h-3 w-3" />
                      {selectedSession.interviewer.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedSession.notes && (
                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Session Notes</h4>
                  <p className="text-sm text-slate-700 whitespace-pre-line">{selectedSession.notes}</p>
                </div>
              )}

              {/* Disputed Information */}
              {selectedSession.sessionStatus === "disputed" && selectedSession.disputeReason && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                  <h4 className="text-sm font-bold text-red-800 mb-1 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600" /> Dispute Reason
                  </h4>
                  <p className="text-sm text-red-700 whitespace-pre-line">{selectedSession.disputeReason}</p>
                </div>
              )}

              {/* Cancelled Information */}
              {selectedSession.sessionStatus === "cancelled" && selectedSession.cancellationReason && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
                  <h4 className="text-sm font-bold text-rose-800 mb-1 flex items-center gap-2">
                    <Ban className="h-4 w-4 text-rose-600" /> Cancellation Reason
                  </h4>
                  <p className="text-sm text-rose-700 whitespace-pre-line">{selectedSession.cancellationReason}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end border-t border-slate-100 bg-slate-50/50 px-6 py-4">
              <button
                onClick={() => setSelectedSession(null)}
                className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 shadow-sm"
              >
                Close
              </button>
            </div>
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
