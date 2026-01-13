/**
 * Static recommendation texts keyed by check name.
 *
 * These are used as fallback recommendations when the individual check
 * functions do not provide one inline.
 */
export const RECOMMENDATIONS: Record<string, string> = {
  // ── Headers ──────────────────────────────────────────────────────────
  'Strict-Transport-Security':
    'Add the Strict-Transport-Security header with a max-age of at least 31536000 (1 year) and include the includeSubDomains directive. Consider HSTS preloading via hstspreload.org.',
  'Content-Security-Policy':
    "Define a Content-Security-Policy header that restricts resource origins. Start with a restrictive default such as \"default-src 'self'\" and iteratively allow only the domains your application requires.",
  'X-Frame-Options':
    'Set the X-Frame-Options header to DENY if your pages should never be framed, or SAMEORIGIN if they may be framed only by your own origin.',
  'X-Content-Type-Options':
    'Add the header X-Content-Type-Options: nosniff to prevent browsers from MIME-sniffing the response content type.',
  'Referrer-Policy':
    'Add a Referrer-Policy header such as "strict-origin-when-cross-origin" or "no-referrer" to limit how much referrer information is shared.',
  'Permissions-Policy':
    'Add a Permissions-Policy header to restrict access to sensitive browser features, e.g. "camera=(), microphone=(), geolocation=()".',
  'X-Powered-By':
    'Remove the X-Powered-By header from responses to prevent revealing your server technology stack to potential attackers.',
  Server:
    'Configure your web server to suppress or minimize the Server header, removing version numbers and detailed product names.',
  'HTTP-Reachability':
    'Verify that the URL is correct and the server is running and publicly accessible.',

  // ── SSL / TLS ────────────────────────────────────────────────────────
  'SSL-Availability':
    "Enable SSL/TLS on your web server. Obtain a certificate from a trusted Certificate Authority such as Let's Encrypt (free) and configure port 443.",
  'SSL-Certificate-Valid':
    "Replace the current certificate with one issued by a trusted Certificate Authority. Let's Encrypt provides free, automated certificates.",
  'SSL-Certificate-Expiry':
    "Renew your SSL certificate before it expires. Consider using an automated renewal tool such as certbot with Let's Encrypt.",
  'TLS-Protocol-Version':
    'Configure your server to only accept TLS 1.2 and TLS 1.3. Disable all older protocol versions including SSLv3, TLS 1.0, and TLS 1.1.',
  'HTTP-to-HTTPS-Redirect':
    'Configure your web server to redirect all HTTP (port 80) traffic to HTTPS (port 443) with a 301 permanent redirect.',

  // ── OWASP ────────────────────────────────────────────────────────────
  'Cookie-Security':
    'Ensure all cookies are set with the HttpOnly, Secure, and SameSite flags. HttpOnly prevents JavaScript access, Secure ensures HTTPS-only transmission, and SameSite mitigates CSRF attacks.',
  'Information-Disclosure':
    'Configure custom error pages for all HTTP error codes. Ensure that stack traces, framework details, and debug information are never exposed in production.',
  'HTTP-Methods':
    'Disable or restrict HTTP methods that are not required. TRACE should always be disabled. PUT and DELETE should only be available on authenticated API endpoints.',
  'Mixed-Content-Redirect':
    'Ensure all redirects within your domain remain on HTTPS. Update redirect rules so no hop downgrades to plain HTTP.',

  // ── Performance ──────────────────────────────────────────────────────
  'Response-Time':
    'Optimize server response time by enabling caching, using a CDN, optimizing database queries, and reviewing application-level performance bottlenecks.',
  'HTTP-Status-Code':
    'Investigate the non-200 HTTP status code. For 5xx errors, check application logs and server health. For 4xx errors, verify the URL and resource availability.',
  'Response-Size':
    'Reduce page size by minifying HTML/CSS/JS, optimizing images, lazy-loading non-critical resources, and removing unused assets.',
  Compression:
    'Enable gzip or Brotli compression on your web server. Most modern servers (nginx, Apache, Caddy) support this with a simple configuration directive.',
};

/**
 * Return an actionable recommendation for a given check, or null if the
 * result does not warrant one (PASS and INFO severities are considered
 * acceptable).
 */
export function getRecommendation(
  checkName: string,
  severity: string,
): string | null {
  if (severity === 'PASS' || severity === 'INFO') {
    return null;
  }

  // Some check names are dynamic (e.g. Cookie-Security-session_id).
  // Try exact match first, then try prefix-based lookup.
  if (RECOMMENDATIONS[checkName]) {
    return RECOMMENDATIONS[checkName];
  }

  // Prefix match for dynamic check names like "Cookie-Security-<name>".
  for (const key of Object.keys(RECOMMENDATIONS)) {
    if (checkName.startsWith(key)) {
      return RECOMMENDATIONS[key];
    }
  }

  return null;
}
