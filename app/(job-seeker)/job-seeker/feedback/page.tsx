"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Star,
  MessageSquare,
  Calendar,
  Clock,
  ChevronRight,
  Send,
  CheckCircle,
  X,
  ThumbsUp,
  Award,
  Target,
  Lightbulb,
} from "lucide-react";

interface PendingFeedback {
  id: string;
  sessionId: string;
  interviewerName: string;
  interviewerAvatar: string;
  interviewerAvatarBg: string;
  interviewerTitle: string;
  date: string;
  time: string;
  sessionType: string;
}

interface SubmittedFeedback {
  id: string;
  sessionId: string;
  interviewerName: string;
  interviewerAvatar: string;
  interviewerAvatarBg: string;
  date: string;
  rating: number;
  comment: string;
  submittedAt: string;
}

// Mock data
const pendingFeedbackData: PendingFeedback[] = [
  {
    id: "PF001",
    sessionId: "SES-20260208001",
    interviewerName: "Nuwan Perera",
    interviewerAvatar: "NP",
    interviewerAvatarBg: "bg-blue-500",
    interviewerTitle: "Senior Software Engineer at WSO2",
    date: "2026-02-08",
    time: "10:00",
    sessionType: "Mock Interview",
  },
  {
    id: "PF002",
    sessionId: "SES-20260205001",
    interviewerName: "Dilini Fernando",
    interviewerAvatar: "DF",
    interviewerAvatarBg: "bg-purple-500",
    interviewerTitle: "Tech Lead at Sysco LABS",
    date: "2026-02-05",
    time: "14:00",
    sessionType: "Career Coaching",
  },
];

const submittedFeedbackData: SubmittedFeedback[] = [
  {
    id: "SF001",
    sessionId: "SES-20260201001",
    interviewerName: "Kasun Silva",
    interviewerAvatar: "KS",
    interviewerAvatarBg: "bg-teal-500",
    date: "2026-02-01",
    rating: 5,
    comment: "Excellent session! Got very detailed feedback on my coding skills and system design approach. Highly recommended!",
    submittedAt: "2026-02-01",
  },
  {
    id: "SF002",
    sessionId: "SES-20260128001",
    interviewerName: "Amaya Jayawardena",
    interviewerAvatar: "AJ",
    interviewerAvatarBg: "bg-orange-500",
    date: "2026-01-28",
    rating: 4,
    comment: "Very helpful career advice. Learned a lot about the industry expectations.",
    submittedAt: "2026-01-28",
  },
];

export default function FeedbackPage() {
  const [activeTab, setActiveTab] = useState<"pending" | "submitted">("pending");
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<PendingFeedback | null>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const feedbackTags = [
    { id: "knowledgeable", label: "Knowledgeable", icon: Lightbulb },
    { id: "helpful", label: "Helpful", icon: ThumbsUp },
    { id: "professional", label: "Professional", icon: Award },
    { id: "actionable", label: "Actionable Feedback", icon: Target },
  ];

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

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    );
  };

  const handleSubmitFeedback = async () => {
    if (rating === 0) return;
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setShowFeedbackModal(false);
    setShowSuccessModal(true);
    setRating(0);
    setComment("");
    setSelectedTags([]);
    setSelectedSession(null);
  };

  const getRatingLabel = (r: number) => {
    switch (r) {
      case 1: return "Poor";
      case 2: return "Fair";
      case 3: return "Good";
      case 4: return "Very Good";
      case 5: return "Excellent";
      default: return "";
    }
  };

  return (
    <div className="w-full">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Feedback & Reviews</h1>
        <p className="text-gray-600">
          Share your experience and help other job seekers find the best interviewers
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{pendingFeedbackData.length}</p>
              <p className="text-sm text-gray-500">Pending Reviews</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{submittedFeedbackData.length}</p>
              <p className="text-sm text-gray-500">Reviews Given</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {(submittedFeedbackData.reduce((acc, f) => acc + f.rating, 0) / submittedFeedbackData.length).toFixed(1)}
              </p>
              <p className="text-sm text-gray-500">Avg Rating Given</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex gap-1 p-4 border-b border-gray-100">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "pending"
                ? "bg-blue-50 text-blue-700"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            Pending Reviews ({pendingFeedbackData.length})
          </button>
          <button
            onClick={() => setActiveTab("submitted")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "submitted"
                ? "bg-blue-50 text-blue-700"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            Submitted Reviews ({submittedFeedbackData.length})
          </button>
        </div>

        {/* Pending Reviews */}
        {activeTab === "pending" && (
          <div className="divide-y divide-gray-100">
            {pendingFeedbackData.length === 0 ? (
              <div className="p-12 text-center">
                <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
                <p className="text-gray-500">You have no pending reviews.</p>
              </div>
            ) : (
              pendingFeedbackData.map((feedback) => (
                <div key={feedback.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-14 h-14 ${feedback.interviewerAvatarBg} rounded-full flex items-center justify-center text-white font-semibold text-lg shrink-0`}
                    >
                      {feedback.interviewerAvatar}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900">{feedback.interviewerName}</h3>
                      <p className="text-sm text-gray-600 truncate">{feedback.interviewerTitle}</p>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(feedback.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatTime(feedback.time)}
                        </span>
                        <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                          {feedback.sessionType}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedSession(feedback);
                        setShowFeedbackModal(true);
                      }}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                    >
                      <Star className="w-4 h-4" />
                      Leave Review
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Submitted Reviews */}
        {activeTab === "submitted" && (
          <div className="divide-y divide-gray-100">
            {submittedFeedbackData.length === 0 ? (
              <div className="p-12 text-center">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
                <p className="text-gray-500">Your submitted reviews will appear here.</p>
              </div>
            ) : (
              submittedFeedbackData.map((feedback) => (
                <div key={feedback.id} className="p-6">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-14 h-14 ${feedback.interviewerAvatarBg} rounded-full flex items-center justify-center text-white font-semibold text-lg shrink-0`}
                    >
                      {feedback.interviewerAvatar}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">{feedback.interviewerName}</h3>
                          <p className="text-sm text-gray-500">{formatDate(feedback.date)}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-5 h-5 ${
                                i < feedback.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-700">{feedback.comment}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && selectedSession && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
              <h2 className="text-lg font-semibold text-gray-900">Leave a Review</h2>
              <button
                onClick={() => {
                  setShowFeedbackModal(false);
                  setSelectedSession(null);
                  setRating(0);
                  setComment("");
                  setSelectedTags([]);
                }}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Interviewer Info */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div
                  className={`w-12 h-12 ${selectedSession.interviewerAvatarBg} rounded-full flex items-center justify-center text-white font-semibold`}
                >
                  {selectedSession.interviewerAvatar}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedSession.interviewerName}</h3>
                  <p className="text-sm text-gray-600">{selectedSession.sessionType}</p>
                  <p className="text-xs text-gray-500">{formatDate(selectedSession.date)}</p>
                </div>
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  How was your experience? <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-10 h-10 ${
                          star <= (hoverRating || rating)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                  {(hoverRating || rating) > 0 && (
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      {getRatingLabel(hoverRating || rating)}
                    </span>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  What stood out? (optional)
                </label>
                <div className="flex flex-wrap gap-2">
                  {feedbackTags.map((tag) => {
                    const Icon = tag.icon;
                    const isSelected = selectedTags.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        onClick={() => toggleTag(tag.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isSelected
                            ? "bg-blue-100 text-blue-700 border-2 border-blue-300"
                            : "bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {tag.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Share your experience (optional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us about your session. What did you learn? How can the interviewer improve?"
                  className="w-full p-4 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={4}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Your review will be visible to other job seekers
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <button
                onClick={() => {
                  setShowFeedbackModal(false);
                  setSelectedSession(null);
                  setRating(0);
                  setComment("");
                  setSelectedTags([]);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitFeedback}
                disabled={rating === 0 || isSubmitting}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Review
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-sm p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Thank you!</h3>
            <p className="text-gray-600 mb-6">
              Your review has been submitted successfully. It helps other job seekers find the best
              interviewers.
            </p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
