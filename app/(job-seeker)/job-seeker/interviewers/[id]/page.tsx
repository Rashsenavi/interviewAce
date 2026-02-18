"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Star,
  CheckCircle,
  Briefcase,
  Clock,
  Calendar,
  Video,
  MessageSquare,
  Award,
  Globe,
  Users,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

// Mock interviewer data (in real app, this would come from API)
const interviewersData: Record<string, any> = {
  "1": {
    id: 1,
    name: "Kasun Perera",
    title: "Senior Software Engineer",
    company: "Google",
    avatar: "KP",
    avatarBg: "bg-blue-500",
    rating: 4.9,
    reviews: 127,
    hourlyRate: 5000,
    expertise: ["Software Engineering", "System Design", "Data Structures", "Algorithms", "Technical Interviews"],
    industries: ["IT & Software", "Tech Startups"],
    experience: 8,
    languages: ["English", "Sinhala"],
    totalSessions: 245,
    responseTime: "< 2 hours",
    verified: true,
    bio: "I'm a Senior Software Engineer at Google with 8+ years of experience in building large-scale distributed systems. I've conducted 500+ technical interviews and helped over 200 candidates land jobs at top tech companies including Google, Meta, Amazon, and Microsoft. My sessions focus on problem-solving techniques, system design principles, and interview strategies that actually work.",
    education: "MSc Computer Science - Stanford University",
    completionRate: 98,
    reviews_list: [
      { name: "Thilina R.", rating: 5, date: "Jan 2026", comment: "Excellent session! Kasun helped me understand system design concepts I struggled with for months." },
      { name: "Amaya S.", rating: 5, date: "Jan 2026", comment: "Very thorough feedback and great tips for coding interviews. Highly recommend!" },
      { name: "Ravindu F.", rating: 5, date: "Dec 2025", comment: "Helped me crack my Amazon interview. Best investment I made!" },
    ],
  },
  "2": {
    id: 2,
    name: "Amaya Fernando",
    title: "Product Manager",
    company: "Meta",
    avatar: "AF",
    avatarBg: "bg-purple-500",
    rating: 4.8,
    reviews: 89,
    hourlyRate: 6000,
    expertise: ["Product Management", "Strategy", "User Research", "Product Sense", "Execution"],
    industries: ["Tech", "E-commerce"],
    experience: 6,
    languages: ["English"],
    totalSessions: 156,
    responseTime: "< 1 hour",
    verified: true,
    bio: "Former Product Manager at Meta with 6 years of experience shipping products used by billions. I specialize in helping candidates prepare for PM interviews at top tech companies. My approach focuses on structured thinking, product sense, and effective communication.",
    education: "MBA - Harvard Business School",
    completionRate: 99,
    reviews_list: [
      { name: "Sanduni W.", rating: 5, date: "Jan 2026", comment: "Amaya's framework for product questions is incredible. Got an offer from a FAANG company!" },
      { name: "Kasun P.", rating: 4, date: "Dec 2025", comment: "Great insights into PM interviews. Very helpful mock session." },
    ],
  },
};

// Generate time slots for booking
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 9; hour <= 20; hour++) {
    const time = `${hour.toString().padStart(2, "0")}:00`;
    const displayTime = hour < 12 ? `${hour}:00 AM` : hour === 12 ? `12:00 PM` : `${hour - 12}:00 PM`;
    slots.push({ time, displayTime, available: Math.random() > 0.3 });
  }
  return slots;
};

// Generate dates for the next 14 days
const generateDates = () => {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push({
      date,
      day: date.toLocaleDateString("en-US", { weekday: "short" }),
      dayNum: date.getDate(),
      month: date.toLocaleDateString("en-US", { month: "short" }),
      full: date.toISOString().split("T")[0],
    });
  }
  return dates;
};

export default function InterviewerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const interviewerId = params.id as string;
  
  const interviewer = interviewersData[interviewerId] || interviewersData["1"];
  
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [sessionType, setSessionType] = useState("mock");
  const [notes, setNotes] = useState("");
  const [dateStartIndex, setDateStartIndex] = useState(0);
  const [isBooking, setIsBooking] = useState(false);

  const dates = generateDates();
  const timeSlots = generateTimeSlots();
  const visibleDates = dates.slice(dateStartIndex, dateStartIndex + 7);

  const handleBookSession = async () => {
    if (!selectedDate || !selectedTime) return;
    
    setIsBooking(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // Navigate to confirmation page
    router.push(
      `/job-seeker/booking-confirmation?interviewer=${encodeURIComponent(interviewer.name)}&date=${selectedDate}&time=${selectedTime}&type=${sessionType}&price=${interviewer.hourlyRate}`
    );
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Back Button */}
      <Link
        href="/job-seeker/interviewers"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Interviewers
      </Link>

      <div className="grid grid-cols-3 gap-8">
        {/* Left Column - Profile Info */}
        <div className="col-span-2 space-y-6">
          {/* Profile Header */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-start gap-6">
              <div
                className={`w-24 h-24 ${interviewer.avatarBg} rounded-full flex items-center justify-center text-white font-bold text-3xl flex-shrink-0`}
              >
                {interviewer.avatar}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {interviewer.name}
                  </h1>
                  {interviewer.verified && (
                    <span className="flex items-center gap-1 text-blue-600 text-sm bg-blue-50 px-2 py-1 rounded-full">
                      <CheckCircle className="w-4 h-4" />
                      Verified
                    </span>
                  )}
                </div>
                <p className="text-lg text-gray-700 mb-1">{interviewer.title}</p>
                <p className="text-gray-500 flex items-center gap-2 mb-4">
                  <Briefcase className="w-4 h-4" />
                  {interviewer.company} • {interviewer.experience} years experience
                </p>

                {/* Stats Row */}
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <span className="font-semibold text-gray-900">{interviewer.rating}</span>
                    <span className="text-gray-500">({interviewer.reviews} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500">
                    <Users className="w-4 h-4" />
                    {interviewer.totalSessions} sessions
                  </div>
                  <div className="flex items-center gap-1 text-gray-500">
                    <Clock className="w-4 h-4" />
                    Responds {interviewer.responseTime}
                  </div>
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    {interviewer.completionRate}% completion
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* About */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">About</h2>
            <p className="text-gray-600 leading-relaxed">{interviewer.bio}</p>
            
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                <Award className="w-4 h-4 inline mr-2" />
                {interviewer.education}
              </p>
            </div>
          </div>

          {/* Expertise */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Expertise</h2>
            <div className="flex flex-wrap gap-2">
              {interviewer.expertise.map((skill: string, i: number) => (
                <span
                  key={i}
                  className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-100">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Languages</h3>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-gray-400" />
                {interviewer.languages.map((lang: string, i: number) => (
                  <span key={i} className="text-sm text-gray-600">
                    {lang}{i < interviewer.languages.length - 1 ? "," : ""}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Reviews */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Reviews ({interviewer.reviews})
            </h2>
            <div className="space-y-4">
              {interviewer.reviews_list.map((review: any, i: number) => (
                <div key={i} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 text-sm font-medium">
                        {review.name[0]}
                      </div>
                      <span className="font-medium text-gray-900">{review.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, j) => (
                          <Star
                            key={j}
                            className={`w-4 h-4 ${
                              j < review.rating
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">{review.date}</span>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Booking Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
            <div className="text-center mb-6">
              <p className="text-3xl font-bold text-gray-900">
                LKR {interviewer.hourlyRate.toLocaleString()}
              </p>
              <p className="text-gray-500">per session (1 hour)</p>
            </div>

            <button
              onClick={() => setShowBookingModal(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold mb-4 flex items-center justify-center gap-2"
            >
              <Calendar className="w-5 h-5" />
              Book a Session
            </button>

            <button className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 py-3 rounded-lg font-medium flex items-center justify-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Send Message
            </button>

            <div className="mt-6 pt-6 border-t border-gray-100 space-y-3 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Video className="w-4 h-4" />
                Video call via Zoom/Google Meet
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4" />
                60 minute session
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <CheckCircle className="w-4 h-4" />
                Written feedback after session
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Book a Session</h2>
                <p className="text-gray-500 text-sm">with {interviewer.name}</p>
              </div>
              <button
                onClick={() => setShowBookingModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Session Type */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Session Type</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSessionType("mock")}
                    className={`p-4 rounded-lg border-2 text-left transition-colors ${
                      sessionType === "mock"
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <p className="font-semibold text-gray-900">Mock Interview</p>
                    <p className="text-sm text-gray-500">
                      Full interview simulation with feedback
                    </p>
                  </button>
                  <button
                    onClick={() => setSessionType("coaching")}
                    className={`p-4 rounded-lg border-2 text-left transition-colors ${
                      sessionType === "coaching"
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <p className="font-semibold text-gray-900">Career Coaching</p>
                    <p className="text-sm text-gray-500">
                      Guidance, resume review, Q&A
                    </p>
                  </button>
                </div>
              </div>

              {/* Select Date */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Select Date</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setDateStartIndex(Math.max(0, dateStartIndex - 7))}
                    disabled={dateStartIndex === 0}
                    className="p-2 hover:bg-gray-100 rounded-full disabled:opacity-50"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="flex-1 grid grid-cols-7 gap-2">
                    {visibleDates.map((d) => (
                      <button
                        key={d.full}
                        onClick={() => setSelectedDate(d.full)}
                        className={`p-3 rounded-lg text-center transition-colors ${
                          selectedDate === d.full
                            ? "bg-blue-600 text-white"
                            : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                        }`}
                      >
                        <p className="text-xs font-medium">{d.day}</p>
                        <p className="text-lg font-bold">{d.dayNum}</p>
                        <p className="text-xs">{d.month}</p>
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setDateStartIndex(Math.min(7, dateStartIndex + 7))}
                    disabled={dateStartIndex >= 7}
                    className="p-2 hover:bg-gray-100 rounded-full disabled:opacity-50"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Select Time */}
              {selectedDate && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Select Time</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot.time}
                        onClick={() => slot.available && setSelectedTime(slot.time)}
                        disabled={!slot.available}
                        className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                          selectedTime === slot.time
                            ? "bg-blue-600 text-white"
                            : slot.available
                            ? "bg-gray-50 hover:bg-gray-100 text-gray-700"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed line-through"
                        }`}
                      >
                        {slot.displayTime}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Additional Notes <span className="text-gray-400 font-normal">(optional)</span>
                </h3>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Let the interviewer know what you'd like to focus on..."
                  className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                />
              </div>

              {/* Summary */}
              {selectedDate && selectedTime && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Booking Summary</h3>
                  <div className="space-y-1 text-sm">
                    <p className="text-gray-600">
                      <span className="font-medium">Date:</span>{" "}
                      {new Date(selectedDate).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Time:</span>{" "}
                      {timeSlots.find((s) => s.time === selectedTime)?.displayTime}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Type:</span>{" "}
                      {sessionType === "mock" ? "Mock Interview" : "Career Coaching"}
                    </p>
                    <p className="text-gray-900 font-bold mt-2 pt-2 border-t border-gray-200">
                      Total: LKR {interviewer.hourlyRate.toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <button
                onClick={() => setShowBookingModal(false)}
                className="px-6 py-2 text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleBookSession}
                disabled={!selectedDate || !selectedTime || isBooking}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isBooking ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Booking...
                  </>
                ) : (
                  <>Confirm Booking</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
