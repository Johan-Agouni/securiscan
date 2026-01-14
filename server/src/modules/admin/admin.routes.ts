import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/requireRole';
import { validate } from '../../middleware/validate';
import { adminController } from './admin.controller';
import {
  userListSchema,
  userIdParamSchema,
  updateUserSchema,
} from './admin.schema';

const router = Router();

router.use(authenticate, requireRole('ADMIN'));

router.get('/stats', adminController.getStats);

router.get('/users', validate(userListSchema), adminController.getUsers);

router.get(
  '/users/:userId',
  validate(userIdParamSchema),
  adminController.getUserDetail
);

router.patch(
  '/users/:userId',
  validate(updateUserSchema),
  adminController.updateUser
);

router.get('/scans', adminController.getRecentScans);

export const adminRoutes = router;
