"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { apiClient } from "@/lib/api/client";
import Link from "next/link";
import { Calendar, Clock, DollarSign, Star, Users } from "lucide-react";

type SessionStatus = "scheduled" | "rescheduled" | "in_progress" | "completed" | "cancelled" | "no_show";

type SessionItem = {
  id: number;
  sessionType: string;
  scheduledDate: string;
  duration: number;
  sessionStatus: SessionStatus;
  priceAmount: number;
  jobSeeker: {
    firstName: string;
    lastName: string;
    university: string | null;
  };
};

type StatsResponse = {
  stats: {
    totalSessions: number;
    completedSessions: number;
    upcomingSessions: number;
    cancelledSessions: number;
  };
};

type ProfileResponse = {
  profile: {
    ratingAverage: number;
    totalInterviews: number;
    hourlyRate: number;
  };
};

function formatDateTime(value: string) {
  const date = new Date(value);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function InterviewerDashboardPage() {
  const { user } = useAuth();
  const userName = user?.firstName || "";

  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [stats, setStats] = useState<StatsResponse["stats"] | null>(null);
  const [profile, setProfile] = useState<ProfileResponse["profile"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError(null);

      const [sessionsRes, statsRes, profileRes] = await Promise.all([
        apiClient.get<{ sessions: SessionItem[] }>("/sessions"),
        apiClient.get<StatsResponse>("/sessions/stats"),
        apiClient.get<ProfileResponse>("/interviewers/profile"),
      ]);

      if (!sessionsRes.success || !statsRes.success || !profileRes.success) {
        setError(
          sessionsRes.error?.message ||
            statsRes.error?.message ||
            profileRes.error?.message ||
            "Failed to load dashboard data."
        );
        setLoading(false);
        return;
      }

      setSessions(sessionsRes.data?.sessions || []);
      setStats(statsRes.data?.stats || null);
      setProfile(profileRes.data?.profile || null);
      setLoading(false);
    };

    loadDashboard();
  }, []);

  const upcomingSessions = useMemo(
    () =>
      sessions
        .filter((s) => ["scheduled", "rescheduled", "in_progress"].includes(s.sessionStatus))
        .slice(0, 5),
    [sessions]
  );

  const recentCompleted = useMemo(
    () => sessions.filter((s) => s.sessionStatus === "completed").slice(0, 5),
    [sessions]
  );

  const monthlyEarnings = useMemo(() => {
    const now = new Date();
    return sessions
      .filter((s) => {
        const date = new Date(s.scheduledDate);
        return (
          s.sessionStatus === "completed" &&
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear()
        );
      })
      .reduce((sum, s) => sum + s.priceAmount, 0);
  }, [sessions]);

  if (loading) {
    return <p className="text-gray-600">Loading dashboard...</p>;
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Welcome back, {userName}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">This Month Earnings</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">LKR {monthlyEarnings.toLocaleString()}</p>
          <DollarSign className="w-5 h-5 text-emerald-600 mt-3" />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Upcoming Sessions</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.upcomingSessions ?? 0}</p>
          <Calendar className="w-5 h-5 text-blue-600 mt-3" />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Average Rating</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{Number(profile?.ratingAverage || 0).toFixed(1)}</p>
          <Star className="w-5 h-5 text-amber-500 mt-3" />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Total Sessions</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.totalSessions ?? profile?.totalInterviews ?? 0}</p>
          <Users className="w-5 h-5 text-purple-600 mt-3" />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <section className="bg-white rounded-xl border border-gray-200">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Upcoming Sessions</h2>
            <Link href="/interviewer/sessions" className="text-sm text-blue-700 hover:underline">
              View all
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {upcomingSessions.length === 0 && (
              <p className="p-5 text-sm text-gray-500">No upcoming sessions.</p>
            )}
            {upcomingSessions.map((session) => (
              <div key={session.id} className="p-5">
                <p className="font-medium text-gray-900">
                  {session.jobSeeker.firstName} {session.jobSeeker.lastName}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {session.sessionType} • {formatDateTime(session.scheduledDate)}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-xl border border-gray-200">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recent Completed</h2>
            <Link href="/interviewer/sessions" className="text-sm text-blue-700 hover:underline">
              View all
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentCompleted.length === 0 && (
              <p className="p-5 text-sm text-gray-500">No completed sessions yet.</p>
            )}
            {recentCompleted.map((session) => (
              <div key={session.id} className="p-5 flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-gray-900">
                    {session.jobSeeker.firstName} {session.jobSeeker.lastName}
                  </p>
                  <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {formatDateTime(session.scheduledDate)}
                  </p>
                </div>
                <p className="font-semibold text-emerald-700">LKR {session.priceAmount.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
