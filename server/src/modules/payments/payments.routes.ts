import { Router } from 'express';
import express from 'express';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { paymentsController } from './payments.controller';
import { checkoutSchema, paymentHistorySchema } from './payments.schema';

const router = Router();

router.post(
  '/checkout',
  authenticate,
  validate(checkoutSchema),
  paymentsController.createCheckout
);

router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  paymentsController.webhook
);

router.post('/portal', authenticate, paymentsController.createPortal);

router.get(
  '/history',
  authenticate,
  validate(paymentHistorySchema),
  paymentsController.getHistory
);

export const paymentsRoutes = router;
