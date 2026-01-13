import { CheckResult } from '../scanner.types';

const CATEGORY = 'headers';
const REQUEST_TIMEOUT_MS = 10_000;

export async function runHeadersCheck(url: string): Promise<CheckResult[]> {
  const results: CheckResult[] = [];

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
    });
  } catch (error) {
    clearTimeout(timeoutId);
    const message =
      error instanceof Error ? error.message : 'Unknown fetch error';
    results.push({
      category: CATEGORY,
      checkName: 'HTTP-Reachability',
      severity: 'CRITICAL',
      value: null,
      expected: 'Site should be reachable',
      message: `Failed to reach the site: ${message}`,
      recommendation:
        'Verify that the URL is correct and the server is running and publicly accessible.',
    });
    return results;
  } finally {
    clearTimeout(timeoutId);
  }

  const get = (name: string): string | null => response.headers.get(name);

  // ------------------------------------------------------------------
  // Strict-Transport-Security (HSTS)
  // ------------------------------------------------------------------
  const hsts = get('strict-transport-security');
  if (!hsts) {
    results.push({
      category: CATEGORY,
      checkName: 'Strict-Transport-Security',
      severity: 'CRITICAL',
      value: null,
      expected: 'max-age=31536000; includeSubDomains',
      message: 'HSTS header is missing. Browsers cannot enforce HTTPS.',
      recommendation:
        'Add the Strict-Transport-Security header with a max-age of at least 31536000 (1 year) and includeSubDomains directive.',
    });
  } else {
    const maxAgeMatch = hsts.match(/max-age=(\d+)/i);
    const maxAge = maxAgeMatch ? parseInt(maxAgeMatch[1], 10) : 0;

    results.push({
      category: CATEGORY,
      checkName: 'Strict-Transport-Security',
      severity: maxAge >= 31_536_000 ? 'PASS' : 'WARNING',
      value: hsts,
      expected: 'max-age=31536000; includeSubDomains',
      message:
        maxAge >= 31_536_000
          ? 'HSTS header is properly configured.'
          : `HSTS max-age is ${maxAge}, which is less than the recommended 31536000 (1 year).`,
      recommendation:
        maxAge >= 31_536_000
          ? null
          : 'Increase the HSTS max-age to at least 31536000 seconds (1 year) and consider adding includeSubDomains and preload directives.',
    });
  }

  // ------------------------------------------------------------------
  // Content-Security-Policy
  // ------------------------------------------------------------------
  const csp = get('content-security-policy');
  results.push({
    category: CATEGORY,
    checkName: 'Content-Security-Policy',
    severity: csp ? 'PASS' : 'WARNING',
    value: csp,
    expected: 'A well-defined CSP policy',
    message: csp
      ? 'Content-Security-Policy header is present.'
      : 'Content-Security-Policy header is missing, leaving the site vulnerable to XSS and injection attacks.',
    recommendation: csp
      ? null
      : "Define a Content-Security-Policy header that restricts resource origins. Start with a restrictive policy such as \"default-src 'self'\" and expand as needed.",
  });

  // ------------------------------------------------------------------
  // X-Frame-Options
  // ------------------------------------------------------------------
  const xfo = get('x-frame-options');
  const xfoValid =
    xfo !== null &&
    ['DENY', 'SAMEORIGIN'].includes(xfo.toUpperCase());
  results.push({
    category: CATEGORY,
    checkName: 'X-Frame-Options',
    severity: xfoValid ? 'PASS' : 'WARNING',
    value: xfo,
    expected: 'DENY or SAMEORIGIN',
    message: xfoValid
      ? 'X-Frame-Options header is properly configured.'
      : 'X-Frame-Options header is missing or misconfigured, making the site susceptible to clickjacking.',
    recommendation: xfoValid
      ? null
      : 'Set the X-Frame-Options header to DENY (if no framing is needed) or SAMEORIGIN.',
  });

  // ------------------------------------------------------------------
  // X-Content-Type-Options
  // ------------------------------------------------------------------
  const xcto = get('x-content-type-options');
  const xctoValid = xcto !== null && xcto.toLowerCase() === 'nosniff';
  results.push({
    category: CATEGORY,
    checkName: 'X-Content-Type-Options',
    severity: xctoValid ? 'PASS' : 'WARNING',
    value: xcto,
    expected: 'nosniff',
    message: xctoValid
      ? 'X-Content-Type-Options header is correctly set to nosniff.'
      : 'X-Content-Type-Options header is missing or not set to nosniff, allowing MIME-type sniffing.',
    recommendation: xctoValid
      ? null
      : 'Add the header X-Content-Type-Options: nosniff to prevent browsers from MIME-sniffing the content type.',
  });

  // ------------------------------------------------------------------
  // Referrer-Policy
  // ------------------------------------------------------------------
  const referrer = get('referrer-policy');
  results.push({
    category: CATEGORY,
    checkName: 'Referrer-Policy',
    severity: referrer ? 'PASS' : 'INFO',
    value: referrer,
    expected: 'strict-origin-when-cross-origin or stricter',
    message: referrer
      ? `Referrer-Policy is set to "${referrer}".`
      : 'Referrer-Policy header is missing. Browsers will use default referrer behavior.',
    recommendation: referrer
      ? null
      : 'Add a Referrer-Policy header such as "strict-origin-when-cross-origin" or "no-referrer" to control referrer information leakage.',
  });

  // ------------------------------------------------------------------
  // Permissions-Policy
  // ------------------------------------------------------------------
  const permissions = get('permissions-policy');
  results.push({
    category: CATEGORY,
    checkName: 'Permissions-Policy',
    severity: permissions ? 'PASS' : 'INFO',
    value: permissions,
    expected: 'A defined permissions policy',
    message: permissions
      ? 'Permissions-Policy header is present.'
      : 'Permissions-Policy header is missing. Browser features like camera, microphone, and geolocation are not explicitly restricted.',
    recommendation: permissions
      ? null
      : 'Add a Permissions-Policy header to restrict access to browser features, e.g. "camera=(), microphone=(), geolocation=()".',
  });

  // ------------------------------------------------------------------
  // X-Powered-By (should be absent)
  // ------------------------------------------------------------------
  const poweredBy = get('x-powered-by');
  results.push({
    category: CATEGORY,
    checkName: 'X-Powered-By',
    severity: poweredBy ? 'WARNING' : 'PASS',
    value: poweredBy,
    expected: 'Absent',
    message: poweredBy
      ? `X-Powered-By header reveals technology: "${poweredBy}". This is an information leak.`
      : 'X-Powered-By header is absent, reducing information disclosure.',
    recommendation: poweredBy
      ? 'Remove the X-Powered-By header from server responses to avoid revealing the underlying technology stack.'
      : null,
  });

  // ------------------------------------------------------------------
  // Server header (should be minimal)
  // ------------------------------------------------------------------
  const server = get('server');
  const serverRevealsVersion =
    server !== null && /\d/.test(server);
  results.push({
    category: CATEGORY,
    checkName: 'Server',
    severity: serverRevealsVersion ? 'INFO' : 'PASS',
    value: server,
    expected: 'Absent or generic without version info',
    message: serverRevealsVersion
      ? `Server header reveals version information: "${server}".`
      : server
        ? `Server header is present but does not reveal version details: "${server}".`
        : 'Server header is absent, minimizing information disclosure.',
    recommendation: serverRevealsVersion
      ? 'Configure your web server to suppress or genericize the Server header, removing version numbers and detailed product names.'
      : null,
  });

  return results;
}
