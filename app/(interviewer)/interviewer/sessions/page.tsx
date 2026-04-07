"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  CheckCircle,
  Clock,
  Search,
  XCircle,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { apiClient } from "@/lib/api/client";

type SessionStatus = "scheduled" | "rescheduled" | "in_progress" | "completed" | "cancelled" | "no_show";

type SessionItem = {
  id: number;
  sessionType: string;
  scheduledDate: string;
  duration: number;
  meetingLink: string | null;
  sessionStatus: SessionStatus;
  priceAmount: number;
  notes: string | null;
  jobSeeker: {
    firstName: string;
    lastName: string;
    university: string | null;
    fieldOfStudy: string | null;
  };
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function statusBadge(status: SessionStatus) {
  if (status === "scheduled" || status === "rescheduled" || status === "in_progress") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
        <CheckCircle className="w-3 h-3" />
        {status === "scheduled" ? "Scheduled" : status === "rescheduled" ? "Rescheduled" : "In progress"}
      </span>
    );
  }

  if (status === "completed") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
        <CheckCircle className="w-3 h-3" />
        Completed
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-700 rounded-full text-xs font-medium">
      <XCircle className="w-3 h-3" />
      {status === "cancelled" ? "Cancelled" : "No show"}
    </span>
  );
}

export default function InterviewerSessionsPage() {
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"upcoming" | "past" | "all">("upcoming");
  const [processingId, setProcessingId] = useState<number | null>(null);

  const loadSessions = async () => {
    setLoading(true);
    setError(null);

    const response = await apiClient.get<{ sessions: SessionItem[] }>("/sessions");

    if (!response.success || !response.data?.sessions) {
      setError(response.error?.message || "Failed to load sessions.");
      setLoading(false);
      return;
    }

    setSessions(response.data.sessions);
    setLoading(false);
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const filtered = useMemo(() => {
    const now = new Date();

    return sessions.filter((s) => {
      const name = `${s.jobSeeker.firstName} ${s.jobSeeker.lastName}`.toLowerCase();
      const matchesQuery =
        name.includes(query.toLowerCase()) ||
        (s.jobSeeker.university || "").toLowerCase().includes(query.toLowerCase()) ||
        s.sessionType.toLowerCase().includes(query.toLowerCase());

      const sessionDate = new Date(s.scheduledDate);

      if (tab === "upcoming") {
        return sessionDate >= now && ["scheduled", "rescheduled", "in_progress"].includes(s.sessionStatus) && matchesQuery;
      }

      if (tab === "past") {
        return (sessionDate < now || ["completed", "cancelled", "no_show"].includes(s.sessionStatus)) && matchesQuery;
      }

      return matchesQuery;
    });
  }, [query, sessions, tab]);

  const stats = useMemo(() => {
    const upcoming = sessions.filter((s) => ["scheduled", "rescheduled", "in_progress"].includes(s.sessionStatus)).length;
    const completed = sessions.filter((s) => s.sessionStatus === "completed").length;
    const cancelled = sessions.filter((s) => s.sessionStatus === "cancelled" || s.sessionStatus === "no_show").length;
    const earnings = sessions
      .filter((s) => s.sessionStatus === "completed")
      .reduce((sum, s) => sum + s.priceAmount, 0);

    return { upcoming, completed, cancelled, earnings };
  }, [sessions]);

  const updateStatus = async (id: number, status: SessionStatus) => {
    setProcessingId(id);

    const response = await apiClient.put(`/sessions/${id}/status`, {
      status,
    });

    setProcessingId(null);

    if (!response.success) {
      alert(response.error?.message || "Failed to update session status.");
      return;
    }

    await loadSessions();
  };

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Sessions</h1>
        <p className="text-gray-600">Manage your interview sessions using live backend data.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Upcoming</p>
          <p className="text-2xl font-bold text-gray-900">{stats.upcoming}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Completed</p>
          <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Cancelled</p>
          <p className="text-2xl font-bold text-gray-900">{stats.cancelled}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Completed Earnings</p>
          <p className="text-2xl font-bold text-gray-900">LKR {stats.earnings.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search candidate, university, session type"
              className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div className="flex rounded-lg border border-gray-300 overflow-hidden">
            {(["upcoming", "past", "all"] as const).map((item) => (
              <button
                key={item}
                onClick={() => setTab(item)}
                className={`px-4 py-2 text-sm ${tab === item ? "bg-gray-900 text-white" : "bg-white text-gray-700"}`}
              >
                {item[0].toUpperCase() + item.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading && <p className="text-gray-600">Loading sessions...</p>}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500">
          No sessions found for current filters.
        </div>
      )}

      <div className="space-y-4">
        {!loading && !error && filtered.map((session) => (
          <div key={session.id} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-gray-900">
                  {session.jobSeeker.firstName} {session.jobSeeker.lastName}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {session.jobSeeker.university || "University not provided"}
                </p>
                <p className="text-sm text-gray-500 mt-1">{session.sessionType}</p>
              </div>
              {statusBadge(session.sessionStatus)}
            </div>

            <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
              <span className="inline-flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(session.scheduledDate)}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatTime(session.scheduledDate)} ({session.duration} min)
              </span>
              <span className="font-medium text-emerald-700">LKR {session.priceAmount.toLocaleString()}</span>
            </div>

            {session.notes && <p className="mt-3 text-sm text-gray-600">Note: {session.notes}</p>}

            <div className="mt-4 flex flex-wrap gap-2">
              {session.meetingLink && (
                <a
                  href={session.meetingLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  Join
                </a>
              )}

              {(session.sessionStatus === "scheduled" || session.sessionStatus === "rescheduled") && (
                <button
                  onClick={() => updateStatus(session.id, "completed")}
                  disabled={processingId === session.id}
                  className="px-3 py-2 border border-green-300 text-green-700 rounded-lg text-sm disabled:opacity-50"
                >
                  Mark Completed
                </button>
              )}

              {session.sessionStatus !== "cancelled" && session.sessionStatus !== "completed" && (
                <button
                  onClick={() => updateStatus(session.id, "cancelled")}
                  disabled={processingId === session.id}
                  className="px-3 py-2 border border-red-300 text-red-700 rounded-lg text-sm disabled:opacity-50"
                >
                  Cancel
                </button>
              )}

              {processingId === session.id && (
                <span className="inline-flex items-center gap-1 text-sm text-amber-700">
                  <AlertCircle className="w-4 h-4" />
                  Updating...
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
