import { eq } from "drizzle-orm";
import { db } from "../config/database";
import { users, jobSeekers, interviewers } from "../db/schema";

/**
 * Get all job seekers
 */
export const getAllJobSeekers = async () => {
  const result = await db
    .select({
      id: jobSeekers.id,
      userId: jobSeekers.userId,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      phoneNumber: users.phoneNumber,
      university: jobSeekers.university,
      graduationYear: jobSeekers.graduationYear,
      fieldOfStudy: jobSeekers.fieldOfStudy,
      targetIndustries: jobSeekers.targetIndustries,
      careerGoals: jobSeekers.careerGoals,
      resumeUrl: jobSeekers.resumeUrl,
      isVerified: users.isVerified,
      createdAt: jobSeekers.createdAt,
    })
    .from(jobSeekers)
    .innerJoin(users, eq(jobSeekers.userId, users.id));

  return result.map((r) => ({
    ...r,
    targetIndustries: r.targetIndustries ? JSON.parse(r.targetIndustries) : [],
  }));
};

/**
 * Get job seeker by user ID
 */
export const getJobSeekerByUserId = async (userId: number) => {
  const [result] = await db
    .select({
      id: jobSeekers.id,
      userId: jobSeekers.userId,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      phoneNumber: users.phoneNumber,
      university: jobSeekers.university,
      graduationYear: jobSeekers.graduationYear,
      fieldOfStudy: jobSeekers.fieldOfStudy,
      targetIndustries: jobSeekers.targetIndustries,
      careerGoals: jobSeekers.careerGoals,
      preferredLanguage: jobSeekers.preferredLanguage,
      resumeUrl: jobSeekers.resumeUrl,
      isVerified: users.isVerified,
      createdAt: jobSeekers.createdAt,
    })
    .from(jobSeekers)
    .innerJoin(users, eq(jobSeekers.userId, users.id))
    .where(eq(jobSeekers.userId, userId))
    .limit(1);

  if (!result) return null;

  return {
    ...result,
    targetIndustries: result.targetIndustries ? JSON.parse(result.targetIndustries) : [],
  };
};

/**
 * Update job seeker profile
 */
export const updateJobSeeker = async (
  userId: number,
  data: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    university?: string;
    graduationYear?: number;
    fieldOfStudy?: string;
    targetIndustries?: string[];
    careerGoals?: string;
    resumeUrl?: string;
    preferredLanguage?: string;
  }
) => {
  // Update user table
  if (data.firstName || data.lastName || data.phoneNumber) {
    await db
      .update(users)
      .set({
        ...(data.firstName && { firstName: data.firstName }),
        ...(data.lastName && { lastName: data.lastName }),
        ...(data.phoneNumber && { phoneNumber: data.phoneNumber }),
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  // Update job seeker table
  const jobSeekerUpdate: Record<string, any> = { updatedAt: new Date() };
  if (data.university !== undefined) jobSeekerUpdate.university = data.university;
  if (data.graduationYear !== undefined) jobSeekerUpdate.graduationYear = data.graduationYear;
  if (data.fieldOfStudy !== undefined) jobSeekerUpdate.fieldOfStudy = data.fieldOfStudy;
  if (data.targetIndustries !== undefined)
    jobSeekerUpdate.targetIndustries = JSON.stringify(data.targetIndustries);
  if (data.careerGoals !== undefined) jobSeekerUpdate.careerGoals = data.careerGoals;
  if (data.resumeUrl !== undefined) jobSeekerUpdate.resumeUrl = data.resumeUrl;
  if (data.preferredLanguage !== undefined)
    jobSeekerUpdate.preferredLanguage = data.preferredLanguage;

  await db
    .update(jobSeekers)
    .set(jobSeekerUpdate)
    .where(eq(jobSeekers.userId, userId));

  return getJobSeekerByUserId(userId);
};

/**
 * Get all interviewers
 */
export const getAllInterviewers = async (filters?: { isVerified?: boolean }) => {
  let query = db
    .select({
      id: interviewers.id,
      userId: interviewers.userId,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      phoneNumber: users.phoneNumber,
      currentCompany: interviewers.currentCompany,
      jobTitle: interviewers.jobTitle,
      yearsExperience: interviewers.yearsExperience,
      industryExpertise: interviewers.industryExpertise,
      linkedinProfile: interviewers.linkedinProfile,
      hourlyRate: interviewers.hourlyRate,
      bio: interviewers.bio,
      isVerified: interviewers.isVerified,
      verificationStatus: interviewers.verificationStatus,
      ratingAverage: interviewers.ratingAverage,
      totalInterviews: interviewers.totalInterviews,
      createdAt: interviewers.createdAt,
    })
    .from(interviewers)
    .innerJoin(users, eq(interviewers.userId, users.id));

  const result = await query;

  return result.map((r) => ({
    ...r,
    industryExpertise: r.industryExpertise ? JSON.parse(r.industryExpertise) : [],
    hourlyRate: parseFloat(r.hourlyRate || "0"),
    ratingAverage: parseFloat(r.ratingAverage || "0"),
  }));
};

/**
 * Get interviewer by user ID
 */
export const getInterviewerByUserId = async (userId: number) => {
  const [result] = await db
    .select({
      id: interviewers.id,
      userId: interviewers.userId,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      phoneNumber: users.phoneNumber,
      currentCompany: interviewers.currentCompany,
      jobTitle: interviewers.jobTitle,
      yearsExperience: interviewers.yearsExperience,
      industryExpertise: interviewers.industryExpertise,
      linkedinProfile: interviewers.linkedinProfile,
      hourlyRate: interviewers.hourlyRate,
      bio: interviewers.bio,
      isVerified: interviewers.isVerified,
      verificationStatus: interviewers.verificationStatus,
      ratingAverage: interviewers.ratingAverage,
      totalInterviews: interviewers.totalInterviews,
      totalEarnings: interviewers.totalEarnings,
      commissionRate: interviewers.commissionRate,
      bankAccountNumber: interviewers.bankAccountNumber,
      createdAt: interviewers.createdAt,
    })
    .from(interviewers)
    .innerJoin(users, eq(interviewers.userId, users.id))
    .where(eq(interviewers.userId, userId))
    .limit(1);

  if (!result) return null;

  return {
    ...result,
    industryExpertise: result.industryExpertise ? JSON.parse(result.industryExpertise) : [],
    hourlyRate: parseFloat(result.hourlyRate || "0"),
    ratingAverage: parseFloat(result.ratingAverage || "0"),
    totalEarnings: parseFloat(result.totalEarnings || "0"),
    commissionRate: parseFloat(result.commissionRate || "20"),
  };
};

/**
 * Update interviewer profile
 */
export const updateInterviewer = async (
  userId: number,
  data: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    currentCompany?: string;
    jobTitle?: string;
    yearsExperience?: number;
    industryExpertise?: string[];
    linkedinProfile?: string;
    hourlyRate?: number;
    bio?: string;
    bankAccountNumber?: string;
  }
) => {
  // Update user table
  if (data.firstName || data.lastName || data.phoneNumber) {
    await db
      .update(users)
      .set({
        ...(data.firstName && { firstName: data.firstName }),
        ...(data.lastName && { lastName: data.lastName }),
        ...(data.phoneNumber && { phoneNumber: data.phoneNumber }),
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  // Update interviewer table
  const interviewerUpdate: Record<string, any> = { updatedAt: new Date() };
  if (data.currentCompany !== undefined) interviewerUpdate.currentCompany = data.currentCompany;
  if (data.jobTitle !== undefined) interviewerUpdate.jobTitle = data.jobTitle;
  if (data.yearsExperience !== undefined) interviewerUpdate.yearsExperience = data.yearsExperience;
  if (data.industryExpertise !== undefined)
    interviewerUpdate.industryExpertise = JSON.stringify(data.industryExpertise);
  if (data.linkedinProfile !== undefined) interviewerUpdate.linkedinProfile = data.linkedinProfile;
  if (data.hourlyRate !== undefined) interviewerUpdate.hourlyRate = data.hourlyRate.toString();
  if (data.bio !== undefined) interviewerUpdate.bio = data.bio;
  if (data.bankAccountNumber !== undefined)
    interviewerUpdate.bankAccountNumber = data.bankAccountNumber;

  await db
    .update(interviewers)
    .set(interviewerUpdate)
    .where(eq(interviewers.userId, userId));

  return getInterviewerByUserId(userId);
};

export default {
  getAllJobSeekers,
  getJobSeekerByUserId,
  updateJobSeeker,
  getAllInterviewers,
  getInterviewerByUserId,
  updateInterviewer,
};
