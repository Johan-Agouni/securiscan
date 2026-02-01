import { prisma } from '../../config/database';
import { scanQueue } from '../../config/queue';
import { ApiError } from '../../utils/ApiError';
import { PlanType, ScanStatus } from '@prisma/client';

const PLAN_LIMITS: Record<PlanType, { maxScansPerDay: number }> = {
  FREE: { maxScansPerDay: 5 },
  PRO: { maxScansPerDay: 50 },
  BUSINESS: { maxScansPerDay: Infinity },
};

export const scansService = {
  async triggerScan(siteId: string, userId: string) {
    const site = await prisma.site.findUnique({
      where: { id: siteId },
      include: { user: true },
    });

    if (!site || site.userId !== userId) {
      throw ApiError.notFound('Site not found');
    }

    if (!site.isActive) {
      throw ApiError.badRequest('Site is not active');
    }

    const user = site.user;
    const limit = PLAN_LIMITS[user.plan].maxScansPerDay;

    if (limit !== Infinity) {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const scansToday = await prisma.scan.count({
        where: {
          site: { userId },
          createdAt: { gte: todayStart },
        },
      });

      if (scansToday >= limit) {
        throw ApiError.forbidden(
          `Daily scan limit reached (${limit} scans/day for ${user.plan} plan)`
        );
      }
    }

    const scan = await prisma.scan.create({
      data: {
        siteId,
        status: ScanStatus.PENDING,
      },
    });

    await scanQueue.add('run-scan', {
      scanId: scan.id,
      siteUrl: site.url,
    });

    return scan;
  },

  async getScanHistory(
    siteId: string,
    userId: string,
    page: number,
    limit: number
  ) {
    const site = await prisma.site.findUnique({
      where: { id: siteId },
    });

    if (!site || site.userId !== userId) {
      throw ApiError.notFound('Site not found');
    }

    const skip = (page - 1) * limit;

    const [scans, total] = await Promise.all([
      prisma.scan.findMany({
        where: { siteId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          _count: { select: { results: true } },
        },
      }),
      prisma.scan.count({
        where: { siteId },
      }),
    ]);

    return {
      scans,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  },

  async getScanDetail(scanId: string, userId: string) {
    const scan = await prisma.scan.findUnique({
      where: { id: scanId },
      include: {
        site: true,
        results: true,
      },
    });

    if (!scan || scan.site.userId !== userId) {
      throw ApiError.notFound('Scan not found');
    }

    return scan;
  },

  async getScanResults(scanId: string, userId: string, category?: string) {
    const scan = await prisma.scan.findUnique({
      where: { id: scanId },
      include: { site: true },
    });

    if (!scan || scan.site.userId !== userId) {
      throw ApiError.notFound('Scan not found');
    }

    const where: Record<string, unknown> = { scanId };
    if (category) {
      where.category = category;
    }

    const results = await prisma.scanResult.findMany({
      where,
      orderBy: { createdAt: 'asc' },
    });

    return results;
  },
};
