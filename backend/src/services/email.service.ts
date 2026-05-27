import { sendMail } from "../config/mail";

export interface PasswordResetEmailInput {
  to: string;
  firstName?: string;
  resetUrl: string;
}

const appName = "InterviewAce";

export const sendPasswordResetEmail = async ({
  to,
  firstName,
  resetUrl,
}: PasswordResetEmailInput) => {
  const greetingName = firstName ? ` ${firstName}` : "";
  const subject = `${appName} Password Reset`;

  const text = [
    `Hi${greetingName},`,
    "",
    "We received a request to reset your password.",
    `Reset your password here: ${resetUrl}`,
    "",
    "If you did not request this, you can safely ignore this email.",
    "This link will expire soon for security reasons.",
  ].join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
      <h2 style="margin-bottom: 12px;">Reset your password</h2>
      <p>Hi${greetingName},</p>
      <p>We received a request to reset your password.</p>
      <p>
        <a href="${resetUrl}" style="display: inline-block; background: #4f46e5; color: white; text-decoration: none; padding: 10px 14px; border-radius: 8px;">
          Reset Password
        </a>
      </p>
      <p>If the button does not work, use this link:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>If you did not request this, you can safely ignore this email.</p>
      <p>This link will expire soon for security reasons.</p>
    </div>
  `;

  return sendMail({
    to,
    subject,
    text,
    html,
  });
};

export interface SessionNotificationInput {
  to: string;
  firstName: string;
  eventName: "payment_success" | "session_confirmed" | "session_rejected" | "session_auto_expired" | "session_cancelled_by_jobseeker";
  role: "job_seeker" | "interviewer";
  sessionDetails: {
    id: number;
    date: string;
    time: string;
    meetingLink?: string;
  };
}

export const sendSessionNotificationEmail = async ({
  to,
  firstName,
  eventName,
  role,
  sessionDetails,
}: SessionNotificationInput) => {
  let subject = "";
  let message = "";

  if (eventName === "payment_success") {
    if (role === "job_seeker") {
      subject = "Booking Awaiting Confirmation";
      message = `Your payment was successful. Your session is now awaiting the interviewer's confirmation.`;
    } else {
      subject = "New Booking Request";
      message = `You have a new booking request. Please check your dashboard to confirm or reject it.`;
    }
  } else if (eventName === "session_confirmed") {
    if (role === "job_seeker") {
      subject = "Session Confirmed!";
      message = `Great news! The interviewer has confirmed your session. Meeting Link: ${sessionDetails.meetingLink}`;
    } else {
      subject = "Session Confirmation Receipt";
      message = `You have successfully confirmed the session. Meeting Link: ${sessionDetails.meetingLink}`;
    }
  } else if (eventName === "session_rejected") {
    if (role === "job_seeker") {
      subject = "Session Rejected - Refund Initiated";
      message = `Unfortunately, the interviewer was unable to accept your booking. A full refund has been initiated.`;
    }
  } else if (eventName === "session_auto_expired") {
    if (role === "job_seeker") {
      subject = "Session Request Expired - Refund Initiated";
      message = `The interviewer did not respond within 48 hours. Your request has expired and a full refund has been initiated.`;
    } else {
      subject = "Session Request Expired";
      message = `A pending booking request has expired because it was not confirmed within 48 hours.`;
    }
  } else if (eventName === "session_cancelled_by_jobseeker") {
    if (role === "interviewer") {
      subject = "Session Cancelled by Candidate";
      message = `The candidate has cancelled their pending session request.`;
    }
  }

  if (!subject) return;

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
      <h2 style="margin-bottom: 12px;">${subject}</h2>
      <p>Hi ${firstName},</p>
      <p>${message}</p>
      <div style="margin-top: 20px; padding: 15px; background: #f8fafc; border-radius: 8px;">
        <p style="margin: 0;"><strong>Session ID:</strong> #${sessionDetails.id}</p>
        <p style="margin: 0;"><strong>Date:</strong> ${sessionDetails.date}</p>
        <p style="margin: 0;"><strong>Time:</strong> ${sessionDetails.time}</p>
      </div>
    </div>
  `;

  return sendMail({
    to,
    subject: `[${appName}] ${subject}`,
    text: message,
    html,
  });
};

export default {
  sendPasswordResetEmail,
  sendSessionNotificationEmail,
};