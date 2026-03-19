import { Request, Response } from "express";
import * as authService from "../services/auth.service";
import { z } from "zod";

// Validation schemas
const registerJobSeekerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phoneNumber: z.string().optional(),
  university: z.string().optional(),
  graduationYear: z.number().optional(),
  fieldOfStudy: z.string().optional(),
  targetIndustries: z.array(z.string()).optional(),
  careerGoals: z.string().optional(),
});

const registerInterviewerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phoneNumber: z.string().optional(),
  currentCompany: z.string().min(1, "Current company is required"),
  jobTitle: z.string().min(1, "Job title is required"),
  yearsExperience: z.number().min(0, "Years of experience must be positive"),
  industryExpertise: z.array(z.string()).optional(),
  linkedinProfile: z.string().url("Invalid LinkedIn URL"),
  hourlyRate: z.number().min(0, "Hourly rate must be positive"),
  bio: z.string().optional(),
  nicUrl: z.string().optional(),
  appointmentLetterUrl: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

/**
 * POST /api/auth/register/job-seeker
 * Register a new job seeker
 */
export const registerJobSeeker = async (req: Request, res: Response) => {
  try {
    // Validate input
    const validatedData = registerJobSeekerSchema.parse(req.body);

    // Register user
    const result = await authService.registerJobSeeker(validatedData);

    res.status(201).json({
      success: true,
      data: result,
      message: "Job seeker registered successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid input data",
          details: error.errors,
        },
      });
    }
    throw error;
  }
};

/**
 * POST /api/auth/register/interviewer
 * Register a new interviewer
 */
export const registerInterviewer = async (req: Request, res: Response) => {
  try {
    // Validate input
    const validatedData = registerInterviewerSchema.parse(req.body);
    // Register user
    const result = await authService.registerInterviewer(validatedData);

    res.status(201).json({
      success: true,
      data: result,
      message: "Interviewer registered successfully. Pending verification.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid input data",
          details: error.errors,
        },
      });
    }
    throw error;
  }
};

/**
 * POST /api/auth/login
 * Login with email and password
 */
export const login = async (req: Request, res: Response) => {
  try {
    // Validate input
    const validatedData = loginSchema.parse(req.body);

    // Login
    const result = await authService.login(validatedData);

    res.json({
      success: true,
      data: result,
      message: "Login successful",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid input data",
          details: error.errors,
        },
      });
    }
    throw error;
  }
};

/**
 * GET /api/auth/me
 * Get current user profile
 */
export const getCurrentUser = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: {
        code: "NOT_AUTHENTICATED",
        message: "User not authenticated",
      },
    });
  }

  const user = await authService.getUserById(req.user.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      error: {
        code: "USER_NOT_FOUND",
        message: "User not found",
      },
    });
  }

  res.json({
    success: true,
    data: { user },
  });
};

/**
 * POST /api/auth/verify-email
 * Verify email with token
 */
export const verifyEmail = async (req: Request, res: Response) => {
  // TODO: Implement email verification
  res.json({
    success: true,
    message: "Email verification endpoint - not yet implemented",
  });
};

/**
 * POST /api/auth/forgot-password
 * Request password reset
 */
export const forgotPassword = async (req: Request, res: Response) => {
  // TODO: Implement forgot password
  res.json({
    success: true,
    message: "Password reset email sent (not yet implemented)",
  });
};

/**
 * PUT /api/auth/reset-password
 * Reset password with token
 */
export const resetPassword = async (req: Request, res: Response) => {
  // TODO: Implement reset password
  res.json({
    success: true,
    message: "Password reset endpoint - not yet implemented",
  });
};

export default {
  registerJobSeeker,
  registerInterviewer,
  login,
  getCurrentUser,
  verifyEmail,
  forgotPassword,
  resetPassword,
};
