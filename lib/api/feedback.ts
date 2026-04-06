import { apiClient } from "./client";

type KeywordCount = {
  keyword: string;
  count: number;
};

type RatingDistribution = Record<number, number>;

export type ReceivedFeedbackItem = {
  id: number;
  sessionId: number;
  feedbackType: "interviewer_to_seeker" | "seeker_to_interviewer";
  ratingOverall: number | null;
  ratingCommunication: number | null;
  ratingTechnical: number | null;
  ratingProfessionalism: number | null;
  ratingHelpfulness: number | null;
  writtenFeedback: string | null;
  improvementSuggestions: string | null;
  strengthsIdentified: string | null;
  wouldRecommend: boolean | null;
  isAnonymous: boolean;
  createdAt: string;
  givenByUserId: number;
  givenByFirstName: string;
  givenByLastName: string;
  givenByName: string;
  sessionType: string;
  scheduledDate: string;
};

export type FeedbackSummary = {
  totalFeedback: number;
  averageRatings: {
    overall: number | null;
    communication: number | null;
    technical: number | null;
    professionalism: number | null;
    helpfulness: number | null;
  };
  recommendationRate: number | null;
  ratingDistribution: RatingDistribution;
  topStrengths: KeywordCount[];
  topImprovements: KeywordCount[];
};

type MyFeedbackResponse = {
  feedback: ReceivedFeedbackItem[];
  summary: FeedbackSummary;
};

export type PendingFeedbackSession = {
  sessionId: number;
  sessionType: string;
  scheduledDate: string;
  counterpartUserId: number;
  counterpartFirstName: string;
  counterpartLastName: string;
  counterpartTitle: string | null;
};

type PendingFeedbackResponse = {
  sessions: PendingFeedbackSession[];
};

type SubmitFeedbackPayload = {
  sessionId: number;
  ratingOverall: number;
  ratingCommunication?: number;
  ratingTechnical?: number;
  ratingProfessionalism?: number;
  ratingHelpfulness?: number;
  writtenFeedback?: string;
  improvementSuggestions?: string;
  strengthsIdentified?: string;
  wouldRecommend?: boolean;
  isAnonymous?: boolean;
};

export const feedbackService = {
  async getPendingFeedback(): Promise<{
    success: boolean;
    data?: PendingFeedbackResponse;
    message?: string;
  }> {
    const response = await apiClient.get<PendingFeedbackResponse>("/feedback/pending");

    if (response.success && response.data) {
      return { success: true, data: response.data };
    }

    return {
      success: false,
      message: response.error?.message || "Failed to load pending feedback",
    };
  },

  async getMyFeedback(): Promise<{ success: boolean; data?: MyFeedbackResponse; message?: string }> {
    const response = await apiClient.get<MyFeedbackResponse>("/feedback/my-feedback");

    if (response.success && response.data) {
      return { success: true, data: response.data };
    }

    return {
      success: false,
      message: response.error?.message || "Failed to load feedback",
    };
  },

  async submitFeedback(payload: SubmitFeedbackPayload): Promise<{ success: boolean; message?: string }> {
    const response = await apiClient.post<{ feedback: unknown }>("/feedback", payload);

    if (response.success) {
      return { success: true };
    }

    return {
      success: false,
      message: response.error?.message || "Failed to submit feedback",
    };
  },
};

export default feedbackService;
