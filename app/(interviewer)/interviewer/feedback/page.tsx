"use client";

import { useState } from "react";
import {
  Star,
  MessageSquare,
  Calendar,
  TrendingUp,
  ThumbsUp,
  Award,
  Target,
  Lightbulb,
  Filter,
  ChevronDown,
} from "lucide-react";

interface FeedbackItem {
  id: string;
  sessionId: string;
  candidateName: string;
  candidateAvatar: string;
  candidateAvatarBg: string;
  candidateUniversity: string;
  date: string;
  sessionType: string;
  rating: number;
  comment: string;
  tags: string[];
}

// Mock feedback data for interviewer
const feedbackData: FeedbackItem[] = [
  {
    id: "FB001",
    sessionId: "INT-20260208001",
    candidateName: "Kasun Perera",
    candidateAvatar: "KP",
    candidateAvatarBg: "bg-blue-500",
    candidateUniversity: "University of Kelaniya",
    date: "2026-02-08",
    sessionType: "Mock Interview",
    rating: 5,
    comment:
      "Very helpful session! Got detailed feedback on my technical skills and system design approach. The interviewer was patient and gave actionable advice.",
    tags: ["knowledgeable", "helpful", "actionable"],
  },
  {
    id: "FB002",
    sessionId: "INT-20260206001",
    candidateName: "Sanduni Wickrama",
    candidateAvatar: "SW",
    candidateAvatarBg: "bg-pink-500",
    candidateUniversity: "University of Peradeniya",
    date: "2026-02-06",
    sessionType: "Career Coaching",
    rating: 4,
    comment:
      "Good advice on career planning. Would recommend! Helped me understand the industry better.",
    tags: ["professional", "helpful"],
  },
  {
    id: "FB003",
    sessionId: "INT-20260201001",
    candidateName: "Ravindu Fernando",
    candidateAvatar: "RF",
    candidateAvatarBg: "bg-orange-500",
    candidateUniversity: "University of Moratuwa",
    date: "2026-02-01",
    sessionType: "Mock Interview",
    rating: 5,
    comment:
      "Excellent mock interview experience. The questions were challenging and the feedback was comprehensive. Really helped me prepare for my actual interviews.",
    tags: ["knowledgeable", "professional", "actionable"],
  },
  {
    id: "FB004",
    sessionId: "INT-20260128001",
    candidateName: "Nisha Jayawardena",
    candidateAvatar: "NJ",
    candidateAvatarBg: "bg-teal-500",
    candidateUniversity: "SLIIT",
    date: "2026-01-28",
    sessionType: "Mock Interview",
    rating: 5,
    comment: "Great session! The interviewer provided real-world scenarios and practical tips.",
    tags: ["helpful", "actionable"],
  },
  {
    id: "FB005",
    sessionId: "INT-20260125001",
    candidateName: "Amaya Silva",
    candidateAvatar: "AS",
    candidateAvatarBg: "bg-purple-500",
    candidateUniversity: "University of Colombo",
    date: "2026-01-25",
    sessionType: "Career Coaching",
    rating: 4,
    comment: "Very insightful session. Got clear guidance on my career path.",
    tags: ["knowledgeable", "professional"],
  },
  {
    id: "FB006",
    sessionId: "INT-20260120001",
    candidateName: "Thilina Rajapaksa",
    candidateAvatar: "TR",
    candidateAvatarBg: "bg-green-500",
    candidateUniversity: "NSBM",
    date: "2026-01-20",
    sessionType: "Mock Interview",
    rating: 3,
    comment: "Good session overall. Could use more detailed feedback on specific areas.",
    tags: ["helpful"],
  },
];

const tagConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  knowledgeable: { label: "Knowledgeable", icon: Lightbulb, color: "bg-yellow-100 text-yellow-700" },
  helpful: { label: "Helpful", icon: ThumbsUp, color: "bg-blue-100 text-blue-700" },
  professional: { label: "Professional", icon: Award, color: "bg-purple-100 text-purple-700" },
  actionable: { label: "Actionable", icon: Target, color: "bg-green-100 text-green-700" },
};

export default function InterviewerFeedbackPage() {
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<"recent" | "highest" | "lowest">("recent");

  // Calculate stats
  const totalReviews = feedbackData.length;
  const averageRating = feedbackData.reduce((acc, f) => acc + f.rating, 0) / totalReviews;
  const fiveStarCount = feedbackData.filter((f) => f.rating === 5).length;
  const fourStarCount = feedbackData.filter((f) => f.rating === 4).length;
  const threeStarCount = feedbackData.filter((f) => f.rating === 3).length;

  // Tag counts
  const tagCounts = feedbackData.reduce(
    (acc, f) => {
      f.tags.forEach((tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
      });
      return acc;
    },
    {} as Record<string, number>
  );

  // Filter and sort
  let filteredFeedback = [...feedbackData];
  if (filterRating !== null) {
    filteredFeedback = filteredFeedback.filter((f) => f.rating === filterRating);
  }
  if (sortBy === "highest") {
    filteredFeedback.sort((a, b) => b.rating - a.rating);
  } else if (sortBy === "lowest") {
    filteredFeedback.sort((a, b) => a.rating - b.rating);
  } else {
    filteredFeedback.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="w-full">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Feedback & Reviews</h1>
        <p className="text-gray-600">See what candidates are saying about your sessions</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Star className="w-6 h-6 text-yellow-600 fill-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{averageRating.toFixed(1)}</p>
              <p className="text-sm text-gray-500">Average Rating</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalReviews}</p>
              <p className="text-sm text-gray-500">Total Reviews</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round((fiveStarCount / totalReviews) * 100)}%
              </p>
              <p className="text-sm text-gray-500">5-Star Rate</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
              <ThumbsUp className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(((fiveStarCount + fourStarCount) / totalReviews) * 100)}%
              </p>
              <p className="text-sm text-gray-500">Positive (4-5★)</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="col-span-2">
          {/* Filters */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Filter by rating:</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setFilterRating(null)}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      filterRating === null
                        ? "bg-teal-100 text-teal-700"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    All
                  </button>
                  {[5, 4, 3, 2, 1].map((r) => (
                    <button
                      key={r}
                      onClick={() => setFilterRating(r)}
                      className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${
                        filterRating === r
                          ? "bg-teal-100 text-teal-700"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {r}
                      <Star className="w-3 h-3 fill-current" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "recent" | "highest" | "lowest")}
                  className="appearance-none bg-gray-100 border-0 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="recent">Most Recent</option>
                  <option value="highest">Highest Rated</option>
                  <option value="lowest">Lowest Rated</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-4">
            {filteredFeedback.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews found</h3>
                <p className="text-gray-500">No reviews match your filter criteria.</p>
              </div>
            ) : (
              filteredFeedback.map((feedback) => (
                <div
                  key={feedback.id}
                  className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 ${feedback.candidateAvatarBg} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0`}
                    >
                      {feedback.candidateAvatar}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">{feedback.candidateName}</h3>
                          <p className="text-sm text-gray-600">{feedback.candidateUniversity}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < feedback.rating
                                    ? "text-yellow-400 fill-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{formatDate(feedback.date)}</p>
                        </div>
                      </div>

                      <p className="text-gray-700 mb-3">{feedback.comment}</p>

                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">
                          {feedback.sessionType}
                        </span>
                        {feedback.tags.map((tag) => {
                          const config = tagConfig[tag];
                          if (!config) return null;
                          const Icon = config.icon;
                          return (
                            <span
                              key={tag}
                              className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${config.color}`}
                            >
                              <Icon className="w-3 h-3" />
                              {config.label}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Rating Breakdown */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Rating Breakdown</h3>

            <div className="flex items-center gap-4 mb-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-gray-900">{averageRating.toFixed(1)}</p>
                <div className="flex items-center justify-center gap-0.5 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.round(averageRating)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-1">{totalReviews} reviews</p>
              </div>

              <div className="flex-1 space-y-2">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = feedbackData.filter((f) => f.rating === stars).length;
                  const percentage = (count / totalReviews) * 100;
                  return (
                    <div key={stars} className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 w-3">{stars}</span>
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-400 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-6">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Most Mentioned Tags */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">What Candidates Appreciate</h3>
            <div className="space-y-3">
              {Object.entries(tagCounts)
                .sort(([, a], [, b]) => b - a)
                .map(([tag, count]) => {
                  const config = tagConfig[tag];
                  if (!config) return null;
                  const Icon = config.icon;
                  const percentage = Math.round((count / totalReviews) * 100);
                  return (
                    <div key={tag} className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${config.color}`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">{config.label}</span>
                          <span className="text-xs text-gray-500">{percentage}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-teal-500 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-xl p-6 border border-teal-100">
            <h3 className="font-semibold text-gray-900 mb-3">💡 Tips to Improve</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-teal-500">•</span>
                Provide specific, actionable feedback
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-500">•</span>
                Share industry insights and trends
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-500">•</span>
                Be patient and encouraging
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-500">•</span>
                Follow up with resources
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
