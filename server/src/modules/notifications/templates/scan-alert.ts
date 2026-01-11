export function scanAlertTemplate(
  siteName: string,
  siteUrl: string,
  score: number,
  criticalCount: number
): { subject: string; html: string } {
  const subject = `Security Alert: ${criticalCount} critical issue${criticalCount !== 1 ? 's' : ''} found on ${siteName}`;

  const scoreColor = score >= 80 ? '#34a853' : score >= 50 ? '#fbbc04' : '#d93025';

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Security Alert</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f7fa;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f7fa;padding:40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;">
          <tr>
            <td style="background-color:#d93025;padding:32px;text-align:center;">
              <h1 style="color:#ffffff;margin:0;font-size:28px;">Security Alert</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 32px;">
              <h2 style="color:#333333;margin:0 0 16px;">Critical issues detected</h2>
              <p style="color:#555555;font-size:16px;line-height:1.6;margin:0 0 24px;">
                A recent scan of your site has detected critical security issues that require your immediate attention.
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#fef7f6;border:1px solid #f5c6cb;border-radius:6px;margin:0 0 24px;">
                <tr>
                  <td style="padding:24px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="color:#555555;font-size:14px;padding:4px 0;">
                          <strong>Site:</strong> ${siteName}
                        </td>
                      </tr>
                      <tr>
                        <td style="color:#555555;font-size:14px;padding:4px 0;">
                          <strong>URL:</strong> ${siteUrl}
                        </td>
                      </tr>
                      <tr>
                        <td style="color:#555555;font-size:14px;padding:4px 0;">
                          <strong>Security Score:</strong>
                          <span style="color:${scoreColor};font-weight:bold;font-size:18px;">${score}/100</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="color:#d93025;font-size:14px;padding:4px 0;">
                          <strong>Critical Issues:</strong> ${criticalCount}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <p style="color:#555555;font-size:16px;line-height:1.6;margin:0 0 24px;">
                We recommend reviewing these issues as soon as possible to protect your site and its users.
              </p>
              <p style="color:#999999;font-size:13px;line-height:1.6;margin:0;">
                Log in to your SecuriScan dashboard for full details and remediation guidance.
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
