import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { apiResponse } from '../../utils/apiResponse';
import { adminService } from './admin.service';

export const adminController = {
  getStats: asyncHandler(async (_req: Request, res: Response) => {
    const stats = await adminService.getStats();

    apiResponse({ res, data: stats, message: 'Admin stats retrieved' });
  }),

  getUsers: asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const search = req.query.search as string | undefined;

    const data = await adminService.getUsers(page, limit, search);

    apiResponse({ res, data, message: 'Users retrieved' });
  }),

  getUserDetail: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.params.userId as string;

    const user = await adminService.getUserDetail(userId);

    apiResponse({ res, data: user, message: 'User detail retrieved' });
  }),

  updateUser: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.params.userId as string;
    const data = req.body;

    const user = await adminService.updateUser(userId, data);

    apiResponse({ res, data: user, message: 'User updated' });
  }),

  getRecentScans: asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;

    const data = await adminService.getRecentScans(page, limit);

    apiResponse({ res, data, message: 'Recent scans retrieved' });
  }),
};
