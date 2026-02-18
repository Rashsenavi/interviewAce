import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";
import * as authController from "../controllers/auth.controller";

const router = Router();

/**
 * POST /api/auth/login
 * Login with email and password
 */
router.post("/login", asyncHandler(authController.login));

/**
 * POST /api/auth/register/job-seeker
 * Register as job seeker
 */
router.post("/register/job-seeker", asyncHandler(authController.registerJobSeeker));

/**
 * POST /api/auth/register/interviewer
 * Register as interviewer
 */
router.post("/register/interviewer", asyncHandler(authController.registerInterviewer));

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get("/me", authenticate, asyncHandler(authController.getCurrentUser));

/**
 * POST /api/auth/verify-email
 * Verify email with token
 */
router.post("/verify-email", asyncHandler(authController.verifyEmail));

/**
 * POST /api/auth/forgot-password
 * Request password reset
 */
router.post("/forgot-password", asyncHandler(authController.forgotPassword));

/**
 * PUT /api/auth/reset-password
 * Reset password with token
 */
router.put("/reset-password", asyncHandler(authController.resetPassword));

export default router;
