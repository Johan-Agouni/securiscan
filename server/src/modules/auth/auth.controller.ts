import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { apiResponse } from '../../utils/apiResponse';
import { authService } from './auth.service';
import { config } from '../../config';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: config.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
};

function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  res.cookie('accessToken', accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: 15 * 60 * 1000, // 15 minutes
  });
  res.cookie('refreshToken', refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/api/auth',
  });
}

function clearAuthCookies(res: Response) {
  res.clearCookie('accessToken', { ...COOKIE_OPTIONS });
  res.clearCookie('refreshToken', { ...COOKIE_OPTIONS, path: '/api/auth' });
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, firstName, lastName } = req.body;
  const user = await authService.register(email, password, firstName, lastName);
  apiResponse({ res, statusCode: 201, data: user, message: 'Registration successful' });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const data = await authService.login(email, password);
  setAuthCookies(res, data.accessToken, data.refreshToken);
  apiResponse({ res, data, message: 'Login successful' });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;
  if (!refreshToken) {
    return apiResponse({ res, statusCode: 400, success: false, message: 'Refresh token required' });
  }
  const tokens = await authService.refreshToken(refreshToken);
  setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
  apiResponse({ res, data: tokens, message: 'Token refreshed' });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;
  if (refreshToken) {
    await authService.logout(refreshToken);
  }
  clearAuthCookies(res);
  apiResponse({ res, message: 'Logged out successfully' });
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  await authService.forgotPassword(email);
  apiResponse({
    res,
    message: 'If that email is registered, a password reset link has been sent',
  });
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, password } = req.body;
  await authService.resetPassword(token, password);
  apiResponse({ res, message: 'Password reset successful' });
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const token = req.params.token as string;
  await authService.verifyEmail(token);
  apiResponse({ res, message: 'Email verified successfully' });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const user = await authService.updateProfile(userId, req.body);
  apiResponse({ res, data: user, message: 'Profile updated' });
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { currentPassword, newPassword } = req.body;
  await authService.changePassword(userId, currentPassword, newPassword);
  apiResponse({ res, message: 'Password changed successfully' });
});

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const user = await authService.getProfile(userId);
  apiResponse({ res, data: user, message: 'Profile retrieved' });
});
