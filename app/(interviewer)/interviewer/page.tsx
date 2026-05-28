"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { interviewerApi, sessionApi } from "@/lib/api";
import Link from "next/link";
import {
  DollarSign,
  Calendar,
  Star,
  Users,
  Video,
  Phone,
  RefreshCw,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
} from "lucide-react";

// Mock data for the dashboard
const upcomingSessions = [
  {
    id: 1,
    candidateName: "Amaya Silva",
    avatar: "AS",
    avatarBg: "bg-purple-100",
    avatarColor: "text-purple-600",
    date: "Today",
    time: "2:00 PM - 3:00 PM",
    price: 5000,
    status: "confirmed",
    tags: ["Technical Interview", "Software Engineering"],
    meetingLink: "https://zoom.us/j/123456789",
  },
  {
    id: 2,
    candidateName: "Ravindu Fernando",
    avatar: "RF",
    avatarBg: "bg-orange-100",
    avatarColor: "text-orange-600",
    date: "Tomorrow",
    time: "10:00 AM - 11:30 AM",
    price: 6000,
    status: "confirmed",
    tags: ["Mock Interview", "Product Management"],
    meetingLink: "https://teams.microsoft.com/l/meetup-join/19%3ameeting_xyz",
  },
  {
    id: 3,
    candidateName: "Nisha Jayawardena",
    avatar: "NJ",
    avatarBg: "bg-blue-100",
    avatarColor: "text-blue-600",
    date: "Jan 18",
    time: "4:00 PM - 5:00 PM",
    price: 5000,
    status: "pending",
    tags: ["Behavioral Interview", "Marketing"],
    meetingLink: "", // Not generated until confirmed
  },
];

const recentSessions = [
  {
    id: 1,
    candidateName: "Kasun Perera",
    date: "Jan 14, 2026",
    duration: "1h",
    rating: 5,
    earnings: 4000,
    feedback: "Excellent interviewer! Very helpful and insightful.",
  },
  {
    id: 2,
    candidateName: "Sanduni Wickramasinghe",
    date: "Jan 12, 2026",
    duration: "1.5h",
    rating: 5,
    earnings: 6000,
    feedback: "Great experience, learned a lot!",
  },
  {
    id: 3,
    candidateName: "Thilina Rajapaksa",
    date: "Jan 10, 2026",
    duration: "1h",
    rating: 4,
    earnings: 4000,
    feedback: "Good feedback, very professional.",
  },
];

export default function InterviewerDashboardPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Make sessions stateful so the user can paste and save links during the demo
  const [sessions, setSessions] = useState<any[]>([]);
  const [editingSessionId, setEditingSessionId] = useState<number | null>(null);
  const [tempLink, setTempLink] = useState("");

  const handleSaveLink = async (id: number) => {
    try {
      const res = await sessionApi.updateMeetingLink(id, tempLink);
      if (res.success) {
        setSessions(prev => 
          prev.map(s => s.id === id ? { ...s, meetingLink: tempLink } : s)
        );
      } else {
        alert(res.error?.message || "Failed to save meeting link");
      }
    } catch (error) {
      console.error("Error saving meeting link:", error);
      alert("An unexpected error occurred.");
    } finally {
      setEditingSessionId(null);
      setTempLink("");
    }
  };

  const handleAcceptSession = async (id: number) => {
    try {
      const res = await sessionApi.updateStatus(id, "scheduled");
      if (res.success) {
        await fetchDashboardData();
        alert("Session accepted successfully!");
      } else {
        alert(res.error?.message || "Failed to accept session");
      }
    } catch (error) {
      console.error("Error accepting session:", error);
      alert("An unexpected error occurred.");
    }
  };

  const handleDeclineSession = async (id: number) => {
    const reason = prompt("Please enter a reason for declining this request (optional):");
    if (reason === null) return;
    
    try {
      const res = await sessionApi.updateStatus(id, "cancelled", reason || undefined);
      if (res.success) {
        await fetchDashboardData();
        alert("Session declined.");
      } else {
        alert(res.error?.message || "Failed to decline session");
      }
    } catch (error) {
      console.error("Error declining session:", error);
      alert("An unexpected error occurred.");
    }
  };

  const fetchDashboardData = async () => {
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
        const sessionTypeLabels: Record<string, string> = {
          behavioral: "Behavioral Interview",
          technical: "Technical Interview",
          case_study: "Case Study",
          mixed: "Mixed Interview",
        };

        const backendSessions = sessionsRes.data.sessions.map((s: any) => {
          const name = `${s.jobSeeker?.firstName || "Candidate"} ${s.jobSeeker?.lastName || ""}`;
          const initials = `${s.jobSeeker?.firstName?.[0] || "C"}${s.jobSeeker?.lastName?.[0] || ""}`;
          
          return {
            id: s.id,
            candidateName: name,
            avatar: initials,
            avatarBg: "bg-teal-100",
            avatarColor: "text-teal-600",
            date: new Date(s.scheduledDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
            time: new Date(s.scheduledDate).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            duration: `${s.duration} min`,
            price: parseFloat(s.priceAmount || "0"),
            earnings: parseFloat(s.priceAmount || "0"),
            status: s.sessionStatus,
            tags: [sessionTypeLabels[s.sessionType] || s.sessionType],
            meetingLink: s.meetingLink || "",
            notes: s.notes || "",
            rating: s.rating || 5,
            feedback: s.feedback?.generalComments || s.feedback?.strengths || "Great session, no detailed written review left.",
          };
        });

        setSessions(backendSessions);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const userName = user?.firstName || "";

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-500">Loading your dashboard...</p>
      </div>
    );
  }

  const upcomingList = sessions.filter(
    (s) =>
      s.status === "pending" ||
      s.status === "scheduled" ||
      s.status === "rescheduled" ||
      s.status === "in_progress"
  );
  const completedList = sessions.filter((s) => s.status === "completed");

  return (
    <div className="w-full">
      {/* Welcome Section */}
      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        Welcome back, {userName}! 👋
      </h1>

      {/* Verification Gating */}
      {!profile?.isVerified ? (
        profile?.verificationStatus === "rejected" ? (
          <div className="max-w-3xl mt-4">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-red-900 mb-2">Action Required</h2>
              <p className="text-red-700 mb-6">Your interviewer application requires your attention before we can approve it.</p>
              
              <div className="bg-white rounded-xl p-6 text-left border border-red-100 shadow-sm mb-6 max-w-xl mx-auto">
                <h3 className="font-semibold text-gray-900 mb-2">Admin Feedback:</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{profile.verificationNotes || "Please review your documents and ensure they meet our requirements."}</p>
              </div>

              <p className="text-sm text-red-600 mb-6">Please contact support or re-upload your documents through your profile settings.</p>
              <Link href="/interviewer/profile" className="inline-block bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 transition">
                Update Documents
              </Link>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mt-4">
            <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-8 text-center">
              <Clock className="w-16 h-16 text-indigo-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-indigo-900 mb-2">Reviewing Your Documents</h2>
              <p className="text-indigo-700 max-w-lg mx-auto mb-6">
                Thank you for joining InterviewAce! Our team is currently reviewing your professional documents. This usually takes 1-2 business days.
              </p>
              <p className="text-sm text-indigo-600/80">
                We will notify you via email once your account is verified. In the meantime, you can review your profile.
              </p>
              <div className="mt-6">
                <Link href="/interviewer/profile" className="inline-block bg-white text-indigo-700 border border-indigo-200 px-6 py-2 rounded-xl font-semibold hover:bg-indigo-50 transition">
                  View Profile
                </Link>
              </div>
            </div>
          </div>
        )
      ) : (
        <>


      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-6 mb-10">
        {/* This Month Earnings */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-500 mb-2">Total Earnings</p>
              <p className="text-2xl font-bold text-gray-900 truncate">
                LKR {Number(profile?.totalEarnings || 0).toLocaleString()}
              </p>
              <p className="text-xs text-gray-400 mt-2">Lifetime earnings</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center shrink-0">
              <DollarSign size={22} className="text-green-600" />
            </div>
          </div>
        </div>

        {/* Upcoming Sessions */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-500 mb-2">Active Status</p>
              <p className="text-3xl font-bold text-gray-900">
                {profile?.isVerified ? "Verified" : "Pending"}
              </p>
              <p className="text-xs text-teal-600 mt-2">
                {profile?.isVerified ? "Ready for bookings" : "Waiting for approval"}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
              <Calendar size={22} className="text-blue-600" />
            </div>
          </div>
        </div>

        {/* Average Rating */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-500 mb-2">Average Rating</p>
              <p className="text-3xl font-bold text-gray-900">
                {Number(profile?.ratingAverage || 0).toFixed(1)}
              </p>
              <p className="text-xs text-gray-400 mt-2">Based on reviews</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center shrink-0">
              <Star size={22} className="text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Total Sessions */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-500 mb-2">Total Sessions</p>
              <p className="text-3xl font-bold text-gray-900">
                {profile?.totalInterviews || "0"}
              </p>
              <p className="text-xs text-gray-400 mt-2">Completed interviews</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
              <Users size={22} className="text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-3 gap-8">
        {/* Left Column - Sessions */}
        <div className="col-span-2 space-y-8">
          {/* Upcoming Sessions */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Sessions</h2>
              <Link
                href="/interviewer/schedule"
                className="text-sm text-gray-600 hover:text-gray-900 border border-gray-300 px-4 py-2 rounded-lg"
              >
                Manage Schedule
              </Link>
            </div>

            <div className="divide-y divide-gray-100">
              {upcomingList.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No upcoming sessions or pending requests.
                </div>
              ) : (
                upcomingList.map((session) => (
                  <div key={session.id} className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div
                        className={`w-12 h-12 ${session.avatarBg} rounded-full flex items-center justify-center shrink-0`}
                      >
                        <span className={`font-semibold ${session.avatarColor}`}>
                          {session.avatar}
                        </span>
                      </div>

                      {/* Details */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {session.candidateName}
                            </h3>
                            <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                              <span className="flex items-center gap-1">
                                <Calendar size={14} />
                                {session.date}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock size={14} />
                                {session.time}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-teal-600">
                              LKR {session.price.toLocaleString()}
                            </p>
                            <span
                              className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full mt-1 ${
                                session.status === "scheduled" || session.status === "rescheduled"
                                  ? "bg-green-50 text-green-600"
                                  : session.status === "pending"
                                  ? "bg-yellow-50 text-yellow-600"
                                  : "bg-orange-50 text-orange-600"
                              }`}
                            >
                              {session.status === "scheduled" || session.status === "rescheduled" ? (
                                <CheckCircle size={12} />
                              ) : (
                                <AlertCircle size={12} />
                              )}
                              {session.status === "scheduled" || session.status === "rescheduled"
                                ? "Confirmed"
                                : session.status === "pending"
                                ? "Awaiting Confirmation"
                                : session.status}
                            </span>
                          </div>
                        </div>

                        {/* Notes */}
                        {session.notes && (
                          <div className="bg-yellow-50 rounded-lg p-3 mb-3 text-sm text-yellow-800">
                            <strong>Candidate Note:</strong> {session.notes}
                          </div>
                        )}

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {session.tags.map((tag: any, i: number) => (
                            <span
                              key={i}
                              className="text-xs px-3 py-1 bg-gray-100 text-gray-600 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          {session.status === "pending" ? (
                            <>
                              <button
                                onClick={() => handleAcceptSession(session.id)}
                                className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                              >
                                Accept Request
                              </button>
                              <button
                                onClick={() => handleDeclineSession(session.id)}
                                className="border border-red-200 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-medium"
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
                                  className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                                >
                                  <Video size={16} />
                                  Join Session
                                </a>
                              ) : editingSessionId === session.id ? (
                                <div className="flex items-center gap-2">
                                  <input 
                                    type="url"
                                    placeholder="Paste meet link here..."
                                    value={tempLink}
                                    onChange={(e) => setTempLink(e.target.value)}
                                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    autoFocus
                                  />
                                  <button 
                                    onClick={() => handleSaveLink(session.id)}
                                    className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium"
                                  >
                                    Save
                                  </button>
                                  <button 
                                    onClick={() => { setEditingSessionId(null); setTempLink(""); }}
                                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button 
                                  onClick={() => { setEditingSessionId(session.id); setTempLink(""); }}
                                  className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition"
                                >
                                  <Video size={16} />
                                  + Add Meet Link
                                </button>
                              )}
                            </>
                          )}
                          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">
                            Contact
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Sessions */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Recent Sessions</h2>
              <p className="text-sm text-gray-500 mt-2">
                Your completed sessions and feedback
              </p>
            </div>

            <div className="divide-y divide-gray-100">
              {completedList.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No recent completed sessions.
                </div>
              ) : (
                completedList.map((session) => (
                  <div key={session.id} className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {session.candidateName}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {session.date} • {session.duration}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-yellow-400">🏆</span>
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className={
                                i < session.rating
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-gray-300"
                              }
                            />
                          ))}
                          <span className="text-sm text-gray-500 ml-1">
                            ({session.rating}/5)
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-teal-600">
                          +LKR {session.earnings.toLocaleString()}
                        </p>
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-green-50 text-green-600 rounded-full mt-1">
                          <CheckCircle size={12} />
                          Completed
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 italic">"{session.feedback}"</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Quick Actions, Performance, Earnings */}
        <div className="space-y-8">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-5">Quick Actions</h3>
            <div className="space-y-4">
              <Link
                href="/interviewer/schedule"
                className="flex items-center gap-3 w-full bg-teal-600 hover:bg-teal-700 text-white px-5 py-3.5 rounded-lg text-sm font-medium"
              >
                <Calendar size={18} />
                Update Availability
              </Link>
              <Link
                href="/interviewer/profile"
                className="flex items-center gap-3 w-full border border-gray-300 text-gray-700 hover:bg-gray-50 px-5 py-3.5 rounded-lg text-sm font-medium"
              >
                <Users size={18} />
                Update Profile
              </Link>
              <Link
                href="/interviewer/earnings"
                className="flex items-center gap-3 w-full border border-gray-300 text-gray-700 hover:bg-gray-50 px-5 py-3.5 rounded-lg text-sm font-medium"
              >
                <DollarSign size={18} />
                View Earnings
              </Link>
            </div>
          </div>

          {/* Performance */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-5">Performance</h3>
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">Session Completion</span>
                  <span className="font-semibold text-gray-900">96%</span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full w-[96%] bg-green-500 rounded-full"></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">Avg Response Time</span>
                  <span className="font-semibold text-gray-900">2h</span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full w-[40%] bg-blue-500 rounded-full"></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">Candidate Satisfaction</span>
                  <span className="font-semibold text-gray-900">4.8/5.0</span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full w-[96%] bg-yellow-500 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Earnings Overview */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-5">Earnings Overview</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-1">
                <span className="text-sm text-gray-600">Total Earnings</span>
                <span className="font-bold text-gray-900">LKR 245,000</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-sm text-gray-600">This Month</span>
                <span className="font-bold text-green-600">LKR 85,000</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-sm text-gray-600">Pending Payout</span>
                <span className="font-bold text-red-500">LKR 24,000</span>
              </div>

              <button className="w-full mt-4 border border-gray-300 text-gray-700 hover:bg-gray-50 px-5 py-3 rounded-lg text-sm font-medium">
                Request Payout
              </button>
            </div>
          </div>
        </div>
      </div>
      </>
      )}
    </div>
  );
}
