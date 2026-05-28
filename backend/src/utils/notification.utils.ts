import { db } from "../config/database";
import { interviewSessions, jobSeekers, interviewers, users } from "../db/schema";
import { eq } from "drizzle-orm";
import { sendSessionNotificationEmail, SessionNotificationInput } from "../services/email.service";

export const notifySessionStateChange = async (
  sessionId: number,
  eventName: SessionNotificationInput["eventName"]
) => {
  try {
    const [session] = await db
      .select({
        id: interviewSessions.id,
        scheduledDate: interviewSessions.scheduledDate,
        meetingLink: interviewSessions.meetingLink,
        jobSeekerId: interviewSessions.jobSeekerId,
        interviewerId: interviewSessions.interviewerId,
      })
      .from(interviewSessions)
      .where(eq(interviewSessions.id, sessionId))
      .limit(1);

    if (!session) return;

    const [jsData] = await db
      .select({ email: users.email, firstName: users.firstName })
      .from(jobSeekers)
      .innerJoin(users, eq(users.id, jobSeekers.userId))
      .where(eq(jobSeekers.id, session.jobSeekerId))
      .limit(1);

    const [intData] = await db
      .select({ email: users.email, firstName: users.firstName })
      .from(interviewers)
      .innerJoin(users, eq(users.id, interviewers.userId))
      .where(eq(interviewers.id, session.interviewerId))
      .limit(1);

    const dateObj = new Date(session.scheduledDate);
    const dateStr = dateObj.toLocaleDateString("en-US");
    const timeStr = dateObj.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

    const sessionDetails = {
      id: session.id,
      date: dateStr,
      time: timeStr,
      meetingLink: session.meetingLink || undefined,
    };

    // Notify Job Seeker
    if (jsData) {
      await sendSessionNotificationEmail({
        to: jsData.email,
        firstName: jsData.firstName,
        eventName,
        role: "job_seeker",
        sessionDetails,
      }).catch(console.error);
    }

    // Notify Interviewer
    if (intData) {
      await sendSessionNotificationEmail({
        to: intData.email,
        firstName: intData.firstName,
        eventName,
        role: "interviewer",
        sessionDetails,
      }).catch(console.error);
    }
  } catch (error) {
    console.error("Failed to send notifications for session", sessionId, error);
  }
};
