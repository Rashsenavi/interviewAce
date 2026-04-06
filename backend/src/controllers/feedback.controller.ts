import { Request, Response } from "express";
import { z } from "zod";
import * as feedbackService from "../services/feedback.service";

const ratingSchema = z.number().int().min(1).max(5);

const submitFeedbackSchema = z.object({
  sessionId: z.number().int().positive(),
  ratingOverall: ratingSchema,
  ratingCommunication: ratingSchema.optional(),
  ratingTechnical: ratingSchema.optional(),
  ratingProfessionalism: ratingSchema.optional(),
  ratingHelpfulness: ratingSchema.optional(),
  writtenFeedback: z.string().max(3000).optional(),
  improvementSuggestions: z.string().max(2000).optional(),
  strengthsIdentified: z.string().max(2000).optional(),
  wouldRecommend: z.boolean().optional(),
  isAnonymous: z.boolean().optional(),
});

/**
 * POST /api/feedback
 * Submit or update feedback for a completed session
 */
export const submitFeedback = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: { code: "NOT_AUTHENTICATED", message: "User not authenticated" },
    });
  }

  try {
    const input = submitFeedbackSchema.parse(req.body);

    const result = await feedbackService.submitFeedback({
      ...input,
      givenByUserId: req.user.id,
    });

    res.status(201).json({
      success: true,
      data: { feedback: result },
      message: "Feedback submitted successfully",
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
 * GET /api/feedback/my-feedback
 * Get all feedback received by the current user with analytics summary
 */
export const getMyFeedback = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: { code: "NOT_AUTHENTICATED", message: "User not authenticated" },
    });
  }

  const result = await feedbackService.getMyFeedback(req.user.id);

  res.json({
    success: true,
    data: result,
  });
};

/**
 * GET /api/feedback/pending
 * Get completed sessions that still need feedback from current user
 */
export const getPendingFeedback = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: { code: "NOT_AUTHENTICATED", message: "User not authenticated" },
    });
  }

  const result = await feedbackService.getPendingFeedbackSessions(req.user.id, req.user.userType);

  res.json({
    success: true,
    data: { sessions: result },
  });
};

/**
 * GET /api/feedback/session/:sessionId
 * Get all feedback records for a specific session (participants only)
 */
export const getSessionFeedback = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: { code: "NOT_AUTHENTICATED", message: "User not authenticated" },
    });
  }

  const sessionId = parseInt(req.params.sessionId, 10);
  if (Number.isNaN(sessionId)) {
    return res.status(400).json({
      success: false,
      error: { code: "INVALID_SESSION_ID", message: "Invalid session id" },
    });
  }

  const result = await feedbackService.getSessionFeedback(sessionId, req.user.id);

  res.json({
    success: true,
    data: { feedback: result },
  });
};

export default {
  submitFeedback,
  getMyFeedback,
  getPendingFeedback,
  getSessionFeedback,
};
