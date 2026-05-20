"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Star,
  Video,
  Clock,
  ChevronRight,
  CalendarDays,
  Users,
  CheckCircle,
  Briefcase,
} from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { sessionApi, interviewerApi } from "@/lib/api";

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

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function JobSeekerDashboardPage() {
  const { user } = useAuth();
  const userName = user?.firstName || "Candidate";

  const [stats, setStats] = useState<SessionStats | null>(null);
  const [upcomingSessions, setUpcomingSessions] = useState<SessionData[]>([]);
  const [recommendedInterviewers, setRecommendedInterviewers] = useState<RecommendedInterviewer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [statsRes, sessionsRes, interviewersRes] = await Promise.all([
          sessionApi.getStats(),
          sessionApi.getAll({ upcoming: true }),
          interviewerApi.getAll({ isVerified: true, sortBy: "rating", sortOrder: "desc" }),
        ]);

        if (statsRes.success && statsRes.data?.stats) {
          setStats(statsRes.data.stats);
        }
        if (sessionsRes.success && sessionsRes.data?.sessions) {
          setUpcomingSessions((sessionsRes.data.sessions as SessionData[]).slice(0, 2));
        }
        if (interviewersRes.success && interviewersRes.data?.interviewers) {
          setRecommendedInterviewers(
            (interviewersRes.data.interviewers as RecommendedInterviewer[]).slice(0, 2)
          );
        }
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  // Calculate profile completion
  const profileFields = [
    user?.firstName,
    user?.lastName,
    user?.email,
    // phoneNumber, university, etc. can be added once profile API is used
  ];
  const profileCompletion = Math.round(
    (profileFields.filter(Boolean).length / profileFields.length) * 100
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
      {/* Welcome + Profile + Buttons + Stats Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
        {/* Welcome Header */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back, {userName}! 👋
        </h1>
        <p className="text-gray-500 text-sm mb-8">
          Here&apos;s your interview preparation progress
        </p>

        {/* Profile Progress Bar */}
        <div
          className="bg-linear-to-r from-blue-600 to-blue-500 rounded-xl p-5 flex items-center justify-between"
          style={{ marginBottom: "40px" }}
        >
          <div className="flex-1 mr-6">
            <p className="text-blue-100 text-xs mb-0.5">Profile Completion</p>
            <p className="text-white text-2xl font-bold mb-2">{profileCompletion}%</p>
            <div className="w-full max-w-md bg-blue-400/40 rounded-full h-1.5">
              <div
                className="bg-white rounded-full h-1.5 transition-all duration-700"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
          </div>
          <Link
            href="/job-seeker/settings"
            className="bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors shrink-0"
          >
            Complete Profile
          </Link>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4" style={{ marginBottom: "40px" }}>
          <Link
            href="/job-seeker/interviewers"
            className="flex items-center justify-center gap-2 bg-linear-to-r from-orange-500 to-orange-400 text-white py-3 rounded-xl font-medium hover:from-orange-600 hover:to-orange-500 transition-all text-sm"
          >
            <Calendar className="w-4 h-4" />
            Book Interview
          </Link>
          <Link
            href="/job-seeker/questions"
            className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors text-sm"
          >
            <Users className="w-4 h-4" />
            Practice Questions
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-5" style={{ marginBottom: "20px" }}>
          <div className="border border-gray-200 rounded-xl p-5">
            <CalendarDays className="w-5 h-5 text-blue-500 mb-3" />
            <p className="text-2xl font-bold text-gray-900">
              {loading ? "—" : stats?.totalSessions ?? 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">Total Sessions</p>
          </div>
          <div className="border border-gray-200 rounded-xl p-5">
            <Star className="w-5 h-5 text-yellow-400 mb-3" />
            <p className="text-2xl font-bold text-gray-900">
              {loading ? "—" : stats?.completedSessions ?? 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">Completed</p>
          </div>
          <div className="border border-gray-200 rounded-xl p-5">
            <Video className="w-5 h-5 text-green-500 mb-3" />
            <p className="text-2xl font-bold text-gray-900">
              {loading ? "—" : stats?.upcomingSessions ?? 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">Upcoming Sessions</p>
          </div>
          <div className="border border-gray-200 rounded-xl p-5">
            <Clock className="w-5 h-5 text-orange-500 mb-3" />
            <p className="text-2xl font-bold text-gray-900">
              {loading ? "—" : stats?.cancelledSessions ?? 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">Cancelled</p>
          </div>
        </div>
      </div>

      {/* Upcoming Sessions Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Upcoming Sessions</h2>
          <Link
            href="/job-seeker/sessions"
            className="text-blue-600 text-sm font-medium hover:text-blue-700 flex items-center gap-1"
          >
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-400 text-sm">Loading sessions…</div>
        ) : upcomingSessions.length === 0 ? (
          <div className="text-center py-10">
            <CalendarDays className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 text-sm mb-4">No upcoming sessions.</p>
            <Link
              href="/job-seeker/interviewers"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              <Calendar className="w-4 h-4" />
              Book your first session
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingSessions.map((session, index) => (
              <div
                key={session.id}
                className={`flex items-center justify-between pb-4 ${
                  index !== upcomingSessions.length - 1 ? "border-b border-gray-100" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-linear-to-br from-blue-400 to-blue-600 shrink-0 flex items-center justify-center text-white font-semibold">
                    {session.interviewer.firstName[0]}{session.interviewer.lastName[0]}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-1">
                      {session.interviewer.firstName} {session.interviewer.lastName}
                      {session.interviewer.isVerified && (
                        <CheckCircle className="w-3.5 h-3.5 text-blue-500" />
                      )}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {session.interviewer.jobTitle} at {session.interviewer.currentCompany}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="w-3 h-3" />
                        {formatDate(session.scheduledDate)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(session.scheduledDate)} ({session.duration} min)
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {SESSION_TYPE_LABELS[session.sessionType] || session.sessionType}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-xs font-medium text-blue-600">IT & Software</span>
                  <Link
                    href="/job-seeker/sessions"
                    className="px-4 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Manage
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recommended Interviewers Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Recommended for You</h2>
          <Link
            href="/job-seeker/interviewers"
            className="text-blue-600 text-sm font-medium hover:text-blue-700 flex items-center gap-1"
          >
            Browse All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-400 text-sm">Loading interviewers…</div>
        ) : recommendedInterviewers.length === 0 ? (
          <div className="text-center py-10">
            <Users className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 text-sm mb-4">No verified interviewers available yet.</p>
            <Link
              href="/job-seeker/interviewers"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              Browse Interviewers
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-5">
            {recommendedInterviewers.map((interviewer) => (
              <div
                key={interviewer.id}
                className="border border-gray-200 rounded-xl p-5 text-center"
              >
                <div className="w-20 h-20 rounded-full overflow-hidden bg-linear-to-br from-blue-400 to-blue-600 mx-auto mb-3 flex items-center justify-center text-white font-semibold text-xl">
                  {interviewer.firstName[0]}{interviewer.lastName[0]}
                </div>
                <h3 className="font-semibold text-gray-900 flex items-center justify-center gap-1">
                  {interviewer.firstName} {interviewer.lastName}
                  {interviewer.isVerified && (
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                  )}
                </h3>
                <p className="text-xs text-gray-500">{interviewer.jobTitle}</p>
                <p className="text-xs text-blue-600 font-medium mt-0.5 flex items-center justify-center gap-1">
                  <Briefcase className="w-3 h-3" />
                  {interviewer.currentCompany}
                </p>

                <div className="flex items-center justify-center gap-2 mt-3 text-xs">
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
                    <span className="font-semibold">{interviewer.ratingAverage.toFixed(1)}</span>
                  </div>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-500">{interviewer.totalInterviews} sessions</span>
                </div>

                <p className="text-base font-bold text-gray-900 mt-2">
                  LKR {Math.round(interviewer.hourlyRate).toLocaleString()}
                </p>

                <Link
                  href={`/job-seeker/interviewers/${interviewer.userId}`}
                  className="block w-full mt-4 py-2.5 bg-linear-to-r from-blue-600 to-blue-500 text-white rounded-xl text-sm font-medium hover:from-blue-700 hover:to-blue-600 transition-all"
                >
                  Book Now
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* IT Roles CTA */}
      <div className="bg-linear-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
        <h2 className="text-xl font-bold mb-2">Preparing for an IT Interview?</h2>
        <p className="text-blue-100 mb-6">
          We have verified experts across SE, QA, PM, DevOps and more — ready to help you land your dream role.
        </p>
        <div className="flex flex-wrap gap-2 mb-6">
          {["Software Engineer", "Product Manager", "QA Engineer", "DevOps", "Data Engineer", "Tech Lead"].map((role) => (
            <span
              key={role}
              className="px-3 py-1 bg-white/20 text-white rounded-full text-xs font-medium"
            >
              {role}
            </span>
          ))}
        </div>
        <Link
          href="/job-seeker/interviewers"
          className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
        >
          Browse Verified Interviewers
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
