"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  HelpCircle,
  ChevronRight,
  Search,
  ChevronDown,
  BookOpen,
  X,
  Lightbulb,
} from "lucide-react";
import { questionApi } from "@/lib/api";

interface Question {
  id: number;
  questionText: string;
  questionType: string;
  difficultyLevel: string;
  sampleAnswer: string | null;
  tips: string | null;
  usageCount: number;
  industryName: string;
}

interface QuestionStats {
  technical: number;
  behavioral: number;
  situational: number;
  general: number;
  total: number;
}

const TYPE_OPTIONS = [
  { value: "all", label: "All Types" },
  { value: "technical", label: "Technical" },
  { value: "behavioral", label: "Behavioral" },
  { value: "situational", label: "Situational" },
  { value: "general", label: "General / HR" },
];

const DIFFICULTY_OPTIONS = [
  { value: "all", label: "All Levels" },
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

const IT_ROLES = [
  { value: "all", label: "All IT Roles" },
  { value: "SE", label: "Software Engineer" },
  { value: "PM", label: "Product Manager" },
  { value: "QA", label: "QA Engineer" },
  { value: "DevOps", label: "DevOps Engineer" },
  { value: "BA", label: "Business Analyst" },
  { value: "Data Engineer", label: "Data Engineer" },
  { value: "Full Stack", label: "Full Stack Developer" },
  { value: "Mobile", label: "Mobile Developer" },
  { value: "Tech Lead", label: "Tech Lead / EM" },
];

const TYPE_COLORS: Record<string, string> = {
  technical: "bg-blue-100 text-blue-700",
  behavioral: "bg-green-100 text-green-700",
  situational: "bg-purple-100 text-purple-700",
  general: "bg-orange-100 text-orange-700",
};

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "text-green-600",
  medium: "text-orange-600",
  hard: "text-red-600",
};

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [stats, setStats] = useState<QuestionStats | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filterType, setFilterType] = useState("all");
  const [filterDifficulty, setFilterDifficulty] = useState("all");
  const [filterRole, setFilterRole] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filters = useMemo(
    () => ({ type: filterType, difficulty: filterDifficulty, role: filterRole, search: searchQuery }),
    [filterType, filterDifficulty, filterRole, searchQuery]
  );

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await questionApi.getAll({
          type: filters.type !== "all" ? filters.type : undefined,
          difficulty: filters.difficulty !== "all" ? filters.difficulty : undefined,
          role: filters.role !== "all" ? filters.role : undefined,
          search: filters.search || undefined,
          limit: 50,
        });

        if (res.success && res.data) {
          setQuestions(res.data.questions as Question[]);
          setTotal(res.data.total);
          setStats(res.data.stats as QuestionStats);
        } else {
          setError(res.error?.message || "Failed to load questions");
          setQuestions([]);
        }
      } catch {
        setError("An error occurred. Please try again.");
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [filters]);

  const hasActiveFilters =
    filterType !== "all" || filterDifficulty !== "all" || filterRole !== "all" || searchQuery !== "";

  const clearFilters = () => {
    setFilterType("all");
    setFilterDifficulty("all");
    setFilterRole("all");
    setSearchQuery("");
  };

  const STAT_CATEGORIES = [
    { key: "technical", label: "Technical", color: "bg-blue-50 text-blue-700 border-blue-200" },
    { key: "behavioral", label: "Behavioral", color: "bg-green-50 text-green-700 border-green-200" },
    { key: "situational", label: "Situational", color: "bg-purple-50 text-purple-700 border-purple-200" },
    { key: "general", label: "General / HR", color: "bg-orange-50 text-orange-700 border-orange-200" },
  ];

  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">IT Question Bank</h1>
        <p className="text-gray-600">
          Practice with real interview questions for Software Engineers, Product Managers, QA Engineers, DevOps, and more.
        </p>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {STAT_CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setFilterType(filterType === cat.key ? "all" : cat.key)}
            className={`border rounded-xl p-4 text-left hover:shadow-md transition-all ${
              filterType === cat.key
                ? cat.color + " border-2 shadow-sm"
                : "bg-white border-gray-100 shadow-sm hover:border-gray-200"
            }`}
          >
            <div
              className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-2 ${
                filterType === cat.key ? "bg-white/60" : cat.color
              }`}
            >
              {cat.label}
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {loading ? "—" : stats?.[cat.key as keyof QuestionStats] ?? 0}
            </p>
            <p className="text-sm text-gray-500">questions</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative md:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search questions…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* IT Role filter */}
          <div className="relative">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full appearance-none pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {IT_ROLES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Question Type */}
          <div className="relative">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full appearance-none pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {TYPE_OPTIONS.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Difficulty */}
          <div className="relative">
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="w-full appearance-none pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {DIFFICULTY_OPTIONS.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
            <span className="text-sm text-gray-500">Active filters:</span>
            {filterRole !== "all" && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                {IT_ROLES.find((r) => r.value === filterRole)?.label}
                <button onClick={() => setFilterRole("all")}><X className="w-3 h-3" /></button>
              </span>
            )}
            {filterType !== "all" && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                {TYPE_OPTIONS.find((t) => t.value === filterType)?.label}
                <button onClick={() => setFilterType("all")}><X className="w-3 h-3" /></button>
              </span>
            )}
            {filterDifficulty !== "all" && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                {DIFFICULTY_OPTIONS.find((d) => d.value === filterDifficulty)?.label}
                <button onClick={() => setFilterDifficulty("all")}><X className="w-3 h-3" /></button>
              </span>
            )}
            {searchQuery && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                &quot;{searchQuery}&quot;
                <button onClick={() => setSearchQuery("")}><X className="w-3 h-3" /></button>
              </span>
            )}
            <button onClick={clearFilters} className="ml-auto text-sm text-red-500 hover:text-red-700">
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Questions List */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">
            {loading ? "Loading…" : `${total} question${total !== 1 ? "s" : ""} found`}
          </h2>
          {!loading && total > 0 && (
            <span className="text-sm text-gray-500">Click a question to see the sample answer</span>
          )}
        </div>

        {error && (
          <div className="p-6 text-center text-red-600 text-sm">{error}</div>
        )}

        {!error && loading && (
          <div className="p-12 text-center text-gray-400 text-sm">Loading questions…</div>
        )}

        {!error && !loading && questions.length === 0 && (
          <div className="p-12 text-center">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No questions found</h3>
            <p className="text-gray-500 mb-4">
              {stats?.total === 0
                ? "The question bank hasn't been seeded yet. Please run the seed script."
                : "Try adjusting your filters to find matching questions."}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        <div className="divide-y divide-gray-100">
          {questions.map((q) => {
            const isExpanded = expandedId === q.id;
            return (
              <div key={q.id} className="hover:bg-gray-50 transition-colors">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : q.id)}
                  className="w-full p-4 flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                      <HelpCircle className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-left">{q.questionText}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            TYPE_COLORS[q.questionType] || "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {q.questionType.charAt(0).toUpperCase() + q.questionType.slice(1)}
                        </span>
                        <span className="text-gray-300">•</span>
                        <span
                          className={`text-xs font-medium ${
                            DIFFICULTY_COLORS[q.difficultyLevel] || "text-gray-500"
                          }`}
                        >
                          {q.difficultyLevel.charAt(0).toUpperCase() + q.difficultyLevel.slice(1)}
                        </span>
                        {q.usageCount > 0 && (
                          <>
                            <span className="text-gray-300">•</span>
                            <span className="text-xs text-gray-400">{q.usageCount} views</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <ChevronRight
                    className={`w-5 h-5 text-gray-400 shrink-0 ml-4 transition-transform ${
                      isExpanded ? "rotate-90" : ""
                    }`}
                  />
                </button>

                {/* Expanded: Sample Answer + Tips */}
                {isExpanded && (q.sampleAnswer || q.tips) && (
                  <div className="px-4 pb-4 ml-14 space-y-3">
                    {q.sampleAnswer && (
                      <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                        <p className="text-xs font-semibold text-blue-700 mb-2 flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5" />
                          Sample Answer
                        </p>
                        <p className="text-sm text-blue-900">{q.sampleAnswer}</p>
                      </div>
                    )}
                    {q.tips && (
                      <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                        <p className="text-xs font-semibold text-amber-700 mb-2 flex items-center gap-1">
                          <Lightbulb className="w-3.5 h-3.5" />
                          Interviewer Tips
                        </p>
                        <p className="text-sm text-amber-900">{q.tips}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
