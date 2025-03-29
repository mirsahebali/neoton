import "dotenv/config";
import nodemailer from "nodemailer";

if (!process.env.SMTP_EMAIL_USERNAME)
  throw new Error("SMTP_EMAIL_USERNAME not set");

if (!process.env.SMTP_EMAIL_PASSWORD)
  throw new Error("SMTP_EMAIL_PASSWORD not set");

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_EMAIL_USERNAME,
    pass: process.env.SMTP_EMAIL_PASSWORD,
  },
});
