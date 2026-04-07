"use client";

import { useEffect, useMemo, useState } from "react";
import { Star, MessageSquare, TrendingUp, Filter } from "lucide-react";
import feedbackService, { ReceivedFeedbackItem } from "@/lib/api/feedback";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function InterviewerFeedbackPage() {
  const [feedback, setFeedback] = useState<ReceivedFeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);

  useEffect(() => {
    const loadFeedback = async () => {
      setLoading(true);
      setError(null);

      const response = await feedbackService.getMyFeedback();

      if (!response.success || !response.data) {
        setError(response.message || "Failed to load feedback.");
        setLoading(false);
        return;
      }

      setFeedback(response.data.feedback || []);
      setLoading(false);
    };

    loadFeedback();
  }, []);

  const average = useMemo(() => {
    const rated = feedback.filter((f) => typeof f.ratingOverall === "number");
    if (rated.length === 0) return 0;
    return rated.reduce((sum, item) => sum + (item.ratingOverall || 0), 0) / rated.length;
  }, [feedback]);

  const filtered = useMemo(() => {
    if (ratingFilter === null) return feedback;
    return feedback.filter((f) => f.ratingOverall === ratingFilter);
  }, [feedback, ratingFilter]);

  const fiveStarRate = useMemo(() => {
    if (feedback.length === 0) return 0;
    const five = feedback.filter((f) => f.ratingOverall === 5).length;
    return Math.round((five / feedback.length) * 100);
  }, [feedback]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Feedback</h1>
        <p className="text-gray-600">Real candidate reviews and feedback insights.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <Star className="w-5 h-5 text-amber-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{average.toFixed(1)}</p>
              <p className="text-sm text-gray-500">Average Rating</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{feedback.length}</p>
              <p className="text-sm text-gray-500">Total Feedback</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{fiveStarRate}%</p>
              <p className="text-sm text-gray-500">5-Star Rate</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">Filter by rating</span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setRatingFilter(null)}
              className={`px-3 py-1 rounded-full text-sm ${ratingFilter === null ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700"}`}
            >
              All
            </button>
            {[5, 4, 3, 2, 1].map((r) => (
              <button
                key={r}
                onClick={() => setRatingFilter(r)}
                className={`px-3 py-1 rounded-full text-sm ${ratingFilter === r ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700"}`}
              >
                {r}★
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading && <p className="text-gray-600">Loading feedback...</p>}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500">
          No feedback available yet.
        </div>
      )}

      <div className="space-y-4">
        {!loading && !error && filtered.map((item) => (
          <article key={item.id} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="font-semibold text-gray-900">{item.givenByName}</h3>
                <p className="text-sm text-gray-500">
                  {item.sessionType} • {formatDate(item.scheduledDate)}
                </p>
              </div>
              <div className="text-sm font-medium text-gray-700">
                {item.ratingOverall ? `${item.ratingOverall} / 5` : "No rating"}
              </div>
            </div>

            {item.writtenFeedback && (
              <p className="mt-3 text-sm text-gray-600">{item.writtenFeedback}</p>
            )}

            {item.improvementSuggestions && (
              <p className="mt-2 text-sm text-gray-500">
                Improvement: {item.improvementSuggestions}
              </p>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
