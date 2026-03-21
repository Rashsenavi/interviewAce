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

export default {
  sendPasswordResetEmail,
};