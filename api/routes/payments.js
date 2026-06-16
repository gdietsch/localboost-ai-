/**
 * Stripe payment routes for LocalBoost AI.
 */
const express = require('express');
const { query, execute } = require('../db.js');

const router = express.Router();

// Stripe secret key from env, with fallback for local dev
const getStripe = () => {
  const key = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder';
  const Stripe = require('stripe');
  return new Stripe(key);
};

// Generate audit content items for a given audit
async function generateAuditContent(auditId) {
  try {
    const safe = (s) => `'${String(s).replace(/'/g, "''")}'`;
    const audits = await query(
      `SELECT b.name as business_name, b.category, b.website FROM audits a JOIN businesses b ON a.business_id = b.id WHERE a.id = ${safe(auditId)}`
    );
    if (!audits || audits.length === 0) {
      console.error(`Audit ${auditId} not found for content generation`);
      return;
    }

    const biz = audits[0];
    const name = biz.business_name;
    const cat = biz.category;

    const items = [
      { type: 'task', title: `Week 1: Optimize Google Business Profile for ${name}`, body: `1. Update business hours and contact info\n2. Add high-quality photos of your work\n3. Select relevant categories (${cat})\n4. Write a compelling business description\n5. Add services/products with pricing` },
      { type: 'task', title: `Week 2: Build Social Media Presence`, body: `1. Create/optimize Facebook Business Page\n2. Set up Instagram Business account\n3. Post 3 times this week using the content ideas below\n4. Engage with 5 local businesses' posts\n5. Add social media links to your website` },
      { type: 'task', title: `Week 3: Launch Review & Reputation Campaign`, body: `1. Send review request emails to past 20 customers\n2. Reply to all existing reviews using templates below\n3. Add review links to email signature\n4. Create a "Leave us a review" landing page\n5. Monitor new reviews daily` },
      { type: 'task', title: `Week 4: Run Local Ad Campaign`, body: `1. Set up Google Local Services Ads\n2. Create Facebook ad targeting local audience (10-mile radius)\n3. Budget: $10-15/day for first week\n4. Use the email drafts below for newsletter\n5. Track results and adjust targeting` },
      { type: 'task', title: `Content Calendar Setup`, body: `Create a monthly content calendar for ${name}:\n- Monday: Tip/Tutorial post\n- Wednesday: Customer testimonial or before/after\n- Friday: Behind-the-scenes or team spotlight\n- Saturday: Promotion or special offer\n- Google Post: Weekly update` },
      { type: 'social_post', title: `🤩 Before & After: ${name} in Action!`, body: `Nothing makes us happier than seeing the smiles on our customers' faces! Check out this amazing transformation we did recently.\n\nReady for your own transformation? Book now!` },
      { type: 'social_post', title: `💡 ${cat} Tip of the Day`, body: `Did you know? Regular ${cat.toLowerCase()} maintenance can extend the life of your investments by years. Here's a quick tip from our team:\n\n✅ Pro tip: Don't wait until it's too late — schedule regular checkups!\n\nSave this for later and tag a friend who needs to see this!` },
      { type: 'social_post', title: `⭐ Customer Spotlight: Meet Our Happy Clients`, body: `"Absolutely amazing service! ${name} went above and beyond our expectations. Highly recommend to anyone looking for quality ${cat.toLowerCase()} services!"\n\nWe love our community and we're so grateful for your support! 🫶` },
      { type: 'social_post', title: `📊 Did You Know?`, body: `Did you know that homes with professional ${cat.toLowerCase()} services sell 20% faster? It's true!\n\nAt ${name}, we help you put your best foot forward. Contact us today!` },
      { type: 'social_post', title: `🎉 Special Offer Just for You!`, body: `For a limited time, new customers get 15% off their first service! 🎉\n\nOffer valid for new customers only. Must mention this post to redeem. Expires soon!` },
      { type: 'social_post', title: `👋 Meet the Team Behind ${name}`, body: `We couldn't do what we do without our amazing team! Today we're spotlighting [Team Member Name], who has been with us for [X] years.\n\nFun fact: They once [interesting anecdote]!\n\nComment below if you've worked with them before!` },
      { type: 'social_post', title: `🏆 ${name} — Your Trusted Local ${cat} Experts`, body: `When it comes to ${cat.toLowerCase()}, experience matters. With over [X] years in business and [X]+ happy customers, ${name} is your go-to local expert.\n\nHere's what sets us apart:\n✓ Quality workmanship\n✓ Affordable pricing\n✓ Exceptional customer service\n✓ Fully licensed & insured` },
      { type: 'social_post', title: `📅 Book Your Appointment Today`, body: `Don't wait until it's too late! Our calendar is filling up fast. Book your appointment with ${name} today and experience the difference.\n\n👉 Click the link in bio to schedule!\n\n#LocalBusiness #${cat.replace(/\s+/g, '')} #CommunityFirst` },
      { type: 'social_post', title: `🧹 Quick ${cat} Hack from ${name}`, body: `Want to keep things looking great between professional visits? Here's a quick tip:\n\n✨ [Insert helpful tip specific to ${cat}]\n\nFollow us for more tips and tricks!` },
      { type: 'social_post', title: `📢 We're Hiring! Join the ${name} Team`, body: `🚨 We're growing and looking for talented individuals to join our team!\n\nPositions available:\n• [Position 1]\n• [Position 2]\n\nPerks:\n✓ Competitive pay\n✓ Flexible schedule\n✓ Friendly work environment\n✓ Growth opportunities\n\nDM us for details or send your resume!` },
      { type: 'social_post', title: `🔄 Why ${name} is the Right Choice`, body: `Still deciding? Here are 3 reasons why ${name} should be your top choice:\n\n1️⃣ We prioritize quality over quantity\n2️⃣ Our team is fully trained and certified\n3️⃣ We stand behind our work with a satisfaction guarantee\n\nReady to get started? Contact us today!` },
      { type: 'google_post', title: `${name} — Your Local ${cat} Experts`, body: `Welcome to ${name}! We're your trusted local provider of professional ${cat.toLowerCase()} services. Whether you need routine maintenance or a complete overhaul, our experienced team delivers exceptional results every time.\n\n📍 Serving [City/Area] and surrounding communities\n📞 Call us today to schedule your appointment!\n\n#LocalBusiness #${cat.replace(/\s+/g, '')}` },
      { type: 'google_post', title: `✨ Special Offer: New Customer Discount`, body: `🎉 New customers save 15% on their first service! \n\nAt ${name}, we believe in delivering value from day one. Experience the difference that professional ${cat.toLowerCase()} services can make.\n\nOffer valid for a limited time. Call now to book!\n\n📞 [Phone Number]\n💻 [Website URL]` },
      { type: 'google_post', title: `💡 Tip: Get the Most Out of Your ${cat} Services`, body: `Maximize the value of your ${cat.toLowerCase()} investment with these pro tips from the ${name} team:\n\n1️⃣ Schedule regular maintenance\n2️⃣ Communicate your needs clearly\n3️⃣ Ask questions — we're here to help!\n\nFollow us for more helpful tips!` },
      { type: 'google_post', title: `⭐ See What Our Customers Are Saying`, body: `Don't just take our word for it! Here's what our satisfied customers have to say about ${name}:\n\n⭐⭐⭐⭐⭐\n"Amazing service! Highly recommend ${name} to anyone looking for quality ${cat.toLowerCase()} services. Professional, punctual, and affordable!"\n\nReady to experience the ${name} difference? Contact us today!` },
      { type: 'email', title: `📬 Welcome to ${name}!`, body: `Subject: Welcome to ${name} — Here's What to Expect\n\nHi [First Name],\n\nThank you for choosing ${name}! We're excited to have you as a customer. Here's what you can expect from us:\n\n✅ Professional, reliable service every time\n✅ Transparent pricing with no hidden fees\n✅ Exceptional customer support\n\nAs a thank you for trusting us, here's a special offer for your next visit: [Offer Details]\n\nReady to get started? Book your appointment today!\n\nBest regards,\nThe ${name} Team` },
      { type: 'email', title: `📊 Your Monthly ${cat} Check-in from ${name}`, body: `Subject: Your Monthly ${cat} Check-in\n\nHi [First Name],\n\nWe hope you're enjoying your ${cat.toLowerCase()} services! Here's a quick update and some tips to keep things running smoothly:\n\n📅 Upcoming Maintenance: [Details]\n💡 Pro Tip: [Helpful advice]\n🎉 Special Offer: [Exclusive deal]\n\nQuestions? Reply to this email — we're here to help!\n\nBest,\nThe ${name} Team` },
      { type: 'review_reply', title: `⭐⭐⭐⭐⭐ Positive Review Response`, body: `Thank you so much for your kind words, [Customer Name]! We're thrilled to hear that you had a great experience with us. Your satisfaction is our top priority, and we look forward to serving you again soon!` },
      { type: 'review_reply', title: `⭐⭐⭐⭐ 4-Star Review Response`, body: `Thank you for your feedback, [Customer Name]! We're glad you had a positive experience with ${name}. If there's anything we could have done to earn that 5th star, we'd love to hear your thoughts. Please don't hesitate to reach out!` },
      { type: 'review_reply', title: `⭐⭐⭐ Mixed Review Response`, body: `Thank you for your honest feedback, [Customer Name]. We take all reviews seriously and would love the opportunity to address your concerns. Please contact us directly so we can make things right.` },
      { type: 'review_reply', title: `⭐⭐ Negative Review Response (Professional)`, body: `Hi [Customer Name], we're sorry to hear about your experience. This doesn't reflect the standard of service we aim to provide. Please reach out to us at [contact info] so we can discuss this further and find a resolution. We value your feedback.` },
      { type: 'review_reply', title: `⭐ Critical Review Response (Service Recovery)`, body: `Dear [Customer Name], we sincerely apologize for your experience. We take this very seriously and would appreciate the opportunity to make things right. Please contact our management team at [contact info] so we can address your concerns directly.` },
    ];

    for (const item of items) {
      await execute(
        `INSERT INTO content_items (audit_id, type, title, body, status) VALUES (${safe(auditId)}, ${safe(item.type)}, ${safe(item.title)}, ${safe(item.body)}, 'draft')`
      );
    }

    await execute(`UPDATE audits SET status = 'complete' WHERE id = ${safe(auditId)}`);
    console.log(`Audit ${auditId} content generated successfully (${items.length} items)`);
  } catch (err) {
    console.error(`Error generating content for audit ${auditId}:`, err.message);
  }
}

// GET /api/stripe/config — returns the publishable key for frontend
router.get('/config', (req, res) => {
  res.json({
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder',
    prices: {
      audit: process.env.STRIPE_PRICE_AUDIT || 'price_audit_49',
      subscription: process.env.STRIPE_PRICE_SUBSCRIPTION || 'price_sub_149',
    },
  });
});

// POST /api/stripe/create-checkout-session — creates a Stripe Checkout Session
router.post('/create-checkout-session', async (req, res) => {
  try {
    const { name, website, category, email, type } = req.body;
    // type: 'audit' (one-time $49) or 'subscription' ($149/month)

    if (!name || !website || !category || !email) {
      return res.status(400).json({ error: 'Business name, website, category, and email are required' });
    }

    const safe = (s) => `'${String(s).replace(/'/g, "''")}'`;

    // Find or create business
    let businesses = await query(
      `SELECT id FROM businesses WHERE email = ${safe(email)} AND name = ${safe(name)} LIMIT 1`
    );

    let businessId;
    if (businesses && businesses.length > 0) {
      businessId = businesses[0].id;
    } else {
      await execute(
        `INSERT INTO businesses (name, website, category, email) VALUES (${safe(name)}, ${safe(website)}, ${safe(category)}, ${safe(email)})`
      );
      const newBiz = await query(
        `SELECT id FROM businesses WHERE email = ${safe(email)} AND name = ${safe(name)} ORDER BY created_at DESC LIMIT 1`
      );
      businessId = newBiz?.[0]?.id;
    }

    if (!businessId) {
      return res.status(500).json({ error: 'Failed to get or create business' });
    }

    // Determine price and product details
    const isSubscription = type === 'subscription';
    const amount = isSubscription ? 14900 : 4900; // cents
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
      success_url: `${req.headers.origin || 'http://localhost:3001'}/checkout/success?business_id=${businessId}&type=${isSubscription ? 'subscription' : 'audit'}`,
      cancel_url: `${req.headers.origin || 'http://localhost:3001'}/pricing?canceled=true`,
      customer_email: email,
      metadata: {
        business_id: String(businessId),
        type: isSubscription ? 'subscription' : 'audit',
      },
    });

    // Record the pending payment
    await execute(
      `INSERT INTO payments (business_id, email, amount, currency, stripe_session_id, status, type) VALUES (${safe(businessId)}, ${safe(email)}, ${amount}, 'usd', ${safe(session.id)}, 'pending', ${safe(isSubscription ? 'subscription' : 'audit')})`
    );

    res.json({ sessionId: session.id, url: session.url });
  } catch (err) {
    console.error('Error creating checkout session:', err);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// POST /api/stripe/webhook — Stripe webhook to handle events
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    const stripe = getStripe();
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

    let event;

    // If no webhook secret is configured, parse the raw body directly (dev mode)
    if (!endpointSecret || endpointSecret === 'whsec_placeholder') {
      try {
        event = JSON.parse(req.body.toString());
        console.warn('⚠️  Stripe webhook signature verification skipped (no STRIPE_WEBHOOK_SECRET set)');
      } catch (err) {
        return res.status(400).send('Invalid event body');
      }
    } else {
      try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
      } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const businessId = session.metadata?.business_id;
      const type = session.metadata?.type || 'audit';
      const email = session.customer_email || '';
      const amount = session.amount_total || 0;

      console.log(`✅ Checkout completed: business=${businessId}, type=${type}`);

      if (businessId) {
        const safe = (s) => `'${String(s).replace(/'/g, "''")}'`;

        // Update payment record
        await execute(
          `UPDATE payments SET status = 'completed' WHERE stripe_session_id = ${safe(session.id)}`
        );

        // Create audit and auto-generate content
        await execute(
          `INSERT INTO audits (business_id, status) VALUES (${safe(businessId)}, 'pending')`
        );

        // Get the audit ID we just created
        const audits = await query(
          `SELECT id FROM audits WHERE business_id = ${safe(businessId)} ORDER BY created_at DESC LIMIT 1`
        );

        if (audits && audits.length > 0) {
          const auditId = audits[0].id;
          console.log(`📝 Audit ${auditId} created for business ${businessId}, generating content...`);

          // Auto-generate the audit content
          await generateAuditContent(auditId);
        }
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

module.exports = router;