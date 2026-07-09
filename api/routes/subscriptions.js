/**
 * Subscription routes for LocalBoost AI.
 * POST /api/subscribe — Creates business, audit, generates content, creates Stripe invoice.
 */
const express = require('express');
const { query, execute } = require('../db.js');
const Stripe = require('stripe');

const router = express.Router();
router.use(express.json());

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder';
  return new Stripe(key);
}

async function generateFirstWeekContent(auditId, bizName, bizCategory) {
  const safe = (s) => `'${String(s).replace(/'/g, "''")}'`;
  const catTag = bizCategory.replace(/\s+/g, '');
  const items = [
    { type: 'task', title: `Week 1: Optimize GBP for ${bizName}`, body: `1. Update business hours and contact info\n2. Add high-quality photos\n3. Select relevant categories (${bizCategory})\n4. Write compelling description\n5. Add services with pricing` },
    { type: 'task', title: `Week 2: Build Social Presence`, body: `1. Create/optimize Facebook Page\n2. Set up Instagram Business\n3. Post 3x this week using content below\n4. Engage with 5 local businesses\n5. Add social links to website` },
    { type: 'social_post', title: `💡 ${bizCategory} Tip of the Day`, body: `Did you know? Regular ${bizCategory.toLowerCase()} maintenance can extend the life of your investments. Here's a quick tip from ${bizName}:\n\n✅ Pro tip: Don't wait — schedule regular checkups!\n\n#TipOfTheDay #${catTag} #LocalBusiness` },
    { type: 'social_post', title: `⭐ Customer Spotlight`, body: `"Absolutely amazing service! ${bizName} went above and beyond. Highly recommend!"\n\nWe love our customers! 🫶\n\n#CustomerLove #${catTag} #5Stars` },
    { type: 'social_post', title: `🎉 Special Offer`, body: `New customers get 15% off their first service! 🎉\n\nMention this post to redeem. Limited time!\n\n#SpecialOffer #${catTag} #LocalDeals` },
    { type: 'social_post', title: `📅 Book Today`, body: `Don't wait! Our calendar is filling up fast. Book with ${bizName} today.\n\n👉 Click to schedule!\n\n#BookNow #${catTag} #LocalBusiness` },
    { type: 'social_post', title: `👋 Meet the Team`, body: `We couldn't do it without our amazing team! Today we're spotlighting [Name], who has been with us for [X] years.\n\n#TeamSpotlight #${catTag} #OurTeam` },
    { type: 'social_post', title: `📊 Did You Know?`, body: `Businesses with professional ${bizCategory.toLowerCase()} services see 20% more customer satisfaction!\n\nAt ${bizName}, quality is our priority.\n\n#DidYouKnow #${catTag} #QualityService` },
    { type: 'social_post', title: `🏆 Why ${bizName}?`, body: `Here's what sets ${bizName} apart:\n✓ Quality workmanship\n✓ Affordable pricing\n✓ Exceptional service\n✓ Fully licensed & insured\n\n#WhyUs #${catTag} #Trusted` },
    { type: 'social_post', title: `🔧 Quick Hack`, body: `Want to keep things great between visits? Here's a quick tip from ${bizName}:\n\n✨ [Insert tip]\n\nFollow for more!\n\n#TipsAndTricks #${catTag} #ProTips` },
    { type: 'google_post', title: `${bizName} — Local ${bizCategory} Experts`, body: `Welcome to ${bizName}! We're your trusted local provider of professional ${bizCategory.toLowerCase()} services. Serving [City] and surrounding areas. Call today!` },
    { type: 'google_post', title: `✨ Special Offer`, body: `🎉 New customers save 15%! Experience the ${bizName} difference. Call now!` },
    { type: 'google_post', title: `💡 Pro Tip`, body: `Maximize your ${bizCategory.toLowerCase()} investment with tips from ${bizName}. Follow for more!` },
    { type: 'google_post', title: `⭐ Reviews`, body: `Don't just take our word for it! See what our customers say about ${bizName}. Ready to experience the difference? Contact us today!` },
    { type: 'email', title: `📬 Welcome to ${bizName}`, body: `Subject: Welcome to ${bizName}!\n\nHi [Name],\n\nThank you for choosing ${bizName}! We're excited to have you.\n\n✅ Professional service every time\n✅ Transparent pricing\n✅ Exceptional support\n\nBest,\nThe ${bizName} Team` },
    { type: 'email', title: `📊 Monthly Check-in`, body: `Subject: Your Monthly ${bizCategory} Check-in\n\nHi [Name],\n\nHere's a quick update:\n📅 Upcoming: [Details]\n💡 Pro Tip: [Advice]\n🎉 Offer: [Deal]\n\nBest,\nThe ${bizName} Team` },
    { type: 'review_reply', title: `⭐⭐⭐⭐⭐ Positive Review`, body: `Thank you for your kind words, [Name]! We're thrilled you had a great experience with ${bizName}. We look forward to serving you again!` },
    { type: 'review_reply', title: `⭐⭐⭐⭐ 4-Star Review`, body: `Thanks for your feedback, [Name]! We're glad you enjoyed your experience. How can we earn that 5th star?` },
    { type: 'review_reply', title: `⭐⭐⭐ Mixed Review`, body: `Thank you for your honest feedback, [Name]. Please contact us so we can address your concerns.` },
    { type: 'review_reply', title: `⭐⭐ Negative Review`, body: `Hi [Name], we're sorry to hear about your experience. Please reach out so we can make things right.` },
    { type: 'review_reply', title: `⭐ Critical Review`, body: `Dear [Name], we sincerely apologize. Please contact our management team so we can resolve this.` },
  ];

  for (const item of items) {
    await execute(`INSERT INTO content_items (audit_id, type, title, body, status) VALUES (${safe(auditId)}, ${safe(item.type)}, ${safe(item.title)}, ${safe(item.body)}, 'draft')`);
  }
  await execute(`UPDATE audits SET status = 'complete' WHERE id = ${safe(auditId)}`);
  return items.length;
}

// POST /api/subscribe
router.post('/', async (req, res) => {
  try {
    const { name, website, email, category } = req.body;
    if (!name || !website || !email || !category) {
      return res.status(400).json({ error: 'Business name, website, email, and category are required' });
    }

    const safe = (s) => `'${String(s).replace(/'/g, "''")}'`;

    // Create business
    await execute(`INSERT INTO businesses (name, website, category, email) VALUES (${safe(name)}, ${safe(website)}, ${safe(category)}, ${safe(email)})`);
    const bizResult = await query(`SELECT id FROM businesses WHERE email = ${safe(email)} AND name = ${safe(name)} ORDER BY created_at DESC LIMIT 1`);
    const businessId = bizResult?.[0]?.id;
    if (!businessId) return res.status(500).json({ error: 'Failed to create business' });

    // Create audit
    await execute(`INSERT INTO audits (business_id, status) VALUES (${safe(businessId)}, 'generating')`);
    const auditResult = await query(`SELECT id FROM audits WHERE business_id = ${safe(businessId)} ORDER BY created_at DESC LIMIT 1`);
    const auditId = auditResult?.[0]?.id;
    if (!auditId) return res.status(500).json({ error: 'Failed to create audit' });

    // Generate first week of content
    const itemCount = await generateFirstWeekContent(auditId, name, category);

    // Create Stripe invoice
    let invoiceUrl = null;
    try {
      const stripe = getStripe();
      // Find or create customer
      let customers = await stripe.customers.list({ email, limit: 1 });
      let customer = customers.data?.[0];
      if (!customer) {
        customer = await stripe.customers.create({ email, name, metadata: { business_id: String(businessId) } });
      }

      // Create invoice item for $149
      await stripe.invoiceItems.create({
        customer: customer.id,
        amount: 14900,
        currency: 'usd',
        description: 'LocalBoost AI — Monthly Subscription (first month)',
      });

      // Create and finalize invoice
      const invoice = await stripe.invoices.create({
        customer: customer.id,
        collection_method: 'send_invoice',
        days_until_due: 7,
        metadata: { business_id: String(businessId), audit_id: String(auditId) },
      });

      const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);
      invoiceUrl = finalizedInvoice.hosted_invoice_url;
    } catch (stripeErr) {
      console.error('Stripe invoice creation failed:', stripeErr.message);
      // Don't fail — subscription still recorded
    }

    // Record payment
    await execute(`INSERT INTO payments (business_id, email, amount, currency, status, type) VALUES (${safe(businessId)}, ${safe(email)}, 14900, 'usd', 'pending', 'subscription')`);

    res.status(201).json({
      success: true,
      businessId,
      auditId,
      itemCount,
      invoiceUrl,
      message: invoiceUrl
        ? `Subscription created! Check your email for the invoice.`
        : `Subscription recorded. We'll invoice you at ${email}.`,
    });
  } catch (err) {
    console.error('Subscription error:', err);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

module.exports = router;