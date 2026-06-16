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