import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";
import {
  submitFeedback,
  getMyFeedback,
  getPendingFeedback,
  getSessionFeedback,
} from "../controllers/feedback.controller";

const router = Router();

/**
 * POST /api/feedback
 * Submit feedback for a session
 */
router.post("/", authenticate, asyncHandler(submitFeedback));

/**
 * GET /api/feedback/my-feedback
 * Get feedback received
 */
router.get("/my-feedback", authenticate, asyncHandler(getMyFeedback));

/**
 * GET /api/feedback/pending
 * Get pending feedback sessions
 */
router.get("/pending", authenticate, asyncHandler(getPendingFeedback));

/**
 * GET /api/feedback/session/:sessionId
 * Get feedback for a session
 */
router.get("/session/:sessionId", authenticate, asyncHandler(getSessionFeedback));

export default router;
