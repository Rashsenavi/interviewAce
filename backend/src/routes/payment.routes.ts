import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

/**
 * POST /api/payments/initiate
 * Initiate payment
 */
router.post("/initiate", authenticate, authorize("job_seeker"), async (req, res) => {
  // TODO: Implement initiate payment
  res.json({ message: "Initiate payment" });
});

/**
 * POST /api/payments/webhook
 * PayHere payment notification webhook
 */
router.post("/webhook", async (req, res) => {
  // TODO: Implement payment webhook
  res.json({ message: "Payment webhook" });
});

/**
 * GET /api/payments/my-payments
 * Get user's payments
 */
router.get("/my-payments", authenticate, async (req, res) => {
  // TODO: Implement get user payments
  res.json({ message: "Get user payments" });
});

export default router;
