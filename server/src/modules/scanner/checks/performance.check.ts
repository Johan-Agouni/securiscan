import { CheckResult } from '../scanner.types';

const CATEGORY = 'performance';
const REQUEST_TIMEOUT_MS = 30_000; // generous timeout to capture slow responses

export async function runPerformanceCheck(
  url: string,
): Promise<CheckResult[]> {
  const results: CheckResult[] = [];

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  const startNs = process.hrtime.bigint();
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
      checkName: 'Response-Time',
      severity: 'CRITICAL',
      value: null,
      expected: '< 500 ms',
      message: `Request failed before a response was received: ${message}`,
      recommendation:
        'Ensure the server is online and responding within a reasonable time frame. Investigate network and infrastructure issues.',
    });
    return results;
  } finally {
    clearTimeout(timeoutId);
  }

  const endNs = process.hrtime.bigint();
  const ttfbMs = Number(endNs - startNs) / 1_000_000;

  // ------------------------------------------------------------------
  // Time To First Byte (TTFB)
  // ------------------------------------------------------------------
  let ttfbSeverity: CheckResult['severity'];
  if (ttfbMs < 500) {
    ttfbSeverity = 'PASS';
  } else if (ttfbMs < 1000) {
    ttfbSeverity = 'INFO';
  } else if (ttfbMs < 3000) {
    ttfbSeverity = 'WARNING';
  } else {
    ttfbSeverity = 'CRITICAL';
  }

  results.push({
    category: CATEGORY,
    checkName: 'Response-Time',
    severity: ttfbSeverity,
    value: `${Math.round(ttfbMs)} ms`,
    expected: '< 500 ms',
    message:
      ttfbSeverity === 'PASS'
        ? `Time to first byte is ${Math.round(ttfbMs)} ms, which is excellent.`
        : `Time to first byte is ${Math.round(ttfbMs)} ms, which is ${ttfbSeverity === 'INFO' ? 'acceptable but could be improved' : 'too slow'}.`,
    recommendation:
      ttfbSeverity === 'PASS'
        ? null
        : 'Optimize server response time by enabling caching, using a CDN, optimizing database queries, and reviewing application-level performance bottlenecks.',
    rawData: { ttfbMs: Math.round(ttfbMs) },
  });

  // ------------------------------------------------------------------
  // HTTP status code
  // ------------------------------------------------------------------
  const status = response.status;
  let statusSeverity: CheckResult['severity'];
  if (status >= 200 && status < 300) {
    statusSeverity = 'PASS';
  } else if (status === 301 || status === 302) {
    statusSeverity = 'INFO';
  } else if (status >= 400 && status < 500) {
    statusSeverity = 'WARNING';
  } else if (status >= 500) {
    statusSeverity = 'CRITICAL';
  } else {
    statusSeverity = 'INFO';
  }

  results.push({
    category: CATEGORY,
    checkName: 'HTTP-Status-Code',
    severity: statusSeverity,
    value: `${status}`,
    expected: '200',
    message:
      statusSeverity === 'PASS'
        ? `Server returned HTTP ${status}, indicating a successful response.`
        : `Server returned HTTP ${status}.${statusSeverity === 'CRITICAL' ? ' This indicates a server error.' : ''}`,
    recommendation:
      statusSeverity === 'PASS'
        ? null
        : status >= 500
          ? 'Investigate server-side errors immediately. Check application logs and monitor server health.'
          : status >= 400
            ? 'The requested resource returned a client error. Verify the URL is correct and the resource exists.'
            : null,
    rawData: { statusCode: status },
  });

  // ------------------------------------------------------------------
  // Response size
  // ------------------------------------------------------------------
  let body: ArrayBuffer;
  try {
    body = await response.arrayBuffer();
  } catch {
    body = new ArrayBuffer(0);
  }

  const sizeBytes = body.byteLength;
  const sizeMB = sizeBytes / (1024 * 1024);

  let sizeSeverity: CheckResult['severity'];
  if (sizeMB < 1) {
    sizeSeverity = 'PASS';
  } else if (sizeMB < 5) {
    sizeSeverity = 'INFO';
  } else {
    sizeSeverity = 'WARNING';
  }

  const sizeLabel =
    sizeMB >= 1
      ? `${sizeMB.toFixed(2)} MB`
      : `${(sizeBytes / 1024).toFixed(1)} KB`;

  results.push({
    category: CATEGORY,
    checkName: 'Response-Size',
    severity: sizeSeverity,
    value: sizeLabel,
    expected: '< 1 MB',
    message:
      sizeSeverity === 'PASS'
        ? `Response size is ${sizeLabel}, which is within acceptable limits.`
        : `Response size is ${sizeLabel}, which is ${sizeSeverity === 'INFO' ? 'moderate' : 'large'} and may impact load times.`,
    recommendation:
      sizeSeverity === 'PASS'
        ? null
        : 'Reduce page size by minifying HTML/CSS/JS, optimizing images, removing unused assets, and enabling server-side compression.',
    rawData: { sizeBytes },
  });

  // ------------------------------------------------------------------
  // Compression (Content-Encoding)
  // ------------------------------------------------------------------
  const contentEncoding = response.headers.get('content-encoding');
  const isCompressed =
    contentEncoding !== null &&
    /\b(gzip|br|deflate|zstd)\b/i.test(contentEncoding);

  results.push({
    category: CATEGORY,
    checkName: 'Compression',
    severity: isCompressed ? 'PASS' : 'INFO',
    value: contentEncoding ?? 'None',
    expected: 'gzip or br',
    message: isCompressed
      ? `Response is compressed using ${contentEncoding}.`
      : 'Response does not appear to be compressed. Enabling compression can significantly reduce transfer sizes.',
    recommendation: isCompressed
      ? null
      : 'Enable gzip or Brotli compression on your web server. Most modern servers (nginx, Apache, Caddy) support this via a simple configuration directive.',
  });

  return results;
}
