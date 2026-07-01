/**
 * LocalBoost AI API Server (build: 3) — Force Vercel rebuild
 * Vercel serverless entry point for LocalBoost AI API.
 */
const express = require('express');
const cors = require('cors');
const { query, execute } = require('./db.js');

const app = express();

// CORS for all routes
app.use(cors());

// Stripe webhook needs raw body — mount BEFORE global JSON parser
const stripeRouter = require('./routes/payments.js');
app.use('/api/stripe', stripeRouter);

// JSON body parser for all other API routes
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

// POST /api/audits - Create a new audit
app.post('/api/audits', async (req, res) => {
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

// GET /api/audits/:id - Get audit details
app.get('/api/audits/:id', async (req, res) => {
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

// POST /api/audits/:id/generate - Generate audit content
app.post('/api/audits/:id/generate', async (req, res) => {
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

// PATCH /api/audits/content/:id/status
app.patch('/api/audits/content/:id/status', async (req, res) => {
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

// GET /api/businesses?email=xxx
app.get('/api/businesses', async (req, res) => {
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

// POST /api/audits/claim — Claim an audit by email, send it via email
const { sendAuditEmail } = require('./services/email.js');

app.post('/api/audits/claim', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    // Look up the business and their latest completed audit
    const businesses = await query(`SELECT id, name, email, website, category FROM businesses WHERE email = ${safe(email)} ORDER BY created_at DESC LIMIT 1`);
    if (!businesses || businesses.length === 0) {
      return res.status(404).json({ error: 'No account found with this email. Did you start a free audit?' });
    }

    const biz = businesses[0];

    // Find the latest completed audit that has content
    const audits = await query(
      `SELECT id, status, created_at FROM audits WHERE business_id = ${safe(biz.id)} AND status IN ('complete', 'pending') ORDER BY created_at DESC LIMIT 1`
    );
    if (!audits || audits.length === 0) {
      return res.status(404).json({ error: 'No audit found. Did you start a free audit first?' });
    }

    const audit = audits[0];
    const content = await query(`SELECT id, type, title, body, status FROM content_items WHERE audit_id = ${safe(audit.id)} ORDER BY type, id`);
    audit.content = content || [];

    if (audit.content.length === 0) {
      return res.status(404).json({ error: 'Your audit is empty. It may still be generating — try again shortly.' });
    }

    // Send the audit via email
    const claimUrl = `${req.protocol}://${req.get('host')}/audit/${audit.id}`;
    await sendAuditEmail(biz, audit, claimUrl);

    res.json({
      success: true,
      audit: {
        id: audit.id,
        business_name: biz.name,
        category: biz.category,
        website: biz.website,
        email: biz.email,
        content: audit.content,
        created_at: audit.created_at,
      },
      emailed: true,
      message: 'Audit found! Check your email — we sent it to ' + biz.email,
    });
  } catch (err) {
    console.error('Error claiming audit:', err);
    res.status(500).json({ error: 'Failed to claim audit' });
  }
});

// GET /api/audits/my-audit?email=xxx — Look up latest audit by email
app.get('/api/audits/my-audit', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: 'Email parameter is required' });

    const businesses = await query(`SELECT id, name, email, website, category FROM businesses WHERE email = ${safe(email)} ORDER BY created_at DESC LIMIT 1`);
    if (!businesses || businesses.length === 0) {
      return res.status(404).json({ error: 'No account found with this email. Start a free audit first!' });
    }

    const biz = businesses[0];
    const audits = await query(
      `SELECT id, status, created_at FROM audits WHERE business_id = ${safe(biz.id)} AND status = 'complete' ORDER BY created_at DESC LIMIT 1`
    );
    if (!audits || audits.length === 0) {
      return res.status(404).json({ error: 'No completed audit found.' });
    }

    const audit = audits[0];
    const content = await query(`SELECT id, type, title, body, status FROM content_items WHERE audit_id = ${safe(audit.id)} ORDER BY type, id`);
    audit.content = content || [];

    res.json({
      id: audit.id,
      business_name: biz.name,
      category: biz.category,
      website: biz.website,
      email: biz.email,
      content: audit.content,
      created_at: audit.created_at,
      status: audit.status,
    });
  } catch (err) {
    console.error('Error fetching my audit:', err);
    res.status(500).json({ error: 'Failed to fetch audit' });
  }
});

// Serve static frontend
const frontendDist = require('path').join(__dirname, '../frontend/dist');
app.use(express.static(frontendDist));

// SPA fallback
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'API endpoint not found' });
  res.sendFile(require('path').join(frontendDist, 'index.html'));
});

// Local dev server
if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => console.log(`LocalBoost AI server running on http://localhost:${PORT}`));
}

module.exports = app;