const API_BASE_URL = typeof window !== 'undefined' ? '/api' : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api");

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    // Load token from localStorage if available
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("authToken");
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("authToken", token);
      } else {
        localStorage.removeItem("authToken");
      }
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };

    if (this.token) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || {
            code: "REQUEST_FAILED",
            message: data.message || "Request failed",
          },
        };
      }

      return data;
    } catch (error) {
      return {
        success: false,
        error: {
          code: "NETWORK_ERROR",
          message: error instanceof Error ? error.message : "Network error",
        },
      };
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }

  async patch<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

// Auth API
export const authApi = {
  registerJobSeeker: async (data: {
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
  }) => {
    const response = await apiClient.post<{
      user: any;
      token: string;
    }>("/auth/register/job-seeker", data);
    
    if (response.success && response.data?.token) {
      apiClient.setToken(response.data.token);
    }
    
    return response;
  },

  registerInterviewer: async (data: {
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
  }) => {
    const response = await apiClient.post<{
      user: any;
      token: string;
    }>("/auth/register/interviewer", data);
    
    if (response.success && response.data?.token) {
      apiClient.setToken(response.data.token);
    }
    
    return response;
  },

  login: async (email: string, password: string) => {
    const response = await apiClient.post<{
      user: any;
      token: string;
    }>("/auth/login", { email, password });
    
    if (response.success && response.data?.token) {
      apiClient.setToken(response.data.token);
    }
    
    return response;
  },

  logout: () => {
    apiClient.setToken(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
    }
  },

  getCurrentUser: async () => {
    return apiClient.get<{ user: any }>("/auth/me");
  },
};

// Job Seeker API
export const jobSeekerApi = {
  getProfile: async () => {
    return apiClient.get<{ profile: any }>("/jobseekers/profile");
  },

  updateProfile: async (data: any) => {
    return apiClient.put<{ profile: any }>("/jobseekers/profile", data);
  },
};

// Interviewer API
export const interviewerApi = {
  getAll: async (params?: {
    search?: string;
    industry?: string;
    company?: string;
    minRating?: number;
    minPrice?: number;
    maxPrice?: number;
    minExperience?: number;
    isVerified?: boolean;
    sortBy?: "rating" | "price" | "experience" | "reviews";
    sortOrder?: "asc" | "desc";
  }) => {
    const query = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          query.set(key, String(value));
        }
      });
    }

    const queryString = query.toString();
    const endpoint = queryString ? `/interviewers?${queryString}` : "/interviewers";
    return apiClient.get<{ interviewers: any[] }>(endpoint);
  },

  getById: async (id: number) => {
    return apiClient.get<{ interviewer: any }>(`/interviewers/${id}`);
  },

  getProfile: async () => {
    return apiClient.get<{ profile: any }>("/interviewers/profile");
  },

  updateProfile: async (data: any) => {
    return apiClient.put<{ profile: any }>("/interviewers/profile", data);
  },
  
  getAvailability: async (id: number) => {
    return apiClient.get<{ slots: any[] }>(`/interviewers/${id}/availability`);
  },
  
  updateAvailability: async (slots: any[]) => {
    return apiClient.put<{ slots: any[] }>("/interviewers/availability", { slots });
  },
};

// Session API
export const sessionApi = {
  create: async (data: {
    interviewerUserId: number;
    industryId?: number;
    sessionType: "behavioral" | "technical" | "case_study" | "mixed";
    scheduledDate: string;
    duration: number;
    notes?: string;
    recordingConsent?: boolean;
  }) => {
    return apiClient.post<{ session: any }>("/sessions", data);
  },

  getAll: async (params?: { status?: string; upcoming?: boolean }) => {
    const query = new URLSearchParams();
    if (params?.status) query.set("status", params.status);
    if (params?.upcoming) query.set("upcoming", "true");
    const qs = query.toString();
    return apiClient.get<{ sessions: any[] }>(qs ? `/sessions?${qs}` : "/sessions");
  },

  getById: async (id: number) => {
    return apiClient.get<{ session: any }>(`/sessions/${id}`);
  },

  getStats: async () => {
    return apiClient.get<{ stats: any }>("/sessions/stats");
  },

  updateStatus: async (id: number, status: string, reason?: string) => {
    return apiClient.put<{ session: any }>(`/sessions/${id}/status`, { status, reason });
  },

  updateMeetingLink: async (id: number, meetingLink: string) => {
    return apiClient.put<{ session: any }>(`/sessions/${id}/meeting-link`, { meetingLink });
  },

  reschedule: async (id: number, newScheduledDate: string) => {
    return apiClient.post<{ session: any }>(`/sessions/${id}/reschedule`, { newScheduledDate });
  },

  confirm: async (id: number, occurred: boolean, issueReason?: string) => {
    return apiClient.put<{ message: string }>(`/sessions/${id}/confirm`, { occurred, issueReason });
  },
};

// Feedback API
export const feedbackApi = {
  fetchMyFeedback: async () => {
    return apiClient.get<{ feedback: any[] }>("/feedback/my");
  },

  fetchMyFeedbackStats: async () => {
    return apiClient.get<{ stats: any }>("/feedback/my/stats");
  },

  fetchSessionFeedback: async (sessionId: number | string) => {
    return apiClient.get<{ feedback: any }>(`/feedback/session/${sessionId}`);
  },

  submitFeedback: async (data: {
    sessionId: number;
    jobSeekerId: number;
    overallRating: number;
    communicationRating: number;
    technicalRating: number;
    problemSolvingRating: number;
    confidenceRating: number;
    strengths: string;
    weaknesses: string;
    improvementTips: string;
    generalComments?: string;
  }) => {
    return apiClient.post<{ success: boolean; data: { feedback: any } }>("/feedback", data);
  },
};

// Review API (Job Seeker -> Interviewer)
export const reviewApi = {
  submitReview: async (data: {
    sessionId: number;
    interviewerUserId: number;
    rating: number;
    reviewText: string;
    isKnowledgeable?: boolean;
    isHelpful?: boolean;
    isActionable?: boolean;
    isProfessional?: boolean;
  }) => {
    return apiClient.post<{ review: any }>("/reviews", data);
  },
  
  fetchMyInterviewerReviews: async () => {
    return apiClient.get<{ stats: any }>("/reviews/my");
  },
};

// Payment API
export const paymentApi = {
  /** Get job seeker payment history */
  getAll: async (params?: { status?: string }) => {
    const query = new URLSearchParams();
    if (params?.status) query.set("status", params.status);
    const qs = query.toString();
    return apiClient.get<{ payments: any[] }>(qs ? `/payments?${qs}` : "/payments");
  },

  /** Initiate PayHere payment for a session → returns form params + hash */
  initiate: async (sessionId: number) => {
    return apiClient.post<{ checkoutUrl: string; formParams: Record<string, string> }>(
      "/payments/initiate",
      { sessionId }
    );
  },

  /** Get payment status by PayHere order ID (for booking-confirmation page) */
  getByOrderId: async (orderId: string) => {
    return apiClient.get<{ payment: any }>(`/payments/status/${orderId}`);
  },

  /** Interviewer: get their earnings (optionally filtered by month "2026-05") */
  getEarnings: async (month?: string) => {
    const qs = month ? `?month=${month}` : "";
    return apiClient.get<any>(`/payments/earnings${qs}`);
  },

  /** Admin: get all interviewers' payout summary for a month */
  getAdminPayouts: async (month: string) => {
    return apiClient.get<{ payouts: any[]; month: string }>(`/payments/admin/payouts?month=${month}`);
  },

  /** Admin: release payouts for selected interviewers in a month */
  releasePayouts: async (interviewerIds: number[], month: string) => {
    return apiClient.post<{ released: number[]; skipped: number }>(
      "/payments/admin/payouts/release",
      { interviewerIds, month }
    );
  },

  /** Cancel payment for a session (applies tiered refund policy) */
  cancel: async (sessionId: number) => {
    return apiClient.post<{ refundAmount: number; reason: string; newStatus: string }>(
      `/payments/cancel/${sessionId}`,
      {}
    );
  },
};

// Question API
export const questionApi = {
  getAll: async (params?: {
    type?: string;
    difficulty?: string;
    role?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "" && value !== "all") {
          query.set(key, String(value));
        }
      });
    }
    const qs = query.toString();
    return apiClient.get<{ questions: any[]; total: number; stats: any }>(
      qs ? `/questions?${qs}` : "/questions"
    );
  },
};

// Admin API
export const adminApi = {
  getPendingVerifications: async () => {
    return apiClient.get<{ data: any[] }>("/admin/verification/pending");
  },
  getVerificationDetails: async (id: number | string) => {
    return apiClient.get<{ data: any }>(`/admin/verification/${id}`);
  },
  approveVerification: async (id: number | string) => {
    return apiClient.put<{ data: any }>(`/admin/verification/${id}/approve`);
  },
  rejectVerification: async (id: number | string, notes: string) => {
    return apiClient.put<{ data: any }>(`/admin/verification/${id}/reject`, { notes });
  },
  getAllUsers: async () => {
    return apiClient.get<{ data: any[] }>("/admin/users");
  },
  updateUserStatus: async (id: number | string, isActive: boolean) => {
    return apiClient.put<{ data: any }>(`/admin/users/${id}/status`, { isActive });
  },
  deleteUser: async (id: number | string) => {
    return apiClient.delete<{ success: boolean }>(`/admin/users/${id}`);
  },
  // Support Tickets
  getTickets: async () => {
    return apiClient.get<any[]>("/admin/tickets");
  },
  getTicketDetails: async (id: number | string) => {
    return apiClient.get<any>(`/admin/tickets/${id}`);
  },
  replyToTicket: async (id: number | string, message: string) => {
    return apiClient.post<any>(`/admin/tickets/${id}/messages`, { message });
  },
  updateTicketStatus: async (id: number | string, status: string) => {
    return apiClient.patch<{ data: any }>(`/admin/tickets/${id}/status`, { status });
  },
};

// User Support API
export const supportApi = {
  getMyTickets: async () => {
    return apiClient.get<any[]>("/support");
  },
  createTicket: async (data: { subject: string; description: string; priority?: string }) => {
    return apiClient.post<any>("/support", data);
  },
  getTicketDetails: async (id: number | string) => {
    return apiClient.get<any>(`/support/${id}`);
  },
  replyToTicket: async (id: number | string, message: string) => {
    return apiClient.post<any>(`/support/${id}/messages`, { message });
  },
};

// Video API
export const videoApi = {
  getApprovedVideos: async (params?: { industryId?: number }) => {
    const qs = params?.industryId ? `?industryId=${params.industryId}` : "";
    return apiClient.get<{ videos: any[] }>(`/videos/approved${qs}`);
  },
  
  incrementViewCount: async (id: number) => {
    return apiClient.post<{ success: boolean }>(`/videos/${id}/view`);
  },

  uploadVideo: async (data: {
    sessionId?: number;
    industryId?: number;
    videoTitle: string;
    videoDescription?: string;
    videoUrl: string;
    thumbnailUrl?: string;
    videoType: string;
    durationSeconds?: number;
  }) => {
    return apiClient.post<{ video: any }>("/videos/upload", data);
  },

  getPendingVideos: async () => {
    return apiClient.get<{ videos: any[] }>("/videos/pending");
  },

  approveVideo: async (id: number) => {
    return apiClient.post<{ video: any }>(`/videos/${id}/approve`);
  },

  rejectVideo: async (id: number) => {
    return apiClient.post<{ video: any }>(`/videos/${id}/reject`);
  },
};

export default apiClient;
