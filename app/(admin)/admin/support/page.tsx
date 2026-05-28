"use client";

import React, { useState, useEffect, useRef } from "react";
import { adminApi } from "@/lib/api";
import { Search, Send, Clock, CircleDot, AlertCircle, CheckCircle2, User, ChevronRight, MessageSquare, AlertTriangle, Filter } from "lucide-react";

export default function SupportInbox() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [activeTicket, setActiveTicket] = useState<any>(null);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState("all");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchTickets = async () => {
    try {
      const response = await adminApi.getTickets();
      if (response.success && response.data) {
        setTickets(response.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketDetails = async (id: number, optimisticTicket?: any) => {
    try {
      setErrorMsg(null);
      setLoadingMessages(true);
      if (optimisticTicket) {
        setActiveTicket({ ...optimisticTicket, messages: [] });
      }
      const response = await adminApi.getTicketDetails(id);
      console.log("[Admin fetchTicketDetails] raw response:", JSON.stringify(response).slice(0, 300));
      if (response.success && response.data) {
        setActiveTicket(response.data);
      } else {
        console.error("[Admin fetchTicketDetails] failed:", response.error);
        setErrorMsg(response.error?.message || "Failed to load ticket details");
        if (!optimisticTicket) setActiveTicket(null);
      }
    } catch (err: any) {
      console.error("[Admin fetchTicketDetails] exception:", err);
      setErrorMsg(err.message || "Network error loading ticket");
      if (!optimisticTicket) setActiveTicket(null);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    if (selectedTicketId) {
      const optimistic = tickets.find(t => t.id === selectedTicketId);
      fetchTicketDetails(selectedTicketId, optimistic);
    } else {
      setActiveTicket(null);
      setErrorMsg(null);
    }
  }, [selectedTicketId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeTicket?.messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selectedTicketId) return;

    setSending(true);
    try {
      const response = await adminApi.replyToTicket(selectedTicketId, message);
      if (response.success) {
        setMessage("");
        fetchTicketDetails(selectedTicketId);
        fetchTickets(); // Refresh list to update timestamp
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (status: string) => {
    if (!selectedTicketId) return;
    try {
      const response = await adminApi.updateTicketStatus(selectedTicketId, status);
      if (response.success) {
        fetchTicketDetails(selectedTicketId);
        fetchTickets();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredTickets = tickets.filter(t => {
    if (filter === "all") return true;
    return t.status === filter;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "text-red-600 bg-red-50 border-red-200";
      case "high": return "text-orange-600 bg-orange-50 border-orange-200";
      case "medium": return "text-blue-600 bg-blue-50 border-blue-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20"><CircleDot className="h-3.5 w-3.5" /> Open</span>;
      case "in_progress":
        return <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20"><Clock className="h-3.5 w-3.5" /> In Progress</span>;
      case "resolved":
      case "closed":
        return <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/20"><CheckCircle2 className="h-3.5 w-3.5" /> Resolved</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      {/* Left Pane - Ticket List */}
      <div className="flex w-1/3 flex-col rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 bg-gray-50/50 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-indigo-600" /> Support Inbox
            </h2>
            <span className="bg-indigo-100 text-indigo-700 py-1 px-2.5 rounded-full text-xs font-bold">{filteredTickets.length}</span>
          </div>
          
          <div className="flex flex-wrap gap-1 bg-white rounded-lg p-1 border border-gray-200">
            <button 
              onClick={() => setFilter("all")} 
              className={`flex-1 min-w-[60px] text-xs font-medium py-1.5 rounded-md transition-colors ${filter === "all" ? "bg-indigo-50 text-indigo-700" : "text-gray-500 hover:text-gray-900"}`}
            >
              All
            </button>
            <button 
              onClick={() => setFilter("open")} 
              className={`flex-1 min-w-[60px] text-xs font-medium py-1.5 rounded-md transition-colors ${filter === "open" ? "bg-indigo-50 text-indigo-700" : "text-gray-500 hover:text-gray-900"}`}
            >
              Open
            </button>
            <button 
              onClick={() => setFilter("in_progress")} 
              className={`flex-1 min-w-[75px] text-xs font-medium py-1.5 rounded-md transition-colors ${filter === "in_progress" ? "bg-indigo-50 text-indigo-700" : "text-gray-500 hover:text-gray-900"}`}
            >
              In Progress
            </button>
            <button 
              onClick={() => setFilter("resolved")} 
              className={`flex-1 min-w-[60px] text-xs font-medium py-1.5 rounded-md transition-colors ${filter === "resolved" ? "bg-indigo-50 text-indigo-700" : "text-gray-500 hover:text-gray-900"}`}
            >
              Resolved
            </button>
            <button 
              onClick={() => setFilter("closed")} 
              className={`flex-1 min-w-[60px] text-xs font-medium py-1.5 rounded-md transition-colors ${filter === "closed" ? "bg-indigo-50 text-indigo-700" : "text-gray-500 hover:text-gray-900"}`}
            >
              Closed
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50/30">
          {filteredTickets.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No tickets found</p>
            </div>
          ) : (
            filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => setSelectedTicketId(ticket.id)}
                className={`group cursor-pointer rounded-xl border p-4 transition-all duration-200 ${
                  selectedTicketId === ticket.id
                    ? "border-indigo-200 bg-indigo-50/50 shadow-sm ring-1 ring-indigo-500"
                    : "border-gray-200 bg-white hover:border-indigo-200 hover:shadow-md"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded border ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                    <span className="text-xs text-gray-500">#{ticket.id}</span>
                  </div>
                  <span className="text-xs font-medium text-gray-400">
                    {new Date(ticket.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className={`font-semibold text-sm mb-1 line-clamp-1 ${selectedTicketId === ticket.id ? "text-indigo-900" : "text-gray-900 group-hover:text-indigo-700"}`}>
                  {ticket.subject}
                </h3>
                <p className="text-xs text-gray-500 line-clamp-1 mb-3">{ticket.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center">
                      <User className="h-3 w-3 text-gray-500" />
                    </div>
                    {ticket.userFirstName} {ticket.userLastName}
                  </div>
                  {getStatusBadge(ticket.status)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Pane - Conversation View */}
      <div className="flex flex-1 flex-col rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden relative">
        {errorMsg ? (
          <div className="flex h-full flex-col items-center justify-center text-center px-10">
            <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <span className="text-2xl font-bold text-red-500">!</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to load ticket</h2>
            <p className="text-red-500">{errorMsg}</p>
          </div>
        ) : activeTicket ? (
          <>
            {/* Header */}
            <div className="border-b border-gray-100 bg-white p-5 flex items-center justify-between z-10 shadow-sm">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-xl font-bold text-gray-900">{activeTicket.subject}</h2>
                  <span className="text-sm font-medium text-gray-400">#{activeTicket.id}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1.5"><User className="h-4 w-4" /> {activeTicket.userFirstName} {activeTicket.userLastName} ({activeTicket.userEmail})</span>
                  <span className="text-gray-300">•</span>
                  <span>Created {new Date(activeTicket.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={activeTicket.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="rounded-lg border-gray-300 py-2 pl-3 pr-10 text-sm font-medium focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <option value="open">Mark as Open</option>
                  <option value="in_progress">Mark as In Progress</option>
                  <option value="resolved">Mark as Resolved</option>
                  <option value="closed">Mark as Closed</option>
                </select>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
              <div className="max-w-3xl mx-auto space-y-6">
                
                {/* Initial Ticket Description as first message */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                      {activeTicket.userFirstName[0]}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none p-5 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-900">{activeTicket.userFirstName} {activeTicket.userLastName}</span>
                        <span className="text-xs text-gray-400">{new Date(activeTicket.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{activeTicket.description}</p>
                    </div>
                  </div>
                </div>

                {/* Replies */}
                {loadingMessages && !activeTicket.messages?.length ? (
                  <div className="flex flex-col gap-4">
                    {[1, 2].map(i => (
                      <div key={i} className={`flex gap-4 ${i % 2 === 0 ? "flex-row-reverse" : ""}`}>
                        <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse flex-shrink-0" />
                        <div className="rounded-2xl h-16 w-64 bg-gray-200 animate-pulse" />
                      </div>
                    ))}
                  </div>
                ) : (
                activeTicket.messages?.map((msg: any) => {
                  const isAdmin = msg.senderType === "admin";
                  return (
                    <div key={msg.id} className={`flex gap-4 ${isAdmin ? "flex-row-reverse" : ""}`}>
                      <div className="flex-shrink-0">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm ${isAdmin ? "bg-indigo-600" : "bg-blue-600"}`}>
                          {isAdmin ? "A" : (msg.senderFirstName?.[0] || "U")}
                        </div>
                      </div>
                      <div className="flex-1 flex flex-col">
                        <div className={`${isAdmin ? "ml-auto bg-indigo-600 text-white rounded-tr-none" : "mr-auto bg-white border border-gray-100 text-gray-800 rounded-tl-none"} rounded-2xl p-4 shadow-sm max-w-[85%]`}>
                          <div className="flex items-center justify-between mb-1 gap-4">
                            <span className={`text-sm font-semibold ${isAdmin ? "text-indigo-100" : "text-gray-900"}`}>
                              {msg.senderFirstName} {isAdmin && "(Admin)"}
                            </span>
                          </div>
                          <p className="whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                        </div>
                        <span className={`text-xs text-gray-400 mt-1.5 ${isAdmin ? "text-right" : "text-left"}`}>
                          {new Date(msg.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                })
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Area */}
            {activeTicket.status !== "closed" && activeTicket.status !== "resolved" ? (
              <div className="border-t border-gray-200 bg-white p-4">
                <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex items-end gap-4 relative">
                  <div className="flex-1 bg-gray-50 rounded-2xl border border-gray-200 focus-within:bg-white focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all">
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your reply to the user..."
                      className="w-full resize-none bg-transparent py-4 px-5 outline-none max-h-40 text-gray-700"
                      rows={1}
                      onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = "auto";
                        target.style.height = target.scrollHeight + "px";
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!message.trim() || sending}
                    className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 disabled:opacity-50 transition-all shadow-sm flex-shrink-0"
                  >
                    {sending ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <Send className="h-5 w-5 ml-1" />
                    )}
                  </button>
                </form>
              </div>
            ) : (
              <div className="border-t border-gray-200 bg-gray-50 p-6 text-center">
                <p className="text-gray-500 flex items-center justify-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-gray-400" />
                  This ticket is marked as {activeTicket.status}. Change status to reply.
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center px-10">
            <div className="h-24 w-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
              <MessageSquare className="h-10 w-10 text-indigo-300" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Support Inbox</h3>
            <p className="text-gray-500 max-w-md">
              Select a ticket from the left sidebar to view details, interact with users, and resolve their issues.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
