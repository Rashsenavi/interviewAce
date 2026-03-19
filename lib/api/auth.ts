/**
 * Authentication API Service
 */

import { apiClient } from "./client";
import type { AuthResponse, CreateJobSeekerRequest, CreateInterviewerRequest } from "../types/user";

export const authService = {
  /**
   * Login user
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/auth/login", {
      email,
      password,
    });

    console.log("[Auth] Login response:", response);

    // Backend returns { success, data: { user, token }, message }
    if (response.success && response.data?.token) {
      apiClient.setToken(response.data.token);
      return {
        success: true,
        user: response.data.user,
        token: response.data.token,
      };
    }

    // Error case
    return {
      success: false,
      error: response.error || { code: "UNKNOWN", message: "Login failed" },
    };
  },

  /**
   * Register as job seeker
   */
  async registerJobSeeker(data: CreateJobSeekerRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/auth/register/job-seeker", data);
    
    console.log("[Auth] Register response:", response);

    // Backend returns { success, data: { user, token }, message }
    if (response.success && response.data?.token) {
      apiClient.setToken(response.data.token);
      return {
        success: true,
        user: response.data.user,
        token: response.data.token,
      };
    }

    // Error case
    return {
      success: false,
      error: response.error || { code: "UNKNOWN", message: "Registration failed" },
    };
  },

  /**
   * Register as interviewer
   */
  async registerInterviewer(data: CreateInterviewerRequest): Promise<AuthResponse> {
    const response = await apiClient.post<any>("/auth/register/interviewer", data);

    console.log("[Auth] Interviewer register full response:", JSON.stringify(response, null, 2));

    // Backend returns { success, data: { user, token }, message } on success
    // Backend returns { success: false, error: { code, message } } on error
    if (response.success && response.data?.token) {
      apiClient.setToken(response.data.token);
      return {
        success: true,
        user: response.data.user,
        token: response.data.token,
      };
    }

    // Error case - pass through the error from backend
    // Check both response.error (when success=false) and top-level structure
    let errorObj: { code: string; message: string };
    if (response.error && typeof response.error === 'object' && 'message' in response.error) {
      errorObj = response.error as { code: string; message: string };
    } else {
      errorObj = {
        code: "UNKNOWN",
        message: (typeof (response as any).message === 'string' ? (response as any).message : 'Registration failed')
      };
    }
    
    return {
      success: false,
      error: errorObj,
    };
  },

  /**
   * Verify email
   */
  async verifyEmail(token: string): Promise<{ success: boolean; message?: string }> {
    const response = await apiClient.post<{ message: string }>("/auth/verify-email", { token });
    
    if (response.success && response.data) {
      return { success: true, message: response.data.message };
    }
    
    return { success: false, message: response.error?.message };
  },

  /**
   * Request password reset
   */
  async forgotPassword(email: string): Promise<{ success: boolean; message?: string }> {
    const response = await apiClient.post<{ message: string }>("/auth/forgot-password", { email });
    
    if (response.success && response.data) {
      return { success: true, message: response.data.message };
    }
    
    return { success: false, message: response.error?.message };
  },

  /**
   * Reset password
   */
  async resetPassword(token: string, password: string): Promise<{ success: boolean; message?: string }> {
    const response = await apiClient.put<{ message: string }>("/auth/reset-password", { token, password });
    
    if (response.success && response.data) {
      return { success: true, message: response.data.message };
    }
    
    return { success: false, message: response.error?.message };
  },

  /**
   * Logout
   */
  logout(): void {
    apiClient.setToken(null);
  },
};

export default authService;