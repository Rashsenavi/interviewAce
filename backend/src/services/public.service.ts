import { db } from "../config/database";
import { interviewers, users, interviewerReviews, jobSeekers, interviewSessions, sessionFeedback } from "../db/schema";
import { eq, desc, and, sql } from "drizzle-orm";

/**
 * Get top verified interviewers for the public landing page
 */
export const getPublicInterviewers = async (limit = 6) => {
  const rows = await db
    .select({
      id: interviewers.id,
      firstName: users.firstName,
      lastName: users.lastName,
      jobTitle: interviewers.jobTitle,
      currentCompany: interviewers.currentCompany,
      bio: interviewers.bio,
      yearsExperience: interviewers.yearsExperience,
      industryExpertise: interviewers.industryExpertise,
      ratingAverage: interviewers.ratingAverage,
      totalInterviews: interviewers.totalInterviews,
      hourlyRate: interviewers.hourlyRate,
    })
    .from(interviewers)
    .innerJoin(users, eq(interviewers.userId, users.id))
    .where(and(eq(interviewers.isVerified, true), eq(users.isActive, true)))
    .orderBy(desc(interviewers.ratingAverage), desc(interviewers.totalInterviews))
    .limit(limit);

  return rows;
};

/**
 * Get top real testimonials from interviewer_reviews table for the landing page
 * Falls back gracefully — caller handles the fallback to hardcoded data
 */
export const getPublicTestimonials = async (limit = 3) => {
  const rows = await db
    .select({
      id: interviewerReviews.id,
      rating: interviewerReviews.rating,
      reviewText: interviewerReviews.reviewText,
      reviewerFirstName: users.firstName,
      reviewerLastName: users.lastName,
    })
    .from(interviewerReviews)
    .innerJoin(jobSeekers, eq(interviewerReviews.jobSeekerId, jobSeekers.id))
    .innerJoin(users, eq(jobSeekers.userId, users.id))
    .where(eq(interviewerReviews.rating, 5))
    .orderBy(desc(interviewerReviews.createdAt))
    .limit(limit);

  return rows;
};

/**
 * Get public database statistics for the landing page
 */
export const getPublicStats = async () => {
  // 1. Total Completed Sessions count
  const [sessionCountResult] = await db
    .select({
      count: sql<number>`count(*)::int`,
    })
    .from(interviewSessions)
    .where(eq(interviewSessions.sessionStatus, "completed"));
  const sessionsCompleted = sessionCountResult?.count ?? 0;

  // 2. Verified Interviewers count
  const [interviewerCountResult] = await db
    .select({
      count: sql<number>`count(*)::int`,
    })
    .from(interviewers)
    .where(eq(interviewers.isVerified, true));
  const verifiedInterviewers = interviewerCountResult?.count ?? 0;

  // 3. Average Rating of verified interviewers
  const [ratingResult] = await db
    .select({
      avgRating: sql<number>`coalesce(avg(cast(${interviewerReviews.rating} as float)), 4.8)::float`,
    })
    .from(interviewerReviews);
  const averageRating = ratingResult?.avgRating ?? 4.8;

  // 4. Average Confidence Gain / Confidence Rating
  const [confidenceResult] = await db
    .select({
      avgConfidence: sql<number>`coalesce(avg(cast(${sessionFeedback.confidenceRating} as float)), 4.5)::float`,
    })
    .from(sessionFeedback);
  
  const avgConfidence = confidenceResult?.avgConfidence ?? 4.5;
  const confidenceGain = Math.round((avgConfidence / 5) * 50); // e.g. 4.5/5 * 50 = 45%

  return {
    sessionsCompleted,
    verifiedInterviewers,
    averageRating: parseFloat(averageRating.toFixed(1)),
    confidenceGain,
  };
};
