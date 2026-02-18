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

    if (response.success && response.data?.token) {
      apiClient.setToken(response.data.token);
    }

    if (response.success && response.data) {
      return response.data;
    }

    return {
      success: false,
      error: response.error,
    };
  },

  /**
   * Register as job seeker
   */
  async registerJobSeeker(data: CreateJobSeekerRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/auth/register/job-seeker", data);

    if (response.success && response.data?.token) {
      apiClient.setToken(response.data.token);
    }

    if (response.success && response.data) {
      return response.data;
    }

    return {
      success: false,
      error: response.error,
    };
  },

  /**
   * Register as interviewer
   */
  async registerInterviewer(data: CreateInterviewerRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/auth/register/interviewer", data);

    if (response.success && response.data?.token) {
      apiClient.setToken(response.data.token);
    }

    if (response.success && response.data) {
      return response.data;
    }

    return {
      success: false,
      error: response.error,
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