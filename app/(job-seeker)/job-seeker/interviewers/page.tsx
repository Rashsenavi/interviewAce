"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { interviewerApi } from "@/lib/api";
import {
  Search,
  Star,
  Briefcase,
  Clock,
  ChevronDown,
  CheckCircle,
} from "lucide-react";

type ApiInterviewer = {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  currentCompany: string | null;
  jobTitle: string | null;
  yearsExperience: number | null;
  industryExpertise: string[];
  hourlyRate: number;
  bio: string | null;
  isVerified: boolean;
  ratingAverage: number;
  totalInterviews: number;
};

const avatarColors = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-rose-500",
  "bg-amber-500",
  "bg-indigo-500",
  "bg-cyan-500",
];

function getInitials(firstName?: string, lastName?: string) {
  const first = firstName?.trim()?.[0] ?? "?";
  const last = lastName?.trim()?.[0] ?? "";
  return `${first}${last}`.toUpperCase();
}

export default function BrowseInterviewersPage() {
  const [interviewers, setInterviewers] = useState<ApiInterviewer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("All Industries");
  const [selectedExpertise, setSelectedExpertise] = useState("All Expertise");
  const [sortBy, setSortBy] = useState("rating");

  useEffect(() => {
    const loadInterviewers = async () => {
      setLoading(true);
      setError(null);

      const response = await interviewerApi.getAll();

      if (!response.success || !response.data?.interviewers) {
        setError(response.error?.message || "Failed to load interviewers.");
        setInterviewers([]);
        setLoading(false);
        return;
      }

      const verifiedInterviewers = response.data.interviewers.filter((item) => item.isVerified);
      setInterviewers(verifiedInterviewers);
      setLoading(false);
    };

    loadInterviewers();
  }, []);

  const industries = useMemo(() => {
    const all = new Set<string>();
    interviewers.forEach((i) => i.industryExpertise?.forEach((skill) => all.add(skill)));
    return ["All Industries", ...Array.from(all).sort((a, b) => a.localeCompare(b))];
  }, [interviewers]);

  const expertiseAreas = useMemo(() => {
    const all = new Set<string>();
    interviewers.forEach((i) => i.industryExpertise?.forEach((skill) => all.add(skill)));
    return ["All Expertise", ...Array.from(all).sort((a, b) => a.localeCompare(b))];
  }, [interviewers]);

  // Filter interviewers
  const filteredInterviewers = interviewers.filter((interviewer) => {
    const fullName = `${interviewer.firstName} ${interviewer.lastName}`.trim();
    const matchesSearch =
      fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (interviewer.jobTitle || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (interviewer.currentCompany || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      interviewer.industryExpertise.some((e) =>
        e.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesIndustry =
      selectedIndustry === "All Industries" ||
      interviewer.industryExpertise.some((i) =>
        i.toLowerCase().includes(selectedIndustry.toLowerCase())
      );

    const matchesExpertise =
      selectedExpertise === "All Expertise" ||
      interviewer.industryExpertise.some((e) =>
        e.toLowerCase().includes(selectedExpertise.toLowerCase())
      );

    return matchesSearch && matchesIndustry && matchesExpertise;
  });

  // Sort interviewers
  const sortedInterviewers = [...filteredInterviewers].sort((a, b) => {
    if (sortBy === "rating") return b.ratingAverage - a.ratingAverage;
    if (sortBy === "price-low") return a.hourlyRate - b.hourlyRate;
    if (sortBy === "price-high") return b.hourlyRate - a.hourlyRate;
    if (sortBy === "reviews") return b.totalInterviews - a.totalInterviews;
    return 0;
  });

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Browse Interviewers
        </h1>
        <p className="text-gray-600">
          Find expert interviewers to help you prepare for your dream job
        </p>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, company, or expertise..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Industry Filter */}
          <div className="relative">
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"
            >
              {industries.map((industry) => (
                <option key={industry} value={industry}>
                  {industry}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Expertise Filter */}
          <div className="relative">
            <select
              value={selectedExpertise}
              onChange={(e) => setSelectedExpertise(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"
            >
              {expertiseAreas.map((expertise) => (
                <option key={expertise} value={expertise}>
                  {expertise}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Sort By */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"
            >
              <option value="rating">Highest Rated</option>
              <option value="reviews">Most Reviews</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Results Count */}
      {loading ? (
        <p className="text-sm text-gray-600 mb-4">Loading interviewers...</p>
      ) : (
        <p className="text-sm text-gray-600 mb-4">
          Showing {sortedInterviewers.length} interviewers
        </p>
      )}

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-sm font-medium text-red-700 underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Interviewers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {!loading && !error && sortedInterviewers.map((interviewer, index) => (
          <Link
            key={interviewer.userId}
            href={`/job-seeker/interviewers/${interviewer.userId}`}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-blue-200 transition-all group"
          >
            {/* Header */}
            <div className="flex items-start gap-4 mb-4">
              <div
                className={`w-14 h-14 ${avatarColors[index % avatarColors.length]} rounded-full flex items-center justify-center text-white font-semibold text-lg shrink-0`}
              >
                {getInitials(interviewer.firstName, interviewer.lastName)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {`${interviewer.firstName} ${interviewer.lastName}`}
                  </h3>
                  {interviewer.isVerified && (
                    <CheckCircle className="w-4 h-4 text-blue-500 shrink-0" />
                  )}
                </div>
                <p className="text-sm text-gray-600 truncate">{interviewer.jobTitle || "Interviewer"}</p>
                <p className="text-sm text-gray-500 truncate">
                  <Briefcase className="w-3 h-3 inline mr-1" />
                  {interviewer.currentCompany || "Independent"}
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
                  ({interviewer.totalInterviews} sessions)
                </span>
              </div>
              <div className="text-right">
                <p className="font-bold text-blue-600">
                  LKR {interviewer.hourlyRate.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">per session</p>
              </div>
            </div>

            {/* Expertise Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {interviewer.industryExpertise.slice(0, 3).map((skill, i) => (
                <span
                  key={i}
                  className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {interviewer.yearsExperience ?? 0} yrs
              </span>
              <span>{interviewer.totalInterviews} sessions</span>
              <span className="text-green-600 font-medium">Available</span>
            </div>

            {/* Hover CTA */}
            <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium">
                View Profile & Book
              </button>
            </div>
          </Link>
        ))}
      </div>

      {!loading && !error && sortedInterviewers.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center text-gray-600">
          No interviewers match your filters yet.
        </div>
      )}
    </div>
  );
}
