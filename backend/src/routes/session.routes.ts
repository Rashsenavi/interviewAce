import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
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
router.get("/", authenticate, asyncHandler(sessionController.getSessions));

/**
 * GET /api/sessions/stats
 * Get session statistics
 */
router.get("/stats", authenticate, asyncHandler(sessionController.getSessionStats));

/**
 * GET /api/sessions/:id
 * Get session details
 */
router.get("/:id", authenticate, asyncHandler(sessionController.getSessionById));

/**
 * PUT /api/sessions/:id/status
 * Update session status (cancel, complete, etc.)
 */
router.put("/:id/status", authenticate, asyncHandler(sessionController.updateSessionStatus));

/**
 * PUT /api/sessions/:id/meeting-link
 * Update session meeting link
 */
router.put("/:id/meeting-link", authenticate, asyncHandler(sessionController.updateMeetingLink));

/**
 * POST /api/sessions/:id/reschedule
 * Reschedule a session
 */
router.post("/:id/reschedule", authenticate, asyncHandler(sessionController.rescheduleSession));

export default router;
