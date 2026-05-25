"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, ChevronLeft, ChevronRight, Lightbulb, Save, Loader2 } from "lucide-react";
import { interviewerApi } from "@/lib/api";
import { useAuth } from "@/lib/context/AuthContext";

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  enabled: boolean;
}

interface DayAvailability {
  day: string;
  slots: TimeSlot[];
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const DAY_MAPPING: Record<string, string> = {
  "Monday": "monday",
  "Tuesday": "tuesday",
  "Wednesday": "wednesday",
  "Thursday": "thursday",
  "Friday": "friday",
  "Saturday": "saturday",
  "Sunday": "sunday"
};
const REVERSE_DAY_MAPPING: Record<string, string> = Object.fromEntries(
  Object.entries(DAY_MAPPING).map(([k, v]) => [v, k])
);

const TIMES = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2).toString().padStart(2, "0");
  const minute = i % 2 === 0 ? "00" : "30";
  return `${hour}:${minute}`;
});

function TimeSelect({ value, onChange }: { value: string; onChange: (val: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block w-28">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 text-left bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 flex justify-between items-center transition-all hover:border-gray-300"
      >
        {value}
        <ChevronRight size={14} className={`text-gray-400 transition-transform ${isOpen ? "rotate-90" : "rotate-0"}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-56 overflow-y-auto scrollbar-hide py-1 animate-in fade-in zoom-in duration-100">
            {TIMES.map((time) => (
              <button
                key={time}
                type="button"
                onClick={() => {
                  onChange(time);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                  value === time 
                    ? "bg-teal-50 text-teal-700 font-semibold" 
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function SchedulePage() {
  const { user } = useAuth();
  const [availability, setAvailability] = useState<DayAvailability[]>(
    DAYS.map(day => ({ day, slots: [] }))
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<number | null>(new Date().getDate());
  const [dateSpecificAvailability, setDateSpecificAvailability] = useState<Record<string, TimeSlot[]>>({});
  const [blockedDates, setBlockedDates] = useState<Date[]>([]);

  // Helper to get dates for the current week
  const getWeekDates = () => {
    const now = new Date();
    const currentDay = now.getDay(); // 0 (Sun) to 6 (Sat)
    // Find this week's Monday (adjusting if today is Sunday)
    const diff = now.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
    const monday = new Date(now.getFullYear(), now.getMonth(), diff);
    
    return DAYS.map((_, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    });
  };
  const weekDates = getWeekDates();
  
  // Booking settings
  const [maxSessionsPerDay, setMaxSessionsPerDay] = useState("4 sessions");
  const [bufferTime, setBufferTime] = useState("15 minutes");
  const [instantBooking, setInstantBooking] = useState(false);
  const [autoAccept, setAutoAccept] = useState(false);

  // Fetch availability on mount
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        // We need the profile to get the interviewer ID
        const profileRes = await interviewerApi.getProfile();
        if (profileRes.success && profileRes.data?.profile) {
          const interviewerId = profileRes.data.profile.id;
          const availRes = await interviewerApi.getAvailability(interviewerId);
          
          if (availRes.success && availRes.data?.slots) {
            const allSlots = availRes.data.slots;
            
            // Map recurring slots
            const newAvailability = DAYS.map(dayName => {
              const dayLower = DAY_MAPPING[dayName];
              const daySlots = allSlots
                .filter((s: any) => s.isRecurring && s.dayOfWeek === dayLower)
                .map((s: any) => ({
                  id: s.id.toString(),
                  startTime: s.startTime.substring(0, 5),
                  endTime: s.endTime.substring(0, 5),
                  enabled: true
                }));
              return { day: dayName, slots: daySlots };
            });
            setAvailability(newAvailability);

            // Map date-specific slots
            const specificSlots: Record<string, TimeSlot[]> = {};
            allSlots
              .filter((s: any) => !s.isRecurring && s.specificDate)
              .forEach((s: any) => {
                // Ensure date key is in YYYY-MM-DD format
                const dateKey = new Date(s.specificDate).toISOString().split('T')[0];
                if (!specificSlots[dateKey]) specificSlots[dateKey] = [];
                specificSlots[dateKey].push({
                  id: s.id.toString(),
                  startTime: s.startTime.substring(0, 5),
                  endTime: s.endTime.substring(0, 5),
                  enabled: true
                });
              });
            setDateSpecificAvailability(specificSlots);
          }
        }
      } catch (error) {
        console.error("Error fetching availability:", error);
        setMessage({ type: "error", text: "Failed to load availability" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailability();
  }, [user]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setMessage(null);

      // Prepare data for backend
      const slotsToSave: any[] = [];
      
      // 1. Add Recurring Slots
      availability.forEach(dayData => {
        dayData.slots.forEach(slot => {
          if (slot.enabled) {
            slotsToSave.push({
              dayOfWeek: DAY_MAPPING[dayData.day],
              startTime: slot.startTime,
              endTime: slot.endTime,
              isRecurring: true
            });
          }
        });
      });

      // 2. Add Date-Specific Slots
      Object.entries(dateSpecificAvailability).forEach(([dateKey, slots]) => {
        const dateObj = new Date(dateKey);
        // Correctly map day of week from date
        const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
        const dayOfWeek = dayNames[dateObj.getDay()];
        
        slots.forEach(slot => {
          if (slot.enabled) {
            slotsToSave.push({
              dayOfWeek,
              startTime: slot.startTime,
              endTime: slot.endTime,
              isRecurring: false,
              specificDate: dateKey
            });
          }
        });
      });

      const response = await interviewerApi.updateAvailability(slotsToSave);
      if (response.success) {
        setMessage({ type: "success", text: "Availability updated successfully!" });
        // Optional: clear message after 3 seconds
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: "error", text: response.error?.message || "Failed to update availability" });
      }
    } catch (error) {
      console.error("Error saving availability:", error);
      setMessage({ type: "error", text: "An unexpected error occurred" });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSlot = (dayIndex: number, slotId: string) => {
    setAvailability((prev) => 
      prev.map((day, idx) => {
        if (idx !== dayIndex) return day;
        return {
          ...day,
          slots: day.slots.map((slot) => 
            slot.id === slotId ? { ...slot, enabled: !slot.enabled } : slot
          ),
        };
      })
    );
  };

  const updateSlotTime = (dayIndex: number, slotId: string, field: "startTime" | "endTime", value: string) => {
    setAvailability((prev) => 
      prev.map((day, idx) => {
        if (idx !== dayIndex) return day;
        return {
          ...day,
          slots: day.slots.map((slot) => 
            slot.id === slotId ? { ...slot, [field]: value } : slot
          ),
        };
      })
    );
  };

  const addSlot = (dayIndex: number) => {
    setAvailability((prev) => 
      prev.map((day, idx) => {
        if (idx !== dayIndex) return day;
        // Use a more unique ID to avoid duplicate keys if added rapidly
        const newId = `new-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        return {
          ...day,
          slots: [
            ...day.slots,
            {
              id: newId,
              startTime: "09:00",
              endTime: "17:00",
              enabled: true,
            },
          ],
        };
      })
    );
  };

  const removeSlot = (dayIndex: number, slotId: string) => {
    setAvailability((prev) => 
      prev.map((day, idx) => {
        if (idx !== dayIndex) return day;
        return {
          ...day,
          slots: day.slots.filter((s) => s.id !== slotId),
        };
      })
    );
  };

  const addDateSpecificSlot = (dateKey: string) => {
    setDateSpecificAvailability(prev => {
      const newSlots = [...(prev[dateKey] || [])];
      const newId = `new-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      newSlots.push({
        id: newId,
        startTime: "09:00",
        endTime: "10:00",
        enabled: true
      });
      return { ...prev, [dateKey]: newSlots };
    });
  };

  const removeDateSpecificSlot = (dateKey: string, slotId: string) => {
    setDateSpecificAvailability(prev => {
      const newSlots = (prev[dateKey] || []).filter(s => s.id !== slotId);
      return { ...prev, [dateKey]: newSlots };
    });
  };

  const updateDateSpecificSlot = (dateKey: string, slotId: string, field: "startTime" | "endTime", value: string) => {
    setDateSpecificAvailability(prev => {
      const newSlots = (prev[dateKey] || []).map(s => 
        s.id === slotId ? { ...s, [field]: value } : s
      );
      return { ...prev, [dateKey]: newSlots };
    });
  };

  const getSelectedDateKey = () => {
    if (!selectedDate) return "";
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), selectedDate);
    // Use local date parts to avoid UTC offset issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const monthName = currentMonth.toLocaleString("default", { month: "long", year: "numeric" });
  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);

  // Calculate availability summary
  const totalHours = availability.reduce((acc, day) => {
    return (
      acc +
      day.slots
        .filter((s) => s.enabled)
        .reduce((slotAcc, slot) => {
          const start = parseInt(slot.startTime.split(":")[0]);
          const end = parseInt(slot.endTime.split(":")[0]);
          return slotAcc + (end - start);
        }, 0)
    );
  }, 0);

  const totalSlots = totalHours * 2; // 30-min slots

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin mb-4" />
        <p className="text-gray-500">Loading your schedule...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Your Availability</h1>
          <p className="text-gray-600 mt-1">
            Set your weekly schedule and block specific dates when you're unavailable
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors disabled:opacity-50"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center justify-between ${
          message.type === "success" ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"
        }`}>
          <span className="text-sm font-medium">{message.text}</span>
          <button onClick={() => setMessage(null)} className="text-xs underline">Dismiss</button>
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* Left Column - Weekly Availability */}
        <div className="col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Default Recurring Schedule</h2>
              <p className="text-sm text-gray-500 mt-1">Define your standard availability that repeats every week</p>
            </div>

            <div className="space-y-6">
              {availability.map((dayData, dayIndex) => (
                <div key={dayData.day} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900">{dayData.day}</h3>
                      <span className="text-xs text-gray-400 font-normal">({weekDates[dayIndex]})</span>
                    </div>
                    <button
                      onClick={() => addSlot(dayIndex)}
                      className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
                    >
                      <Plus size={16} />
                      Add Slot
                    </button>
                  </div>

                  {dayData.slots.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">No availability set</p>
                  ) : (
                    <div className="space-y-3">
                      {dayData.slots.map((slot) => (
                        <div key={slot.id} className="flex items-center gap-3">
                          {/* Toggle */}
                          <button
                            onClick={() => toggleSlot(dayIndex, slot.id)}
                            className={`relative w-12 h-6 rounded-full transition-colors ${
                              slot.enabled ? "bg-teal-600" : "bg-gray-300"
                            }`}
                          >
                            <span
                              className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                                slot.enabled ? "left-7" : "left-1"
                              }`}
                            />
                          </button>

                          {/* Start Time */}
                          <TimeSelect
                            value={slot.startTime}
                            onChange={(val) => updateSlotTime(dayIndex, slot.id, "startTime", val)}
                          />

                          <span className="text-gray-400 text-xs font-medium">to</span>

                          {/* End Time */}
                          <TimeSelect
                            value={slot.endTime}
                            onChange={(val) => updateSlotTime(dayIndex, slot.id, "endTime", val)}
                          />

                          {/* Delete */}
                          <button
                            onClick={() => removeSlot(dayIndex, slot.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Booking Settings */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Booking Settings</h2>
              <p className="text-sm text-gray-500 mt-1">Configure how candidates can book with you</p>
            </div>

            <div className="space-y-5">
              {/* Max Sessions Per Day */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Sessions Per Day
                </label>
                <select
                  value={maxSessionsPerDay}
                  onChange={(e) => setMaxSessionsPerDay(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                >
                  <option>1 session</option>
                  <option>2 sessions</option>
                  <option>3 sessions</option>
                  <option>4 sessions</option>
                  <option>5 sessions</option>
                  <option>Unlimited</option>
                </select>
                <p className="text-xs text-gray-400 mt-1">Limit the number of sessions you conduct per day</p>
              </div>

              {/* Buffer Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Buffer Time Between Sessions
                </label>
                <select
                  value={bufferTime}
                  onChange={(e) => setBufferTime(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                >
                  <option>No buffer</option>
                  <option>15 minutes</option>
                  <option>30 minutes</option>
                  <option>45 minutes</option>
                  <option>1 hour</option>
                </select>
                <p className="text-xs text-gray-400 mt-1">Time gap between consecutive sessions</p>
              </div>

              {/* Instant Booking Toggle */}
              <div className="flex items-center justify-between py-3 border-t border-gray-100">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Instant Booking</h4>
                  <p className="text-xs text-gray-500">Allow candidates to book without your approval</p>
                </div>
                <button
                  onClick={() => setInstantBooking(!instantBooking)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    instantBooking ? "bg-teal-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      instantBooking ? "left-7" : "left-1"
                    }`}
                  />
                </button>
              </div>

              {/* Auto-accept Toggle */}
              <div className="flex items-center justify-between py-3 border-t border-gray-100">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Auto-accept Bookings</h4>
                  <p className="text-xs text-gray-500">Automatically accept booking requests</p>
                </div>
                <button
                  onClick={() => setAutoAccept(!autoAccept)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    autoAccept ? "bg-teal-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      autoAccept ? "left-7" : "left-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Block Specific Dates */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-1">Block Specific Dates</h3>
            <p className="text-sm text-gray-500 mb-4">Mark dates when you're unavailable</p>

            {/* Calendar */}
            <div className="border border-gray-200 rounded-lg p-4">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={prevMonth}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <ChevronLeft size={20} className="text-gray-600" />
                </button>
                <span className="font-medium text-gray-900">{monthName}</span>
                <button
                  onClick={nextMonth}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <ChevronRight size={20} className="text-gray-600" />
                </button>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                  <div
                    key={day}
                    className="text-center text-xs font-medium text-gray-500 py-1"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {/* Empty cells for days before first day */}
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} className="p-2" />
                ))}
                
                {/* Days of the month */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const isSelected = selectedDate === day;
                  const today = new Date();
                  const isToday = day === today.getDate() && 
                                  currentMonth.getMonth() === today.getMonth() && 
                                  currentMonth.getFullYear() === today.getFullYear();

                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDate(day)}
                      className={`p-2 text-sm rounded-lg transition-colors ${
                        isSelected
                          ? "bg-gray-900 text-white"
                          : isToday
                          ? "bg-gray-100 font-semibold"
                          : "hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            <button className="w-full mt-4 border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-3 rounded-lg text-sm font-medium">
              Block Selected Date
            </button>
          </div>

          {/* Date-Specific Availability */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900">
                  {selectedDate ? `Availability for ${new Date(currentMonth.getFullYear(), currentMonth.getMonth(), selectedDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}` : "Select a date"}
                </h3>
                <p className="text-xs text-gray-500">One-off slots for this specific date</p>
              </div>
              {selectedDate && (
                <button
                  onClick={() => addDateSpecificSlot(getSelectedDateKey())}
                  className="flex items-center gap-1 text-xs font-medium text-teal-600 hover:text-teal-700"
                >
                  <Plus size={14} />
                  Add One-off Slot
                </button>
              )}
            </div>

            {selectedDate && (
              <div className="space-y-3">
                {(dateSpecificAvailability[getSelectedDateKey()] || []).length === 0 ? (
                  <div className="text-center py-6 border-2 border-dashed border-gray-100 rounded-lg">
                    <p className="text-sm text-gray-400 italic">No one-off slots for this date</p>
                    <button 
                      onClick={() => addDateSpecificSlot(getSelectedDateKey())}
                      className="text-xs text-teal-600 font-medium mt-2 hover:underline"
                    >
                      Click to add
                    </button>
                  </div>
                ) : (
                  dateSpecificAvailability[getSelectedDateKey()].map(slot => (
                    <div key={slot.id} className="flex items-center gap-2">
                      <TimeSelect
                        value={slot.startTime}
                        onChange={(val) => updateDateSpecificSlot(getSelectedDateKey(), slot.id, "startTime", val)}
                      />
                      <span className="text-gray-400 text-xs">to</span>
                      <TimeSelect
                        value={slot.endTime}
                        onChange={(val) => updateDateSpecificSlot(getSelectedDateKey(), slot.id, "endTime", val)}
                      />
                      <button
                        onClick={() => removeDateSpecificSlot(getSelectedDateKey(), slot.id)}
                        className="p-1.5 text-red-400 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Availability Summary */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Availability Summary</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Weekly Hours</span>
                <span className="font-semibold text-gray-900">{totalHours} hours</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Available Slots/Week</span>
                <span className="font-semibold text-gray-900">{totalSlots} slots</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Blocked Dates</span>
                <span className="font-semibold text-gray-900">{blockedDates.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Current Bookings</span>
                <span className="font-semibold text-green-600">8 sessions</span>
              </div>
            </div>
          </div>

          {/* Pro Tips */}
          <div className="bg-teal-50 rounded-xl border border-teal-100 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb size={18} className="text-teal-600" />
              <h3 className="font-semibold text-teal-800">Pro Tips</h3>
            </div>
            <ul className="space-y-2 text-sm text-teal-700">
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Set buffer time to prepare between sessions</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Block dates for vacations in advance</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Update availability weekly for better bookings</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Enable instant booking for more sessions</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
