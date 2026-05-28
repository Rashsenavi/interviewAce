"use client";

import React, { useState, useEffect, useRef } from "react";
import { supportApi } from "@/lib/api";
import { Search, Send, Clock, CircleDot, AlertCircle, CheckCircle2, User, Plus, MessageSquare, AlertTriangle, Filter, X } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";

export default function UserSupport() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [activeTicket, setActiveTicket] = useState<any>(null);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState("all");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // New ticket modal state
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPriority, setNewPriority] = useState("medium");
  const [creatingTicket, setCreatingTicket] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchTickets = async () => {
    try {
      const response = await supportApi.getMyTickets();
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
      // Show optimistic data immediately from the list
      if (optimisticTicket) {
        setActiveTicket({ ...optimisticTicket, messages: [] });
      }
      const response = await supportApi.getTicketDetails(id);
      console.log("[fetchTicketDetails] raw response:", JSON.stringify(response).slice(0, 300));
      if (response.success && response.data) {
        // Backend returns { success, data: ticketWithMessages }
        // response.data is the ticket object with a messages array
        const ticket = response.data;
        setActiveTicket(ticket);
      } else {
        setErrorMsg(response.error?.message || "Failed to load ticket details");
        if (!optimisticTicket) setActiveTicket(null);
      }
    } catch (err: any) {
      console.error("fetchTicketDetails error:", err);
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
      const response = await supportApi.replyToTicket(selectedTicketId, message);
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

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newDescription.trim()) return;

    setCreatingTicket(true);
    try {
      const response = await supportApi.createTicket({
        subject: newSubject,
        description: newDescription,
        priority: newPriority,
      });
      if (response.success && response.data) {
        setShowNewTicketModal(false);
        setNewSubject("");
        setNewDescription("");
        setNewPriority("medium");
        fetchTickets();
        setSelectedTicketId(response.data.id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreatingTicket(false);
    }
  };

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

  const filteredTickets = tickets.filter(t => {
    if (filter === "all") return true;
    return t.status === filter;
  });

  return (
    <>
      <div className="flex h-[calc(100vh-8rem)] gap-6">
        {/* Left Pane - Ticket List */}
        <div className="flex w-1/3 flex-col rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-100 bg-gray-50/50 p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-indigo-600" /> My Tickets
              </h2>
              <span className="bg-indigo-100 text-indigo-700 py-1 px-2.5 rounded-full text-xs font-bold">{filteredTickets.length}</span>
            </div>
            
            <div className="flex flex-wrap gap-1 bg-white rounded-lg p-1 border border-gray-200 mb-4">
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

            <button
              onClick={() => setShowNewTicketModal(true)}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all"
            >
              <Plus className="h-4 w-4" /> Create New Ticket
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50/30">
            {filteredTickets.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No tickets found</p>
                <p className="text-gray-400 text-xs mt-1">Create one if you need help</p>
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
                  <div className="flex justify-end mt-3">
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
                    <span>Created {new Date(activeTicket.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div>
                  {getStatusBadge(activeTicket.status)}
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                <div className="max-w-3xl mx-auto space-y-6">
                  
                  {/* Initial Ticket Description as first message */}
                  <div className="flex gap-4 flex-row-reverse">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shadow-sm">
                        {user?.firstName?.[0]}
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col items-end">
                      <div className="bg-blue-600 text-white rounded-2xl rounded-tr-none p-5 shadow-sm max-w-[85%]">
                        <p className="whitespace-pre-wrap leading-relaxed">{activeTicket.description}</p>
                      </div>
                      <span className="text-xs text-gray-400 mt-1.5 text-right">
                        {new Date(activeTicket.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Replies */}
                  {loadingMessages && !activeTicket.messages?.length ? (
                    <div className="flex flex-col gap-4">
                      {[1,2].map(i => (
                        <div key={i} className={`flex gap-4 ${i % 2 === 0 ? "flex-row-reverse" : ""}`}>
                          <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse flex-shrink-0" />
                          <div className={`rounded-2xl h-16 w-64 bg-gray-200 animate-pulse`} />
                        </div>
                      ))}
                    </div>
                  ) : (
                  activeTicket.messages?.map((msg: any) => {
                    // User messages (job seeker/interviewer) go RIGHT, admin replies go LEFT
                    const isAdminMessage = msg.senderType === "admin";
                    return (
                      <div key={msg.id} className={`flex gap-4 ${isAdminMessage ? "" : "flex-row-reverse"}`}>
                        <div className="flex-shrink-0">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm ${
                            isAdminMessage ? "bg-indigo-600" : "bg-blue-600"
                          }`}>
                            {isAdminMessage ? "A" : (msg.senderFirstName?.[0] || "U")}
                          </div>
                        </div>
                        <div className="flex-1 flex flex-col">
                          <div className={`${
                            isAdminMessage
                              ? "mr-auto bg-white border border-gray-100 text-gray-800 rounded-tl-none"
                              : "ml-auto bg-blue-600 text-white rounded-tr-none"
                          } rounded-2xl p-4 shadow-sm max-w-[85%]`}>
                            {isAdminMessage && (
                              <div className="flex items-center mb-1 gap-4">
                                <span className="text-sm font-semibold text-gray-900">
                                  {msg.senderFirstName} (Admin)
                                </span>
                              </div>
                            )}
                            <p className="whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                          </div>
                          <span className={`text-xs text-gray-400 mt-1.5 ${isAdminMessage ? "text-left" : "text-right"}`}>
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
                    <div className="flex-1 bg-gray-50 rounded-2xl border border-gray-200 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type your reply..."
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
                      className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/30 disabled:opacity-50 transition-all shadow-sm flex-shrink-0"
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
                    This ticket is marked as {activeTicket.status}. You cannot reply anymore.
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-center px-10">
              <div className="h-24 w-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                <MessageSquare className="h-10 w-10 text-blue-300" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Support Inbox</h3>
              <p className="text-gray-500 max-w-md">
                Select a ticket from the list or create a new one to get help from our admin team.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* New Ticket Modal */}
      {showNewTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900">Create Support Ticket</h3>
              <button
                onClick={() => setShowNewTicketModal(false)}
                className="rounded-full p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="ticket-form" onSubmit={handleCreateTicket} className="space-y-5">
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="subject"
                    required
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Briefly describe your issue"
                  />
                </div>
                
                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    id="priority"
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="low">Low - General inquiry</option>
                    <option value="medium">Medium - I need help with something</option>
                    <option value="high">High - I am blocked from using the platform</option>
                    <option value="urgent">Urgent - Payment or session issue occurring right now</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    required
                    rows={5}
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                    placeholder="Provide as much detail as possible..."
                  />
                </div>
              </form>
            </div>
            
            <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowNewTicketModal(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="ticket-form"
                disabled={creatingTicket || !newSubject.trim() || !newDescription.trim()}
                className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
              >
                {creatingTicket && <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
                Submit Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
