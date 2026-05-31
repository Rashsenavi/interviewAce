import { Request, Response } from "express";
import * as videoService from "../services/video.service";

export const getCloudinaryUploadSignature = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: { code: "UNAUTHORIZED" } });
  }

  try {
    const result = await videoService.generateCloudinarySignature();
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error instanceof Error ? error.message : "Failed to generate Cloudinary signature" }
    });
  }
};

export const uploadVideo = async (req: Request, res: Response) => {

  if (!req.user) {
    return res.status(401).json({ success: false, error: { code: "UNAUTHORIZED" } });
  }

  const {
    sessionId,
    industryId,
    videoTitle,
    videoDescription,
    videoUrl,
    thumbnailUrl,
    videoType,
    durationSeconds,
  } = req.body;

  if (!videoTitle || !videoUrl || !videoType) {
    return res.status(400).json({ success: false, error: { message: "Missing required fields" } });
  }

  const video = await videoService.createVideoRecord({
    sessionId,
    industryId,
    videoTitle,
    videoDescription,
    videoUrl,
    thumbnailUrl,
    videoType,
    durationSeconds,
    uploadedByUserId: req.user.id,
  });

  res.json({ success: true, data: { video } });
};

export const getPendingVideos = async (req: Request, res: Response) => {
  const videos = await videoService.getPendingVideos();
  res.json({ success: true, data: { videos } });
};

export const approveVideo = async (req: Request, res: Response) => {
  const videoId = parseInt(req.params.id);
  const video = await videoService.approveVideo(videoId);
  res.json({ success: true, data: { video } });
};

export const rejectVideo = async (req: Request, res: Response) => {
  const videoId = parseInt(req.params.id);
  const video = await videoService.rejectVideo(videoId);
  res.json({ success: true, data: { video } });
};

export const getApprovedVideos = async (req: Request, res: Response) => {
  const industryId = req.query.industryId ? parseInt(req.query.industryId as string) : undefined;
  const videos = await videoService.getApprovedVideos({ industryId });
  res.json({ success: true, data: { videos } });
};

export const incrementViewCount = async (req: Request, res: Response) => {
  const videoId = parseInt(req.params.id);
  await videoService.incrementViewCount(videoId);
  res.json({ success: true });
};
