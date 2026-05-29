import cron from "node-cron";
import { db } from "./config/database";
import { interviewSessions, users } from "./db/schema";
import { eq, and, lte, sql } from "drizzle-orm";
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

  // Run every hour — marks past scheduled sessions as awaiting confirmation
  cron.schedule("0 * * * *", async () => {
    console.log("[CRON] Checking for sessions to mark as awaiting confirmation...");
    try {
      const updated = await db
        .update(interviewSessions)
        .set({ sessionStatus: "awaiting_confirmation", updatedAt: new Date() })
        .where(
          and(
            eq(interviewSessions.sessionStatus, "scheduled"),
            lte(
              interviewSessions.scheduledDate,
              sql`NOW() - (interview_sessions.duration * INTERVAL '1 minute')`
            )
          )
        )
        .returning({ id: interviewSessions.id });

      if (updated.length > 0) {
        console.log(`[CRON] Marked ${updated.length} session(s) as awaiting_confirmation.`);
      }
    } catch (err) {
      console.error("[CRON] Failed to transition sessions to awaiting_confirmation:", err);
    }
  });

  // Runs every 6 hours — auto-disputes sessions unconfirmed for 48 hours
  cron.schedule("0 */6 * * *", async () => {
    console.log("[CRON] Checking for unconfirmed sessions to auto-dispute...");
    try {
      const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
      const updated = await db
        .update(interviewSessions)
        .set({
          sessionStatus: "disputed",
          disputeReason: "Auto-flagged: interviewer did not confirm within 48 hours.",
          disputedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(interviewSessions.sessionStatus, "awaiting_confirmation"),
            lte(interviewSessions.scheduledDate, fortyEightHoursAgo)
          )
        )
        .returning({ id: interviewSessions.id });

      if (updated.length > 0) {
        console.log(`[CRON] Auto-disputed ${updated.length} session(s) due to 48hr confirmation timeout.`);
      }
    } catch (err) {
      console.error("[CRON] Failed to auto-dispute unconfirmed sessions:", err);
    }
  });

  console.log("[CRON] Scheduled jobs initialized.");
};
