import { Router, Request, Response } from "express";
import { z } from "zod";
import { asyncHandler } from "../middleware/errorHandler";
import { authenticate, authorize, checkVerified } from "../middleware/auth";
import * as questionsService from "../services/questions.service";

const router = Router();

const createQuestionSchema = z.object({
  industryId: z.number(),
  questionText: z.string().min(5),
  questionType: z.string(),
  difficultyLevel: z.string(),
  sampleAnswer: z.string().optional(),
  tips: z.string().optional(),
});

const reviewQuestionSchema = z.object({
  status: z.enum(["approved", "rejected"]),
});

/**
 * GET /api/questions
 * Get questions from the IT question bank with filters
 */
router.get(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const filters = {
      type: typeof req.query.type === "string" ? req.query.type : undefined,
      difficulty: typeof req.query.difficulty === "string" ? req.query.difficulty : undefined,
      role: typeof req.query.role === "string" ? req.query.role : undefined,
      search: typeof req.query.search === "string" ? req.query.search : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 50,
      offset: req.query.offset ? parseInt(req.query.offset as string, 10) : 0,
    };

    const result = await questionsService.getQuestions(filters);

    res.json({
      success: true,
      data: result,
    });
  })
);

/**
 * GET /api/questions/industries
 * Get all available industries for dropdowns
 */
router.get(
  "/industries",
  asyncHandler(async (req: Request, res: Response) => {
    const industriesList = await questionsService.getIndustries();
    res.json({
      success: true,
      data: { industries: industriesList },
    });
  })
);

/**
 * GET /api/questions/my
 * Get interviewer's contributed questions
 */
router.get(
  "/my",
  authenticate,
  authorize("interviewer"),
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: { message: "Unauthorized" } });
    }
    const myQuestions = await questionsService.getMyQuestions(req.user.id);
    res.json({
      success: true,
      data: { questions: myQuestions },
    });
  })
);

/**
 * POST /api/questions
 * Contribute a new question to the question bank (verified interviewers only)
 */
router.post(
  "/",
  authenticate,
  authorize("interviewer"),
  checkVerified,
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: { message: "Unauthorized" } });
    }
    const payload = createQuestionSchema.parse(req.body);
    try {
      const newQuestion = await questionsService.createQuestion({
        ...payload,
        contributedByUserId: req.user.id,
      });
      res.status(201).json({
        success: true,
        data: { question: newQuestion },
        message: "Question contributed successfully. Pending admin review.",
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        error: { message: err.message || "Failed to contribute question" },
      });
    }
  })
);

/**
 * GET /api/questions/admin/pending
 * Get all pending questions for review (admin only)
 */
router.get(
  "/admin/pending",
  authenticate,
  authorize("admin"),
  asyncHandler(async (req: Request, res: Response) => {
    const pendingQuestions = await questionsService.getPendingQuestions();
    res.json({
      success: true,
      data: { questions: pendingQuestions },
    });
  })
);

/**
 * PUT /api/questions/:id/review
 * Approve or reject a contributed question (admin only)
 */
router.put(
  "/:id/review",
  authenticate,
  authorize("admin"),
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: { message: "Unauthorized" } });
    }
    const questionId = parseInt(req.params.id, 10);
    if (isNaN(questionId)) {
      return res.status(400).json({ success: false, error: { message: "Invalid question ID" } });
    }
    const { status } = reviewQuestionSchema.parse(req.body);
    const updated = await questionsService.reviewQuestion(questionId, status, req.user.id);
    res.json({
      success: true,
      data: { question: updated },
      message: `Question successfully ${status}.`,
    });
  })
);

export default router;
