import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { createSiteSchema, updateSiteSchema, siteIdParamSchema } from './sites.schema';
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

router.delete(
  '/:siteId',
  authenticate,
  sitesController.remove
);

export const sitesRoutes = router;
