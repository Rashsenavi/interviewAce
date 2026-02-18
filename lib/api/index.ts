const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

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
      this.token = localStorage.getItem("auth_token");
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("auth_token", token);
      } else {
        localStorage.removeItem("auth_token");
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
  getAll: async () => {
    return apiClient.get<{ interviewers: any[] }>("/interviewers");
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
};

// Session API
export const sessionApi = {
  create: async (data: {
    interviewerUserId: number;
    industryId?: number;
    sessionType: "behavioral" | "technical" | "case_study" | "mixed";
    scheduledDate: string;
    duration: number;
    priceAmount: number;
    notes?: string;
    recordingConsent?: boolean;
  }) => {
    return apiClient.post<{ session: any }>("/sessions", data);
  },

  getAll: async () => {
    return apiClient.get<{ sessions: any[] }>("/sessions");
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
};

export default apiClient;
