"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authService } from "@/lib/api/auth";
import { useAuth } from "@/lib/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authService.login(email, password);

      if (response.success && response.user && response.token) {
        // Store user data in context
        login(response.token, response.user);
        // Set token as cookie for backend authentication
        document.cookie = `token=${response.token}; path=/;`;
        // Redirect based on user type
        const userType = response.user?.userType;
        if (userType === "job_seeker") {
          router.push("/job-seeker");
        } else if (userType === "interviewer") {
          router.push("/interviewer");
        } else if (userType === "admin") {
          router.push("/admin");
        }
      } else {
        setError(response.error?.message || "Login failed");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-100 via-blue-50 to-indigo-100 px-4 py-8 md:px-6 md:py-12">
      <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_60px_-42px_rgba(15,23,42,0.45)] lg:grid-cols-2">
        <section className="hidden bg-slate-900 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-200">
              InterviewAce
            </div>
            <h2 className="text-3xl font-bold leading-tight">Practice now. Perform better in real interviews.</h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-300">
              Continue where you left off, manage your sessions, and track your interview readiness in one place.
            </p>
          </div>

          <div className="space-y-3 text-sm text-slate-300">
            <p>Verified interviewers from top companies</p>
            <p>Structured feedback after every mock</p>
            <p>Role-based dashboards for each user type</p>
          </div>
        </section>

        <section className="p-6 sm:p-8 md:p-10">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">Welcome back</h1>
            <p className="mt-2 text-sm text-slate-600">Sign in to your InterviewAce account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3">
                <p className="text-sm text-red-700">{error}</p>
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
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-semibold text-slate-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="font-semibold text-indigo-600 hover:underline">
                Sign up
              </Link>
            </p>
          </div>

          <div className="mt-3 text-center">
            <Link href="/forgot-password" className="text-sm text-indigo-600 hover:underline">
              Forgot password?
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
