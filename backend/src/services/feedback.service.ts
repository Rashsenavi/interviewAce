import { eq, and } from "drizzle-orm";
import { db } from "../config/database";
import {
  feedback,
  interviewSessions,
  interviewers,
  jobSeekers,
  users,
} from "../db/schema";

export interface SubmitFeedbackInput {
  sessionId: number;
  givenByUserId: number;
  feedbackForUserId: number;
  feedbackType: "seeker_to_interviewer" | "interviewer_to_seeker";
  ratingOverall: number;
  ratingCommunication?: number;
  ratingTechnical?: number;
  ratingProfessionalism?: number;
  ratingHelpfulness?: number;
  writtenFeedback?: string;
  improvementSuggestions?: string;
  strengthsIdentified?: string;
  wouldRecommend?: boolean;
  isAnonymous?: boolean;
}

/**
 * Get sessions that a job seeker has completed but not yet reviewed
 */
export const getPendingFeedbackForJobSeeker = async (userId: number) => {
  // Get job seeker id
  const [jobSeeker] = await db
    .select({ id: jobSeekers.id })
    .from(jobSeekers)
    .where(eq(jobSeekers.userId, userId))
    .limit(1);

  if (!jobSeeker) return [];

  // Get all completed sessions for this job seeker
  const completedSessions = await db
    .select({
      sessionId: interviewSessions.id,
      sessionType: interviewSessions.sessionType,
      scheduledDate: interviewSessions.scheduledDate,
      duration: interviewSessions.duration,
      priceAmount: interviewSessions.priceAmount,
      interviewerUserId: interviewers.userId,
      interviewerFirstName: users.firstName,
      interviewerLastName: users.lastName,
      interviewerJobTitle: interviewers.jobTitle,
      interviewerCompany: interviewers.currentCompany,
    })
    .from(interviewSessions)
    .innerJoin(interviewers, eq(interviewSessions.interviewerId, interviewers.id))
    .innerJoin(users, eq(interviewers.userId, users.id))
    .where(
      and(
        eq(interviewSessions.jobSeekerId, jobSeeker.id),
        eq(interviewSessions.sessionStatus, "completed")
      )
    );

  if (completedSessions.length === 0) return [];

  // Get sessions that already have seeker-to-interviewer feedback
  const sessionIds = completedSessions.map((s) => s.sessionId);
  const existingFeedback = await db
    .select({ sessionId: feedback.sessionId })
    .from(feedback)
    .where(
      and(
        eq(feedback.givenByUserId, userId),
        eq(feedback.feedbackType, "seeker_to_interviewer")
      )
    );

  const reviewedSessionIds = new Set(existingFeedback.map((f) => f.sessionId));

  // Return sessions without feedback
  return completedSessions
    .filter((s) => !reviewedSessionIds.has(s.sessionId))
    .map((s) => ({
      sessionId: s.sessionId,
      sessionType: s.sessionType,
      scheduledDate: s.scheduledDate,
      duration: s.duration,
      priceAmount: parseFloat(s.priceAmount || "0"),
      interviewer: {
        userId: s.interviewerUserId,
        firstName: s.interviewerFirstName,
        lastName: s.interviewerLastName,
        jobTitle: s.interviewerJobTitle,
        company: s.interviewerCompany,
      },
    }));
};

/**
 * Get feedback submitted by a job seeker
 */
export const getSubmittedFeedbackByJobSeeker = async (userId: number) => {
  const submitted = await db
    .select({
      id: feedback.id,
      sessionId: feedback.sessionId,
      ratingOverall: feedback.ratingOverall,
      ratingCommunication: feedback.ratingCommunication,
      ratingTechnical: feedback.ratingTechnical,
      ratingProfessionalism: feedback.ratingProfessionalism,
      ratingHelpfulness: feedback.ratingHelpfulness,
      writtenFeedback: feedback.writtenFeedback,
      strengthsIdentified: feedback.strengthsIdentified,
      wouldRecommend: feedback.wouldRecommend,
      createdAt: feedback.createdAt,
      sessionType: interviewSessions.sessionType,
      scheduledDate: interviewSessions.scheduledDate,
      interviewerUserId: interviewers.userId,
      interviewerFirstName: users.firstName,
      interviewerLastName: users.lastName,
      interviewerJobTitle: interviewers.jobTitle,
      interviewerCompany: interviewers.currentCompany,
    })
    .from(feedback)
    .innerJoin(interviewSessions, eq(feedback.sessionId, interviewSessions.id))
    .innerJoin(interviewers, eq(interviewSessions.interviewerId, interviewers.id))
    .innerJoin(users, eq(interviewers.userId, users.id))
    .where(
      and(
        eq(feedback.givenByUserId, userId),
        eq(feedback.feedbackType, "seeker_to_interviewer")
      )
    );

  return submitted.map((f) => ({
    id: f.id,
    sessionId: f.sessionId,
    ratingOverall: f.ratingOverall,
    ratingCommunication: f.ratingCommunication,
    ratingTechnical: f.ratingTechnical,
    ratingProfessionalism: f.ratingProfessionalism,
    ratingHelpfulness: f.ratingHelpfulness,
    writtenFeedback: f.writtenFeedback,
    strengthsIdentified: f.strengthsIdentified,
    wouldRecommend: f.wouldRecommend,
    createdAt: f.createdAt,
    session: {
      type: f.sessionType,
      date: f.scheduledDate,
    },
    interviewer: {
      userId: f.interviewerUserId,
      firstName: f.interviewerFirstName,
      lastName: f.interviewerLastName,
      jobTitle: f.interviewerJobTitle,
      company: f.interviewerCompany,
    },
  }));
};

/**
 * Submit feedback for a session
 */
export const submitFeedback = async (input: SubmitFeedbackInput) => {
  // Verify the session exists and is completed
  const [session] = await db
    .select({ id: interviewSessions.id, sessionStatus: interviewSessions.sessionStatus })
    .from(interviewSessions)
    .where(eq(interviewSessions.id, input.sessionId))
    .limit(1);

  if (!session) {
    const error = new Error("Session not found") as Error & { status?: number; code?: string };
    error.status = 404;
    error.code = "SESSION_NOT_FOUND";
    throw error;
  }

  if (session.sessionStatus !== "completed") {
    const error = new Error("Can only submit feedback for completed sessions") as Error & { status?: number; code?: string };
    error.status = 400;
    error.code = "SESSION_NOT_COMPLETED";
    throw error;
  }

  // Check for existing feedback
  const [existing] = await db
    .select({ id: feedback.id })
    .from(feedback)
    .where(
      and(
        eq(feedback.sessionId, input.sessionId),
        eq(feedback.givenByUserId, input.givenByUserId),
        eq(feedback.feedbackType, input.feedbackType)
      )
    )
    .limit(1);

  if (existing) {
    const error = new Error("Feedback already submitted for this session") as Error & { status?: number; code?: string };
    error.status = 409;
    error.code = "FEEDBACK_ALREADY_EXISTS";
    throw error;
  }

  const [newFeedback] = await db
    .insert(feedback)
    .values({
      sessionId: input.sessionId,
      givenByUserId: input.givenByUserId,
      feedbackForUserId: input.feedbackForUserId,
      feedbackType: input.feedbackType,
      ratingOverall: input.ratingOverall,
      ratingCommunication: input.ratingCommunication,
      ratingTechnical: input.ratingTechnical,
      ratingProfessionalism: input.ratingProfessionalism,
      ratingHelpfulness: input.ratingHelpfulness,
      writtenFeedback: input.writtenFeedback,
      improvementSuggestions: input.improvementSuggestions,
      strengthsIdentified: input.strengthsIdentified,
      wouldRecommend: input.wouldRecommend,
      isAnonymous: input.isAnonymous ?? false,
    })
    .returning();

  // Update interviewer's average rating
  if (input.feedbackType === "seeker_to_interviewer") {
    const allRatings = await db
      .select({ ratingOverall: feedback.ratingOverall })
      .from(feedback)
      .where(
        and(
          eq(feedback.feedbackForUserId, input.feedbackForUserId),
          eq(feedback.feedbackType, "seeker_to_interviewer")
        )
      );

    const validRatings = allRatings.filter((r) => r.ratingOverall !== null);
    if (validRatings.length > 0) {
      const avg = validRatings.reduce((acc, r) => acc + (r.ratingOverall ?? 0), 0) / validRatings.length;
      // Update interviewer rating
      await db
        .update(interviewers)
        .set({
          ratingAverage: avg.toFixed(2),
          updatedAt: new Date(),
        })
        .where(eq(interviewers.userId, input.feedbackForUserId));
    }
  }

  return newFeedback;
};

export default {
  getPendingFeedbackForJobSeeker,
  getSubmittedFeedbackByJobSeeker,
  submitFeedback,
};
