import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";
import * as reportController from "../controllers/report.controller";

const router = Router();

router.get(
  "/interviewer/earnings",
  authenticate,
  authorize("interviewer"),
  asyncHandler(reportController.exportInterviewerEarningsCsv)
);

router.get(
  "/admin/payouts",
  authenticate,
  authorize("admin"),
  asyncHandler(reportController.exportAdminPayoutsCsv)
);

export default router;
