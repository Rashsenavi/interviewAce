import { Request, Response } from "express";
import * as reviewService from "../services/review.service";
import { db } from "../config/database";
import { jobSeekers, interviewers } from "../db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const submitReviewSchema = z.object({
  sessionId: z.number(),
  interviewerUserId: z.number(),
  rating: z.number().min(1).max(5),
  reviewText: z.string().min(1, "Review text is required"),
  isKnowledgeable: z.boolean().default(false),
  isHelpful: z.boolean().default(false),
  isActionable: z.boolean().default(false),
  isProfessional: z.boolean().default(false),
});

export async function submitReview(req: Request, res: Response) {
  const userId = (req as any).user.id;
  
  try {
    const data = submitReviewSchema.parse(req.body);

    // Resolve the internal Job Seeker ID from the user's Auth ID
    const jobSeekerRecord = await db.select().from(jobSeekers).where(eq(jobSeekers.userId, userId));
    if (!jobSeekerRecord.length) {
      return res.status(404).json({ error: "Job Seeker profile not found" });
    }
    const jobSeekerId = jobSeekerRecord[0].id;

    // Resolve the internal Interviewer ID from the payload's Interviewer User ID
    const interviewerRecord = await db.select().from(interviewers).where(eq(interviewers.userId, data.interviewerUserId));
    if (!interviewerRecord.length) {
      return res.status(404).json({ error: "Interviewer not found" });
    }
    const interviewerId = interviewerRecord[0].id;

    const review = await reviewService.createReview({
      sessionId: data.sessionId,
      jobSeekerId,
      interviewerId,
      rating: data.rating,
      reviewText: data.reviewText,
      isKnowledgeable: data.isKnowledgeable,
      isHelpful: data.isHelpful,
      isActionable: data.isActionable,
      isProfessional: data.isProfessional,
    });
    
    res.status(201).json({
      success: true,
      data: { review }
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation failed", details: err.errors });
    }
    console.error("Error submitting review:", err);
    res.status(500).json({ error: "Failed to submit review" });
  }
}

export async function getMyReviews(req: Request, res: Response) {
  const userId = (req as any).user.id;
  try {
    // Resolve Interviewer ID
    const interviewerRecord = await db.select().from(interviewers).where(eq(interviewers.userId, userId));
    if (!interviewerRecord.length) {
      return res.status(404).json({ error: "Interviewer profile not found" });
    }
    const interviewerId = interviewerRecord[0].id;

    const stats = await reviewService.getInterviewerReviewStats(interviewerId);
    res.json({
      success: true,
      data: { stats }
    });
  } catch (err) {
    console.error("Error fetching review stats:", err);
    res.status(500).json({ error: "Failed to fetch review stats" });
  }
}
