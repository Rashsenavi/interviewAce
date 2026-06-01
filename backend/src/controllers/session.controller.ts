import { Request, Response } from "express";
import * as sessionService from "../services/session.service";
import { z } from "zod";
import { db } from "../config/database";
import { interviewSessions, interviewers } from "../db/schema";
import { eq, and } from "drizzle-orm";

// Validation schemas
const createSessionSchema = z.object({
  interviewerUserId: z.number(),
  industryId: z.number().optional(),
  sessionType: z.enum(["behavioral", "technical", "case_study", "mixed"]),
  scheduledDate: z.string().transform((str) => new Date(str)),
  duration: z.number().min(15).max(180),
  notes: z.string().optional(),
  recordingConsent: z.boolean().optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(["pending", "scheduled", "rescheduled", "in_progress", "completed", "cancelled", "no_show"]),
  reason: z.string().optional(),
  meetingLink: z.string().url().optional().or(z.string().length(0)),
});

const rescheduleSchema = z.object({
  newScheduledDate: z.string().transform((str) => new Date(str)),
});

const updateMeetingLinkSchema = z.object({
  meetingLink: z.string().url(),
});

/**
 * POST /api/sessions
 * Create a new session (job seeker only)
 */
export const createSession = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: { code: "NOT_AUTHENTICATED", message: "User not authenticated" },
    });
  }

  if (req.user.userType !== "job_seeker") {
    return res.status(403).json({
      success: false,
      error: { code: "FORBIDDEN", message: "Only job seekers can book sessions" },
    });
  }

  try {
    const validatedData = createSessionSchema.parse(req.body);

    const session = await sessionService.createSession({
      ...validatedData,
      jobSeekerUserId: req.user.id,
    });

    res.status(201).json({
      success: true,
      data: { session },
      message: "Session booked successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid input data",
          details: error.errors,
        },
      });
    }
    throw error;
  }
};

/**
 * GET /api/sessions
 * Get sessions for the current user
 */
export const getSessions = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: { code: "NOT_AUTHENTICATED", message: "User not authenticated" },
    });
  }

  const { status, upcoming } = req.query;

  let sessions: any[] = [];
  if (req.user.userType === "job_seeker") {
    sessions = await sessionService.getJobSeekerSessions(
      req.user.id,
      status as string,
      upcoming === "true"
    );
  } else if (req.user.userType === "interviewer") {
    sessions = await sessionService.getInterviewerSessions(
      req.user.id,
      status as string,
      upcoming === "true"
    );
  }

  res.json({
    success: true,
    data: { sessions },
  });
};

/**
 * GET /api/sessions/:id
 * Get session by ID
 */
export const getSessionById = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: { code: "NOT_AUTHENTICATED", message: "User not authenticated" },
    });
  }

  const sessionId = parseInt(req.params.id);

  if (isNaN(sessionId)) {
    return res.status(400).json({
      success: false,
      error: { code: "INVALID_ID", message: "Invalid session ID" },
    });
  }

  const session = await sessionService.getSessionById(sessionId, req.user.id);

  if (!session) {
    return res.status(404).json({
      success: false,
      error: { code: "SESSION_NOT_FOUND", message: "Session not found" },
    });
  }

  res.json({
    success: true,
    data: { session },
  });
};

/**
 * PUT /api/sessions/:id/status
 * Update session status
 */
export const updateSessionStatus = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: { code: "NOT_AUTHENTICATED", message: "User not authenticated" },
    });
  }

  const sessionId = parseInt(req.params.id);

  if (isNaN(sessionId)) {
    return res.status(400).json({
      success: false,
      error: { code: "INVALID_ID", message: "Invalid session ID" },
    });
  }

  try {
    const validatedData = updateStatusSchema.parse(req.body);

    const session = await sessionService.updateSessionStatus(
      sessionId,
      validatedData.status,
      req.user.id,
      validatedData.reason,
      validatedData.meetingLink
    );

    res.json({
      success: true,
      data: { session },
      message: "Session status updated successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid input data",
          details: error.errors,
        },
      });
    }
    throw error;
  }
};

/**
 * PUT /api/sessions/:id/meeting-link
 * Update session meeting link
 */
export const updateMeetingLink = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: { code: "NOT_AUTHENTICATED", message: "User not authenticated" },
    });
  }

  const sessionId = parseInt(req.params.id);

  if (isNaN(sessionId)) {
    return res.status(400).json({
      success: false,
      error: { code: "INVALID_ID", message: "Invalid session ID" },
    });
  }

  try {
    const validatedData = updateMeetingLinkSchema.parse(req.body);

    const session = await sessionService.updateMeetingLink(
      sessionId,
      validatedData.meetingLink,
      req.user.id
    );

    res.json({
      success: true,
      data: { session },
      message: "Meeting link updated successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid input data",
          details: error.errors,
        },
      });
    }
    throw error;
  }
};

/**
 * GET /api/sessions/stats
 * Get session statistics for current user
 */
export const getSessionStats = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: { code: "NOT_AUTHENTICATED", message: "User not authenticated" },
    });
  }

  const stats = await sessionService.getSessionStats(req.user.id, req.user.userType);

  res.json({
    success: true,
    data: { stats },
  });
};

export const rescheduleSession = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: { code: "NOT_AUTHENTICATED", message: "User not authenticated" },
    });
  }

  const sessionId = parseInt(req.params.id);

  if (isNaN(sessionId)) {
    return res.status(400).json({
      success: false,
      error: { code: "INVALID_ID", message: "Invalid session ID" },
    });
  }

  try {
    const { newScheduledDate } = rescheduleSchema.parse(req.body);

    const session = await sessionService.rescheduleSession(
      sessionId,
      req.user.id,
      newScheduledDate.toISOString()
    );

    res.json({
      success: true,
      data: { session },
      message: "Session rescheduled successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid input data",
          details: error.errors,
        },
      });
    }
    const e = error as Error & { status?: number; code?: string };
    if (e.status) {
      return res.status(e.status).json({
        success: false,
        error: { code: e.code, message: e.message },
      });
    }
    throw error;
  }
};

const confirmSessionSchema = z.object({
  occurred: z.boolean(),
  issueReason: z.string().optional(),
});

/**
 * PUT /api/sessions/:id/confirm
 * Interviewer confirms if the session occurred or disputes it
 */
export const confirmSession = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: { code: "NOT_AUTHENTICATED", message: "User not authenticated" },
    });
  }

  const sessionId = parseInt(req.params.id);
  if (isNaN(sessionId)) {
    return res.status(400).json({
      success: false,
      error: { code: "INVALID_ID", message: "Invalid session ID" },
    });
  }

  try {
    const { occurred, issueReason } = confirmSessionSchema.parse(req.body);

    // 1. Fetch session to verify it exists
    const [session] = await db
      .select()
      .from(interviewSessions)
      .where(eq(interviewSessions.id, sessionId))
      .limit(1);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: { code: "SESSION_NOT_FOUND", message: "Session not found" },
      });
    }

    // 2. Ownership check: verify interviewer assigned matches the logged-in user
    const [interviewerProfile] = await db
      .select({ id: interviewers.id })
      .from(interviewers)
      .where(eq(interviewers.userId, req.user.id))
      .limit(1);

    if (!interviewerProfile) {
      return res.status(403).json({
        success: false,
        error: { code: "INTERVIEWER_PROFILE_NOT_FOUND", message: "Interviewer profile not found" },
      });
    }

    if (session.interviewerId !== interviewerProfile.id) {
      return res.status(403).json({
        success: false,
        error: { code: "UNAUTHORIZED_CONFIRMATION", message: "You are not assigned to this session" },
      });
    }

    // 3. Status check: must be awaiting_confirmation
    if (session.sessionStatus !== "awaiting_confirmation") {
      return res.status(400).json({
        success: false,
        error: { code: "INVALID_SESSION_STATE", message: "Session is not awaiting confirmation" },
      });
    }

    if (occurred) {
      // Mark completed
      await db
        .update(interviewSessions)
        .set({
          sessionStatus: "completed",
          updatedAt: new Date(),
        })
        .where(eq(interviewSessions.id, sessionId));

      return res.json({
        success: true,
        message: "Session marked as completed.",
      });
    } else {
      // Flag as disputed
      await db
        .update(interviewSessions)
        .set({
          sessionStatus: "disputed",
          disputeReason: issueReason || "Interviewer reported session did not occur.",
          disputedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(interviewSessions.id, sessionId));

      return res.json({
        success: true,
        message: "Session flagged. Admin will review.",
      });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid input data",
          details: error.errors,
        },
      });
    }
    console.error("Error in confirmSession:", error);
    return res.status(500).json({
      success: false,
      error: { code: "SERVER_ERROR", message: "Failed to confirm session" },
    });
  }
};

export default {
  createSession,
  getSessions,
  getSessionById,
  updateSessionStatus,
  updateMeetingLink,
  getSessionStats,
  rescheduleSession,
  confirmSession,
};
