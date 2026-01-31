import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { apiResponse } from '../../utils/apiResponse';
import { sitesService } from './sites.service';

export const sitesController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { url, name } = req.body;

    const site = await sitesService.create(userId, url, name);

    apiResponse({ res, statusCode: 201, data: site, message: 'Site created successfully' });
  }),

  findAll: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;

    const result = await sitesService.findAllByUser(userId, page, limit);

    apiResponse({ res, data: result, message: 'Sites retrieved successfully' });
  }),

  findOne: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const siteId = req.params.siteId as string;

    const site = await sitesService.findOne(siteId, userId);

    apiResponse({ res, data: site, message: 'Site retrieved successfully' });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const siteId = req.params.siteId as string;

    const site = await sitesService.update(siteId, userId, req.body);

    apiResponse({ res, data: site, message: 'Site updated successfully' });
  }),

  updateSchedule: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const siteId = req.params.siteId as string;
    const { scanSchedule } = req.body;

    const site = await sitesService.updateSchedule(siteId, userId, scanSchedule);

    apiResponse({ res, data: site, message: 'Schedule updated successfully' });
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const siteId = req.params.siteId as string;

    await sitesService.remove(siteId, userId);

    apiResponse({ res, message: 'Site deleted successfully' });
  }),
};
