"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, Star, Briefcase, Clock, ChevronDown, CheckCircle, Code2, X } from "lucide-react";
import { interviewerApi } from "@/lib/api";

type Interviewer = {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  currentCompany: string;
  jobTitle: string;
  yearsExperience: number;
  industryExpertise: string[];
  hourlyRate: number;
  bio: string | null;
  isVerified: boolean;
  ratingAverage: number;
  totalInterviews: number;
};

type SortOption = "rating" | "reviews" | "price-low" | "price-high" | "experience";

// IT-specific job roles for filtering
const IT_ROLE_OPTIONS = [
  { value: "all", label: "All Roles" },
  { value: "Software Engineer", label: "Software Engineer" },
  { value: "Product Manager", label: "Product Manager" },
  { value: "QA Engineer", label: "QA / Test Engineer" },
  { value: "DevOps", label: "DevOps Engineer" },
  { value: "Business Analyst", label: "Business Analyst" },
  { value: "Data Engineer", label: "Data Engineer / Scientist" },
  { value: "Full Stack", label: "Full Stack Developer" },
  { value: "Mobile", label: "Mobile Developer" },
  { value: "Tech Lead", label: "Tech Lead / Manager" },
];

const RATING_OPTIONS = [
  { label: "All Ratings", value: "" },
  { label: "4.5+", value: "4.5" },
  { label: "4.0+", value: "4.0" },
  { label: "3.5+", value: "3.5" },
];

// IT-specific expertise tags for display
const IT_EXPERTISE_COLORS: Record<string, string> = {
  "Software Engineering": "bg-blue-100 text-blue-700",
  "Product Management": "bg-purple-100 text-purple-700",
  QA: "bg-green-100 text-green-700",
  DevOps: "bg-orange-100 text-orange-700",
  "Data Engineering": "bg-teal-100 text-teal-700",
  "Business Analysis": "bg-indigo-100 text-indigo-700",
  "System Design": "bg-red-100 text-red-700",
  "Full Stack": "bg-pink-100 text-pink-700",
  default: "bg-gray-100 text-gray-600",
};

function getExpertiseColor(tag: string) {
  for (const [key, color] of Object.entries(IT_EXPERTISE_COLORS)) {
    if (tag.toLowerCase().includes(key.toLowerCase())) return color;
  }
  return IT_EXPERTISE_COLORS.default;
}

export default function BrowseInterviewersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [companyQuery, setCompanyQuery] = useState("");
  const [selectedMinRating, setSelectedMinRating] = useState("");
  const [selectedMinExperience, setSelectedMinExperience] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("rating");

  const [interviewers, setInterviewers] = useState<Interviewer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const normalizedFilters = useMemo(
    () => ({
      search: searchQuery.trim(),
      role: selectedRole,
      company: companyQuery.trim(),
      minRating: selectedMinRating,
      minExperience: selectedMinExperience,
      minPrice: minPrice.trim(),
      maxPrice: maxPrice.trim(),
      sortBy,
    }),
    [searchQuery, selectedRole, companyQuery, selectedMinRating, selectedMinExperience, minPrice, maxPrice, sortBy]
  );

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);

      const sortParam =
        sortBy === "price-low" || sortBy === "price-high"
          ? "price"
          : sortBy === "reviews"
          ? "reviews"
          : sortBy === "experience"
          ? "experience"
          : "rating";

      const sortOrder = sortBy === "price-low" ? "asc" : "desc";

      // Build a search that includes the role filter
      let searchStr = normalizedFilters.search;
      if (normalizedFilters.role !== "all") {
        // Append role to search so the backend's search logic picks it up
        searchStr = searchStr
          ? `${searchStr} ${normalizedFilters.role}`
          : normalizedFilters.role;
      }

      const response = await interviewerApi.getAll({
        search: searchStr || undefined,
        company: normalizedFilters.company || undefined,
        minRating: normalizedFilters.minRating ? Number(normalizedFilters.minRating) : undefined,
        minExperience: normalizedFilters.minExperience ? Number(normalizedFilters.minExperience) : undefined,
        minPrice: normalizedFilters.minPrice ? Number(normalizedFilters.minPrice) : undefined,
        maxPrice: normalizedFilters.maxPrice ? Number(normalizedFilters.maxPrice) : undefined,
        isVerified: true, // ONLY verified interviewers shown
        sortBy: sortParam,
        sortOrder,
      });

      if (response.success && response.data?.interviewers) {
        setInterviewers(response.data.interviewers as Interviewer[]);
      } else {
        setInterviewers([]);
        setError(response.error?.message || "Failed to load interviewers.");
      }

      setLoading(false);
    }, 350);

    return () => clearTimeout(timer);
  }, [normalizedFilters, sortBy]);

  const hasActiveFilters =
    searchQuery !== "" || selectedRole !== "all" || companyQuery !== "" ||
    selectedMinRating !== "" || selectedMinExperience !== "" || minPrice !== "" || maxPrice !== "";

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedRole("all");
    setCompanyQuery("");
    setSelectedMinRating("");
    setSelectedMinExperience("");
    setMinPrice("");
    setMaxPrice("");
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Code2 className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Browse IT Interviewers</h1>
        </div>
        <p className="text-gray-600">
          Find verified IT professionals — Software Engineers, Product Managers, QA Engineers, DevOps, and more.
          Only <span className="font-medium text-blue-600">verified</span> interviewers are shown.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative md:col-span-2 xl:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, title, company, or expertise"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* IT Role Filter */}
          <div className="relative">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full appearance-none pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {IT_ROLE_OPTIONS.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Company Filter */}
          <div>
            <input
              type="text"
              placeholder="Filter by company"
              value={companyQuery}
              onChange={(e) => setCompanyQuery(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Rating Filter */}
          <div className="relative">
            <select
              value={selectedMinRating}
              onChange={(e) => setSelectedMinRating(e.target.value)}
              className="w-full appearance-none pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {RATING_OPTIONS.map((option) => (
                <option key={option.label} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Experience Filter */}
          <div className="relative">
            <select
              value={selectedMinExperience}
              onChange={(e) => setSelectedMinExperience(e.target.value)}
              className="w-full appearance-none pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">All Experience</option>
              <option value="1">1+ years</option>
              <option value="3">3+ years</option>
              <option value="5">5+ years</option>
              <option value="8">8+ years</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Price Range */}
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              min="0"
              placeholder="Min LKR"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              min="0"
              placeholder="Max LKR"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full appearance-none pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="rating">Highest Rated</option>
              <option value="reviews">Most Interviews</option>
              <option value="experience">Most Experienced</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Active filter chips */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 flex-wrap">
            <span className="text-sm text-gray-500">Active filters:</span>
            {selectedRole !== "all" && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                {IT_ROLE_OPTIONS.find((r) => r.value === selectedRole)?.label}
                <button onClick={() => setSelectedRole("all")}><X className="w-3 h-3" /></button>
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

      {/* Verified badge notice */}
      <div className="flex items-center gap-2 mb-4">
        <CheckCircle className="w-4 h-4 text-blue-500" />
        <p className="text-sm text-gray-600">
          Showing <strong>{interviewers.length}</strong> verified IT interviewer{interviewers.length !== 1 ? "s" : ""}
        </p>
      </div>

      {loading && (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-600">
          Loading interviewers…
        </div>
      )}

      {!loading && error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700 mb-6">
          {error}
        </div>
      )}

      {!loading && !error && interviewers.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No interviewers found</h3>
          <p className="text-gray-500 mb-4">
            {hasActiveFilters
              ? "Try adjusting your filters."
              : "No verified interviewers are available yet. Check back soon!"}
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

      {!loading && !error && interviewers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {interviewers.map((interviewer) => {
            const fullName = `${interviewer.firstName} ${interviewer.lastName}`;
            const initials = `${interviewer.firstName?.[0] || ""}${interviewer.lastName?.[0] || ""}`;

            return (
              <Link
                key={interviewer.id}
                href={`/job-seeker/interviewers/${interviewer.userId || interviewer.id}`}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-blue-200 transition-all group"
              >
                {/* Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 bg-linear-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg shrink-0">
                    {initials || "IT"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 truncate">{fullName}</h3>
                      {interviewer.isVerified && (
                        <CheckCircle className="w-4 h-4 text-blue-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 truncate">{interviewer.jobTitle}</p>
                    <p className="text-sm text-gray-500 truncate">
                      <Briefcase className="w-3 h-3 inline mr-1" />
                      {interviewer.currentCompany}
                    </p>
                  </div>
                </div>

                {/* Rating & Price */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="font-semibold text-gray-900">
                      {interviewer.ratingAverage.toFixed(1)}
                    </span>
                    <span className="text-sm text-gray-500">
                      ({interviewer.totalInterviews} interviews)
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600">
                      LKR {Math.round(interviewer.hourlyRate).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">per session</p>
                  </div>
                </div>

                {/* Expertise Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {interviewer.industryExpertise.slice(0, 3).map((item, idx) => (
                    <span
                      key={`${interviewer.id}-${idx}`}
                      className={`text-xs px-2 py-1 rounded-full font-medium ${getExpertiseColor(item)}`}
                    >
                      {item}
                    </span>
                  ))}
                  {interviewer.industryExpertise.length > 3 && (
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-500 rounded-full">
                      +{interviewer.industryExpertise.length - 3} more
                    </span>
                  )}
                </div>

                {/* Bio */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {interviewer.bio || "Verified IT professional available for focused mock interview sessions."}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {interviewer.yearsExperience} yrs exp.
                  </span>
                  <span>{interviewer.totalInterviews} sessions</span>
                </div>

                {/* Hover CTA */}
                <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium">
                    View Profile & Book
                  </button>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
