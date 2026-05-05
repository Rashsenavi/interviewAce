"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, Star, Briefcase, Clock, ChevronDown, CheckCircle } from "lucide-react";
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

const industryOptions = [
  "All Industries",
  "IT",
  "Banking",
  "Telecom",
  "Manufacturing",
  "Government",
  "Healthcare",
];

const ratingOptions = [
  { label: "All Ratings", value: "" },
  { label: "4.5+", value: "4.5" },
  { label: "4.0+", value: "4.0" },
  { label: "3.5+", value: "3.5" },
];

export default function BrowseInterviewersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("All Industries");
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
      industry: selectedIndustry === "All Industries" ? "" : selectedIndustry,
      company: companyQuery.trim(),
      minRating: selectedMinRating,
      minExperience: selectedMinExperience,
      minPrice: minPrice.trim(),
      maxPrice: maxPrice.trim(),
      sortBy,
    }),
    [
      searchQuery,
      selectedIndustry,
      companyQuery,
      selectedMinRating,
      selectedMinExperience,
      minPrice,
      maxPrice,
      sortBy,
    ]
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

      const response = await interviewerApi.getAll({
        search: normalizedFilters.search || undefined,
        industry: normalizedFilters.industry || undefined,
        company: normalizedFilters.company || undefined,
        minRating: normalizedFilters.minRating
          ? Number(normalizedFilters.minRating)
          : undefined,
        minExperience: normalizedFilters.minExperience
          ? Number(normalizedFilters.minExperience)
          : undefined,
        minPrice: normalizedFilters.minPrice ? Number(normalizedFilters.minPrice) : undefined,
        maxPrice: normalizedFilters.maxPrice ? Number(normalizedFilters.maxPrice) : undefined,
        isVerified: true,
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

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Browse Interviewers</h1>
        <p className="text-gray-600">
          Find verified professionals by industry, company, rating, and price.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
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

          <div className="relative">
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="w-full appearance-none pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {industryOptions.map((industry) => (
                <option key={industry} value={industry}>
                  {industry}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          <div>
            <input
              type="text"
              placeholder="Filter company"
              value={companyQuery}
              onChange={(e) => setCompanyQuery(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="relative">
            <select
              value={selectedMinRating}
              onChange={(e) => setSelectedMinRating(e.target.value)}
              className="w-full appearance-none pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {ratingOptions.map((option) => (
                <option key={option.label} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

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
      </div>

      <p className="text-sm text-gray-600 mb-4">Showing {interviewers.length} interviewers</p>

      {loading && (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-600">
          Loading interviewers...
        </div>
      )}

      {!loading && error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700 mb-6">
          {error}
        </div>
      )}

      {!loading && !error && interviewers.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-600">
          No interviewers found for the current filters.
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
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-lg shrink-0">
                    {initials || "IN"}
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

                <div className="flex flex-wrap gap-2 mb-4">
                  {interviewer.industryExpertise.slice(0, 3).map((item, idx) => (
                    <span
                      key={`${interviewer.id}-${idx}`}
                      className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full"
                    >
                      {item}
                    </span>
                  ))}
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {interviewer.bio || "Professional interviewer available for focused mock sessions."}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {interviewer.yearsExperience} yrs exp.
                  </span>
                  <span>{interviewer.totalInterviews} sessions</span>
                </div>

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
