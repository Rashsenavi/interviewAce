"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  CreditCard,
  Wallet,
  Receipt,
  Download,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Search,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { paymentApi } from "@/lib/api";

type PaymentStatus = "completed" | "pending" | "failed" | "refunded" | "held" | "cancelled";

interface Payment {
  id: number;
  sessionId: number;
  amount: number;
  currency: string;
  paymentMethod: string | null;
  payhereTransactionId: string | null;
  paymentStatus: PaymentStatus;
  refundAmount: number | null;
  refundReason: string | null;
  paymentDate: string | null;
  createdAt: string;
  session: {
    type: string;
    date: string;
    status: string;
  };
  interviewer: {
    userId: number;
    firstName: string;
    lastName: string;
    jobTitle: string;
    company: string;
  };
}

const SESSION_TYPE_LABELS: Record<string, string> = {
  behavioral: "Behavioral Interview",
  technical: "Technical Interview",
  case_study: "Case Study",
  mixed: "Mixed Interview",
};

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getStatusBadge(status: PaymentStatus) {
  switch (status) {
    case "completed":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
          <CheckCircle className="w-3 h-3" />
          Completed
        </span>
      );
    case "pending":
    case "held":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs font-medium">
          <AlertCircle className="w-3 h-3" />
          Pending
        </span>
      );
    case "failed":
    case "cancelled":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-700 rounded-full text-xs font-medium">
          <XCircle className="w-3 h-3" />
          {status === "failed" ? "Failed" : "Cancelled"}
        </span>
      );
    case "refunded":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
          <Receipt className="w-3 h-3" />
          Refunded
        </span>
      );
    default:
      return null;
  }
}

function PaymentsContent() {
  const searchParams = useSearchParams();
  const purchaseSuccess = searchParams.get("purchase_success") === "true";

  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<PaymentStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [packageBalance, setPackageBalance] = useState<number | null>(null);
  const [buyingPackageId, setBuyingPackageId] = useState<number | null>(null);

  const [purchaseMessage, setPurchaseMessage] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [res, balRes] = await Promise.all([
          paymentApi.getAll(),
          paymentApi.getPackageBalance(),
        ]);

        if (res.success && res.data?.payments) {
          setPayments(res.data.payments as Payment[]);
        } else {
          setError(res.error?.message || "Failed to load payment history");
        }

        if (balRes.success && balRes.data) {
          setPackageBalance(balRes.data.balance);
        }
      } catch {
        setError("An error occurred. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Handle return from PayHere package purchase — call verify endpoint as webhook fallback
  useEffect(() => {
    const orderId = searchParams.get("order_id");
    if (!purchaseSuccess || !orderId || !orderId.startsWith("PKG_")) return;

    const verifyAndCredit = async () => {
      try {
        const res = await paymentApi.verifyPackagePurchase(orderId);
        if (res.success && res.data) {
          if (res.data.credited) {
            setPurchaseMessage(`🎉 ${res.data.credits} session credit${(res.data.credits ?? 0) > 1 ? "s" : ""} from "${res.data.packageName}" have been added to your account!`);
          } else {
            setPurchaseMessage("Your package credits are ready — the payment was already processed.");
          }
          // Re-fetch balance to show updated count
          const balRes = await paymentApi.getPackageBalance();
          if (balRes.success && balRes.data) {
            setPackageBalance(balRes.data.balance);
          }
        }
      } catch {
        // Ignore — webhook may have already processed it
      }
    };

    verifyAndCredit();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [purchaseSuccess]);

  const handleBuyPackage = async (packageId: number) => {
    setBuyingPackageId(packageId);
    setError(null);
    try {
      const response = await paymentApi.initiatePackagePurchase(packageId);
      if (response.success && response.data) {
        const { checkoutUrl, formParams } = response.data;
        const form = document.createElement("form");
        form.method = "POST";
        form.action = checkoutUrl;
        Object.entries(formParams).forEach(([key, value]) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = value as string;
          form.appendChild(input);
        });
        document.body.appendChild(form);
        form.submit();
      } else {
        setError(response.error?.message || "Failed to initiate package purchase");
        setBuyingPackageId(null);
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred. Please try again.");
      setBuyingPackageId(null);
    }
  };

  const completedPayments = payments.filter((p) => p.paymentStatus === "completed");
  const totalSpent = completedPayments.reduce((acc, p) => acc + p.amount, 0);
  const totalPayments = completedPayments.length;
  const refundedAmount = payments
    .filter((p) => p.paymentStatus === "refunded")
    .reduce((acc, p) => acc + (p.refundAmount ?? p.amount), 0);
  const avgPerSession = totalPayments > 0 ? totalSpent / totalPayments : 0;

  const filteredPayments = payments.filter((payment) => {
    const matchesStatus = filterStatus === "all" || payment.paymentStatus === filterStatus;
    const interviewerName = `${payment.interviewer.firstName} ${payment.interviewer.lastName}`;
    const matchesSearch = interviewerName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="w-full">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payments & Billing</h1>
        <p className="text-gray-600">View your payment history, manage package credits, and download receipts</p>
      </div>

      {purchaseSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6 text-emerald-800 text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <p className="font-semibold">Package Purchased Successfully! 🎉</p>
            <p className="text-emerald-700 mt-0.5">
              {purchaseMessage || "Verifying your credits... please wait a moment."}
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Session Credits Balance Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white mb-8 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold mb-1">Your Session Credits</h2>
          <p className="text-blue-100 text-sm font-light">
            Use your active package credits to book mock interviews with any interviewer instantly.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white/10 px-4 py-3 rounded-xl backdrop-blur-sm">
          <Wallet className="w-6 h-6 text-blue-100" />
          <div>
            <p className="text-3xl font-extrabold leading-none">
              {packageBalance === null ? "—" : packageBalance}
            </p>
            <p className="text-xs text-blue-200 mt-1 font-medium">Credits Available</p>
          </div>
        </div>
      </div>

      {/* Package Purchase Section */}
      <div className="mb-10">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900">Session Packages</h2>
          <p className="text-sm text-gray-500">Buy session credits in bulk to save on interview preparation.</p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              id: 1,
              name: "Starter",
              price: "LKR 2,500",
              meta: "1 session credit",
              validity: "Valid for 30 days",
              points: ["1 live mock interview", "Summary feedback", "Basic action plan"],
              cta: "Buy Starter Pack",
              highlighted: false,
            },
            {
              id: 2,
              name: "Growth",
              price: "LKR 12,000",
              meta: "5 session credits",
              validity: "Valid for 90 days",
              points: ["Save LKR 500 total", "Role-focused tracks", "Detailed feedback summary", "Progress trend view"],
              cta: "Buy Growth Pack",
              highlighted: true,
            },
            {
              id: 3,
              name: "Career Sprint",
              price: "LKR 20,000",
              meta: "10 session credits",
              validity: "Valid for 180 days",
              points: ["Save LKR 5,000 total", "Full prep cycle", "Priority slots booking", "Comprehensive plan"],
              cta: "Buy Sprint Pack",
              highlighted: false,
            },
          ].map((pkg) => (
            <div
              key={pkg.id}
              className={`rounded-2xl border p-6 flex flex-col justify-between transition-all duration-200 ${
                pkg.highlighted
                  ? "border-blue-500 bg-white shadow-lg relative overflow-hidden"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              {pkg.highlighted && (
                <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                  Popular
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{pkg.name}</p>
                <p className="mt-2 text-3xl font-extrabold text-gray-900">{pkg.price}</p>
                <p className="mt-1 text-sm font-medium text-blue-600">{pkg.meta}</p>
                <p className="text-xs text-gray-400 mt-0.5">{pkg.validity}</p>

                <ul className="mt-6 space-y-3 text-sm text-gray-600">
                  {pkg.points.map((point) => (
                    <li key={point} className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                disabled={buyingPackageId !== null}
                onClick={() => handleBuyPackage(pkg.id)}
                className={`mt-8 w-full py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-150 flex items-center justify-center gap-2 ${
                  pkg.highlighted
                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg disabled:bg-blue-400"
                    : "bg-gray-50 hover:bg-gray-100 text-gray-800 border border-gray-200 disabled:bg-gray-100"
                }`}
              >
                {buyingPackageId === pkg.id ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Redirecting to PayHere...
                  </>
                ) : (
                  pkg.cta
                )}
              </button>
            </div>
          ))}
        </div>
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
                {loading ? "—" : `LKR ${totalSpent.toLocaleString()}`}
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
              <p className="text-2xl font-bold text-gray-900">
                {loading ? "—" : totalPayments}
              </p>
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
                {loading ? "—" : totalPayments > 0 ? `LKR ${Math.round(avgPerSession).toLocaleString()}` : "—"}
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
                {loading ? "—" : `LKR ${refundedAmount.toLocaleString()}`}
              </p>
              <p className="text-sm text-gray-500">Refunded</p>
            </div>
          </div>
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
              {["all", "completed", "pending", "refunded", "failed"].map((status) => (
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
              placeholder="Search by interviewer…"
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
          {loading ? (
            <div className="p-12 text-center text-gray-400 text-sm">Loading payment history…</div>
          ) : filteredPayments.length === 0 ? (
            <div className="p-12 text-center">
              <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {payments.length === 0 ? "No payments yet" : "No payments found"}
              </h3>
              <p className="text-gray-500">
                {payments.length === 0
                  ? "Your payment history will appear here after booking a session."
                  : "No payments match your search criteria."}
              </p>
            </div>
          ) : (
            filteredPayments.map((payment) => {
              const interviewerName = `${payment.interviewer.firstName} ${payment.interviewer.lastName}`;
              const initials = `${payment.interviewer.firstName[0]}${payment.interviewer.lastName[0]}`;
              const isRefund = payment.paymentStatus === "refunded";

              return (
                <div key={payment.id} className="p-5 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold shrink-0">
                      {initials}
                    </div>

                    {/* Payment Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">{interviewerName}</h4>
                        <span className="text-gray-400">•</span>
                        <span className="text-sm text-gray-600">
                          {SESSION_TYPE_LABELS[payment.session.type] || payment.session.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Session: {formatDate(payment.session.date)}
                        </span>
                        {payment.paymentMethod && (
                          <span className="flex items-center gap-1">
                            <CreditCard className="w-4 h-4" />
                            {payment.paymentMethod}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Amount & Status */}
                    <div className="text-right">
                      <p
                        className={`text-lg font-bold ${
                          isRefund ? "text-blue-600" : "text-gray-900"
                        }`}
                      >
                        {isRefund ? "+" : "-"}{payment.currency}{" "}
                        {(isRefund ? (payment.refundAmount ?? payment.amount) : payment.amount).toLocaleString()}
                      </p>
                      <div className="flex items-center justify-end gap-2 mt-1">
                        {getStatusBadge(payment.paymentStatus)}
                      </div>
                    </div>

                    {/* Download action */}
                    <div className="flex items-center gap-2">
                      <button
                        title="Download receipt"
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {payment.payhereTransactionId
                        ? `Transaction: ${payment.payhereTransactionId}`
                        : `Payment #${payment.id}`}
                    </span>
                    <span className="text-xs text-gray-500">
                      {payment.paymentDate
                        ? `Paid on ${formatDate(payment.paymentDate)}`
                        : `Created ${formatDate(payment.createdAt)}`}
                    </span>
                  </div>

                  {payment.refundReason && (
                    <p className="text-xs text-blue-600 mt-1">
                      Refund reason: {payment.refundReason}
                    </p>
                  )}
                </div>
              );
            })
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

export default function PaymentsPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full py-12 flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-500 text-sm">Loading billing details...</p>
        </div>
      }
    >
      <PaymentsContent />
    </Suspense>
  );
}
