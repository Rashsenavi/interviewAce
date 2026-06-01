"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { interviewerApi, sessionApi } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DollarSign,
  Calendar,
  Star,
  Users,
  Video,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  ArrowUpRight,
  CalendarDays,
  BookOpen,
} from "lucide-react";

// ─── Session type display mapping ─────────────────────────────────────────────
const SESSION_TYPE_LABELS: Record<string, string> = {
  behavioral: "Behavioral",
  technical: "Technical",
  case_study: "Case Study",
  mixed: "Mixed",
};

// ─── Status badge helper ───────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    scheduled: { label: "Confirmed", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    rescheduled: { label: "Rescheduled", className: "bg-sky-50 text-sky-700 border-sky-200" },
    pending: { label: "Pending", className: "bg-amber-50 text-amber-700 border-amber-200" },
    awaiting_confirmation: { label: "Awaiting Confirmation", className: "bg-orange-50 text-orange-700 border-orange-200" },
    in_progress: { label: "In Progress", className: "bg-teal-50 text-teal-700 border-teal-200" },
    completed: { label: "Completed", className: "bg-slate-100 text-slate-600 border-slate-200" },
    cancelled: { label: "Cancelled", className: "bg-red-50 text-red-600 border-red-200" },
  };
  const cfg = map[status] ?? { label: status, className: "bg-slate-100 text-slate-600 border-slate-200" };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}

// ─── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  iconBg,
  iconColor,
  trend,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  trend?: { direction: "up" | "down" | "neutral"; label: string };
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-widest text-slate-400">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900 truncate">{value}</p>
          {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
        </div>
        <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1">
          <ArrowUpRight className={`h-3.5 w-3.5 ${trend.direction === "up" ? "text-emerald-500" : trend.direction === "down" ? "rotate-180 text-red-400" : "text-slate-400"}`} />
          <span className={`text-xs font-medium ${trend.direction === "up" ? "text-emerald-600" : trend.direction === "down" ? "text-red-500" : "text-slate-500"}`}>
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

// ─── Main Component ────────────────────────────────────────────────────────────
export default function InterviewerDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessions, setSessions] = useState<any[]>([]);
  const [editingSessionId, setEditingSessionId] = useState<number | null>(null);
  const [tempLink, setTempLink] = useState("");

  const fetchDashboardData = useCallback(async () => {
    if (!user) return;
    try {
      const [profileRes, sessionsRes] = await Promise.all([
        interviewerApi.getProfile(),
        sessionApi.getAll(),
      ]);

      if (profileRes.success && profileRes.data?.profile) {
        setProfile(profileRes.data.profile);
      }

      if (sessionsRes.success && sessionsRes.data?.sessions) {
        const mapped = sessionsRes.data.sessions.map((s: any) => ({
          id: s.id,
          candidateName: `${s.jobSeeker?.firstName || "Candidate"} ${s.jobSeeker?.lastName || ""}`.trim(),
          candidateInitials: `${s.jobSeeker?.firstName?.[0] ?? "C"}${s.jobSeeker?.lastName?.[0] ?? ""}`.toUpperCase(),
          date: new Date(s.scheduledDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
          time: new Date(s.scheduledDate).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
          duration: `${s.duration} min`,
          price: parseFloat(s.priceAmount || "0"),
          status: s.sessionStatus,
          sessionType: SESSION_TYPE_LABELS[s.sessionType] ?? s.sessionType,
          meetingLink: s.meetingLink || "",
          notes: s.notes || "",
          feedback: s.feedback?.generalComments || s.feedback?.strengths || "",
        }));
        setSessions(mapped);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleSaveLink = async (id: number) => {
    try {
      const res = await sessionApi.updateMeetingLink(id, tempLink);
      if (res.success) {
        setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, meetingLink: tempLink } : s)));
      } else {
        alert(res.error?.message || "Failed to save meeting link");
      }
    } catch {
      alert("An unexpected error occurred.");
    } finally {
      setEditingSessionId(null);
      setTempLink("");
    }
  };

  const handleAcceptSession = async (id: number) => {
    router.push("/interviewer/sessions");
  };

  const handleDeclineSession = async (id: number) => {
    const reason = prompt("Please enter a reason for declining (optional):");
    if (reason === null) return;
    try {
      const res = await sessionApi.updateStatus(id, "cancelled", reason || undefined);
      if (res.success) {
        await fetchDashboardData();
      } else {
        alert(res.error?.message || "Failed to decline session");
      }
    } catch {
      alert("An unexpected error occurred.");
    }
  };

  // ── Loading state ──
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="h-8 w-8 rounded-full border-[3px] border-orange-500 border-t-transparent animate-spin" />
        <p className="text-sm text-slate-400">Loading your dashboard…</p>
      </div>
    );
  }

  const upcomingList = sessions.filter((s) =>
    ["pending", "scheduled", "rescheduled", "in_progress", "awaiting_confirmation"].includes(s.status)
  );
  const completedList = sessions.filter((s) => s.status === "completed");
  const totalEarnings = Number(profile?.totalEarnings || 0);
  const rating = Number(profile?.ratingAverage || 0);

  // ── Verification gate ──
  if (!profile?.isVerified) {
    return (
      <div className="max-w-xl mt-4">
        {profile?.verificationStatus === "rejected" ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-900 mb-2">Action Required</h2>
            <p className="text-sm text-red-700 mb-5">
              Your application requires attention before we can approve it.
            </p>
            {profile.verificationNotes && (
              <div className="rounded-xl bg-white border border-red-100 p-4 text-left mb-5 text-sm text-slate-700">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">Admin Feedback</p>
                <p className="whitespace-pre-wrap">{profile.verificationNotes}</p>
              </div>
            )}
            <Link
              href="/interviewer/profile"
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Update Documents
            </Link>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <Clock className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Reviewing Your Documents</h2>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mb-5">
              Thank you for joining InterviewAce! Our team is reviewing your professional documents.
              This usually takes 1–2 business days.
            </p>
            <Link
              href="/interviewer/profile"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              View Profile
            </Link>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Earnings"
          value={`LKR ${totalEarnings.toLocaleString()}`}
          sub="All time"
          icon={DollarSign}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          trend={{ direction: "up", label: "Lifetime earnings" }}
        />
        <StatCard
          label="Upcoming"
          value={upcomingList.length}
          sub="Sessions scheduled"
          icon={CalendarDays}
          iconBg="bg-sky-50"
          iconColor="text-sky-600"
          trend={{ direction: upcomingList.length > 0 ? "up" : "neutral", label: upcomingList.length > 0 ? `${upcomingList.filter(s => s.status === "pending").length} pending review` : "No upcoming sessions" }}
        />
        <StatCard
          label="Rating"
          value={rating > 0 ? rating.toFixed(1) : "—"}
          sub="Average from reviews"
          icon={Star}
          iconBg="bg-amber-50"
          iconColor="text-amber-500"
          trend={{ direction: rating >= 4 ? "up" : "neutral", label: rating >= 4 ? "High performer" : "Building reputation" }}
        />
        <StatCard
          label="Completed"
          value={profile?.totalInterviews || "0"}
          sub="Total sessions"
          icon={Users}
          iconBg="bg-orange-50"
          iconColor="text-orange-500"
          trend={{ direction: "neutral", label: `${completedList.length} this sync` }}
        />
      </div>

      {/* ── Main grid ── */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* ── Left: sessions ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Upcoming sessions */}
          <div className="rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div>
                <p className="text-sm font-semibold text-slate-900">Upcoming Sessions</p>
                <p className="text-xs text-slate-400 mt-0.5">{upcomingList.length} sessions scheduled or pending</p>
              </div>
              <Link
                href="/interviewer/schedule"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
              >
                <Calendar className="h-3.5 w-3.5" />
                Manage Schedule
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {upcomingList.length === 0 ? (
                <EmptyState
                  icon={CalendarDays}
                  title="No upcoming sessions"
                  description="Update your availability to start receiving booking requests."
                  action={{ label: "Set Availability", href: "/interviewer/schedule" }}
                />
              ) : (
                upcomingList.map((session) => (
                  <div key={session.id} className="p-5 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-700 select-none">
                        {session.candidateInitials}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{session.candidateName}</p>
                            <div className="mt-0.5 flex items-center gap-3 text-xs text-slate-400">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                {session.date}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                {session.time} · {session.duration}
                              </span>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-sm font-semibold text-emerald-600">LKR {session.price.toLocaleString()}</p>
                            <div className="mt-1"><StatusBadge status={session.status} /></div>
                          </div>
                        </div>

                        {/* Session type tag */}
                        <div className="mt-2">
                          <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-medium text-slate-600">
                            {session.sessionType}
                          </span>
                        </div>

                        {/* Notes */}
                        {session.notes && (
                          <div className="mt-3 rounded-lg bg-amber-50 border border-amber-100 px-3 py-2 text-xs text-amber-800">
                            <strong>Candidate note:</strong> {session.notes}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          {session.status === "awaiting_confirmation" ? (
                            <div className="flex flex-col gap-2 w-full rounded-lg bg-amber-50 border border-amber-100 p-3">
                              <p className="text-xs font-semibold text-amber-900">Did this session take place?</p>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={async () => {
                                    const res = await sessionApi.confirm(session.id, true);
                                    if (res.success) fetchDashboardData();
                                    else alert(res.error?.message || "Failed to confirm");
                                  }}
                                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700"
                                >
                                  Yes, it happened
                                </button>
                                <button
                                  onClick={async () => {
                                    const reason = prompt("Describe what issue occurred:");
                                    if (reason === null) return;
                                    const res = await sessionApi.confirm(session.id, false, reason || undefined);
                                    if (res.success) fetchDashboardData();
                                    else alert(res.error?.message || "Failed to dispute");
                                  }}
                                  className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                                >
                                  No, report issue
                                </button>
                              </div>
                            </div>
                          ) : session.status === "pending" ? (
                            <>
                              <button
                                onClick={() => handleAcceptSession(session.id)}
                                className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-700"
                              >
                                Accept Request
                              </button>
                              <button
                                onClick={() => handleDeclineSession(session.id)}
                                className="rounded-lg border border-red-200 px-4 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                              >
                                Decline
                              </button>
                            </>
                          ) : (
                            <>
                              {session.meetingLink ? (
                                <a
                                  href={session.meetingLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-700"
                                >
                                  <Video className="h-3.5 w-3.5" />
                                  Join Session
                                </a>
                              ) : editingSessionId === session.id ? (
                                <div className="flex items-center gap-2">
                                  <input
                                    type="url"
                                    placeholder="Paste meeting link…"
                                    value={tempLink}
                                    onChange={(e) => setTempLink(e.target.value)}
                                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    autoFocus
                                  />
                                  <button
                                    onClick={() => handleSaveLink(session.id)}
                                    className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-700"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => { setEditingSessionId(null); setTempLink(""); }}
                                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => { setEditingSessionId(session.id); setTempLink(""); }}
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                                >
                                  <Video className="h-3.5 w-3.5" />
                                  + Add Meet Link
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent / completed sessions */}
          <div className="rounded-xl border border-slate-200 bg-white">
            <div className="px-5 py-4 border-b border-slate-100">
              <p className="text-sm font-semibold text-slate-900">Recent Sessions</p>
              <p className="text-xs text-slate-400 mt-0.5">Completed interviews and feedback</p>
            </div>

            <div className="divide-y divide-slate-100">
              {completedList.length === 0 ? (
                <EmptyState
                  icon={CheckCircle}
                  title="No completed sessions yet"
                  description="Once you complete sessions, they'll appear here with candidate feedback."
                />
              ) : (
                completedList.slice(0, 5).map((session) => (
                  <div key={session.id} className="p-5 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500 select-none">
                        {session.candidateInitials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{session.candidateName}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{session.date} · {session.duration}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-sm font-semibold text-emerald-600">+LKR {session.price.toLocaleString()}</p>
                            <StatusBadge status={session.status} />
                          </div>
                        </div>
                        {session.feedback && (
                          <p className="mt-2 text-xs text-slate-500 italic">"{session.feedback}"</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {completedList.length > 5 && (
              <div className="px-5 py-3 border-t border-slate-100">
                <Link href="/interviewer/sessions" className="text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors">
                  View all {completedList.length} sessions →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ── Right: quick actions + performance ── */}
        <div className="space-y-6">

          {/* Quick actions */}
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">Quick Actions</p>
            <div className="space-y-2">
              <Link
                href="/interviewer/schedule"
                className="flex items-center gap-3 rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                <Calendar className="h-4 w-4" />
                Update Availability
              </Link>
              <Link
                href="/interviewer/earnings"
                className="flex items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <DollarSign className="h-4 w-4 text-slate-400" />
                View Earnings
              </Link>
              <Link
                href="/interviewer/questions"
                className="flex items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <BookOpen className="h-4 w-4 text-slate-400" />
                Question Bank
              </Link>
            </div>
          </div>

          {/* Performance */}
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">Performance</p>
            <div className="space-y-4">
              {[
                {
                  label: "Session Completion",
                  value: completedList.length > 0 ? Math.round((completedList.length / sessions.filter(s => !["pending"].includes(s.status)).length) * 100) || 100 : 100,
                  color: "bg-emerald-500",
                },
                {
                  label: "Candidate Satisfaction",
                  value: rating > 0 ? Math.round((rating / 5) * 100) : 0,
                  color: "bg-amber-400",
                },
                {
                  label: "Profile Completeness",
                  value: profile?.bio && profile?.linkedinProfile && profile?.hourlyRate ? 100 : 65,
                  color: "bg-sky-500",
                },
              ].map((bar) => (
                <div key={bar.label}>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-500">{bar.label}</span>
                    <span className="font-semibold text-slate-700">{bar.value}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${bar.color} transition-all duration-700`}
                      style={{ width: `${bar.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Earnings summary */}
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">Earnings</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Total lifetime</span>
                <span className="text-sm font-semibold text-slate-900">LKR {totalEarnings.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Sessions done</span>
                <span className="text-sm font-semibold text-slate-900">{profile?.totalInterviews || 0}</span>
              </div>
              <div className="border-t border-slate-100 pt-3">
                <Link
                  href="/interviewer/earnings"
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  <TrendingUp className="h-3.5 w-3.5" />
                  Full Earnings Report
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
