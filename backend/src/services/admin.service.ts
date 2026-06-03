import { interviewers, users, interviewSessions, payments, jobSeekers, sampleVideos } from "../db/schema";
import { eq, sql, desc } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db } from "../config/database";
import { supabase } from "../config/supabase";

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

const getRelativePathFromUrl = (url: string, bucketName: string = "documents"): string | null => {
  if (!url) return null;
  const marker = `/public/${bucketName}/`;
  const index = url.indexOf(marker);
  if (index !== -1) {
    return decodeURIComponent(url.substring(index + marker.length));
  }
  return null;
};

const signUrlIfNeeded = async (url: string | null | undefined, bucketName: string = "documents"): Promise<string | null | undefined> => {
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
      linkedinProfile: interviewers.linkedinProfile,
      verifiedAt: interviewers.verifiedAt,
      createdAt: interviewers.createdAt,
      updatedAt: interviewers.updatedAt,
    })
    .from(interviewers)
    .innerJoin(users, eq(interviewers.userId, users.id))
    .where(eq(interviewers.id, interviewerId))
    .limit(1);

  if (!interviewer) return null;

  const signedNicUrl = await signUrlIfNeeded(interviewer.nicUrl);
  const signedAppointmentLetterUrl = await signUrlIfNeeded(interviewer.appointmentLetterUrl);

  return {
    ...interviewer,
    fullName: buildFullName(interviewer.firstName, interviewer.lastName),
    nicUrl: signedNicUrl || interviewer.nicUrl,
    appointmentLetterUrl: signedAppointmentLetterUrl || interviewer.appointmentLetterUrl,
  };
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
      linkedinProfile: interviewers.linkedinProfile,
      createdAt: interviewers.createdAt,
      updatedAt: interviewers.updatedAt,
    })
    .from(interviewers)
    .innerJoin(users, eq(interviewers.userId, users.id))
    .where(eq(interviewers.verificationStatus, "pending"));

  return Promise.all(
    result.map(async (interviewer) => {
      const signedNicUrl = await signUrlIfNeeded(interviewer.nicUrl);
      const signedAppointmentLetterUrl = await signUrlIfNeeded(interviewer.appointmentLetterUrl);
      return {
        ...interviewer,
        fullName: buildFullName(interviewer.firstName, interviewer.lastName),
        nicUrl: signedNicUrl || interviewer.nicUrl,
        appointmentLetterUrl: signedAppointmentLetterUrl || interviewer.appointmentLetterUrl,
      };
    })
  );
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
      disputed: sql<number>`count(*) filter (where ${interviewSessions.sessionStatus} = 'disputed')::int`,
      awaitingConfirmation: sql<number>`count(*) filter (where ${interviewSessions.sessionStatus} = 'awaiting_confirmation')::int`,
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
      meetingLink: interviewSessions.meetingLink,
      sessionType: interviewSessions.sessionType,
      duration: interviewSessions.duration,
      notes: interviewSessions.notes,
      recordingUrl: interviewSessions.recordingUrl,
      cancellationReason: interviewSessions.cancellationReason,
      disputeReason: interviewSessions.disputeReason,
      sampleVideo: {
        id: sampleVideos.id,
        videoUrl: sampleVideos.videoUrl,
        adminApprovalStatus: sampleVideos.adminApprovalStatus,
      },
      jobSeeker: {
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
      },
      interviewer: {
        firstName: intUsers.firstName,
        lastName: intUsers.lastName,
        email: intUsers.email,
      },
    })
    .from(interviewSessions)
    .innerJoin(jobSeekers, eq(interviewSessions.jobSeekerId, jobSeekers.id))
    .innerJoin(users, eq(jobSeekers.userId, users.id))
    .innerJoin(interviewers, eq(interviewSessions.interviewerId, interviewers.id))
    .innerJoin(intUsers, eq(interviewers.userId, intUsers.id))
    .leftJoin(sampleVideos, eq(interviewSessions.id, sampleVideos.sessionId))
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

  const signedRecentBookings = await Promise.all(
    recentBookings.map(async (booking) => {
      if (booking.sampleVideo?.videoUrl) {
        const signedUrl = await signUrlIfNeeded(booking.sampleVideo.videoUrl, "videos");
        return {
          ...booking,
          sampleVideo: {
            ...booking.sampleVideo,
            videoUrl: signedUrl || booking.sampleVideo.videoUrl,
          },
        };
      }
      return booking;
    })
  );

  return {
    users: userCounts,
    sessions: sessionCounts,
    financials,
    recentBookings: signedRecentBookings,
    topInterviewers,
  };
};
