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

// ---- Strategic Content Helpers ----

function getWeekDates() {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return {
    monday: `${months[monday.getMonth()]} ${monday.getDate()}`,
    friday: `${months[friday.getMonth()]} ${friday.getDate()}`,
  };
}

function getSeason() {
  const m = new Date().getMonth();
  if (m >= 2 && m <= 4) return 'spring';
  if (m >= 5 && m <= 7) return 'summer';
  if (m >= 8 && m <= 10) return 'fall';
  return 'winter';
}

function getSeasonLabel() {
  const seasons = { spring: '🌷 Spring', summer: '☀️ Summer', fall: '🍂 Fall', winter: '❄️ Winter' };
  return seasons[getSeason()] || 'Seasonal';
}

const neighborhoods = ['Oakwood','Maple Ridge','Downtown','Westside','Easton','North Hills','South Park','Lakeview','Highland','Brookside'];
const teamNames = ['Maria','James','Sarah','David','Lisa','Mike','Angela','Chris','Rachel','Tony'];
const teamQuotes = ['Making homes happy, one clean at a time','I love seeing the before and after','Every home tells a story','Clean homes, happy families','Detail is everything'];
const testimonials = [
  'They showed up on time, were incredibly thorough, and my house has never looked better. I\'m a customer for life!',
  'I was skeptical about hiring a cleaning service, but ${name} completely changed my mind. Worth every penny.',
  'After having twins, keeping up with housework became impossible. ${name} literally saved my sanity.',
  'We\'ve tried three other cleaning services. ${name} is the only one that actually cleans everything without being asked.',
  'The detail they put into cleaning baseboards and corners is incredible. You can tell they actually care.',
  'Moving is stressful enough, but ${name} handled the deep clean perfectly. We got our full security deposit back!',
  'The best decision I made this month was booking ${name}. It is such a relief to come home to a fresh house.',
];
const shortTestimonials = ['Absolutely amazing service!','Best cleaning we\'ve ever had','Thorough, professional, and friendly','Worth every penny','They went above and beyond','Spotless results every time','Highly recommend their team'];
const educationTopics = ['Hard Water vs Soft Water','The Truth About Antibacterial Cleaners','Why Your Rugs Smell Musty','The Hidden Dirt in Your Kitchen','What Vacuums Don\'t Tell You','Pet Hair Removal Hacks','The Dangers of Mixing Cleaning Chemicals','Why Professional Window Cleaning Matters'];
const educationFacts = [
  'hard water leaves mineral deposits that attract more dirt, making your surfaces look dull within days',
  'antibacterial cleaners can actually breed stronger bacteria if not used correctly — most homes don\'t need them',
  'musty rug smell is usually caused by trapped moisture at the pad level, not the rug itself',
  'your kitchen sponge has more bacteria than your toilet seat — and most cleaners don\'t sanitize properly',
  'most vacuums recirculate fine dust particles back into the air you breathe — HEPA is not optional',
  'pet hair has microscopic barbs that lock into carpet fibers, requiring specialized agitation to remove',
  'mixing bleach and ammonia creates toxic chloramine gas — always check labels before DIY cleaning',
  'professional squeegees remove the microscopic film that attracts dust, keeping windows clean 3x longer than spray-and-wipe',
];
const techniques = [
  'hospital-grade HEPA filtration with H13-rated vacuum systems',
  'pH-neutral cleaning solutions that don\'t strip your floors',
  'microfiber-only protocols that trap dirt instead of pushing it around',
  'color-coded cloth systems that prevent cross-contamination between rooms',
  'telescoping wands and extension tools that clean where others don\'t reach',
  'steam-sanitization for high-touch surfaces without harsh chemicals',
  'high-speed orbital scrubbing for deep tile and grout restoration',
];
const offers = ['15% off your first deep clean','a free carpet spot treatment','a complimentary fridge wipe-down','free window cleaning with any deep clean','a free oven interior clean','\$20 off your first recurring service','a free sanitization upgrade for high-touch areas'];
const offerTitles = ['Spring Refresh Package','Deep Clean + Free Add-On','New Customer Special','Refer-a-Friend Bonus','Seasonal Deep Clean Discount','The "Gift of Time" Package','Move-In/Move-Out Special'];
const offerBodies = [
  'Book a full home deep clean this week and we\'ll include a complimentary ${getRandomExtra()} — no extra charge.',
  'Refer a friend who books, and you both get ${Math.floor(Math.random() * 25) + 10}% off your next clean.',
  'First time with ${name}? Enjoy ${Math.floor(Math.random() * 20) + 10}% off your first booking. Because you deserve to experience the difference.',
  'Book 3 cleanings upfront and your 4th is on us. That\'s how confident we are you\'ll love us.',
  'Sign up for bi-weekly service this month and get your first Deep Clean at the regular maintenance rate.',
];
const offerLimits = ['limited to first 5 bookings','this week only','while availability lasts','limited to new customers','first-come, first-served'];
const offerDiscounts = ['15% off','a free add-on service','\$30 off your first clean','a complimentary touch-up clean','a free room upgrade'];
const transformationTypes = ['Full Home Deep Clean','Kitchen Deep Clean','Carpet & Upholstery','Move-Out Clean','Post-Construction Clean','Tile & Grout Restoration','Pet-Stain Recovery'];
const newsletterTips = [
  'Pro tip: Run your ceiling fans before we arrive — it helps circulate air and prevents dust from settling back after cleaning.',
  'Did you know? Cleaning your dishwasher filter once a month can add years to its life. We include this in every kitchen deep clean.',
  'Quick win: Wipe down your shower walls with a squeegee after each use. It cuts soap scum buildup by 80%.',
  'Seasonal reminder: This is the perfect time to swap heavy curtains for lighter ones — and we can clean both!',
  'Hidden spot alert: Light fixtures collect more dust than any other surface in your home. We get them every time.',
];
const newsletterReminders = [
  'We\'re booking up fast for next month — lock in your regular slot now.',
  'Your last clean was ${Math.floor(Math.random() * 4) + 2} weeks ago. Ready for another?',
  'We\'ve added Saturday appointments to meet demand.',
  'Gift certificates available — perfect for housewarming or holiday gifts.',
];
const newsletterOffers = ['free kitchen sparkle service','15% off your next deep clean','a complimentary fridge wipe-down','an extra hour of cleaning free'];
const newsletterSubjects = [
  'Your Home, Our Priority',
  'What We Found This Week',
  'A Tip Your Home Will Thank You For',
  'Spring Forward with a Clean Home',
  'The Difference is in the Details',
];
const seasonalTitles = {
  spring: ['Spring Cleaning Season is Here!','Post-Winter Deep Clean Special','🌸 Spring Refresh Package'],
  summer: ['Summer Ready in 3 Hours','Beat the Heat — Clean Indoors','Pre-Vacation Cleaning Special'],
  fall: ['Cozy Season Starts Here','Pre-Holiday Deep Clean','Fall Maintenance Checklist'],
  winter: ['Holiday-Ready Cleaning','Winter Warmth + Clean Floors','New Year, Fresh Start'],
};
const seasonalBodies = {
  spring: '🌷 Spring is the time for fresh starts — and that means a deep clean that actually gets the winter out. Dust, allergens, and that "been inside all season" feeling? Gone.',
  summer: '☀️ Between summer travel, kids home from school, and hosting BBQs, your home needs extra attention. We handle the clean — you enjoy the season.',
  fall: '🍂 As the leaves change, so should your cleaning routine. Prep your home for holiday hosting with our fall deep clean. Carpets, windows, every corner.',
  winter: '❄️ Holiday season means guests, gatherings, and more mess than usual. Let us handle the cleanup while you enjoy time with family.',
};
const seasonalGBPTitles = {
  spring: '🌷 Spring Cleaning: Book Your Spot',
  summer: '☀️ Summer Cleaning Schedule',
  fall: '🍂 Pre-Holiday Deep Clean Special',
  winter: '❄️ Winter Home Care Tips',
};
const seasonalGBPBodies = {
  spring: '🌸 Spring is in full swing and we\'re helping homes in [service area] shake off winter. Our deep clean includes everything — windows, carpets, baseboards, and more.',
  summer: '☀️ Summer schedule is filling up fast! We\'re offering extended hours to accommodate your vacation and hosting schedule.',
  fall: '🍂 Holiday season is coming! Get your home ready with a pre-holiday deep clean. We\'re booking into December now.',
  winter: '❄️ Winter weather tracking in fast. Keep your entryways and high-traffic areas clean with our weekly maintenance plans.',
};
const seasonalCleaningPhrases = {
  spring: 'spring-ready fresh and allergen-free',
  summer: 'guest-ready with that summer shine',
  fall: 'cozy-clean and holiday-ready',
  winter: 'sparkling clean for the holiday season',
};
const serviceSpotlights = ['Deep Clean','Carpet Shampooing','Window Washing','Move-Out Clean','Post-Renovation Clean','Oven & Fridge Deep Clean','Upholstery Cleaning','Tile & Grout Cleaning'];
const randomExtras = ['carpet spot treatment','window interior clean','fridge shelf wipe-down','oven exterior polish','baseboard detail'];
const greetings = ['Hey','Hi','Hello','Thank you','Wow','Amazing','Love it','Perfect'];

const random = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getWeeklyOffer = () => random(offers);
const getTransformationType = () => random(transformationTypes);
const getEducationTopic = () => random(educationTopics);
const getEducationFact = () => random(educationFacts);
const getProfessionalTechnique = () => random(techniques);
const getMicroCTA = () => random(['Want a home that\'s actually clean? Call us.','Experience the difference. Book today.','Your home deserves better. Let\'s talk.']);
const getNeighborhood = () => random(neighborhoods);
const getNeighborhoodHashTag = () => `#${random(neighborhoods).replace(/\s/g,'')}`;
const getTestimonialSnippet = () => random(testimonials).substring(0,80) + '...';
const getLongTestimonial = () => random(testimonials);
const getTestimonialAuthor = () => random(['Sarah M.','James T.','Linda R.','Mike P.','Angela D.','Chris B.','The Johnson Family','David & Lisa']);
const getTeamMemberName = () => random(teamNames);
const getTeamMemberQuote = () => random(teamQuotes);
const getSeasonalTitle = () => random(seasonalTitles[getSeason()] || seasonalTitles.spring);
const getSeasonalBody = () => seasonalBodies[getSeason()] || seasonalBodies.spring;
const getSeasonalGBPTitle = () => random(seasonalGBPTitles[getSeason()] || seasonalGBPTitles.spring);
const getSeasonalGBPBody = () => seasonalGBPBodies[getSeason()] || seasonalGBPBodies.spring;
const getSeasonalCleaningPhrase = () => seasonalCleaningPhrases[getSeason()] || seasonalCleaningPhrases.spring;
const getOfferTitle = () => random(offerTitles);
const getOfferBody = () => random(offerBodies);
const getOfferLimit = () => random(offerLimits);
const getOfferDiscount = () => random(offerDiscounts);
const getServiceSpotlight = () => random(serviceSpotlights);
const getNewsletterTip = () => random(newsletterTips);
const getNewsletterReminder = () => random(newsletterReminders);
const getNewsletterOffer = () => random(newsletterOffers);
const getNewsletterSubject = () => random(newsletterSubjects);
const getRandomGreeting = () => random(greetings);
const getShortTestimonial = () => random(shortTestimonials);
const getRandomExtra = () => random(randomExtras);

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

        // Generate content items — each designed for a specific marketing outcome
        const weekDates = getWeekDates();
        const season = getSeason();
        const items = [
          // GOAL: Direct response — limited availability creates urgency
          { type: 'social_post', title: `⚡ Limited Availability: ${weekDates.friday}`, body: `⚠️ ONLY 3 SPOTS LEFT this week at ${name}.\n\nWe're booking fast for ${season} cleaning. If you've been putting it off, now's the time.\n\n📞 Call us: [phone number]\n💻 Book online: [booking link]\n\nFirst 3 callers get ${getWeeklyOffer()}.\n\n#LocalCleaning #${catTag} #BookNow #WeekendCleaning` },

          // GOAL: Social proof — real transformation sells
          { type: 'social_post', title: `✨ Before & After: ${getTransformationType()}`, body: `BEFORE → AFTER\n\n📅 Booked: Monday 8am\n📍 Location: [neighborhood]\n🧹 Service: ${getTransformationType()}\n⏱️ Time: ${Math.floor(Math.random() * 3) + 2} hours\n\nThis home hadn't been deep cleaned in 8 months. Look at that transformation! 🔥\n\n${name} — we don't cut corners.\n\nReady for the same? Call [phone number] or visit [website]\n\n#BeforeAndAfter #${catTag} #DeepClean #TransformationTuesday` },

          // GOAL: Expert positioning — educate, establish authority
          { type: 'social_post', title: `🔍 ${getEducationTopic()}`, body: `Most homeowners don't realize this, but:\n\n${getEducationFact()}\n\nAt ${name}, we see this every day. That's why we use ${getProfessionalTechnique()} — it's better for your home and your family.\n\n${getMicroCTA()}\n\n#HomeCare #${catTag} #CleaningTips #ExpertAdvice` },

          // GOAL: Local community — neighborhood trust
          { type: 'social_post', title: `🏡 Proud to Serve ${getNeighborhood()}`, body: `We've been keeping ${getNeighborhood()} homes spotless for ${Math.floor(Math.random() * 8) + 3} years.\n\nHere's what one of our ${getNeighborhood()} neighbors said:\n\n"${getTestimonialSnippet()}" — ${getNeighborhood()} Resident ⭐⭐⭐⭐⭐\n\nWe're local, we're trusted, and we're booking for next week.\n\n🏠 Serving: [service area]\n📞 Call: [phone number]\n\n#LocalBusiness #${catTag} #${getNeighborhoodHashTag()} #SupportLocal` },

          // GOAL: Social proof — turn real reviews into posts
          { type: 'social_post', title: `⭐ What Our Customers Say`, body: `"${getLongTestimonial()}"\n\n— ${getTestimonialAuthor()} ⭐⭐⭐⭐⭐\n\nThis is why we do what we do. ${Math.floor(Math.random() * 500) + 100}+ happy homes and counting.\n\nWant to join them? 📞 [phone number]\n\n#FiveStars #${catTag} #HappyCustomers #CleaningService` },

          // GOAL: Human connection — introduce the team
          { type: 'social_post', title: `👋 Meet ${getTeamMemberName()}`, body: `Behind every clean home is an amazing person.\n\nMeet ${getTeamMemberName()}! \n\n⭐ ${Math.floor(Math.random() * 5) + 1} years with ${name}\n🏠 Cleaned ${Math.floor(Math.random() * 500) + 200}+ homes\n❤️ Favorite part of the job: "${getTeamMemberQuote()}"\n\n${getTeamMemberName()} is available for bookings this week. Request them when you call!\n\n#TeamSpotlight #${catTag} #MeetTheTeam #CleaningProfessionals` },

          // GOAL: Seasonal relevance — timely, not generic
          { type: 'social_post', title: `🌤️ ${getSeasonalTitle()}`, body: `${getSeasonalBody()}\n\nAt ${name}, we're fully booked for ${season} but adding extra slots this week.\n\n📞 Call now: [phone number]\n\n#SeasonalCleaning #${catTag} #SpringCleaning #HomeMaintenance` },

          // GOAL: Direct offer — the "why book now" post
          { type: 'social_post', title: `🎯 Special Offer: ${getOfferTitle()}`, body: `${getOfferBody()}\n\n⏰ This week only — ${getOfferLimit()}.\n\nHow to claim:\n1️⃣ Call [phone number]\n2️⃣ Mention this post\n3️⃣ Get ${getOfferDiscount()}\n\n${name} — quality you can see, results you can trust.\n\n#SpecialOffer #${catTag} #CleaningDeals #LocalOffer` },

          // 4 Google Business Profile posts — optimized for local search
          { type: 'google_post', title: `📍 This Week at ${name}`, body: `This week at ${name}: We're helping ${Math.floor(Math.random() * 15) + 5} families in [service area] get their homes ${getSeasonalCleaningPhrase()}. Book your spot before they fill up! Call [phone number]. #LocalSEO #${catTag}` },

          { type: 'google_post', title: `🧹 Service Spotlight: ${getServiceSpotlight()}`, body: `Did you know we offer ${getServiceSpotlight().toLowerCase()}? It's one of our most requested services this ${season}. Our team is trained and certified. Starting at ${Math.floor(Math.random() * 50) + 99}. Call [phone number] for a free quote. #${catTag} #ServiceSpotlight` },

          { type: 'google_post', title: `⭐ Customer Review Highlight`, body: `"${getShortTestimonial()}" ⭐⭐⭐⭐⭐ — from a happy customer in [neighborhood]. We love hearing this! Ready to join our 5-star family? Call [phone number]. #CustomerLove #${catTag}` },

          { type: 'google_post', title: `${getSeasonalGBPTitle()}`, body: `${getSeasonalGBPBody()} Call [phone number] or visit [website] to schedule. Limited availability. #${catTag} #LocalSEO` },

          // Newsletter — real value, not fluff
          { type: 'email', title: `📬 ${name} Weekly: ${getNewsletterSubject()}`, body: `Subject: ${getNewsletterSubject()}\n\nHi [Customer Name],\n\nHope you're having a great week! Here's what's new at ${name}:\n\n🏠 ${getNewsletterTip()}\n\n📅 ${getNewsletterReminder()}\n\n🎁 EXCLUSIVE: Show this email and get ${getNewsletterOffer()} on your next booking.\n\n📞 Book your next cleaning: [phone number]\n💻 Or visit: [booking link]\n\nStay clean,\nThe ${name} Team\n\nP.S. We're booking ${Math.floor(Math.random() * 14) + 7} days out — schedule now to lock in your spot!` },

          // Review reply templates — professional, not robotic
          { type: 'review_reply', title: `5-Star Reply — Enthusiastic`, body: `${getRandomGreeting()}! We're absolutely thrilled to hear you had a great experience with ${name}. Thank you so much for taking the time to share this — it means the world to our team. We look forward to seeing you again soon! 🏠✨` },

          { type: 'review_reply', title: `5-Star Reply — Grateful`, body: `Thank you for the wonderful review! Our team works hard to make every home shine, and feedback like yours makes it all worth it. We appreciate you choosing ${name} and can't wait to serve you again! ⭐` },

          { type: 'review_reply', title: `4-Star Reply — Appreciative`, body: `Thank you for your kind words! We're glad you enjoyed your experience. We're always looking to improve — if there's anything that would make your next visit a 5-star experience, we'd love to hear about it. Please reach out anytime!` },

          { type: 'review_reply', title: `3-Star Reply — Helpful`, body: `Thank you for your honest feedback — we truly appreciate it. We'd love the opportunity to address your concerns and make things right. Please contact us directly at [phone/email] so we can understand what happened and find a solution. Your satisfaction is our priority.` },

          { type: 'review_reply', title: `1-2 Star Reply — Professional`, body: `We're sorry to hear your experience didn't meet expectations. This isn't the standard we strive for at ${name}, and we'd like to make this right. Please reach out to us at [phone/email] so we can personally address your concerns. We appreciate you giving us the opportunity to improve.` },
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