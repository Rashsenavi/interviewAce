"use client";

import { useState, useEffect } from "react";
import { paymentApi } from "@/lib/api";
import {
  DollarSign,
  Users,
  Clock,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  Loader2,
  Send,
  Building,
  Calendar,
} from "lucide-react";

function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function getMonthOptions() {
  const months = [];
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-US", { year: "numeric", month: "long" });
    months.push({ value, label });
  }
  return months;
}

interface PayoutRow {
  interviewerId: number;
  payoutMonth: string;
  totalSessions: number;
  totalHours: number;
  grossAmount: number;
  commissionDeducted: number;
  netPayoutAmount: number;
  interviewer: {
    firstName: string;
    lastName: string;
    email: string;
    bankAccountNumber: string | null;
  };
  payoutRecord: any | null;
}

export default function AdminPayoutsPage() {
  const [month, setMonth] = useState(getCurrentMonth());
  const [payouts, setPayouts] = useState<PayoutRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [releasing, setReleasing] = useState<Set<number>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const monthOptions = getMonthOptions();

  const exportCsv = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
      const url = `/api/reports/admin/payouts?month=${month}`;
      
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to download CSV");
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", `admin_payouts_${month}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err) {
      alert("Failed to export CSV report.");
    }
  };

  const exportPdf = () => {
    window.print();
  };

  const loadPayouts = async () => {
    setLoading(true);
    setError(null);
    setSelectedIds(new Set());
    try {
      const res = await paymentApi.getAdminPayouts(month);
      if (res.success && res.data?.payouts) {
        setPayouts(res.data.payouts as PayoutRow[]);
      } else {
        setError("Failed to load payout data.");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPayouts(); }, [month]);

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    const pending = payouts.filter((p) => !p.payoutRecord).map((p) => p.interviewerId);
    if (selectedIds.size === pending.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pending));
    }
  };

  const handleRelease = async (ids: number[]) => {
    if (ids.length === 0) return;
    setReleasing(new Set(ids));
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await paymentApi.releasePayouts(ids, month);
      if (res.success) {
        const released = (res.data as any)?.released?.length ?? ids.length;
        setSuccessMsg(`✅ Successfully released payouts for ${released} interviewer(s).`);
        await loadPayouts();
      } else {
        setError("Failed to release payouts.");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setReleasing(new Set());
    }
  };

  // Summary stats
  const totalPending = payouts.filter((p) => !p.payoutRecord).reduce((s, p) => s + p.netPayoutAmount, 0);
  const totalPaid = payouts.filter((p) => p.payoutRecord).reduce((s, p) => s + p.netPayoutAmount, 0);
  const totalSessions = payouts.reduce((s, p) => s + p.totalSessions, 0);
  const totalCommission = payouts.reduce((s, p) => s + p.commissionDeducted, 0);
  const pendingCount = payouts.filter((p) => !p.payoutRecord).length;
  const selectedPending = Array.from(selectedIds).filter((id) =>
    payouts.find((p) => p.interviewerId === id && !p.payoutRecord)
  );

  return (
    <div className="w-full">
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          aside, header, .no-print, select, button, nav {
            display: none !important;
          }
          body {
            background: white !important;
            color: black !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
          }
        }
      `}} />
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Interviewer Payouts</h1>
          <p className="text-gray-500 text-sm no-print">Review and release monthly salary to interviewers</p>
          <p className="text-sm text-gray-600 hidden print:block font-medium">Report Month: {monthOptions.find(o => o.value === month)?.label || month}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 no-print">
          <button 
            onClick={exportCsv}
            className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Export CSV
          </button>
          <button 
            onClick={exportPdf}
            className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Download PDF
          </button>
          
          <div className="relative">
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg pl-4 pr-10 py-2.5 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {monthOptions.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-red-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />{error}
        </div>
      )}
      {successMsg && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-green-700 text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />{successMsg}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-5 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">LKR {totalPending.toLocaleString()}</p>
              <p className="text-orange-100 text-sm">Pending Release</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">LKR {totalPaid.toLocaleString()}</p>
              <p className="text-sm text-gray-500">Already Released</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">LKR {totalCommission.toLocaleString()}</p>
              <p className="text-sm text-gray-500">Platform Revenue</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalSessions}</p>
              <p className="text-sm text-gray-500">Total Sessions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedPending.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4 flex items-center justify-between no-print">
          <p className="text-blue-800 text-sm font-medium">
            {selectedPending.length} interviewer(s) selected
          </p>
          <button
            onClick={() => handleRelease(selectedPending)}
            disabled={releasing.size > 0}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50"
          >
            {releasing.size > 0 ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Release Selected Payouts
          </button>
        </div>
      )}

      {/* Payouts Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">
              Interviewer Payouts —{" "}
              {monthOptions.find((m) => m.value === month)?.label}
            </h3>
            {pendingCount > 0 && (
              <span className="bg-orange-100 text-orange-700 text-xs font-medium px-2 py-0.5 rounded-full no-print">
                {pendingCount} pending
              </span>
            )}
          </div>

          {pendingCount > 0 && (
            <button
              onClick={toggleAll}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium no-print"
            >
              {selectedIds.size === pendingCount ? "Deselect All" : "Select All Pending"}
            </button>
          )}
        </div>

        {loading ? (
          <div className="p-12 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : payouts.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No earnings this month</h3>
            <p className="text-gray-500 text-sm">No completed sessions were found for {monthOptions.find((m) => m.value === month)?.label}.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {payouts.map((row) => {
              const isPaid = !!row.payoutRecord;
              const isSelected = selectedIds.has(row.interviewerId);
              const isReleasing = releasing.has(row.interviewerId);
              const name = `${row.interviewer.firstName} ${row.interviewer.lastName}`;
              const initials = `${row.interviewer.firstName[0]}${row.interviewer.lastName[0]}`;

              return (
                <div
                  key={row.interviewerId}
                  className={`p-5 flex items-center gap-4 transition-colors ${isSelected ? "bg-blue-50" : "hover:bg-gray-50"}`}
                >
                  {/* Checkbox (only for pending) */}
                  <div className="w-5 shrink-0 no-print">
                    {!isPaid && (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(row.interviewerId)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    )}
                  </div>

                  {/* Avatar */}
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold shrink-0">
                    {initials}
                  </div>

                  {/* Interviewer Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">{name}</p>
                    <p className="text-sm text-gray-500">{row.interviewer.email}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {row.totalSessions} sessions
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {row.totalHours.toFixed(1)}h
                      </span>
                      {row.interviewer.bankAccountNumber && (
                        <span className="flex items-center gap-1">
                          <Building className="w-3 h-3" />
                          {row.interviewer.bankAccountNumber}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Amounts */}
                  <div className="text-right shrink-0">
                    <p className="text-xs text-gray-400">Gross</p>
                    <p className="text-sm text-gray-700">LKR {row.grossAmount.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Commission (20%)</p>
                    <p className="text-sm text-red-600">-LKR {row.commissionDeducted.toLocaleString()}</p>
                  </div>

                  {/* Net Payout */}
                  <div className="text-right min-w-[120px] shrink-0">
                    <p className="text-xs text-gray-500 mb-1">Net Payout</p>
                    <p className="text-xl font-bold text-gray-900">LKR {row.netPayoutAmount.toLocaleString()}</p>
                  </div>

                  {/* Status / Action */}
                  <div className="shrink-0 w-36 text-right print:w-auto">
                    {isPaid ? (
                      <div>
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-medium print:bg-white print:text-black">
                          <CheckCircle className="w-3 h-3 no-print" />
                          Released
                        </span>
                        {row.payoutRecord?.releasedAt && (
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(row.payoutRecord.releasedAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        )}
                        {row.payoutRecord?.autoReleased && (
                          <p className="text-xs text-blue-500 mt-0.5 no-print">Auto-released</p>
                        )}
                      </div>
                    ) : (
                      <div className="print:block hidden text-sm font-medium text-amber-600">
                        Pending
                      </div>
                    )}
                    {!isPaid && (
                      <button
                        onClick={() => handleRelease([row.interviewerId])}
                        disabled={isReleasing || releasing.size > 0}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 ml-auto disabled:opacity-50 transition-colors no-print"
                      >
                        {isReleasing ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Send className="w-3.5 h-3.5" />
                        )}
                        Release
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer note about auto-release */}
        {!loading && payouts.length > 0 && (
          <div className="p-4 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-500">
              💡 <strong>Auto-release policy:</strong> If payouts are not manually released within 7 days of month end, they will be automatically processed by the system.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
