import { interviewers } from "../db/schema";
import { eq } from "drizzle-orm";
import { db } from "../config/database";

export const getPendingInterviewers = async () => {
  return db.select().from(interviewers).where(eq(interviewers.verificationStatus, "pending"));
};

export const getInterviewerDetails = async (interviewerId: string) => {
  return db.select().from(interviewers).where(eq(interviewers.id, Number(interviewerId)));
};

export const approveInterviewer = async (interviewerId: string) => {
  return db.update(interviewers)
    .set({ verificationStatus: "approved", isVerified: true, verifiedAt: new Date() })
    .where(eq(interviewers.id, Number(interviewerId)));
};

export const rejectInterviewer = async (interviewerId: string) => {
  return db.update(interviewers)
    .set({ verificationStatus: "rejected", isVerified: false })
    .where(eq(interviewers.id, Number(interviewerId)));
};
