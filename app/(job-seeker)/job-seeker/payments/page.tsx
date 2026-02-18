"use client";

import { useState } from "react";
import {
  CreditCard,
  Wallet,
  Receipt,
  Download,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronRight,
  Filter,
  Search,
  DollarSign,
  TrendingUp,
} from "lucide-react";

type PaymentStatus = "completed" | "pending" | "failed" | "refunded";

interface Payment {
  id: string;
  sessionId: string;
  interviewerName: string;
  interviewerAvatar: string;
  interviewerAvatarBg: string;
  date: string;
  amount: number;
  status: PaymentStatus;
  paymentMethod: string;
  sessionType: string;
  sessionDate: string;
}

// Mock payment data
const paymentsData: Payment[] = [
  {
    id: "PAY-20260210001",
    sessionId: "SES-20260212001",
    interviewerName: "Nuwan Perera",
    interviewerAvatar: "NP",
    interviewerAvatarBg: "bg-blue-500",
    date: "2026-02-10",
    amount: 5000,
    status: "completed",
    paymentMethod: "Card ending in 4242",
    sessionType: "Mock Interview",
    sessionDate: "2026-02-12",
  },
  {
    id: "PAY-20260208001",
    sessionId: "SES-20260210001",
    interviewerName: "Dilini Fernando",
    interviewerAvatar: "DF",
    interviewerAvatarBg: "bg-purple-500",
    date: "2026-02-08",
    amount: 4500,
    status: "completed",
    paymentMethod: "Card ending in 4242",
    sessionType: "Career Coaching",
    sessionDate: "2026-02-10",
  },
  {
    id: "PAY-20260205001",
    sessionId: "SES-20260207001",
    interviewerName: "Kasun Silva",
    interviewerAvatar: "KS",
    interviewerAvatarBg: "bg-teal-500",
    date: "2026-02-05",
    amount: 5000,
    status: "completed",
    paymentMethod: "PayHere Wallet",
    sessionType: "Mock Interview",
    sessionDate: "2026-02-07",
  },
  {
    id: "PAY-20260201001",
    sessionId: "SES-20260203001",
    interviewerName: "Amaya Jayawardena",
    interviewerAvatar: "AJ",
    interviewerAvatarBg: "bg-orange-500",
    date: "2026-02-01",
    amount: 4000,
    status: "refunded",
    paymentMethod: "Card ending in 1234",
    sessionType: "Resume Review",
    sessionDate: "2026-02-03",
  },
  {
    id: "PAY-20260128001",
    sessionId: "SES-20260130001",
    interviewerName: "Thilina Rajapaksa",
    interviewerAvatar: "TR",
    interviewerAvatarBg: "bg-green-500",
    date: "2026-01-28",
    amount: 5000,
    status: "completed",
    paymentMethod: "Card ending in 4242",
    sessionType: "Mock Interview",
    sessionDate: "2026-01-30",
  },
];

export default function PaymentsPage() {
  const [filterStatus, setFilterStatus] = useState<PaymentStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Calculate stats
  const totalSpent = paymentsData
    .filter((p) => p.status === "completed")
    .reduce((acc, p) => acc + p.amount, 0);
  const totalPayments = paymentsData.filter((p) => p.status === "completed").length;
  const refundedAmount = paymentsData
    .filter((p) => p.status === "refunded")
    .reduce((acc, p) => acc + p.amount, 0);

  // Filter payments
  const filteredPayments = paymentsData.filter((payment) => {
    const matchesStatus = filterStatus === "all" || payment.status === filterStatus;
    const matchesSearch = payment.interviewerName
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
            <CheckCircle className="w-3 h-3" />
            Completed
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs font-medium">
            <AlertCircle className="w-3 h-3" />
            Pending
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-700 rounded-full text-xs font-medium">
            <XCircle className="w-3 h-3" />
            Failed
          </span>
        );
      case "refunded":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
            <Receipt className="w-3 h-3" />
            Refunded
          </span>
        );
    }
  };

  return (
    <div className="w-full">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payments & Billing</h1>
        <p className="text-gray-600">View your payment history and download receipts</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                LKR {totalSpent.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">Total Spent</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Receipt className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalPayments}</p>
              <p className="text-sm text-gray-500">Transactions</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                LKR {Math.round(totalSpent / totalPayments).toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">Avg. per Session</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <Wallet className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                LKR {refundedAmount.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">Refunded</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods Card */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 mb-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-1">Default Payment Method</h3>
            <div className="flex items-center gap-3">
              <CreditCard className="w-8 h-8" />
              <div>
                <p className="font-medium">•••• •••• •••• 4242</p>
                <p className="text-blue-200 text-sm">Expires 12/28</p>
              </div>
            </div>
          </div>
          <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Manage Payment Methods
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 mb-4">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Status:</span>
            </div>
            <div className="flex gap-1">
              {["all", "completed", "pending", "refunded"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status as PaymentStatus | "all")}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    filterStatus === status
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by interviewer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            />
          </div>
        </div>
      </div>

      {/* Payments List */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Payment History</h3>
        </div>

        <div className="divide-y divide-gray-100">
          {filteredPayments.length === 0 ? (
            <div className="p-12 text-center">
              <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
              <p className="text-gray-500">No payments match your search criteria.</p>
            </div>
          ) : (
            filteredPayments.map((payment) => (
              <div key={payment.id} className="p-5 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  {/* Interviewer Avatar */}
                  <div
                    className={`w-12 h-12 ${payment.interviewerAvatarBg} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0`}
                  >
                    {payment.interviewerAvatar}
                  </div>

                  {/* Payment Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900">{payment.interviewerName}</h4>
                      <span className="text-gray-400">•</span>
                      <span className="text-sm text-gray-600">{payment.sessionType}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Session: {formatDate(payment.sessionDate)}
                      </span>
                      <span className="flex items-center gap-1">
                        <CreditCard className="w-4 h-4" />
                        {payment.paymentMethod}
                      </span>
                    </div>
                  </div>

                  {/* Amount & Status */}
                  <div className="text-right">
                    <p
                      className={`text-lg font-bold ${
                        payment.status === "refunded" ? "text-blue-600" : "text-gray-900"
                      }`}
                    >
                      {payment.status === "refunded" ? "+" : "-"}LKR{" "}
                      {payment.amount.toLocaleString()}
                    </p>
                    <div className="flex items-center justify-end gap-2 mt-1">
                      {getStatusBadge(payment.status)}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                      <Download className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Transaction ID: {payment.id}
                  </span>
                  <span className="text-xs text-gray-500">
                    Paid on {formatDate(payment.date)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Help Section */}
      <div className="mt-6 bg-gray-50 rounded-xl p-6 border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
        <p className="text-gray-600 text-sm mb-4">
          If you have any questions about your payments or need to request a refund, our support
          team is here to help.
        </p>
        <div className="flex gap-3">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            Contact Support
          </button>
          <button className="border border-gray-300 hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium">
            View Refund Policy
          </button>
        </div>
      </div>
    </div>
  );
}
