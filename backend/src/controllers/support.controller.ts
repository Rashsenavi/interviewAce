import { Request, Response } from "express";
import * as supportService from "../services/support.service";

export const getTicketsHandler = async (req: Request, res: Response) => {
  try {
    const tickets = await supportService.getAllTickets();
    res.json({ success: true, data: tickets });
  } catch (error) {
    console.error("Get tickets error:", error);
    res.status(500).json({ success: false, error: { message: "Failed to fetch tickets" } });
  }
};

export const getTicketDetailsHandler = async (req: Request, res: Response) => {
  try {
    const ticketId = parseInt(req.params.id);
    const ticket = await supportService.getTicketById(ticketId);
    if (!ticket) {
      return res.status(404).json({ success: false, error: { message: "Ticket not found" } });
    }
    res.json({ success: true, data: ticket });
  } catch (error: any) {
    console.error("[getTicketDetails] Error:", error?.message || error);
    res.status(500).json({ success: false, error: { message: "Failed to fetch ticket" } });
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

    const newMessage = await supportService.addTicketMessage(ticketId, senderId, message);
    res.json({ success: true, data: newMessage });
  } catch (error) {
    console.error("Reply ticket error:", error);
    res.status(500).json({ success: false, error: { message: "Failed to reply to ticket" } });
  }
};

export const updateTicketStatusHandler = async (req: Request, res: Response) => {
  try {
    const ticketId = parseInt(req.params.id);
    const { status } = req.body;

    if (!["open", "in_progress", "resolved", "closed"].includes(status)) {
      return res.status(400).json({ success: false, error: { message: "Invalid status" } });
    }

    const updatedTicket = await supportService.updateTicketStatus(ticketId, status as any);
    res.json({ success: true, data: updatedTicket });
  } catch (error) {
    console.error("Update ticket status error:", error);
    res.status(500).json({ success: false, error: { message: "Failed to update ticket status" } });
  }
};
