"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle,
  Calendar,
  Clock,
  Video,
  User,
  Download,
  Mail,
  ArrowRight,
  FileText,
  Bell,
} from "lucide-react";
import { Suspense } from "react";

function BookingConfirmationContent() {
  const searchParams = useSearchParams();
  
  const interviewer = searchParams.get("interviewer") || "Kasun Perera";
  const date = searchParams.get("date") || new Date().toISOString().split("T")[0];
  const time = searchParams.get("time") || "10:00";
  const type = searchParams.get("type") || "mock";
  const price = searchParams.get("price") || "5000";

  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formattedTime = parseInt(time.split(":")[0]) < 12 
    ? `${time} AM` 
    : parseInt(time.split(":")[0]) === 12 
    ? `${time} PM` 
    : `${parseInt(time.split(":")[0]) - 12}:00 PM`;

  // Generate a mock booking ID
  const bookingId = `INT-${Date.now().toString().slice(-8)}`;

  return (
    <div className="max-w-2xl mx-auto py-8">
      {/* Success Animation */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Booking Confirmed! 🎉
        </h1>
        <p className="text-gray-600">
          Your interview session has been successfully scheduled
        </p>
      </div>

      {/* Booking Details Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6">
        <div className="bg-linear-to-r from-blue-600 to-blue-700 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm mb-1">Booking Reference</p>
              <p className="text-2xl font-bold">{bookingId}</p>
            </div>
            <div className="text-right">
              <p className="text-blue-100 text-sm mb-1">Amount Paid</p>
              <p className="text-2xl font-bold">LKR {parseInt(price).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Interviewer Info */}
          <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
              {interviewer.split(" ").map((n) => n[0]).join("")}
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Interview with</p>
              <p className="text-xl font-semibold text-gray-900">{interviewer}</p>
              <p className="text-gray-600">
                {type === "mock" ? "Mock Interview Session" : "Career Coaching Session"}
              </p>
            </div>
          </div>

          {/* Session Details */}
          <div className="grid grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-semibold text-gray-900">{formattedDate}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Time</p>
                <p className="font-semibold text-gray-900">{formattedTime}</p>
                <p className="text-xs text-gray-500">Duration: 60 minutes</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Video className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Platform</p>
                <p className="font-semibold text-gray-900">Google Meet</p>
                <p className="text-xs text-gray-500">Link will be sent via email</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Session Type</p>
                <p className="font-semibold text-gray-900">
                  {type === "mock" ? "Mock Interview" : "Career Coaching"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* What's Next */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">What's Next?</h2>
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0">
              <span className="text-green-600 font-semibold text-sm">1</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">Confirmation Email Sent</p>
              <p className="text-sm text-gray-600">
                Check your inbox for booking details and calendar invite
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
              <span className="text-blue-600 font-semibold text-sm">2</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">Prepare for Your Session</p>
              <p className="text-sm text-gray-600">
                Review common interview questions and practice beforehand
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
              <span className="text-purple-600 font-semibold text-sm">3</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">Join 10 Minutes Early</p>
              <p className="text-sm text-gray-600">
                Test your audio/video and be ready to make the most of your session
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Reminder Box */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <Bell className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <p className="font-medium text-yellow-800">Reminder Set</p>
            <p className="text-sm text-yellow-700">
              You'll receive a reminder email 24 hours and 1 hour before your session.
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/job-seeker/sessions"
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
        >
          View My Sessions
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          href="/job-seeker/interviewers"
          className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 py-3 rounded-lg font-semibold text-center"
        >
          Book Another Session
        </Link>
      </div>

      {/* Need Help */}
      <div className="text-center mt-8 pt-6 border-t border-gray-200">
        <p className="text-gray-600 text-sm">
          Need to reschedule or cancel?{" "}
          <Link href="/job-seeker/sessions" className="text-blue-600 hover:underline font-medium">
            Manage your booking
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function BookingConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="max-w-2xl mx-auto py-8 text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading confirmation...</p>
      </div>
    }>
      <BookingConfirmationContent />
    </Suspense>
  );
}
