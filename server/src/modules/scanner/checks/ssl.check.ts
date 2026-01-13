import * as tls from 'node:tls';
import * as http from 'node:http';
import { CheckResult } from '../scanner.types';

const CATEGORY = 'ssl';
const CONNECTION_TIMEOUT_MS = 10_000;

/**
 * Extract hostname and determine original scheme from a URL string.
 */
function parseTarget(url: string): { hostname: string; isHttps: boolean } {
  const parsed = new URL(url);
  return {
    hostname: parsed.hostname,
    isHttps: parsed.protocol === 'https:',
  };
}

/**
 * Open a raw TLS socket to the host on port 443 and return the socket
 * along with certificate + protocol details.
 */
function connectTls(
  hostname: string,
): Promise<{
  socket: tls.TLSSocket;
  authorized: boolean;
  protocol: string | null;
  cert: tls.PeerCertificate;
}> {
  return new Promise((resolve, reject) => {
    const socket = tls.connect(
      443,
      hostname,
      { servername: hostname, rejectUnauthorized: false },
      () => {
        const cert = socket.getPeerCertificate();
        resolve({
          socket,
          authorized: socket.authorized,
          protocol: socket.getProtocol(),
          cert,
        });
      },
    );

    socket.setTimeout(CONNECTION_TIMEOUT_MS, () => {
      socket.destroy(new Error('TLS connection timed out'));
    });

    socket.on('error', (err) => reject(err));
  });
}

/**
 * Check whether an HTTP request to port 80 redirects to HTTPS.
 */
function checkHttpToHttpsRedirect(hostname: string): Promise<boolean> {
  return new Promise((resolve) => {
    const req = http.get(
      `http://${hostname}/`,
      { timeout: CONNECTION_TIMEOUT_MS },
      (res) => {
        const location = res.headers.location ?? '';
        const redirectsToHttps =
          (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307 || res.statusCode === 308) &&
          location.toLowerCase().startsWith('https');
        res.resume();
        resolve(redirectsToHttps);
      },
    );

    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
  });
}

export async function runSslCheck(url: string): Promise<CheckResult[]> {
  const results: CheckResult[] = [];
  const { hostname } = parseTarget(url);

  let authorized = false;
  let protocol: string | null = null;
  let cert: tls.PeerCertificate | null = null;

  try {
    const conn = await connectTls(hostname);
    authorized = conn.authorized;
    protocol = conn.protocol;
    cert = conn.cert;
    conn.socket.destroy();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown TLS error';
    results.push({
      category: CATEGORY,
      checkName: 'SSL-Availability',
      severity: 'CRITICAL',
      value: null,
      expected: 'TLS connection on port 443',
      message: `Could not establish a TLS connection to ${hostname}:443 - ${message}`,
      recommendation:
        'Enable SSL/TLS on your web server. Obtain a certificate from a trusted Certificate Authority such as Let\'s Encrypt (free) and configure port 443.',
    });
    return results;
  }

  // ------------------------------------------------------------------
  // Certificate validity
  // ------------------------------------------------------------------
  results.push({
    category: CATEGORY,
    checkName: 'SSL-Certificate-Valid',
    severity: authorized ? 'PASS' : 'CRITICAL',
    value: authorized ? 'Valid & trusted' : 'Invalid or untrusted',
    expected: 'Valid certificate signed by a trusted CA',
    message: authorized
      ? 'SSL certificate is valid and issued by a trusted Certificate Authority.'
      : 'SSL certificate is invalid or not trusted by the system root store.',
    recommendation: authorized
      ? null
      : 'Replace the current certificate with one issued by a trusted Certificate Authority. Let\'s Encrypt provides free, automated certificates.',
  });

  // ------------------------------------------------------------------
  // Certificate expiry
  // ------------------------------------------------------------------
  if (cert && cert.valid_to) {
    const expiryDate = new Date(cert.valid_to);
    const now = new Date();
    const daysUntilExpiry = Math.floor(
      (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );

    let severity: CheckResult['severity'];
    let message: string;

    if (daysUntilExpiry < 0) {
      severity = 'CRITICAL';
      message = `SSL certificate expired ${Math.abs(daysUntilExpiry)} day(s) ago on ${expiryDate.toISOString()}.`;
    } else if (daysUntilExpiry < 30) {
      severity = 'WARNING';
      message = `SSL certificate expires in ${daysUntilExpiry} day(s) on ${expiryDate.toISOString()}.`;
    } else if (daysUntilExpiry < 90) {
      severity = 'INFO';
      message = `SSL certificate expires in ${daysUntilExpiry} day(s) on ${expiryDate.toISOString()}.`;
    } else {
      severity = 'PASS';
      message = `SSL certificate is valid for ${daysUntilExpiry} more day(s), expiring on ${expiryDate.toISOString()}.`;
    }

    results.push({
      category: CATEGORY,
      checkName: 'SSL-Certificate-Expiry',
      severity,
      value: `${daysUntilExpiry} days remaining`,
      expected: '>= 90 days until expiry',
      message,
      recommendation:
        severity === 'PASS' || severity === 'INFO'
          ? null
          : 'Renew your SSL certificate as soon as possible. Consider using an automated renewal tool such as certbot with Let\'s Encrypt.',
      rawData: {
        expiryDate: expiryDate.toISOString(),
        daysUntilExpiry,
      },
    });
  }

  // ------------------------------------------------------------------
  // TLS protocol version
  // ------------------------------------------------------------------
  if (protocol) {
    const protocolNormalized = protocol.toUpperCase();

    let severity: CheckResult['severity'];
    let message: string;

    if (
      protocolNormalized.includes('TLSV1.3') ||
      protocolNormalized.includes('TLSV1.2')
    ) {
      severity = 'PASS';
      message = `Server negotiated ${protocol}, which is a modern and secure protocol.`;
    } else if (protocolNormalized.includes('TLSV1.1')) {
      severity = 'WARNING';
      message = `Server negotiated ${protocol}. TLS 1.1 is deprecated and should be disabled.`;
    } else {
      severity = 'CRITICAL';
      message = `Server negotiated ${protocol}. This protocol version is insecure and must be disabled.`;
    }

    results.push({
      category: CATEGORY,
      checkName: 'TLS-Protocol-Version',
      severity,
      value: protocol,
      expected: 'TLSv1.2 or TLSv1.3',
      message,
      recommendation:
        severity === 'PASS'
          ? null
          : 'Configure your server to only accept TLS 1.2 and TLS 1.3. Disable all older protocol versions (SSLv3, TLS 1.0, TLS 1.1).',
    });
  }

  // ------------------------------------------------------------------
  // HTTP to HTTPS redirect
  // ------------------------------------------------------------------
  const redirects = await checkHttpToHttpsRedirect(hostname);
  results.push({
    category: CATEGORY,
    checkName: 'HTTP-to-HTTPS-Redirect',
    severity: redirects ? 'PASS' : 'WARNING',
    value: redirects ? 'Redirects to HTTPS' : 'No redirect detected',
    expected: 'HTTP requests redirect to HTTPS',
    message: redirects
      ? 'HTTP requests are properly redirected to HTTPS.'
      : 'HTTP requests are not redirected to HTTPS, allowing unencrypted connections.',
    recommendation: redirects
      ? null
      : 'Configure your web server to redirect all HTTP (port 80) traffic to HTTPS (port 443) with a 301 permanent redirect.',
  });

  return results;
}
