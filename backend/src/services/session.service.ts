import { eq, and, gte, desc, asc } from "drizzle-orm";
import { db } from "../config/database";
import {
  interviewSessions,
  jobSeekers,
  interviewers,
  users,
  payments,
  feedback,
  rescheduleRequests,
  sessionFeedback,
} from "../db/schema";

export interface CreateSessionInput {
  jobSeekerUserId: number;
  interviewerUserId: number;
  industryId?: number;
  sessionType: "behavioral" | "technical" | "case_study" | "mixed";
  scheduledDate: Date;
  duration: number;
  notes?: string;
  recordingConsent?: boolean;
}

import { meetingService } from "./meetings/MeetingService";
import { cancelSessionPayment } from "./payment.service";
import { notifySessionStateChange } from "../utils/notification.utils";

/**
 * Create a new interview session
 */
export const createSession = async (input: CreateSessionInput) => {
  // Get job seeker id
  const [jobSeeker] = await db
    .select({ id: jobSeekers.id })
    .from(jobSeekers)
    .where(eq(jobSeekers.userId, input.jobSeekerUserId))
    .limit(1);

  if (!jobSeeker) {
    const error = new Error("Job seeker not found") as Error & { status?: number; code?: string };
    error.status = 404;
    error.code = "JOB_SEEKER_NOT_FOUND";
    throw error;
  }

  // Get interviewer id and preference
  const [interviewer] = await db
    .select({ 
      id: interviewers.id,
      preferredMeetingPlatform: interviewers.preferredMeetingPlatform,
      hourlyRate: interviewers.hourlyRate,
      commissionRate: interviewers.commissionRate
    })
    .from(interviewers)
    .where(eq(interviewers.userId, input.interviewerUserId))
    .limit(1);

  if (!interviewer) {
    const error = new Error("Interviewer not found") as Error & { status?: number; code?: string };
    error.status = 404;
    error.code = "INTERVIEWER_NOT_FOUND";
    throw error;
  }

  // Calculate total price (Base Rate + System Fee on top)
  const baseRate = (parseFloat(interviewer.hourlyRate) / 60) * input.duration;
  const commissionRate = parseFloat(interviewer.commissionRate || "20");
  const platformCommission = baseRate * (commissionRate / 100);
  let totalPrice = Math.round((baseRate + platformCommission) * 100) / 100;
  
  // Ensure PayHere minimum limit (30 LKR)
  if (totalPrice < 30) {
    totalPrice = 30;
  }

  // Create session
  const [session] = await db
    .insert(interviewSessions)
    .values({
      jobSeekerId: jobSeeker.id,
      interviewerId: interviewer.id,
      industryId: input.industryId,
      sessionType: input.sessionType,
      scheduledDate: input.scheduledDate,
      duration: input.duration,
      priceAmount: totalPrice.toString(),
      notes: input.notes,
      recordingConsent: input.recordingConsent ?? false,
      meetingLink: null, // Defer meeting link generation until confirmation
    })
    .returning();

  return session;
};

/**
 * Get sessions for a job seeker
 */
export const getJobSeekerSessions = async (
  userId: number,
  status?: string,
  upcoming?: boolean
) => {
  // Get job seeker id
  const [jobSeeker] = await db
    .select({ id: jobSeekers.id })
    .from(jobSeekers)
    .where(eq(jobSeekers.userId, userId))
    .limit(1);

  if (!jobSeeker) {
    return [];
  }

  const query = db
    .select({
      id: interviewSessions.id,
      sessionType: interviewSessions.sessionType,
      scheduledDate: interviewSessions.scheduledDate,
      duration: interviewSessions.duration,
      meetingLink: interviewSessions.meetingLink,
      sessionStatus: interviewSessions.sessionStatus,
      priceAmount: interviewSessions.priceAmount,
      cancellationReason: interviewSessions.cancellationReason,
      notes: interviewSessions.notes,
      createdAt: interviewSessions.createdAt,
      interviewer: {
        id: interviewers.id,
        userId: interviewers.userId,
        firstName: users.firstName,
        lastName: users.lastName,
        currentCompany: interviewers.currentCompany,
        jobTitle: interviewers.jobTitle,
        ratingAverage: interviewers.ratingAverage,
        isVerified: interviewers.isVerified,
      },
    })
    .from(interviewSessions)
    .innerJoin(interviewers, eq(interviewSessions.interviewerId, interviewers.id))
    .innerJoin(users, eq(interviewers.userId, users.id))
    .where(eq(interviewSessions.jobSeekerId, jobSeeker.id))
    .orderBy(desc(interviewSessions.scheduledDate));

  const sessions = await query;

  const mapped = sessions.map((s) => ({
    ...s,
    priceAmount: parseFloat(s.priceAmount || "0"),
    interviewer: {
      ...s.interviewer,
      ratingAverage: parseFloat(s.interviewer.ratingAverage || "0"),
    },
  }));

  // Filter upcoming (scheduled/rescheduled in the future)
  if (upcoming) {
    const now = new Date();
    return mapped.filter(
      (s) =>
        (s.sessionStatus === "scheduled" || s.sessionStatus === "rescheduled") &&
        new Date(s.scheduledDate!) > now
    );
  }

  // Filter by status if provided
  if (status) {
    return mapped.filter((s) => s.sessionStatus === status);
  }

  return mapped;
};

/**
 * Get sessions for an interviewer
 */
export const getInterviewerSessions = async (
  userId: number,
  status?: string,
  upcoming?: boolean
) => {
  // Get interviewer id
  const [interviewer] = await db
    .select({ id: interviewers.id })
    .from(interviewers)
    .where(eq(interviewers.userId, userId))
    .limit(1);

  if (!interviewer) {
    return [];
  }

  const sessions = await db
    .select({
      id: interviewSessions.id,
      sessionType: interviewSessions.sessionType,
      scheduledDate: interviewSessions.scheduledDate,
      duration: interviewSessions.duration,
      meetingLink: interviewSessions.meetingLink,
      sessionStatus: interviewSessions.sessionStatus,
      priceAmount: interviewSessions.priceAmount,
      notes: interviewSessions.notes,
      createdAt: interviewSessions.createdAt,
      jobSeeker: {
        id: jobSeekers.id,
        firstName: users.firstName,
        lastName: users.lastName,
        university: jobSeekers.university,
        fieldOfStudy: jobSeekers.fieldOfStudy,
      },
      feedback: {
        id: sessionFeedback.id,
        overallRating: sessionFeedback.overallRating,
        communicationRating: sessionFeedback.communicationRating,
        technicalRating: sessionFeedback.technicalRating,
        problemSolvingRating: sessionFeedback.problemSolvingRating,
        confidenceRating: sessionFeedback.confidenceRating,
        strengths: sessionFeedback.strengths,
        weaknesses: sessionFeedback.weaknesses,
        improvementTips: sessionFeedback.improvementTips,
        generalComments: sessionFeedback.generalComments,
      }
    })
    .from(interviewSessions)
    .innerJoin(jobSeekers, eq(interviewSessions.jobSeekerId, jobSeekers.id))
    .innerJoin(users, eq(jobSeekers.userId, users.id))
    .leftJoin(sessionFeedback, eq(interviewSessions.id, sessionFeedback.sessionId))
    .where(eq(interviewSessions.interviewerId, interviewer.id))
    .orderBy(desc(interviewSessions.scheduledDate));

  return sessions.map((s) => ({
    ...s,
    priceAmount: parseFloat(s.priceAmount || "0"),
  }));
};

/**
 * Get session by ID
 */
export const getSessionById = async (sessionId: number, userId: number) => {
  const [session] = await db
    .select()
    .from(interviewSessions)
    .where(eq(interviewSessions.id, sessionId))
    .limit(1);

  if (!session) {
    return null;
  }

  // Verify user has access to this session
  const [jobSeeker] = await db
    .select({ id: jobSeekers.id })
    .from(jobSeekers)
    .where(eq(jobSeekers.userId, userId))
    .limit(1);

  const [interviewer] = await db
    .select({ id: interviewers.id })
    .from(interviewers)
    .where(eq(interviewers.userId, userId))
    .limit(1);

  const hasAccess =
    (jobSeeker && session.jobSeekerId === jobSeeker.id) ||
    (interviewer && session.interviewerId === interviewer.id);

  if (!hasAccess) {
    const error = new Error("Access denied") as Error & { status?: number; code?: string };
    error.status = 403;
    error.code = "ACCESS_DENIED";
    throw error;
  }

  return session;
};

/**
 * Update session status
 */
export const updateSessionStatus = async (
  sessionId: number,
  status: string,
  userId: number,
  reason?: string,
  meetingLink?: string
) => {
  const session = await getSessionById(sessionId, userId);

  if (!session) {
    const error = new Error("Session not found") as Error & { status?: number; code?: string };
    error.status = 404;
    error.code = "SESSION_NOT_FOUND";
    throw error;
  }

  const updateData: Record<string, any> = {
    sessionStatus: status,
    updatedAt: new Date(),
  };

  // Generate meeting link if status is changing to scheduled (accepted) and it doesn't have one yet
  if (status === "scheduled" && (!session.meetingLink || session.meetingLink === "PENDING_GENERATION" || session.meetingLink === "")) {
    if (meetingLink && meetingLink.trim() !== "" && meetingLink.trim() !== "https://zoom.us/auto" && meetingLink.trim() !== "https://teams.microsoft.com/auto") {
      updateData.meetingLink = meetingLink.trim();
    } else {
      const platformOverride = meetingLink === "https://zoom.us/auto" ? "zoom" : (meetingLink === "https://teams.microsoft.com/auto" ? "teams" : undefined);
      // Get interviewer's platform preference
      const [interviewer] = await db
        .select({ preferredMeetingPlatform: interviewers.preferredMeetingPlatform })
        .from(interviewers)
        .where(eq(interviewers.id, session.interviewerId))
        .limit(1);

      let generatedLink = "";
      try {
        const result = await meetingService.generateMeeting(
          platformOverride || (interviewer?.preferredMeetingPlatform as "zoom" | "teams") || "zoom",
          {
            topic: `Interview Session - ${session.sessionType}`,
            startTime: session.scheduledDate,
            durationMinutes: session.duration,
          }
        );
        generatedLink = result.joinUrl;
      } catch (error) {
        console.error("Failed to generate meeting link during status update", error);
        generatedLink = "PENDING_GENERATION";
      }
      updateData.meetingLink = generatedLink;
    }
  }

  if (status === "cancelled") {
    const scheduledDate = new Date(session.scheduledDate);
    const now = new Date();
    const diffHours = (scheduledDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (diffHours < 24 && session.sessionStatus !== "pending") {
      const error = new Error("Cannot cancel a session within 24 hours of the scheduled time") as Error & { status?: number; code?: string };
      error.status = 400;
      error.code = "CANCELLATION_TOO_LATE";
      throw error;
    }

    updateData.cancellationReason = reason;
    updateData.cancelledBy = userId;
    
    // Trigger refund process automatically
    try {
      await cancelSessionPayment(sessionId, userId);
    } catch (paymentError) {
      console.error(`Failed to refund payment for session ${sessionId}:`, paymentError);
      // We don't fail the cancellation if refund fails, but it's logged.
    }
  }

  const [updated] = await db
    .update(interviewSessions)
    .set(updateData)
    .where(eq(interviewSessions.id, sessionId))
    .returning();

  // Send notifications
  if (status === "scheduled") {
    await notifySessionStateChange(sessionId, "session_confirmed");
  } else if (status === "cancelled") {
    if (session.sessionStatus === "pending") {
      // Differentiate between JS cancelling vs Interviewer rejecting
      if (userId === session.jobSeekerId) {
        await notifySessionStateChange(sessionId, "session_cancelled_by_jobseeker");
      } else {
        await notifySessionStateChange(sessionId, "session_rejected");
      }
    }
  }

  return updated;
};

/**
 * Update session meeting link
 */
export const updateMeetingLink = async (
  sessionId: number,
  meetingLink: string,
  userId: number
) => {
  const session = await getSessionById(sessionId, userId);

  if (!session) {
    const error = new Error("Session not found") as Error & { status?: number; code?: string };
    error.status = 404;
    error.code = "SESSION_NOT_FOUND";
    throw error;
  }

  let finalLink = meetingLink;
  if (meetingLink === "https://zoom.us/auto" || meetingLink === "https://teams.microsoft.com/auto") {
    const platform = meetingLink === "https://zoom.us/auto" ? "zoom" : "teams";
    try {
      const result = await meetingService.generateMeeting(
        platform,
        {
          topic: `Interview Session - ${session.sessionType || "interview"}`,
          startTime: session.scheduledDate,
          durationMinutes: session.duration,
        }
      );
      finalLink = result.joinUrl;
    } catch (error) {
      console.error(`Failed to auto-generate meeting link for platform ${platform}`, error);
      finalLink = "PENDING_GENERATION";
    }
  }

  const [updated] = await db
    .update(interviewSessions)
    .set({
      meetingLink: finalLink,
      updatedAt: new Date(),
    })
    .where(eq(interviewSessions.id, sessionId))
    .returning();

  return updated;
};

/**
 * Get session statistics for a user
 */
export const getSessionStats = async (userId: number, userType: string) => {
  let totalSessions = 0;
  let completedSessions = 0;
  let upcomingSessions = 0;
  let cancelledSessions = 0;

  if (userType === "job_seeker") {
    const [jobSeeker] = await db
      .select({ id: jobSeekers.id })
      .from(jobSeekers)
      .where(eq(jobSeekers.userId, userId))
      .limit(1);

    if (jobSeeker) {
      const sessions = await db
        .select({ sessionStatus: interviewSessions.sessionStatus })
        .from(interviewSessions)
        .where(eq(interviewSessions.jobSeekerId, jobSeeker.id));

      totalSessions = sessions.length;
      completedSessions = sessions.filter((s) => s.sessionStatus === "completed").length;
      upcomingSessions = sessions.filter((s) => s.sessionStatus === "scheduled").length;
      cancelledSessions = sessions.filter((s) => s.sessionStatus === "cancelled").length;
    }
  } else if (userType === "interviewer") {
    const [interviewer] = await db
      .select({ id: interviewers.id })
      .from(interviewers)
      .where(eq(interviewers.userId, userId))
      .limit(1);

    if (interviewer) {
      const sessions = await db
        .select({ sessionStatus: interviewSessions.sessionStatus })
        .from(interviewSessions)
        .where(eq(interviewSessions.interviewerId, interviewer.id));

      totalSessions = sessions.length;
      completedSessions = sessions.filter((s) => s.sessionStatus === "completed").length;
      upcomingSessions = sessions.filter((s) => s.sessionStatus === "scheduled").length;
      cancelledSessions = sessions.filter((s) => s.sessionStatus === "cancelled").length;
    }
  }

  return {
    totalSessions,
    completedSessions,
    upcomingSessions,
    cancelledSessions,
  };
};

export const rescheduleSession = async (
  sessionId: number,
  userId: number,
  newScheduledDate: string
) => {
  const session = await getSessionById(sessionId, userId);

  if (!session) {
    const error = new Error("Session not found") as Error & { status?: number; code?: string };
    error.status = 404;
    error.code = "SESSION_NOT_FOUND";
    throw error;
  }

  const scheduledDate = new Date(session.scheduledDate);
  const now = new Date();
  const diffHours = (scheduledDate.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (diffHours < 24) {
    const error = new Error("Cannot reschedule a session within 24 hours of the scheduled time") as Error & { status?: number; code?: string };
    error.status = 400;
    error.code = "RESCHEDULE_TOO_LATE";
    throw error;
  }

  if ((session.rescheduleCount || 0) >= 3) {
    const error = new Error("Maximum number of reschedules (3) has been reached") as Error & { status?: number; code?: string };
    error.status = 400;
    error.code = "MAX_RESCHEDULES_REACHED";
    throw error;
  }

  return await db.transaction(async (tx) => {
    // Log the request
    await tx.insert(rescheduleRequests).values({
      sessionId,
      requestedByUserId: userId,
      originalDate: new Date(session.scheduledDate),
      proposedDate: new Date(newScheduledDate),
      status: "approved", // auto-approve for simplicity to fulfill the 3-limit feature directly
      reason: "User requested reschedule",
      createdAt: new Date(),
    });

    // Update the session
    const [updatedSession] = await tx
      .update(interviewSessions)
      .set({
        scheduledDate: new Date(newScheduledDate),
        rescheduleCount: (session.rescheduleCount || 0) + 1,
        sessionStatus: "rescheduled",
        updatedAt: new Date(),
      })
      .where(eq(interviewSessions.id, sessionId))
      .returning();

    return updatedSession;
  });
};
export default {
  createSession,
  getJobSeekerSessions,
  getInterviewerSessions,
  getSessionById,
  updateSessionStatus,
  updateMeetingLink,
  getSessionStats,
  rescheduleSession,
};
