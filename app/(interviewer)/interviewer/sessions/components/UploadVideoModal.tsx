"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { videoApi } from "@/lib/api";
import { X, Upload, FileVideo } from "lucide-react";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

interface UploadVideoModalProps {
  session: any;
  onClose: () => void;
  onSuccess: () => void;
}

export function UploadVideoModal({ session, onClose, onSuccess }: UploadVideoModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState(`${session.sessionType} Session Recording`);
  const [description, setDescription] = useState("");
  const [videoType, setVideoType] = useState("mock_interview");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > MAX_FILE_SIZE) {
        setError("File size exceeds 50MB limit.");
        setFile(null);
        return;
      }
      if (!selectedFile.type.startsWith("video/")) {
        setError("Please select a valid video file (.mp4, .webm).");
        setFile(null);
        return;
      }
      setError(null);
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setUploading(true);
      setError(null);

      // 1. Upload to Supabase Storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `sample_videos/${fileName}`;

      // We'll simulate progress since supabase js doesn't have a built-in progress event for standard uploads
      let simulatedProgress = 0;
      const progressInterval = setInterval(() => {
        simulatedProgress += 5;
        if (simulatedProgress > 90) clearInterval(progressInterval);
        setProgress(Math.min(simulatedProgress, 90));
      }, 500);

      const { data, error: uploadError } = await supabase.storage
        .from("videos") // Make sure this bucket exists in Supabase
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      clearInterval(progressInterval);

      if (uploadError) {
        throw new Error(uploadError.message || "Failed to upload video to storage");
      }

      setProgress(100);

      // Get public URL
      const { data: publicUrlData } = supabase.storage.from("videos").getPublicUrl(filePath);
      const publicUrl = publicUrlData.publicUrl;

      // 2. Save metadata to database
      const response = await videoApi.uploadVideo({
        sessionId: parseInt(session.id),
        industryId: session.industryId,
        videoTitle: title,
        videoDescription: description,
        videoUrl: publicUrl,
        videoType: videoType,
        durationSeconds: 0, // We can extract this later if needed
      });

      if (response.success) {
        onSuccess();
      } else {
        throw new Error(response.error?.message || "Failed to save video record");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Upload Sample Video</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-600 mb-6">
            Share this session recording as a sample video to help job seekers learn. 
            Once uploaded, an Admin will review it before publishing.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Video File (Max 50MB)
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                <div className="space-y-1 text-center">
                  <FileVideo className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600 justify-center">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-teal-600 hover:text-teal-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-teal-500"
                    >
                      <span>Upload a video</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        accept="video/mp4,video/webm"
                        className="sr-only"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">MP4, WebM up to 50MB</p>
                  {file && <p className="text-sm font-medium text-teal-600 mt-2">{file.name}</p>}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Video Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                placeholder="e.g. Great Mock Interview for Software Engineer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={videoType}
                onChange={(e) => setVideoType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
              >
                <option value="mock_interview">Mock Interview</option>
                <option value="career_guidance">Career Guidance</option>
                <option value="resume_review">Resume Review</option>
                <option value="technical_deep_dive">Technical Deep Dive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                placeholder="Briefly describe what candidates can learn from this video..."
              />
            </div>
            
            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {uploading && (
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
                <div 
                  className="bg-teal-600 h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: `${progress}%` }}
                ></div>
                <p className="text-xs text-gray-500 text-center mt-2">Uploading: {progress}%</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <button
            onClick={onClose}
            disabled={uploading}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || !title || uploading}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Upload Video"}
          </button>
        </div>
      </div>
    </div>
  );
}
