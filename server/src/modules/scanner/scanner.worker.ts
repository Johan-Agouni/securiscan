import { Worker, Job } from 'bullmq';
import { redis } from '../../config/redis';
import { prisma } from '../../config/database';
import { logger } from '../../utils/logger';
import { runAllChecks } from './scanner.service';
import { calculateScore } from './scoring';
import { sendEmail } from '../notifications/email.service';
import { scanAlertTemplate } from '../notifications/templates/scan-alert';
import { scanCompleteTemplate } from '../notifications/templates/scan-complete';
import { config } from '../../config';
import { Prisma } from '@prisma/client';
import type { ScanJobData, CheckResult } from './scanner.types';

/**
 * Map the application-level severity string to the Prisma SeverityLevel enum.
 * The Prisma enum values are identical to our type literals so we can cast
 * directly, but an explicit map keeps the boundary clean.
 */
function toPrismaSeverity(
  severity: CheckResult['severity'],
): 'PASS' | 'INFO' | 'WARNING' | 'CRITICAL' {
  return severity;
}

/**
 * Process a single scan job.
 *
 * Separated from the Worker callback to make error handling explicit and
 * testable.
 */
async function processScanJob(job: Job<ScanJobData>): Promise<void> {
  let { scanId, siteUrl } = job.data;
  const { siteId, scheduled } = job.data;

  // For scheduled scans, create a new scan record first
  if (scheduled && siteId && !scanId) {
    const site = await prisma.site.findUnique({
      where: { id: siteId },
      select: { url: true, isActive: true },
    });

    if (!site || !site.isActive) {
      logger.info(`Skipping scheduled scan for inactive/missing site ${siteId}`);
      return;
    }

    siteUrl = site.url;
    const scan = await prisma.scan.create({
      data: { siteId, status: 'PENDING' },
    });
    scanId = scan.id;
    logger.info(`Created scan ${scanId} for scheduled job on site ${siteId}`);
  }

  logger.info(`Starting scan ${scanId} for ${siteUrl}`);

  // ── 1. Mark scan as RUNNING ──────────────────────────────────────────
  await prisma.scan.update({
    where: { id: scanId },
    data: {
      status: 'RUNNING',
      startedAt: new Date(),
    },
  });

  // ── 2. Execute all security checks ───────────────────────────────────
  const results = await runAllChecks(siteUrl);

  // ── 3. Calculate overall score ───────────────────────────────────────
  const overallScore = calculateScore(results);

  // ── 4. Persist individual check results ──────────────────────────────
  if (results.length > 0) {
    await prisma.scanResult.createMany({
      data: results.map((r) => ({
        scanId,
        category: r.category,
        checkName: r.checkName,
        severity: toPrismaSeverity(r.severity),
        value: r.value,
        expected: r.expected,
        message: r.message,
        recommendation: r.recommendation,
        rawData: (r.rawData as Prisma.InputJsonValue) ?? undefined,
      })),
    });
  }

  // ── 5. Mark scan as COMPLETED ────────────────────────────────────────
  await prisma.scan.update({
    where: { id: scanId },
    data: {
      status: 'COMPLETED',
      overallScore,
      completedAt: new Date(),
    },
  });

  logger.info(
    `Scan ${scanId} completed for ${siteUrl} with score ${overallScore}`,
  );

  // ── 6. Send scan completion notification ────────────────────────────
  await sendCompletionNotification(scanId, siteUrl, overallScore);

  // ── 7. Send alert if score is low, critical findings, or score drop ─
  const criticalCount = results.filter(
    (r) => r.severity === 'CRITICAL',
  ).length;

  const previousScan = await prisma.scan.findFirst({
    where: {
      siteId: (await prisma.scan.findUnique({ where: { id: scanId }, select: { siteId: true } }))!.siteId,
      status: 'COMPLETED',
      id: { not: scanId },
    },
    orderBy: { completedAt: 'desc' },
    select: { overallScore: true },
  });

  const scoreDrop = previousScan?.overallScore != null
    ? previousScan.overallScore - overallScore
    : 0;

  if (overallScore < 50 || criticalCount > 0 || scoreDrop >= 10) {
    await sendAlertIfEnabled(scanId, siteUrl, overallScore, criticalCount, scoreDrop);
  }
}

/**
 * Send a "scan complete" notification email when notifications are enabled.
 */
async function sendCompletionNotification(
  scanId: string,
  siteUrl: string,
  score: number,
): Promise<void> {
  try {
    const scan = await prisma.scan.findUnique({
      where: { id: scanId },
      include: { site: { include: { user: true } } },
    });

    if (!scan?.site?.user) return;

    const { user, name: siteName } = scan.site;

    if (!user.notificationsEnabled) return;

    const { subject, html } = scanCompleteTemplate(
      siteName,
      score,
      config.FRONTEND_URL,
      scanId,
    );

    await sendEmail(user.email, subject, html);
    logger.info(`Completion email sent to ${user.email} for scan ${scanId}`);
  } catch (error) {
    logger.error(
      `Failed to send completion email for scan ${scanId}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Look up the site owner and send a scan alert email when notifications
 * are enabled. Triggers on critical findings, low score, or significant score drop.
 */
async function sendAlertIfEnabled(
  scanId: string,
  siteUrl: string,
  score: number,
  criticalCount: number,
  scoreDrop: number = 0,
): Promise<void> {
  try {
    const scan = await prisma.scan.findUnique({
      where: { id: scanId },
      include: { site: { include: { user: true } } },
    });

    if (!scan?.site?.user) {
      logger.warn(
        `Cannot send alert for scan ${scanId}: site or user not found`,
      );
      return;
    }

    const { user, name: siteName } = scan.site;

    if (!user.notificationsEnabled) {
      logger.info(
        `Notifications disabled for user ${user.id}; skipping alert for scan ${scanId}`,
      );
      return;
    }

    const { subject, html } = scanAlertTemplate(
      siteName,
      siteUrl,
      score,
      criticalCount,
    );

    await sendEmail(user.email, subject, html);

    logger.info(`Alert email sent to ${user.email} for scan ${scanId} (scoreDrop=${scoreDrop})`);
  } catch (error) {
    logger.error(
      `Failed to send alert for scan ${scanId}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Start the BullMQ worker that listens to the `security-scans` queue.
 *
 * Call this once during application startup. The worker will process
 * jobs sequentially (concurrency = 1 by default) and can be scaled
 * horizontally by running additional worker processes.
 */
export function startScanWorker(): void {
  const worker = new Worker<ScanJobData>(
    'security-scans',
    async (job) => {
      await processScanJob(job);
    },
    {
      connection: redis,
      concurrency: 2,
      limiter: {
        max: 10,
        duration: 60_000,
      },
    },
  );

  worker.on('completed', (job) => {
    logger.info(`Job ${job.id} (scan ${job.data.scanId}) completed`);
  });

  worker.on('failed', async (job, error) => {
    const scanId = job?.data?.scanId;
    logger.error(
      `Job ${job?.id} (scan ${scanId ?? 'unknown'}) failed: ${error.message}`,
    );

    // Persist the failure state so the dashboard can show it.
    if (scanId) {
      try {
        await prisma.scan.update({
          where: { id: scanId },
          data: {
            status: 'FAILED',
            errorMessage: error.message.slice(0, 1000),
            completedAt: new Date(),
          },
        });
      } catch (dbError) {
        logger.error(
          `Failed to update scan ${scanId} status to FAILED: ${dbError instanceof Error ? dbError.message : String(dbError)}`,
        );
      }
    }
  });

  worker.on('error', (error) => {
    logger.error(`Scanner worker error: ${error.message}`);
  });

  logger.info('Scanner worker started, listening on "security-scans" queue');
}
