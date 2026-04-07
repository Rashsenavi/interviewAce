import { Router } from "express";
import { authenticate, authorize, checkVerified } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";
import * as userController from "../controllers/user.controller";

const router = Router();

/**
 * GET /api/interviewers
 * Get all verified interviewers with filters
 */
router.get("/", asyncHandler(userController.getAllInterviewers));

/**
 * GET /api/interviewers/profile
 * Get current interviewer profile
 */
router.get("/profile", authenticate, authorize("interviewer"), asyncHandler(userController.getInterviewerProfile));

/**
 * PUT /api/interviewers/profile
 * Update interviewer profile
 */
router.put("/profile", authenticate, authorize("interviewer"), asyncHandler(userController.updateInterviewerProfile));

/**
 * GET /api/interviewers/:id
 * Get interviewer profile by ID (public)
 */
router.get("/:id", asyncHandler(userController.getInterviewerById));

/**
 * POST /api/interviewers/upload-verification
 * Upload verification documents
 */
router.post("/upload-verification", authenticate, authorize("interviewer"), asyncHandler(async (req, res) => {
  // TODO: Implement upload verification documents
  res.json({ success: true, message: "Upload verification documents - not yet implemented" });
}));

/**
 * GET /api/interviewers/:id/availability
 * Get interviewer availability slots
 */
router.get("/:id/availability", asyncHandler(userController.getInterviewerAvailability));

/**
 * PUT /api/interviewers/availability
 * Set availability slots
 */
router.put(
  "/availability",
  authenticate,
  authorize("interviewer"),
  checkVerified,
  asyncHandler(userController.replaceInterviewerAvailability)
);

export default router;
