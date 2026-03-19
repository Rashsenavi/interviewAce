"use client";

import Link from "next/link";
import { Clock, Mail, CheckCircle, ArrowLeft } from "lucide-react";

export default function VerificationPendingPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-100 text-amber-600 rounded-full mb-6">
            <Clock size={40} />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Verification Pending
          </h1>

          {/* Description */}
          <p className="text-gray-600 mb-8">
            Thank you for registering as an interviewer! Your account is currently under review by our admin team.
          </p>

          {/* Steps */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
            <h3 className="font-semibold text-gray-800 mb-4">What happens next?</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                  <CheckCircle size={14} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Account Created</p>
                  <p className="text-xs text-gray-500">Your profile has been submitted</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
                  <Clock size={14} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Under Review</p>
                  <p className="text-xs text-gray-500">Admin team is reviewing your credentials</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-gray-200 text-gray-400 rounded-full flex items-center justify-center">
                  <Mail size={14} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email Notification</p>
                  <p className="text-xs text-gray-400">You'll receive an email once approved</p>
                </div>
              </div>
            </div>
          </div>

          {/* Info box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-700 text-sm">
              Review typically takes <strong>24-48 hours</strong>. Make sure to check your email (including spam folder) for updates.
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Link
              href="/"
              className="inline-flex items-center justify-center w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold"
            >
              <ArrowLeft size={18} className="mr-2" />
              Back to Home
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center w-full px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold"
            >
              Go to Login
            </Link>
          </div>
        </div>

        {/* Footer text */}
        <p className="mt-6 text-sm text-gray-500">
          Questions? Contact us at{" "}
          <a href="mailto:support@interviewace.com" className="text-purple-600 hover:underline">
            support@interviewace.com
          </a>
        </p>
      </div>
    </div>
  );
}
