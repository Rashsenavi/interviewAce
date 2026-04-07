import { Router } from "express";
import { authenticate, authorize, checkVerified } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";
import * as sessionController from "../controllers/session.controller";

const router = Router();

/**
 * POST /api/sessions
 * Book an interview session
 */
router.post("/", authenticate, authorize("job_seeker"), asyncHandler(sessionController.createSession));

/**
 * GET /api/sessions
 * Get user's sessions
 */
router.get("/", authenticate, checkVerified, asyncHandler(sessionController.getSessions));

/**
 * GET /api/sessions/stats
 * Get session statistics
 */
router.get("/stats", authenticate, checkVerified, asyncHandler(sessionController.getSessionStats));

/**
 * GET /api/sessions/:id
 * Get session details
 */
router.get("/:id", authenticate, checkVerified, asyncHandler(sessionController.getSessionById));

/**
 * PUT /api/sessions/:id/status
 * Update session status (cancel, complete, etc.)
 */
router.put("/:id/status", authenticate, checkVerified, asyncHandler(sessionController.updateSessionStatus));

/**
 * PUT /api/sessions/:id/meeting-link
 * Update session meeting link
 */
router.put("/:id/meeting-link", authenticate, checkVerified, asyncHandler(sessionController.updateMeetingLink));

export default router;
