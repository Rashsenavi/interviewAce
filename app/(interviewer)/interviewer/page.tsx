"use client";

import { useAuth } from "@/lib/context/AuthContext";
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
  const userName = user?.firstName || "";

  return (
    <div className="w-full">
      {/* Welcome Section */}
      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        Welcome back, {userName}! 👋
      </h1>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-6 mb-10">
        {/* This Month Earnings */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-500 mb-2">This Month</p>
              <p className="text-2xl font-bold text-gray-900 truncate">LKR 85,000</p>
              <p className="text-xs text-gray-400 mt-2">from last month</p>
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
              <p className="text-sm text-gray-500 mb-2">Upcoming Sessions</p>
              <p className="text-3xl font-bold text-gray-900">8</p>
              <p className="text-xs text-teal-600 mt-2">Next: Today 2:00 PM</p>
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
              <p className="text-3xl font-bold text-gray-900">4.8</p>
              <p className="text-xs text-gray-400 mt-2">42 reviews</p>
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
              <p className="text-3xl font-bold text-gray-900">47</p>
              <p className="text-xs text-gray-400 mt-2">96% completion</p>
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
              {upcomingSessions.map((session) => (
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
                              session.status === "confirmed"
                                ? "bg-green-50 text-green-600"
                                : "bg-orange-50 text-orange-600"
                            }`}
                          >
                            {session.status === "confirmed" ? (
                              <CheckCircle size={12} />
                            ) : (
                              <AlertCircle size={12} />
                            )}
                            {session.status === "confirmed" ? "Confirmed" : "Pending"}
                          </span>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {session.tags.map((tag, i) => (
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
                        <button className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                          <Video size={16} />
                          Join Session
                        </button>
                        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">
                          Contact
                        </button>
                        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">
                          Reschedule
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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
              {recentSessions.map((session) => (
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
              ))}
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
    </div>
  );
}
