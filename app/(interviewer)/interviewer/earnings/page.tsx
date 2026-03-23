"use client";

import { useState } from "react";
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Clock,
  Download,
  ChevronRight,
  Filter,
  Search,
  Wallet,
  CreditCard,
  CheckCircle,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Building,
} from "lucide-react";

type TransactionType = "earning" | "withdrawal" | "pending";

interface Transaction {
  id: string;
  type: TransactionType;
  candidateName?: string;
  candidateAvatar?: string;
  candidateAvatarBg?: string;
  sessionId?: string;
  sessionType?: string;
  date: string;
  amount: number;
  status: "completed" | "pending" | "processing";
  bankAccount?: string;
}

// Mock transaction data
const transactionsData: Transaction[] = [
  {
    id: "TXN-20260208001",
    type: "earning",
    candidateName: "Kasun Perera",
    candidateAvatar: "KP",
    candidateAvatarBg: "bg-blue-500",
    sessionId: "INT-20260208001",
    sessionType: "Mock Interview",
    date: "2026-02-08",
    amount: 4250,
    status: "completed",
  },
  {
    id: "TXN-20260206001",
    type: "earning",
    candidateName: "Sanduni Wickrama",
    candidateAvatar: "SW",
    candidateAvatarBg: "bg-pink-500",
    sessionId: "INT-20260206001",
    sessionType: "Career Coaching",
    date: "2026-02-06",
    amount: 4250,
    status: "completed",
  },
  {
    id: "TXN-20260205001",
    type: "withdrawal",
    date: "2026-02-05",
    amount: 15000,
    status: "completed",
    bankAccount: "Commercial Bank ****1234",
  },
  {
    id: "TXN-20260201001",
    type: "earning",
    candidateName: "Ravindu Fernando",
    candidateAvatar: "RF",
    candidateAvatarBg: "bg-orange-500",
    sessionId: "INT-20260201001",
    sessionType: "Mock Interview",
    date: "2026-02-01",
    amount: 4250,
    status: "completed",
  },
  {
    id: "TXN-20260128001",
    type: "earning",
    candidateName: "Nisha Jayawardena",
    candidateAvatar: "NJ",
    candidateAvatarBg: "bg-teal-500",
    sessionId: "INT-20260128001",
    sessionType: "Mock Interview",
    date: "2026-01-28",
    amount: 4250,
    status: "completed",
  },
  {
    id: "TXN-20260125001",
    type: "withdrawal",
    date: "2026-01-25",
    amount: 20000,
    status: "completed",
    bankAccount: "Commercial Bank ****1234",
  },
];

export default function InterviewerEarningsPage() {
  const [filterType, setFilterType] = useState<TransactionType | "all">("all");
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");

  // Calculate stats
  const totalEarnings = transactionsData
    .filter((t) => t.type === "earning" && t.status === "completed")
    .reduce((acc, t) => acc + t.amount, 0);

  const totalWithdrawn = transactionsData
    .filter((t) => t.type === "withdrawal" && t.status === "completed")
    .reduce((acc, t) => acc + t.amount, 0);

  const availableBalance = totalEarnings - totalWithdrawn;

  const sessionsThisMonth = transactionsData.filter(
    (t) => t.type === "earning" && t.date.startsWith("2026-02")
  ).length;

  // Filter transactions
  const filteredTransactions = transactionsData.filter((t) => {
    if (filterType === "all") return true;
    return t.type === filterType;
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Earnings</h1>
          <p className="text-gray-600">Track your earnings and manage withdrawals</p>
        </div>
        <button
          onClick={() => setShowWithdrawModal(true)}
          className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2"
        >
          <Wallet className="w-5 h-5" />
          Withdraw Funds
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-linear-to-br from-teal-500 to-teal-600 rounded-xl p-5 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">LKR {availableBalance.toLocaleString()}</p>
              <p className="text-teal-100 text-sm">Available Balance</p>
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
                LKR {totalEarnings.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">Total Earned</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <ArrowUpRight className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                LKR {totalWithdrawn.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">Total Withdrawn</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{sessionsThisMonth}</p>
              <p className="text-sm text-gray-500">Sessions This Month</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bank Account Card */}
      <div className="bg-linear-to-r from-gray-800 to-gray-900 rounded-xl p-6 mb-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Payout Account</p>
              <p className="font-semibold text-lg">Commercial Bank of Ceylon</p>
              <p className="text-gray-400">Account ending in ****1234</p>
            </div>
          </div>
          <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Change Account
          </button>
        </div>
      </div>

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
                { key: "all", label: "All Transactions" },
                { key: "earning", label: "Earnings" },
                { key: "withdrawal", label: "Withdrawals" },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilterType(key as TransactionType | "all")}
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

      {/* Transactions List */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Transaction History</h3>
        </div>

        <div className="divide-y divide-gray-100">
          {filteredTransactions.length === 0 ? (
            <div className="p-12 text-center">
              <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions</h3>
              <p className="text-gray-500">Your transaction history will appear here.</p>
            </div>
          ) : (
            filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="p-5 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  {/* Icon/Avatar */}
                  {transaction.type === "earning" ? (
                    <div
                      className={`w-12 h-12 ${transaction.candidateAvatarBg} rounded-full flex items-center justify-center text-white font-semibold shrink-0`}
                    >
                      {transaction.candidateAvatar}
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                      <ArrowUpRight className="w-6 h-6 text-blue-600" />
                    </div>
                  )}

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    {transaction.type === "earning" ? (
                      <>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900">
                            {transaction.candidateName}
                          </h4>
                          <span className="text-gray-400">•</span>
                          <span className="text-sm text-gray-600">{transaction.sessionType}</span>
                        </div>
                        <p className="text-sm text-gray-500">Session completed</p>
                      </>
                    ) : (
                      <>
                        <h4 className="font-semibold text-gray-900 mb-1">Withdrawal</h4>
                        <p className="text-sm text-gray-500">{transaction.bankAccount}</p>
                      </>
                    )}
                  </div>

                  {/* Amount & Status */}
                  <div className="text-right">
                    <p
                      className={`text-lg font-bold ${
                        transaction.type === "earning" ? "text-green-600" : "text-gray-900"
                      }`}
                    >
                      {transaction.type === "earning" ? "+" : "-"}LKR{" "}
                      {transaction.amount.toLocaleString()}
                    </p>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      {transaction.status === "completed" ? (
                        <span className="inline-flex items-center gap-1 text-xs text-green-600">
                          <CheckCircle className="w-3 h-3" />
                          Completed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-yellow-600">
                          <AlertCircle className="w-3 h-3" />
                          Processing
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Date */}
                  <div className="text-sm text-gray-500 w-28 text-right">
                    {formatDate(transaction.date)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Withdraw Funds</h2>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-teal-50 rounded-lg p-4">
                <p className="text-sm text-teal-700">Available Balance</p>
                <p className="text-2xl font-bold text-teal-800">
                  LKR {availableBalance.toLocaleString()}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Withdrawal Amount (LKR)
                </label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Payout to:</p>
                <p className="font-medium text-gray-900">Commercial Bank ****1234</p>
              </div>

              <p className="text-xs text-gray-500">
                Withdrawals are processed within 2-3 business days. Minimum withdrawal: LKR 5,000
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                disabled={!withdrawAmount || Number(withdrawAmount) < 5000}
                className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium disabled:opacity-50"
              >
                Request Withdrawal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
