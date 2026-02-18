"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Star,
  MapPin,
  Briefcase,
  Clock,
  Filter,
  ChevronDown,
  CheckCircle,
} from "lucide-react";

// Mock data for interviewers
const interviewersData = [
  {
    id: 1,
    name: "Kasun Perera",
    title: "Senior Software Engineer",
    company: "Google",
    avatar: "KP",
    avatarBg: "bg-blue-500",
    rating: 4.9,
    reviews: 127,
    hourlyRate: 5000,
    expertise: ["Software Engineering", "System Design", "Data Structures"],
    industries: ["IT & Software", "Tech Startups"],
    experience: 8,
    languages: ["English", "Sinhala"],
    totalSessions: 245,
    responseTime: "< 2 hours",
    verified: true,
    bio: "8+ years at Google, specializing in distributed systems and technical interviews.",
    availableSlots: 12,
  },
  {
    id: 2,
    name: "Amaya Fernando",
    title: "Product Manager",
    company: "Meta",
    avatar: "AF",
    avatarBg: "bg-purple-500",
    rating: 4.8,
    reviews: 89,
    hourlyRate: 6000,
    expertise: ["Product Management", "Strategy", "User Research"],
    industries: ["Tech", "E-commerce"],
    experience: 6,
    languages: ["English"],
    totalSessions: 156,
    responseTime: "< 1 hour",
    verified: true,
    bio: "Former PM at Meta, helping candidates crack product interviews.",
    availableSlots: 8,
  },
  {
    id: 3,
    name: "Ravindu Silva",
    title: "Investment Banking Analyst",
    company: "Goldman Sachs",
    avatar: "RS",
    avatarBg: "bg-green-500",
    rating: 4.7,
    reviews: 64,
    hourlyRate: 7500,
    expertise: ["Finance", "Valuation", "Financial Modeling"],
    industries: ["Banking & Finance", "Consulting"],
    experience: 5,
    languages: ["English", "Tamil"],
    totalSessions: 98,
    responseTime: "< 3 hours",
    verified: true,
    bio: "Goldman Sachs analyst with expertise in M&A and equity research.",
    availableSlots: 5,
  },
  {
    id: 4,
    name: "Nisha Jayawardena",
    title: "Marketing Director",
    company: "Unilever",
    avatar: "NJ",
    avatarBg: "bg-orange-500",
    rating: 4.9,
    reviews: 112,
    hourlyRate: 4500,
    expertise: ["Marketing", "Brand Strategy", "Digital Marketing"],
    industries: ["FMCG", "Retail", "E-commerce"],
    experience: 10,
    languages: ["English", "Sinhala"],
    totalSessions: 203,
    responseTime: "< 4 hours",
    verified: true,
    bio: "10 years at Unilever, expert in marketing and brand management interviews.",
    availableSlots: 15,
  },
  {
    id: 5,
    name: "Tharaka Bandara",
    title: "Data Scientist",
    company: "Amazon",
    avatar: "TB",
    avatarBg: "bg-teal-500",
    rating: 4.6,
    reviews: 45,
    hourlyRate: 5500,
    expertise: ["Machine Learning", "Python", "Statistics"],
    industries: ["Tech", "AI/ML"],
    experience: 4,
    languages: ["English"],
    totalSessions: 67,
    responseTime: "< 2 hours",
    verified: true,
    bio: "Amazon data scientist, specializing in ML system design interviews.",
    availableSlots: 10,
  },
  {
    id: 6,
    name: "Sanduni Wickrama",
    title: "HR Manager",
    company: "Dialog Axiata",
    avatar: "SW",
    avatarBg: "bg-pink-500",
    rating: 4.8,
    reviews: 78,
    hourlyRate: 3500,
    expertise: ["HR", "Behavioral Interviews", "Leadership"],
    industries: ["Telecommunications", "Corporate"],
    experience: 7,
    languages: ["English", "Sinhala", "Tamil"],
    totalSessions: 189,
    responseTime: "< 1 hour",
    verified: true,
    bio: "HR expert helping candidates master behavioral and competency interviews.",
    availableSlots: 20,
  },
];

const industries = [
  "All Industries",
  "IT & Software",
  "Banking & Finance",
  "Telecommunications",
  "FMCG",
  "Consulting",
  "Healthcare",
];

const expertiseAreas = [
  "All Expertise",
  "Software Engineering",
  "Product Management",
  "Finance",
  "Marketing",
  "Data Science",
  "HR & Behavioral",
];

export default function BrowseInterviewersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("All Industries");
  const [selectedExpertise, setSelectedExpertise] = useState("All Expertise");
  const [sortBy, setSortBy] = useState("rating");

  // Filter interviewers
  const filteredInterviewers = interviewersData.filter((interviewer) => {
    const matchesSearch =
      interviewer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      interviewer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      interviewer.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      interviewer.expertise.some((e) =>
        e.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesIndustry =
      selectedIndustry === "All Industries" ||
      interviewer.industries.some((i) =>
        i.toLowerCase().includes(selectedIndustry.toLowerCase())
      );

    const matchesExpertise =
      selectedExpertise === "All Expertise" ||
      interviewer.expertise.some((e) =>
        e.toLowerCase().includes(selectedExpertise.toLowerCase())
      );

    return matchesSearch && matchesIndustry && matchesExpertise;
  });

  // Sort interviewers
  const sortedInterviewers = [...filteredInterviewers].sort((a, b) => {
    if (sortBy === "rating") return b.rating - a.rating;
    if (sortBy === "price-low") return a.hourlyRate - b.hourlyRate;
    if (sortBy === "price-high") return b.hourlyRate - a.hourlyRate;
    if (sortBy === "reviews") return b.reviews - a.reviews;
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
      <p className="text-sm text-gray-600 mb-4">
        Showing {sortedInterviewers.length} interviewers
      </p>

      {/* Interviewers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedInterviewers.map((interviewer) => (
          <Link
            key={interviewer.id}
            href={`/job-seeker/interviewers/${interviewer.id}`}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-blue-200 transition-all group"
          >
            {/* Header */}
            <div className="flex items-start gap-4 mb-4">
              <div
                className={`w-14 h-14 ${interviewer.avatarBg} rounded-full flex items-center justify-center text-white font-semibold text-lg flex-shrink-0`}
              >
                {interviewer.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {interviewer.name}
                  </h3>
                  {interviewer.verified && (
                    <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  )}
                </div>
                <p className="text-sm text-gray-600 truncate">{interviewer.title}</p>
                <p className="text-sm text-gray-500 truncate">
                  <Briefcase className="w-3 h-3 inline mr-1" />
                  {interviewer.company}
                </p>
              </div>
            </div>

            {/* Rating & Price */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="font-semibold text-gray-900">
                  {interviewer.rating}
                </span>
                <span className="text-sm text-gray-500">
                  ({interviewer.reviews} reviews)
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
              {interviewer.expertise.slice(0, 3).map((skill, i) => (
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
                {interviewer.responseTime}
              </span>
              <span>{interviewer.totalSessions} sessions</span>
              <span className="text-green-600 font-medium">
                {interviewer.availableSlots} slots
              </span>
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
    </div>
  );
}
