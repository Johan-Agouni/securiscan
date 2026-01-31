import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { apiResponse } from '../../utils/apiResponse';
import { scansService } from './scans.service';
import { generateScanReportPDF } from './pdf.service';

export const scansController = {
  triggerScan: asyncHandler(async (req: Request, res: Response) => {
    const siteId = req.params.siteId as string;
    const userId = req.user!.userId;

    const scan = await scansService.triggerScan(siteId, userId);

    apiResponse({ res, statusCode: 201, data: scan, message: 'Scan triggered successfully' });
  }),

  getScanHistory: asyncHandler(async (req: Request, res: Response) => {
    const siteId = req.params.siteId as string;
    const userId = req.user!.userId;
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;

    const data = await scansService.getScanHistory(siteId, userId, page, limit);

    apiResponse({ res, data, message: 'Scan history retrieved' });
  }),

  getScanDetail: asyncHandler(async (req: Request, res: Response) => {
    const scanId = req.params.scanId as string;
    const userId = req.user!.userId;

    const scan = await scansService.getScanDetail(scanId, userId);

    apiResponse({ res, data: scan, message: 'Scan detail retrieved' });
  }),

  getScanResults: asyncHandler(async (req: Request, res: Response) => {
    const scanId = req.params.scanId as string;
    const userId = req.user!.userId;
    const { category } = req.query as { category?: string };

    const results = await scansService.getScanResults(scanId, userId, category);

    apiResponse({ res, data: results, message: 'Scan results retrieved' });
  }),

  downloadPDF: asyncHandler(async (req: Request, res: Response) => {
    const scanId = req.params.scanId as string;
    const userId = req.user!.userId;

    const scan = await scansService.getScanDetail(scanId, userId);

    const pdfBuffer = await generateScanReportPDF({
      id: scan.id,
      overallScore: scan.overallScore,
      createdAt: scan.createdAt,
      completedAt: scan.completedAt,
      site: { name: scan.site.name, url: scan.site.url },
      results: scan.results.map((r) => ({
        category: r.category,
        checkName: r.checkName,
        severity: r.severity,
        value: r.value,
        expected: r.expected,
        message: r.message,
        recommendation: r.recommendation,
      })),
    });

    const filename = `securiscan-report-${scan.site.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': pdfBuffer.length.toString(),
    });

    res.send(pdfBuffer);
  }),
};
