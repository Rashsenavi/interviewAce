import { eq, and, ilike, or } from "drizzle-orm";
import { db } from "../config/database";
import { questionBank, industries, admins } from "../db/schema";

export interface QuestionFilters {
  type?: string;       // behavioral, technical, situational, general
  difficulty?: string; // easy, medium, hard
  role?: string;       // SE, PM, QA, DevOps, etc. — matched against question text/tags
  search?: string;
  limit?: number;
  offset?: number;
}

/**
 * Get questions from the question bank with IT filters
 */
export const getQuestions = async (filters?: QuestionFilters) => {
  const allQuestions = await db
    .select({
      id: questionBank.id,
      questionText: questionBank.questionText,
      questionType: questionBank.questionType,
      difficultyLevel: questionBank.difficultyLevel,
      sampleAnswer: questionBank.sampleAnswer,
      tips: questionBank.tips,
      usageCount: questionBank.usageCount,
      createdAt: questionBank.createdAt,
      industryId: questionBank.industryId,
      industryName: industries.industryName,
    })
    .from(questionBank)
    .innerJoin(industries, eq(questionBank.industryId, industries.id))
    .where(
      and(
        eq(questionBank.isActive, true),
        or(eq(questionBank.status, "approved"), eq(questionBank.isApproved, true))
      )
    );

  // Filter approved questions (or all if none are approved yet)
  let filtered = allQuestions.filter((q) => q !== null);

  if (filters?.type && filters.type !== "all") {
    filtered = filtered.filter(
      (q) => q.questionType.toLowerCase() === filters.type!.toLowerCase()
    );
  }

  if (filters?.difficulty && filters.difficulty !== "all") {
    filtered = filtered.filter(
      (q) => q.difficultyLevel.toLowerCase() === filters.difficulty!.toLowerCase()
    );
  }

  if (filters?.search) {
    const s = filters.search.toLowerCase();
    filtered = filtered.filter((q) =>
      q.questionText.toLowerCase().includes(s) ||
      (q.tips || "").toLowerCase().includes(s)
    );
  }

  // Role filter — match against question text keywords
  if (filters?.role && filters.role !== "all") {
    const roleKeywords: Record<string, string[]> = {
      SE: ["software engineer", "coding", "algorithm", "data structure", "system design", "backend", "frontend", "api"],
      PM: ["product manager", "product", "roadmap", "stakeholder", "prioritization", "user story", "agile"],
      QA: ["quality", "testing", "test case", "bug", "automation", "selenium", "qa", "defect"],
      DevOps: ["devops", "ci/cd", "docker", "kubernetes", "deployment", "infrastructure", "cloud", "aws"],
      BA: ["business analyst", "requirements", "process", "analysis", "documentation", "use case"],
      "Data Engineer": ["data", "pipeline", "etl", "sql", "database", "spark", "hadoop"],
      "Full Stack": ["full stack", "react", "node", "frontend", "backend", "web"],
      Mobile: ["mobile", "android", "ios", "react native", "flutter", "app"],
      "Tech Lead": ["leadership", "team", "mentor", "architecture", "technical lead", "project"],
    };

    const keywords = roleKeywords[filters.role] || [];
    if (keywords.length > 0) {
      filtered = filtered.filter((q) => {
        const text = q.questionText.toLowerCase();
        const tips = (q.tips || "").toLowerCase();
        return keywords.some((kw) => text.includes(kw) || tips.includes(kw));
      });
    }
  }

  // Stats by type
  const stats = {
    technical: allQuestions.filter((q) => q.questionType === "technical").length,
    behavioral: allQuestions.filter((q) => q.questionType === "behavioral").length,
    situational: allQuestions.filter((q) => q.questionType === "situational").length,
    general: allQuestions.filter((q) => q.questionType === "general").length,
    total: allQuestions.length,
  };

  const limit = filters?.limit || 50;
  const offset = filters?.offset || 0;
  const paginated = filtered.slice(offset, offset + limit);

  return {
    questions: paginated,
    total: filtered.length,
    stats,
  };
};

export const createQuestion = async (data: {
  industryId: number;
  questionText: string;
  questionType: string;
  difficultyLevel: string;
  sampleAnswer?: string;
  tips?: string;
  contributedByUserId: number;
}) => {
  // Check duplicate: case-insensitive check in same industry
  const existing = await db
    .select()
    .from(questionBank)
    .where(
      and(
        eq(questionBank.industryId, data.industryId),
        ilike(questionBank.questionText, data.questionText)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    throw new Error("A similar question already exists in this industry.");
  }

  const [newQuestion] = await db
    .insert(questionBank)
    .values({
      industryId: data.industryId,
      questionText: data.questionText,
      questionType: data.questionType,
      difficultyLevel: data.difficultyLevel,
      sampleAnswer: data.sampleAnswer || null,
      tips: data.tips || null,
      contributedByUserId: data.contributedByUserId,
      status: "pending",
      isApproved: false,
      isActive: true,
    })
    .returning();

  return newQuestion;
};

export const getIndustries = async () => {
  return await db.select().from(industries);
};

export const getMyQuestions = async (userId: number) => {
  return await db
    .select({
      id: questionBank.id,
      questionText: questionBank.questionText,
      questionType: questionBank.questionType,
      difficultyLevel: questionBank.difficultyLevel,
      sampleAnswer: questionBank.sampleAnswer,
      tips: questionBank.tips,
      usageCount: questionBank.usageCount,
      status: questionBank.status,
      createdAt: questionBank.createdAt,
      industryId: questionBank.industryId,
      industryName: industries.industryName,
    })
    .from(questionBank)
    .innerJoin(industries, eq(questionBank.industryId, industries.id))
    .where(eq(questionBank.contributedByUserId, userId));
};

export const getPendingQuestions = async () => {
  return await db
    .select({
      id: questionBank.id,
      questionText: questionBank.questionText,
      questionType: questionBank.questionType,
      difficultyLevel: questionBank.difficultyLevel,
      sampleAnswer: questionBank.sampleAnswer,
      tips: questionBank.tips,
      status: questionBank.status,
      createdAt: questionBank.createdAt,
      industryId: questionBank.industryId,
      industryName: industries.industryName,
      contributedByUserId: questionBank.contributedByUserId,
    })
    .from(questionBank)
    .innerJoin(industries, eq(questionBank.industryId, industries.id))
    .where(eq(questionBank.status, "pending"));
};

export const reviewQuestion = async (id: number, status: "approved" | "rejected", userId: number) => {
  // Find admin record corresponding to the user ID
  let [adminRecord] = await db
    .select({ id: admins.id })
    .from(admins)
    .where(eq(admins.userId, userId))
    .limit(1);

  if (!adminRecord) {
    // Auto-create admin record for this admin user to prevent constraint/lookup failure
    const [newAdmin] = await db
      .insert(admins)
      .values({
        userId,
        adminLevel: "super_admin",
      })
      .returning({ id: admins.id });
    adminRecord = newAdmin;
  }

  const [updated] = await db
    .update(questionBank)
    .set({
      status,
      isApproved: status === "approved",
      approvedByAdminId: adminRecord.id,
    })
    .where(eq(questionBank.id, id))
    .returning();
  return updated;
};

export default {
  getQuestions,
  createQuestion,
  getIndustries,
  getMyQuestions,
  getPendingQuestions,
  reviewQuestion,
};
