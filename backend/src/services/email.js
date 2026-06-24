/**
 * SendGrid email service for LocalBoost AI (ESM - local backend).
 */
let sgMail = null;
let initialized = false;

const FROM_EMAIL = process.env.FROM_EMAIL || 'hello@localboost.ai';
const APP_URL = process.env.APP_URL || 'http://localhost:3001';

async function init() {
  if (initialized) return;
  initialized = true;

  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) {
    console.log('📧 SendGrid email service: disabled (no SENDGRID_API_KEY set)');
    return;
  }

  try {
    const sgMailModule = await import('@sendgrid/mail');
    sgMail = sgMailModule.default || sgMailModule;
    sgMail.setApiKey(apiKey);
    console.log('📧 SendGrid email service: initialized');
  } catch (err) {
    console.error('📧 SendGrid init failed:', err.message);
  }
}

function isReady() {
  return sgMail !== null && typeof sgMail.send === 'function';
}

export async function sendApprovalEmail(business, contentItems) {
  await init();

  if (!isReady()) {
    console.log(`📧 Email skipped for ${business.email} (SendGrid not configured)`);
    return false;
  }

  if (!business || !business.email) {
    console.warn('📧 Email skipped: no business or email address');
    return false;
  }

  const grouped = {};
  for (const item of contentItems) {
    if (!grouped[item.type]) grouped[item.type] = [];
    grouped[item.type].push(item);
  }

  const typeLabels = {
    social_post: 'Social Media Posts',
    google_post: 'Google Business Posts',
    email: 'Email Campaigns',
    review_reply: 'Review Reply Templates',
    task: 'Marketing Tasks',
  };

  let itemsHtml = '';
  for (const [type, items] of Object.entries(grouped)) {
    const label = typeLabels[type] || type;
    itemsHtml += `<h3 style="color:#2563eb;margin-top:24px;border-bottom:1px solid #e5e7eb;padding-bottom:8px;">${label} (${items.length})</h3>`;
    for (const item of items) {
      const approveUrl = `${APP_URL}/api/approve-content/${item.id}`;
      itemsHtml += `
        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:12px 0;">
          <h4 style="margin:0 0 8px;font-size:15px;">${item.title}</h4>
          <p style="color:#6b7280;font-size:13px;white-space:pre-wrap;">${item.body.substring(0, 200)}${item.body.length > 200 ? '...' : ''}</p>
          <a href="${approveUrl}" style="display:inline-block;background:#2563eb;color:white;padding:6px 16px;border-radius:6px;text-decoration:none;font-size:13px;margin-right:8px;">✓ Approve</a>
        </div>
      `;
    }
  }

  const msg = {
    to: business.email,
    from: FROM_EMAIL,
    subject: `📅 Your Weekly Content for ${business.name} is Ready for Review`,
    html: `
      <div style="max-width:600px;margin:0 auto;font-family:sans-serif;">
        <div style="background:linear-gradient(135deg,#2563eb,#1e40af);color:white;padding:32px;border-radius:12px 12px 0 0;text-align:center;">
          <h1 style="margin:0;font-size:24px;">📅 Your Weekly Content is Ready</h1>
          <p style="margin:8px 0 0;opacity:0.9;">${business.name}</p>
        </div>
        <div style="background:white;border:1px solid #e5e7eb;padding:32px;border-radius:0 0 12px 12px;">
          <p style="margin:0 0 16px;color:#374151;">Your AI has generated content for the coming week. Review below:</p>
          ${itemsHtml}
          <div style="text-align:center;margin-top:32px;padding-top:24px;border-top:1px solid #e5e7eb;">
            <a href="${APP_URL}/dashboard?email=${encodeURIComponent(business.email)}" style="color:#2563eb;">Dashboard →</a>
          </div>
        </div>
        <div style="text-align:center;padding:16px;color:#9ca3af;font-size:12px;">LocalBoost AI</div>
      </div>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log(`📧 Approval email sent to ${business.email}`);
    return true;
  } catch (err) {
    console.error(`📧 Failed to send email to ${business.email}:`, err.message);
    return false;
  }
}

/**
 * Send the full audit report to a business owner's email (ESM version).
 */
export async function sendAuditEmail(business, audit, claimUrl) {
  await init();

  if (!isReady()) {
    console.log(`📧 Audit email skipped for ${business.email} (SendGrid not configured)`);
    return false;
  }

  if (!business || !business.email) {
    console.warn('📧 Audit email skipped: no business or email address');
    return false;
  }

  const items = audit.content || [];
  const tasks = items.filter(i => i.type === 'task');
  const socialPosts = items.filter(i => i.type === 'social_post');
  const googlePosts = items.filter(i => i.type === 'google_post');
  const emails = items.filter(i => i.type === 'email');
  const reviews = items.filter(i => i.type === 'review_reply');

  let contentHtml = '';

  if (tasks.length > 0) {
    contentHtml += `<h3 style="color:#2563eb;margin-top:24px;">📋 30-Day Action Plan (${tasks.length})</h3>`;
    for (const t of tasks) {
      contentHtml += `<div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:12px 0;">
        <h4 style="margin:0 0 8px;font-size:15px;">${t.title}</h4>
        <p style="color:#6b7280;font-size:13px;white-space:pre-wrap;">${t.body}</p>
      </div>`;
    }
  }

  if (socialPosts.length > 0) {
    contentHtml += `<h3 style="color:#2563eb;margin-top:24px;">📸 Social Media Posts (${socialPosts.length})</h3>`;
    for (const p of socialPosts.slice(0, 4)) {
      contentHtml += `<div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:8px 0;">
        <h4 style="margin:0 0 4px;font-size:14px;">${p.title}</h4>
        <p style="color:#6b7280;font-size:12px;white-space:pre-wrap;">${p.body.substring(0, 150)}${p.body.length > 150 ? '...' : ''}</p>
      </div>`;
    }
    if (socialPosts.length > 4) {
      contentHtml += `<p style="color:#9ca3af;font-size:12px;">+ ${socialPosts.length - 4} more social posts in your full report</p>`;
    }
  }

  if (googlePosts.length > 0) {
    contentHtml += `<h3 style="color:#2563eb;margin-top:24px;">📍 Google Business Posts (${googlePosts.length})</h3>`;
    for (const p of googlePosts) {
      contentHtml += `<div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:8px 0;">
        <p style="margin:0;font-size:13px;"><strong>${p.title}</strong></p>
        <p style="color:#6b7280;font-size:12px;margin:4px 0 0;">${p.body.substring(0, 150)}</p>
      </div>`;
    }
  }

  if (emails.length > 0) {
    contentHtml += `<h3 style="color:#2563eb;margin-top:24px;">✉️ Email Campaigns (${emails.length})</h3>`;
    for (const e of emails) {
      contentHtml += `<div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:8px 0;">
        <p style="margin:0;font-size:13px;"><strong>${e.title}</strong></p>
        <p style="color:#6b7280;font-size:12px;margin:4px 0 0;white-space:pre-wrap;">${e.body.substring(0, 200)}${e.body.length > 200 ? '...' : ''}</p>
      </div>`;
    }
  }

  if (reviews.length > 0) {
    contentHtml += `<h3 style="color:#2563eb;margin-top:24px;">⭐ Review Reply Templates (${reviews.length})</h3>`;
    for (const r of reviews) {
      contentHtml += `<div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:8px 0;">
        <p style="margin:0;font-size:13px;"><strong>${r.title}</strong></p>
        <p style="color:#6b7280;font-size:12px;margin:4px 0 0;">${r.body.substring(0, 150)}</p>
      </div>`;
    }
  }

  const html = `
    <div style="max-width:600px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,sans-serif;">
      <div style="background:linear-gradient(135deg,#2563eb,#1e40af);color:white;padding:32px;border-radius:12px 12px 0 0;text-align:center;">
        <h1 style="margin:0;font-size:24px;">🎉 Your Marketing Audit is Ready!</h1>
        <p style="margin:8px 0 0;opacity:0.9;">${business.name}</p>
      </div>
      <div style="background:white;border:1px solid #e5e7eb;border-top:0;padding:32px;border-radius:0 0 12px 12px;">
        <p style="margin:0 0 16px;color:#374151;">Hi there! Your comprehensive marketing audit for <strong>${business.name}</strong> has been generated. Here's a preview of what's inside:</p>
        ${contentHtml}
        <div style="text-align:center;margin-top:32px;padding-top:24px;border-top:1px solid #e5e7eb;">
          <a href="${claimUrl}" style="display:inline-block;background:#2563eb;color:white;padding:12px 32px;border-radius:8px;text-decoration:none;font-size:16px;font-weight:600;">View Full Report →</a>
        </div>
      </div>
      <div style="text-align:center;padding:16px;color:#9ca3af;font-size:12px;">LocalBoost AI</div>
    </div>
  `;

  const msg = {
    to: business.email,
    from: FROM_EMAIL,
    subject: `🎉 Your Marketing Audit for ${business.name} is Ready!`,
    html,
  };

  try {
    await sgMail.send(msg);
    console.log(`📧 Audit email sent to ${business.email}`);
    return true;
  } catch (err) {
    console.error(`📧 Failed to send audit email to ${business.email}:`, err.message);
    return false;
  }
}