import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import {
  getPendingVerifications,
  getVerificationDetails,
  approveVerification,
  rejectVerification,
} from "../controllers/admin.controller";

const router = Router();

/**
 * GET /api/admin/verification/pending
 * Get pending interviewer verifications
 */
router.get("/verification/pending", authenticate, authorize("admin"), getPendingVerifications);

/**
 * GET /api/admin/verification/:interviewerId
 * Get verification details for interviewer
 */
router.get("/verification/:interviewerId", authenticate, authorize("admin"), getVerificationDetails);

/**
 * PUT /api/admin/verification/:interviewerId/approve
 * Approve interviewer verification
 */
router.put("/verification/:interviewerId/approve", authenticate, authorize("admin"), approveVerification);

/**
 * PUT /api/admin/verification/:interviewerId/reject
 * Reject interviewer verification
 */
router.put("/verification/:interviewerId/reject", authenticate, authorize("admin"), rejectVerification);

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
 * Get all users with pagination and filters
 */
router.get("/users", authenticate, authorize("admin"), async (req, res) => {
  // TODO: Implement get users
  res.json({ message: "Get users" });
});

export default router;
