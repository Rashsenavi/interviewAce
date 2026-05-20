import { eq, and, ilike, or } from "drizzle-orm";
import { db } from "../config/database";
import { questionBank, industries } from "../db/schema";

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
    .where(eq(questionBank.isActive, true));

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

export default { getQuestions };
