import crypto from 'crypto';
import { prisma } from '../../config/database';
import { hashPassword, comparePassword } from '../../utils/hash';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../../utils/jwt';
import { ApiError } from '../../utils/ApiError';
import { sendEmail } from '../notifications/email.service';
import { config } from '../../config';

const REFRESH_TOKEN_EXPIRY_DAYS = 7;
const RESET_TOKEN_EXPIRY_HOURS = 1;

function excludePassword<T extends { passwordHash?: unknown }>(
  user: T
): Omit<T, 'passwordHash'> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, ...rest } = user;
  return rest;
}

export class AuthService {
  async register(
    email: string,
    password: string,
    firstName?: string,
    lastName?: string
  ) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw ApiError.conflict('Email is already registered');
    }

    const hashed = await hashPassword(password);
    const emailVerifyToken = crypto.randomBytes(32).toString('hex');

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hashed,
        firstName,
        lastName,
        emailVerifyToken,
      },
    });

    const verifyUrl = `${config.FRONTEND_URL}/verify-email?token=${emailVerifyToken}`;
    // Fire-and-forget: don't block registration if email fails or times out
    sendEmail(
      email,
      'Verifiez votre email - SecuriScan',
      `<p>Bienvenue sur SecuriScan ! Cliquez <a href="${verifyUrl}">ici</a> pour verifier votre email.</p>`
    ).catch(() => {});

    return excludePassword(user);
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
      user: excludePassword(user),
    };
  }

  async refreshToken(token: string) {
    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch {
      throw ApiError.unauthorized('Invalid refresh token');
    }

    const storedToken = await prisma.refreshToken.findUnique({
      where: { token },
    });
    if (!storedToken || storedToken.expiresAt < new Date()) {
      if (storedToken) {
        await prisma.refreshToken.delete({ where: { id: storedToken.id } });
      }
      throw ApiError.unauthorized('Refresh token expired or not found');
    }

    await prisma.refreshToken.delete({ where: { id: storedToken.id } });

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });
    if (!user) {
      throw ApiError.unauthorized('User not found');
    }

    const accessToken = generateAccessToken(user.id, user.role);
    const newRefreshToken = generateRefreshToken(user.id);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: user.id,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(refreshToken: string) {
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
  }

  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return; // Don't reveal if email exists
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpiry = new Date();
    resetExpiry.setHours(resetExpiry.getHours() + RESET_TOKEN_EXPIRY_HOURS);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpiry: resetExpiry,
      },
    });

    const resetUrl = `${config.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await sendEmail(
      email,
      'Reinitialisation de mot de passe - SecuriScan',
      `<p>Cliquez <a href="${resetUrl}">ici</a> pour reinitialiser votre mot de passe. Ce lien expire dans 1 heure.</p>`
    );
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      throw ApiError.badRequest('Invalid or expired reset token');
    }

    const hashed = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hashed,
        resetPasswordToken: null,
        resetPasswordExpiry: null,
      },
    });

    await prisma.refreshToken.deleteMany({
      where: { userId: user.id },
    });
  }

  async verifyEmail(token: string) {
    const user = await prisma.user.findFirst({
      where: { emailVerifyToken: token },
    });

    if (!user) {
      throw ApiError.badRequest('Invalid verification token');
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerifyToken: null,
      },
    });
  }

  async updateProfile(
    userId: string,
    data: { firstName?: string; lastName?: string; notificationsEnabled?: boolean }
  ) {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
    });
    return excludePassword(user);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const isMatch = await comparePassword(currentPassword, user.passwordHash);
    if (!isMatch) {
      throw ApiError.unauthorized('Mot de passe actuel incorrect');
    }

    const hashed = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: hashed },
    });
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    return excludePassword(user);
  }
}

export const authService = new AuthService();
