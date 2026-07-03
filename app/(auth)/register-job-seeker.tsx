"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authService } from "@/lib/api/auth";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";

const INDUSTRIES = [
  "Software Engineering",
  "QA & Testing",
  "UI/UX Design",
  "DevOps & Cloud Infrastructure",
  "Product & Project Management",
  "Data Science & Analytics",
  "Cybersecurity",
  "Business Analysis & IT Consulting",
];

export default function JobSeekerRegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    university: "",
    graduationYear: "",
    fieldOfStudy: "",
    targetIndustries: [] as string[],
    careerGoals: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleIndustryToggle = (industry: string) => {
    setFormData((prev) => {
      const industries = prev.targetIndustries.includes(industry)
        ? prev.targetIndustries.filter((i) => i !== industry)
        : [...prev.targetIndustries, industry];
      return { ...prev, targetIndustries: industries };
    });
  };

  const validateStep = (): boolean => {
    setError("");

    if (currentStep === 1) {
      if (!formData.firstName || !formData.lastName) {
        setError("First and last name are required");
        return false;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!formData.email) {
        setError("Email is required");
        return false;
      } else if (!emailRegex.test(formData.email)) {
        setError("Please enter a valid email address");
        return false;
      }
      if (!formData.password || !formData.confirmPassword) {
        setError("Password is required");
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        return false;
      }
      if (formData.password.length < 8) {
        setError("Password must be at least 8 characters");
        return false;
      }
    }

    if (currentStep === 2) {
      if (!formData.university || !formData.graduationYear || !formData.fieldOfStudy) {
        setError("All education fields are required");
        return false;
      }
    }

    if (currentStep === 3) {
      if (formData.targetIndustries.length === 0) {
        setError("Please select at least one target IT job role");
        return false;
      }
      if (!formData.careerGoals) {
        setError("Career goals are required");
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleRegister = async () => {
    if (!validateStep()) return;

    setLoading(true);

    try {
      const response = await authService.registerJobSeeker({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        university: formData.university,
        graduationYear: formData.graduationYear
          ? parseInt(formData.graduationYear)
          : undefined,
        fieldOfStudy: formData.fieldOfStudy,
        targetIndustries: formData.targetIndustries,
        careerGoals: formData.careerGoals,
      });

      if (response.success && response.user && response.token) {
        // Store user data in context
        login(response.token, response.user);
        router.push("/job-seeker");
      } else {
        const errorMsg = response.error?.message || "Registration failed. Please try again.";
        setError(errorMsg);
        console.error("Registration error:", response.error);
      }
    } catch (err: any) {
      console.error("Registration exception:", err);
      setError(err?.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-100 via-blue-50 to-cyan-50 px-4 py-8 md:px-6 md:py-10">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft size={16} className="mr-1" />
            Back to Home
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.45fr]">
          <aside className="hidden rounded-3xl border border-slate-200 bg-slate-900 p-8 text-white shadow-[0_20px_55px_-38px_rgba(15,23,42,0.55)] lg:block">
            <h2 className="text-3xl font-bold leading-tight">Build confidence before your first round.</h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-300">
              Create your profile once and book interview sessions with verified professionals who
              match your target industry.
            </p>

            <div className="mt-8 space-y-3 text-sm text-slate-300">
              <p>Targeted mock interviews</p>
              <p>Feedback that is easy to act on</p>
              <p>Progress tracking over time</p>
            </div>
          </aside>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_55px_-42px_rgba(15,23,42,0.4)] sm:p-8 lg:p-10">
          {/* Header */}
          <div className="mb-10 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-teal-600 text-white rounded-lg mb-6 text-xl font-bold">
              👤
            </div>
            <h1 className="mb-2 text-3xl font-bold text-slate-900">Create Your Account</h1>
            <p className="text-base text-slate-600">Join 500+ students preparing for their dream jobs</p>
          </div>

          {/* Step Indicator */}
          <div className="mb-10 flex items-center justify-center gap-3 sm:gap-6">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center font-semibold text-sm transition-colors sm:h-12 sm:w-12 sm:text-base ${
                    step === currentStep
                      ? "bg-teal-600 text-white"
                      : step < currentStep
                      ? "bg-teal-600 text-white"
                      : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {step < currentStep ? "✓" : step}
                </div>
                {step < 3 && (
                  <div
                    className={`h-1 w-10 mx-2 transition-colors sm:w-16 sm:mx-3 ${
                      step < currentStep ? "bg-teal-600" : "bg-gray-200"
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>

          {/* Step Labels */}
          <div className="mb-10 flex justify-between text-xs font-semibold sm:text-sm">
            <div className={`text-center ${currentStep === 1 ? "text-teal-600" : "text-gray-500"}`}>
              Account
            </div>
            <div className={`text-center ${currentStep === 2 ? "text-teal-600" : "text-gray-500"}`}>
              Education
            </div>
            <div className={`text-center ${currentStep === 3 ? "text-teal-600" : "text-gray-500"}`}>
              Goals
            </div>
          </div>

          {/* Error Message */}
          {error && !error.includes("pattern") && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            {/* Step 1: Account */}
            {currentStep === 1 && (
              <div className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="Kasun"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Perera"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="text"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="kasun@example.com"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Create a strong password"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-700"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Re-enter your password"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-700"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Education */}
            {currentStep === 2 && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Phone Number *
                  </label>
                  <div className="flex gap-3">
                    <select className="w-24 rounded-xl border border-slate-300 bg-white px-3 py-3 text-base font-medium text-slate-700 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100">
                      <option>+94</option>
                    </select>
                    <input
                      type="text"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="77 123 4567"
                      className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-base outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    University *
                  </label>
                  <input
                    type="text"
                    name="university"
                    value={formData.university}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Graduation Year *
                    </label>
                    <input
                      type="text"
                      name="graduationYear"
                      value={formData.graduationYear}
                      onChange={handleInputChange}
                      placeholder="2024"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Field of Study *
                    </label>
                    <input
                      type="text"
                      name="fieldOfStudy"
                      value={formData.fieldOfStudy}
                      onChange={handleInputChange}
                      placeholder="e.g., Computer Science, Engineering"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Goals */}
            {currentStep === 3 && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-4">
                    Target IT Job Roles * (Select all that apply)
                  </label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {INDUSTRIES.map((industry) => (
                      <button
                        key={industry}
                        type="button"
                        onClick={() => handleIndustryToggle(industry)}
                        className={`px-4 py-3 rounded-lg border-2 transition text-sm font-medium ${
                          formData.targetIndustries.includes(industry)
                            ? "border-teal-600 bg-teal-50 text-teal-700"
                            : "border-slate-300 text-slate-700 hover:border-slate-400"
                        }`}
                      >
                        {industry}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Career Goals *
                  </label>
                  <textarea
                    name="careerGoals"
                    value={formData.careerGoals}
                    onChange={handleInputChange}
                    placeholder="Tell us about your career aspirations, target companies, and what you hope to achieve with InterviewAce"
                    rows={5}
                    className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-base outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    {formData.careerGoals.length}/500 characters
                  </p>
                </div>

                <div className="flex items-start pt-2">
                  <input
                    type="checkbox"
                    id="terms"
                    className="mt-1 h-4 w-4 rounded accent-teal-600"
                  />
                  <label htmlFor="terms" className="text-xs text-gray-600 ml-3 leading-relaxed">
                    I agree to InterviewAce's{" "}
                    <a href="#" className="text-teal-600 hover:underline font-medium">
                      Terms & Conditions
                    </a>{" "}
                    and{" "}
                    <a href="#" className="text-teal-600 hover:underline font-medium">
                      Privacy Policy
                    </a>
                  </label>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex flex-col gap-3 pt-8 sm:flex-row sm:gap-4">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 rounded-xl border-2 border-slate-300 px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Back
                </button>
              )}

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700"
                >
                  Continue
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleRegister}
                  disabled={loading}
                  className="flex-1 rounded-xl bg-orange-400 px-4 py-3 font-semibold text-white transition hover:bg-orange-500 disabled:opacity-50"
                >
                  {loading ? "Creating account..." : "Create Account"}
                </button>
              )}
            </div>
          </div>

          {/* Sign In Link */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 hover:underline font-semibold">
                Sign in
              </Link>
            </p>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
