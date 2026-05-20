import { Router, Request, Response } from "express";
import { authenticate, authorize } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";
import * as paymentService from "../services/payment.service";

const router = Router();

/**
 * GET /api/payments
 * Get all payments for the current job seeker
 */
router.get(
  "/",
  authenticate,
  authorize("job_seeker"),
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: "NOT_AUTHENTICATED", message: "User not authenticated" },
      });
    }

    const payments = await paymentService.getPaymentsForJobSeeker(req.user.id);

    res.json({
      success: true,
      data: { payments },
    });
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
      return res.status(401).json({
        success: false,
        error: { code: "NOT_AUTHENTICATED", message: "User not authenticated" },
      });
    }
    const payments = await paymentService.getPaymentsForJobSeeker(req.user.id);
    res.json({ success: true, data: { payments } });
  })
);

/**
 * POST /api/payments/initiate
 * Initiate payment (PayHere integration placeholder)
 */
router.post("/initiate", authenticate, authorize("job_seeker"), async (req, res) => {
  // TODO: Implement PayHere payment initiation
  res.json({ success: true, message: "Payment initiation pending PayHere integration" });
});

/**
 * POST /api/payments/webhook
 * PayHere payment notification webhook
 */
router.post("/webhook", async (req, res) => {
  // TODO: Implement PayHere webhook processing
  res.json({ success: true, message: "Webhook received" });
});

export default router;
