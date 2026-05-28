import { db } from "../config/database";
import { supportTickets, ticketMessages, users } from "../db/schema";
import { eq, desc, sql } from "drizzle-orm";

export const getAllTickets = async () => {
  const tickets = await db
    .select({
      id: supportTickets.id,
      userId: supportTickets.userId,
      userFirstName: users.firstName,
      userLastName: users.lastName,
      userEmail: users.email,
      subject: supportTickets.subject,
      description: supportTickets.description,
      status: supportTickets.status,
      priority: supportTickets.priority,
      createdAt: supportTickets.createdAt,
      updatedAt: supportTickets.updatedAt,
    })
    .from(supportTickets)
    .innerJoin(users, eq(supportTickets.userId, users.id))
    .orderBy(desc(supportTickets.updatedAt));

  return tickets;
};

export const getUserTickets = async (userId: number) => {
  const tickets = await db
    .select({
      id: supportTickets.id,
      userId: supportTickets.userId,
      subject: supportTickets.subject,
      description: supportTickets.description,
      status: supportTickets.status,
      priority: supportTickets.priority,
      createdAt: supportTickets.createdAt,
      updatedAt: supportTickets.updatedAt,
    })
    .from(supportTickets)
    .where(eq(supportTickets.userId, userId))
    .orderBy(desc(supportTickets.updatedAt));

  return tickets;
};

export const getTicketById = async (ticketId: number) => {
  const ticketData = await db
    .select({
      id: supportTickets.id,
      userId: supportTickets.userId,
      userFirstName: users.firstName,
      userLastName: users.lastName,
      userEmail: users.email,
      subject: supportTickets.subject,
      description: supportTickets.description,
      status: supportTickets.status,
      priority: supportTickets.priority,
      createdAt: supportTickets.createdAt,
      updatedAt: supportTickets.updatedAt,
    })
    .from(supportTickets)
    .innerJoin(users, eq(supportTickets.userId, users.id))
    .where(eq(supportTickets.id, ticketId))
    .limit(1);

  if (!ticketData.length) return null;

  const messages = await db
    .select({
      id: ticketMessages.id,
      ticketId: ticketMessages.ticketId,
      senderId: ticketMessages.senderId,
      senderFirstName: users.firstName,
      senderLastName: users.lastName,
      senderType: users.userType,
      message: ticketMessages.message,
      isRead: ticketMessages.isRead,
      createdAt: ticketMessages.createdAt,
    })
    .from(ticketMessages)
    .innerJoin(users, eq(ticketMessages.senderId, users.id))
    .where(eq(ticketMessages.ticketId, ticketId))
    .orderBy(ticketMessages.createdAt);

  return {
    ...ticketData[0],
    messages,
  };
};

export const addTicketMessage = async (ticketId: number, senderId: number, message: string) => {
  const newMessage = await db
    .insert(ticketMessages)
    .values({
      ticketId,
      senderId,
      message,
    })
    .returning();
    
  await db.update(supportTickets)
    .set({ updatedAt: sql`now()` })
    .where(eq(supportTickets.id, ticketId));

  return newMessage[0];
};

export const updateTicketStatus = async (ticketId: number, status: "open" | "in_progress" | "resolved" | "closed") => {
  const updatedTicket = await db
    .update(supportTickets)
    .set({ status, updatedAt: sql`now()` })
    .where(eq(supportTickets.id, ticketId))
    .returning();

  return updatedTicket[0];
};

export const createUserTicket = async (userId: number, subject: string, description: string, priority: "low" | "medium" | "high" | "urgent") => {
  const ticket = await db
    .insert(supportTickets)
    .values({
      userId,
      subject,
      description,
      status: "open",
      priority,
    })
    .returning();
  return ticket[0];
};

// Create a mock ticket for testing
export const createMockTicket = async (userId: number, subject: string, description: string) => {
  const ticket = await db
    .insert(supportTickets)
    .values({
      userId,
      subject,
      description,
      status: "open",
      priority: "medium",
    })
    .returning();
  return ticket[0];
};
