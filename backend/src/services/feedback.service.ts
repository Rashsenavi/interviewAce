import { db } from "../config/database";
import { sessionFeedback, interviewerReviews, jobSeekers, users, interviewSessions } from "../db/schema";
import { eq, desc, avg, count } from "drizzle-orm";

export async function createFeedback(data: {
  sessionId: number;
  interviewerId: number;
  jobSeekerId: number;
  overallRating: number;
  communicationRating: number;
  technicalRating: number;
  problemSolvingRating: number;
  confidenceRating: number;
  strengths: string;
  weaknesses: string;
  improvementTips: string;
  generalComments?: string;
}) {
  const existing = await db
    .select()
    .from(sessionFeedback)
    .where(eq(sessionFeedback.sessionId, data.sessionId))
    .limit(1);

  if (existing.length > 0) {
    const result = await db
      .update(sessionFeedback)
      .set(data)
      .where(eq(sessionFeedback.sessionId, data.sessionId))
      .returning();
    return result[0];
  }

  const result = await db.insert(sessionFeedback).values(data).returning();
  return result[0];
}

export async function getFeedbackForJobSeeker(jobSeekerId: number) {
  return db
    .select()
    .from(sessionFeedback)
    .where(eq(sessionFeedback.jobSeekerId, jobSeekerId))
    .orderBy(desc(sessionFeedback.createdAt));
}

export async function getFeedbackBySession(sessionId: number) {
  const result = await db
    .select()
    .from(sessionFeedback)
    .where(eq(sessionFeedback.sessionId, sessionId));
  return result[0] || null;
}

export async function getJobSeekerFeedbackStats(jobSeekerId: number) {
  const all = await db
    .select()
    .from(sessionFeedback)
    .where(eq(sessionFeedback.jobSeekerId, jobSeekerId))
    .orderBy(desc(sessionFeedback.createdAt)); // Oldest to newest for trend graph

  if (all.length === 0) return null;

  const avg = (key: keyof typeof all[0]) =>
    Number(
      (all.reduce((sum, f) => sum + (f[key] as number), 0) / all.length).toFixed(1)
    );

  return {
    totalSessions: all.length,
    overallRating: avg("overallRating"),
    communicationRating: avg("communicationRating"),
    technicalRating: avg("technicalRating"),
    problemSolvingRating: avg("problemSolvingRating"),
    confidenceRating: avg("confidenceRating"),
    trend: all.reverse().map((f) => ({ // Reverse to make it chronological
      date: f.createdAt,
      overall: f.overallRating,
    })),
  };
}

export async function submitInterviewerReview(data: {
  sessionId: number;
  jobSeekerId: number;
  interviewerId: number;
  rating: number;
  reviewText: string;
}) {
  const result = await db.insert(interviewerReviews).values(data).returning();
  return result[0];
}

export async function getInterviewerAnalytics(interviewerId: number) {
  // 1. Get aggregate stats
  const [stats] = await db
    .select({
      averageRating: avg(interviewerReviews.rating),
      totalReviews: count(interviewerReviews.id),
    })
    .from(interviewerReviews)
    .where(eq(interviewerReviews.interviewerId, interviewerId));

  // 2. Get total completed sessions
  const [sessionStats] = await db
    .select({
      totalSessions: count(interviewSessions.id),
    })
    .from(interviewSessions)
    .where(eq(interviewSessions.interviewerId, interviewerId));

  // 3. Get recent reviews with job seeker details
  const reviews = await db
    .select({
      id: interviewerReviews.id,
      rating: interviewerReviews.rating,
      reviewText: interviewerReviews.reviewText,
      createdAt: interviewerReviews.createdAt,
      jobSeeker: {
        id: jobSeekers.id,
        firstName: users.firstName,
        lastName: users.lastName,
      },
    })
    .from(interviewerReviews)
    .innerJoin(jobSeekers, eq(interviewerReviews.jobSeekerId, jobSeekers.id))
    .innerJoin(users, eq(jobSeekers.userId, users.id))
    .where(eq(interviewerReviews.interviewerId, interviewerId))
    .orderBy(desc(interviewerReviews.createdAt));

  return {
    averageRating: stats?.averageRating ? parseFloat(Number(stats.averageRating).toFixed(1)) : 0,
    totalReviews: Number(stats?.totalReviews || 0),
    totalSessions: Number(sessionStats?.totalSessions || 0),
    reviews: reviews.map((r) => ({
      ...r,
      jobSeekerName: `${r.jobSeeker.firstName} ${r.jobSeeker.lastName}`,
    })),
  };
}
