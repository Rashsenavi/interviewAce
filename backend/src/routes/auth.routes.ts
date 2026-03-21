import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";
import * as authController from "../controllers/auth.controller";
import rateLimit from "express-rate-limit";

const router = Router();

const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: "TOO_MANY_REQUESTS",
      message: "Too many password reset attempts. Please try again later.",
    },
  },
});

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
 * POST /api/auth/request-verification
 * Request email verification token
 */
router.post("/request-verification", asyncHandler(authController.requestEmailVerification));

/**
 * POST /api/auth/verify-email
 * Verify email with token
 */
router.post("/verify-email", asyncHandler(authController.verifyEmail));

/**
 * POST /api/auth/forgot-password
 * Request password reset
 */
router.post(
  "/forgot-password",
  forgotPasswordLimiter,
  asyncHandler(authController.forgotPassword)
);
/**
 * PUT /api/auth/reset-password
 * Reset password with token
 */
router.put("/reset-password", asyncHandler(authController.resetPassword));

export default router;
