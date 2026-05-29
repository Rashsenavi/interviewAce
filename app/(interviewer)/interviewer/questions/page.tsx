"use client";

import React, { useEffect, useState } from "react";
import {
  HelpCircle,
  Plus,
  Search,
  ChevronRight,
  BookOpen,
  Lightbulb,
  X,
  CheckCircle,
  AlertCircle,
  FileText,
  Clock,
  ArrowRight,
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
}

interface Industry {
  id: number;
  industryName: string;
}

const TYPE_OPTIONS = [
  { value: "technical", label: "Technical" },
  { value: "behavioral", label: "Behavioral" },
  { value: "situational", label: "Situational" },
  { value: "general", label: "General / HR" },
];

const DIFFICULTY_OPTIONS = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

const STATUS_BADGES: Record<string, React.ReactNode> = {
  pending: (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-semibold animate-pulse">
      <Clock className="w-3.5 h-3.5" />
      Pending Review
    </span>
  ),
  approved: (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold">
      <CheckCircle className="w-3.5 h-3.5" />
      Approved
    </span>
  ),
  rejected: (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 rounded-full text-xs font-semibold">
      <AlertCircle className="w-3.5 h-3.5" />
      Rejected
    </span>
  ),
};

export default function InterviewerQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    industryId: "",
    questionText: "",
    questionType: "technical",
    difficultyLevel: "medium",
    sampleAnswer: "",
    tips: "",
  });
  const [formError, setFormError] = useState<string | null>(null);

  // Expanded View State
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const fetchMyQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await questionApi.getMyContributions();
      if (res.success && res.data?.questions) {
        setQuestions(res.data.questions as Question[]);
      } else {
        setError(res.error?.message || "Failed to load your questions");
      }
    } catch {
      setError("An unexpected error occurred while fetching your questions.");
    } finally {
      setLoading(false);
    }
  };

  const fetchIndustries = async () => {
    try {
      const res = await questionApi.getIndustries();
      if (res.success && res.data && res.data.industries) {
        const industriesList = res.data.industries;
        setIndustries(industriesList as Industry[]);
        if (industriesList.length > 0) {
          setFormData((prev) => ({
            ...prev,
            industryId: String(industriesList[0].id),
          }));
        }
      }
    } catch (err) {
      console.error("Error loading industries:", err);
    }
  };

  useEffect(() => {
    fetchMyQuestions();
    fetchIndustries();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMsg(null);

    if (!formData.questionText.trim() || formData.questionText.trim().length < 5) {
      setFormError("Question text must be at least 5 characters long.");
      return;
    }
    if (!formData.industryId) {
      setFormError("Please select a target industry.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await questionApi.create({
        industryId: parseInt(formData.industryId, 10),
        questionText: formData.questionText,
        questionType: formData.questionType,
        difficultyLevel: formData.difficultyLevel,
        sampleAnswer: formData.sampleAnswer || undefined,
        tips: formData.tips || undefined,
      });

      if (res.success) {
        setSuccessMsg("Question contributed successfully! Pending admin approval.");
        setFormData({
          industryId: industries[0] ? String(industries[0].id) : "",
          questionText: "",
          questionType: "technical",
          difficultyLevel: "medium",
          sampleAnswer: "",
          tips: "",
        });
        await fetchMyQuestions();
        setTimeout(() => {
          setShowAddModal(false);
          setSuccessMsg(null);
        }, 2000);
      } else {
        setFormError(res.error?.message || "Failed to contribute question.");
      }
    } catch (err: any) {
      setFormError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredQuestions = questions.filter((q) =>
    q.questionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.industryName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalCount = questions.length;
  const pendingCount = questions.filter((q) => q.status === "pending").length;
  const approvedCount = questions.filter((q) => q.status === "approved").length;

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-2">Questionnaires & Question Bank</h1>
          <p className="text-gray-600 text-sm">
            Contribute real interview questions to help job seekers understand potential technical and behavioral questions.
          </p>
        </div>
        <button
          id="btn-add-question"
          onClick={() => {
            setFormError(null);
            setSuccessMsg(null);
            setShowAddModal(true);
          }}
          className="flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-3 rounded-xl font-semibold shadow-md shadow-teal-600/10 hover:shadow-teal-600/20 transition-all text-sm self-start md:self-auto"
        >
          <Plus className="w-5 h-5" />
          Contribute Question
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Contributed</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{loading ? "—" : totalCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 animate-pulse">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Pending Review</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{loading ? "—" : pendingCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Approved & Live</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{loading ? "—" : approvedCount}</p>
          </div>
        </div>
      </div>

      {/* Filter and search */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            id="input-search-questions"
            type="text"
            placeholder="Search your contributed questions…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
          />
        </div>
      </div>

      {/* List Container */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200 bg-gray-50/50">
          <h2 className="font-bold text-gray-900 text-sm">
            {loading ? "Loading…" : `My Contributions (${filteredQuestions.length})`}
          </h2>
        </div>

        {error && (
          <div className="p-8 text-center text-red-600 text-sm flex items-center justify-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {!error && loading && (
          <div className="p-16 text-center text-gray-400 text-sm flex flex-col items-center justify-center gap-3">
            <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
            Loading contributions…
          </div>
        )}

        {!error && !loading && filteredQuestions.length === 0 && (
          <div className="p-16 text-center">
            <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-1">No contributed questions found</h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
              {searchQuery 
                ? "No questions match your current search term."
                : "You haven't contributed any interview questions to the question bank yet. Click 'Contribute Question' above to start!"}
            </p>
          </div>
        )}

        {!error && !loading && filteredQuestions.length > 0 && (
          <div className="divide-y divide-gray-150">
            {filteredQuestions.map((q) => {
              const isExpanded = expandedId === q.id;
              return (
                <div key={q.id} className="hover:bg-gray-50/50 transition-colors">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : q.id)}
                    className="w-full p-6 flex items-start justify-between text-left gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="px-2.5 py-0.5 bg-gray-100 text-gray-700 rounded-md text-xs font-semibold capitalize">
                          {q.industryName}
                        </span>
                        <span className="px-2.5 py-0.5 bg-teal-50 text-teal-700 rounded-md text-xs font-semibold capitalize">
                          {q.questionType}
                        </span>
                        <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-md text-xs font-semibold capitalize">
                          {q.difficultyLevel}
                        </span>
                      </div>
                      <p className="font-semibold text-gray-900 text-base leading-relaxed">
                        {q.questionText}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        Contributed on {new Date(q.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-center">
                      {STATUS_BADGES[q.status]}
                      <ChevronRight
                        className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                      />
                    </div>
                  </button>

                  {/* Expand Block */}
                  {isExpanded && (
                    <div className="px-6 pb-6 pt-1 border-t border-gray-100 bg-gray-50/30 space-y-4">
                      {q.sampleAnswer ? (
                        <div className="bg-white rounded-xl p-4 border border-gray-200">
                          <p className="text-xs font-bold text-teal-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <BookOpen className="w-4 h-4 text-teal-600" />
                            Sample Answer / Response Model
                          </p>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                            {q.sampleAnswer}
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 italic">No sample answer provided.</p>
                      )}

                      {q.tips && (
                        <div className="bg-white rounded-xl p-4 border border-gray-200">
                          <p className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <Lightbulb className="w-4 h-4 text-amber-600" />
                            Tips for Candidates
                          </p>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                            {q.tips}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Slide-over / Modal for Adding Question */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-gray-100 flex flex-col max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Contribute Interview Question</h2>
                <p className="text-xs text-gray-500 mt-1">Provide target details, answers, and tips to assist candidates.</p>
              </div>
              <button
                id="btn-close-modal"
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              {formError && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {formError}
                </div>
              )}

              {successMsg && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm flex items-center gap-2 font-medium">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  {successMsg}
                </div>
              )}

              {/* Question Text */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Question Text <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="textarea-question-text"
                  name="questionText"
                  value={formData.questionText}
                  onChange={handleInputChange}
                  placeholder="e.g. How do you implement debouncing in JavaScript, and what are the main use cases?"
                  rows={3}
                  required
                  className="w-full p-3.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none bg-white text-gray-900"
                />
              </div>

              {/* Dropdowns Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Industry */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Industry <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="select-industry"
                    name="industryId"
                    value={formData.industryId}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-gray-900"
                  >
                    {industries.map((ind) => (
                      <option key={ind.id} value={ind.id}>
                        {ind.industryName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Question Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="select-type"
                    name="questionType"
                    value={formData.questionType}
                    onChange={handleInputChange}
                    className="w-full p-3.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-gray-900"
                  >
                    {TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Difficulty */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Difficulty Level <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="select-difficulty"
                    name="difficultyLevel"
                    value={formData.difficultyLevel}
                    onChange={handleInputChange}
                    className="w-full p-3.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-gray-900"
                  >
                    {DIFFICULTY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sample Answer */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
                  <FileText className="w-4 h-4 text-gray-400" />
                  Sample Answer (Optional)
                </label>
                <textarea
                  id="textarea-sample-answer"
                  name="sampleAnswer"
                  value={formData.sampleAnswer}
                  onChange={handleInputChange}
                  placeholder="Explain a standard, professional answer a candidate should give..."
                  rows={4}
                  className="w-full p-3.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none bg-white text-gray-900"
                />
              </div>

              {/* Tips */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
                  <Lightbulb className="w-4 h-4 text-gray-400" />
                  Tips for Candidates (Optional)
                </label>
                <textarea
                  id="textarea-tips"
                  name="tips"
                  value={formData.tips}
                  onChange={handleInputChange}
                  placeholder="Tips on key terms to mention, behavioral indicators, or common traps..."
                  rows={3}
                  className="w-full p-3.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none bg-white text-gray-900"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  id="btn-cancel-add"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-3 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl text-sm font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="btn-submit-question"
                  disabled={isSubmitting}
                  className="flex items-center justify-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-md shadow-teal-600/10 hover:shadow-teal-600/20 disabled:opacity-50 transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Contributing...
                    </>
                  ) : (
                    <>
                      Submit Question
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
