"use client";

import { useState } from "react";
import Link from "next/link";
import { authService } from "@/lib/api/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    

    try {
      const response = await authService.forgotPassword(email);
      if (response.success) {
        setMessage(
          response.message ||
            "If your email exists, a password reset link has been sent."
        );
       
      } else {
        setError(response.message || "Unable to process request.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-100 via-blue-50 to-indigo-100 px-4 py-8 md:px-6 md:py-12">
      <div className="mx-auto w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.45)]">
        <h1 className="text-2xl font-bold text-slate-900">Forgot Password</h1>
        <p className="mt-2 text-sm text-slate-600">
          Enter your email to request a password reset.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {message && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
              {message}
            </div>
          )}

          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-700">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          Remembered your password?{" "}
          <Link href="/login" className="font-semibold text-indigo-600 hover:underline">
            Back to login
          </Link>
        </div>

        
            
      </div>
    </div>
  );
}
