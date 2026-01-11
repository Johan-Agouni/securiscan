import { transporter } from '../../config/email';
import { config } from '../../config';
import { logger } from '../../utils/logger';

export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<void> {
  try {
    await transporter.sendMail({
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
