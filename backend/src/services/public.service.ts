import { db } from "../config/database";
import { interviewers, users, interviewerReviews, jobSeekers, interviewSessions } from "../db/schema";
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
