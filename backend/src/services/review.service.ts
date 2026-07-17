import { db } from "../config/database";
import { interviewerReviews, jobSeekers, users, interviewers } from "../db/schema";
import { eq, desc, sql, avg, count } from "drizzle-orm";

export async function createReview(data: {
  sessionId: number;
  jobSeekerId: number;
  interviewerId: number;
  rating: number;
  reviewText: string;
  isKnowledgeable: boolean;
  isHelpful: boolean;
  isActionable: boolean;
  isProfessional: boolean;
}) {
  return await db.transaction(async (tx) => {
    // 1. Insert the review
    const [review] = await tx.insert(interviewerReviews).values(data).returning();

    // 2. Recalculate rating average and total count for this interviewer
    const [stats] = await tx
      .select({
        avgRating: avg(interviewerReviews.rating),
        totalCount: count(interviewerReviews.id),
      })
      .from(interviewerReviews)
      .where(eq(interviewerReviews.interviewerId, data.interviewerId));

    const avgRatingVal = stats?.avgRating ? parseFloat(Number(stats.avgRating).toFixed(2)) : 0;
    const totalCountVal = stats?.totalCount ? Number(stats.totalCount) : 0;

    // 3. Update the interviewer's public profile stats in the DB
    await tx
      .update(interviewers)
      .set({
        ratingAverage: avgRatingVal.toFixed(2),
        totalInterviews: totalCountVal,
        updatedAt: new Date(),
      })
      .where(eq(interviewers.id, data.interviewerId));

    return review;
  });
}

export async function getInterviewerReviews(interviewerId: number) {
  // We need to join with jobSeekers and users to get the Job Seeker's details
  const reviews = await db
    .select({
      id: interviewerReviews.id,
      sessionId: interviewerReviews.sessionId,
      rating: interviewerReviews.rating,
      reviewText: interviewerReviews.reviewText,
      isKnowledgeable: interviewerReviews.isKnowledgeable,
      isHelpful: interviewerReviews.isHelpful,
      isActionable: interviewerReviews.isActionable,
      isProfessional: interviewerReviews.isProfessional,
      createdAt: interviewerReviews.createdAt,
      jobSeekerUniversity: jobSeekers.university,
      jobSeekerFirstName: users.firstName,
      jobSeekerLastName: users.lastName,
    })
    .from(interviewerReviews)
    .innerJoin(jobSeekers, eq(interviewerReviews.jobSeekerId, jobSeekers.id))
    .innerJoin(users, eq(jobSeekers.userId, users.id))
    .where(eq(interviewerReviews.interviewerId, interviewerId))
    .orderBy(desc(interviewerReviews.createdAt));
    
  return reviews.map(r => ({
    id: r.id,
    sessionId: r.sessionId,
    rating: r.rating,
    reviewText: r.reviewText,
    isKnowledgeable: r.isKnowledgeable,
    isHelpful: r.isHelpful,
    isActionable: r.isActionable,
    isProfessional: r.isProfessional,
    createdAt: r.createdAt,
    jobSeekerName: `${r.jobSeekerFirstName} ${r.jobSeekerLastName}`,
    jobSeekerUniversity: r.jobSeekerUniversity,
  }));
}

export async function getInterviewerReviewStats(interviewerId: number) {
  const allReviews = await getInterviewerReviews(interviewerId);
  
  if (allReviews.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      fiveStarRate: 0,
      positiveRate: 0,
      ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      tags: { helpful: 0, knowledgeable: 0, actionable: 0, professional: 0 }
    };
  }

  const totalReviews = allReviews.length;
  let totalRating = 0;
  let fiveStarCount = 0;
  let positiveCount = 0; // 4 or 5 stars

  const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  const tagsCount = { helpful: 0, knowledgeable: 0, actionable: 0, professional: 0 };

  allReviews.forEach(r => {
    totalRating += r.rating;
    if (r.rating === 5) fiveStarCount++;
    if (r.rating >= 4) positiveCount++;
    
    // @ts-ignore
    breakdown[r.rating]++;

    if (r.isHelpful) tagsCount.helpful++;
    if (r.isKnowledgeable) tagsCount.knowledgeable++;
    if (r.isActionable) tagsCount.actionable++;
    if (r.isProfessional) tagsCount.professional++;
  });

  return {
    averageRating: Number((totalRating / totalReviews).toFixed(1)),
    totalReviews,
    fiveStarRate: Math.round((fiveStarCount / totalReviews) * 100),
    positiveRate: Math.round((positiveCount / totalReviews) * 100),
    ratingBreakdown: breakdown,
    tags: {
      helpful: Math.round((tagsCount.helpful / totalReviews) * 100),
      knowledgeable: Math.round((tagsCount.knowledgeable / totalReviews) * 100),
      actionable: Math.round((tagsCount.actionable / totalReviews) * 100),
      professional: Math.round((tagsCount.professional / totalReviews) * 100),
    },
    recentReviews: allReviews.slice(0, 5) // Return top 5 most recent for the dashboard
  };
}

export async function resolveJobSeekerIdByUserId(userId: number): Promise<number | null> {
  const [record] = await db
    .select({ id: jobSeekers.id })
    .from(jobSeekers)
    .where(eq(jobSeekers.userId, userId))
    .limit(1);
  return record ? record.id : null;
}

export async function resolveInterviewerIdByUserId(userId: number): Promise<number | null> {
  const [record] = await db
    .select({ id: interviewers.id })
    .from(interviewers)
    .where(eq(interviewers.userId, userId))
    .limit(1);
  return record ? record.id : null;
}
