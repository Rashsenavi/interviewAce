"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authService } from "@/lib/api/auth";
import { uploadDocument } from "@/lib/api/upload";
import { Eye, EyeOff, ArrowLeft, Check } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";

export default function InterviewerRegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    currentCompany: "",
    jobTitle: "",
    yearsOfExperience: "",
    expertise: [] as string[],
    linkedinProfile: "",
    hourlyRate: "",
    bio: "",
    nicFile: null as File | null,
    appointmentLetterFile: null as File | null,
    nicUrl: "",
    appointmentLetterUrl: "",
  });

  // Handle file input changes
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    }
  };

  const expertiseOptions = [
    "Software Engineering",
    "Data Science",
    "Product Management",
    "UI/UX Design",
    "DevOps",
    "Machine Learning",
    "Cloud Computing",
    "Cybersecurity",
    "Mobile Development",
    "Web Development",
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleExpertiseToggle = (expertise: string) => {
    setFormData((prev) => ({
      ...prev,
      expertise: prev.expertise.includes(expertise)
        ? prev.expertise.filter((e) => e !== expertise)
        : [...prev.expertise, expertise],
    }));
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
      if (!formData.currentCompany || !formData.jobTitle || !formData.yearsOfExperience) {
        setError("Company, job title, and years of experience are required");
        return false;
      }
      if (!formData.linkedinProfile) {
        setError("LinkedIn profile is required for verification");
        return false;
      }
      if (!formData.nicFile) {
        setError("NIC document is required");
        return false;
      }
      if (!formData.appointmentLetterFile) {
        setError("Appointment letter is required");
        return false;
      }
    }

    if (currentStep === 3) {
      if (formData.expertise.length === 0) {
        setError("Please select at least one area of expertise");
        return false;
      }
      if (!formData.hourlyRate || parseFloat(formData.hourlyRate) <= 0) {
        setError("Please set your hourly rate");
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep()) return;

    setLoading(true);

    try {
      // Upload documents to Supabase Storage
      let nicUrl = "";
      let appointmentLetterUrl = "";
      if (formData.nicFile) {
        nicUrl = await uploadDocument(formData.nicFile, "nic");
      }
      if (formData.appointmentLetterFile) {
        appointmentLetterUrl = await uploadDocument(formData.appointmentLetterFile, "appointment-letter");
      }

      const response = await authService.registerInterviewer({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        currentCompany: formData.currentCompany,
        jobTitle: formData.jobTitle,
        yearsExperience: formData.yearsOfExperience
          ? parseInt(formData.yearsOfExperience)
          : 0,
        linkedinProfile: formData.linkedinProfile,
        industryExpertise: formData.expertise,
        hourlyRate: parseFloat(formData.hourlyRate) || 0,
        bio: formData.bio,
        nicUrl,
        appointmentLetterUrl,
      });

      console.log("Registration response:", response);

      if (response.success && response.user && response.token) {
        // Store user data in context (for when they're verified later)
        login(response.token, response.user);
        // Redirect to verification pending page instead of dashboard
        router.push("/interviewer/verification-pending");
      } else {
        // Handle error - check multiple sources for error message
        const errorMsg = response.error?.message || 
                        (response as any).message || 
                        "Registration failed. Please try again.";
        setError(errorMsg);
        console.error("Interviewer registration error:", JSON.stringify(response, null, 2));
      }
    } catch (err: any) {
      console.error("Interviewer registration exception:", err);
      setError(err?.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const stepLabels = ["Account", "Experience", "Expertise", "Review"];

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-100 via-violet-50 to-indigo-100 px-4 py-8 md:px-6 md:py-10">
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

        <div className="grid gap-6 lg:grid-cols-[1fr_1.5fr]">
          <aside className="hidden rounded-3xl border border-slate-200 bg-slate-900 p-8 text-white shadow-[0_20px_55px_-38px_rgba(15,23,42,0.55)] lg:block">
            <h2 className="text-3xl font-bold leading-tight">Share your expertise and mentor future talent.</h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-300">
              Complete your profile, upload verification documents, and get approved to start taking
              interview sessions.
            </p>

            <div className="mt-8 space-y-3 text-sm text-slate-300">
              <p>Flexible scheduling</p>
              <p>Transparent platform commission</p>
              <p>Structured workflow for every session</p>
            </div>
          </aside>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_55px_-42px_rgba(15,23,42,0.4)] sm:p-8 lg:p-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-purple-600 text-white rounded-lg mb-6 text-xl font-bold">
              👔
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Become an Interviewer</h1>
            <p className="text-gray-600 text-base">Share your expertise and help students succeed</p>
          </div>

          <div className="mb-8 flex items-center justify-center gap-2">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`h-9 w-9 rounded-full flex items-center justify-center font-semibold text-sm transition-colors sm:h-10 sm:w-10 ${
                    step === currentStep
                      ? "bg-purple-600 text-white"
                      : step < currentStep
                      ? "bg-purple-600 text-white"
                      : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {step < currentStep ? <Check size={16} /> : step}
                </div>
                {step < 4 && (
                  <div
                    className={`h-1 w-8 mx-1 transition-colors sm:w-12 sm:mx-2 ${
                      step < currentStep ? "bg-purple-600" : "bg-gray-200"
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>

          <div className="mb-8 flex justify-between px-2 text-xs font-semibold sm:px-4">
            {stepLabels.map((label, index) => (
              <div 
                key={label}
                className={`text-center ${currentStep === index + 1 ? "text-purple-600" : "text-gray-500"}`}
              >
                {label}
              </div>
            ))}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-6">
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
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                      required
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
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                    required
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
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                      required
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
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                    required
                  />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Current Company *
                  </label>
                  <input
                    type="text"
                    name="currentCompany"
                    value={formData.currentCompany}
                    onChange={handleInputChange}
                    placeholder="e.g., Google, Microsoft"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleInputChange}
                    placeholder="e.g., Senior Software Engineer"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                    required
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Years of Experience *
                    </label>
                    <input
                      type="number"
                      name="yearsOfExperience"
                      value={formData.yearsOfExperience}
                      onChange={handleInputChange}
                      min="1"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="+94 71 234 5678"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    LinkedIn Profile *
                  </label>
                  <input
                    type="url"
                    name="linkedinProfile"
                    value={formData.linkedinProfile}
                    onChange={handleInputChange}
                    placeholder="https://linkedin.com/in/yourprofile"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Required for verification purposes</p>
                </div>

                {/* NIC Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    NIC Document *
                  </label>
                  <input
                    type="file"
                    name="nicFile"
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2"
                    required
                  />
                  {formData.nicFile && <p className="text-xs text-gray-500 mt-1">Selected: {formData.nicFile.name}</p>}
                </div>

                {/* Appointment Letter Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Appointment Letter *
                  </label>
                  <input
                    type="file"
                    name="appointmentLetterFile"
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2"
                    required
                  />
                  {formData.appointmentLetterFile && <p className="text-xs text-gray-500 mt-1">Selected: {formData.appointmentLetterFile.name}</p>}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Areas of Expertise *
                  </label>
                  <p className="text-sm text-gray-500 mb-3">Select all that apply</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {expertiseOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handleExpertiseToggle(option)}
                        className={`px-4 py-3 rounded-lg border-2 text-left text-sm font-medium transition-colors ${
                          formData.expertise.includes(option)
                            ? "border-purple-600 bg-purple-50 text-purple-700"
                            : "border-slate-200 hover:border-purple-300 text-gray-700"
                        }`}
                      >
                        {formData.expertise.includes(option) && (
                          <Check size={16} className="inline mr-2" />
                        )}
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Hourly Rate (USD) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-gray-500">$</span>
                    <input
                      type="number"
                      name="hourlyRate"
                      value={formData.hourlyRate}
                      onChange={handleInputChange}
                      placeholder="50"
                      min="10"
                      className="w-full rounded-xl border border-slate-300 py-3 pl-8 pr-4 text-base outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Platform takes 20% commission</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Bio / About You
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Tell job seekers about your experience and interview style..."
                    rows={4}
                    className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-base outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                  />
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="rounded-xl bg-gray-50 p-6">
                  <h3 className="font-semibold text-gray-800 mb-4">Review Your Information</h3>
                  
                  <div className="space-y-4">
                    <div className="border-b border-gray-200 pb-4">
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Account Details</h4>
                      <p className="text-gray-800">{formData.firstName} {formData.lastName}</p>
                      <p className="text-gray-600 text-sm">{formData.email}</p>
                    </div>

                    <div className="border-b border-gray-200 pb-4">
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Professional Experience</h4>
                      <p className="text-gray-800">{formData.jobTitle} at {formData.currentCompany}</p>
                      <p className="text-gray-600 text-sm">{formData.yearsOfExperience} years of experience</p>
                      {formData.linkedinProfile && (
                        <a href={formData.linkedinProfile} target="_blank" rel="noopener noreferrer" className="text-purple-600 text-sm hover:underline">
                          LinkedIn Profile
                        </a>
                      )}
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Expertise & Pricing</h4>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {formData.expertise.map((exp) => (
                          <span key={exp} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                            {exp}
                          </span>
                        ))}
                      </div>
                      <p className="text-gray-800 font-semibold">${formData.hourlyRate}/hour</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <h4 className="font-semibold text-amber-800 mb-2">Verification Required</h4>
                  <p className="text-amber-700 text-sm">
                    After registration, your profile will be reviewed by our admin team. 
                    You will receive an email once your account is approved and you can start conducting interviews.
                  </p>
                </div>
              </div>
            )}

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

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 rounded-xl bg-purple-600 px-4 py-3 font-semibold text-white transition hover:bg-purple-700"
                >
                  Continue
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-xl bg-orange-400 px-4 py-3 font-semibold text-white transition hover:bg-orange-500 disabled:opacity-50"
                >
                  {loading ? "Creating account..." : "Submit for Review"}
                </button>
              )}
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600 text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-purple-600 hover:underline font-semibold">
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
