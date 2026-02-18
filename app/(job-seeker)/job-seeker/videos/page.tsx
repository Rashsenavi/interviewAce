"use client";

import React from "react";
import { Play, Clock, BookOpen, ChevronRight } from "lucide-react";

const videos = [
  {
    id: 1,
    title: "How to Ace Technical Interviews",
    instructor: "Saman Kumara",
    duration: "45 min",
    category: "Technical",
    thumbnail: "/thumbnails/tech.jpg",
    watched: true,
  },
  {
    id: 2,
    title: "Behavioral Interview Tips & Tricks",
    instructor: "Dilini Fernando",
    duration: "30 min",
    category: "Behavioral",
    thumbnail: "/thumbnails/behavioral.jpg",
    watched: true,
  },
  {
    id: 3,
    title: "System Design Fundamentals",
    instructor: "Ravindu Silva",
    duration: "60 min",
    category: "Technical",
    thumbnail: "/thumbnails/system.jpg",
    watched: false,
  },
  {
    id: 4,
    title: "Salary Negotiation Strategies",
    instructor: "Thilini Jayawardena",
    duration: "25 min",
    category: "Career",
    thumbnail: "/thumbnails/salary.jpg",
    watched: false,
  },
];

export default function VideosPage() {
  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Video Library</h1>

      <div className="grid grid-cols-2 gap-6">
        {videos.map((video) => (
          <div
            key={video.id}
            className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          >
            {/* Thumbnail */}
            <div className="relative h-40 bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Play className="w-6 h-6 text-white fill-white" />
              </div>
              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                {video.duration}
              </div>
              {video.watched && (
                <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                  Watched
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-4">
              <span className="text-xs text-blue-600 font-medium">
                {video.category}
              </span>
              <h3 className="font-semibold text-gray-900 mt-1">{video.title}</h3>
              <p className="text-sm text-gray-500 mt-1">by {video.instructor}</p>

              <button className="mt-3 w-full py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                <Play className="w-4 h-4" />
                Watch Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
