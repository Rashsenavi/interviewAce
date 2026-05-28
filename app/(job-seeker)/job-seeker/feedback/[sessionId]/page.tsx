"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { feedbackApi } from "@/lib/api";
import { Star, ArrowLeft, CheckCircle2, AlertTriangle, Lightbulb } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default function SessionFeedbackDetail() {
  const params = useParams();
  const router = useRouter();
  const [feedback, setFeedback] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await feedbackApi.fetchSessionFeedback(params.sessionId as string);
        if (res?.success && res.data) {
          setFeedback(res.data.feedback);
        }
      } catch (err) {
        console.error("Failed to load feedback details", err);
      } finally {
        setLoading(false);
      }
    }
    if (params.sessionId) {
      loadData();
    }
  }, [params.sessionId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800">Feedback Not Found</h2>
        <p className="text-gray-500 mt-2">This session either doesn't exist or feedback hasn't been submitted yet.</p>
        <button onClick={() => router.back()} className="mt-4 text-indigo-600 hover:text-indigo-800 font-medium">
          &larr; Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <Link href="/job-seeker/feedback" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mb-4 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Session Feedback</h1>
            <p className="text-gray-500">
              Submitted on {format(new Date(feedback.createdAt), "MMMM d, yyyy 'at' h:mm a")}
            </p>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100 flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-500">Overall Score:</span>
            <div className="flex items-center">
              <Star className="h-5 w-5 text-yellow-500 fill-current" />
              <span className="ml-1 text-lg font-bold text-gray-900">{feedback.overallRating}/5</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ratings Grid */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-800 mb-6">Detailed Ratings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <RatingBar label="Communication Skills" rating={feedback.communicationRating} />
          <RatingBar label="Technical Knowledge" rating={feedback.technicalRating} />
          <RatingBar label="Problem Solving" rating={feedback.problemSolvingRating} />
          <RatingBar label="Confidence & Delivery" rating={feedback.confidenceRating} />
        </div>
      </div>

      {/* Written Feedback Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FeedbackSection 
          title="Strengths" 
          icon={<CheckCircle2 className="h-6 w-6 text-green-500" />}
          content={feedback.strengths}
          borderColor="border-green-200"
          bgColor="bg-green-50"
        />
        <FeedbackSection 
          title="Areas for Improvement" 
          icon={<AlertTriangle className="h-6 w-6 text-orange-500" />}
          content={feedback.weaknesses}
          borderColor="border-orange-200"
          bgColor="bg-orange-50"
        />
        <FeedbackSection 
          title="Actionable Tips" 
          icon={<Lightbulb className="h-6 w-6 text-indigo-500" />}
          content={feedback.improvementTips}
          borderColor="border-indigo-200"
          bgColor="bg-indigo-50"
        />
      </div>

      {/* General Comments */}
      {feedback.generalComments && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4">General Comments</h2>
          <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
            {feedback.generalComments}
          </div>
        </div>
      )}
    </div>
  );
}

function RatingBar({ label, rating }: { label: string; rating: number }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-bold text-gray-900">{rating}/5</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2.5">
        <div 
          className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500" 
          style={{ width: `${(rating / 5) * 100}%` }}
        ></div>
      </div>
    </div>
  );
}

function FeedbackSection({ title, icon, content, borderColor, bgColor }: { title: string, icon: React.ReactNode, content: string, borderColor: string, bgColor: string }) {
  return (
    <div className={`p-6 rounded-xl border ${borderColor} ${bgColor} flex flex-col h-full`}>
      <div className="flex items-center space-x-3 mb-4">
        {icon}
        <h3 className="font-bold text-gray-900">{title}</h3>
      </div>
      <p className="text-gray-700 whitespace-pre-wrap flex-grow">{content}</p>
    </div>
  );
}
