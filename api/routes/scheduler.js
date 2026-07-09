/**
 * Scheduler route for weekly content generation & approval (CommonJS - Vercel).
 */
const express = require('express');
const { query, execute } = require('../db.js');
const { sendApprovalEmail } = require('../services/email.js');
const { autoPost } = require('../services/poster.js');

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
        const catTag = cat.replace(/\s+/g, '');

        // Generate content items
        const items = [
          { type: 'task', title: `Week Ahead: Priorities for ${name}`, body: `Top priorities this week:\n1. Post daily social content\n2. Respond to new reviews\n3. Track lead sources\n4. Review weekly analytics` },
          { type: 'task', title: `Content Calendar: ${name}`, body: `This week's schedule:\n- Monday: Tip post\n- Tuesday: Customer testimonial\n- Wednesday: Behind the scenes\n- Thursday: FAQ\n- Friday: Special offer\n- Saturday: Community post` },
          { type: 'social_post', title: `Monday Motivation: ${cat} Tips`, body: `💪 Start your week strong with ${name}!\n\nHere's a quick tip for your ${cat.toLowerCase()} needs:\n[Insert tip here]\n\nBook your appointment today! 📅\n\n#MondayMotivation #${catTag} #LocalBusiness` },
          { type: 'social_post', title: `Customer Spotlight: ${name}`, body: `🌟 Customer Spotlight! 🌟\n\nWe love hearing from our customers! Here's what [Customer] had to say about ${name}:\n\n"${name} was amazing! Highly recommend."\n\nWant to share your experience? Leave us a review! ⭐\n\n#CustomerLove #${catTag} #5Stars` },
          { type: 'social_post', title: `Behind the Scenes`, body: `👋 Behind the scenes at ${name}!\n\nHere's what goes into making our service exceptional:\n✓ Training & expertise\n✓ Quality materials & tools\n✓ Customer-first approach\n\nWant to learn more? Visit our website!\n\n#BehindTheScenes #${catTag} #QualityService` },
          { type: 'social_post', title: `FAQ Friday`, body: `❓ FAQ Friday! ❓\n\nQ: How do I book a service?\nA: Visit our website or give us a call!\n\nQ: What areas do you serve?\nA: [Service area]\n\nHave more questions? Drop them below! 💬\n\n#FAQFriday #${catTag} #CustomerService` },
          { type: 'social_post', title: `Weekly Special`, body: `🎉 Weekly Special! 🎉\n\nMention this post and get [special offer] when you book with ${name}!\n\nLimited time offer — don't miss out! ⏰\n\n#SpecialOffer #${catTag} #LocalDeals` },
          { type: 'social_post', title: `Community Post`, body: `🌍 Proud to serve our community!\n\nAt ${name}, we believe in giving back. This week we're supporting [cause/event].\n\nJoin us in making a difference! 🤝\n\n#CommunityFirst #${catTag} #LocalBusiness` },
          { type: 'social_post', title: `Tip Tuesday`, body: `📌 Tip Tuesday with ${name}!\n\nSave time and money with this pro tip:\n[Insert tip]\n\nFollow us for more tips every week! ✅\n\n#TipTuesday #${catTag} #ProTips` },
          { type: 'social_post', title: `Throwback Thursday`, body: `📸 Throwback Thursday! 📸\n\nHere's one of our favorite projects from [month/year].\n\nQuality and attention to detail — that's what ${name} is all about.\n\n#ThrowbackThursday #TBT #${catTag}` },
          { type: 'social_post', title: `Weekend Vibes`, body: `☀️ Weekend vibes from ${name}!\n\nRelax and unwind — we'll handle the rest.\n\nReady for the week ahead? Book your appointment now!\n\n#WeekendVibes #${catTag} #SelfCare` },
          { type: 'social_post', title: `Did You Know?`, body: `💡 Did You Know?\n\n[Insert interesting industry fact]\n\nAt ${name}, we stay ahead of the curve so you don't have to.\n\nFollow for more insights! 🔔\n\n#DidYouKnow #${catTag} #IndustryFacts` },
          { type: 'google_post', title: `Weekly Update: ${name}`, body: `This week at ${name}: We're fully booked and ready to serve you! Contact us today to schedule your appointment.` },
          { type: 'google_post', title: `Service Highlight`, body: `Check out our latest service offerings at ${name}. We're dedicated to providing the best ${cat.toLowerCase()} experience in town.` },
          { type: 'google_post', title: `Customer Thank You`, body: `Thank you to all our customers for your continued support! We appreciate each and every one of you.` },
          { type: 'google_post', title: `Weekly Offer`, body: `Special offer this week at ${name}! Contact us for details and mention this post.` },
          { type: 'email', title: `Weekly Newsletter: ${name}`, body: `Subject: What's New at ${name} This Week\n\nHi [Customer Name],\n\nHere's what's happening this week:\n• New tips and tricks\n• Special offers\n• Community events\n\nStay connected with us on social media!\n\nThe ${name} Team` },
          { type: 'email', title: `Follow-Up: ${name}`, body: `Subject: How was your experience?\n\nHi [Customer Name],\n\nWe hope you enjoyed your experience. Your feedback helps us improve.\n\nLeave a review: [Link]\n\nThanks for choosing ${name}!` },
          { type: 'review_reply', title: `5-Star Reply`, body: `Thank you for the wonderful review! We're thrilled you had a great experience with ${name}. We look forward to serving you again!` },
          { type: 'review_reply', title: `4-Star Reply`, body: `Thanks for your feedback! We're glad you enjoyed your experience. We always strive to improve — please let us know how we can earn that 5th star!` },
          { type: 'review_reply', title: `3-Star Reply`, body: `Thank you for your honest review. We'd love the opportunity to address your concerns. Please contact us so we can make it right.` },
          { type: 'review_reply', title: `2-Star Reply`, body: `We're sorry your experience didn't meet expectations. Please reach out to us directly so we can resolve this.` },
          { type: 'review_reply', title: `1-Star Reply`, body: `We sincerely apologize for your experience. Please contact us so we can understand what happened and make it right.` },
        ];

        for (const item of items) {
          await execute(
            `INSERT INTO content_items (audit_id, type, title, body, status) VALUES (${safe(auditId)}, ${safe(item.type)}, ${safe(item.title)}, ${safe(item.body)}, 'draft')`
          );
        }

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