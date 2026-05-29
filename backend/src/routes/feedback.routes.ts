import { Router } from "express";
import {
  submitFeedback,
  getMyFeedback,
  getMyFeedbackStats,
  getSessionFeedback,
  submitInterviewerReview,
  getInterviewerAnalytics,
} from "../controllers/feedback.controller";
import { authenticate, authorize, checkVerified } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";

const router = Router();

// POST /api/feedback — Interviewer submits feedback (verified only)
router.post("/", authenticate, authorize("interviewer"), checkVerified, asyncHandler(submitFeedback));

// GET /api/feedback/my — Job seeker views their own feedback
router.get("/my", authenticate, authorize("job_seeker"), asyncHandler(getMyFeedback));

// GET /api/feedback/my/stats — Aggregated stats + trend data
router.get("/my/stats", authenticate, authorize("job_seeker"), asyncHandler(getMyFeedbackStats));

// GET /api/feedback/session/:sessionId — Feedback for one session
router.get("/session/:sessionId", authenticate, asyncHandler(getSessionFeedback));

// POST /api/feedback/interviewer-review — Job seeker submits a review for interviewer
router.post("/interviewer-review", authenticate, authorize("job_seeker"), asyncHandler(submitInterviewerReview));

// GET /api/feedback/interviewer/analytics — Interviewer views their analytics (verified only)
router.get("/interviewer/analytics", authenticate, authorize("interviewer"), checkVerified, asyncHandler(getInterviewerAnalytics));

export default router;
