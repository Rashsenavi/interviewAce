import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";
import {
  getMyTicketsHandler,
  createTicketHandler,
  getTicketDetailsHandler,
  replyTicketHandler,
} from "../controllers/user-support.controller";

const router = Router();

/**
 * GET /api/support
 * Get current user's support tickets
 */
router.get("/", authenticate, asyncHandler(getMyTicketsHandler));

/**
 * POST /api/support
 * Create a new support ticket
 */
router.post("/", authenticate, asyncHandler(createTicketHandler));

/**
 * GET /api/support/:id
 * Get details and messages for a specific ticket
 */
router.get("/:id", authenticate, asyncHandler(getTicketDetailsHandler));

/**
 * POST /api/support/:id/messages
 * Add a reply to an existing ticket
 */
router.post("/:id/messages", authenticate, asyncHandler(replyTicketHandler));

export default router;
