"use client";

import { useEffect, useState } from "react";
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
import { feedbackApi } from "@/lib/api";
import { useAuth } from "@/lib/context/AuthContext";

interface PendingSession {
  sessionId: number;
  sessionType: string;
  scheduledDate: string;
  duration: number;
  priceAmount: number;
  interviewer: {
    userId: number;
    firstName: string;
    lastName: string;
    jobTitle: string;
    company: string;
  };
}

interface SubmittedFeedback {
  id: number;
  sessionId: number;
  ratingOverall: number | null;
  writtenFeedback: string | null;
  strengthsIdentified: string | null;
  wouldRecommend: boolean | null;
  createdAt: string;
  session: { type: string; date: string };
  interviewer: {
    userId: number;
    firstName: string;
    lastName: string;
    jobTitle: string;
    company: string;
  };
}

const FEEDBACK_TAGS = [
  { id: "knowledgeable", label: "Knowledgeable", icon: Lightbulb },
  { id: "helpful", label: "Helpful", icon: ThumbsUp },
  { id: "professional", label: "Professional", icon: Award },
  { id: "actionable", label: "Actionable Feedback", icon: Target },
];

const SESSION_TYPE_LABELS: Record<string, string> = {
  behavioral: "Behavioral Interview",
  technical: "Technical Interview",
  case_study: "Case Study",
  mixed: "Mixed Interview",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getRatingLabel(r: number) {
  return ["", "Poor", "Fair", "Good", "Very Good", "Excellent"][r] || "";
}

export default function FeedbackPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"pending" | "submitted">("pending");
  const [pending, setPending] = useState<PendingSession[]>([]);
  const [submitted, setSubmitted] = useState<SubmittedFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<PendingSession | null>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [pendingRes, submittedRes] = await Promise.all([
        feedbackApi.getPending(),
        feedbackApi.getSubmitted(),
      ]);

      if (pendingRes.success && pendingRes.data?.pending) {
        setPending(pendingRes.data.pending as PendingSession[]);
      }
      if (submittedRes.success && submittedRes.data?.submitted) {
        setSubmitted(submittedRes.data.submitted as SubmittedFeedback[]);
      }
    } catch {
      setError("Failed to load feedback data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    );
  };

  const handleSubmitFeedback = async () => {
    if (!selectedSession || rating === 0 || !user) return;
    setIsSubmitting(true);

    try {
      const res = await feedbackApi.submit({
        sessionId: selectedSession.sessionId,
        feedbackForUserId: selectedSession.interviewer.userId,
        feedbackType: "seeker_to_interviewer",
        ratingOverall: rating,
        writtenFeedback: comment || undefined,
        strengthsIdentified: selectedTags.length > 0 ? selectedTags.join(", ") : undefined,
        wouldRecommend: wouldRecommend ?? undefined,
      });

      if (res.success) {
        setShowFeedbackModal(false);
        setShowSuccessModal(true);
        // Refresh data
        await loadData();
        // Reset form
        setRating(0);
        setComment("");
        setSelectedTags([]);
        setWouldRecommend(null);
        setSelectedSession(null);
      } else {
        alert(res.error?.message || "Failed to submit feedback");
      }
    } catch {
      alert("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const avgRatingGiven =
    submitted.length > 0
      ? submitted.reduce((acc, f) => acc + (f.ratingOverall ?? 0), 0) / submitted.length
      : 0;

  return (
    <div className="w-full">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Feedback & Reviews</h1>
        <p className="text-gray-600">
          Share your experience and help other job seekers find the best interviewers
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? "—" : pending.length}
              </p>
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
              <p className="text-2xl font-bold text-gray-900">
                {loading ? "—" : submitted.length}
              </p>
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
                {loading ? "—" : submitted.length > 0 ? avgRatingGiven.toFixed(1) : "—"}
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
            Pending Reviews ({loading ? "…" : pending.length})
          </button>
          <button
            onClick={() => setActiveTab("submitted")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "submitted"
                ? "bg-blue-50 text-blue-700"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            Submitted Reviews ({loading ? "…" : submitted.length})
          </button>
        </div>

        {/* Pending Reviews */}
        {activeTab === "pending" && (
          <div className="divide-y divide-gray-100">
            {loading ? (
              <div className="p-8 text-center text-gray-400 text-sm">Loading…</div>
            ) : pending.length === 0 ? (
              <div className="p-12 text-center">
                <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
                <p className="text-gray-500">You have no pending reviews.</p>
              </div>
            ) : (
              pending.map((session) => (
                <div key={session.sessionId} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-lg shrink-0">
                      {session.interviewer.firstName[0]}{session.interviewer.lastName[0]}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900">
                        {session.interviewer.firstName} {session.interviewer.lastName}
                      </h3>
                      <p className="text-sm text-gray-600 truncate">
                        {session.interviewer.jobTitle} at {session.interviewer.company}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(session.scheduledDate)}
                        </span>
                        <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                          {SESSION_TYPE_LABELS[session.sessionType] || session.sessionType}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedSession(session);
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
            {loading ? (
              <div className="p-8 text-center text-gray-400 text-sm">Loading…</div>
            ) : submitted.length === 0 ? (
              <div className="p-12 text-center">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
                <p className="text-gray-500">Your submitted reviews will appear here.</p>
              </div>
            ) : (
              submitted.map((fb) => (
                <div key={fb.id} className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-lg shrink-0">
                      {fb.interviewer.firstName[0]}{fb.interviewer.lastName[0]}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {fb.interviewer.firstName} {fb.interviewer.lastName}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {fb.interviewer.jobTitle} at {fb.interviewer.company}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {formatDate(fb.session.date)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-5 h-5 ${
                                i < (fb.ratingOverall ?? 0)
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                          {fb.ratingOverall && (
                            <span className="ml-1 text-sm font-medium text-gray-700">
                              {getRatingLabel(fb.ratingOverall)}
                            </span>
                          )}
                        </div>
                      </div>

                      {fb.strengthsIdentified && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {fb.strengthsIdentified.split(", ").map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {fb.writtenFeedback && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-gray-700 text-sm">{fb.writtenFeedback}</p>
                        </div>
                      )}

                      {fb.wouldRecommend !== null && (
                        <p className="text-xs text-gray-500 mt-2">
                          {fb.wouldRecommend ? "✓ Would recommend" : "✗ Would not recommend"}
                        </p>
                      )}
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
                  setWouldRecommend(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Interviewer Info */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {selectedSession.interviewer.firstName[0]}{selectedSession.interviewer.lastName[0]}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {selectedSession.interviewer.firstName} {selectedSession.interviewer.lastName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {SESSION_TYPE_LABELS[selectedSession.sessionType] || selectedSession.sessionType}
                  </p>
                  <p className="text-xs text-gray-500">{formatDate(selectedSession.scheduledDate)}</p>
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
                  {FEEDBACK_TAGS.map((tag) => {
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

              {/* Would Recommend */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Would you recommend this interviewer?
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setWouldRecommend(true)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-colors ${
                      wouldRecommend === true
                        ? "bg-green-100 text-green-700 border-green-300"
                        : "bg-gray-100 text-gray-700 border-transparent hover:bg-gray-200"
                    }`}
                  >
                    👍 Yes
                  </button>
                  <button
                    onClick={() => setWouldRecommend(false)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-colors ${
                      wouldRecommend === false
                        ? "bg-red-100 text-red-700 border-red-300"
                        : "bg-gray-100 text-gray-700 border-transparent hover:bg-gray-200"
                    }`}
                  >
                    👎 No
                  </button>
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
                  setWouldRecommend(null);
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
                    Submitting…
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
