/**
 * Vercel serverless entry point for LocalBoost AI API.
 */
const express = require('express');
const { query, execute } = require('./db.js');

const app = express();
app.use(express.json());

const safe = (s) => `'${String(s).replace(/'/g, "''")}'`;

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await query('SELECT 1 as ok');
    res.json({ status: 'ok', timestamp: new Date().toISOString(), database: 'connected' });
  } catch (err) {
    res.status(503).json({ status: 'degraded', database: 'error', error: err.message });
  }
});

// POST /api/audits
app.post('/api/audits', async (req, res) => {
  try {
    const { name, website, category, email } = req.body;
    if (!name || !website || !category || !email) return res.status(400).json({ error: 'All fields are required' });
    let businesses = await query(`SELECT id FROM businesses WHERE email = ${safe(email)} AND name = ${safe(name)} LIMIT 1`);
    let businessId;
    if (businesses && businesses.length > 0) businessId = businesses[0].id;
    else {
      await execute(`INSERT INTO businesses (name, website, category, email) VALUES (${safe(name)}, ${safe(website)}, ${safe(category)}, ${safe(email)})`);
      const r = await query(`SELECT id FROM businesses WHERE email = ${safe(email)} AND name = ${safe(name)} ORDER BY created_at DESC LIMIT 1`);
      businessId = r?.[0]?.id;
    }
    if (!businessId) return res.status(500).json({ error: 'Failed to get or create business' });
    await execute(`INSERT INTO audits (business_id, status) VALUES (${safe(businessId)}, 'pending')`);
    const r = await query(`SELECT id FROM audits WHERE business_id = ${safe(businessId)} ORDER BY created_at DESC LIMIT 1`);
    if (!r?.[0]?.id) return res.status(500).json({ error: 'Failed to create audit' });
    res.status(201).json({ id: r[0].id, business_id: businessId, status: 'pending' });
  } catch (err) {
    console.error('Error creating audit:', err);
    res.status(500).json({ error: 'Failed to create audit' });
  }
});

// GET /api/audits/:id
app.get('/api/audits/:id', async (req, res) => {
  try {
    const audits = await query(`SELECT a.id, a.status, a.created_at, b.name as business_name, b.website, b.category FROM audits a JOIN businesses b ON a.business_id = b.id WHERE a.id = ${safe(req.params.id)}`);
    if (!audits?.length) return res.status(404).json({ error: 'Audit not found' });
    audits[0].content = await query(`SELECT id, type, title, body, status FROM content_items WHERE audit_id = ${safe(req.params.id)} ORDER BY type, id`) || [];
    res.json(audits[0]);
  } catch (err) { res.status(500).json({ error: 'Failed to fetch audit' }); }
});

// POST /api/audits/:id/generate
app.post('/api/audits/:id/generate', async (req, res) => {
  try {
    await execute(`UPDATE audits SET status = 'generating' WHERE id = ${safe(req.params.id)}`);
    const audits = await query(`SELECT b.name, b.category FROM audits a JOIN businesses b ON a.business_id = b.id WHERE a.id = ${safe(req.params.id)}`);
    if (!audits?.length) return res.status(404).json({ error: 'Audit not found' });
    const { name: bizName, category: cat } = audits[0];
    const tag = cat.replace(/\s+/g, '');
    const items = [
      { type: 'task', title: `Week 1: Optimize GBP for ${bizName}`, body: `1. Update hours and contact\n2. Add photos\n3. Select categories\n4. Write description\n5. Add services` },
      { type: 'task', title: `Week 2: Social Media Presence`, body: `1. Create/optimize Facebook Page\n2. Set up Instagram\n3. Post 3x this week\n4. Engage with local businesses\n5. Add social links to website` },
      { type: 'task', title: `Week 3: Review Campaign`, body: `1. Send review requests\n2. Reply to all reviews\n3. Add review links\n4. Create review landing page\n5. Monitor daily` },
      { type: 'task', title: `Week 4: Local Ads`, body: `1. Set up Google LSA\n2. Create FB ads (10-mi radius)\n3. Budget $10-15/day\n4. Email newsletter\n5. Track results` },
      { type: 'task', title: `Content Calendar`, body: `Mon: Tip, Wed: Testimonial, Fri: BTS, Sat: Offer` },
    ];
    for (const item of items) {
      await execute(`INSERT INTO content_items (audit_id, type, title, body, status) VALUES (${safe(req.params.id)}, '${item.type}', ${safe(item.title)}, ${safe(item.body)}, 'draft')`);
    }
    const postTypes = ['social_post', 'social_post', 'social_post', 'social_post', 'social_post', 'social_post', 'social_post', 'social_post', 'social_post', 'social_post', 'social_post', 'social_post', 'google_post', 'google_post', 'google_post', 'google_post', 'email', 'email', 'review_reply', 'review_reply', 'review_reply', 'review_reply', 'review_reply'];
    const postTitles = [
      `Tip: ${cat} Pro Tip`, `Customer Spotlight`, `Behind the Scenes`, `Special Offer`, `Before & After`,
      `FAQ: Common Questions`, `Industry Trends`, `Team Spotlight`, `Customer Testimonial`, `Holiday/Seasonal`,
      `Educational: How to Choose`, `Community Involvement`,
      `Welcome Post`, `Service Highlight`, `Customer Appreciation`, `Seasonal Update`,
      `Welcome Email`, `Follow-Up Email`,
      `5-Star Reply`, `4-Star Reply`, `3-Star Reply`, `2-Star Reply`, `1-Star Reply`
    ];
    const postBodies = postTitles.map(t => `Content for ${t} - customize for ${bizName}`);
    for (let i = 0; i < postTypes.length; i++) {
      await execute(`INSERT INTO content_items (audit_id, type, title, body, status) VALUES (${safe(req.params.id)}, '${postTypes[i]}', ${safe(postTitles[i])}, ${safe(postBodies[i])}, 'draft')`);
    }
    await execute(`UPDATE audits SET status = 'complete' WHERE id = ${safe(req.params.id)}`);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Failed to generate' }); }
});

// PATCH /api/audits/content/:id/status
app.patch('/api/audits/content/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['draft', 'approved', 'needs_revision'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
    await execute(`UPDATE content_items SET status = ${safe(status)} WHERE id = ${safe(req.params.id)}`);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Failed to update' }); }
});

// GET /api/businesses
app.get('/api/businesses', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: 'Email required' });
    const businesses = await query(`SELECT b.*, (SELECT COUNT(*) FROM audits a WHERE a.business_id = b.id) as audit_count FROM businesses b WHERE b.email = ${safe(email)} ORDER BY b.created_at DESC`);
    if (!businesses?.length) return res.json([]);
    for (const biz of businesses) {
      biz.audits = await query(`SELECT id, status, created_at FROM audits WHERE business_id = ${safe(biz.id)} ORDER BY created_at DESC`) || [];
    }
    res.json(businesses);
  } catch (err) { res.status(500).json({ error: 'Failed to fetch businesses' }); }
});

// Stripe route
app.use('/api/stripe', require('./routes/payments.js'));

// Serve static frontend
const path = require('path');
const frontendDist = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendDist));
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'API endpoint not found' });
  res.sendFile(path.join(frontendDist, 'index.html'));
});

module.exports = app;