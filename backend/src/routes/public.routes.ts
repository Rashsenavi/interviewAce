import { Router, Request, Response } from "express";
import { asyncHandler } from "../middleware/errorHandler";
import { getPublicInterviewers, getPublicTestimonials, getPublicStats } from "../services/public.service";

const router = Router();

/**
 * GET /api/public/interviewers
 * Top verified interviewers for the landing page (no auth required)
 */
router.get(
  "/interviewers",
  asyncHandler(async (req: Request, res: Response) => {
    const interviewers = await getPublicInterviewers(6);
    res.json({ success: true, data: { interviewers } });
  })
);

/**
 * GET /api/public/testimonials
 * Top real reviews for the landing page (no auth required)
 */
router.get(
  "/testimonials",
  asyncHandler(async (req: Request, res: Response) => {
    const testimonials = await getPublicTestimonials(3);
    res.json({ success: true, data: { testimonials } });
  })
);

/**
 * GET /api/public/stats
 * Real platform stats for the landing page (no auth required)
 */
router.get(
  "/stats",
  asyncHandler(async (req: Request, res: Response) => {
    const stats = await getPublicStats();
    res.json({ success: true, data: stats });
  })
);

export default router;
