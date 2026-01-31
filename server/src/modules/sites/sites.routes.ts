import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { createSiteSchema, updateSiteSchema, updateScheduleSchema, siteIdParamSchema } from './sites.schema';
import { sitesController } from './sites.controller';

const router = Router();

router.post(
  '/',
  authenticate,
  validate(createSiteSchema),
  sitesController.create
);

router.get(
  '/',
  authenticate,
  sitesController.findAll
);

router.get(
  '/:siteId',
  authenticate,
  validate(siteIdParamSchema),
  sitesController.findOne
);

router.put(
  '/:siteId',
  authenticate,
  validate(updateSiteSchema),
  sitesController.update
);

router.put(
  '/:siteId/schedule',
  authenticate,
  validate(updateScheduleSchema),
  sitesController.updateSchedule
);

router.delete(
  '/:siteId',
  authenticate,
  sitesController.remove
);

export const sitesRoutes = router;
