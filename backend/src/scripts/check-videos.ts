import { db } from "../config/database";
import { sampleVideos, users } from "../db/schema";
import { eq } from "drizzle-orm";

async function main() {
  const data = await db
    .select({
      id: sampleVideos.id,
      videoTitle: sampleVideos.videoTitle,
      videoDescription: sampleVideos.videoDescription,
      videoUrl: sampleVideos.videoUrl,
      videoType: sampleVideos.videoType,
      adminApprovalStatus: sampleVideos.adminApprovalStatus,
      uploadedByUserId: sampleVideos.uploadedByUserId,
    })
    .from(sampleVideos);

  console.log("Videos in DB:", JSON.stringify(data, null, 2));
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
