import { Request, Response } from "express";
import * as supportService from "../services/support.service";

export const getMyTicketsHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const tickets = await supportService.getUserTickets(userId);
    res.json({ success: true, data: tickets });
  } catch (error: any) {
    console.error("[getMyTickets] Error:", error?.message || error);
    res.status(500).json({ success: false, error: { message: "Failed to fetch tickets", detail: error?.message } });
  }
};

export const createTicketHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { subject, description, priority = "medium" } = req.body;

    if (!subject || !description) {
      return res.status(400).json({ success: false, error: { message: "Subject and description are required" } });
    }

    const newTicket = await supportService.createUserTicket(userId, subject, description, priority);
    res.json({ success: true, data: newTicket });
  } catch (error: any) {
    console.error("[createTicket] Error:", error);
    try {
      require("fs").writeFileSync("debug_ticket_error.log", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    } catch(e) {}
    res.status(500).json({ success: false, error: { message: "Failed to create ticket", detail: error?.message } });
  }
};

export const getTicketDetailsHandler = async (req: Request, res: Response) => {
  try {
    const ticketId = parseInt(req.params.id);
    const userId = (req as any).user.id;
    const ticket = await supportService.getTicketById(ticketId);
    
    if (!ticket) {
      return res.status(404).json({ success: false, error: { message: "Ticket not found" } });
    }
    
    if (ticket.userId !== userId) {
      return res.status(403).json({ success: false, error: { message: "Unauthorized access to this ticket" } });
    }

    res.json({ success: true, data: ticket });
  } catch (error: any) {
    console.error("[getTicketDetails] Error:", error?.message || error);
    res.status(500).json({ success: false, error: { message: "Failed to fetch ticket", detail: error?.message } });
  }
};

export const replyTicketHandler = async (req: Request, res: Response) => {
  try {
    const ticketId = parseInt(req.params.id);
    const { message } = req.body;
    const senderId = (req as any).user.id;

    if (!message) {
      return res.status(400).json({ success: false, error: { message: "Message is required" } });
    }

    const ticket = await supportService.getTicketById(ticketId);
    if (!ticket || ticket.userId !== senderId) {
      return res.status(403).json({ success: false, error: { message: "Unauthorized" } });
    }

    const newMessage = await supportService.addTicketMessage(ticketId, senderId, message);
    res.json({ success: true, data: newMessage });
  } catch (error) {
    console.error("Reply ticket error:", error);
    res.status(500).json({ success: false, error: { message: "Failed to reply to ticket" } });
  }
};
