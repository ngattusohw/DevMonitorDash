import Stripe from 'stripe';
import { User } from '@shared/schema';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16' as any,
});

const PREMIUM_PLAN_ID = 'price_mock_premium_monthly'; // Replace with actual Stripe price ID

export const stripeService = {
  // Create or get a Stripe customer for a user
  async getOrCreateCustomer(user: User) {
    if (user.stripeCustomerId) {
      // Return existing customer
      return await stripe.customers.retrieve(user.stripeCustomerId);
    }

    // Create new customer
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.fullName || user.username,
      metadata: {
        userId: user.id.toString(),
      },
    });

    return customer;
  },

  // Create a checkout session for subscription
  async createCheckoutSession(user: User, returnUrl: string) {
    const customer = await this.getOrCreateCustomer(user);

    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: PREMIUM_PLAN_ID,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${returnUrl}?success=true`,
      cancel_url: `${returnUrl}?canceled=true`,
    });

    return session;
  },

  // Create a billing portal session
  async createBillingPortalSession(user: User, returnUrl: string) {
    if (!user.stripeCustomerId) {
      throw new Error('User does not have a Stripe customer ID');
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: returnUrl,
    });

    return session;
  },

  // Handle webhook events from Stripe
  async handleWebhookEvent(event: Stripe.Event) {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        // Update user subscription status
        if (session.customer && session.subscription) {
          return {
            customerId: session.customer.toString(),
            subscriptionId: session.subscription.toString(),
            status: 'premium'
          };
        }
        break;
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const status = subscription.status === 'active' ? 'premium' : 'free';
        return {
          customerId: subscription.customer.toString(),
          subscriptionId: subscription.id,
          status
        };
      }
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    
    return null;
  }
};