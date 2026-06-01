"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { sessionApi, feedbackApi } from "@/lib/api";
import {
  Calendar,
  Clock,
  Video,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  RefreshCw,
  MessageSquare,
  X,
  ExternalLink,
  Search,
  Phone,
  Mail,
  FileText,
  DollarSign,
} from "lucide-react";
import { UploadVideoModal } from "./components/UploadVideoModal";

type SessionStatus = "upcoming" | "completed" | "cancelled" | "pending" | "awaiting_confirmation" | "disputed";

interface Session {
  id: string;
  jobSeekerId: number;
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
  feedback?: any;
  rescheduleCount?: number;
  originalScheduledDate?: string;
}

// Mock session data for interviewer (Removed in favor of dynamic API data)

export default function InterviewerSessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past" | "all">("upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showVideoUploadModal, setShowVideoUploadModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Additional state for Cancel and Reschedule
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");

  // Feedback state
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({
    overallRating: 0,
    communicationRating: 0,
    technicalRating: 0,
    problemSolvingRating: 0,
    confidenceRating: 0,
    strengths: "",
    weaknesses: "",
    improvementTips: "",
    generalComments: "",
  });
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  const isWithin24Hours = (dateStr: string) => {
    const scheduled = new Date(dateStr);
    const now = new Date();
    const diffHours = (scheduled.getTime() - now.getTime()) / (1000 * 60 * 60);
    return diffHours < 24 && diffHours > 0;
  };

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await sessionApi.getAll();
      if (res.success && res.data?.sessions) {
        const sessionTypeLabels: Record<string, string> = {
          behavioral: "Behavioral Interview",
          technical: "Technical Interview",
          case_study: "Case Study",
          mixed: "Mixed Interview",
        };

        const mappedSessions = res.data.sessions.map((s: any) => {
          const candidateName = `${s.jobSeeker?.firstName || "Candidate"} ${s.jobSeeker?.lastName || ""}`;
          const initials = `${s.jobSeeker?.firstName?.[0] || "C"}${s.jobSeeker?.lastName?.[0] || ""}`;
          
          let status: SessionStatus = "upcoming";
          if (s.sessionStatus === "pending") {
            status = "pending";
          } else if (s.sessionStatus === "completed") {
            status = "completed";
          } else if (s.sessionStatus === "cancelled" || s.sessionStatus === "no_show") {
            status = "cancelled";
          } else if (s.sessionStatus === "awaiting_confirmation") {
            status = "awaiting_confirmation";
          } else if (s.sessionStatus === "disputed") {
            status = "disputed";
          } else if (s.sessionStatus === "scheduled" || s.sessionStatus === "rescheduled" || s.sessionStatus === "in_progress") {
            status = "upcoming";
          }

          const scheduledDate = new Date(s.scheduledDate);

          return {
            id: s.id.toString(),
            jobSeekerId: s.jobSeeker?.id,
            candidateName,
            candidateAvatar: initials,
            candidateAvatarBg: "bg-teal-500",
            candidateEmail: s.jobSeeker?.user?.email || "candidate@email.com",
            candidatePhone: s.jobSeeker?.user?.phoneNumber || "N/A",
            candidateUniversity: s.jobSeeker?.university || "N/A",
            date: s.scheduledDate.split("T")[0],
            time: scheduledDate.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            }),
            duration: `${s.duration} min`,
            sessionType: sessionTypeLabels[s.sessionType] || s.sessionType,
            status,
            earnings: parseFloat(s.priceAmount || "0"),
            meetingLink: s.meetingLink || "",
            notes: s.notes || "",
            rating: s.rating,
            feedback: s.feedback,
            rescheduleCount: s.rescheduleCount || 0,
            originalScheduledDate: s.scheduledDate,
          };
        });

        setSessions(mappedSessions);
      }
    } catch (error) {
      console.error("Failed to load sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!selectedSession || feedbackForm.overallRating === 0 || !feedbackForm.strengths || !feedbackForm.weaknesses || !feedbackForm.improvementTips) return;
    setIsProcessing(true);
    try {
      const res = await feedbackApi.submitFeedback({
        sessionId: parseInt(selectedSession.id),
        jobSeekerId: selectedSession.jobSeekerId,
        ...feedbackForm
      });
      if (res.success) {
        setFeedbackSuccess(true);
        setTimeout(() => {
          setShowFeedbackModal(false);
          setSelectedSession(null);
          setFeedbackForm({
            overallRating: 0,
            communicationRating: 0,
            technicalRating: 0,
            problemSolvingRating: 0,
            confidenceRating: 0,
            strengths: "",
            weaknesses: "",
            improvementTips: "",
            generalComments: "",
          });
          setFeedbackSuccess(false);
        }, 1500);
      } else {
        alert("Failed to submit feedback");
      }
    } catch {
      alert("An error occurred while submitting feedback.");
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  // Filter sessions
  const filteredSessions = sessions.filter((session) => {
    const matchesSearch =
      session.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.candidateUniversity.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === "upcoming") {
      return (session.status === "upcoming" || session.status === "pending" || session.status === "awaiting_confirmation") && matchesSearch;
    } else if (activeTab === "past") {
      return (session.status === "completed" || session.status === "cancelled" || session.status === "disputed") && matchesSearch;
    }
    return matchesSearch;
  });

  // Stats
  const upcomingCount = sessions.filter(
    (s) => s.status === "upcoming" || s.status === "pending" || s.status === "awaiting_confirmation"
  ).length;
  const pendingCount = sessions.filter((s) => s.status === "pending").length;
  const completedCount = sessions.filter((s) => s.status === "completed").length;
  const totalEarnings = sessions
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
    const parts = timeStr.split(":");
    const hour = parseInt(parts[0]);
    const minutes = parts[1] || "00";
    return hour < 12 
      ? `${hour === 0 ? 12 : hour}:${minutes} AM` 
      : hour === 12 
      ? `12:${minutes} PM` 
      : `${hour - 12}:${minutes} PM`;
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
            Pending Booking
          </span>
        );
      case "awaiting_confirmation":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-medium animate-pulse">
            <AlertCircle className="w-3 h-3" />
            Awaiting Occurrence Confirmation
          </span>
        );
      case "disputed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">
            <AlertCircle className="w-3 h-3" />
            Disputed / Under Review
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
    try {
      let res;
      if (selectedSession.status === "awaiting_confirmation") {
        res = await sessionApi.confirm(parseInt(selectedSession.id), true);
      } else {
        res = await sessionApi.updateStatus(parseInt(selectedSession.id), "scheduled");
      }

      if (res.success) {
        if (selectedSession.status === "awaiting_confirmation") {
          alert(`Session #${selectedSession.id} occurrence confirmed!`);
        } else {
          alert(`Session #${selectedSession.id} has been confirmed!`);
        }
        await fetchSessions();
      } else {
        alert(res.error?.message || "Failed to confirm session");
      }
    } catch (error) {
      console.error("Error confirming session:", error);
      alert("An unexpected error occurred.");
    } finally {
      setShowConfirmModal(false);
      setSelectedSession(null);
      setIsProcessing(false);
    }
  };

  const handleRejectSession = async () => {
    if (!selectedSession) return;
    setIsProcessing(true);
    try {
      let res;
      if (selectedSession.status === "awaiting_confirmation") {
        res = await sessionApi.confirm(parseInt(selectedSession.id), false, rejectReason || undefined);
      } else {
        res = await sessionApi.updateStatus(
          parseInt(selectedSession.id),
          "cancelled",
          rejectReason || undefined
        );
      }

      if (res.success) {
        if (selectedSession.status === "awaiting_confirmation") {
          alert(`Session #${selectedSession.id} flagged as disputed.`);
        } else {
          alert(`Session #${selectedSession.id} has been rejected.`);
        }
        await fetchSessions();
      } else {
        alert(res.error?.message || "Failed to process request");
      }
    } catch (error) {
      console.error("Error rejecting session:", error);
      alert("An unexpected error occurred.");
    } finally {
      setShowRejectModal(false);
      setSelectedSession(null);
      setRejectReason("");
      setIsProcessing(false);
    }
  };

  const handleCancelSession = async () => {
    if (!selectedSession) return;
    setIsProcessing(true);
    try {
      const res = await sessionApi.updateStatus(
        parseInt(selectedSession.id),
        "cancelled",
        cancelReason || undefined
      );
      if (res.success) {
        alert(`Session #${selectedSession.id} has been cancelled.`);
        await fetchSessions();
      } else {
        alert(res.error?.message || "Failed to cancel session");
      }
    } catch (error) {
      console.error("Error cancelling session:", error);
      alert("An unexpected error occurred.");
    } finally {
      setShowCancelModal(false);
      setSelectedSession(null);
      setCancelReason("");
      setIsProcessing(false);
    }
  };

  const handleReschedule = async () => {
    if (!selectedSession || !newDate || !newTime) return;
    setIsProcessing(true);
    try {
      const newScheduledDate = new Date(`${newDate}T${newTime}`).toISOString();
      const res = await sessionApi.reschedule(parseInt(selectedSession.id), newScheduledDate);
      
      if (res.success) {
        alert("Session rescheduled successfully!");
        await fetchSessions();
      } else {
        alert(res.error?.message || "Failed to reschedule session");
      }
    } catch {
      alert("An unexpected error occurred.");
    } finally {
      setShowRescheduleModal(false);
      setSelectedSession(null);
      setNewDate("");
      setNewTime("");
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-500">Loading sessions...</p>
      </div>
    );
  }

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
                    className={`w-14 h-14 ${session.candidateAvatarBg} rounded-full flex items-center justify-center text-white font-semibold text-lg shrink-0`}
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
                          <p className="text-sm text-gray-600 italic">"{session.feedback.generalComments || session.feedback.strengths || "Detailed feedback provided"}"</p>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {session.status === "awaiting_confirmation" && (
                        <div className="flex flex-col gap-3 w-full bg-amber-50 border border-amber-100 rounded-lg p-4 my-2">
                          <p className="text-sm font-semibold text-amber-900 flex items-center gap-1.5">
                            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                            Did this session take place?
                          </p>
                          <p className="text-xs text-amber-700 font-normal">
                            Please confirm if the session with {session.candidateName} took place.
                          </p>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedSession(session);
                                setShowConfirmModal(true);
                              }}
                              className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-md text-xs font-medium"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              Yes, it happened
                            </button>
                            <button
                              onClick={() => {
                                setSelectedSession(session);
                                setShowRejectModal(true);
                              }}
                              className="flex items-center gap-1.5 border border-red-200 text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-md text-xs font-medium"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              No, report issue
                            </button>
                          </div>
                        </div>
                      )}

                      {session.status === "disputed" && (
                        <div className="bg-purple-50 border border-purple-100 rounded-lg p-3.5 w-full my-2">
                          <p className="text-sm text-purple-800 flex items-center gap-1.5 font-medium">
                            <AlertCircle className="w-4 h-4 shrink-0 text-purple-600" />
                            This session is under review by admin.
                          </p>
                        </div>
                      )}

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
                          
                          {/* Cancel / Reschedule for Interviewer */}
                          {(session.rescheduleCount || 0) < 3 && !isWithin24Hours(session.originalScheduledDate || "") && (
                            <button
                              onClick={() => {
                                setSelectedSession(session);
                                setShowRescheduleModal(true);
                              }}
                              className="flex items-center gap-2 border border-teal-200 text-teal-600 hover:bg-teal-50 px-4 py-2 rounded-lg text-sm font-medium"
                            >
                              <RefreshCw className="w-4 h-4" />
                              Reschedule
                            </button>
                          )}
                          
                          <button
                            onClick={() => {
                              setSelectedSession(session);
                              setShowCancelModal(true);
                            }}
                            disabled={isWithin24Hours(session.originalScheduledDate || "")}
                            className="flex items-center gap-2 border border-red-200 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            title={isWithin24Hours(session.originalScheduledDate || "") ? "Cannot cancel within 24 hours" : ""}
                          >
                            <XCircle className="w-4 h-4" />
                            Cancel
                          </button>
                        </>
                      )}

                      {session.status === "completed" && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedSession(session);
                              if (session.feedback) {
                                setFeedbackForm({
                                  overallRating: session.feedback.overallRating || 0,
                                  communicationRating: session.feedback.communicationRating || 0,
                                  technicalRating: session.feedback.technicalRating || 0,
                                  problemSolvingRating: session.feedback.problemSolvingRating || 0,
                                  confidenceRating: session.feedback.confidenceRating || 0,
                                  strengths: session.feedback.strengths || "",
                                  weaknesses: session.feedback.weaknesses || "",
                                  improvementTips: session.feedback.improvementTips || "",
                                  generalComments: session.feedback.generalComments || "",
                                });
                              } else {
                                setFeedbackForm({
                                  overallRating: 0,
                                  communicationRating: 0,
                                  technicalRating: 0,
                                  problemSolvingRating: 0,
                                  confidenceRating: 0,
                                  strengths: "",
                                  weaknesses: "",
                                  improvementTips: "",
                                  generalComments: "",
                                });
                              }
                              setShowFeedbackModal(true);
                            }}
                            className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                          >
                            <Star className="w-4 h-4" />
                            {session.feedback ? "Edit Feedback" : "Leave Feedback"}
                          </button>
                          
                          <button
                            onClick={() => {
                              setSelectedSession(session);
                              setShowVideoUploadModal(true);
                            }}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                          >
                            <Video className="w-4 h-4" />
                            Upload Video
                          </button>
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
              <h2 className="text-lg font-semibold text-gray-900">
                {selectedSession.status === "awaiting_confirmation" ? "Confirm Session Occurrence" : "Confirm Session"}
              </h2>
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
                  {selectedSession.status === "awaiting_confirmation" ? (
                    <>Confirm that your session with <strong>{selectedSession.candidateName}</strong> on <strong>{formatDate(selectedSession.date)}</strong> occurred successfully?</>
                  ) : (
                    <>Confirm your session with <strong>{selectedSession.candidateName}</strong> on{" "}
                    {formatDate(selectedSession.date)} at {formatTime(selectedSession.time)}?</>
                  )}
                </p>
              </div>
              <p className="text-sm text-gray-600">
                {selectedSession.status === "awaiting_confirmation" 
                  ? "This will complete the session and release the funds to your account."
                  : "The candidate will be notified and a meeting link will be generated."}
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
                  selectedSession.status === "awaiting_confirmation" ? "Yes, Session Occurred" : "Confirm Session"
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
              <h2 className="text-lg font-semibold text-gray-900">
                {selectedSession.status === "awaiting_confirmation" ? "Report Session Issue" : "Reject Session"}
              </h2>
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
                  {selectedSession.status === "awaiting_confirmation" ? (
                    <>Are you sure you want to report an issue or dispute the occurrence of the session with <strong>{selectedSession.candidateName}</strong>?</>
                  ) : (
                    <>Are you sure you want to reject the session with{" "}
                    <strong>{selectedSession.candidateName}</strong>?</>
                  )}
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {selectedSession.status === "awaiting_confirmation" ? "Describe the issue / dispute reason" : "Reason for rejection"}
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder={selectedSession.status === "awaiting_confirmation" 
                    ? "Please describe what happened (e.g. candidate was a no-show, technical issues)..."
                    : "Let the candidate know why you're unavailable..."}
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
                    {selectedSession.status === "awaiting_confirmation" ? "Submitting..." : "Rejecting..."}
                  </>
                ) : (
                  selectedSession.status === "awaiting_confirmation" ? "Report Issue / Dispute" : "Reject Session"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal (for Upcoming Sessions) */}
      {showCancelModal && selectedSession && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Cancel Confirmed Session</h2>
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

            <div className="p-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-700 text-sm">
                  Are you sure you want to cancel the confirmed session with{" "}
                  <strong>{selectedSession.candidateName}</strong>?
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for cancellation
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Let the candidate know why you must cancel..."
                  className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                  rows={3}
                />
              </div>
              <p className="text-xs text-gray-500">
                Note: Cancellations within 24 hours of the session are strictly prohibited.
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
                  setNewDate("");
                  setNewTime("");
                }}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                <p className="text-teal-800 text-sm mb-2">
                  <strong>Current Time:</strong> {formatDate(selectedSession.originalScheduledDate || "")} at {formatTime(selectedSession.time)}
                </p>
                <p className="text-teal-800 text-xs italic">
                  This session has been rescheduled {selectedSession.rescheduleCount || 0} out of 3 times.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Date</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  min={new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString().split("T")[0]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Time</label>
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              
              <p className="text-xs text-gray-500 mt-2">
                Note: Reschedules must be done at least 24 hours in advance and are limited to 3 times per session.
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
                onClick={handleReschedule}
                disabled={isProcessing || !newDate || !newTime}
                className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium disabled:opacity-50 flex items-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Confirm New Time"
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
                {selectedSession.meetingLink && (
                  <div className="flex flex-col gap-1.5 pt-2">
                    <span className="text-sm font-semibold text-gray-700">Meeting Link</span>
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                      <Video size={16} className="text-slate-400 shrink-0" />
                      <a
                        href={selectedSession.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 font-medium hover:underline truncate flex-1"
                      >
                        {selectedSession.meetingLink}
                      </a>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(selectedSession.meetingLink || "");
                          alert("Meeting link copied to clipboard!");
                        }}
                        className="text-[10px] text-gray-500 hover:text-gray-800 bg-white border border-gray-300 rounded px-1.5 py-0.5 shrink-0"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                )}
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

      {/* Feedback Modal */}
      {showFeedbackModal && selectedSession && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h2 className="text-lg font-semibold text-gray-900">Provide Feedback for {selectedSession.candidateName}</h2>
              <button
                onClick={() => {
                  setShowFeedbackModal(false);
                  setSelectedSession(null);
                  setFeedbackForm({
                    overallRating: 0,
                    communicationRating: 0,
                    technicalRating: 0,
                    problemSolvingRating: 0,
                    confidenceRating: 0,
                    strengths: "",
                    weaknesses: "",
                    improvementTips: "",
                    generalComments: "",
                  });
                }}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {feedbackSuccess ? (
              <div className="p-8 text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="text-gray-900 font-semibold">Feedback Submitted!</p>
                <p className="text-gray-500 text-sm mt-1">Thank you for helping candidates improve.</p>
              </div>
            ) : (
              <>
                <div className="p-6 space-y-6">
                  {/* Ratings */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 border-b pb-2">Ratings</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.keys(feedbackForm).filter(k => k.includes("Rating")).map((key) => {
                        const label = key.replace("Rating", "").replace(/([A-Z])/g, ' $1').trim();
                        const displayLabel = label.charAt(0).toUpperCase() + label.slice(1) + " Rating";
                        return (
                          <div key={key}>
                            <label className="block text-sm text-gray-700 mb-1">{displayLabel}</label>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  onClick={() => setFeedbackForm({ ...feedbackForm, [key]: star })}
                                  className={`p-1 transition-colors ${(feedbackForm[key as keyof typeof feedbackForm] as number) >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                                >
                                  <Star className={`w-5 h-5 ${(feedbackForm[key as keyof typeof feedbackForm] as number) >= star ? 'fill-current' : ''}`} />
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Written Feedback */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 border-b pb-2">Written Feedback</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Strengths (Required)</label>
                      <textarea
                        value={feedbackForm.strengths}
                        onChange={(e) => setFeedbackForm({ ...feedbackForm, strengths: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                        rows={2}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Areas for Improvement (Required)</label>
                      <textarea
                        value={feedbackForm.weaknesses}
                        onChange={(e) => setFeedbackForm({ ...feedbackForm, weaknesses: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                        rows={2}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Actionable Tips (Required)</label>
                      <textarea
                        value={feedbackForm.improvementTips}
                        onChange={(e) => setFeedbackForm({ ...feedbackForm, improvementTips: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                        rows={2}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">General Comments (Optional)</label>
                      <textarea
                        value={feedbackForm.generalComments}
                        onChange={(e) => setFeedbackForm({ ...feedbackForm, generalComments: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl sticky bottom-0 z-10">
                  <button
                    onClick={() => {
                      setShowFeedbackModal(false);
                      setSelectedSession(null);
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleFeedbackSubmit}
                    disabled={isProcessing || feedbackForm.overallRating === 0 || !feedbackForm.strengths || !feedbackForm.weaknesses || !feedbackForm.improvementTips}
                    className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-2"
                  >
                    {isProcessing ? "Submitting…" : "Submit Feedback"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {/* Upload Video Modal */}
      {showVideoUploadModal && selectedSession && (
        <UploadVideoModal
          session={selectedSession}
          onClose={() => {
            setShowVideoUploadModal(false);
            setSelectedSession(null);
          }}
          onSuccess={() => {
            setShowVideoUploadModal(false);
            setSelectedSession(null);
            alert("Video uploaded successfully! It is now pending admin approval.");
            fetchSessions();
          }}
        />
      )}
    </div>
  );
}
