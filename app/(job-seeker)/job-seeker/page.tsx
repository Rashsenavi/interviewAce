"use client";

import React from "react";
import Link from "next/link";
import {
  Calendar,
  Star,
  Video,
  Clock,
  ChevronRight,
  CalendarDays,
  Users,
} from "lucide-react";

// Mock data
const upcomingSessions = [
  {
    id: 1,
    interviewer: "Saman Kumara",
    role: "Senior Software Engineer at WSO2",
    date: "Jan 17, 2026",
    time: "2:00 PM",
    duration: "45 min",
    type: "Technical Interview",
    industry: "IT & Software",
    industryColor: "text-blue-600",
  },
  {
    id: 2,
    interviewer: "Nimal Perera",
    role: "HR Manager at Commercial Bank",
    date: "Jan 19, 2026",
    time: "10:00 AM",
    duration: "60 min",
    type: "Behavioral Interview",
    industry: "Banking",
    industryColor: "text-green-600",
  },
];

const recentFeedback = [
  {
    id: 1,
    interviewer: "Saman Kumara",
    company: "WSO2",
    date: "Jan 10, 2026",
    rating: 4.5,
    strengths: ["Strong technical knowledge", "Good problem-solving approach"],
    improvements: ["Work on communication clarity"],
  },
  {
    id: 2,
    interviewer: "Dilini Fernando",
    company: "Dialog Axiata",
    date: "Jan 8, 2026",
    rating: 4,
    strengths: ["Confident presentation", "Well-prepared"],
    improvements: ["Practice more behavioral questions"],
  },
];

const recommendedInterviewers = [
  {
    id: 1,
    name: "Ravindu Silva",
    role: "Tech Lead",
    company: "Dialog Axiata",
    rating: 4.9,
    reviews: 87,
    price: "LKR 5,000",
  },
  {
    id: 2,
    name: "Thilini Jayawardena",
    role: "Senior Consultant",
    company: "KPMG",
    rating: 4.8,
    reviews: 62,
    price: "LKR 7,500",
  },
];

export default function JobSeekerDashboardPage() {
  const userName = "Kasun";
  const profileCompletion = 75;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
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
        <div className="bg-linear-to-r from-blue-600 to-blue-500 rounded-xl p-5 flex items-center justify-between" style={{ marginBottom: '40px' }}>
          <div className="flex-1 mr-6">
            <p className="text-blue-100 text-xs mb-0.5">Profile Completion</p>
            <p className="text-white text-2xl font-bold mb-2">{profileCompletion}%</p>
            <div className="w-full max-w-md bg-blue-400/40 rounded-full h-1.5">
              <div
                className="bg-white rounded-full h-1.5"
                style={{ width: `${profileCompletion}%` }}
              ></div>
            </div>
          </div>
          <button className="bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors shrink-0">
            Complete Profile
          </button>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4" style={{ marginBottom: '40px' }}>
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
        <div className="grid grid-cols-4 gap-5" style={{ marginBottom: '20px' }}>
          <div className="border border-gray-200 rounded-xl p-5">
            <CalendarDays className="w-5 h-5 text-blue-500 mb-3" />
            <p className="text-2xl font-bold text-gray-900">12</p>
            <p className="text-xs text-gray-500 mt-1">Total Sessions</p>
          </div>
          <div className="border border-gray-200 rounded-xl p-5">
            <Star className="w-5 h-5 text-yellow-400 mb-3" />
            <p className="text-2xl font-bold text-gray-900">4.3</p>
            <p className="text-xs text-gray-500 mt-1">Average Rating</p>
          </div>
          <div className="border border-gray-200 rounded-xl p-5">
            <Video className="w-5 h-5 text-green-500 mb-3" />
            <p className="text-2xl font-bold text-gray-900">2</p>
            <p className="text-xs text-gray-500 mt-1">Upcoming Sessions</p>
          </div>
          <div className="border border-gray-200 rounded-xl p-5">
            <Clock className="w-5 h-5 text-orange-500 mb-3" />
            <p className="text-2xl font-bold text-gray-900">8.5</p>
            <p className="text-xs text-gray-500 mt-1">Hours Practiced</p>
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

        <div className="space-y-4">
          {upcomingSessions.map((session, index) => (
            <div
              key={session.id}
              className={`flex items-center justify-between pb-4 ${
                index !== upcomingSessions.length - 1 ? "border-b border-gray-100" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full overflow-hidden bg-linear-to-br from-gray-300 to-gray-400 shrink-0 flex items-center justify-center text-gray-600 font-semibold">
                  {session.interviewer.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">
                    {session.interviewer}
                  </h3>
                  <p className="text-xs text-gray-500">{session.role}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="w-3 h-3" />
                      {session.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {session.time} ({session.duration})
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {session.type}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className={`text-xs font-medium ${session.industryColor}`}>
                  {session.industry}
                </span>
                <button className="px-4 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                  Reschedule
                </button>
                <button className="text-red-500 text-sm font-medium hover:text-red-600">
                  Cancel
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Feedback Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Recent Feedback</h2>
          <Link
            href="/job-seeker/feedback"
            className="text-blue-600 text-sm font-medium hover:text-blue-700 flex items-center gap-1"
          >
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-5">
          {recentFeedback.map((feedback) => (
            <div
              key={feedback.id}
              className="border border-gray-200 rounded-xl p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">
                    {feedback.interviewer}
                  </h3>
                  <p className="text-xs text-gray-500">{feedback.company}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{feedback.date}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-orange-400 fill-orange-400" />
                  <span className="font-semibold text-gray-900 text-sm">
                    {feedback.rating}
                  </span>
                </div>
              </div>

              <div className="mb-3">
                <p className="text-xs font-medium text-green-600 flex items-center gap-1 mb-1">
                  <span>✓</span> Strengths
                </p>
                <ul className="text-xs text-gray-600 space-y-0.5 ml-1">
                  {feedback.strengths.map((s, i) => (
                    <li key={i}>• {s}</li>
                  ))}
                </ul>
              </div>

              <div className="mb-4">
                <p className="text-xs font-medium text-orange-500 flex items-center gap-1 mb-1">
                  <span>→</span> Areas to Improve
                </p>
                <ul className="text-xs text-gray-600 space-y-0.5 ml-1">
                  {feedback.improvements.map((s, i) => (
                    <li key={i}>• {s}</li>
                  ))}
                </ul>
              </div>

              <button className="w-full py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                View Details
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended for You Card */}
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

        <div className="grid grid-cols-2 gap-5">
          {recommendedInterviewers.map((interviewer) => (
            <div
              key={interviewer.id}
              className="border border-gray-200 rounded-xl p-5 text-center"
            >
              {/* Avatar */}
              <div className="w-20 h-20 rounded-full overflow-hidden bg-linear-to-br from-gray-300 to-gray-400 mx-auto mb-3 flex items-center justify-center text-gray-600 font-semibold text-xl">
                {interviewer.name.split(' ').map(n => n[0]).join('')}
              </div>
              <h3 className="font-semibold text-gray-900">{interviewer.name}</h3>
              <p className="text-xs text-gray-500">{interviewer.role}</p>
              <p className="text-xs text-blue-600 font-medium mt-0.5">
                {interviewer.company}
              </p>

              <div className="flex items-center justify-center gap-2 mt-3 text-xs">
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
                  <span className="font-semibold">{interviewer.rating}</span>
                </div>
                <span className="text-gray-400">•</span>
                <span className="text-gray-500">{interviewer.reviews} reviews</span>
              </div>

              <p className="text-base font-bold text-gray-900 mt-2">
                {interviewer.price}
              </p>

              <button className="w-full mt-4 py-2.5 bg-linear-to-r from-blue-600 to-blue-500 text-white rounded-xl text-sm font-medium hover:from-blue-700 hover:to-blue-600 transition-all">
                Book Now
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Your Progress Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Your Progress</h2>
        <div className="h-48 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 text-sm">
          Progress chart will be displayed here
        </div>
      </div>
    </div>
  );
}
