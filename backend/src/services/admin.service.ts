import { interviewers, users, interviewSessions, payments, jobSeekers } from "../db/schema";
import { eq, sql, desc } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db } from "../config/database";

type AdminServiceError = Error & { status?: number; code?: string };

const createError = (message: string, status: number, code: string): AdminServiceError => {
  const error = new Error(message) as AdminServiceError;
  error.status = status;
  error.code = code;
  return error;
};

const parseInterviewerId = (interviewerId: string): number => {
  const parsedId = Number(interviewerId);

  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    throw createError("Invalid interviewer ID", 400, "INVALID_INTERVIEWER_ID");
  }

  return parsedId;
};

const buildFullName = (firstName: string, lastName: string) =>
  `${firstName} ${lastName}`.trim();

const getInterviewerWithUserById = async (interviewerId: number) => {
  const [interviewer] = await db
    .select({
      id: interviewers.id,
      userId: interviewers.userId,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      verificationStatus: interviewers.verificationStatus,
      isVerified: interviewers.isVerified,
      nicUrl: interviewers.nicUrl,
      appointmentLetterUrl: interviewers.appointmentLetterUrl,
      verifiedAt: interviewers.verifiedAt,
      createdAt: interviewers.createdAt,
      updatedAt: interviewers.updatedAt,
    })
    .from(interviewers)
    .innerJoin(users, eq(interviewers.userId, users.id))
    .where(eq(interviewers.id, interviewerId))
    .limit(1);

  return interviewer
    ? {
        ...interviewer,
        fullName: buildFullName(interviewer.firstName, interviewer.lastName),
      }
    : null;
};

export const getPendingInterviewers = async () => {
  const result = await db
    .select({
      id: interviewers.id,
      userId: interviewers.userId,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      verificationStatus: interviewers.verificationStatus,
      isVerified: interviewers.isVerified,
      nicUrl: interviewers.nicUrl,
      appointmentLetterUrl: interviewers.appointmentLetterUrl,
      createdAt: interviewers.createdAt,
      updatedAt: interviewers.updatedAt,
    })
    .from(interviewers)
    .innerJoin(users, eq(interviewers.userId, users.id))
    .where(eq(interviewers.verificationStatus, "pending"));

  return result.map((interviewer) => ({
    ...interviewer,
    fullName: buildFullName(interviewer.firstName, interviewer.lastName),
  }));
};

export const getInterviewerDetails = async (interviewerId: string) => {
  const parsedId = parseInterviewerId(interviewerId);
  return getInterviewerWithUserById(parsedId);
};

export const approveInterviewer = async (interviewerId: string) => {
  const parsedId = parseInterviewerId(interviewerId);
  const current = await getInterviewerWithUserById(parsedId);

  if (!current) {
    throw createError("Interviewer not found", 404, "INTERVIEWER_NOT_FOUND");
  }

  await db.transaction(async (tx) => {
    await tx
      .update(interviewers)
      .set({
        verificationStatus: "approved",
        isVerified: true,
        verifiedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(interviewers.id, parsedId));
      
    await tx
      .update(users)
      .set({ isVerified: true })
      .where(eq(users.id, current.userId));
  });

  return getInterviewerWithUserById(parsedId);
};

export const rejectInterviewer = async (interviewerId: string, notes?: string) => {
  const parsedId = parseInterviewerId(interviewerId);
  const current = await getInterviewerWithUserById(parsedId);

  if (!current) {
    throw createError("Interviewer not found", 404, "INTERVIEWER_NOT_FOUND");
  }

  await db.transaction(async (tx) => {
    await tx
      .update(interviewers)
      .set({
        verificationStatus: "rejected",
        isVerified: false,
        verifiedAt: null,
        verificationNotes: notes || null,
        updatedAt: new Date(),
      })
      .where(eq(interviewers.id, parsedId));
      
    await tx
      .update(users)
      .set({ isVerified: false })
      .where(eq(users.id, current.userId));
  });

  return getInterviewerWithUserById(parsedId);
};

export const getAllUsers = async () => {
  // Query users, and manually fetch related profiles if needed
  // For simplicity, we just return basic user details
  const allUsers = await db
    .select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      userType: users.userType,
      isActive: users.isActive,
      isVerified: users.isVerified,
      createdAt: users.createdAt,
    })
    .from(users);
  return allUsers;
};

export const updateUserStatus = async (userId: string, isActive: boolean) => {
  const id = Number(userId);
  if (!Number.isInteger(id)) throw createError("Invalid user ID", 400, "INVALID_USER_ID");

  await db
    .update(users)
    .set({ isActive, updatedAt: new Date() })
    .where(eq(users.id, id));

  return { id, isActive };
};

export const deleteUser = async (userId: string) => {
  const id = Number(userId);
  if (!Number.isInteger(id)) throw createError("Invalid user ID", 400, "INVALID_USER_ID");

  await db.delete(users).where(eq(users.id, id));
  return { success: true };
};



export const getPlatformAnalytics = async () => {
  // 1. User Metrics
  const [userCounts] = await db
    .select({
      total: sql<number>`count(*)::int`,
      jobSeekers: sql<number>`count(*) filter (where ${users.userType} = 'job_seeker')::int`,
      interviewers: sql<number>`count(*) filter (where ${users.userType} = 'interviewer')::int`,
      activeInterviewers: sql<number>`count(*) filter (where ${users.userType} = 'interviewer' and ${users.isVerified} = true)::int`,
    })
    .from(users);

  // 2. Session Metrics
  const [sessionCounts] = await db
    .select({
      total: sql<number>`count(*)::int`,
      completed: sql<number>`count(*) filter (where ${interviewSessions.sessionStatus} = 'completed')::int`,
      cancelled: sql<number>`count(*) filter (where ${interviewSessions.sessionStatus} = 'cancelled')::int`,
    })
    .from(interviewSessions);

  // 3. Financial Metrics
  const [financials] = await db
    .select({
      totalRevenue: sql<number>`coalesce(sum(${payments.amount}), 0)::float`,
      platformRevenue: sql<number>`coalesce(sum(${payments.platformCommission}), 0)::float`,
      interviewerPayouts: sql<number>`coalesce(sum(${payments.interviewerPayout}), 0)::float`,
    })
    .from(payments)
    .where(eq(payments.paymentStatus, "completed"));

  const intUsers = alias(users, 'int_users');

  // 4. Recent Bookings
  const recentBookings = await db
    .select({
      id: interviewSessions.id,
      scheduledDate: interviewSessions.scheduledDate,
      sessionStatus: interviewSessions.sessionStatus,
      priceAmount: interviewSessions.priceAmount,
      jobSeeker: {
        firstName: users.firstName,
        lastName: users.lastName,
      },
      interviewer: {
        firstName: intUsers.firstName,
        lastName: intUsers.lastName,
      },
    })
    .from(interviewSessions)
    .innerJoin(jobSeekers, eq(interviewSessions.jobSeekerId, jobSeekers.id))
    .innerJoin(users, eq(jobSeekers.userId, users.id))
    .innerJoin(interviewers, eq(interviewSessions.interviewerId, interviewers.id))
    .innerJoin(intUsers, eq(interviewers.userId, intUsers.id))
    .orderBy(desc(interviewSessions.createdAt))
    .limit(5);

  // 5. Top Interviewers
  const topInterviewers = await db
    .select({
      id: interviewers.id,
      ratingAverage: interviewers.ratingAverage,
      totalInterviews: interviewers.totalInterviews,
      totalEarnings: interviewers.totalEarnings,
      firstName: users.firstName,
      lastName: users.lastName,
      jobTitle: interviewers.jobTitle,
      company: interviewers.currentCompany,
    })
    .from(interviewers)
    .innerJoin(users, eq(interviewers.userId, users.id))
    .where(eq(interviewers.isVerified, true))
    .orderBy(desc(interviewers.ratingAverage), desc(interviewers.totalInterviews))
    .limit(5);

  return {
    users: userCounts,
    sessions: sessionCounts,
    financials,
    recentBookings,
    topInterviewers,
  };
};
