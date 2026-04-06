import { and, desc, eq } from "drizzle-orm";
import { db } from "../config/database";
import { feedback, interviewSessions, interviewers, jobSeekers, users } from "../db/schema";

type SubmitFeedbackInput = {
  sessionId: number;
  givenByUserId: number;
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
};

type SessionParticipants = {
  sessionId: number;
  sessionStatus: string;
  sessionType: string;
  scheduledDate: Date;
  jobSeekerUserId: number;
  interviewerUserId: number;
};

const buildError = (message: string, status: number, code: string) => {
  const error = new Error(message) as Error & { status?: number; code?: string };
  error.status = status;
  error.code = code;
  return error;
};

const tokenizeKeywords = (text?: string | null): string[] => {
  if (!text) {
    return [];
  }

  return text
    .toLowerCase()
    .split(/[;,|\n]+/)
    .map((entry) => entry.trim())
    .filter((entry) => entry.length >= 3)
    .slice(0, 25);
};

const average = (values: Array<number | null>): number | null => {
  const normalized = values.filter((v): v is number => typeof v === "number");
  if (normalized.length === 0) {
    return null;
  }
  return Math.round((normalized.reduce((sum, value) => sum + value, 0) / normalized.length) * 100) / 100;
};

const getSessionParticipants = async (sessionId: number): Promise<SessionParticipants | null> => {
  const [session] = await db
    .select({
      sessionId: interviewSessions.id,
      sessionStatus: interviewSessions.sessionStatus,
      sessionType: interviewSessions.sessionType,
      scheduledDate: interviewSessions.scheduledDate,
      jobSeekerUserId: jobSeekers.userId,
      interviewerUserId: interviewers.userId,
    })
    .from(interviewSessions)
    .innerJoin(jobSeekers, eq(interviewSessions.jobSeekerId, jobSeekers.id))
    .innerJoin(interviewers, eq(interviewSessions.interviewerId, interviewers.id))
    .where(eq(interviewSessions.id, sessionId))
    .limit(1);

  if (!session) {
    return null;
  }

  return {
    sessionId: session.sessionId,
    sessionStatus: session.sessionStatus || "scheduled",
    sessionType: session.sessionType,
    scheduledDate: session.scheduledDate,
    jobSeekerUserId: session.jobSeekerUserId,
    interviewerUserId: session.interviewerUserId,
  };
};

export const submitFeedback = async (input: SubmitFeedbackInput) => {
  const session = await getSessionParticipants(input.sessionId);

  if (!session) {
    throw buildError("Session not found", 404, "SESSION_NOT_FOUND");
  }

  if (
    input.givenByUserId !== session.jobSeekerUserId &&
    input.givenByUserId !== session.interviewerUserId
  ) {
    throw buildError("You are not part of this session", 403, "ACCESS_DENIED");
  }

  if (session.sessionStatus !== "completed") {
    throw buildError(
      "Feedback can only be submitted for completed sessions",
      400,
      "SESSION_NOT_COMPLETED"
    );
  }

  const feedbackType =
    input.givenByUserId === session.jobSeekerUserId
      ? "seeker_to_interviewer"
      : "interviewer_to_seeker";

  const feedbackForUserId =
    input.givenByUserId === session.jobSeekerUserId
      ? session.interviewerUserId
      : session.jobSeekerUserId;

  const [existing] = await db
    .select({ id: feedback.id })
    .from(feedback)
    .where(and(eq(feedback.sessionId, input.sessionId), eq(feedback.givenByUserId, input.givenByUserId)))
    .limit(1);

  const payload = {
    sessionId: input.sessionId,
    givenByUserId: input.givenByUserId,
    feedbackForUserId,
    feedbackType,
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
  } as const;

  if (existing) {
    const [updated] = await db
      .update(feedback)
      .set(payload)
      .where(eq(feedback.id, existing.id))
      .returning();
    return updated;
  }

  const [created] = await db.insert(feedback).values(payload).returning();
  return created;
};

export const getMyFeedback = async (userId: number) => {
  const rows = await db
    .select({
      id: feedback.id,
      sessionId: feedback.sessionId,
      feedbackType: feedback.feedbackType,
      ratingOverall: feedback.ratingOverall,
      ratingCommunication: feedback.ratingCommunication,
      ratingTechnical: feedback.ratingTechnical,
      ratingProfessionalism: feedback.ratingProfessionalism,
      ratingHelpfulness: feedback.ratingHelpfulness,
      writtenFeedback: feedback.writtenFeedback,
      improvementSuggestions: feedback.improvementSuggestions,
      strengthsIdentified: feedback.strengthsIdentified,
      wouldRecommend: feedback.wouldRecommend,
      isAnonymous: feedback.isAnonymous,
      createdAt: feedback.createdAt,
      givenByUserId: feedback.givenByUserId,
      givenByFirstName: users.firstName,
      givenByLastName: users.lastName,
      sessionType: interviewSessions.sessionType,
      scheduledDate: interviewSessions.scheduledDate,
    })
    .from(feedback)
    .innerJoin(users, eq(feedback.givenByUserId, users.id))
    .innerJoin(interviewSessions, eq(feedback.sessionId, interviewSessions.id))
    .where(eq(feedback.feedbackForUserId, userId))
    .orderBy(desc(feedback.createdAt));

  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<number, number>;
  for (const row of rows) {
    if (row.ratingOverall && distribution[row.ratingOverall] !== undefined) {
      distribution[row.ratingOverall] += 1;
    }
  }

  const recommendVotes = rows.filter((row) => typeof row.wouldRecommend === "boolean");
  const recommendYes = recommendVotes.filter((row) => row.wouldRecommend).length;

  const strengthsMap = new Map<string, number>();
  const improvementMap = new Map<string, number>();

  for (const row of rows) {
    for (const keyword of tokenizeKeywords(row.strengthsIdentified)) {
      strengthsMap.set(keyword, (strengthsMap.get(keyword) || 0) + 1);
    }
    for (const keyword of tokenizeKeywords(row.improvementSuggestions)) {
      improvementMap.set(keyword, (improvementMap.get(keyword) || 0) + 1);
    }
  }

  const topStrengths = Array.from(strengthsMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([keyword, count]) => ({ keyword, count }));

  const topImprovements = Array.from(improvementMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([keyword, count]) => ({ keyword, count }));

  return {
    feedback: rows.map((row) => ({
      ...row,
      givenByName: row.isAnonymous ? "Anonymous" : `${row.givenByFirstName} ${row.givenByLastName}`,
    })),
    summary: {
      totalFeedback: rows.length,
      averageRatings: {
        overall: average(rows.map((row) => row.ratingOverall)),
        communication: average(rows.map((row) => row.ratingCommunication)),
        technical: average(rows.map((row) => row.ratingTechnical)),
        professionalism: average(rows.map((row) => row.ratingProfessionalism)),
        helpfulness: average(rows.map((row) => row.ratingHelpfulness)),
      },
      recommendationRate:
        recommendVotes.length === 0
          ? null
          : Math.round((recommendYes / recommendVotes.length) * 10000) / 100,
      ratingDistribution: distribution,
      topStrengths,
      topImprovements,
    },
  };
};

export const getSessionFeedback = async (sessionId: number, userId: number) => {
  const session = await getSessionParticipants(sessionId);

  if (!session) {
    throw buildError("Session not found", 404, "SESSION_NOT_FOUND");
  }

  if (userId !== session.jobSeekerUserId && userId !== session.interviewerUserId) {
    throw buildError("You are not part of this session", 403, "ACCESS_DENIED");
  }

  const rows = await db
    .select({
      id: feedback.id,
      sessionId: feedback.sessionId,
      feedbackType: feedback.feedbackType,
      ratingOverall: feedback.ratingOverall,
      ratingCommunication: feedback.ratingCommunication,
      ratingTechnical: feedback.ratingTechnical,
      ratingProfessionalism: feedback.ratingProfessionalism,
      ratingHelpfulness: feedback.ratingHelpfulness,
      writtenFeedback: feedback.writtenFeedback,
      improvementSuggestions: feedback.improvementSuggestions,
      strengthsIdentified: feedback.strengthsIdentified,
      wouldRecommend: feedback.wouldRecommend,
      isAnonymous: feedback.isAnonymous,
      createdAt: feedback.createdAt,
      givenByUserId: feedback.givenByUserId,
      givenByFirstName: users.firstName,
      givenByLastName: users.lastName,
    })
    .from(feedback)
    .innerJoin(users, eq(feedback.givenByUserId, users.id))
    .where(eq(feedback.sessionId, sessionId))
    .orderBy(desc(feedback.createdAt));

  return rows.map((row) => ({
    ...row,
    givenByName: row.isAnonymous ? "Anonymous" : `${row.givenByFirstName} ${row.givenByLastName}`,
  }));
};

export const getPendingFeedbackSessions = async (
  userId: number,
  userType: "job_seeker" | "interviewer" | "admin"
) => {
  if (userType === "admin") {
    return [];
  }

  let sessions: Array<{
    sessionId: number;
    sessionType: string;
    scheduledDate: Date;
    counterpartUserId: number;
    counterpartFirstName: string;
    counterpartLastName: string;
    counterpartTitle: string | null;
  }> = [];

  if (userType === "job_seeker") {
    sessions = await db
      .select({
        sessionId: interviewSessions.id,
        sessionType: interviewSessions.sessionType,
        scheduledDate: interviewSessions.scheduledDate,
        counterpartUserId: users.id,
        counterpartFirstName: users.firstName,
        counterpartLastName: users.lastName,
        counterpartTitle: interviewers.jobTitle,
      })
      .from(interviewSessions)
      .innerJoin(jobSeekers, eq(interviewSessions.jobSeekerId, jobSeekers.id))
      .innerJoin(interviewers, eq(interviewSessions.interviewerId, interviewers.id))
      .innerJoin(users, eq(interviewers.userId, users.id))
      .where(and(eq(jobSeekers.userId, userId), eq(interviewSessions.sessionStatus, "completed")))
      .orderBy(desc(interviewSessions.scheduledDate));
  }

  if (userType === "interviewer") {
    sessions = await db
      .select({
        sessionId: interviewSessions.id,
        sessionType: interviewSessions.sessionType,
        scheduledDate: interviewSessions.scheduledDate,
        counterpartUserId: users.id,
        counterpartFirstName: users.firstName,
        counterpartLastName: users.lastName,
        counterpartTitle: jobSeekers.university,
      })
      .from(interviewSessions)
      .innerJoin(interviewers, eq(interviewSessions.interviewerId, interviewers.id))
      .innerJoin(jobSeekers, eq(interviewSessions.jobSeekerId, jobSeekers.id))
      .innerJoin(users, eq(jobSeekers.userId, users.id))
      .where(and(eq(interviewers.userId, userId), eq(interviewSessions.sessionStatus, "completed")))
      .orderBy(desc(interviewSessions.scheduledDate));
  }

  const submitted = await db
    .select({ sessionId: feedback.sessionId })
    .from(feedback)
    .where(eq(feedback.givenByUserId, userId));

  const submittedSet = new Set(submitted.map((row) => row.sessionId));

  return sessions.filter((session) => !submittedSet.has(session.sessionId));
};

export default {
  submitFeedback,
  getMyFeedback,
  getSessionFeedback,
  getPendingFeedbackSessions,
};
