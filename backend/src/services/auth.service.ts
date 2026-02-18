import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "../config/database";
import { users, jobSeekers, interviewers } from "../db/schema";
import { generateToken } from "../config/jwt";

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

export default {
  registerJobSeeker,
  registerInterviewer,
  login,
  getUserById,
};
