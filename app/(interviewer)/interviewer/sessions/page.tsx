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
  X,
  ExternalLink,
  Search,
  Phone,
  Mail,
  FileText,
  DollarSign,
} from "lucide-react";

type SessionStatus = "upcoming" | "completed" | "cancelled" | "pending";

interface Session {
  id: string;
  candidateName: string;
  candidateAvatar: string;
  candidateAvatarBg: string;
  candidateEmail: string;
  candidatePhone: string;
  candidateUniversity: string;
  date: string;
  time: string;
  duration: string;
  sessionType: string;
  status: SessionStatus;
  earnings: number;
  meetingLink?: string;
  notes?: string;
  rating?: number;
  feedback?: string;
}

// Mock session data for interviewer
const sessionsData: Session[] = [
  {
    id: "INT-20260212001",
    candidateName: "Amaya Silva",
    candidateAvatar: "AS",
    candidateAvatarBg: "bg-purple-500",
    candidateEmail: "amaya.silva@email.com",
    candidatePhone: "+94 77 123 4567",
    candidateUniversity: "University of Colombo",
    date: "2026-02-12",
    time: "10:00",
    duration: "60 min",
    sessionType: "Mock Interview",
    status: "upcoming",
    earnings: 4250,
    meetingLink: "https://meet.google.com/abc-defg-hij",
    notes: "Focus on system design and coding questions",
  },
  {
    id: "INT-20260213001",
    candidateName: "Ravindu Fernando",
    candidateAvatar: "RF",
    candidateAvatarBg: "bg-orange-500",
    candidateEmail: "ravindu.f@email.com",
    candidatePhone: "+94 76 987 6543",
    candidateUniversity: "University of Moratuwa",
    date: "2026-02-13",
    time: "14:00",
    duration: "60 min",
    sessionType: "Career Coaching",
    status: "pending",
    earnings: 4250,
    notes: "Resume review and interview tips",
  },
  {
    id: "INT-20260215001",
    candidateName: "Nisha Jayawardena",
    candidateAvatar: "NJ",
    candidateAvatarBg: "bg-teal-500",
    candidateEmail: "nisha.j@email.com",
    candidatePhone: "+94 71 555 4444",
    candidateUniversity: "SLIIT",
    date: "2026-02-15",
    time: "16:00",
    duration: "60 min",
    sessionType: "Mock Interview",
    status: "pending",
    earnings: 4250,
  },
  {
    id: "INT-20260208001",
    candidateName: "Kasun Perera",
    candidateAvatar: "KP",
    candidateAvatarBg: "bg-blue-500",
    candidateEmail: "kasun.p@email.com",
    candidatePhone: "+94 77 111 2222",
    candidateUniversity: "University of Kelaniya",
    date: "2026-02-08",
    time: "11:00",
    duration: "60 min",
    sessionType: "Mock Interview",
    status: "completed",
    earnings: 4250,
    rating: 5,
    feedback: "Very helpful session. Got detailed feedback on my technical skills.",
  },
  {
    id: "INT-20260206001",
    candidateName: "Sanduni Wickrama",
    candidateAvatar: "SW",
    candidateAvatarBg: "bg-pink-500",
    candidateEmail: "sanduni.w@email.com",
    candidatePhone: "+94 70 333 4444",
    candidateUniversity: "University of Peradeniya",
    date: "2026-02-06",
    time: "09:00",
    duration: "60 min",
    sessionType: "Career Coaching",
    status: "completed",
    earnings: 4250,
    rating: 4,
    feedback: "Good advice on career planning. Would recommend!",
  },
  {
    id: "INT-20260203001",
    candidateName: "Thilina Rajapaksa",
    candidateAvatar: "TR",
    candidateAvatarBg: "bg-green-500",
    candidateEmail: "thilina.r@email.com",
    candidatePhone: "+94 72 666 7777",
    candidateUniversity: "NSBM",
    date: "2026-02-03",
    time: "15:00",
    duration: "60 min",
    sessionType: "Mock Interview",
    status: "cancelled",
    earnings: 0,
  },
];

export default function InterviewerSessionsPage() {
  const [activeTab, setActiveTab] = useState<"upcoming" | "past" | "all">("upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Filter sessions
  const filteredSessions = sessionsData.filter((session) => {
    const matchesSearch =
      session.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.candidateUniversity.toLowerCase().includes(searchQuery.toLowerCase());

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
  const pendingCount = sessionsData.filter((s) => s.status === "pending").length;
  const completedCount = sessionsData.filter((s) => s.status === "completed").length;
  const totalEarnings = sessionsData
    .filter((s) => s.status === "completed")
    .reduce((acc, s) => acc + s.earnings, 0);

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
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
            <CheckCircle className="w-3 h-3" />
            Confirmed
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs font-medium">
            <AlertCircle className="w-3 h-3" />
            Awaiting Confirmation
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
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

  const handleConfirmSession = async () => {
    if (!selectedSession) return;
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    alert(`Session ${selectedSession.id} has been confirmed!`);
    setShowConfirmModal(false);
    setSelectedSession(null);
    setIsProcessing(false);
  };

  const handleRejectSession = async () => {
    if (!selectedSession) return;
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    alert(`Session ${selectedSession.id} has been rejected.`);
    setShowRejectModal(false);
    setSelectedSession(null);
    setRejectReason("");
    setIsProcessing(false);
  };

  return (
    <div className="w-full">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Sessions</h1>
        <p className="text-gray-600">Manage your interview sessions with candidates</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{upcomingCount}</p>
              <p className="text-sm text-gray-500">Upcoming</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
              <p className="text-sm text-gray-500">Pending</p>
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
              <p className="text-sm text-gray-500">Completed</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                LKR {totalEarnings.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">Total Earned</p>
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
              All Sessions
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by candidate..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 w-64"
            />
          </div>
        </div>

        {/* Sessions List */}
        <div className="divide-y divide-gray-100">
          {filteredSessions.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No sessions found</h3>
              <p className="text-gray-500">
                {activeTab === "upcoming"
                  ? "You don't have any upcoming sessions."
                  : "No sessions match your search."}
              </p>
            </div>
          ) : (
            filteredSessions.map((session) => (
              <div key={session.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-4">
                  {/* Candidate Avatar */}
                  <div
                    className={`w-14 h-14 ${session.candidateAvatarBg} rounded-full flex items-center justify-center text-white font-semibold text-lg flex-shrink-0`}
                  >
                    {session.candidateAvatar}
                  </div>

                  {/* Session Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {session.candidateName}
                        </h3>
                        <p className="text-sm text-gray-600">{session.candidateUniversity}</p>
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
                      {session.status === "completed" && (
                        <span className="font-semibold text-teal-600">
                          +LKR {session.earnings.toLocaleString()}
                        </span>
                      )}
                    </div>

                    {/* Notes */}
                    {session.notes && (session.status === "upcoming" || session.status === "pending") && (
                      <div className="bg-yellow-50 rounded-lg p-3 mb-3">
                        <p className="text-sm text-yellow-800">
                          <FileText className="w-4 h-4 inline mr-1" />
                          <strong>Candidate Note:</strong> {session.notes}
                        </p>
                      </div>
                    )}

                    {/* Rating for completed */}
                    {session.status === "completed" && session.rating && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-700">Rating received:</span>
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
                    <div className="flex items-center gap-2 flex-wrap">
                      {session.status === "pending" && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedSession(session);
                              setShowConfirmModal(true);
                            }}
                            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Confirm
                          </button>
                          <button
                            onClick={() => {
                              setSelectedSession(session);
                              setShowRejectModal(true);
                            }}
                            className="flex items-center gap-2 border border-red-200 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-medium"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </button>
                        </>
                      )}

                      {session.status === "upcoming" && (
                        <>
                          {session.meetingLink && (
                            <a
                              href={session.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                            >
                              <Video className="w-4 h-4" />
                              Start Session
                            </a>
                          )}
                          <a
                            href={`mailto:${session.candidateEmail}`}
                            className="flex items-center gap-2 border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium"
                          >
                            <Mail className="w-4 h-4" />
                            Email
                          </a>
                        </>
                      )}

                      <button
                        onClick={() => {
                          setSelectedSession(session);
                          setShowDetailsModal(true);
                        }}
                        className="flex items-center gap-2 text-teal-600 hover:text-teal-700 text-sm font-medium ml-auto"
                      >
                        View Details
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Confirm Modal */}
      {showConfirmModal && selectedSession && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Confirm Session</h2>
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setSelectedSession(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <p className="text-green-700 text-sm">
                  Confirm your session with <strong>{selectedSession.candidateName}</strong> on{" "}
                  {formatDate(selectedSession.date)} at {formatTime(selectedSession.time)}?
                </p>
              </div>
              <p className="text-sm text-gray-600">
                The candidate will be notified and a meeting link will be generated.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setSelectedSession(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSession}
                disabled={isProcessing}
                className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium disabled:opacity-50 flex items-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Confirming...
                  </>
                ) : (
                  "Confirm Session"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedSession && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Reject Session</h2>
              <button
                onClick={() => {
                  setShowRejectModal(false);
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
                  Are you sure you want to reject the session with{" "}
                  <strong>{selectedSession.candidateName}</strong>?
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for rejection
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Let the candidate know why you're unavailable..."
                  className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedSession(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSession}
                disabled={isProcessing}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium disabled:opacity-50 flex items-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  "Reject Session"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedSession && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Session Details</h2>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedSession(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Candidate Info */}
              <div className="flex items-center gap-4">
                <div
                  className={`w-16 h-16 ${selectedSession.candidateAvatarBg} rounded-full flex items-center justify-center text-white font-bold text-xl`}
                >
                  {selectedSession.candidateAvatar}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {selectedSession.candidateName}
                  </h3>
                  <p className="text-gray-600">{selectedSession.candidateUniversity}</p>
                </div>
              </div>

              {/* Contact */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <a href={`mailto:${selectedSession.candidateEmail}`} className="text-blue-600 hover:underline">
                    {selectedSession.candidateEmail}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">{selectedSession.candidatePhone}</span>
                </div>
              </div>

              {/* Session Info */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Session ID</span>
                  <span className="font-medium">{selectedSession.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Date & Time</span>
                  <span className="font-medium">
                    {formatDate(selectedSession.date)} at {formatTime(selectedSession.time)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Duration</span>
                  <span className="font-medium">{selectedSession.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Type</span>
                  <span className="font-medium">{selectedSession.sessionType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  {getStatusBadge(selectedSession.status)}
                </div>
                {selectedSession.status === "completed" && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Earnings</span>
                    <span className="font-semibold text-teal-600">
                      LKR {selectedSession.earnings.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {selectedSession.notes && (
                <div className="bg-yellow-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-yellow-800 mb-1">Candidate Notes:</p>
                  <p className="text-sm text-yellow-700">{selectedSession.notes}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedSession(null);
                }}
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium"
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
