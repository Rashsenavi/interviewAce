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
} from "../controllers/admin.controller";

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
router.get("/analytics", authenticate, authorize("admin"), async (req, res) => {
  // TODO: Implement get analytics
  res.json({ message: "Get analytics" });
});

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

export default router;
