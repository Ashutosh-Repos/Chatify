import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error("SMTP configuration incomplete. Set SMTP_HOST, SMTP_USER, SMTP_PASS in .env");
  }

  transporter = nodemailer.createTransport({
    host,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user, pass },
  });

  return transporter;
}

export const sender = {
  get email() {
    return process.env.EMAIL_FROM || "noreply@chatify.com";
  },
  get name() {
    return process.env.EMAIL_FROM_NAME || "Chatify";
  },
};

export async function sendEmail(to: string, subject: string, html: string) {
  try {
    const transport = getTransporter();
    const info = await transport.sendMail({
      from: `${sender.name} <${sender.email}>`,
      to,
      subject,
      html,
    });
    console.log("Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}
