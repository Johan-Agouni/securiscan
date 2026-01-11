export function scanCompleteTemplate(
  siteName: string,
  score: number,
  frontendUrl: string,
  scanId: string
): { subject: string; html: string } {
  const resultsLink = `${frontendUrl}/scans/${scanId}`;
  const subject = `Scan complete for ${siteName} - Score: ${score}/100`;

  const scoreColor = score >= 80 ? '#34a853' : score >= 50 ? '#fbbc04' : '#d93025';
  const scoreLabel = score >= 80 ? 'Good' : score >= 50 ? 'Needs Improvement' : 'Critical';

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Scan Complete</title>
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
              <h2 style="color:#333333;margin:0 0 16px;">Scan complete for ${siteName}</h2>
              <p style="color:#555555;font-size:16px;line-height:1.6;margin:0 0 24px;">
                Your security scan has finished. Here is a summary of the results:
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;border:1px solid #e8eaed;border-radius:6px;margin:0 0 24px;">
                <tr>
                  <td style="padding:32px;text-align:center;">
                    <p style="color:#555555;font-size:14px;margin:0 0 8px;">Security Score</p>
                    <p style="color:${scoreColor};font-size:48px;font-weight:bold;margin:0 0 8px;">${score}</p>
                    <p style="color:${scoreColor};font-size:16px;font-weight:bold;margin:0;">${scoreLabel}</p>
                  </td>
                </tr>
              </table>
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
                <tr>
                  <td style="border-radius:6px;background-color:#1a73e8;">
                    <a href="${resultsLink}" target="_blank" style="display:inline-block;padding:14px 32px;color:#ffffff;text-decoration:none;font-size:16px;font-weight:bold;">
                      View Full Results
                    </a>
                  </td>
                </tr>
              </table>
              <p style="color:#999999;font-size:13px;line-height:1.6;margin:0;">
                This is an automated notification from SecuriScan. Log in to your dashboard for detailed findings and remediation steps.
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
