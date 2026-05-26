"use client";

import { useState, useEffect } from "react";
import { paymentApi } from "@/lib/api";
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Clock,
  Download,
  Filter,
  Wallet,
  CheckCircle,
  AlertCircle,
  ArrowUpRight,
  Building,
  ChevronDown,
  Loader2,
  Users,
} from "lucide-react";

function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function getMonthOptions() {
  const months: { value: string; label: string }[] = [];
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-US", { year: "numeric", month: "long" });
    months.push({ value, label });
  }
  // Add "All Time" option
  months.push({ value: "", label: "All Time" });
  return months;
}

const SESSION_TYPE_LABELS: Record<string, string> = {
  behavioral: "Behavioral",
  technical: "Technical",
  case_study: "Case Study",
  mixed: "Mixed",
};

export default function InterviewerEarningsPage() {
  const [month, setMonth] = useState(getCurrentMonth());
  const [earningsData, setEarningsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<"all" | "paid" | "pending">("all");

  const monthOptions = getMonthOptions();

  const loadEarnings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await paymentApi.getEarnings(month || undefined);
      if (res.success && res.data) {
        setEarningsData(res.data);
      } else {
        setError("Failed to load earnings data.");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadEarnings(); }, [month]);

  const summary = earningsData?.summary;
  const payout = earningsData?.payout;
  const earnings: any[] = earningsData?.earnings || [];

  const filteredEarnings = earnings.filter((e) => {
    if (filterType === "all") return true;
    if (filterType === "paid") return !!e.payoutId;
    if (filterType === "pending") return !e.payoutId;
    return true;
  });

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="w-full">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Earnings</h1>
          <p className="text-gray-500 text-sm">Track your session earnings and payout history</p>
        </div>

        {/* Month Picker */}
        <div className="relative">
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="appearance-none bg-white border border-gray-300 rounded-lg pl-4 pr-10 py-2.5 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
          >
            {monthOptions.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-red-700 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-teal-500 animate-spin" />
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl p-5 text-white">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Wallet className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    LKR {(summary?.totalNet || 0).toLocaleString()}
                  </p>
                  <p className="text-teal-100 text-sm">Net Earnings</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    LKR {(summary?.totalGross || 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">Gross Earned</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {(summary?.totalHours || 0).toFixed(1)}h
                  </p>
                  <p className="text-sm text-gray-500">Hours Worked</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {summary?.totalSessions || 0}
                  </p>
                  <p className="text-sm text-gray-500">Sessions</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payout Status Card */}
          {month && (
            <div
              className={`rounded-xl p-6 mb-6 ${
                payout
                  ? "bg-gradient-to-r from-green-600 to-teal-600 text-white"
                  : "bg-gradient-to-r from-orange-500 to-amber-500 text-white"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    {payout ? <CheckCircle className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                  </div>
                  <div>
                    <p className="text-white/80 text-sm">
                      {monthOptions.find((m) => m.value === month)?.label} Payout
                    </p>
                    <p className="text-2xl font-bold">
                      LKR {(summary?.totalNet || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {payout ? (
                    <div>
                      <span className="inline-flex items-center gap-1 bg-white/20 px-3 py-1.5 rounded-full text-sm font-medium">
                        <CheckCircle className="w-4 h-4" />
                        Released
                        {payout.autoReleased ? " (Auto)" : ""}
                      </span>
                      {payout.releasedAt && (
                        <p className="text-white/70 text-xs mt-1">
                          on {new Date(payout.releasedAt).toLocaleDateString("en-US", {
                            month: "short", day: "numeric", year: "numeric"
                          })}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <span className="inline-flex items-center gap-1 bg-white/20 px-3 py-1.5 rounded-full text-sm font-medium">
                        <AlertCircle className="w-4 h-4" />
                        Pending
                      </span>
                      <p className="text-white/70 text-xs mt-1">
                        Admin will release by 7th of next month
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Bank Account Card */}
          {summary?.bankAccountNumber && (
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-6 mb-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                    <Building className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Payout Account</p>
                    <p className="font-semibold text-lg">Bank Account</p>
                    <p className="text-gray-400">{summary.bankAccountNumber}</p>
                  </div>
                </div>
                <div className="text-right text-sm text-gray-400">
                  <p>Commission Rate</p>
                  <p className="text-xl font-bold text-white">{summary.commissionRate || 20}%</p>
                  <p className="text-xs mt-1">deducted by platform</p>
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white rounded-xl border border-gray-200 mb-4">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Filter:</span>
                </div>
                <div className="flex gap-1">
                  {[
                    { key: "all", label: "All Sessions" },
                    { key: "paid", label: "Paid Out" },
                    { key: "pending", label: "Pending Payout" },
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => setFilterType(key as "all" | "paid" | "pending")}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        filterType === key
                          ? "bg-teal-100 text-teal-700"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium">
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>

          {/* Sessions Table */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Session Earnings</h3>
            </div>

            <div className="divide-y divide-gray-100">
              {filteredEarnings.length === 0 ? (
                <div className="p-12 text-center">
                  <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {earnings.length === 0 ? "No earnings yet" : "No sessions match filter"}
                  </h3>
                  <p className="text-gray-500 text-sm">
                    {earnings.length === 0
                      ? "Completed sessions will appear here."
                      : "Try changing the filter."}
                  </p>
                </div>
              ) : (
                filteredEarnings.map((earning: any) => {
                  const isPaidOut = !!earning.payoutId;
                  const seekerName = earning.session?.seekerName || "—";
                  const initials = seekerName
                    .split(" ")
                    .map((w: string) => w[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();

                  return (
                    <div key={earning.id} className="p-5 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center text-white font-semibold shrink-0">
                          {initials}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900">{seekerName}</h4>
                            <span className="text-gray-400">•</span>
                            <span className="text-sm text-gray-600">
                              {SESSION_TYPE_LABELS[earning.session?.type] || earning.session?.type || "Interview"}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {formatDate(earning.session?.date)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {earning.durationHours.toFixed(1)}h
                            </span>
                          </div>
                        </div>

                        {/* Commission breakdown */}
                        <div className="text-right text-sm shrink-0">
                          <p className="text-gray-400">Gross</p>
                          <p className="text-gray-600">LKR {earning.grossAmount.toLocaleString()}</p>
                          <p className="text-red-500 text-xs">
                            -LKR {earning.commissionDeducted.toLocaleString()} commission
                          </p>
                        </div>

                        {/* Net Earning */}
                        <div className="text-right shrink-0 min-w-[120px]">
                          <p className="text-lg font-bold text-green-600">
                            +LKR {earning.netEarning.toLocaleString()}
                          </p>
                          <div className="flex items-center justify-end gap-1 mt-1">
                            {isPaidOut ? (
                              <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                <CheckCircle className="w-3 h-3" />
                                Paid
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                                <AlertCircle className="w-3 h-3" />
                                Pending
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
