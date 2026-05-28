"use client";

import { useEffect, useState } from "react";
import { reviewApi } from "@/lib/api";
import { Star, MessageSquare, ThumbsUp, TrendingUp, Filter, MessageCircle } from "lucide-react";
import { format } from "date-fns";

export default function InterviewerFeedbackDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState<number | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await reviewApi.fetchMyInterviewerReviews();
        if (res?.success && res.data) {
          setStats(res.data.stats);
        }
      } catch (err) {
        console.error("Failed to load review stats", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!stats || stats.totalReviews === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
        <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-800">No Reviews Yet</h2>
        <p className="text-gray-500 mt-2">Complete some interview sessions to start receiving feedback and reviews from job seekers.</p>
      </div>
    );
  }

  const filteredReviews = filterRating 
    ? stats.recentReviews.filter((r: any) => r.rating === filterRating)
    : stats.recentReviews;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Feedback & Reviews</h1>
        <p className="text-gray-500">See what candidates are saying about your sessions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Average Rating" value={stats.averageRating.toString()} icon={<Star className="h-6 w-6 text-yellow-500 fill-current" />} />
        <StatCard title="Total Reviews" value={stats.totalReviews.toString()} icon={<MessageSquare className="h-6 w-6 text-blue-500" />} />
        <StatCard title="5-Star Rate" value={`${stats.fiveStarRate}%`} icon={<TrendingUp className="h-6 w-6 text-green-500" />} />
        <StatCard title="Positive (4-5★)" value={`${stats.positiveRate}%`} icon={<ThumbsUp className="h-6 w-6 text-emerald-500" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Review List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
            <div className="flex items-center space-x-2 text-sm">
              <Filter className="h-4 w-4 text-gray-400" />
              <span className="text-gray-500">Filter by rating:</span>
              <div className="flex space-x-1">
                <FilterBadge active={filterRating === null} onClick={() => setFilterRating(null)}>All</FilterBadge>
                <FilterBadge active={filterRating === 5} onClick={() => setFilterRating(5)}>5 ★</FilterBadge>
                <FilterBadge active={filterRating === 4} onClick={() => setFilterRating(4)}>4 ★</FilterBadge>
                <FilterBadge active={filterRating === 3} onClick={() => setFilterRating(3)}>3 ★</FilterBadge>
                <FilterBadge active={filterRating === 2} onClick={() => setFilterRating(2)}>2 ★</FilterBadge>
                <FilterBadge active={filterRating === 1} onClick={() => setFilterRating(1)}>1 ★</FilterBadge>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {filteredReviews.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-xl shadow-sm border border-gray-100">
                <p className="text-gray-500">No reviews found for this rating.</p>
              </div>
            ) : (
              filteredReviews.map((review: any) => (
                <div key={review.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                        {review.jobSeekerName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{review.jobSeekerName}</h3>
                        <p className="text-sm text-gray-500">{review.jobSeekerUniversity || "Candidate"}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex text-yellow-400 mb-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${i < review.rating ? "fill-current" : "text-gray-200"}`} />
                        ))}
                      </div>
                      <p className="text-xs text-gray-400">{format(new Date(review.createdAt), "MMM d, yyyy")}</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-4">{review.reviewText}</p>
                  
                  <div className="flex flex-wrap gap-2">
                    {review.isKnowledgeable && <Tag>Knowledgeable</Tag>}
                    {review.isHelpful && <Tag>Helpful</Tag>}
                    {review.isActionable && <Tag>Actionable</Tag>}
                    {review.isProfessional && <Tag>Professional</Tag>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Breakdown */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-6">Rating Breakdown</h3>
            <div className="flex items-center mb-6">
              <div className="text-4xl font-bold text-gray-900 mr-4">{stats.averageRating}</div>
              <div>
                <div className="flex text-yellow-400 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-5 w-5 ${i < Math.round(stats.averageRating) ? "fill-current" : "text-gray-200"}`} />
                  ))}
                </div>
                <p className="text-sm text-gray-500">{stats.totalReviews} reviews</p>
              </div>
            </div>
            
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map(star => (
                <div key={star} className="flex items-center text-sm">
                  <span className="w-4">{star}</span>
                  <Star className="h-3 w-3 text-yellow-400 mx-1 fill-current" />
                  <div className="flex-1 mx-2 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-yellow-400 rounded-full" 
                      style={{ width: `${(stats.ratingBreakdown[star as keyof typeof stats.ratingBreakdown] / stats.totalReviews) * 100}%` }}
                    />
                  </div>
                  <span className="w-4 text-right text-gray-500">{stats.ratingBreakdown[star as keyof typeof stats.ratingBreakdown]}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-6">What Candidates Appreciate</h3>
            <div className="space-y-4">
              <AppreciationBar label="Helpful" percentage={stats.tags.helpful} icon="👍" color="bg-blue-500" />
              <AppreciationBar label="Knowledgeable" percentage={stats.tags.knowledgeable} icon="💡" color="bg-emerald-500" />
              <AppreciationBar label="Actionable" percentage={stats.tags.actionable} icon="🎯" color="bg-green-500" />
              <AppreciationBar label="Professional" percentage={stats.tags.professional} icon="👔" color="bg-purple-500" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
      <div className="mr-4 bg-gray-50 p-4 rounded-full">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      </div>
    </div>
  );
}

function FilterBadge({ active, children, onClick }: { active: boolean, children: React.ReactNode, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${active ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
    >
      {children}
    </button>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
      {children}
    </span>
  );
}

function AppreciationBar({ label, percentage, icon, color }: { label: string, percentage: number, icon: string, color: string }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1 text-sm font-medium">
        <span className="flex items-center"><span className="mr-2">{icon}</span> {label}</span>
        <span className="text-gray-500">{percentage}%</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-1.5">
        <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
}
