/**
 * Scheduler route for weekly content generation & approval (CommonJS - Vercel).
 */
const express = require('express');
const { query, execute } = require('../db.js');
const { sendApprovalEmail } = require('../services/email.js');
const { autoPost } = require('../services/poster.js');
const { generateWeeklyPlan } = require('../services/weekly-plan.js');

const router = express.Router();
const safe = (s) => `'${String(s).replace(/'/g, "''")}'`;
const FROM_EMAIL = process.env.FROM_EMAIL || 'hello@localboosts.biz';

/**
 * POST /api/scheduler/weekly-content
 * Generates content for all active paid businesses for the coming week.
 * This is called by the GitHub Actions cron job every Sunday.
 */
router.post('/weekly-content', async (req, res) => {
  try {
    // Get all businesses that have paid subscriptions (have payments)
    const businesses = await query(`
      SELECT DISTINCT b.id, b.name, b.email, b.website, b.category
      FROM businesses b
      JOIN payments p ON b.id = p.business_id
      WHERE p.status = 'completed'
        AND (p.type = 'subscription' OR p.type = 'audit')
    `);

    if (!businesses || businesses.length === 0) {
      return res.json({ message: 'No active businesses found', generated: 0 });
    }

    let totalGenerated = 0;
    let emailsSent = 0;

    for (const biz of businesses) {
      try {
        // Create a new audit record for this week's content
        await execute(`INSERT INTO audits (business_id, status) VALUES (${safe(biz.id)}, 'generating')`);

        const auditResult = await query(
          `SELECT id FROM audits WHERE business_id = ${safe(biz.id)} ORDER BY created_at DESC LIMIT 1`
        );
        const auditId = auditResult[0]?.id;
        if (!auditId) continue;

        const name = biz.name;
        const cat = biz.category;
        const website = biz.website || '[website]';
        const catTag = cat.replace(/\s+/g, '');

        // Generate complete weekly marketing plan using the plan generator
        const plan = await generateWeeklyPlan(biz.id, auditId, name, cat);

        await execute(`UPDATE audits SET status = 'complete' WHERE id = ${safe(auditId)}`);
        totalGenerated++;

        // Send approval email
        const contentItems = await query(
          `SELECT id, type, title, body, status FROM content_items WHERE audit_id = ${safe(auditId)}`
        );
        if (contentItems && contentItems.length > 0) {
          const sent = await sendApprovalEmail(biz, contentItems);
          if (sent) emailsSent++;
        }
      } catch (bizErr) {
        console.error(`Error processing business ${biz.id}:`, bizErr.message);
      }
    }

    res.json({
      message: 'Weekly content generation complete',
      totalGenerated,
      emailsSent,
    });
  } catch (err) {
    console.error('Weekly content error:', err);
    res.status(500).json({ error: 'Failed to generate weekly content' });
  }
});

/**
 * POST /api/approve-content/:contentId
 * Approves a single content item and auto-posts it.
 */
router.post('/approve-content/:contentId', async (req, res) => {
  try {
    const { contentId } = req.params;

    const items = await query(`SELECT id, type, title, body, status FROM content_items WHERE id = ${safe(contentId)}`);
    if (!items || items.length === 0) {
      return res.status(404).json({ error: 'Content not found' });
    }

    const item = items[0];
    if (item.status !== 'draft') {
      return res.json({ message: `Content already ${item.status}`, contentId });
    }

    await execute(`UPDATE content_items SET status = 'approved' WHERE id = ${safe(contentId)}`);

    // Auto-post the approved content
    try {
      await autoPost(item);
    } catch (postErr) {
      console.error('Auto-post error:', postErr.message);
    }

    res.json({ message: 'Content approved and posted', contentId });
  } catch (err) {
    console.error('Approve content error:', err);
    res.status(500).json({ error: 'Failed to approve content' });
  }
});

/**
 * POST /api/approve-all/:auditId
 * Approves all draft content for an audit/week.
 */
router.post('/approve-all/:auditId', async (req, res) => {
  try {
    const { auditId } = req.params;

    const items = await query(
      `SELECT id, type, title, body, status FROM content_items WHERE audit_id = ${safe(auditId)} AND status = 'draft'`
    );

    if (!items || items.length === 0) {
      return res.json({ message: 'No draft content to approve', approved: 0 });
    }

    let approved = 0;
    for (const item of items) {
      await execute(`UPDATE content_items SET status = 'approved' WHERE id = ${safe(item.id)}`);
      try {
        await autoPost(item);
      } catch (postErr) {
        console.error(`Auto-post error for ${item.id}:`, postErr.message);
      }
      approved++;
    }

    res.json({ message: `Approved ${approved} items`, approved });
  } catch (err) {
    console.error('Approve all error:', err);
    res.status(500).json({ error: 'Failed to approve content' });
  }
});

/**
 * POST /api/scheduler/follow-up-emails
 * Sends follow-up emails to users who started a free audit but haven't paid.
 * Call this daily via a cron job.
 */
router.post('/follow-up-emails', async (req, res) => {
  try {
    // Find audits created > 1 day ago that are still pending (never paid)
    const pendingAudits = await query(`
      SELECT a.id, b.name, b.email, b.website, b.category
      FROM audits a
      JOIN businesses b ON a.business_id = b.id
      WHERE a.status = 'pending'
        AND a.created_at < datetime('now', '-1 day')
        AND (b.email NOT LIKE 'audit-%@localboosts.biz')
      ORDER BY a.created_at DESC
      LIMIT 20
    `);

    if (!pendingAudits || pendingAudits.length === 0) {
      return res.json({ message: 'No pending audits to follow up', sent: 0 });
    }

    let sent = 0;
    for (const biz of pendingAudits) {
      try {
        // Check if we already sent a follow-up (stored in a followup flag)
        const existing = await query(
          `SELECT id FROM content_items WHERE audit_id = ${safe(biz.id)} AND type = 'email' AND title LIKE '[followup]%' LIMIT 1`
        );
        if (existing && existing.length > 0) continue;

        const msg = {
          to: biz.email,
          from: FROM_EMAIL,
          subject: `Your ${biz.name} audit found issues — here's what's next`,
          body: `<div style="max-width:600px;margin:0 auto;font-family:sans-serif;">
            <div style="background:linear-gradient(135deg,#2563eb,#1e40af);color:white;padding:32px;text-align:center;border-radius:12px 12px 0 0;">
              <h1 style="margin:0;font-size:22px;">📊 Your Audit Is Ready</h1>
            </div>
            <div style="background:white;border:1px solid #e5e7eb;padding:32px;border-radius:0 0 12px 12px;">
              <p>Hi there,</p>
              <p>Your free audit for <strong>${biz.name}</strong> (${biz.website}) found several issues costing you money.</p>
              <p>For just <strong>$49</strong>, you get:</p>
              <ul>
                <li>Step-by-step fix instructions</li>
                <li>28 ready-to-use content pieces</li>
                <li>Platform-specific guides (WordPress, Wix, Squarespace)</li>
                <li>Revenue loss calculator</li>
              </ul>
              <div style="text-align:center;margin:24px 0;">
                <a href="https://buy.stripe.com/28EfZh6yHgNRg3MaFd5ZC01" style="display:inline-block;background:#2563eb;color:white;padding:12px 32px;border-radius:8px;text-decoration:none;font-size:16px;font-weight:600;">
                  Unlock Full Report — $49 →
                </a>
              </div>
              <p style="color:#6b7280;font-size:12px;">You received this email because you started a free audit on localboosts.biz.</p>
            </div>
          </div>`,
        };

        const plunkRes = await fetch('https://next-api.useplunk.com/v1/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.PLUNK_API_KEY || ''}` },
          body: JSON.stringify(msg),
        });

        if (plunkRes.ok) {
          // Mark follow-up as sent
          await execute(`INSERT INTO content_items (audit_id, type, title, body, status) VALUES (${safe(biz.id)}, 'email', '[followup] Follow-up email sent', 'sent', 'approved')`);
          sent++;
          console.log(`📧 Follow-up sent to ${biz.email}`);
        }
      } catch (err) {
        console.error(`Follow-up error for ${biz.email}:`, err.message);
      }
    }

    res.json({ message: 'Follow-up emails sent', sent });
  } catch (err) {
    console.error('Follow-up emails error:', err);
    res.status(500).json({ error: 'Failed to send follow-up emails' });
  }
});

module.exports = router;