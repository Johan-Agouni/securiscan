import { prisma } from '../../config/database';
import { ApiError } from '../../utils/ApiError';
import { Prisma, Role, PlanType } from '@prisma/client';

export const adminService = {
  async getStats() {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [totalUsers, totalSites, totalScans, scansToday, avgScoreResult] =
      await Promise.all([
        prisma.user.count(),
        prisma.site.count(),
        prisma.scan.count(),
        prisma.scan.count({
          where: { createdAt: { gte: todayStart } },
        }),
        prisma.scan.aggregate({
          _avg: { overallScore: true },
          where: { overallScore: { not: null } },
        }),
      ]);

    return {
      totalUsers,
      totalSites,
      totalScans,
      scansToday,
      avgScore: avgScoreResult._avg?.overallScore ?? 0,
    };
  },

  async getUsers(page: number, limit: number, search?: string) {
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = search
      ? { email: { contains: search, mode: 'insensitive' } }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          plan: true,
          createdAt: true,
          _count: {
            select: {
              sites: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  },

  async getUserDetail(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        sites: {
          include: {
            scans: {
              orderBy: { createdAt: 'desc' },
              take: 5,
            },
          },
        },
      },
    });

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const result = { ...user } as Record<string, unknown>;
    delete result.passwordHash;
    return result;
  },

  async updateUser(
    userId: string,
    data: { role?: Role; plan?: PlanType }
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data,
    });

    const result = { ...updated } as Record<string, unknown>;
    delete result.passwordHash;
    return result;
  },

  async getRecentScans() {
    const scans = await prisma.scan.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        site: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    return scans;
  },
};
