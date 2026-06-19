import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import auditRoutes from './routes/audit.js';
import businessRoutes from './routes/business.js';
import stripeRoutes from './routes/payments.js';
import schedulerRoutes from './routes/scheduler.js';
import { query, execute } from './models/db.js';
import { sendAuditEmail } from './services/email.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

const safe = (s) => `'${String(s).replace(/'/g, "''")}'`;

// Middleware
app.use(cors());

// Stripe webhook needs raw body — mount BEFORE json parser
app.use('/api/stripe', stripeRoutes);

// JSON parser for all other routes
app.use(express.json());

// API routes
app.use('/api/audits', auditRoutes);
app.use('/api/businesses', businessRoutes);
app.use('/api/scheduler', schedulerRoutes);

// POST /api/audits/claim — Claim an audit by email and send it via email
app.post('/api/audits/claim', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const businesses = await query(`SELECT id, name, email, website, category FROM businesses WHERE email = ${safe(email)} ORDER BY created_at DESC LIMIT 1`);
    if (!businesses || businesses.length === 0) {
      return res.status(404).json({ error: 'No account found with this email. Did you start a free audit?' });
    }

    const biz = businesses[0];
    const audits = await query(
      `SELECT id, status, created_at FROM audits WHERE business_id = ${safe(biz.id)} AND status = 'complete' ORDER BY created_at DESC LIMIT 1`
    );
    if (!audits || audits.length === 0) {
      return res.status(404).json({ error: 'No completed audit found. Your audit may still be generating — please try again in a moment.' });
    }

    const audit = audits[0];
    const content = await query(`SELECT id, type, title, body, status FROM content_items WHERE audit_id = ${safe(audit.id)} ORDER BY type, id`);
    audit.content = content || [];

    if (audit.content.length === 0) {
      return res.status(404).json({ error: 'Your audit is empty. It may still be generating — try again shortly.' });
    }

    const claimUrl = `${req.protocol}://${req.get('host')}/audit/${audit.id}`;
    await sendAuditEmail(biz, audit, claimUrl);

    res.json({
      success: true,
      audit: { id: audit.id, business_name: biz.name, category: biz.category, website: biz.website, email: biz.email, content: audit.content, created_at: audit.created_at },
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

    res.json({ id: audit.id, business_name: biz.name, category: biz.category, website: biz.website, email: biz.email, content: audit.content, created_at: audit.created_at, status: audit.status });
  } catch (err) {
    console.error('Error fetching my audit:', err);
    res.status(500).json({ error: 'Failed to fetch audit' });
  }
});

// Serve static frontend files
const frontendDist = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendDist));

// SPA fallback
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'API endpoint not found' });
  res.sendFile(path.join(frontendDist, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`LocalBoost AI server running on http://0.0.0.0:${PORT}`);
});