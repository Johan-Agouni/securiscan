import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { apiResponse } from '../../utils/apiResponse';
import { ApiError } from '../../utils/ApiError';
import { stripe } from '../../config/stripe';
import { config } from '../../config';
import { paymentsService } from './payments.service';
import Stripe from 'stripe';

export const paymentsController = {
  createCheckout: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { plan } = req.body;

    const data = await paymentsService.createCheckoutSession(userId, plan);

    apiResponse({ res, data, message: 'Checkout session created' });
  }),

  webhook: asyncHandler(async (req: Request, res: Response) => {
    if (!stripe) {
      throw ApiError.internal('Stripe not configured');
    }

    const signature = req.headers['stripe-signature'] as string;

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        config.STRIPE_WEBHOOK_SECRET!
      );
    } catch {
      throw ApiError.badRequest('Invalid webhook signature');
    }

    await paymentsService.handleWebhook(event);

    res.status(200).json({ received: true });
  }),

  createPortal: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;

    const data = await paymentsService.createPortalSession(userId);

    apiResponse({ res, data, message: 'Portal session created' });
  }),

  getHistory: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;

    const data = await paymentsService.getPaymentHistory(userId, page, limit);

    apiResponse({ res, data, message: 'Payment history retrieved' });
  }),
};
