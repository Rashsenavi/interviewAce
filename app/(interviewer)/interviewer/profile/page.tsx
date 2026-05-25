"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { interviewerApi } from "@/lib/api";
import { Save, Video } from "lucide-react";

export default function InterviewerProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [preferredPlatform, setPreferredPlatform] = useState<"zoom" | "teams">("zoom");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await interviewerApi.getProfile();
        if (response.success && response.data?.profile) {
          setProfile(response.data.profile);
          setPreferredPlatform(response.data.profile.preferredMeetingPlatform || "zoom");
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
    
    try {
      const response = await interviewerApi.updateProfile({
        preferredMeetingPlatform: preferredPlatform,
      });

      if (response.success) {
        setSuccessMsg("Settings updated successfully!");
        setProfile(response.data?.profile);
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
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Meeting Settings</h2>
            <p className="text-sm text-gray-500 mt-1">
              Configure your preferred video meeting platform for automated session links.
            </p>
          </div>
        </div>

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

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Platform
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Zoom Option */}
                <div
                  onClick={() => setPreferredPlatform("zoom")}
                  className={`cursor-pointer rounded-xl border-2 p-4 flex items-center gap-4 transition-all ${
                    preferredPlatform === "zoom"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-200"
                  }`}
                >
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <Video size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Zoom</h3>
                    <p className="text-xs text-gray-500">Industry standard meetings</p>
                  </div>
                  {preferredPlatform === "zoom" && (
                    <div className="ml-auto h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-white"></div>
                    </div>
                  )}
                </div>

                {/* Teams Option */}
                <div
                  onClick={() => setPreferredPlatform("teams")}
                  className={`cursor-pointer rounded-xl border-2 p-4 flex items-center gap-4 transition-all ${
                    preferredPlatform === "teams"
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200 hover:border-purple-200"
                  }`}
                >
                  <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                    <Video size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Microsoft Teams</h3>
                    <p className="text-xs text-gray-500">Enterprise grade meetings</p>
                  </div>
                  {preferredPlatform === "teams" && (
                    <div className="ml-auto h-6 w-6 rounded-full bg-purple-500 flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-white"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-70"
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
