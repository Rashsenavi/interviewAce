import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";
import {
  getPendingVerifications,
  getVerificationDetails,
  approveVerification,
  rejectVerification,
  getAllUsersHandler,
  updateUserStatusHandler,
  deleteUserHandler,
  getAnalyticsHandler,
} from "../controllers/admin.controller";
import {
  getTicketsHandler,
  getTicketDetailsHandler,
  replyTicketHandler,
  updateTicketStatusHandler,
} from "../controllers/support.controller";

const router = Router();

/**
 * GET /api/admin/verification/pending
 * Get pending interviewer verifications
 */
router.get("/verification/pending", authenticate, authorize("admin"), asyncHandler(getPendingVerifications));

/**
 * GET /api/admin/verification/:interviewerId
 * Get verification details for interviewer
 */
router.get("/verification/:interviewerId", authenticate, authorize("admin"), asyncHandler(getVerificationDetails));

/**
 * PUT /api/admin/verification/:interviewerId/approve
 * Approve interviewer verification
 */
router.put("/verification/:interviewerId/approve", authenticate, authorize("admin"), asyncHandler(approveVerification));

/**
 * PUT /api/admin/verification/:interviewerId/reject
 * Reject interviewer verification
 */
router.put("/verification/:interviewerId/reject", authenticate, authorize("admin"), asyncHandler(rejectVerification));

/**
 * GET /api/admin/analytics
 * Get platform analytics
 */
router.get("/analytics", authenticate, authorize("admin"), asyncHandler(getAnalyticsHandler));

/**
 * GET /api/admin/users
 * Get all users
 */
router.get("/users", authenticate, authorize("admin"), asyncHandler(getAllUsersHandler));

/**
 * PUT /api/admin/users/:userId/status
 * Update user active status (Suspend/Activate)
 */
router.put("/users/:userId/status", authenticate, authorize("admin"), asyncHandler(updateUserStatusHandler));

/**
 * DELETE /api/admin/users/:userId
 * Delete a user account
 */
router.delete("/users/:userId", authenticate, authorize("admin"), asyncHandler(deleteUserHandler));

// --- Support Tickets ---

/**
 * GET /api/admin/tickets
 * Get all support tickets
 */
router.get("/tickets", authenticate, authorize("admin"), asyncHandler(getTicketsHandler));

/**
 * GET /api/admin/tickets/:id
 * Get ticket details and messages
 */
router.get("/tickets/:id", authenticate, authorize("admin"), asyncHandler(getTicketDetailsHandler));

/**
 * POST /api/admin/tickets/:id/messages
 * Add a reply to a ticket
 */
router.post("/tickets/:id/messages", authenticate, authorize("admin"), asyncHandler(replyTicketHandler));

/**
 * PATCH /api/admin/tickets/:id/status
 * Update ticket status
 */
router.patch("/tickets/:id/status", authenticate, authorize("admin"), asyncHandler(updateTicketStatusHandler));

export default router;
