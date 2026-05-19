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

const verifyEmailSchema = z.object({
  token: z.string().min(1, "Verification token is required"),
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const requestEmailVerificationSchema = z.object({
  email: z.string().email("Invalid email address"),
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
    console.time("LOGIN_DB_TIME");
    const result = await authService.login(validatedData);
    console.timeEnd("LOGIN_DB_TIME");

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
 * POST /api/auth/request-verification
 * Request an email verification token
 */
export const requestEmailVerification = async (req: Request, res: Response) => {
  try {
    const { email } = requestEmailVerificationSchema.parse(req.body);
    const token = await authService.createEmailVerificationToken(email);

    const data: { message: string; token?: string } = {
      message: "Verification token created",
    };

    // Return token in non-production for local development/testing.
    if (process.env.NODE_ENV !== "production") {
      data.token = token;
    }

    res.json({
      success: true,
      data,
      message: "Verification token created",
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

    // Avoid exposing account existence/verification state.
    return res.json({
      success: true,
      data: {
        message: "If your email exists, a verification link has been sent",
      },
      message: "If your email exists, a verification link has been sent",
    });
  }
};

/**
 * POST /api/auth/verify-email
 * Verify email with token
 */
export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = verifyEmailSchema.parse(req.body);
    const result = await authService.verifyEmail(token);

    res.json({
      success: true,
      data: {
        message: "Email verified successfully",
        userId: result.userId,
      },
      message: "Email verified successfully",
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
 * POST /api/auth/forgot-password
 * Request password reset
 */
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);
    await authService.forgotPassword(email);

    const message = "If your email exists, a password reset link has been sent";

    res.json({
      success: true,
      data: { message },
      message,
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
 * PUT /api/auth/reset-password
 * Reset password with token
 */
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = resetPasswordSchema.parse(req.body);
    await authService.resetPassword(token, password);

    res.json({
      success: true,
      data: {
        message: "Password reset successfully",
      },
      message: "Password reset successfully",
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

export default {
  registerJobSeeker,
  registerInterviewer,
  login,
  getCurrentUser,
  requestEmailVerification,
  verifyEmail,
  forgotPassword,
  resetPassword,
};
