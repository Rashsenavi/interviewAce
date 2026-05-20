import { Router, Request, Response } from "express";
import { asyncHandler } from "../middleware/errorHandler";
import * as questionsService from "../services/questions.service";

const router = Router();

/**
 * GET /api/questions
 * Get questions from the IT question bank with filters
 * Query params: type, difficulty, role, search, limit, offset
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

export default router;
