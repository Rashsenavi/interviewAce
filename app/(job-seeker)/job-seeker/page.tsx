"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Star,
  Video,
  Clock,
  CalendarDays,
  Users,
  CheckCircle,
  ArrowUpRight,
  Search,
  BookOpen,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { sessionApi, interviewerApi, paymentApi } from "@/lib/api";

interface SessionData {
  id: number;
  sessionType: string;
  scheduledDate: string;
  duration: number;
  meetingLink?: string;
  sessionStatus: string;
  priceAmount: number;
  interviewer: {
    id: number;
    userId: number;
    firstName: string;
    lastName: string;
    currentCompany: string;
    jobTitle: string;
    ratingAverage: number;
    isVerified: boolean;
  };
}

interface RecommendedInterviewer {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  jobTitle: string;
  currentCompany: string;
  ratingAverage: number;
  totalInterviews: number;
  hourlyRate: number;
  isVerified: boolean;
}

interface SessionStats {
  totalSessions: number;
  completedSessions: number;
  upcomingSessions: number;
  cancelledSessions: number;
}

const SESSION_TYPE_LABELS: Record<string, string> = {
  behavioral: "Behavioral",
  technical: "Technical",
  case_study: "Case Study",
  mixed: "Mixed",
};

function formatDateTime(dateStr: string) {
  const d = new Date(dateStr);
  return {
    date: d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
    time: d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
  };
}

// ─── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  trend,
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  trend?: { direction: "up" | "neutral"; label: string };
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-widest text-slate-400">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
        </div>
        <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1">
          <ArrowUpRight className={`h-3.5 w-3.5 ${trend.direction === "up" ? "text-emerald-500" : "text-slate-400"}`} />
          <span className={`text-xs font-medium ${trend.direction === "up" ? "text-emerald-600" : "text-slate-400"}`}>
            {trend.label}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Empty state ───────────────────────────────────────────────────────────────
function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 mb-4">
        <Icon className="h-6 w-6 text-slate-400" />
      </div>
      <p className="text-sm font-semibold text-slate-700">{title}</p>
      <p className="mt-1 text-xs text-slate-400 max-w-xs">{description}</p>
      {action && (
        <Link
          href={action.href}
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-700"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}

// ─── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    scheduled: "bg-emerald-50 text-emerald-700 border-emerald-200",
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    rescheduled: "bg-sky-50 text-sky-700 border-sky-200",
    completed: "bg-slate-100 text-slate-600 border-slate-200",
    cancelled: "bg-red-50 text-red-600 border-red-200",
  };
  const label = status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " ");
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${map[status] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}>
      {label}
    </span>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function JobSeekerDashboardPage() {
  const { user } = useAuth();
  const userName = user?.firstName || "Candidate";

  const [stats, setStats] = useState<SessionStats | null>(null);
  const [upcomingSessions, setUpcomingSessions] = useState<SessionData[]>([]);
  const [recommendedInterviewers, setRecommendedInterviewers] = useState<RecommendedInterviewer[]>([]);
  const [loading, setLoading] = useState(true);
  const [creditBalance, setCreditBalance] = useState<number | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [statsRes, sessionsRes, interviewersRes, balRes] = await Promise.all([
          sessionApi.getStats(),
          sessionApi.getAll({ upcoming: true }),
          interviewerApi.getAll({ isVerified: true, sortBy: "rating", sortOrder: "desc" }),
          paymentApi.getPackageBalance(),
        ]);

        if (statsRes.success && statsRes.data?.stats) setStats(statsRes.data.stats);
        if (sessionsRes.success && sessionsRes.data?.sessions) {
          setUpcomingSessions((sessionsRes.data.sessions as SessionData[]).slice(0, 3));
        }
        if (interviewersRes.success && interviewersRes.data?.interviewers) {
          setRecommendedInterviewers((interviewersRes.data.interviewers as RecommendedInterviewer[]).slice(0, 3));
        }
        if (balRes.success && balRes.data) {
          setCreditBalance(balRes.data.balance);
        } else {
          setCreditBalance(0);
        }
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  const profileCompletion = Math.round(
    ([user?.firstName, user?.lastName, user?.email].filter(Boolean).length / 3) * 100
  );

  return (
    <div className="space-y-6">

      {/* ── Welcome banner ── */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 flex-wrap mb-1">
              <h1 className="text-2xl font-semibold text-slate-900">Welcome back, {userName}</h1>
              {/* Account type badge */}
              {!loading && creditBalance !== null && (
                creditBalance > 0 ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-3 py-1 text-xs font-bold text-white shadow-sm">
                    ★ Premium Account
                    <span className="ml-1 bg-white/20 rounded-full px-1.5 py-0.5 text-[10px] font-extrabold">{creditBalance} credits</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500">
                    Free Account
                  </span>
                )
              )}
            </div>
            <p className="mt-1 text-sm text-slate-400">Here's your interview preparation progress</p>
            {!loading && creditBalance !== null && creditBalance > 0 && (
              <p className="mt-1 text-xs text-orange-600 font-medium">
                You have <strong>{creditBalance}</strong> session credit{creditBalance !== 1 ? "s" : ""} ready — book a session using your package!
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href="/job-seeker/interviewers"
              className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
            >
              <Calendar className="h-4 w-4" />
              Book Interview
            </Link>
            <Link
              href="/job-seeker/questions"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <BookOpen className="h-4 w-4" />
              Practice Questions
            </Link>
          </div>
        </div>

        {/* Profile completion bar */}
        <div className="mt-6 rounded-lg bg-slate-50 border border-slate-100 p-4">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-medium text-slate-600">Profile Completion</span>
            <span className="font-semibold text-slate-900">{profileCompletion}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
            <div
              className="h-full rounded-full bg-orange-500 transition-all duration-700"
              style={{ width: `${profileCompletion}%` }}
            />
          </div>
          {profileCompletion < 100 && (
            <Link
              href="/job-seeker/settings"
              className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-orange-600 hover:text-orange-700 transition-colors"
            >
              Complete your profile <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Sessions"
          value={loading ? "—" : stats?.totalSessions ?? 0}
          icon={CalendarDays}
          iconBg="bg-sky-50"
          iconColor="text-sky-600"
          trend={{ direction: "neutral", label: "All time" }}
        />
        <StatCard
          label="Completed"
          value={loading ? "—" : stats?.completedSessions ?? 0}
          icon={CheckCircle}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          trend={{ direction: (stats?.completedSessions ?? 0) > 0 ? "up" : "neutral", label: "Sessions done" }}
        />
        <StatCard
          label="Upcoming"
          value={loading ? "—" : stats?.upcomingSessions ?? 0}
          icon={Video}
          iconBg="bg-orange-50"
          iconColor="text-orange-500"
          trend={{ direction: (stats?.upcomingSessions ?? 0) > 0 ? "up" : "neutral", label: "Scheduled" }}
        />
        <StatCard
          label="Cancelled"
          value={loading ? "—" : stats?.cancelledSessions ?? 0}
          icon={Clock}
          iconBg="bg-slate-100"
          iconColor="text-slate-400"
          trend={{ direction: "neutral", label: "Total cancelled" }}
        />
      </div>

      {/* ── Main grid ── */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* ── Left/main: upcoming sessions ── */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div>
                <p className="text-sm font-semibold text-slate-900">Upcoming Sessions</p>
                <p className="text-xs text-slate-400 mt-0.5">Your next scheduled interviews</p>
              </div>
              <Link
                href="/job-seeker/sessions"
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
              >
                View all <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {loading ? (
                <div className="p-6 text-center text-sm text-slate-400">Loading sessions…</div>
              ) : upcomingSessions.length === 0 ? (
                <EmptyState
                  icon={CalendarDays}
                  title="No upcoming sessions"
                  description="Find a verified interviewer and book your first mock session."
                  action={{ label: "Browse Interviewers", href: "/job-seeker/interviewers" }}
                />
              ) : (
                upcomingSessions.map((session) => {
                  const { date, time } = formatDateTime(session.scheduledDate);
                  const initials = `${session.interviewer.firstName[0]}${session.interviewer.lastName[0]}`.toUpperCase();
                  return (
                    <div key={session.id} className="p-5 hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-700 select-none">
                          {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-semibold text-slate-900 flex items-center gap-1">
                                {session.interviewer.firstName} {session.interviewer.lastName}
                                {session.interviewer.isVerified && <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />}
                              </p>
                              <p className="text-xs text-slate-400">
                                {session.interviewer.jobTitle} · {session.interviewer.currentCompany}
                              </p>
                            </div>
                            <StatusBadge status={session.sessionStatus} />
                          </div>
                          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                            <span className="flex items-center gap-1">
                              <CalendarDays className="h-3.5 w-3.5" />
                              {date}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {time} · {session.duration} min
                            </span>
                          </div>
                          <div className="mt-2 flex items-center gap-2">
                            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-medium text-slate-600">
                              {SESSION_TYPE_LABELS[session.sessionType] ?? session.sessionType}
                            </span>
                            <Link
                              href="/job-seeker/sessions"
                              className="inline-flex items-center rounded-full border border-slate-200 px-2.5 py-0.5 text-[11px] font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                              Manage
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* ── Right sidebar: recommended interviewers ── */}
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <p className="text-sm font-semibold text-slate-900">Recommended</p>
              <Link
                href="/job-seeker/interviewers"
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
              >
                Browse all <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {loading ? (
                <div className="p-6 text-center text-sm text-slate-400">Loading…</div>
              ) : recommendedInterviewers.length === 0 ? (
                <EmptyState
                  icon={Search}
                  title="No interviewers found"
                  description="Check back once more interviewers are verified."
                />
              ) : (
                recommendedInterviewers.map((iv) => (
                  <div key={iv.id} className="p-4 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-700 select-none">
                        {iv.firstName[0]}{iv.lastName[0]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-900 truncate flex items-center gap-1">
                          {iv.firstName} {iv.lastName}
                          {iv.isVerified && <CheckCircle className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />}
                        </p>
                        <p className="text-xs text-slate-400 truncate">{iv.jobTitle}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <div className="flex items-center gap-0.5">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            <span className="text-xs font-semibold text-slate-700">
                              {Number(iv.ratingAverage).toFixed(1)}
                            </span>
                          </div>
                          <span className="text-xs text-slate-400">· {iv.totalInterviews} sessions</span>
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <p className="text-xs font-semibold text-slate-900">LKR {Math.round(Number(iv.hourlyRate)).toLocaleString()}</p>
                        <p className="text-[10px] text-slate-400">per session</p>
                      </div>
                    </div>
                    <Link
                      href={`/job-seeker/interviewers/${iv.userId}`}
                      className="mt-3 flex w-full items-center justify-center rounded-lg border border-slate-200 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Book Now
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── CTA banner ── */}
      <div className="rounded-xl border border-slate-200 bg-slate-900 p-6 text-white">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-lg font-semibold">Preparing for a technical role?</h2>
            <p className="mt-1 text-sm text-slate-300 max-w-lg">
              We have verified experts across SE, QA, PM, DevOps, and more — ready to help you land your dream role.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {["Software Engineer", "Product Manager", "QA Engineer", "DevOps", "Data Engineer", "Tech Lead"].map((role) => (
                <span key={role} className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white">
                  {role}
                </span>
              ))}
            </div>
          </div>
          <Link
            href="/job-seeker/interviewers"
            className="inline-flex flex-shrink-0 items-center gap-2 rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
          >
            Browse Interviewers
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

    </div>
  );
}
