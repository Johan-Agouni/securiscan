export function welcomeEmailTemplate(firstName: string): {
  subject: string;
  html: string;
} {
  const subject = 'Welcome to SecuriScan';

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to SecuriScan</title>
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
              <h2 style="color:#333333;margin:0 0 16px;">Welcome, ${firstName}!</h2>
              <p style="color:#555555;font-size:16px;line-height:1.6;margin:0 0 24px;">
                Thank you for joining SecuriScan. We are excited to help you keep your websites secure.
              </p>
              <p style="color:#555555;font-size:16px;line-height:1.6;margin:0 0 24px;">
                With SecuriScan you can:
              </p>
              <ul style="color:#555555;font-size:16px;line-height:1.8;margin:0 0 24px;padding-left:20px;">
                <li>Add your websites for continuous security monitoring</li>
                <li>Run on-demand vulnerability scans</li>
                <li>Receive alerts when critical issues are detected</li>
                <li>Track your security score over time</li>
              </ul>
              <p style="color:#555555;font-size:16px;line-height:1.6;margin:0;">
                Get started by adding your first site from the dashboard.
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
