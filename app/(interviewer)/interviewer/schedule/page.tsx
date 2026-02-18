"use client";

import { useState } from "react";
import { Plus, Trash2, ChevronLeft, ChevronRight, Lightbulb } from "lucide-react";

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

const TIMES = [
  "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00"
];

// Initial mock data matching the screenshot
const initialAvailability: DayAvailability[] = [
  {
    day: "Monday",
    slots: [
      { id: "mon-1", startTime: "09:00", endTime: "12:00", enabled: true },
      { id: "mon-2", startTime: "14:00", endTime: "17:00", enabled: true },
    ],
  },
  {
    day: "Tuesday",
    slots: [
      { id: "tue-1", startTime: "09:00", endTime: "12:00", enabled: true },
    ],
  },
  {
    day: "Wednesday",
    slots: [
      { id: "wed-1", startTime: "14:00", endTime: "18:00", enabled: true },
    ],
  },
  {
    day: "Thursday",
    slots: [
      { id: "thu-1", startTime: "10:00", endTime: "13:00", enabled: true },
    ],
  },
  {
    day: "Friday",
    slots: [
      { id: "fri-1", startTime: "09:00", endTime: "12:00", enabled: false },
    ],
  },
  {
    day: "Saturday",
    slots: [],
  },
  {
    day: "Sunday",
    slots: [],
  },
];

export default function SchedulePage() {
  const [availability, setAvailability] = useState<DayAvailability[]>(initialAvailability);
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 0, 1)); // January 2026
  const [selectedDate, setSelectedDate] = useState<number | null>(15);
  const [blockedDates, setBlockedDates] = useState<Date[]>([]);
  
  // Booking settings
  const [maxSessionsPerDay, setMaxSessionsPerDay] = useState("4 sessions");
  const [bufferTime, setBufferTime] = useState("15 minutes");
  const [instantBooking, setInstantBooking] = useState(false);
  const [autoAccept, setAutoAccept] = useState(false);

  const toggleSlot = (dayIndex: number, slotId: string) => {
    setAvailability((prev) => {
      const newAvail = [...prev];
      const slot = newAvail[dayIndex].slots.find((s) => s.id === slotId);
      if (slot) {
        slot.enabled = !slot.enabled;
      }
      return newAvail;
    });
  };

  const addSlot = (dayIndex: number) => {
    setAvailability((prev) => {
      const newAvail = [...prev];
      const newId = `${newAvail[dayIndex].day.toLowerCase().slice(0, 3)}-${Date.now()}`;
      newAvail[dayIndex].slots.push({
        id: newId,
        startTime: "09:00",
        endTime: "17:00",
        enabled: true,
      });
      return newAvail;
    });
  };

  const removeSlot = (dayIndex: number, slotId: string) => {
    setAvailability((prev) => {
      const newAvail = [...prev];
      newAvail[dayIndex].slots = newAvail[dayIndex].slots.filter((s) => s.id !== slotId);
      return newAvail;
    });
  };

  const updateSlotTime = (
    dayIndex: number,
    slotId: string,
    field: "startTime" | "endTime",
    value: string
  ) => {
    setAvailability((prev) => {
      const newAvail = [...prev];
      const slot = newAvail[dayIndex].slots.find((s) => s.id === slotId);
      if (slot) {
        slot[field] = value;
      }
      return newAvail;
    });
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

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Manage Your Availability</h1>
        <p className="text-gray-600 mt-1">
          Set your weekly schedule and block specific dates when you're unavailable
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left Column - Weekly Availability */}
        <div className="col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Weekly Availability</h2>
              <p className="text-sm text-gray-500 mt-1">Define your recurring weekly schedule</p>
            </div>

            <div className="space-y-6">
              {availability.map((dayData, dayIndex) => (
                <div key={dayData.day} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900">{dayData.day}</h3>
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
                          <select
                            value={slot.startTime}
                            onChange={(e) =>
                              updateSlotTime(dayIndex, slot.id, "startTime", e.target.value)
                            }
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                          >
                            {TIMES.map((time) => (
                              <option key={time} value={time}>
                                {time}
                              </option>
                            ))}
                          </select>

                          <span className="text-gray-500">to</span>

                          {/* End Time */}
                          <select
                            value={slot.endTime}
                            onChange={(e) =>
                              updateSlotTime(dayIndex, slot.id, "endTime", e.target.value)
                            }
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                          >
                            {TIMES.map((time) => (
                              <option key={time} value={time}>
                                {time}
                              </option>
                            ))}
                          </select>

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
                  const isToday = day === 15 && currentMonth.getMonth() === 0; // Mock today as Jan 15

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
