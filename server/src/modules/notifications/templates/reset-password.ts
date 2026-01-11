export function resetPasswordTemplate(
  token: string,
  frontendUrl: string
): { subject: string; html: string } {
  const resetLink = `${frontendUrl}/reset-password?token=${token}`;
  const subject = 'Reset your password - SecuriScan';

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset Your Password</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f7fa;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f7fa;padding:40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;">
          <tr>
            <td style="background-color:#1a73e8;padding:32px;text-align:center;">
              <h1 style="color:#ffffff;margin:0;font-size:28px;">SecuriScan</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 32px;">
              <h2 style="color:#333333;margin:0 0 16px;">Reset your password</h2>
              <p style="color:#555555;font-size:16px;line-height:1.6;margin:0 0 24px;">
                We received a request to reset the password for your SecuriScan account. Click the button below to choose a new password.
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                <tr>
                  <td style="border-radius:6px;background-color:#1a73e8;">
                    <a href="${resetLink}" target="_blank" style="display:inline-block;padding:14px 32px;color:#ffffff;text-decoration:none;font-size:16px;font-weight:bold;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>
              <p style="color:#d93025;font-size:14px;line-height:1.6;margin:0 0 16px;font-weight:bold;">
                This link expires in 1 hour.
              </p>
              <p style="color:#555555;font-size:14px;line-height:1.6;margin:0 0 16px;">
                If the button above does not work, copy and paste the following link into your browser:
              </p>
              <p style="color:#1a73e8;font-size:14px;line-height:1.6;margin:0 0 24px;word-break:break-all;">
                ${resetLink}
              </p>
              <p style="color:#999999;font-size:13px;line-height:1.6;margin:0;">
                If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color:#f9fafb;padding:24px 32px;text-align:center;">
              <p style="color:#999999;font-size:13px;margin:0;">
                &copy; ${new Date().getFullYear()} SecuriScan. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, html };
}
