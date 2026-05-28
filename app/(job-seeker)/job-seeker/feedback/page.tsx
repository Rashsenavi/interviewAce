"use client";

import { useEffect, useState } from "react";
import { feedbackApi } from "@/lib/api";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { Star, MessageSquare, Briefcase, ChevronRight, Activity } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default function FeedbackDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [feedbackList, setFeedbackList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsRes, listRes] = await Promise.all([
          feedbackApi.fetchMyFeedbackStats(),
          feedbackApi.fetchMyFeedback()
        ]);
        if (statsRes?.success && statsRes.data) {
          setStats(statsRes.data.stats);
        }
        if (listRes?.success && listRes.data) {
          setFeedbackList(listRes.data.feedback);
        }
      } catch (err) {
        console.error("Failed to load feedback data", err);
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

  if (!stats) {
    return (
      <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
        <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-800">No Feedback Yet</h2>
        <p className="text-gray-500 mt-2">Complete some interview sessions to start receiving feedback and ratings.</p>
      </div>
    );
  }

  // Data for the radar/bar chart
  const categoryData = [
    { name: "Communication", score: stats.communicationRating },
    { name: "Technical", score: stats.technicalRating },
    { name: "Problem Solving", score: stats.problemSolvingRating },
    { name: "Confidence", score: stats.confidenceRating },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Feedback & Ratings</h1>
        <p className="text-gray-500">Track your interview performance and identify areas for improvement.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Overall Rating" value={stats.overallRating} icon={<Star className="h-5 w-5 text-yellow-500" />} />
        <StatCard title="Communication" value={stats.communicationRating} icon={<MessageSquare className="h-5 w-5 text-blue-500" />} />
        <StatCard title="Technical" value={stats.technicalRating} icon={<Briefcase className="h-5 w-5 text-purple-500" />} />
        <StatCard title="Problem Solving" value={stats.problemSolvingRating} icon={<Activity className="h-5 w-5 text-green-500" />} />
        <StatCard title="Confidence" value={stats.confidenceRating} icon={<Activity className="h-5 w-5 text-orange-500" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-6">Skill Breakdown</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} />
                <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
                <Tooltip />
                <Bar dataKey="score" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-6">Recent Sessions</h2>
          <div className="space-y-4">
            {feedbackList.slice(0, 5).map((feedback) => (
              <Link 
                key={feedback.id} 
                href={`/job-seeker/feedback/${feedback.sessionId}`}
                className="block p-4 border border-gray-100 rounded-lg hover:border-indigo-500 transition-colors group"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                      Session #{feedback.sessionId}
                    </p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(feedback.createdAt), "MMM d, yyyy")}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-md">
                      <Star className="h-4 w-4 text-yellow-500 mr-1 fill-current" />
                      <span className="font-medium text-yellow-700">{feedback.overallRating.toFixed(1)}</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-indigo-500" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
      <div className="mb-2 bg-gray-50 p-3 rounded-full">
        {icon}
      </div>
      <p className="text-3xl font-bold text-gray-900">{Number(value).toFixed(1)}</p>
      <h3 className="text-sm font-medium text-gray-500 mt-1">{title}</h3>
    </div>
  );
}
