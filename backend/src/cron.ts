import cron from "node-cron";
import { db } from "./config/database";
import { interviewSessions, users } from "./db/schema";
import { eq, and, lte } from "drizzle-orm";
import { notifySessionStateChange } from "./utils/notification.utils";
import { cancelSessionPayment } from "./services/payment.service";

export const initCronJobs = () => {
  // Run every hour
  cron.schedule("0 * * * *", async () => {
    console.log("[CRON] Running 48-hour pending session timeout check...");
    try {
      // Atomic update: only one cron job instance will successfully update a given row.
      // This prevents race conditions if multiple server instances run the cron job.
      const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

      const expiredSessions = await db
        .update(interviewSessions)
        .set({
          sessionStatus: "cancelled",
          cancellationReason: "Auto-cancelled: Interviewer did not respond within 48 hours.",
          cancelledBy: 0, // SYSTEM user ID
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(interviewSessions.sessionStatus, "pending"),
            lte(interviewSessions.createdAt, fortyEightHoursAgo)
          )
        )
        .returning({ id: interviewSessions.id });

      if (expiredSessions.length === 0) {
        console.log("[CRON] No expired pending sessions found.");
        return;
      }

      console.log(`[CRON] Found ${expiredSessions.length} expired sessions to cancel...`);

      // Process side effects for the successfully claimed sessions
      for (const session of expiredSessions) {
        try {
          // Process 100% refund (forceFullRefund = true because status is already 'cancelled' in DB)
          await cancelSessionPayment(session.id, 0, true);
          // Send emails
          await notifySessionStateChange(session.id, "session_auto_expired");
          console.log(`[CRON] Successfully processed refund and notification for auto-cancelled session #${session.id}`);
        } catch (error) {
          console.error(`[CRON] Failed to process side-effects for auto-cancelled session #${session.id}:`, error);
        }
      }
    } catch (error) {
      console.error("[CRON] Error running pending session timeout job:", error);
    }
  });

  console.log("[CRON] Scheduled jobs initialized.");
};
