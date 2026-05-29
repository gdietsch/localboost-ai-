/**
 * Stripe payment routes for LocalBoost AI (local backend - ESM).
 */
import { Router } from 'express';
import { query } from '../models/db.js';
import Stripe from 'stripe';

const router = Router();

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder';
  return new Stripe(key);
}

// GET /api/stripe/config
router.get('/config', (req, res) => {
  res.json({
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder',
    prices: {
      audit: process.env.STRIPE_PRICE_AUDIT || 'price_audit_49',
      subscription: process.env.STRIPE_PRICE_SUBSCRIPTION || 'price_sub_149',
    },
  });
});

// POST /api/stripe/create-checkout-session
router.post('/create-checkout-session', async (req, res) => {
  try {
    const { name, website, category, email, type } = req.body;
    if (!name || !website || !category || !email) {
      return res.status(400).json({ error: 'Business name, website, category, and email are required' });
    }

    const safe = (s) => `'${String(s).replace(/'/g, "''")}'`;

    // Find or create business
    let businesses = query(
      `SELECT id FROM businesses WHERE email = ${safe(email)} AND name = ${safe(name)} LIMIT 1`
    );

    let businessId;
    if (businesses && businesses.length > 0) {
      businessId = businesses[0].id;
    } else {
      query(
        `INSERT INTO businesses (name, website, category, email) VALUES (${safe(name)}, ${safe(website)}, ${safe(category)}, ${safe(email)})`
      );
      const newBiz = query(
        `SELECT id FROM businesses WHERE email = ${safe(email)} AND name = ${safe(name)} ORDER BY created_at DESC LIMIT 1`
      );
      businessId = newBiz?.[0]?.id;
    }

    if (!businessId) {
      return res.status(500).json({ error: 'Failed to get or create business' });
    }

    const isSubscription = type === 'subscription';
    const amount = isSubscription ? 14900 : 4900;
    const priceId = isSubscription
      ? (process.env.STRIPE_PRICE_SUBSCRIPTION || 'price_sub_149')
      : (process.env.STRIPE_PRICE_AUDIT || 'price_audit_49');

    const stripe = getStripe();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: isSubscription ? 'LocalBoost AI — Monthly Subscription' : 'LocalBoost AI — Marketing Audit',
              description: isSubscription
                ? '$149/month — Weekly content, review management, lead follow-ups & reports'
                : '$49 one-time — Website audit, competitor scan, 30-day marketing plan, content ideas',
            },
            unit_amount: amount,
            recurring: isSubscription ? { interval: 'month' } : undefined,
          },
          quantity: 1,
        },
      ],
      mode: isSubscription ? 'subscription' : 'payment',
      success_url: `${req.headers.origin || 'http://localhost:3001'}/audit/new?paid=true&business_id=${businessId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin || 'http://localhost:3001'}/pricing?canceled=true`,
      customer_email: email,
      metadata: {
        business_id: businessId,
        type: isSubscription ? 'subscription' : 'audit',
      },
    });

    query(
      `INSERT INTO payments (business_id, email, amount, currency, stripe_session_id, status, type) VALUES (${safe(businessId)}, ${safe(email)}, ${amount}, 'usd', ${safe(session.id)}, 'pending', ${safe(isSubscription ? 'subscription' : 'audit')})`
    );

    res.json({ sessionId: session.id, url: session.url });
  } catch (err) {
    console.error('Error creating checkout session:', err);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// POST /api/stripe/webhook
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    const stripe = getStripe();
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const businessId = session.metadata?.business_id;
      const type = session.metadata?.type || 'audit';

      if (businessId) {
        const safe = (s) => `'${String(s).replace(/'/g, "''")}'`;
        query(`UPDATE payments SET status = 'completed' WHERE stripe_session_id = ${safe(session.id)}`);

        if (type === 'audit' || type === 'subscription') {
          query(`INSERT INTO audits (business_id, status) VALUES (${safe(businessId)}, 'pending')`);
        }
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

export default router;