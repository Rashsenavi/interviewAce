import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";
import * as videoController from "../controllers/video.controller";

const router = Router();

// Public / Job Seeker endpoints
router.get("/approved", asyncHandler(videoController.getApprovedVideos));
router.post("/:id/view", asyncHandler(videoController.incrementViewCount));

// Interviewer endpoints
router.post(
  "/cloudinary-signature",
  authenticate,
  authorize("interviewer"),
  asyncHandler(videoController.getCloudinaryUploadSignature)
);

router.post(
  "/upload",
  authenticate,
  authorize("interviewer"),
  asyncHandler(videoController.uploadVideo)
);

// Admin endpoints
router.get(
  "/pending",
  authenticate,
  authorize("admin"),
  asyncHandler(videoController.getPendingVideos)
);

router.post(
  "/:id/approve",
  authenticate,
  authorize("admin"),
  asyncHandler(videoController.approveVideo)
);

router.post(
  "/:id/reject",
  authenticate,
  authorize("admin"),
  asyncHandler(videoController.rejectVideo)
);

export default router;
