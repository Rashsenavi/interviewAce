"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { interviewerApi, sessionApi } from "@/lib/api";
import {
  ArrowLeft,
  Star,
  CheckCircle,
  Briefcase,
  Clock,
  Calendar,
  Video,
  MessageSquare,
  Globe,
  Users,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

type InterviewerProfile = {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  currentCompany: string | null;
  jobTitle: string | null;
  yearsExperience: number | null;
  industryExpertise: string[];
  hourlyRate: number;
  bio: string | null;
  isVerified: boolean;
  ratingAverage: number;
  totalInterviews: number;
};

type BookingType = "mock" | "coaching";

function generateTimeSlots() {
  const slots: Array<{ time: string; displayTime: string; available: boolean }> = [];

  for (let hour = 9; hour <= 20; hour++) {
    const time = `${hour.toString().padStart(2, "0")}:00`;
    const displayTime =
      hour < 12 ? `${hour}:00 AM` : hour === 12 ? "12:00 PM" : `${hour - 12}:00 PM`;

    // Keep predictable availability pattern so UI remains stable.
    const available = hour % 4 !== 0;
    slots.push({ time, displayTime, available });
  }

  return slots;
}

function generateDates() {
  const dates: Array<{
    date: Date;
    day: string;
    dayNum: number;
    month: string;
    full: string;
  }> = [];

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
}

function getInitials(firstName?: string, lastName?: string) {
  const first = firstName?.trim()?.[0] ?? "?";
  const last = lastName?.trim()?.[0] ?? "";
  return `${first}${last}`.toUpperCase();
}

function bookingTypeToSessionType(type: BookingType): "behavioral" | "technical" {
  return type === "mock" ? "technical" : "behavioral";
}

export default function InterviewerProfilePage() {
  const params = useParams();
  const router = useRouter();

  const interviewerId = useMemo(() => {
    const rawId = Array.isArray(params.id) ? params.id[0] : params.id;
    return Number(rawId);
  }, [params.id]);

  const [interviewer, setInterviewer] = useState<InterviewerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [sessionType, setSessionType] = useState<BookingType>("mock");
  const [notes, setNotes] = useState("");
  const [dateStartIndex, setDateStartIndex] = useState(0);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const dates = useMemo(() => generateDates(), []);
  const timeSlots = useMemo(() => generateTimeSlots(), []);
  const visibleDates = dates.slice(dateStartIndex, dateStartIndex + 7);

  useEffect(() => {
    const loadInterviewer = async () => {
      if (!Number.isFinite(interviewerId)) {
        setError("Invalid interviewer ID.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const response = await interviewerApi.getById(interviewerId);

      if (!response.success || !response.data?.interviewer) {
        setError(response.error?.message || "Unable to load interviewer profile.");
        setLoading(false);
        return;
      }

      const profile = response.data.interviewer as InterviewerProfile;
      setInterviewer(profile);
      setLoading(false);
    };

    loadInterviewer();
  }, [interviewerId]);

  const handleBookSession = async () => {
    if (!interviewer || !selectedDate || !selectedTime) return;

    setIsBooking(true);
    setBookingError(null);

    const scheduledDate = new Date(`${selectedDate}T${selectedTime}:00`);

    const response = await sessionApi.create({
      interviewerUserId: interviewer.userId,
      sessionType: bookingTypeToSessionType(sessionType),
      scheduledDate: scheduledDate.toISOString(),
      duration: 60,
      priceAmount: interviewer.hourlyRate,
      notes: notes.trim() || undefined,
      recordingConsent: true,
    });

    setIsBooking(false);

    if (!response.success) {
      setBookingError(response.error?.message || "Booking failed. Please try again.");
      return;
    }

    router.push(
      `/job-seeker/booking-confirmation?interviewer=${encodeURIComponent(
        `${interviewer.firstName} ${interviewer.lastName}`
      )}&date=${selectedDate}&time=${selectedTime}&type=${sessionType}&price=${interviewer.hourlyRate}`
    );
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <p className="text-gray-600">Loading interviewer profile...</p>
      </div>
    );
  }

  if (error || !interviewer) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-red-700 text-sm">{error || "Interviewer not found."}</p>
        </div>
      </div>
    );
  }

  const interviewerName = `${interviewer.firstName} ${interviewer.lastName}`;

  return (
    <div className="max-w-6xl mx-auto">
      <Link
        href="/job-seeker/interviewers"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Interviewers
      </Link>

      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-3xl shrink-0">
                {getInitials(interviewer.firstName, interviewer.lastName)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">{interviewerName}</h1>
                  {interviewer.isVerified && (
                    <span className="flex items-center gap-1 text-blue-600 text-sm bg-blue-50 px-2 py-1 rounded-full">
                      <CheckCircle className="w-4 h-4" />
                      Verified
                    </span>
                  )}
                </div>
                <p className="text-lg text-gray-700 mb-1">{interviewer.jobTitle || "Interviewer"}</p>
                <p className="text-gray-500 flex items-center gap-2 mb-4">
                  <Briefcase className="w-4 h-4" />
                  {interviewer.currentCompany || "Independent"} • {interviewer.yearsExperience ?? 0} years experience
                </p>

                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <span className="font-semibold text-gray-900">{interviewer.ratingAverage.toFixed(1)}</span>
                    <span className="text-gray-500">({interviewer.totalInterviews} sessions)</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500">
                    <Users className="w-4 h-4" />
                    {interviewer.totalInterviews} total sessions
                  </div>
                  <div className="flex items-center gap-1 text-gray-500">
                    <Clock className="w-4 h-4" />
                    Session duration: 60 min
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">About</h2>
            <p className="text-gray-600 leading-relaxed">
              {interviewer.bio || "This interviewer has not added a bio yet."}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Expertise</h2>
            <div className="flex flex-wrap gap-2">
              {(interviewer.industryExpertise || []).length > 0 ? (
                interviewer.industryExpertise.map((skill, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-sm text-gray-500">No expertise listed yet.</p>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Languages</h3>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Globe className="w-4 h-4 text-gray-400" />
                English
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Reviews</h2>
            <p className="text-sm text-gray-500">
              Detailed reviews are not available yet. Session count and ratings are now live from backend data.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
            <div className="text-center mb-6">
              <p className="text-3xl font-bold text-gray-900">LKR {interviewer.hourlyRate.toLocaleString()}</p>
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

      {showBookingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Book a Session</h2>
                <p className="text-gray-500 text-sm">with {interviewerName}</p>
              </div>
              <button
                onClick={() => setShowBookingModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
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
                    <p className="text-sm text-gray-500">Full interview simulation with feedback</p>
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
                    <p className="text-sm text-gray-500">Guidance, resume review, Q&A</p>
                  </button>
                </div>
              </div>

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

              {bookingError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                  <p className="text-sm text-red-700">{bookingError}</p>
                </div>
              )}

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
