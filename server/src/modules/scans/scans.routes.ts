import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { scanLimiter } from '../../middleware/rateLimiter';
import { scansController } from './scans.controller';
import {
  triggerScanSchema,
  scanHistorySchema,
  scanDetailSchema,
  scanResultsSchema,
} from './scans.schema';

const router = Router();

router.post(
  '/trigger/:siteId',
  authenticate,
  scanLimiter,
  validate(triggerScanSchema),
  scansController.triggerScan
);

router.get(
  '/site/:siteId',
  authenticate,
  validate(scanHistorySchema),
  scansController.getScanHistory
);

router.get(
  '/:scanId',
  authenticate,
  validate(scanDetailSchema),
  scansController.getScanDetail
);

router.get(
  '/:scanId/results',
  authenticate,
  validate(scanResultsSchema),
  scansController.getScanResults
);

export const scansRoutes = router;
