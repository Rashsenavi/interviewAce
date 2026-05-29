"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  HelpCircle,
  Search,
  ChevronRight,
  BookOpen,
  Lightbulb,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Sparkles,
  Award,
  Filter,
} from "lucide-react";
import { questionApi } from "@/lib/api";

interface Question {
  id: number;
  questionText: string;
  questionType: string;
  difficultyLevel: string;
  sampleAnswer: string | null;
  tips: string | null;
  status: string;
  createdAt: string;
  industryId: number;
  industryName: string;
  contributedByUserId: number;
}

const TYPE_BADGES: Record<string, string> = {
  technical: "bg-indigo-50 text-indigo-700 border border-indigo-150",
  behavioral: "bg-purple-50 text-purple-700 border border-purple-150",
  situational: "bg-sky-50 text-sky-700 border border-sky-150",
  general: "bg-slate-50 text-slate-700 border border-slate-150",
};

const DIFFICULTY_BADGES: Record<string, string> = {
  easy: "bg-emerald-50 text-emerald-700 border border-emerald-150",
  medium: "bg-amber-50 text-amber-700 border border-amber-150",
  hard: "bg-rose-50 text-rose-700 border border-rose-150",
};

export default function AdminQuestionsReviewPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [notice, setNotice] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [confirmRejectId, setConfirmRejectId] = useState<number | null>(null);

  const fetchPendingQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await questionApi.getPendingQuestions();
      if (res.success && res.data?.questions) {
        setQuestions(res.data.questions as Question[]);
      } else {
        setError(res.error?.message || "Failed to load pending questions");
      }
    } catch {
      setError("An unexpected error occurred while fetching pending questions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingQuestions();
  }, []);

  const handleReview = async (id: number, status: "approved" | "rejected") => {
    setActionLoadingId(id);
    setNotice(null);
    try {
      const res = await questionApi.reviewQuestion(id, status);
      if (res.success) {
        setQuestions((prev) => prev.filter((q) => q.id !== id));
        setConfirmRejectId(null);
        setNotice({
          message: `Question successfully ${status === "approved" ? "approved and made live" : "rejected"}.`,
          type: "success",
        });
        // Auto clear success notice
        setTimeout(() => setNotice(null), 4000);
      } else {
        setNotice({
          message: res.error?.message || `Failed to review the question.`,
          type: "error",
        });
      }
    } catch (err: any) {
      setNotice({
        message: err.message || "An unexpected error occurred during the review process.",
        type: "error",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchSearch =
        q.questionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.industryName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchType = typeFilter === "all" || q.questionType === typeFilter;
      const matchDifficulty = difficultyFilter === "all" || q.difficultyLevel === difficultyFilter;

      return matchSearch && matchType && matchDifficulty;
    });
  }, [questions, searchQuery, typeFilter, difficultyFilter]);

  // Quick stats calculations
  const stats = useMemo(() => {
    const total = questions.length;
    const technical = questions.filter((q) => q.questionType === "technical").length;
    const behavioral = questions.filter((q) => q.questionType === "behavioral").length;
    const other = total - technical - behavioral;
    return { total, technical, behavioral, other };
  }, [questions]);

  return (
    <div className="space-y-6 pb-8">
      {/* Header section with gradient and control console theme */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-indigo-50 via-white to-slate-50 p-6 md:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-indigo-300/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-8 h-56 w-56 rounded-full bg-slate-300/20 blur-3xl" />

        <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Admin Console</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
              Questionnaire Contribution Review
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Audit interviewer contributed questions, verify code samples/answers, and approve content to help job seekers prepare.
            </p>
          </div>

          {/* Quick Metrics Panel */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white/90 px-4 py-2.5 shadow-xs backdrop-blur">
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Pending Review</p>
                <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              </div>
              <p className="mt-1 text-2xl font-black text-slate-900">{stats.total}</p>
            </div>
            
            <div className="rounded-xl border border-slate-200 bg-white/90 px-4 py-2.5 shadow-xs backdrop-blur">
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Technical</p>
                <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              </div>
              <p className="mt-1 text-2xl font-black text-slate-900">{stats.technical}</p>
            </div>

            <div className="hidden sm:block rounded-xl border border-slate-200 bg-white/90 px-4 py-2.5 shadow-xs backdrop-blur">
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Behavioral</p>
                <Award className="w-3.5 h-3.5 text-purple-500 shrink-0" />
              </div>
              <p className="mt-1 text-2xl font-black text-slate-900">{stats.behavioral}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Notice Banner */}
      {notice && (
        <div
          className={`flex items-start gap-3 p-4 rounded-xl border text-sm font-medium transition-all ${
            notice.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          {notice.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div>{notice.message}</div>
        </div>
      )}

      {/* Main Review Section */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs md:p-6 space-y-6">
        {/* Search and Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by question text or industry..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Type Filter */}
            <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 bg-white">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="text-sm font-semibold text-slate-700 bg-transparent outline-none cursor-pointer"
              >
                <option value="all">All Types</option>
                <option value="technical">Technical</option>
                <option value="behavioral">Behavioral</option>
                <option value="situational">Situational</option>
                <option value="general">General / HR</option>
              </select>
            </div>

            {/* Difficulty Filter */}
            <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 bg-white">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="text-sm font-semibold text-slate-700 bg-transparent outline-none cursor-pointer"
              >
                <option value="all">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
            <div className="h-9 w-9 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
            <p className="text-sm font-medium">Fetching contributions pending audit...</p>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-800">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
            <h4 className="font-bold mb-1">Data Fetch Failed</h4>
            <p className="text-sm">{error}</p>
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-16 px-4 text-center">
            <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-base font-bold text-slate-800 mb-1">No questions match your selection</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              {searchQuery || typeFilter !== "all" || difficultyFilter !== "all"
                ? "Try clearing your filters or search query to find pending submissions."
                : "Excellent! There are no pending questions waiting in the audit queue at this moment."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredQuestions.map((q) => {
              const isExpanded = expandedId === q.id;
              const isActionLoading = actionLoadingId === q.id;
              const isRejectConfirm = confirmRejectId === q.id;

              return (
                <div
                  key={q.id}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden bg-white ${
                    isExpanded
                      ? "border-indigo-200 shadow-md shadow-indigo-500/5 ring-1 ring-indigo-50"
                      : "border-slate-200 hover:border-slate-300 shadow-xs"
                  }`}
                >
                  {/* Collapsed top bar trigger */}
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : q.id)}
                    className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex-1 space-y-2.5">
                      {/* Meta information tags */}
                      <div className="flex flex-wrap gap-2 items-center text-xs">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200 capitalize">
                          {q.industryName}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full font-semibold capitalize ${TYPE_BADGES[q.questionType] || TYPE_BADGES.general}`}>
                          {q.questionType}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full font-semibold capitalize ${DIFFICULTY_BADGES[q.difficultyLevel] || DIFFICULTY_BADGES.medium}`}>
                          {q.difficultyLevel}
                        </span>
                        <span className="text-slate-400 ml-1">
                          Submitted on {new Date(q.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </div>

                      {/* Question Content preview */}
                      <h3 className="text-base font-bold text-slate-800 leading-snug">
                        {q.questionText}
                      </h3>
                    </div>

                    {/* Action buttons (Directly on header for ease of use) */}
                    <div
                      className="flex items-center gap-3 shrink-0 self-start md:self-center"
                      onClick={(e) => e.stopPropagation()} // Stop accordion toggle when action buttons clicked
                    >
                      {isRejectConfirm ? (
                        <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 px-2 py-1.5 rounded-xl animate-fade-in">
                          <span className="text-xs font-bold text-rose-800 px-1">Reject this?</span>
                          <button
                            disabled={isActionLoading}
                            onClick={() => handleReview(q.id, "rejected")}
                            className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold px-2.5 py-1 rounded-lg transition"
                          >
                            Yes
                          </button>
                          <button
                            disabled={isActionLoading}
                            onClick={() => setConfirmRejectId(null)}
                            className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-lg transition"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            disabled={isActionLoading}
                            onClick={() => handleReview(q.id, "approved")}
                            className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-2 rounded-xl transition shadow-sm hover:shadow"
                          >
                            {isActionLoading && actionLoadingId === q.id ? (
                              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            )}
                            Approve
                          </button>
                          <button
                            disabled={isActionLoading}
                            onClick={() => setConfirmRejectId(q.id)}
                            className="flex items-center gap-1 border border-slate-200 hover:bg-rose-50 text-slate-700 hover:text-rose-700 hover:border-rose-200 text-xs font-semibold px-3 py-2 rounded-xl transition"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Reject
                          </button>
                        </div>
                      )}

                      <ChevronRight
                        className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                      />
                    </div>
                  </div>

                  {/* Expand block for detailed content */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-1 border-t border-slate-100 bg-slate-50/30 space-y-4 animate-slide-down">
                      {/* Sample Answer Details */}
                      {q.sampleAnswer ? (
                        <div className="bg-white rounded-xl p-4 border border-slate-150">
                          <p className="text-xs font-bold text-indigo-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <BookOpen className="w-4 h-4 text-indigo-500" />
                            Sample Answer Model
                          </p>
                          <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                            {q.sampleAnswer}
                          </p>
                        </div>
                      ) : (
                        <div className="bg-slate-50/50 rounded-xl p-3 border border-dashed border-slate-200 text-xs text-slate-400 italic flex items-center gap-2">
                          <BookOpen className="w-4 h-4" />
                          No sample answer was submitted by the contributor.
                        </div>
                      )}

                      {/* Expert tips Details */}
                      {q.tips ? (
                        <div className="bg-white rounded-xl p-4 border border-slate-150">
                          <p className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <Lightbulb className="w-4 h-4 text-amber-500" />
                            Tips for Candidates
                          </p>
                          <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                            {q.tips}
                          </p>
                        </div>
                      ) : (
                        <div className="bg-slate-50/50 rounded-xl p-3 border border-dashed border-slate-200 text-xs text-slate-400 italic flex items-center gap-2">
                          <Lightbulb className="w-4 h-4" />
                          No tips or advice were provided by the contributor.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
