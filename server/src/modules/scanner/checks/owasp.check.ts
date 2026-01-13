import { CheckResult } from '../scanner.types';

const CATEGORY = 'owasp';
const REQUEST_TIMEOUT_MS = 10_000;

// Common framework error signatures that indicate information disclosure.
const ERROR_SIGNATURES = [
  'at Object.<anonymous>',
  'at Module._compile',
  'at Function.Module',
  'stack trace',
  'Traceback (most recent call last)',
  'Exception in thread',
  'Microsoft .NET Framework',
  'Server Error in',
  'Fatal error:',
  'Parse error:',
  'Warning:',
  'django.core.exceptions',
  'org.apache.catalina',
  'java.lang.NullPointerException',
  'SQLSTATE[',
  'pg_query()',
  'mysql_fetch',
  'Unhandled Exception',
  'RuntimeError',
  'SyntaxError:',
  'ReferenceError:',
  'TypeError:',
];

/**
 * Safely fetch a URL, returning null on failure.
 */
async function safeFetch(
  url: string,
  options: RequestInit = {},
): Promise<Response | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...options,
      redirect: 'follow',
      signal: controller.signal,
    });
    return response;
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Analyse Set-Cookie headers for security flags.
 */
function checkCookieSecurity(response: Response): CheckResult[] {
  const results: CheckResult[] = [];
  const setCookieHeaders = response.headers.getSetCookie?.() ?? [];

  // If there are no cookies there is nothing to evaluate.
  if (setCookieHeaders.length === 0) {
    results.push({
      category: CATEGORY,
      checkName: 'Cookie-Security',
      severity: 'PASS',
      value: 'No cookies set',
      expected: 'Cookies use HttpOnly, Secure, and SameSite flags',
      message: 'No Set-Cookie headers detected. Nothing to evaluate.',
      recommendation: null,
    });
    return results;
  }

  for (const cookie of setCookieHeaders) {
    const cookieName = cookie.split('=')[0]?.trim() || 'unknown';
    const lower = cookie.toLowerCase();

    const hasHttpOnly = lower.includes('httponly');
    const hasSecure = lower.includes('secure');
    const hasSameSite = lower.includes('samesite');

    const missingFlags: string[] = [];
    if (!hasHttpOnly) missingFlags.push('HttpOnly');
    if (!hasSecure) missingFlags.push('Secure');
    if (!hasSameSite) missingFlags.push('SameSite');

    if (missingFlags.length === 0) {
      results.push({
        category: CATEGORY,
        checkName: `Cookie-Security-${cookieName}`,
        severity: 'PASS',
        value: cookie,
        expected: 'HttpOnly; Secure; SameSite',
        message: `Cookie "${cookieName}" has all recommended security flags.`,
        recommendation: null,
      });
    } else {
      results.push({
        category: CATEGORY,
        checkName: `Cookie-Security-${cookieName}`,
        severity: 'WARNING',
        value: cookie,
        expected: 'HttpOnly; Secure; SameSite',
        message: `Cookie "${cookieName}" is missing flag(s): ${missingFlags.join(', ')}.`,
        recommendation: `Add the missing flag(s) (${missingFlags.join(', ')}) to the Set-Cookie header for "${cookieName}". HttpOnly prevents JavaScript access, Secure ensures HTTPS-only transmission, and SameSite mitigates CSRF attacks.`,
      });
    }
  }

  return results;
}

/**
 * Request a path that should not exist and inspect the error page.
 */
async function checkInformationDisclosure(
  baseUrl: string,
): Promise<CheckResult> {
  const testPath = '/nonexistent-path-test-404';
  const testUrl = new URL(testPath, baseUrl).toString();

  const response = await safeFetch(testUrl);

  if (!response) {
    return {
      category: CATEGORY,
      checkName: 'Information-Disclosure',
      severity: 'INFO',
      value: null,
      expected: 'Clean error page without stack traces',
      message:
        'Could not fetch the 404 test page. Unable to verify information disclosure.',
      recommendation: null,
    };
  }

  const body = await response.text();
  const detectedSignatures: string[] = [];

  for (const sig of ERROR_SIGNATURES) {
    if (body.includes(sig)) {
      detectedSignatures.push(sig);
    }
  }

  if (detectedSignatures.length > 0) {
    return {
      category: CATEGORY,
      checkName: 'Information-Disclosure',
      severity: 'WARNING',
      value: `Detected ${detectedSignatures.length} error signature(s)`,
      expected: 'Clean error page without stack traces',
      message: `Error page may reveal sensitive information. Detected framework error signatures: ${detectedSignatures.slice(0, 3).join(', ')}${detectedSignatures.length > 3 ? '...' : ''}.`,
      recommendation:
        'Configure custom error pages for all HTTP error codes. Ensure that stack traces, framework details, and debug information are never exposed in production.',
      rawData: { detectedSignatures },
    };
  }

  return {
    category: CATEGORY,
    checkName: 'Information-Disclosure',
    severity: 'PASS',
    value: `Status ${response.status}`,
    expected: 'Clean error page without stack traces',
    message:
      'Error page does not appear to reveal stack traces or framework details.',
    recommendation: null,
  };
}

/**
 * Send an OPTIONS request and inspect the Allow header for unsafe methods.
 */
async function checkHttpMethods(url: string): Promise<CheckResult> {
  const response = await safeFetch(url, { method: 'OPTIONS' });

  if (!response) {
    return {
      category: CATEGORY,
      checkName: 'HTTP-Methods',
      severity: 'INFO',
      value: null,
      expected: 'Only safe HTTP methods (GET, HEAD, POST, OPTIONS)',
      message:
        'Could not perform OPTIONS request. Unable to verify allowed HTTP methods.',
      recommendation: null,
    };
  }

  const allow = response.headers.get('allow') ?? '';
  const methods = allow
    .split(',')
    .map((m) => m.trim().toUpperCase())
    .filter(Boolean);

  const unsafeMethods = ['PUT', 'DELETE', 'TRACE', 'PATCH'];
  const foundUnsafe = methods.filter((m) => unsafeMethods.includes(m));

  if (foundUnsafe.length > 0) {
    return {
      category: CATEGORY,
      checkName: 'HTTP-Methods',
      severity: 'WARNING',
      value: allow || null,
      expected: 'Only safe HTTP methods (GET, HEAD, POST, OPTIONS)',
      message: `Potentially unsafe HTTP methods are advertised: ${foundUnsafe.join(', ')}.`,
      recommendation:
        'Disable or restrict HTTP methods that are not required. TRACE should always be disabled. PUT and DELETE should only be available on authenticated API endpoints that require them.',
      rawData: { advertisedMethods: methods, unsafeMethods: foundUnsafe },
    };
  }

  return {
    category: CATEGORY,
    checkName: 'HTTP-Methods',
    severity: 'PASS',
    value: allow || 'No Allow header (methods not advertised)',
    expected: 'Only safe HTTP methods (GET, HEAD, POST, OPTIONS)',
    message:
      'No unsafe HTTP methods are advertised in the Allow header.',
    recommendation: null,
  };
}

/**
 * If the site uses HTTPS, verify that the redirect chain does not
 * downgrade to plain HTTP (mixed content at the transport level).
 */
async function checkMixedContentRedirect(
  url: string,
): Promise<CheckResult> {
  const parsed = new URL(url);

  if (parsed.protocol !== 'https:') {
    return {
      category: CATEGORY,
      checkName: 'Mixed-Content-Redirect',
      severity: 'INFO',
      value: 'Site is not served over HTTPS',
      expected: 'HTTPS without HTTP downgrades',
      message:
        'The provided URL uses HTTP. Mixed-content redirect check is not applicable.',
      recommendation:
        'Serve your site over HTTPS to protect data in transit.',
    };
  }

  // Perform a fetch with redirect: 'manual' so we can inspect each hop.
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let hasMixedRedirect = false;
  let currentUrl = url;
  const maxHops = 10;

  try {
    for (let i = 0; i < maxHops; i++) {
      const res = await fetch(currentUrl, {
        method: 'GET',
        redirect: 'manual',
        signal: controller.signal,
      });

      const location = res.headers.get('location');
      if (
        !location ||
        (res.status !== 301 &&
          res.status !== 302 &&
          res.status !== 307 &&
          res.status !== 308)
      ) {
        break;
      }

      // Resolve relative redirects.
      const nextUrl = new URL(location, currentUrl);

      if (nextUrl.protocol === 'http:') {
        hasMixedRedirect = true;
        break;
      }

      currentUrl = nextUrl.toString();
    }
  } catch {
    // Graceful degradation — if we cannot follow redirects, report INFO.
  } finally {
    clearTimeout(timeoutId);
  }

  return {
    category: CATEGORY,
    checkName: 'Mixed-Content-Redirect',
    severity: hasMixedRedirect ? 'WARNING' : 'PASS',
    value: hasMixedRedirect ? 'HTTP downgrade detected' : 'No HTTP downgrade',
    expected: 'HTTPS without HTTP downgrades',
    message: hasMixedRedirect
      ? 'The HTTPS redirect chain includes at least one hop to an insecure HTTP URL.'
      : 'The redirect chain stays on HTTPS throughout.',
    recommendation: hasMixedRedirect
      ? 'Ensure all redirects within your domain remain on HTTPS. Update redirect rules so no hop downgrades to plain HTTP.'
      : null,
  };
}

export async function runOwaspCheck(url: string): Promise<CheckResult[]> {
  const results: CheckResult[] = [];

  // Cookie security requires the initial page response.
  const mainResponse = await safeFetch(url);
  if (mainResponse) {
    results.push(...checkCookieSecurity(mainResponse));
  } else {
    results.push({
      category: CATEGORY,
      checkName: 'Cookie-Security',
      severity: 'INFO',
      value: null,
      expected: 'Cookies use HttpOnly, Secure, and SameSite flags',
      message:
        'Could not fetch the target URL. Cookie security check skipped.',
      recommendation: null,
    });
  }

  // Run the remaining checks concurrently.
  const [infoDisclosure, httpMethods, mixedContent] = await Promise.all([
    checkInformationDisclosure(url),
    checkHttpMethods(url),
    checkMixedContentRedirect(url),
  ]);

  results.push(infoDisclosure, httpMethods, mixedContent);

  return results;
}
