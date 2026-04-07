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

const availabilitySlotSchema = z.object({
  dayOfWeek: z.enum(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]),
  startTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
  endTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
  isAvailable: z.boolean().optional(),
});

const replaceAvailabilitySchema = z.object({
  slots: z.array(availabilitySlotSchema),
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
  const interviewers = await userService.getAllInterviewers();

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

/**
 * GET /api/interviewers/:id/availability
 * Get interviewer availability by interviewer user id
 */
export const getInterviewerAvailability = async (req: Request, res: Response) => {
  const interviewerUserId = parseInt(req.params.id, 10);

  if (Number.isNaN(interviewerUserId)) {
    return res.status(400).json({
      success: false,
      error: { code: "INVALID_ID", message: "Invalid interviewer ID" },
    });
  }

  const slots = await userService.getInterviewerAvailabilityByUserId(interviewerUserId);

  res.json({
    success: true,
    data: { slots },
  });
};

/**
 * PUT /api/interviewers/availability
 * Replace current interviewer's recurring availability
 */
export const replaceInterviewerAvailability = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: { code: "NOT_AUTHENTICATED", message: "User not authenticated" },
    });
  }

  try {
    const validated = replaceAvailabilitySchema.parse(req.body);
    const slots = await userService.replaceInterviewerAvailabilityByUserId(req.user.id, validated.slots);

    res.json({
      success: true,
      data: { slots },
      message: "Availability updated successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid availability payload",
          details: error.errors,
        },
      });
    }
    throw error;
  }
};

export default {
  getAllJobSeekers,
  getJobSeekerProfile,
  updateJobSeekerProfile,
  getAllInterviewers,
  getInterviewerProfile,
  updateInterviewerProfile,
  getInterviewerById,
  getInterviewerAvailability,
  replaceInterviewerAvailability,
};
