import { prisma } from '../../config/database';
import { ApiError } from '../../utils/ApiError';

const PLAN_LIMITS: Record<string, { maxSites: number }> = {
  FREE: { maxSites: 2 },
  PRO: { maxSites: 10 },
  BUSINESS: { maxSites: 50 },
};

function normalizeUrl(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

export const sitesService = {
  async create(userId: string, url: string, name: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true },
    });

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const limits = PLAN_LIMITS[user.plan] ?? PLAN_LIMITS.FREE;

    const siteCount = await prisma.site.count({
      where: { userId },
    });

    if (siteCount >= limits.maxSites) {
      throw ApiError.forbidden(
        `You have reached the maximum number of sites (${limits.maxSites}) for your ${user.plan} plan. Please upgrade to add more sites.`
      );
    }

    const normalizedUrl = normalizeUrl(url);

    const existing = await prisma.site.findFirst({
      where: { url: normalizedUrl, userId },
    });

    if (existing) {
      throw ApiError.conflict('A site with this URL already exists in your account');
    }

    const site = await prisma.site.create({
      data: {
        url: normalizedUrl,
        name,
        userId,
      },
    });

    return site;
  },

  async findAllByUser(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [sites, total] = await Promise.all([
      prisma.site.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          scans: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      }),
      prisma.site.count({ where: { userId } }),
    ]);

    const totalPages = Math.ceil(total / limit);

    const sitesWithScore = sites.map((site) => {
      const { scans, ...rest } = site;
      return {
        ...rest,
        latestScan: scans[0] ?? null,
        latestScore: scans[0]?.overallScore ?? null,
      };
    });

    return {
      sites: sitesWithScore,
      total,
      page,
      totalPages,
    };
  },

  async findOne(siteId: string, userId: string) {
    const site = await prisma.site.findFirst({
      where: { id: siteId, userId },
      include: {
        _count: { select: { scans: true } },
        scans: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!site) {
      throw ApiError.notFound('Site not found');
    }

    return site;
  },

  async update(
    siteId: string,
    userId: string,
    data: { name?: string; isActive?: boolean }
  ) {
    const site = await prisma.site.findFirst({
      where: { id: siteId, userId },
    });

    if (!site) {
      throw ApiError.notFound('Site not found');
    }

    const updated = await prisma.site.update({
      where: { id: siteId },
      data,
    });

    return updated;
  },

  async remove(siteId: string, userId: string) {
    const site = await prisma.site.findFirst({
      where: { id: siteId, userId },
    });

    if (!site) {
      throw ApiError.notFound('Site not found');
    }

    await prisma.site.delete({
      where: { id: siteId },
    });
  },
};
