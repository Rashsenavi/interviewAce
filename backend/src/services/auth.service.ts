import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { db } from "../config/database";
import { users, jobSeekers, interviewers } from "../db/schema";
import { generateToken } from "../config/jwt";
import { sendPasswordResetEmail } from "./email.service";

// Types
export interface RegisterJobSeekerInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  university?: string;
  graduationYear?: number;
  fieldOfStudy?: string;
  targetIndustries?: string[];
  careerGoals?: string;
}

export interface RegisterInterviewerInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  currentCompany: string;
  jobTitle: string;
  yearsExperience: number;
  industryExpertise?: string[];
  linkedinProfile: string;
  hourlyRate: number;
  bio?: string;
  nicUrl?: string;
  appointmentLetterUrl?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResult {
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    userType: "job_seeker" | "interviewer" | "admin";
    isVerified: boolean;
  };
  token: string;
}

interface ActionTokenPayload {
  userId: number;
  email: string;
  purpose: "email_verification" | "password_reset";
}

const ACTION_TOKEN_SECRET =
  process.env.JWT_SECRET || "your_jwt_secret_key_here_min_32_characters";
const EMAIL_VERIFY_EXPIRES_IN = process.env.EMAIL_VERIFY_EXPIRES_IN || "24h";
const PASSWORD_RESET_EXPIRES_IN = process.env.PASSWORD_RESET_EXPIRES_IN || "30m";

const createActionToken = (
  payload: ActionTokenPayload,
  expiresIn: string
): string => {
  return jwt.sign(payload, ACTION_TOKEN_SECRET, {
    expiresIn: expiresIn as jwt.SignOptions["expiresIn"],
  });
};

const verifyActionToken = (token: string): ActionTokenPayload => {
  return jwt.verify(token, ACTION_TOKEN_SECRET) as ActionTokenPayload;
};

const getSafeError = (message: string, status: number, code: string) => {
  const error = new Error(message) as Error & { status?: number; code?: string };
  error.status = status;
  error.code = code;
  return error;
};
const FRONTEND_BASE_URL =
  process.env.FRONTEND_BASE_URL || process.env.FRONTEND_URL || "http://localhost:3000";

/**
 * Register a new job seeker
 */
export const registerJobSeeker = async (input: RegisterJobSeekerInput): Promise<AuthResult> => {
  // Check if email already exists
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, input.email.toLowerCase()))
    .limit(1);

  if (existingUser.length > 0) {
    const error = new Error("Email already registered") as Error & { status?: number; code?: string };
    error.status = 400;
    error.code = "EMAIL_EXISTS";
    throw error;
  }

  // Hash password
  const passwordHash = await bcrypt.hash(input.password, 12);

  // Create user
  const [newUser] = await db
    .insert(users)
    .values({
      email: input.email.toLowerCase(),
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      phoneNumber: input.phoneNumber,
      userType: "job_seeker",
    })
    .returning();

  // Create job seeker profile
  await db.insert(jobSeekers).values({
    userId: newUser.id,
    university: input.university,
    graduationYear: input.graduationYear,
    fieldOfStudy: input.fieldOfStudy,
    targetIndustries: input.targetIndustries ? JSON.stringify(input.targetIndustries) : null,
    careerGoals: input.careerGoals,
  });

  // Generate token
  const token = generateToken({
    id: newUser.id,
    email: newUser.email,
    userType: "job_seeker",
  });

  return {
    user: {
      id: newUser.id,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      userType: "job_seeker",
      isVerified: newUser.isVerified || false,
    },
    token,
  };
};

/**
 * Register a new interviewer
 */
export const registerInterviewer = async (input: RegisterInterviewerInput): Promise<AuthResult> => {
  // Check if email already exists
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, input.email.toLowerCase()))
    .limit(1);

  if (existingUser.length > 0) {
    const error = new Error("Email already registered") as Error & { status?: number; code?: string };
    error.status = 400;
    error.code = "EMAIL_EXISTS";
    throw error;
  }

  // Hash password
  const passwordHash = await bcrypt.hash(input.password, 12);

  // Create user
  const [newUser] = await db
    .insert(users)
    .values({
      email: input.email.toLowerCase(),
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      phoneNumber: input.phoneNumber,
      userType: "interviewer",
    })
    .returning();

  // Create interviewer profile
  await db.insert(interviewers).values({
    userId: newUser.id,
    currentCompany: input.currentCompany,
    jobTitle: input.jobTitle,
    yearsExperience: input.yearsExperience,
    industryExpertise: input.industryExpertise ? JSON.stringify(input.industryExpertise) : null,
    linkedinProfile: input.linkedinProfile,
    hourlyRate: input.hourlyRate.toString(),
    bio: input.bio,
    nicUrl: input.nicUrl,
    appointmentLetterUrl: input.appointmentLetterUrl,
  });

  // Generate token
  const token = generateToken({
    id: newUser.id,
    email: newUser.email,
    userType: "interviewer",
  });

  return {
    user: {
      id: newUser.id,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      userType: "interviewer",
      isVerified: newUser.isVerified || false,
    },
    token,
  };
};

/**
 * Login user
 */
export const login = async (input: LoginInput): Promise<AuthResult> => {
  // Find user by email
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, input.email.toLowerCase()))
    .limit(1);

  if (!user) {
    const error = new Error("Invalid email or password") as Error & { status?: number; code?: string };
    error.status = 401;
    error.code = "INVALID_CREDENTIALS";
    throw error;
  }

  // Check if user is active
  if (!user.isActive) {
    const error = new Error("Account is deactivated") as Error & { status?: number; code?: string };
    error.status = 403;
    error.code = "ACCOUNT_DEACTIVATED";
    throw error;
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);

  if (!isPasswordValid) {
    const error = new Error("Invalid email or password") as Error & { status?: number; code?: string };
    error.status = 401;
    error.code = "INVALID_CREDENTIALS";
    throw error;
  }

  // Generate token
  const token = generateToken({
    id: user.id,
    email: user.email,
    userType: user.userType,
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      userType: user.userType,
      isVerified: user.isVerified || false,
    },
    token,
  };
};

/**
 * Get user by ID
 */
export const getUserById = async (id: number) => {
  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      phoneNumber: users.phoneNumber,
      userType: users.userType,
      isVerified: users.isVerified,
      isActive: users.isActive,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  return user;
};

/**
 * Create email verification token for a user
 */
export const createEmailVerificationToken = async (email: string) => {
  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      isVerified: users.isVerified,
      isActive: users.isActive,
    })
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);

  if (!user) {
    throw getSafeError("User not found", 404, "USER_NOT_FOUND");
  }

  if (!user.isActive) {
    throw getSafeError("Account is deactivated", 403, "ACCOUNT_DEACTIVATED");
  }

  if (user.isVerified) {
    throw getSafeError("Email is already verified", 400, "ALREADY_VERIFIED");
  }

  return createActionToken(
    {
      userId: user.id,
      email: user.email,
      purpose: "email_verification",
    },
    EMAIL_VERIFY_EXPIRES_IN
  );
};

/**
 * Verify user email using token
 */
export const verifyEmail = async (token: string) => {
  let payload: ActionTokenPayload;

  try {
    payload = verifyActionToken(token);
  } catch (error) {
    throw getSafeError("Invalid or expired verification token", 400, "INVALID_TOKEN");
  }

  if (payload.purpose !== "email_verification") {
    throw getSafeError("Invalid verification token", 400, "INVALID_TOKEN_PURPOSE");
  }

  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      isVerified: users.isVerified,
      isActive: users.isActive,
    })
    .from(users)
    .where(eq(users.id, payload.userId))
    .limit(1);

  if (!user || user.email !== payload.email) {
    throw getSafeError("User not found for this token", 404, "USER_NOT_FOUND");
  }

  if (!user.isActive) {
    throw getSafeError("Account is deactivated", 403, "ACCOUNT_DEACTIVATED");
  }

  if (!user.isVerified) {
    await db
      .update(users)
      .set({
        isVerified: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));
  }

  return { userId: user.id, email: user.email };
};

export const forgotPassword = async (email: string) => {
  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      isActive: users.isActive,
    })
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);

  // Keep generic behavior to avoid account enumeration.
  if (!user || !user.isActive) {
    return { resetToken: null as string | null };
  }

  const resetToken = createActionToken(
    {
      userId: user.id,
      email: user.email,
      purpose: "password_reset",
    },
    PASSWORD_RESET_EXPIRES_IN
  );

  const resetUrl = `${FRONTEND_BASE_URL}/reset-password?token=${encodeURIComponent(resetToken)}`;

  await sendPasswordResetEmail({
    to: user.email,
    firstName: user.firstName,
    resetUrl,
  });

  // Temporary: keep return shape until controller/frontend cleanup step.
  return { resetToken: null as string | null };
};

/**
 * Reset password using reset token
 */
export const resetPassword = async (token: string, newPassword: string) => {
  let payload: ActionTokenPayload;

  try {
    payload = verifyActionToken(token);
  } catch (error) {
    throw getSafeError("Invalid or expired reset token", 400, "INVALID_TOKEN");
  }

  if (payload.purpose !== "password_reset") {
    throw getSafeError("Invalid reset token", 400, "INVALID_TOKEN_PURPOSE");
  }

  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      isActive: users.isActive,
    })
    .from(users)
    .where(eq(users.id, payload.userId))
    .limit(1);

  if (!user || user.email !== payload.email) {
    throw getSafeError("User not found for this token", 404, "USER_NOT_FOUND");
  }

  if (!user.isActive) {
    throw getSafeError("Account is deactivated", 403, "ACCOUNT_DEACTIVATED");
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);

  await db
    .update(users)
    .set({
      passwordHash,
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id));

  return { userId: user.id, email: user.email };
};

/**
 * Change password when logged in
 */
export const changePassword = async (
  userId: number,
  currentPassword: string,
  newPassword: string
) => {
  const [user] = await db
    .select({
      id: users.id,
      passwordHash: users.passwordHash,
      isActive: users.isActive,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    throw getSafeError("User not found", 404, "USER_NOT_FOUND");
  }

  if (!user.isActive) {
    throw getSafeError("Account is deactivated", 403, "ACCOUNT_DEACTIVATED");
  }

  const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isPasswordValid) {
    throw getSafeError("Incorrect current password", 400, "INCORRECT_PASSWORD");
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);

  await db
    .update(users)
    .set({
      passwordHash,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  return { success: true };
};

export default {
  registerJobSeeker,
  registerInterviewer,
  login,
  getUserById,
  createEmailVerificationToken,
  verifyEmail,
  forgotPassword,
  resetPassword,
  changePassword,
};