import { Router } from "express";
import { submitReview, getMyReviews } from "../controllers/review.controller";
import { authenticate, authorize } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";

const router = Router();

// POST /api/reviews — Job seeker submits a review for an interviewer
router.post("/", authenticate, authorize("job_seeker"), asyncHandler(submitReview));

// GET /api/reviews/my — Interviewer views their own aggregated reviews and stats
router.get("/my", authenticate, authorize("interviewer"), asyncHandler(getMyReviews));

export default router;
