import nodemailer from 'nodemailer';
import { config } from './index';

export const transporter = nodemailer.createTransport({
  host: config.SMTP_HOST,
  port: config.SMTP_PORT,
  secure: config.SMTP_PORT === 465,
  auth:
    config.SMTP_USER && config.SMTP_PASSWORD
      ? {
          user: config.SMTP_USER,
          pass: config.SMTP_PASSWORD,
        }
      : undefined,
});
