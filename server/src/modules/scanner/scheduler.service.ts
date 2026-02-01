import { scanQueue } from '../../config/queue';
import { prisma } from '../../config/database';
import { logger } from '../../utils/logger';
import { ScanSchedule } from '@prisma/client';

const CRON_PATTERNS: Record<string, string> = {
  DAILY: '0 2 * * *',
  WEEKLY: '0 2 * * 1',
  MONTHLY: '0 2 1 * *',
};

function getJobKey(siteId: string): string {
  return `scheduled-scan-${siteId}`;
}

export async function scheduleRecurringScan(
  siteId: string,
  schedule: ScanSchedule,
): Promise<void> {
  const jobKey = getJobKey(siteId);

  // Remove existing repeatable job for this site
  const repeatableJobs = await scanQueue.getRepeatableJobs();
  for (const job of repeatableJobs) {
    if (job.key.includes(jobKey)) {
      await scanQueue.removeRepeatableByKey(job.key);
      logger.info(`Removed existing scheduled scan for site ${siteId}`);
    }
  }

  if (schedule === 'NONE') {
    return;
  }

  const pattern = CRON_PATTERNS[schedule];
  if (!pattern) {
    logger.warn(`Unknown schedule: ${schedule}`);
    return;
  }

  // Fetch site to get URL
  const site = await prisma.site.findUnique({
    where: { id: siteId },
    select: { url: true, userId: true },
  });

  if (!site) {
    logger.warn(`Site ${siteId} not found, skipping schedule`);
    return;
  }

  await scanQueue.add(
    'run-scan',
    { scanId: '', siteUrl: site.url, siteId, scheduled: true },
    {
      repeat: { pattern },
      jobId: jobKey,
    },
  );

  logger.info(
    `Scheduled ${schedule} scan for site ${siteId} (cron: ${pattern})`,
  );
}

export async function restoreAllSchedules(): Promise<void> {
  try {
    const sites = await prisma.site.findMany({
      where: {
        scanSchedule: { not: 'NONE' },
        isActive: true,
      },
      select: { id: true, scanSchedule: true },
    });

    await Promise.all(
      sites.map((site) => scheduleRecurringScan(site.id, site.scanSchedule)),
    );

    logger.info(`Restored ${sites.length} scheduled scan(s)`);
  } catch (error) {
    logger.error(
      `Failed to restore schedules: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
