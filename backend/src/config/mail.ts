import nodemailer from "nodemailer";

const MAIL_PROVIDER = process.env.MAIL_PROVIDER || "smtp";
const MAIL_FROM = process.env.MAIL_FROM || "no-reply@interviewace.local";
const APP_ENV = process.env.APP_ENV || process.env.NODE_ENV || "development";

if (MAIL_PROVIDER !== "smtp") {
console.warn("[Mail] Unsupported MAIL_PROVIDER, falling back to smtp");
}

const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpUser = process.env.SMTP_USER || "";
const smtpPass = process.env.SMTP_PASS || process.env.MAIL_API_KEY || "";
const smtpSecure = String(process.env.SMTP_SECURE || "false") === "true";

export const mailTransporter = nodemailer.createTransport({
host: smtpHost,
port: smtpPort,
secure: smtpSecure,
auth: smtpUser && smtpPass ? { user: smtpUser, pass: smtpPass } : undefined,
});

export const getMailFrom = () => MAIL_FROM;

export const isMailEnabled = () => {
if (APP_ENV === "development") {
return Boolean(smtpPass || process.env.MAIL_API_KEY);
}
return Boolean(smtpUser && smtpPass);
};

export interface SendMailInput {
to: string;
subject: string;
text: string;
html?: string;
}

export const sendMail = async (input: SendMailInput) => {
if (!isMailEnabled()) {
console.warn("[Mail] Mail is not enabled. Skipping send.");
if (APP_ENV === "development") {
console.log("\n==================================================");
console.log("📨 [DEV MAIL SIMULATOR] Email Content:");
console.log(`To:      ${input.to}`);
console.log(`Subject: ${input.subject}`);
console.log(`Message:\n${input.text}`);
console.log("==================================================\n");
}
return { skipped: true };
}

const result = await mailTransporter.sendMail({
from: getMailFrom(),
to: input.to,
subject: input.subject,
text: input.text,
html: input.html,
});

return { skipped: false, messageId: result.messageId };
};

