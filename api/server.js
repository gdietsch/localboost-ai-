/**
 * Vercel serverless entry point for LocalBoost AI API.
 */
const express = require('express');
const cors = require('cors');
const { query, execute } = require('./db.js');

const app = express();

app.use(cors());

// Stripe webhook needs raw body — mount BEFORE json parser
app.use('/api/stripe', require('./routes/payments.js'));

// JSON body parser for all other routes
app.use(express.json());

// GET /api/health — Health check endpoint (no auth required)
app.get('/api/health', async (req, res) => {
  try {
    const result = await query('SELECT 1 as ok');
    const dbOk = result && result.length > 0 && result[0].ok === 1;
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: dbOk ? 'connected' : 'error',
      version: '1.0.0',
    });
  } catch (err) {
    res.status(503).json({
      status: 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'disconnected',
      error: err.message,
    });
  }
});

const safe = (s) => `'${String(s).replace(/'/g, "''")}'`;

// POST /audits - Create a new audit
app.post('/audits', async (req, res) => {
  try {
    const { name, website, category, email } = req.body;
    if (!name || !website || !category || !email) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    let businesses = await query(`SELECT id FROM businesses WHERE email = ${safe(email)} AND name = ${safe(name)} LIMIT 1`);
    let businessId;
    if (businesses && businesses.length > 0) {
      businessId = businesses[0].id;
    } else {
      await execute(`INSERT INTO businesses (name, website, category, email) VALUES (${safe(name)}, ${safe(website)}, ${safe(category)}, ${safe(email)})`);
      const newBiz = await query(`SELECT id FROM businesses WHERE email = ${safe(email)} AND name = ${safe(name)} ORDER BY created_at DESC LIMIT 1`);
      businessId = newBiz?.[0]?.id;
    }
    if (!businessId) return res.status(500).json({ error: 'Failed to get or create business' });
    await execute(`INSERT INTO audits (business_id, status) VALUES (${safe(businessId)}, 'pending')`);
    const auditResult = await query(`SELECT id FROM audits WHERE business_id = ${safe(businessId)} ORDER BY created_at DESC LIMIT 1`);
    const auditId = auditResult[0]?.id;
    if (!auditId) return res.status(500).json({ error: 'Failed to create audit' });
    res.status(201).json({ id: auditId, business_id: businessId, status: 'pending' });
  } catch (err) {
    console.error('Error creating audit:', err);
    res.status(500).json({ error: 'Failed to create audit' });
  }
});

// GET /audits/:id - Get audit details
app.get('/audits/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const audits = await query(`SELECT a.id, a.status, a.created_at, b.name as business_name, b.website, b.category FROM audits a JOIN businesses b ON a.business_id = b.id WHERE a.id = ${safe(id)}`);
    if (!audits || audits.length === 0) return res.status(404).json({ error: 'Audit not found' });
    const audit = audits[0];
    const content = await query(`SELECT id, type, title, body, status FROM content_items WHERE audit_id = ${safe(id)} ORDER BY type, id`);
    audit.content = content || [];
    res.json(audit);
  } catch (err) {
    console.error('Error fetching audit:', err);
    res.status(500).json({ error: 'Failed to fetch audit' });
  }
});

// POST /audits/:id/generate - Generate audit content
app.post('/audits/:id/generate', async (req, res) => {
  try {
    const { id } = req.params;
    await execute(`UPDATE audits SET status = 'generating' WHERE id = ${safe(id)}`);
    const audits = await query(`SELECT b.name as business_name, b.category, b.website FROM audits a JOIN businesses b ON a.business_id = b.id WHERE a.id = ${safe(id)}`);
    if (!audits || audits.length === 0) return res.status(404).json({ error: 'Audit not found' });
    const biz = audits[0];
    const name = biz.business_name;
    const cat = biz.category;
    const catTag = cat.replace(/\s+/g, '');
    const items = [
      { type: 'task', title: `Week 1: Optimize Google Business Profile for ${name}`, body: `1. Update business hours and contact info\n2. Add high-quality photos of your work\n3. Select relevant categories (${cat})\n4. Write a compelling business description\n5. Add services/products with pricing` },
      { type: 'task', title: `Week 2: Build Social Media Presence`, body: `1. Create/optimize Facebook Business Page\n2. Set up Instagram Business account\n3. Post 3 times this week using the content ideas below\n4. Engage with 5 local businesses' posts\n5. Add social media links to your website` },
      { type: 'task', title: `Week 3: Launch Review & Reputation Campaign`, body: `1. Send review request emails to past 20 customers\n2. Reply to all existing reviews using templates below\n3. Add review links to email signature\n4. Create a "Leave us a review" landing page\n5. Monitor new reviews daily` },
      { type: 'task', title: `Week 4: Run Local Ad Campaign`, body: `1. Set up Google Local Services Ads\n2. Create Facebook ad targeting local audience (10-mile radius)\n3. Budget: $10-15/day for first week\n4. Use the email drafts below for newsletter\n5. Track results and adjust targeting` },
      { type: 'task', title: `Content Calendar Setup`, body: `Create a monthly content calendar for ${name}:\n- Monday: Tip/Tutorial post\n- Wednesday: Customer testimonial or before/after\n- Friday: Behind-the-scenes or team spotlight\n- Saturday: Promotion or special offer\n- Google Post: Weekly update` },
      { type: 'social_post', title: `Tip: ${cat} Pro Tip`, body: `💡 Pro Tip from ${name}!\n\nDid you know? [Insert helpful industry tip here]\n\nSave this for later and tag a friend who needs to know! 👇\n\n#LocalBusiness #${catTag} #ProTips` },
      { type: 'social_post', title: `Customer Spotlight`, body: `⭐️ Happy Customer Alert!\n\n"Best experience with ${name}! They went above and beyond."\n\nWe love making our customers smile. Want to join them? Book now!\n\nLink in bio 🔗\n\n#CustomerLove #${catTag} #5StarExperience` },
      { type: 'social_post', title: `Behind the Scenes`, body: `👋 Meet the team behind ${name}!\n\nWe're passionate about what we do, and it shows in every project.\n\nSwipe to see us in action! ➡️\n\nWant to work with us? DM to book 📩\n\n#BehindTheScenes #TeamWork #LocalBiz` },
      { type: 'social_post', title: `Special Offer`, body: `🎉 SPECIAL OFFER 🎉\n\nFor a limited time, get [discount/offer] when you mention this post!\n\nAt ${name}, we're committed to delivering the best ${cat.toLowerCase()} services.\n\nOffer valid until [date]. Don't miss out!\n\n#SpecialOffer #LocalDeals #${catTag}` },
      { type: 'social_post', title: `Before & After`, body: `✨ Transformation Tuesday! ✨\n\nCheck out this amazing before and after by ${name}.\n\nFrom start to finish, we pour our heart into every project.\n\nReady for your own transformation? Book a consultation today!\n\n#TransformationTuesday #BeforeAndAfter #${catTag}` },
      { type: 'social_post', title: `FAQ: Common Questions`, body: `🤔 Frequently Asked Questions\n\nQ: How long does a typical service take?\nA: [Answer]\n\nQ: Do you offer free estimates?\nA: [Answer]\n\nQ: What areas do you serve?\nA: [Answer]\n\nHave more questions? Drop them in the comments! 💬\n\n#FAQ #${catTag} #CustomerService` },
      { type: 'social_post', title: `Industry Trends`, body: `📊 Industry Update 📊\n\nHere's what's trending in ${cat.toLowerCase()} this year:\n\n1️⃣ [Trend 1]\n2️⃣ [Trend 2]\n3️⃣ [Trend 3]\n\nStay ahead of the curve with ${name}! We keep up with the latest so you don't have to.\n\n#IndustryTrends #${catTag} #StayAhead` },
      { type: 'social_post', title: `Team Spotlight`, body: `🌟 Team Spotlight 🌟\n\nMeet [Name] — our amazing [Role] at ${name}!\n\n[They've] been with us for [X] years and brings incredible expertise to every project.\n\nFun fact: [Fun fact about team member]\n\n#TeamSpotlight #OurTeam #${catTag}` },
      { type: 'social_post', title: `Customer Testimonial`, body: `🗣️ Don't just take our word for it!\n\n"${name} exceeded all my expectations. Professional, timely, and the quality was outstanding!"\n\n— [Customer Name]\n\nWe pride ourselves on 5-star service. Ready to experience it?\n\n#Testimonial #5StarReview #${catTag}` },
      { type: 'social_post', title: `Holiday/Seasonal Post`, body: `🎄 Happy Holidays from ${name}! 🎄\n\nAs we wrap up another amazing year, we want to thank our incredible customers for your support.\n\nWishing you and your family a wonderful holiday season and a happy New Year! ✨\n\n#HappyHolidays #ThankYou #${catTag}` },
      { type: 'social_post', title: `Educational: How to Choose`, body: `📚 How to Choose the Right ${catTag} Service\n\nNot sure what to look for? Here are 5 tips:\n\n1️⃣ Check reviews and testimonials\n2️⃣ Ask about experience and training\n3️⃣ Get multiple quotes\n4️⃣ Verify insurance and licenses\n5️⃣ Trust your gut\n\nAt ${name}, we check all the boxes. Book with confidence!\n\n#TipsAndTricks #HowToChoose #${catTag}` },
      { type: 'social_post', title: `Community Involvement`, body: `🤝 Giving Back to Our Community 🤝\n\nAt ${name}, we believe in supporting our local community.\n\nRecently, we [describe community involvement or charity work].\n\nTogether, we make our community stronger! 💪\n\n#CommunityFirst #GivingBack #LocalLove` },
      { type: 'google_post', title: `Welcome Post`, body: `Welcome to ${name}! We're proud to serve the local community with top-quality ${cat.toLowerCase()} services. Contact us today to learn more about what we can do for you!` },
      { type: 'google_post', title: `Service Highlight`, body: `Did you know ${name} offers [specific service]? Our team of experienced professionals is ready to help you get the results you deserve. Call or visit our website to book an appointment!` },
      { type: 'google_post', title: `Customer Appreciation`, body: `Thank you to all our amazing customers! Your support means the world to us.` },
      { type: 'google_post', title: `Seasonal Update`, body: `As the seasons change, so do your needs. At ${name}, we're here to help with all your ${cat.toLowerCase()} needs.` },
      { type: 'email', title: `Welcome Email Series - Part 1`, body: `Subject: Welcome to ${name}! Here's What to Expect\n\nHi [Customer Name],\n\nThank you for choosing ${name}! We're excited to have you on board.\n\nBest regards,\nThe ${name} Team` },
      { type: 'email', title: `Follow-Up & Review Request`, body: `Subject: How Was Your Experience with ${name}?\n\nHi [Customer Name],\n\nWe hope you loved your experience with us! Could you take 30 seconds to leave us a review?\n\nThanks again!` },
      { type: 'review_reply', title: `5-Star Review Reply`, body: `Thank you so much for your kind words, [Customer Name]! We're thrilled you had a positive experience. We look forward to serving you again!` },
      { type: 'review_reply', title: `4-Star Review Reply`, body: `Thank you for your feedback, [Customer Name]! We're glad you had a good experience. Please let us know how we can earn that 5th star!` },
      { type: 'review_reply', title: `3-Star Review Reply`, body: `Thank you for your honest feedback. We'd love the opportunity to make things right. Please contact us directly.` },
      { type: 'review_reply', title: `2-Star Review Reply`, body: `We're sorry your experience didn't meet expectations. Please reach out so we can understand what went wrong.` },
      { type: 'review_reply', title: `1-Star Review Reply`, body: `We sincerely apologize for your experience. Please contact us directly so we can resolve this.` },
    ];
    for (const item of items) {
      await execute(`INSERT INTO content_items (audit_id, type, title, body, status) VALUES (${safe(id)}, ${safe(item.type)}, ${safe(item.title)}, ${safe(item.body)}, 'draft')`);
    }
    await execute(`UPDATE audits SET status = 'complete' WHERE id = ${safe(id)}`);
    res.json({ success: true, message: 'Audit generated successfully' });
  } catch (err) {
    console.error('Error generating audit:', err);
    res.status(500).json({ error: 'Failed to generate audit content' });
  }
});

// PATCH /audits/content/:id/status
app.patch('/audits/content/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['draft', 'approved', 'needs_revision'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
    await execute(`UPDATE content_items SET status = ${safe(status)} WHERE id = ${safe(id)}`);
    res.json({ success: true });
  } catch (err) {
    console.error('Error updating content status:', err);
    res.status(500).json({ error: 'Failed to update content status' });
  }
});

// GET /businesses?email=xxx
app.get('/businesses', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: 'Email parameter is required' });
    const businesses = await query(`SELECT b.id, b.name, b.website, b.category, b.email, b.created_at, (SELECT COUNT(*) FROM audits a WHERE a.business_id = b.id) as audit_count FROM businesses b WHERE b.email = ${safe(email)} ORDER BY b.created_at DESC`);
    if (!businesses || businesses.length === 0) return res.json([]);
    const result = [];
    for (const biz of businesses) {
      const audits = await query(`SELECT id, status, created_at FROM audits WHERE business_id = ${safe(biz.id)} ORDER BY created_at DESC`);
      result.push({ ...biz, audits: audits || [] });
    }
    res.json(result);
  } catch (err) {
    console.error('Error fetching businesses:', err);
    res.status(500).json({ error: 'Failed to fetch businesses' });
  }
});

// Phase 2: Scheduler routes
app.use('/api/scheduler', require('./routes/scheduler.js'));

// Phase 3: Analysis routes
app.use('/api/analysis', require('./routes/analysis.js'));

// Serve static frontend
const frontendDist = require('path').join(__dirname, '../frontend/dist');
app.use(express.static(frontendDist));

// SPA fallback
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'API endpoint not found' });
  res.sendFile(require('path').join(frontendDist, 'index.html'));
});

