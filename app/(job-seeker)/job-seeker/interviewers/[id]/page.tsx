"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { interviewerApi, sessionApi, paymentApi } from "@/lib/api";
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
  const userId = params.id as string;
  
  const [interviewer, setInterviewer] = useState<any>(null);
  const [availability, setAvailability] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [sessionType, setSessionType] = useState("mock");
  const [sessionDuration, setSessionDuration] = useState<30 | 60>(60);
  const [notes, setNotes] = useState("");
  const [dateStartIndex, setDateStartIndex] = useState(0);
  const [isBooking, setIsBooking] = useState(false);

  // Fetch interviewer data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [profileRes, availRes] = await Promise.all([
          interviewerApi.getById(parseInt(userId)),
          interviewerApi.getAvailability(parseInt(userId))
        ]);

        if (profileRes.success && profileRes.data?.interviewer) {
          setInterviewer(profileRes.data.interviewer);
        } else {
          setError(profileRes.error?.message || "Failed to load interviewer profile");
        }

        if (availRes.success && availRes.data?.slots) {
          setAvailability(availRes.data.slots);
        }
      } catch (err) {
        console.error("Error fetching interviewer data:", err);
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const dates = generateDates();
  
  // Filter times based on selected date and availability slots
  const getTimeSlotsForDate = (dateString: string) => {
    if (!availability.length) return [];
    
    const date = new Date(dateString);
    const dayName = date.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
    
    const specificSlots = availability.filter(s => {
      if (!s.specificDate) return false;
      const sDate = new Date(s.specificDate).toISOString().split('T')[0];
      return sDate === dateString;
    });

    const slotsToUse = specificSlots;
    
    const slots: any[] = [];
    slotsToUse.forEach(slot => {
      // Create 1-hour chunks within the start/end time
      // This logic assumes slots are defined as ranges (e.g. 09:00 to 17:00)
      let current = parseInt(slot.startTime.split(":")[0]);
      const startMin = parseInt(slot.startTime.split(":")[1]);
      const end = parseInt(slot.endTime.split(":")[0]);
      const endMin = parseInt(slot.endTime.split(":")[1]);
      
      // Handle 30-min increments if needed, but keeping 1-hour chunks for simplicity in this UI
      while (current < end || (current === end && endMin > 0)) {
        const timeStr = `${current.toString().padStart(2, "0")}:${startMin === 30 ? "30" : "00"}`;
        const displayTime = current < 12 
          ? `${current === 0 ? 12 : current}:${startMin === 30 ? "30" : "00"} AM` 
          : current === 12 
            ? `12:${startMin === 30 ? "30" : "00"} PM` 
            : `${current - 12}:${startMin === 30 ? "30" : "00"} PM`;
            
        slots.push({ time: timeStr, displayTime, available: true });
        current++;
      }
    });
    
    return slots.sort((a, b) => a.time.localeCompare(b.time));
  };

  const timeSlots = selectedDate ? getTimeSlotsForDate(selectedDate) : [];
  const visibleDates = dates.slice(dateStartIndex, dateStartIndex + 7);

  const handleBookSession = async () => {
    if (!selectedDate || !selectedTime || !interviewer) return;
    
    setIsBooking(true);
    
    try {
      const scheduledDate = new Date(`${selectedDate}T${selectedTime}:00`).toISOString();
      const backendSessionType = sessionType === "coaching" ? "behavioral" : "technical";
      
      // Step 1: Create the session
      const sessionResponse = await sessionApi.create({
        interviewerUserId: parseInt(userId),
        sessionType: backendSessionType,
        scheduledDate: scheduledDate,
        duration: sessionDuration,
        notes: notes || undefined,
        recordingConsent: false,
      });

      if (!sessionResponse.success || !sessionResponse.data?.session?.id) {
        alert(sessionResponse.error?.message || "Failed to create session");
        setIsBooking(false);
        return;
      }

      const sessionId = sessionResponse.data.session.id;

      // Step 2: Initiate PayHere payment
      const paymentResponse = await paymentApi.initiate(sessionId);

      if (!paymentResponse.success || !paymentResponse.data) {
        alert(paymentResponse.error?.message || "Failed to initiate payment");
        setIsBooking(false);
        return;
      }

      // Step 3: Redirect to PayHere via dynamic form submission
      const { checkoutUrl, formParams } = paymentResponse.data;
      const form = document.createElement("form");
      form.method = "POST";
      form.action = checkoutUrl;
      Object.entries(formParams).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value as string;
        form.appendChild(input);
      });
      document.body.appendChild(form);
      form.submit();
      // Note: page will navigate away — no need to setIsBooking(false)
    } catch (err) {
      console.error("Booking error:", err);
      alert("An unexpected error occurred while booking.");
      setIsBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }

  if (error || !interviewer) {
    return (
      <div className="bg-red-50 text-red-700 p-8 rounded-xl border border-red-200 text-center">
        <p className="text-lg font-semibold">{error || "Interviewer not found"}</p>
        <Link href="/job-seeker/interviewers" className="text-blue-600 underline mt-4 inline-block">
          Back to list
        </Link>
      </div>
    );
  }

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
                className={`w-24 h-24 ${interviewer.avatarBg || "bg-blue-500"} rounded-full flex items-center justify-center text-white font-bold text-3xl shrink-0`}
              >
                {interviewer.firstName?.[0]}{interviewer.lastName?.[0] || "IN"}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {interviewer.firstName} {interviewer.lastName}
                  </h1>
                  {interviewer.isVerified ? (
                    <span className="flex items-center gap-1 text-blue-600 text-sm bg-blue-50 px-2 py-1 rounded-full">
                      <CheckCircle className="w-4 h-4" />
                      Verified
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-orange-600 text-sm bg-orange-50 px-2 py-1 rounded-full">
                      <Clock className="w-4 h-4" />
                      Verification Pending
                    </span>
                  )}
                </div>
                <p className="text-lg text-gray-700 mb-1">{interviewer.jobTitle}</p>
                <p className="text-gray-500 flex items-center gap-2 mb-4">
                  <Briefcase className="w-4 h-4" />
                  {interviewer.currentCompany} • {interviewer.yearsExperience} years experience
                </p>
 
                {/* Stats Row */}
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <span className="font-semibold text-gray-900">{interviewer.ratingAverage?.toFixed(1) || "0.0"}</span>
                    <span className="text-gray-500">({interviewer.totalInterviews || 0} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500">
                    <Users className="w-4 h-4" />
                    {interviewer.totalInterviews || 0} sessions
                  </div>
                  <div className="flex items-center gap-1 text-gray-500">
                    <Clock className="w-4 h-4" />
                    Responds {interviewer.responseTime || "< 2 hours"}
                  </div>
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    {interviewer.completionRate || 100}% completion
                  </div>
                </div>
              </div>
            </div>
          </div>
 
          {/* About */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">About</h2>
            <p className="text-gray-600 leading-relaxed">{interviewer.bio || "Professional interviewer available for focused mock sessions."}</p>
            
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                <Award className="w-4 h-4 inline mr-2" />
                {interviewer.education || "Bachelor of Science in Computer Science"}
              </p>
            </div>
          </div>
 
          {/* Expertise */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Expertise</h2>
            <div className="flex flex-wrap gap-2">
              {(interviewer.industryExpertise || []).map((skill: string, i: number) => (
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
                {(interviewer.languages || ["English"]).map((lang: string, i: number) => (
                  <span key={i} className="text-sm text-gray-600">
                    {lang}{i < (interviewer.languages?.length || 1) - 1 ? "," : ""}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Reviews */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Reviews ({interviewer.totalInterviews || 0})
            </h2>
            <div className="space-y-4">
              {(interviewer.reviews_list || []).map((review: any, i: number) => (
                <div key={i} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 text-sm font-medium">
                        {review.name?.[0] || "U"}
                      </div>
                      <span className="font-medium text-gray-900">{review.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, j) => (
                          <Star
                            key={j}
                            className={`w-4 h-4 ${
                              j < (review.rating || 5)
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
              {(!interviewer.reviews_list || interviewer.reviews_list.length === 0) && (
                <p className="text-sm text-gray-500 italic">No reviews yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Booking Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
            <div className="text-center mb-6">
              <p className="text-3xl font-bold text-gray-900">
                LKR {(parseFloat(interviewer.hourlyRate || "0")).toLocaleString()}
              </p>
              <p className="text-gray-500">per session (1 hour)</p>
            </div>

            <button
              onClick={() => setShowBookingModal(true)}
              disabled={!interviewer.isVerified}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold mb-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Calendar className="w-5 h-5" />
              {interviewer.isVerified ? "Book a Session" : "Verification Pending"}
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
                30 or 60 minute sessions
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
                <p className="text-gray-500 text-sm">with {interviewer.firstName} {interviewer.lastName}</p>
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

              {/* Session Duration */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Session Duration</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSessionDuration(30)}
                    className={`p-4 rounded-lg border-2 text-center transition-colors ${
                      sessionDuration === 30
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <p className="font-semibold text-gray-900">30 Minutes</p>
                  </button>
                  <button
                    onClick={() => setSessionDuration(60)}
                    className={`p-4 rounded-lg border-2 text-center transition-colors ${
                      sessionDuration === 60
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <p className="font-semibold text-gray-900">60 Minutes</p>
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
              {selectedDate && selectedTime && (() => {
                const baseRate = (parseFloat(interviewer.hourlyRate || "0") / 60) * sessionDuration;
                const commissionRate = parseFloat(interviewer.commissionRate || "20");
                const platformCommission = baseRate * (commissionRate / 100);
                const totalPrice = Math.max(30, baseRate + platformCommission);

                return (
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
                        <span className="font-medium">Duration:</span> {sessionDuration} Minutes
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Type:</span>{" "}
                        {sessionType === "mock" ? "Mock Interview" : "Career Coaching"}
                      </p>
                      <div className="mt-3 pt-3 border-t border-gray-200 space-y-1">
                        <div className="flex justify-between text-gray-600">
                          <span>Interviewer Rate</span>
                          <span>LKR {baseRate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                          <span>System Fee ({commissionRate}%)</span>
                          <span>LKR {platformCommission.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between text-gray-900 font-bold text-base mt-2">
                          <span>Total</span>
                          <span>LKR {totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
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
