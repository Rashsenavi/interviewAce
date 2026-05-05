import { Request, Response } from "express";
import * as userService from "../services/user.service";
import { z } from "zod";

// Validation schemas
const updateJobSeekerSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phoneNumber: z.string().optional(),
  university: z.string().optional(),
  graduationYear: z.number().optional(),
  fieldOfStudy: z.string().optional(),
  targetIndustries: z.array(z.string()).optional(),
  careerGoals: z.string().optional(),
  resumeUrl: z.string().url().optional(),
  preferredLanguage: z.string().optional(),
});

const updateInterviewerSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phoneNumber: z.string().optional(),
  currentCompany: z.string().optional(),
  jobTitle: z.string().optional(),
  yearsExperience: z.number().min(0).optional(),
  industryExpertise: z.array(z.string()).optional(),
  linkedinProfile: z.string().url().optional(),
  hourlyRate: z.number().min(0).optional(),
  bio: z.string().optional(),
  bankAccountNumber: z.string().optional(),
});

/**
 * GET /api/jobseekers
 * Get all job seekers (admin only)
 */
export const getAllJobSeekers = async (req: Request, res: Response) => {
  const jobSeekers = await userService.getAllJobSeekers();

  res.json({
    success: true,
    data: { jobSeekers },
  });
};

/**
 * GET /api/jobseekers/profile
 * Get current job seeker profile
 */
export const getJobSeekerProfile = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: { code: "NOT_AUTHENTICATED", message: "User not authenticated" },
    });
  }

  const profile = await userService.getJobSeekerByUserId(req.user.id);

  if (!profile) {
    return res.status(404).json({
      success: false,
      error: { code: "PROFILE_NOT_FOUND", message: "Job seeker profile not found" },
    });
  }

  res.json({
    success: true,
    data: { profile },
  });
};

/**
 * PUT /api/jobseekers/profile
 * Update current job seeker profile
 */
export const updateJobSeekerProfile = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: { code: "NOT_AUTHENTICATED", message: "User not authenticated" },
    });
  }

  try {
    const validatedData = updateJobSeekerSchema.parse(req.body);
    const profile = await userService.updateJobSeeker(req.user.id, validatedData);

    res.json({
      success: true,
      data: { profile },
      message: "Profile updated successfully",
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
 * GET /api/interviewers
 * Get all interviewers
 */
export const getAllInterviewers = async (req: Request, res: Response) => {
  const parseNumber = (value: unknown): number | undefined => {
    if (typeof value !== "string" || value.trim() === "") return undefined;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  };

  const parseBoolean = (value: unknown): boolean | undefined => {
    if (typeof value !== "string") return undefined;
    if (value === "true") return true;
    if (value === "false") return false;
    return undefined;
  };

  const sortBy =
    req.query.sortBy === "price" ||
    req.query.sortBy === "experience" ||
    req.query.sortBy === "reviews" ||
    req.query.sortBy === "rating"
      ? req.query.sortBy
      : "rating";

  const sortOrder = req.query.sortOrder === "asc" || req.query.sortOrder === "desc"
    ? req.query.sortOrder
    : "desc";

  const interviewers = await userService.getAllInterviewers({
    search: typeof req.query.search === "string" ? req.query.search : undefined,
    industry: typeof req.query.industry === "string" ? req.query.industry : undefined,
    company: typeof req.query.company === "string" ? req.query.company : undefined,
    minRating: parseNumber(req.query.minRating),
    minPrice: parseNumber(req.query.minPrice),
    maxPrice: parseNumber(req.query.maxPrice),
    minExperience: parseNumber(req.query.minExperience),
    isVerified: parseBoolean(req.query.isVerified) ?? true,
    sortBy,
    sortOrder,
  });

  res.json({
    success: true,
    data: { interviewers },
  });
};

/**
 * GET /api/interviewers/profile
 * Get current interviewer profile
 */
export const getInterviewerProfile = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: { code: "NOT_AUTHENTICATED", message: "User not authenticated" },
    });
  }

  const profile = await userService.getInterviewerByUserId(req.user.id);

  if (!profile) {
    return res.status(404).json({
      success: false,
      error: { code: "PROFILE_NOT_FOUND", message: "Interviewer profile not found" },
    });
  }

  res.json({
    success: true,
    data: { profile },
  });
};

/**
 * PUT /api/interviewers/profile
 * Update current interviewer profile
 */
export const updateInterviewerProfile = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: { code: "NOT_AUTHENTICATED", message: "User not authenticated" },
    });
  }

  try {
    const validatedData = updateInterviewerSchema.parse(req.body);
    const profile = await userService.updateInterviewer(req.user.id, validatedData);

    res.json({
      success: true,
      data: { profile },
      message: "Profile updated successfully",
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
 * GET /api/interviewers/:id
 * Get interviewer by ID (public)
 */
export const getInterviewerById = async (req: Request, res: Response) => {
  const interviewerId = parseInt(req.params.id);

  if (isNaN(interviewerId)) {
    return res.status(400).json({
      success: false,
      error: { code: "INVALID_ID", message: "Invalid interviewer ID" },
    });
  }

  const profile = await userService.getInterviewerByUserId(interviewerId);

  if (!profile) {
    return res.status(404).json({
      success: false,
      error: { code: "INTERVIEWER_NOT_FOUND", message: "Interviewer not found" },
    });
  }

  // Return public profile (exclude sensitive info)
  const publicProfile = {
    id: profile.id,
    firstName: profile.firstName,
    lastName: profile.lastName,
    currentCompany: profile.currentCompany,
    jobTitle: profile.jobTitle,
    yearsExperience: profile.yearsExperience,
    industryExpertise: profile.industryExpertise,
    hourlyRate: profile.hourlyRate,
    bio: profile.bio,
    isVerified: profile.isVerified,
    ratingAverage: profile.ratingAverage,
    totalInterviews: profile.totalInterviews,
  };

  res.json({
    success: true,
    data: { interviewer: publicProfile },
  });
};

export default {
  getAllJobSeekers,
  getJobSeekerProfile,
  updateJobSeekerProfile,
  getAllInterviewers,
  getInterviewerProfile,
  updateInterviewerProfile,
  getInterviewerById,
};
