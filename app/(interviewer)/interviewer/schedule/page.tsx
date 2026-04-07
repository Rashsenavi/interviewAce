"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import { apiClient } from "@/lib/api/client";

type Day = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

type Slot = {
  id: string;
  dayOfWeek: Day;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
};

const DAYS: Array<{ key: Day; label: string }> = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
];

const TIMES = [
  "06:00:00",
  "07:00:00",
  "08:00:00",
  "09:00:00",
  "10:00:00",
  "11:00:00",
  "12:00:00",
  "13:00:00",
  "14:00:00",
  "15:00:00",
  "16:00:00",
  "17:00:00",
  "18:00:00",
  "19:00:00",
  "20:00:00",
  "21:00:00",
];

function normalizeTime(time: string) {
  if (time.length === 5) return `${time}:00`;
  return time;
}

export default function InterviewerSchedulePage() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadAvailability = async () => {
    setLoading(true);
    setError(null);

    const profileRes = await apiClient.get<{ profile: { userId: number } }>("/interviewers/profile");

    if (!profileRes.success || !profileRes.data?.profile?.userId) {
      setError(profileRes.error?.message || "Failed to load interviewer profile.");
      setLoading(false);
      return;
    }

    const availabilityRes = await apiClient.get<{
      slots: Array<{
        id: number;
        dayOfWeek: Day;
        startTime: string;
        endTime: string;
        isAvailable: boolean;
      }>;
    }>(`/interviewers/${profileRes.data.profile.userId}/availability`);

    if (!availabilityRes.success) {
      setError(availabilityRes.error?.message || "Failed to load availability.");
      setLoading(false);
      return;
    }

    const mapped = (availabilityRes.data?.slots || []).map((slot) => ({
      id: String(slot.id),
      dayOfWeek: slot.dayOfWeek,
      startTime: normalizeTime(slot.startTime),
      endTime: normalizeTime(slot.endTime),
      isAvailable: slot.isAvailable,
    }));

    setSlots(mapped);
    setLoading(false);
  };

  useEffect(() => {
    loadAvailability();
  }, []);

  const groupedSlots = useMemo(() => {
    return DAYS.map((day) => ({
      ...day,
      slots: slots.filter((slot) => slot.dayOfWeek === day.key),
    }));
  }, [slots]);

  const addSlot = (day: Day) => {
    setSlots((prev) => [
      ...prev,
      {
        id: `new-${Date.now()}-${Math.random()}`,
        dayOfWeek: day,
        startTime: "09:00:00",
        endTime: "10:00:00",
        isAvailable: true,
      },
    ]);
  };

  const updateSlot = (id: string, field: "startTime" | "endTime" | "isAvailable", value: string | boolean) => {
    setSlots((prev) =>
      prev.map((slot) => (slot.id === id ? { ...slot, [field]: value } : slot))
    );
  };

  const removeSlot = (id: string) => {
    setSlots((prev) => prev.filter((slot) => slot.id !== id));
  };

  const saveAvailability = async () => {
    setSaving(true);
    setError(null);
    setNotice(null);

    const payload = {
      slots: slots
        .filter((s) => s.isAvailable)
        .map((slot) => ({
          dayOfWeek: slot.dayOfWeek,
          startTime: normalizeTime(slot.startTime),
          endTime: normalizeTime(slot.endTime),
          isAvailable: true,
        })),
    };

    const response = await apiClient.put<{ slots: unknown[] }>("/interviewers/availability", payload);

    setSaving(false);

    if (!response.success) {
      setError(response.error?.message || "Failed to save availability.");
      return;
    }

    setNotice("Availability updated successfully.");
    await loadAvailability();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Availability Schedule</h1>
        <p className="text-gray-600">Set your weekly interviewer availability with real backend persistence.</p>
      </div>

      {loading && <p className="text-gray-600">Loading availability...</p>}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {notice && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4">
          <p className="text-sm text-green-700">{notice}</p>
        </div>
      )}

      {!loading && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
          {groupedSlots.map((day) => (
            <section key={day.key} className="border-b border-gray-100 pb-5 last:border-none last:pb-0">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-gray-900">{day.label}</h2>
                <button
                  onClick={() => addSlot(day.key)}
                  className="inline-flex items-center gap-1 text-sm px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Plus className="w-4 h-4" />
                  Add slot
                </button>
              </div>

              {day.slots.length === 0 && (
                <p className="text-sm text-gray-500">No slots added.</p>
              )}

              <div className="space-y-2">
                {day.slots.map((slot) => (
                  <div key={slot.id} className="flex flex-wrap items-center gap-2">
                    <select
                      value={slot.startTime}
                      onChange={(e) => updateSlot(slot.id, "startTime", e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      {TIMES.map((time) => (
                        <option key={time} value={time}>
                          {time.slice(0, 5)}
                        </option>
                      ))}
                    </select>

                    <span className="text-gray-500 text-sm">to</span>

                    <select
                      value={slot.endTime}
                      onChange={(e) => updateSlot(slot.id, "endTime", e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      {TIMES.map((time) => (
                        <option key={time} value={time}>
                          {time.slice(0, 5)}
                        </option>
                      ))}
                    </select>

                    <label className="inline-flex items-center gap-2 text-sm text-gray-600">
                      <input
                        type="checkbox"
                        checked={slot.isAvailable}
                        onChange={(e) => updateSlot(slot.id, "isAvailable", e.target.checked)}
                      />
                      Enabled
                    </label>

                    <button
                      onClick={() => removeSlot(slot.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      aria-label="Remove slot"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          ))}

          <button
            onClick={saveAvailability}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Availability"}
          </button>
        </div>
      )}
    </div>
  );
}
