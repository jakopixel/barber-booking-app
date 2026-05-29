import nodemailer from 'nodemailer';
const tx = process.env.SMTP_HOST ? nodemailer.createTransport({
  host: process.env.SMTP_HOST, port: +process.env.SMTP_PORT || 587,
  auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined
}) : null;
export const notify = async (to, subject, text) => {
  if (tx && to) return tx.sendMail({ from: process.env.MAIL_FROM, to, subject, text });
  console.log('[notify]', to, subject, text);
};

