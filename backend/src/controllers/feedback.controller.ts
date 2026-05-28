import { Request, Response } from "express";
import * as feedbackService from "../services/feedback.service";
import { z } from "zod";

const submitFeedbackSchema = z.object({
  sessionId: z.number(),
  jobSeekerId: z.number(),
  overallRating: z.number().min(1).max(5),
  communicationRating: z.number().min(1).max(5),
  technicalRating: z.number().min(1).max(5),
  problemSolvingRating: z.number().min(1).max(5),
  confidenceRating: z.number().min(1).max(5),
  strengths: z.string().min(1, "Strengths are required"),
  weaknesses: z.string().min(1, "Weaknesses are required"),
  improvementTips: z.string().min(1, "Improvement tips are required"),
  generalComments: z.string().optional(),
});

const submitInterviewerReviewSchema = z.object({
  sessionId: z.number(),
  interviewerId: z.number(),
  rating: z.number().min(1).max(5),
  reviewText: z.string().min(1, "Review text is required"),
});

// POST /api/feedback — Interviewer submits feedback
export async function submitFeedback(req: Request, res: Response) {
  const userId = (req as any).user.id;
  
  try {
    const { db } = require("../config/database");
    const { interviewers } = require("../db/schema");
    const { eq } = require("drizzle-orm");
    
    const [interviewer] = await db
      .select({ id: interviewers.id })
      .from(interviewers)
      .where(eq(interviewers.userId, userId))
      .limit(1);

    if (!interviewer) {
      return res.status(404).json({ error: "Interviewer profile not found" });
    }

    const data = submitFeedbackSchema.parse(req.body);

    const feedback = await feedbackService.createFeedback({
      ...data,
      interviewerId: interviewer.id,
    });
    
    res.status(201).json({
      success: true,
      data: { feedback }
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation failed", details: err.errors });
    }
    console.error("Error submitting feedback:", err);
    res.status(500).json({ error: "Failed to submit feedback" });
  }
}

// GET /api/feedback/my — Job seeker views their own feedback
export async function getMyFeedback(req: Request, res: Response) {
  const userId = (req as any).user.id;
  try {
    const { db } = require("../config/database");
    const { jobSeekers } = require("../db/schema");
    const { eq } = require("drizzle-orm");
    
    const [jobSeeker] = await db
      .select({ id: jobSeekers.id })
      .from(jobSeekers)
      .where(eq(jobSeekers.userId, userId))
      .limit(1);

    if (!jobSeeker) return res.status(404).json({ error: "Job Seeker not found" });

    const feedback = await feedbackService.getFeedbackForJobSeeker(jobSeeker.id);
    res.json({
      success: true,
      data: { feedback }
    });
  } catch (err) {
    console.error("Error fetching feedback:", err);
    res.status(500).json({ error: "Failed to fetch feedback" });
  }
}

// GET /api/feedback/my/stats — Aggregated stats + trend data
export async function getMyFeedbackStats(req: Request, res: Response) {
  const userId = (req as any).user.id;
  try {
    const { db } = require("../config/database");
    const { jobSeekers } = require("../db/schema");
    const { eq } = require("drizzle-orm");
    
    const [jobSeeker] = await db
      .select({ id: jobSeekers.id })
      .from(jobSeekers)
      .where(eq(jobSeekers.userId, userId))
      .limit(1);

    if (!jobSeeker) return res.status(404).json({ error: "Job Seeker not found" });

    const stats = await feedbackService.getJobSeekerFeedbackStats(jobSeeker.id);
    res.json({
      success: true,
      data: { stats }
    });
  } catch (err) {
    console.error("Error fetching feedback stats:", err);
    res.status(500).json({ error: "Failed to fetch feedback stats" });
  }
}

// GET /api/feedback/session/:sessionId — Feedback for one session
export async function getSessionFeedback(req: Request, res: Response) {
  try {
    const feedback = await feedbackService.getFeedbackBySession(Number(req.params.sessionId));
    res.json({
      success: true,
      data: { feedback }
    });
  } catch (err) {
    console.error("Error fetching session feedback:", err);
    res.status(500).json({ error: "Failed to fetch session feedback" });
  }
}

// POST /api/feedback/interviewer-review — Job seeker submits a review for interviewer
export async function submitInterviewerReview(req: Request, res: Response) {
  const jobSeekerId = (req as any).user.id; // user ID of the job seeker
  
  try {
    const data = submitInterviewerReviewSchema.parse(req.body);

    const review = await feedbackService.submitInterviewerReview({
      ...data,
      jobSeekerId,
    });
    
    res.status(201).json({
      success: true,
      data: { review }
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation failed", details: err.errors });
    }
    console.error("Error submitting interviewer review:", err);
    res.status(500).json({ error: "Failed to submit reviewer review" });
  }
}

// GET /api/feedback/interviewer/analytics — Interviewer views their analytics
export async function getInterviewerAnalytics(req: Request, res: Response) {
  const interviewerUserId = (req as any).user.id; // user ID of the interviewer

  try {
    // We need the specific interviewer ID, not the user ID.
    const { db } = require("../config/database");
    const { interviewers } = require("../db/schema");
    const { eq } = require("drizzle-orm");
    
    const [interviewer] = await db
      .select({ id: interviewers.id })
      .from(interviewers)
      .where(eq(interviewers.userId, interviewerUserId))
      .limit(1);

    if (!interviewer) {
      return res.status(404).json({ error: "Interviewer profile not found" });
    }

    const analytics = await feedbackService.getInterviewerAnalytics(interviewer.id);
    res.json({
      success: true,
      data: { analytics }
    });
  } catch (err) {
    console.error("Error fetching interviewer analytics:", err);
    res.status(500).json({ error: "Failed to fetch interviewer analytics" });
  }
}
