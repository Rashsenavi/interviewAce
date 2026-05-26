"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { paymentApi } from "@/lib/api";
import {
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  CreditCard,
  ArrowRight,
  Loader2,
} from "lucide-react";

type PaymentStatus = "loading" | "success" | "pending" | "failed" | "cancelled" | "unknown";

function BookingConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const sessionId = searchParams.get("session_id");

  const [status, setStatus] = useState<PaymentStatus>("loading");
  const [payment, setPayment] = useState<any>(null);
  const [pollCount, setPollCount] = useState(0);

  useEffect(() => {
    if (!orderId) {
      setStatus("unknown");
      return;
    }

    // Poll for payment status — PayHere webhook may take a few seconds
    const checkStatus = async () => {
      try {
        const res = await paymentApi.getByOrderId(orderId);
        if (res.success && res.data?.payment) {
          const p = res.data.payment;
          setPayment(p);
          if (p.paymentStatus === "held" || p.paymentStatus === "completed") {
            setStatus("success");
            return true;
          } else if (p.paymentStatus === "failed") {
            setStatus("failed");
            return true;
          } else if (p.paymentStatus === "cancelled") {
            setStatus("cancelled");
            return true;
          }
        }
      } catch {
        // Ignore polling errors
      }
      return false;
    };

    // Check immediately, then poll every 3 seconds up to 10 times
    let interval: NodeJS.Timeout;
    checkStatus().then((done) => {
      if (!done) {
        let count = 0;
        interval = setInterval(async () => {
          count++;
          setPollCount(count);
          const isDone = await checkStatus();
          if (isDone || count >= 10) {
            clearInterval(interval);
            if (!isDone) setStatus("pending");
          }
        }, 3000);
      }
    });

    return () => clearInterval(interval);
  }, [orderId]);

  const renderIcon = () => {
    switch (status) {
      case "loading":
        return <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />;
      case "success":
        return <CheckCircle className="w-16 h-16 text-green-500" />;
      case "pending":
        return <Clock className="w-16 h-16 text-yellow-500" />;
      case "failed":
      case "cancelled":
        return <XCircle className="w-16 h-16 text-red-500" />;
      default:
        return <Clock className="w-16 h-16 text-gray-400" />;
    }
  };

  const renderTitle = () => {
    switch (status) {
      case "loading":
        return "Verifying Payment…";
      case "success":
        return "Booking Confirmed! 🎉";
      case "pending":
        return "Payment Processing";
      case "failed":
        return "Payment Failed";
      case "cancelled":
        return "Payment Cancelled";
      default:
        return "Payment Status Unknown";
    }
  };

  const renderMessage = () => {
    switch (status) {
      case "loading":
        return `We're confirming your payment with PayHere${pollCount > 0 ? ` (checking… ${pollCount}/10)` : ""}`;
      case "success":
        return "Your payment was successful and your session is now booked. The interviewer will review your request shortly.";
      case "pending":
        return "Your payment is still being processed. This usually takes a few minutes. Check your payment history for updates.";
      case "failed":
        return "Your payment could not be processed. Please try again or use a different payment method.";
      case "cancelled":
        return "You cancelled the payment. Your session booking has not been confirmed.";
      default:
        return "We couldn't find your payment details. Please check your payment history.";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
        {/* Colored top band */}
        <div
          className={`h-2 w-full ${
            status === "success"
              ? "bg-green-500"
              : status === "loading" || status === "pending"
              ? "bg-blue-500"
              : "bg-red-500"
          }`}
        />

        <div className="p-8 text-center">
          {/* Icon */}
          <div className="flex justify-center mb-6">{renderIcon()}</div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-3">{renderTitle()}</h1>

          {/* Message */}
          <p className="text-gray-600 mb-6">{renderMessage()}</p>

          {/* Payment Details (if available) */}
          {payment && status === "success" && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-left space-y-2">
              <div className="flex items-center gap-2 text-sm text-green-800">
                <CreditCard className="w-4 h-4 shrink-0" />
                <span>
                  Amount: <strong>{payment.currency || "LKR"} {parseFloat(payment.amount || "0").toLocaleString()}</strong>
                </span>
              </div>
              {payment.payhereTransactionId && (
                <div className="flex items-center gap-2 text-sm text-green-700">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>Transaction ID: <strong>{payment.payhereTransactionId}</strong></span>
                </div>
              )}
              {orderId && (
                <div className="flex items-center gap-2 text-sm text-green-700">
                  <Calendar className="w-4 h-4 shrink-0" />
                  <span>Order ID: <strong>{orderId}</strong></span>
                </div>
              )}
            </div>
          )}

          {/* Refund policy info for pending */}
          {(status === "success" || status === "pending") && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6 text-xs text-blue-700 text-left">
              <p className="font-semibold mb-1">💡 Cancellation Policy</p>
              <p>• Cancel 24h+ before session → Full refund</p>
              <p>• Cancel 2–24h before session → 50% refund</p>
              <p>• Cancel within 2h → No refund</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            {status === "success" && (
              <>
                <Link
                  href="/job-seeker/sessions"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  View My Sessions
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/job-seeker/payments"
                  className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 px-6 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  View Payments
                </Link>
              </>
            )}

            {status === "pending" && (
              <Link
                href="/job-seeker/payments"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                Check Payment History
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}

            {(status === "failed" || status === "cancelled") && (
              <>
                <Link
                  href="/job-seeker/interviewers"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  Try Again
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/job-seeker"
                  className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 px-6 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  Go to Dashboard
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookingConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        </div>
      }
    >
      <BookingConfirmationContent />
    </Suspense>
  );
}
