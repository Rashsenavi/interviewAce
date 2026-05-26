import { Router, Request, Response } from "express";
import { authenticate, authorize } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";
import * as paymentService from "../services/payment.service";
import { db } from "../config/database";
import { admins } from "../db/schema";
import { eq } from "drizzle-orm";

const router = Router();

/**
 * POST /api/payments/initiate
 * Job seeker initiates PayHere payment for a session booking.
 * Returns the hash + form params to redirect to PayHere checkout.
 */
router.post(
  "/initiate",
  authenticate,
  authorize("job_seeker"),
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: { code: "NOT_AUTHENTICATED" } });
    }

    const { sessionId } = req.body;
    if (!sessionId || typeof sessionId !== "number") {
      return res.status(400).json({
        success: false,
        error: { code: "INVALID_INPUT", message: "sessionId (number) is required" },
      });
    }

    const result = await paymentService.initiatePayment(sessionId, req.user.id);
    res.json({ success: true, data: result });
  })
);

/**
 * POST /api/payments/webhook
 * PayHere server-to-server notification. No authentication required.
 * IMPORTANT: This must be publicly accessible.
 */
router.post(
  "/webhook",
  asyncHandler(async (req: Request, res: Response) => {
    const body = req.body as Record<string, string>;
    const result = await paymentService.processWebhook(body);
    // PayHere expects HTTP 200 regardless of outcome
    res.status(200).json({ received: true, ...result });
  })
);

/**
 * GET /api/payments/status/:orderId
 * Get payment status by PayHere order ID (for confirmation page).
 */
router.get(
  "/status/:orderId",
  asyncHandler(async (req: Request, res: Response) => {
    const payment = await paymentService.getPaymentByOrderId(req.params.orderId);
    if (!payment) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND" } });
    }
    res.json({ success: true, data: { payment } });
  })
);

/**
 * GET /api/payments
 * Job seeker: Get all their payments.
 */
router.get(
  "/",
  authenticate,
  authorize("job_seeker"),
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: { code: "NOT_AUTHENTICATED" } });
    }
    const payments = await paymentService.getPaymentsForJobSeeker(req.user.id);
    res.json({ success: true, data: { payments } });
  })
);

/**
 * GET /api/payments/my-payments (legacy route)
 */
router.get(
  "/my-payments",
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: { code: "NOT_AUTHENTICATED" } });
    }
    const payments = await paymentService.getPaymentsForJobSeeker(req.user.id);
    res.json({ success: true, data: { payments } });
  })
);

/**
 * GET /api/payments/earnings?month=2026-05
 * Interviewer: Get their earnings summary and per-session breakdown.
 */
router.get(
  "/earnings",
  authenticate,
  authorize("interviewer"),
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: { code: "NOT_AUTHENTICATED" } });
    }
    const month = req.query.month as string | undefined;
    const data = await paymentService.getInterviewerEarnings(req.user.id, month);
    if (!data) {
      return res.status(404).json({ success: false, error: { code: "INTERVIEWER_NOT_FOUND" } });
    }
    res.json({ success: true, data });
  })
);

/**
 * GET /api/payments/admin/payouts?month=2026-05
 * Admin: Get all interviewers' payout summary for a month.
 */
router.get(
  "/admin/payouts",
  authenticate,
  authorize("admin"),
  asyncHandler(async (req: Request, res: Response) => {
    const month = (req.query.month as string) || getCurrentMonth();
    const data = await paymentService.getAdminPayoutSummary(month);
    res.json({ success: true, data: { payouts: data, month } });
  })
);

/**
 * POST /api/payments/admin/payouts/release
 * Admin: Release monthly payouts for selected interviewers.
 */
router.post(
  "/admin/payouts/release",
  authenticate,
  authorize("admin"),
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: { code: "NOT_AUTHENTICATED" } });
    }

    const { interviewerIds, month } = req.body;
    if (!Array.isArray(interviewerIds) || !month) {
      return res.status(400).json({
        success: false,
        error: { code: "INVALID_INPUT", message: "interviewerIds[] and month are required" },
      });
    }

    // Get admin record id from user id
    const [admin] = await db
      .select({ id: admins.id })
      .from(admins)
      .where(eq(admins.userId, req.user.id))
      .limit(1);

    const adminId = admin?.id || 0;
    const result = await paymentService.releasePayouts(interviewerIds, month, adminId);
    res.json({ success: true, data: result });
  })
);

/**
 * POST /api/payments/cancel/:sessionId
 * Cancel payment for a session (refund calculation included).
 */
router.post(
  "/cancel/:sessionId",
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: { code: "NOT_AUTHENTICATED" } });
    }
    const sessionId = parseInt(req.params.sessionId, 10);
    const result = await paymentService.cancelSessionPayment(sessionId, req.user.id);
    if (!result) {
      return res.status(404).json({ success: false, error: { code: "PAYMENT_NOT_FOUND" } });
    }
    res.json({ success: true, data: result });
  })
);

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export default router;
