import { prisma } from '../../config/database';
import { stripe } from '../../config/stripe';
import { config } from '../../config';
import { ApiError } from '../../utils/ApiError';
import { PlanType } from '@prisma/client';
import Stripe from 'stripe';

const STRIPE_PRICES: Record<string, string> = {
  PRO: 'price_pro_monthly',
  BUSINESS: 'price_business_monthly',
};

export const paymentsService = {
  async createCheckoutSession(userId: string, plan: 'PRO' | 'BUSINESS') {
    if (!stripe) {
      throw ApiError.internal('Stripe not configured');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    let stripeCustomerId = user.stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId: user.id },
      });

      stripeCustomerId = customer.id;

      await prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId },
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: STRIPE_PRICES[plan],
          quantity: 1,
        },
      ],
      success_url: `${config.FRONTEND_URL}/dashboard/billing?success=true`,
      cancel_url: `${config.FRONTEND_URL}/dashboard/billing?canceled=true`,
      metadata: {
        userId: user.id,
        plan,
      },
    });

    await prisma.payment.create({
      data: {
        userId,
        amount: 0,
        currency: 'usd',
        status: 'pending',
        stripeSessionId: session.id,
        plan: plan as PlanType,
      },
    });

    return { url: session.url };
  },

  async handleWebhook(event: Stripe.Event) {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        const payment = await prisma.payment.findFirst({
          where: { stripeSessionId: session.id },
        });

        if (payment) {
          const plan = session.metadata?.plan as PlanType;

          await prisma.$transaction([
            prisma.payment.update({
              where: { id: payment.id },
              data: {
                status: 'completed',
                amount: session.amount_total ?? 0,
              },
            }),
            prisma.user.update({
              where: { id: payment.userId },
              data: { plan },
            }),
          ]);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId =
          typeof subscription.customer === 'string'
            ? subscription.customer
            : subscription.customer.id;

        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: customerId },
        });

        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: { plan: PlanType.FREE },
          });
        }
        break;
      }
    }
  },

  async createPortalSession(userId: string) {
    if (!stripe) {
      throw ApiError.internal('Stripe not configured');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.stripeCustomerId) {
      throw ApiError.badRequest('No billing account found');
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${config.FRONTEND_URL}/dashboard/billing`,
    });

    return { url: session.url };
  },

  async getPaymentHistory(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.payment.count({
        where: { userId },
      }),
    ]);

    return {
      payments,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  },
};
