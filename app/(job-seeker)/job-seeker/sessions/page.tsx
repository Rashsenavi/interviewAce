"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Video,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  RefreshCw,
  ExternalLink,
  Search,
  X,
} from "lucide-react";
import { sessionApi } from "@/lib/api";

type SessionStatus = "scheduled" | "rescheduled" | "in_progress" | "completed" | "cancelled" | "no_show";

interface Session {
  id: number;
  sessionType: string;
  scheduledDate: string;
  duration: number;
  meetingLink?: string;
  sessionStatus: SessionStatus;
  priceAmount: number;
  cancellationReason?: string;
  notes?: string;
  createdAt: string;
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

interface SessionStats {
  totalSessions: number;
  completedSessions: number;
  upcomingSessions: number;
  cancelledSessions: number;
}

const SESSION_TYPE_LABELS: Record<string, string> = {
  behavioral: "Behavioral Interview",
  technical: "Technical Interview",
  case_study: "Case Study",
  mixed: "Mixed Interview",
};

const STATUS_UPCOMING: SessionStatus[] = ["scheduled", "rescheduled", "in_progress"];
const STATUS_PAST: SessionStatus[] = ["completed", "cancelled", "no_show"];

export default function MySessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [stats, setStats] = useState<SessionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past" | "all">("upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);

  const loadSessions = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sessionsRes, statsRes] = await Promise.all([
        sessionApi.getAll(),
        sessionApi.getStats(),
      ]);

      if (sessionsRes.success && sessionsRes.data?.sessions) {
        setSessions(sessionsRes.data.sessions as Session[]);
      } else {
        setError(sessionsRes.error?.message || "Failed to load sessions");
      }

      if (statsRes.success && statsRes.data?.stats) {
        setStats(statsRes.data.stats);
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const filteredSessions = sessions.filter((session) => {
    const interviewerName = `${session.interviewer.firstName} ${session.interviewer.lastName}`;
    const matchesSearch =
      interviewerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      SESSION_TYPE_LABELS[session.sessionType]?.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === "upcoming") {
      return STATUS_UPCOMING.includes(session.sessionStatus) && matchesSearch;
    } else if (activeTab === "past") {
      return STATUS_PAST.includes(session.sessionStatus) && matchesSearch;
    }
    return matchesSearch;
  });

  const upcomingCount = sessions.filter((s) => STATUS_UPCOMING.includes(s.sessionStatus)).length;
  const completedCount = sessions.filter((s) => s.sessionStatus === "completed").length;
  const totalSpent = sessions
    .filter((s) => s.sessionStatus === "completed")
    .reduce((acc, s) => acc + s.priceAmount, 0);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const getStatusBadge = (status: SessionStatus) => {
    switch (status) {
      case "scheduled":
      case "rescheduled":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
            <CheckCircle className="w-3 h-3" />
            {status === "rescheduled" ? "Rescheduled" : "Confirmed"}
          </span>
        );
      case "in_progress":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">
            <Video className="w-3 h-3" />
            In Progress
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
            <CheckCircle className="w-3 h-3" />
            Completed
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-700 rounded-full text-xs font-medium">
            <XCircle className="w-3 h-3" />
            Cancelled
          </span>
        );
      case "no_show":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-50 text-orange-700 rounded-full text-xs font-medium">
            <AlertCircle className="w-3 h-3" />
            No Show
          </span>
        );
    }
  };

  const handleCancelSession = async () => {
    if (!selectedSession) return;
    setIsProcessing(true);
    try {
      const res = await sessionApi.updateStatus(
        selectedSession.id,
        "cancelled",
        cancelReason || undefined
      );
      if (res.success) {
        setCancelSuccess(true);
        setSessions((prev) =>
          prev.map((s) =>
            s.id === selectedSession.id ? { ...s, sessionStatus: "cancelled" } : s
          )
        );
        setTimeout(() => {
          setShowCancelModal(false);
          setSelectedSession(null);
          setCancelReason("");
          setCancelSuccess(false);
        }, 1500);
      } else {
        alert(res.error?.message || "Failed to cancel session");
      }
    } catch {
      alert("An error occurred. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">My Sessions</h1>
          <p className="text-gray-600">View and manage your interview sessions</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
          Loading your sessions…
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">My Sessions</h1>
        <p className="text-gray-600">View and manage your interview sessions</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{upcomingCount}</p>
              <p className="text-sm text-gray-500">Upcoming Sessions</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{completedCount}</p>
              <p className="text-sm text-gray-500">Completed Sessions</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Star className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                LKR {totalSpent.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">Total Invested</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs and Search */}
      <div className="bg-white rounded-xl border border-gray-200 mb-6">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab("upcoming")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "upcoming"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Upcoming ({upcomingCount})
            </button>
            <button
              onClick={() => setActiveTab("past")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "past"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Past Sessions
            </button>
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "all"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              All ({sessions.length})
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search sessions…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            />
          </div>
        </div>

        {/* Sessions List */}
        <div className="divide-y divide-gray-100">
          {filteredSessions.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No sessions found</h3>
              <p className="text-gray-500 mb-4">
                {activeTab === "upcoming"
                  ? "You don't have any upcoming sessions."
                  : "No sessions match your search."}
              </p>
              <Link
                href="/job-seeker/interviewers"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Book a Session
              </Link>
            </div>
          ) : (
            filteredSessions.map((session) => {
              const interviewerName = `${session.interviewer.firstName} ${session.interviewer.lastName}`;
              const initials = `${session.interviewer.firstName[0]}${session.interviewer.lastName[0]}`;
              const isUpcoming = STATUS_UPCOMING.includes(session.sessionStatus);

              return (
                <div key={session.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-lg shrink-0">
                      {initials}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">{interviewerName}</h3>
                          <p className="text-sm text-gray-600">
                            {session.interviewer.jobTitle} at {session.interviewer.currentCompany}
                          </p>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(session.sessionStatus)}
                          <p className="text-xs text-gray-500 mt-1">#{session.id}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(session.scheduledDate)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatTime(session.scheduledDate)} ({session.duration} min)
                        </span>
                        <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                          {SESSION_TYPE_LABELS[session.sessionType] || session.sessionType}
                        </span>
                        <span className="font-semibold text-gray-900">
                          LKR {session.priceAmount.toLocaleString()}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {isUpcoming && (
                          <>
                            {session.meetingLink && (
                              <a
                                href={session.meetingLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                              >
                                <Video className="w-4 h-4" />
                                Join Meeting
                              </a>
                            )}
                            <button
                              onClick={() => {
                                setSelectedSession(session);
                                setShowCancelModal(true);
                              }}
                              className="flex items-center gap-2 border border-red-200 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-medium"
                            >
                              <XCircle className="w-4 h-4" />
                              Cancel
                            </button>
                          </>
                        )}

                        {session.sessionStatus === "completed" && (
                          <>
                            <Link
                              href="/job-seeker/feedback"
                              className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                            >
                              <Star className="w-4 h-4" />
                              Leave Review
                            </Link>
                            <Link
                              href={`/job-seeker/interviewers/${session.interviewer.userId}`}
                              className="flex items-center gap-2 border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium"
                            >
                              <RefreshCw className="w-4 h-4" />
                              Book Again
                            </Link>
                          </>
                        )}

                        <Link
                          href={`/job-seeker/interviewers/${session.interviewer.userId}`}
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium ml-auto"
                        >
                          View Profile
                          <ExternalLink className="w-4 h-4" />
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

      {/* Book More CTA */}
      <div className="bg-linear-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold mb-1">Ready for your next practice session?</h3>
            <p className="text-blue-100">
              Browse verified IT interviewers (SE, QA, PM, DevOps) and book your next mock interview.
            </p>
          </div>
          <Link
            href="/job-seeker/interviewers"
            className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-semibold shrink-0"
          >
            Browse Interviewers
          </Link>
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && selectedSession && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Cancel Session</h2>
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setSelectedSession(null);
                  setCancelReason("");
                }}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {cancelSuccess ? (
              <div className="p-8 text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="text-gray-900 font-semibold">Session Cancelled</p>
                <p className="text-gray-500 text-sm mt-1">Your session has been cancelled.</p>
              </div>
            ) : (
              <>
                <div className="p-6">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <p className="text-red-700 text-sm">
                      Are you sure you want to cancel your session with{" "}
                      <strong>
                        {selectedSession.interviewer.firstName} {selectedSession.interviewer.lastName}
                      </strong>{" "}
                      on {formatDate(selectedSession.scheduledDate)} at{" "}
                      {formatTime(selectedSession.scheduledDate)}?
                    </p>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason for cancellation (optional)
                    </label>
                    <textarea
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      placeholder="Let us know why you're cancelling…"
                      className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                      rows={3}
                    />
                  </div>

                  <p className="text-xs text-gray-500">
                    Note: Cancellations within 24 hours may be subject to a cancellation fee.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                  <button
                    onClick={() => {
                      setShowCancelModal(false);
                      setSelectedSession(null);
                      setCancelReason("");
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900"
                  >
                    Keep Session
                  </button>
                  <button
                    onClick={handleCancelSession}
                    disabled={isProcessing}
                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium disabled:opacity-50 flex items-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Cancelling…
                      </>
                    ) : (
                      "Cancel Session"
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
