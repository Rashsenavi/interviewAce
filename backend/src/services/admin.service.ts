import { interviewers, users } from "../db/schema";
import { eq } from "drizzle-orm";
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
