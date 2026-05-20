import { Router, Request, Response } from "express";
import { authenticate } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";
import * as feedbackService from "../services/feedback.service";
import { z } from "zod";

const router = Router();

const submitFeedbackSchema = z.object({
  sessionId: z.number(),
  feedbackForUserId: z.number(),
  feedbackType: z.enum(["seeker_to_interviewer", "interviewer_to_seeker"]),
  ratingOverall: z.number().min(1).max(5),
  ratingCommunication: z.number().min(1).max(5).optional(),
  ratingTechnical: z.number().min(1).max(5).optional(),
  ratingProfessionalism: z.number().min(1).max(5).optional(),
  ratingHelpfulness: z.number().min(1).max(5).optional(),
  writtenFeedback: z.string().optional(),
  improvementSuggestions: z.string().optional(),
  strengthsIdentified: z.string().optional(),
  wouldRecommend: z.boolean().optional(),
  isAnonymous: z.boolean().optional(),
});

/**
 * GET /api/feedback/pending
 * Get sessions pending feedback (job seeker: sessions they haven't reviewed yet)
 */
router.get(
  "/pending",
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: "NOT_AUTHENTICATED", message: "User not authenticated" },
      });
    }

    const pending = await feedbackService.getPendingFeedbackForJobSeeker(req.user.id);

    res.json({
      success: true,
      data: { pending },
    });
  })
);

/**
 * GET /api/feedback/submitted
 * Get feedback submitted by current user
 */
router.get(
  "/submitted",
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: "NOT_AUTHENTICATED", message: "User not authenticated" },
      });
    }

    const submitted = await feedbackService.getSubmittedFeedbackByJobSeeker(req.user.id);

    res.json({
      success: true,
      data: { submitted },
    });
  })
);

/**
 * POST /api/feedback
 * Submit feedback for a session
 */
router.post(
  "/",
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: "NOT_AUTHENTICATED", message: "User not authenticated" },
      });
    }

    try {
      const data = submitFeedbackSchema.parse(req.body);

      const result = await feedbackService.submitFeedback({
        ...data,
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
  })
);

/**
 * GET /api/feedback/my-feedback
 * Get feedback received by current user (legacy route kept for compat)
 */
router.get("/my-feedback", authenticate, asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: { code: "NOT_AUTHENTICATED", message: "User not authenticated" },
    });
  }
  const submitted = await feedbackService.getSubmittedFeedbackByJobSeeker(req.user.id);
  res.json({ success: true, data: { submitted } });
}));

/**
 * GET /api/feedback/session/:sessionId
 * Get feedback for a session
 */
router.get("/session/:sessionId", authenticate, asyncHandler(async (req: Request, res: Response) => {
  res.json({ success: true, data: { feedback: [] } });
}));

export default router;
