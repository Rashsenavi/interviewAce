import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";
import * as userController from "../controllers/user.controller";

const router = Router();

/**
 * GET /api/jobseekers
 * Get all job seekers (admin only)
 */
router.get("/", authenticate, authorize("admin"), asyncHandler(userController.getAllJobSeekers));

/**
 * GET /api/jobseekers/profile
 * Get current job seeker profile
 */
router.get("/profile", authenticate, authorize("job_seeker"), asyncHandler(userController.getJobSeekerProfile));

/**
 * PUT /api/jobseekers/profile
 * Update job seeker profile
 */
router.put("/profile", authenticate, authorize("job_seeker"), asyncHandler(userController.updateJobSeekerProfile));

export default router;
