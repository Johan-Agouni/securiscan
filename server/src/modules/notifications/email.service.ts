import { Resend } from 'resend';
import { config } from '../../config';
import { logger } from '../../utils/logger';

const resend = config.RESEND_API_KEY
  ? new Resend(config.RESEND_API_KEY)
  : null;

export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<void> {
  if (!resend) {
    logger.warn('RESEND_API_KEY not configured, skipping email', {
      to,
      subject,
    });
    return;
  }

  try {
    await resend.emails.send({
      from: config.FROM_EMAIL,
      to,
      subject,
      html,
    });
  } catch (error) {
    logger.error('Failed to send email', {
      to,
      subject,
      error: error instanceof Error ? error.message : error,
    });
  }
}
