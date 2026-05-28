"use client";

import { useEffect, useState } from "react";
import { videoApi } from "@/lib/api";
import { CheckCircle, XCircle, Video, PlayCircle } from "lucide-react";

interface PendingVideo {
  id: number;
  videoTitle: string;
  videoDescription: string;
  videoUrl: string;
  videoType: string;
  createdAt: string;
  adminApprovalStatus: string;
  sessionId: number;
  uploaderFirstName: string;
  uploaderLastName: string;
}

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<PendingVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const fetchPendingVideos = async () => {
    try {
      setLoading(true);
      const res = await videoApi.getPendingVideos();
      if (res.success && res.data?.videos) {
        setVideos(res.data.videos);
      }
    } catch (error) {
      console.error("Failed to load videos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingVideos();
  }, []);

  const handleApprove = async (id: number) => {
    try {
      setProcessingId(id);
      const res = await videoApi.approveVideo(id);
      if (res.success) {
        alert("Video approved successfully");
        setVideos(videos.filter((v) => v.id !== id));
      } else {
        alert(res.error?.message || "Failed to approve video");
      }
    } catch (error) {
      console.error("Error approving video:", error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: number) => {
    if (!confirm("Are you sure you want to reject and delete this video?")) return;
    
    try {
      setProcessingId(id);
      const res = await videoApi.rejectVideo(id);
      if (res.success) {
        alert("Video rejected and deleted");
        setVideos(videos.filter((v) => v.id !== id));
      } else {
        alert(res.error?.message || "Failed to reject video");
      }
    } catch (error) {
      console.error("Error rejecting video:", error);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-500">Loading pending videos...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Video Moderation</h1>
        <p className="text-gray-600">Review sample videos uploaded by interviewers</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-700">
              <tr>
                <th className="px-6 py-4 font-semibold">Video Details</th>
                <th className="px-6 py-4 font-semibold">Uploaded By</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {videos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Video className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Videos</h3>
                    <p className="text-gray-500">All uploaded videos have been reviewed.</p>
                  </td>
                </tr>
              ) : (
                videos.map((video) => (
                  <tr key={video.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 mb-1">{video.videoTitle}</div>
                      <div className="text-xs text-gray-500 max-w-xs truncate">{video.videoDescription}</div>
                      <a 
                        href={video.videoUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-teal-600 hover:text-teal-700 mt-2 text-xs font-medium"
                      >
                        <PlayCircle className="w-3 h-3" />
                        Watch Video
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900">{video.uploaderFirstName} {video.uploaderLastName}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                        {video.videoType.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {new Date(video.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(video.id)}
                          disabled={processingId === video.id}
                          className="flex items-center gap-1 bg-green-50 text-green-700 hover:bg-green-100 px-3 py-1.5 rounded text-sm font-medium transition-colors disabled:opacity-50"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(video.id)}
                          disabled={processingId === video.id}
                          className="flex items-center gap-1 bg-red-50 text-red-700 hover:bg-red-100 px-3 py-1.5 rounded text-sm font-medium transition-colors disabled:opacity-50"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
