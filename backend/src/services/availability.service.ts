import { eq } from "drizzle-orm";
import { db } from "../config/database";
import { availabilitySlots } from "../db/schema";

export interface CreateAvailabilityInput {
  dayOfWeek: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
  startTime: string;
  endTime: string;
  isRecurring: boolean;
  specificDate?: string;
}

/**
 * Get availability for an interviewer
 */
export const getAvailabilityByInterviewerId = async (interviewerId: number) => {
  return await db
    .select()
    .from(availabilitySlots)
    .where(eq(availabilitySlots.interviewerId, interviewerId));
};

/**
 * Update availability for an interviewer
 * This deletes old slots and replaces them with new ones for a clean state
 */
export const updateAvailability = async (interviewerId: number, slots: CreateAvailabilityInput[]) => {
  // Use a transaction to ensure atomic update
  return await db.transaction(async (tx) => {
    // 1. Delete existing slots
    await tx
      .delete(availabilitySlots)
      .where(eq(availabilitySlots.interviewerId, interviewerId));

    // 2. Insert new slots if any
    if (slots.length > 0) {
      const slotsToInsert = slots.map((slot) => ({
        interviewerId,
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
        isRecurring: slot.isRecurring ?? true,
        specificDate: slot.specificDate,
        updatedAt: new Date(),
      }));

      return await tx.insert(availabilitySlots).values(slotsToInsert).returning();
    }

    return [];
  });
};

export default {
  getAvailabilityByInterviewerId,
  updateAvailability,
};
