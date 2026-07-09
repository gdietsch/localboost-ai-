const { query, execute } = require('./api/db.js');
const safe = (s) => `'${String(s).replace(/'/g, "''")}'`;
const FROM_EMAIL = 'hello@localboosts.biz';

(async () => {
  console.log('Checking for pending audits...');

  const pendingAudits = await query(`
    SELECT a.id as audit_id, b.name, b.email, b.website, b.category
    FROM audits a
    JOIN businesses b ON a.business_id = b.id
    WHERE a.status = 'pending'
      AND a.created_at < datetime('now', '-1 day')
      AND (b.email NOT LIKE 'audit-%@localboosts.biz')
    ORDER BY a.created_at DESC
    LIMIT 20
  `);

  console.log(`Found ${pendingAudits?.length || 0} pending audits`);
  if (pendingAudits?.length) {
    for (const b of pendingAudits) {
      console.log(`  - ${b.name} (${b.email}) audit_id: ${b.audit_id}`);
    }
  }

  if (!pendingAudits || pendingAudits.length === 0) {
    console.log('No pending audits to follow up');
    process.exit(0);
  }

  for (const biz of pendingAudits) {
    const existing = await query(
      `SELECT id FROM content_items WHERE audit_id = ${safe(biz.audit_id)} AND type = 'followup_sent' LIMIT 1`
    );
    if (existing && existing.length > 0) {
      console.log(`Already sent follow-up for ${biz.email} (audit ${biz.audit_id})`);
      continue;
    }

    const msg = {
      to: biz.email,
      from: FROM_EMAIL,
      subject: `Your ${biz.name} audit found issues - here's what's next`,
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

    console.log(`\nSending to ${biz.email}...`);
    console.log(`Subject: ${msg.subject}`);

    try {
      const plunkRes = await fetch('https://next-api.useplunk.com/v1/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.PLUNK_API_KEY}`,
        },
        body: JSON.stringify(msg),
      });

      const result = await plunkRes.text();
      console.log(`Plunk response: ${plunkRes.status} ${result}`);

      if (plunkRes.ok) {
        await execute(`INSERT INTO content_items (audit_id, type, title, body, status) VALUES (${safe(biz.audit_id)}, 'followup_sent', 'Follow-up email sent', 'sent', 'approved')`);
        console.log(`✅ Follow-up sent to ${biz.email}`);
      } else {
        console.log(`❌ Failed to send to ${biz.email}`);
      }
    } catch (err) {
      console.error(`Error sending to ${biz.email}:`, err.message);
    }
  }

  console.log('\nDone!');
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });