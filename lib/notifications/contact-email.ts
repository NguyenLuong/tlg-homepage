import "server-only";

import { ContactInquiryType, type ContactSubmission } from "@prisma/client";

const INQUIRY_TYPE_JP_LABEL: Record<ContactInquiryType, string> = {
  [ContactInquiryType.TECHNICAL_INTERN]: "技能実習生の採用について",
  [ContactInquiryType.SPECIFIED_SKILL]: "特定技能の採用について",
  [ContactInquiryType.OTHER]: "その他",
};

type SmtpConfig = {
  to: string;
  from: string;
  host: string;
  port: number;
  user: string;
  pass: string;
  secure: boolean;
};

function readConfig(): SmtpConfig | null {
  if (process.env.CONTACT_NOTIFICATION_ENABLED !== "true") return null;

  const to = process.env.CONTACT_NOTIFICATION_TO?.trim();
  const host = process.env.SMTP_HOST?.trim();
  const portRaw = process.env.SMTP_PORT?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM?.trim();

  if (!to || !host || !portRaw || !user || !pass || !from) {
    console.warn(
      "[contact] notification enabled but SMTP env vars are incomplete",
    );
    return null;
  }

  const port = Number.parseInt(portRaw, 10);
  if (!Number.isFinite(port)) {
    console.warn("[contact] invalid SMTP_PORT");
    return null;
  }

  return {
    to,
    from,
    host,
    port,
    user,
    pass,
    secure: port === 465,
  };
}

export async function sendContactNotification(
  submission: ContactSubmission,
): Promise<void> {
  const config = readConfig();
  if (!config) return;

  const nodemailer = await import("nodemailer");
  const transporter = nodemailer.default.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.user, pass: config.pass },
  });

  const subject = `[Contact] ${submission.name} 様より問い合わせが届きました`;
  const lines = [
    `Name: ${submission.name}`,
    `Furigana: ${submission.furigana}`,
    `Company: ${submission.company ?? "-"}`,
    `Email: ${submission.email}`,
    `Postal code: ${submission.postalCode}`,
    `Prefecture: ${submission.prefecture}`,
    `Address: ${submission.addressLine}`,
    `Inquiry type: ${INQUIRY_TYPE_JP_LABEL[submission.inquiryType]}`,
    `Locale: ${submission.locale ?? "-"}`,
    `Source: ${submission.sourcePage ?? "-"}`,
    `Submitted at: ${submission.createdAt.toISOString()}`,
    "",
    "-- Message --",
    submission.message,
  ];

  await transporter.sendMail({
    from: config.from,
    to: config.to,
    replyTo: submission.email,
    subject,
    text: lines.join("\n"),
  });
}
