import { db } from "../config/database";
import { sampleVideos, users, industries, interviewSessions, jobSeekers } from "../db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import cloudinary, { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } from "../config/cloudinary";
import { supabase } from "../config/supabase";

const getRelativePathFromUrl = (url: string, bucketName: string = "videos"): string | null => {
  if (!url) return null;
  const marker = `/public/${bucketName}/`;
  const index = url.indexOf(marker);
  if (index !== -1) {
    return decodeURIComponent(url.substring(index + marker.length));
  }
  return null;
};

const signUrlIfNeeded = async (url: string | null | undefined, bucketName: string = "videos"): Promise<string | null | undefined> => {
  if (!url) return url;
  if (!supabase) return url;
  const relativePath = getRelativePathFromUrl(url, bucketName);
  if (relativePath) {
    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(relativePath, 3600); // 1 hour expiry
      if (data?.signedUrl) {
        return data.signedUrl;
      }
    } catch (err) {
      console.error("Error signing URL:", err);
    }
  }
  return url;
};



/**
 * Creates a new sample video record.
 */
export const createVideoRecord = async (data: {
  sessionId?: number;
  industryId?: number;
  videoTitle: string;
  videoDescription?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  videoType: string;
  durationSeconds?: number;
  uploadedByUserId: number;
}) => {
  const result = await db.insert(sampleVideos).values({
    ...data,
    adminApprovalStatus: "pending", // Always pending upon creation
    isActive: true,
  }).returning();

  return result[0];
};

/**
 * Gets all videos pending admin approval.
 */
export const getPendingVideos = async () => {
  const result = await db
    .select({
      id: sampleVideos.id,
      videoTitle: sampleVideos.videoTitle,
      videoDescription: sampleVideos.videoDescription,
      videoUrl: sampleVideos.videoUrl,
      videoType: sampleVideos.videoType,
      createdAt: sampleVideos.createdAt,
      adminApprovalStatus: sampleVideos.adminApprovalStatus,
      sessionId: sampleVideos.sessionId,
      uploaderFirstName: users.firstName,
      uploaderLastName: users.lastName,
    })
    .from(sampleVideos)
    .innerJoin(users, eq(sampleVideos.uploadedByUserId, users.id))
    .where(eq(sampleVideos.adminApprovalStatus, "pending"))
    .orderBy(desc(sampleVideos.createdAt));

  return Promise.all(
    result.map(async (video) => {
      const signedVideoUrl = await signUrlIfNeeded(video.videoUrl, "videos");
      return {
        ...video,
        videoUrl: signedVideoUrl || video.videoUrl,
      };
    })
  );
};

/**
 * Approves a video.
 */
export const approveVideo = async (videoId: number) => {
  const result = await db
    .update(sampleVideos)
    .set({ adminApprovalStatus: "approved" })
    .where(eq(sampleVideos.id, videoId))
    .returning();

  return result[0];
};

/**
 * Rejects and deletes a video record.
 */
export const rejectVideo = async (videoId: number) => {
  const result = await db
    .delete(sampleVideos)
    .where(eq(sampleVideos.id, videoId))
    .returning();

  return result[0];
};

/**
 * Gets all approved public videos.
 */
export const getApprovedVideos = async (filters?: { industryId?: number }) => {
  let conditions = [eq(sampleVideos.adminApprovalStatus, "approved"), eq(sampleVideos.isActive, true)];

  if (filters?.industryId) {
    conditions.push(eq(sampleVideos.industryId, filters.industryId));
  }

  const result = await db
    .select({
      id: sampleVideos.id,
      videoTitle: sampleVideos.videoTitle,
      videoDescription: sampleVideos.videoDescription,
      videoUrl: sampleVideos.videoUrl,
      videoType: sampleVideos.videoType,
      durationSeconds: sampleVideos.durationSeconds,
      viewCount: sampleVideos.viewCount,
      createdAt: sampleVideos.createdAt,
      uploaderFirstName: users.firstName,
      uploaderLastName: users.lastName,
    })
    .from(sampleVideos)
    .innerJoin(users, eq(sampleVideos.uploadedByUserId, users.id))
    .where(and(...conditions))
    .orderBy(desc(sampleVideos.createdAt));

  return Promise.all(
    result.map(async (video) => {
      const signedVideoUrl = await signUrlIfNeeded(video.videoUrl, "videos");
      return {
        ...video,
        videoUrl: signedVideoUrl || video.videoUrl,
      };
    })
  );
};

export const incrementViewCount = async (videoId: number) => {
  // Using SQL update to increment view count safely
  await db.execute(
    sql`UPDATE sample_videos SET view_count = view_count + 1 WHERE id = ${videoId}`
  );
};

/**
 * Generates a signature to upload a video directly to Cloudinary.
 */
export const generateCloudinarySignature = async () => {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const folder = "sample_videos";

  const paramsToSign = {
    timestamp,
    folder,
  };

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    CLOUDINARY_API_SECRET
  );

  return {
    signature,
    timestamp,
    folder,
    apiKey: CLOUDINARY_API_KEY,
    cloudName: CLOUDINARY_CLOUD_NAME,
  };
};


