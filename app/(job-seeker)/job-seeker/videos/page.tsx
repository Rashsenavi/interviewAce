"use client";

import React, { useEffect, useState } from "react";
import { Play, Video } from "lucide-react";
import { videoApi } from "@/lib/api";

interface ApprovedVideo {
  id: number;
  videoTitle: string;
  videoDescription: string;
  videoUrl: string;
  videoType: string;
  durationSeconds: number;
  viewCount: number;
  createdAt: string;
  uploaderFirstName: string;
  uploaderLastName: string;
}

export default function VideosPage() {
  const [videos, setVideos] = useState<ApprovedVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const res = await videoApi.getApprovedVideos();
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
    fetchVideos();
  }, []);

  const handleWatch = (video: ApprovedVideo) => {
    // Open immediately so browsers don't block it as a popup
    window.open(video.videoUrl, "_blank");
    
    // Track view in the background
    videoApi.incrementViewCount(video.id).catch(e => {
      console.error("Failed to track view", e);
    });
  };

  const filteredVideos = filter === "all" 
    ? videos 
    : videos.filter(v => v.videoType === filter);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-500">Loading sample videos...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Sample Videos</h1>
          <p className="text-gray-600">Learn best practices from actual interview recordings</p>
        </div>
        
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
        >
          <option value="all">All Categories</option>
          <option value="mock_interview">Mock Interview</option>
          <option value="career_guidance">Career Guidance</option>
          <option value="resume_review">Resume Review</option>
          <option value="technical_deep_dive">Technical Deep Dive</option>
        </select>
      </div>

      {filteredVideos.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Video className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No videos found</h3>
          <p className="text-gray-500">There are currently no sample videos in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => (
            <div
              key={video.id}
              onClick={() => handleWatch(video)}
              className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col"
            >
              {/* Thumbnail */}
              <div className="relative h-44 bg-gray-900 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-blue-900/40 group-hover:bg-blue-900/20 transition-colors"></div>
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md border border-white/30 group-hover:scale-110 transition-transform duration-300">
                  <Play className="w-8 h-8 text-white fill-white ml-1" />
                </div>
                <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded font-medium backdrop-blur-sm">
                  {video.viewCount} views
                </div>
                <div className="absolute top-2 right-2 bg-blue-600/90 text-white text-xs px-2 py-1 rounded font-medium backdrop-blur-sm shadow-sm">
                  {video.videoType.replace("_", " ")}
                </div>
              </div>

              {/* Content */}
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-semibold text-gray-900 leading-tight mb-1 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {video.videoTitle}
                </h3>
                <p className="text-sm text-gray-500 mb-4 font-medium">
                  by {video.uploaderFirstName} {video.uploaderLastName}
                </p>
                
                {video.videoDescription && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1">
                    {video.videoDescription}
                  </p>
                )}

                <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded-md">
                    {new Date(video.createdAt).toLocaleDateString()}
                  </span>
                  <span className="text-sm font-semibold text-blue-600 group-hover:text-blue-700 flex items-center gap-1">
                    Watch Now <Play className="w-3 h-3 fill-current" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
