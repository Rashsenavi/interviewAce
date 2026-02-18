export enum PaymentStatus {
  PENDING = "pending",
  HELD = "held",
  COMPLETED = "completed",
  FAILED = "failed",
  REFUNDED = "refunded",
  CANCELLED = "cancelled",
}

export enum PaymentMethod {
  PAYHERE = "payhere",
  BANK_TRANSFER = "bank_transfer",
  CARD = "card",
}

export interface Payment {
  id: number;
  sessionId: number;
  jobSeekerId: number;
  interviewerId: number;
  amount: number;
  platformCommission: number;
  interviewerPayout: number;
  currency: string; // LKR, USD
  paymentMethod?: string;
  payhereTransactionId?: string;
  paymentStatus: PaymentStatus;
  refundAmount?: number;
  refundReason?: string;
  paymentDate?: Date;
  refundDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePaymentRequest {
  sessionId: number;
  amount: number;
  currency?: string;
}

export interface PaymentVerificationRequest {
  paymentId: number;
  transactionId: string;
}

export interface PayHerePaymentRequest {
  merchant_id: string;
  return_web: string;
  cancel_url: string;
  notify_url: string;
  order_id: string;
  items: string;
  amount: number;
  currency: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  hash: string;
}

export interface PayHerePaymentResponse {
  status: number;
  msg: string;
  data: {
    order_id: string;
  };
}
