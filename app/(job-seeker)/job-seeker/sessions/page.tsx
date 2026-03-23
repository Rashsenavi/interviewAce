"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Video,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  MessageSquare,
  MoreVertical,
  X,
  RefreshCw,
  ExternalLink,
  Filter,
  Search,
} from "lucide-react";

// Session status types
type SessionStatus = "upcoming" | "completed" | "cancelled" | "pending";

interface Session {
  id: string;
  interviewerName: string;
  interviewerAvatar: string;
  interviewerAvatarBg: string;
  interviewerTitle: string;
  interviewerCompany: string;
  date: string;
  time: string;
  duration: string;
  sessionType: string;
  status: SessionStatus;
  price: number;
  meetingLink?: string;
  rating?: number;
  feedback?: string;
}

// Mock session data
const sessionsData: Session[] = [
  {
    id: "INT-20260210001",
    interviewerName: "Kasun Perera",
    interviewerAvatar: "KP",
    interviewerAvatarBg: "bg-blue-500",
    interviewerTitle: "Senior Software Engineer",
    interviewerCompany: "Google",
    date: "2026-02-12",
    time: "10:00",
    duration: "60 min",
    sessionType: "Mock Interview",
    status: "upcoming",
    price: 5000,
    meetingLink: "https://meet.google.com/abc-defg-hij",
  },
  {
    id: "INT-20260210002",
    interviewerName: "Amaya Fernando",
    interviewerAvatar: "AF",
    interviewerAvatarBg: "bg-purple-500",
    interviewerTitle: "Product Manager",
    interviewerCompany: "Meta",
    date: "2026-02-15",
    time: "14:00",
    duration: "60 min",
    sessionType: "Career Coaching",
    status: "pending",
    price: 6000,
  },
  {
    id: "INT-20260208001",
    interviewerName: "Ravindu Silva",
    interviewerAvatar: "RS",
    interviewerAvatarBg: "bg-green-500",
    interviewerTitle: "Investment Banking Analyst",
    interviewerCompany: "Goldman Sachs",
    date: "2026-02-08",
    time: "11:00",
    duration: "60 min",
    sessionType: "Mock Interview",
    status: "completed",
    price: 7500,
    rating: 5,
    feedback: "Excellent session! Very detailed feedback on financial modeling.",
  },
  {
    id: "INT-20260205001",
    interviewerName: "Nisha Jayawardena",
    interviewerAvatar: "NJ",
    interviewerAvatarBg: "bg-orange-500",
    interviewerTitle: "Marketing Director",
    interviewerCompany: "Unilever",
    date: "2026-02-05",
    time: "16:00",
    duration: "60 min",
    sessionType: "Mock Interview",
    status: "completed",
    price: 4500,
    rating: 4,
    feedback: "Great insights into marketing interviews. Would recommend!",
  },
  {
    id: "INT-20260201001",
    interviewerName: "Tharaka Bandara",
    interviewerAvatar: "TB",
    interviewerAvatarBg: "bg-teal-500",
    interviewerTitle: "Data Scientist",
    interviewerCompany: "Amazon",
    date: "2026-02-01",
    time: "09:00",
    duration: "60 min",
    sessionType: "Career Coaching",
    status: "cancelled",
    price: 5500,
  },
];

export default function MySessionsPage() {
  const [activeTab, setActiveTab] = useState<"upcoming" | "past" | "all">("upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Filter sessions based on tab
  const filteredSessions = sessionsData.filter((session) => {
    const matchesSearch =
      session.interviewerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.sessionType.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === "upcoming") {
      return (session.status === "upcoming" || session.status === "pending") && matchesSearch;
    } else if (activeTab === "past") {
      return (session.status === "completed" || session.status === "cancelled") && matchesSearch;
    }
    return matchesSearch;
  });

  // Stats
  const upcomingCount = sessionsData.filter(
    (s) => s.status === "upcoming" || s.status === "pending"
  ).length;
  const completedCount = sessionsData.filter((s) => s.status === "completed").length;
  const totalSpent = sessionsData
    .filter((s) => s.status === "completed")
    .reduce((acc, s) => acc + s.price, 0);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (timeStr: string) => {
    const hour = parseInt(timeStr.split(":")[0]);
    return hour < 12 ? `${hour}:00 AM` : hour === 12 ? "12:00 PM" : `${hour - 12}:00 PM`;
  };

  const getStatusBadge = (status: SessionStatus) => {
    switch (status) {
      case "upcoming":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
            <CheckCircle className="w-3 h-3" />
            Confirmed
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs font-medium">
            <AlertCircle className="w-3 h-3" />
            Pending Confirmation
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
    }
  };

  const handleCancelSession = async () => {
    if (!selectedSession) return;
    setIsProcessing(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // In real app, this would update the backend
    alert(`Session ${selectedSession.id} has been cancelled.`);
    setShowCancelModal(false);
    setSelectedSession(null);
    setCancelReason("");
    setIsProcessing(false);
  };

  const handleRescheduleSession = async () => {
    if (!selectedSession) return;
    setIsProcessing(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // In real app, this would redirect to reschedule flow
    alert(`Redirecting to reschedule session ${selectedSession.id}...`);
    setShowRescheduleModal(false);
    setSelectedSession(null);
    setIsProcessing(false);
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">My Sessions</h1>
        <p className="text-gray-600">View and manage your interview sessions</p>
      </div>

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
          {/* Tabs */}
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
              All Sessions
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search sessions..."
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
            filteredSessions.map((session) => (
              <div key={session.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-4">
                  {/* Interviewer Avatar */}
                  <div
                    className={`w-14 h-14 ${session.interviewerAvatarBg} rounded-full flex items-center justify-center text-white font-semibold text-lg shrink-0`}
                  >
                    {session.interviewerAvatar}
                  </div>

                  {/* Session Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {session.interviewerName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {session.interviewerTitle} at {session.interviewerCompany}
                        </p>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(session.status)}
                        <p className="text-sm text-gray-500 mt-1">#{session.id}</p>
                      </div>
                    </div>

                    {/* Session Info */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(session.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatTime(session.time)} ({session.duration})
                      </span>
                      <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                        {session.sessionType}
                      </span>
                      <span className="font-semibold text-gray-900">
                        LKR {session.price.toLocaleString()}
                      </span>
                    </div>

                    {/* Rating & Feedback for completed sessions */}
                    {session.status === "completed" && session.rating && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-700">Your Rating:</span>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < session.rating!
                                    ? "text-yellow-400 fill-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        {session.feedback && (
                          <p className="text-sm text-gray-600 italic">"{session.feedback}"</p>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {(session.status === "upcoming" || session.status === "pending") && (
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
                              setShowRescheduleModal(true);
                            }}
                            className="flex items-center gap-2 border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium"
                          >
                            <RefreshCw className="w-4 h-4" />
                            Reschedule
                          </button>
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

                      {session.status === "completed" && !session.rating && (
                        <button className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                          <Star className="w-4 h-4" />
                          Leave Review
                        </button>
                      )}

                      {session.status === "completed" && (
                        <Link
                          href={`/job-seeker/interviewers/${session.id.slice(-1)}`}
                          className="flex items-center gap-2 border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium"
                        >
                          <RefreshCw className="w-4 h-4" />
                          Book Again
                        </Link>
                      )}

                      <Link
                        href={`/job-seeker/interviewers/1`}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium ml-auto"
                      >
                        View Profile
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Book More CTA */}
      <div className="bg-linear-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold mb-1">Ready for your next practice session?</h3>
            <p className="text-blue-100">
              Browse our expert interviewers and book your next mock interview.
            </p>
          </div>
          <Link
            href="/job-seeker/interviewers"
            className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-semibold"
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
                }}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-700 text-sm">
                  Are you sure you want to cancel your session with{" "}
                  <strong>{selectedSession.interviewerName}</strong> on{" "}
                  {formatDate(selectedSession.date)} at {formatTime(selectedSession.time)}?
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for cancellation (optional)
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Let us know why you're cancelling..."
                  className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                  rows={3}
                />
              </div>

              <p className="text-xs text-gray-500 mb-4">
                Note: Cancellations within 24 hours may be subject to a cancellation fee.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setSelectedSession(null);
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
                    Cancelling...
                  </>
                ) : (
                  "Cancel Session"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && selectedSession && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Reschedule Session</h2>
              <button
                onClick={() => {
                  setShowRescheduleModal(false);
                  setSelectedSession(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-blue-700 text-sm">
                  You're about to reschedule your session with{" "}
                  <strong>{selectedSession.interviewerName}</strong>.
                </p>
                <p className="text-blue-600 text-sm mt-2">
                  Current: {formatDate(selectedSession.date)} at {formatTime(selectedSession.time)}
                </p>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                You'll be redirected to select a new date and time from the interviewer's available slots.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <button
                onClick={() => {
                  setShowRescheduleModal(false);
                  setSelectedSession(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleRescheduleSession}
                disabled={isProcessing}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 flex items-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Continue to Reschedule"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
