"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { interviewerApi } from "@/lib/api";
import { 
  Save, 
  Video, 
  User, 
  Briefcase, 
  CreditCard, 
  Globe, 
  Phone, 
  FileText 
} from "lucide-react";

export default function InterviewerProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Personal Info State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  // Professional Profile State
  const [currentCompany, setCurrentCompany] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [linkedinProfile, setLinkedinProfile] = useState("");
  const [bio, setBio] = useState("");

  // Payout Settings State
  const [bankAccountNumber, setBankAccountNumber] = useState("");

  // Meeting & Pricing Settings State
  const [preferredPlatform, setPreferredPlatform] = useState<"zoom" | "teams">("zoom");
  const [hourlyRate, setHourlyRate] = useState<string>("0");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await interviewerApi.getProfile();
        if (response.success && response.data?.profile) {
          const prof = response.data.profile;
          setProfile(prof);
          setPreferredPlatform(prof.preferredMeetingPlatform || "zoom");
          setHourlyRate(prof.hourlyRate || "0");
          setFirstName(prof.firstName || "");
          setLastName(prof.lastName || "");
          setPhoneNumber(prof.phoneNumber || "");
          setCurrentCompany(prof.currentCompany || "");
          setJobTitle(prof.jobTitle || "");
          setYearsExperience(prof.yearsExperience !== undefined ? String(prof.yearsExperience) : "0");
          setLinkedinProfile(prof.linkedinProfile || "");
          setBio(prof.bio || "");
          setBankAccountNumber(prof.bankAccountNumber || "");
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");
    
    // Quick frontend validation
    if (!firstName.trim() || !lastName.trim()) {
      setErrorMsg("First name and last name are required.");
      setSaving(false);
      return;
    }

    if (!currentCompany.trim() || !jobTitle.trim()) {
      setErrorMsg("Job title and current company are required.");
      setSaving(false);
      return;
    }

    if (linkedinProfile && !linkedinProfile.startsWith("http")) {
      setErrorMsg("LinkedIn profile must be a valid URL starting with http:// or https://");
      setSaving(false);
      return;
    }

    try {
      const response = await interviewerApi.updateProfile({
        preferredMeetingPlatform: preferredPlatform,
        hourlyRate: parseFloat(hourlyRate) || 0,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber: phoneNumber.trim(),
        currentCompany: currentCompany.trim(),
        jobTitle: jobTitle.trim(),
        yearsExperience: parseInt(yearsExperience) || 0,
        linkedinProfile: linkedinProfile.trim(),
        bio: bio.trim(),
        bankAccountNumber: bankAccountNumber.trim(),
      });

      if (response.success) {
        setSuccessMsg("Settings updated successfully!");
        setProfile(response.data?.profile);
        // Scroll back to top to read success alert
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setErrorMsg(response.error?.message || "Failed to update settings");
      }
    } catch (err) {
      setErrorMsg("An unexpected error occurred while saving.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
        <p className="text-sm text-slate-400">Loading settings…</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Interviewer Settings</h2>
            <p className="text-sm text-gray-500 mt-1">
              Configure your personal details, professional profile, meeting preferences, and payout information.
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {successMsg && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
              {successMsg}
            </div>
          )}
          
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {errorMsg}
            </div>
          )}

          <div className="space-y-8">
            {/* 1. Personal Information */}
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2 pb-2 border-b border-gray-100">
                <User size={18} className="text-orange-500" />
                Personal Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name *</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
                    placeholder="First Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name *</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
                    placeholder="Last Name"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Phone size={16} />
                    </div>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="pl-10 w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
                      placeholder="e.g. +94 77 123 4567"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Professional Profile */}
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2 pb-2 border-b border-gray-100">
                <Briefcase size={18} className="text-orange-500" />
                Professional Profile
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Job Title *</label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
                    placeholder="e.g. Senior Software Engineer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Company *</label>
                  <input
                    type="text"
                    value={currentCompany}
                    onChange={(e) => setCurrentCompany(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
                    placeholder="e.g. Google"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Years of Experience</label>
                  <input
                    type="number"
                    min="0"
                    value={yearsExperience}
                    onChange={(e) => setYearsExperience(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
                    placeholder="e.g. 5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">LinkedIn Profile URL</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Globe size={16} />
                    </div>
                    <input
                      type="url"
                      value={linkedinProfile}
                      onChange={(e) => setLinkedinProfile(e.target.value)}
                      className="pl-10 w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
                      placeholder="e.g. https://linkedin.com/in/username"
                    />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Bio / Professional Summary</label>
                  <textarea
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none resize-none"
                    placeholder="Briefly describe your expertise, domain knowledge, and mock interview approach..."
                  />
                </div>
              </div>
            </div>

            {/* 3. Meeting Settings */}
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2 pb-2 border-b border-gray-100">
                <Video size={18} className="text-orange-500" />
                Meeting Preferences
              </h3>
              <label className="block text-sm font-medium text-gray-700 mb-2.5">Preferred Video Platform</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Zoom */}
                <div
                  onClick={() => setPreferredPlatform("zoom")}
                  className={`cursor-pointer rounded-xl border-2 p-4 flex items-center gap-4 transition-all ${
                    preferredPlatform === "zoom"
                      ? "border-orange-500 bg-orange-50/50"
                      : "border-gray-200 hover:border-orange-200"
                  }`}
                >
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <Video size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900">Zoom</h4>
                    <p className="text-xs text-gray-500">Automated Zoom links</p>
                  </div>
                  {preferredPlatform === "zoom" && (
                    <div className="ml-auto h-5 w-5 rounded-full bg-orange-500 flex items-center justify-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-white"></div>
                    </div>
                  )}
                </div>

                {/* Teams */}
                <div
                  onClick={() => setPreferredPlatform("teams")}
                  className={`cursor-pointer rounded-xl border-2 p-4 flex items-center gap-4 transition-all ${
                    preferredPlatform === "teams"
                      ? "border-orange-500 bg-orange-50/50"
                      : "border-gray-200 hover:border-orange-200"
                  }`}
                >
                  <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                    <Video size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900">Microsoft Teams</h4>
                    <p className="text-xs text-gray-500">Automated Teams links</p>
                  </div>
                  {preferredPlatform === "teams" && (
                    <div className="ml-auto h-5 w-5 rounded-full bg-orange-500 flex items-center justify-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-white"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 4. Pricing Settings */}
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2 pb-2 border-b border-gray-100">
                <FileText size={18} className="text-orange-500" />
                Pricing Settings
              </h3>
              <div className="max-w-md">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Base Hourly Rate (LKR)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 text-sm">
                    Rs.
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    className="pl-10 w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
                    placeholder="2500"
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  This is your base payout per 60-minute interview. A 20% platform commission is added on top of this rate when shown to job seekers.
                </p>
              </div>
            </div>

            {/* 5. Payout Settings */}
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2 pb-2 border-b border-gray-100">
                <CreditCard size={18} className="text-orange-500" />
                Payout Details
              </h3>
              <div className="max-w-md">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Bank Account Number</label>
                <input
                  type="text"
                  value={bankAccountNumber}
                  onChange={(e) => setBankAccountNumber(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
                  placeholder="e.g. 100023456789"
                />
                <p className="mt-2 text-xs text-gray-500">
                  Enter the account number where you wish to receive your payouts for completed sessions.
                </p>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-6 border-t border-gray-100 flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-70"
              >
                {saving ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                ) : (
                  <Save size={18} />
                )}
                Save Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
