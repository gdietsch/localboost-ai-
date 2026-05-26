import { Router } from 'express';
import { query } from '../models/db.js';

const router = Router();

// POST /api/audits - Create a new audit
router.post('/', async (req, res) => {
  try {
    const { name, website, category, email } = req.body;

    if (!name || !website || !category || !email) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const safe = (s) => `'${String(s).replace(/'/g, "''")}'`;

    // Find or create business
    let businesses = query(
      `SELECT id FROM businesses WHERE email = ${safe(email)} AND name = ${safe(name)} LIMIT 1`
    );

    let businessId;
    if (businesses && businesses.length > 0) {
      businessId = businesses[0].id;
    } else {
      query(
        `INSERT INTO businesses (name, website, category, email) VALUES (${safe(name)}, ${safe(website)}, ${safe(category)}, ${safe(email)})`
      );
      // Fetch the newly created business
      const newBiz = query(
        `SELECT id FROM businesses WHERE email = ${safe(email)} AND name = ${safe(name)} ORDER BY created_at DESC LIMIT 1`
      );
      businessId = newBiz?.[0]?.id;
    }

    if (!businessId) {
      throw new Error('Failed to get or create business');
    }

    // Create audit
    query(
      `INSERT INTO audits (business_id, status) VALUES (${safe(businessId)}, 'pending')`
    );
    const auditResult = query(
      `SELECT id FROM audits WHERE business_id = ${safe(businessId)} ORDER BY created_at DESC LIMIT 1`
    );
    const auditId = auditResult[0]?.id;

    if (!auditId) {
      throw new Error('Failed to create audit');
    }

    res.status(201).json({ id: auditId, business_id: businessId, status: 'pending' });
  } catch (err) {
    console.error('Error creating audit:', err);
    res.status(500).json({ error: 'Failed to create audit' });
  }
});

// GET /api/audits/:id - Get audit details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const safe = (s) => `'${String(s).replace(/'/g, "''")}'`;

    const audits = query(
      `SELECT a.id, a.status, a.created_at, b.name as business_name, b.website, b.category
       FROM audits a
       JOIN businesses b ON a.business_id = b.id
       WHERE a.id = ${safe(id)}`
    );

    if (!audits || audits.length === 0) {
      return res.status(404).json({ error: 'Audit not found' });
    }

    const audit = audits[0];

    // Get content items
    const content = query(
      `SELECT id, type, title, body, status FROM content_items WHERE audit_id = ${safe(id)} ORDER BY type, id`
    );

    audit.content = content || [];
    res.json(audit);
  } catch (err) {
    console.error('Error fetching audit:', err);
    res.status(500).json({ error: 'Failed to fetch audit' });
  }
});

// POST /api/audits/:id/generate - Generate audit content
router.post('/:id/generate', async (req, res) => {
  try {
    const { id } = req.params;
    const safe = (s) => `'${String(s).replace(/'/g, "''")}'`;

    // Update status to generating
    query(`UPDATE audits SET status = 'generating' WHERE id = ${safe(id)}`);

    // Get business info
    const audits = query(
      `SELECT b.name as business_name, b.category, b.website
       FROM audits a JOIN businesses b ON a.business_id = b.id
       WHERE a.id = ${safe(id)}`
    );

    if (!audits || audits.length === 0) {
      return res.status(404).json({ error: 'Audit not found' });
    }

    const biz = audits[0];
    const name = biz.business_name;
    const cat = biz.category;

    // Generate sample marketing plan tasks (30-day plan)
    const planTasks = [
      { title: `Week 1: Optimize Google Business Profile for ${name}`, body: `1. Update business hours and contact info\n2. Add high-quality photos of your work\n3. Select relevant categories (${cat})\n4. Write a compelling business description\n5. Add services/products with pricing` },
      { title: `Week 2: Build Social Media Presence`, body: `1. Create/optimize Facebook Business Page\n2. Set up Instagram Business account\n3. Post 3 times this week using the content ideas below\n4. Engage with 5 local businesses' posts\n5. Add social media links to your website` },
      { title: `Week 3: Launch Review & Reputation Campaign`, body: `1. Send review request emails to past 20 customers\n2. Reply to all existing reviews using templates below\n3. Add review links to email signature\n4. Create a "Leave us a review" landing page\n5. Monitor new reviews daily` },
      { title: `Week 4: Run Local Ad Campaign`, body: `1. Set up Google Local Services Ads\n2. Create Facebook ad targeting local audience (10-mile radius)\n3. Budget: $10-15/day for first week\n4. Use the email drafts below for newsletter\n5. Track results and adjust targeting` },
      { title: `Content Calendar Setup`, body: `Create a monthly content calendar for ${name}:\n- Monday: Tip/Tutorial post\n- Wednesday: Customer testimonial or before/after\n- Friday: Behind-the-scenes or team spotlight\n- Saturday: Promotion or special offer\n- Google Post: Weekly update` },
    ];

    const socialPosts = [
      { title: `Tip: ${cat} Pro Tip`, body: `💡 Pro Tip from ${name}!\n\nDid you know? [Insert helpful industry tip here]\n\nSave this for later and tag a friend who needs to know! 👇\n\n#LocalBusiness #${cat.replace(/\s+/g, '')} #ProTips` },
      { title: `Customer Spotlight`, body: `⭐️ Happy Customer Alert!\n\n"Best experience with ${name}! They went above and beyond."\n\nWe love making our customers smile. Want to join them? Book now!\n\nLink in bio 🔗\n\n#CustomerLove #${cat.replace(/\s+/g, '')} #5StarExperience` },
      { title: `Behind the Scenes`, body: `👋 Meet the team behind ${name}!\n\nWe're passionate about what we do, and it shows in every project.\n\nSwipe to see us in action! ➡️\n\nWant to work with us? DM to book 📩\n\n#BehindTheScenes #TeamWork #LocalBiz` },
      { title: `Special Offer`, body: `🎉 SPECIAL OFFER 🎉\n\nFor a limited time, get [discount/offer] when you mention this post!\n\nAt ${name}, we're committed to delivering the best ${cat.toLowerCase()} services.\n\nOffer valid until [date]. Don't miss out!\n\n#SpecialOffer #LocalDeals #${cat.replace(/\s+/g, '')}` },
      { title: `Before & After`, body: `✨ Transformation Tuesday! ✨\n\nCheck out this amazing before and after by ${name}.\n\nFrom start to finish, we pour our heart into every project.\n\nReady for your own transformation? Book a consultation today!\n\n#TransformationTuesday #BeforeAndAfter #${cat.replace(/\s+/g, '')}` },
      { title: `FAQ: Common Questions`, body: `🤔 Frequently Asked Questions\n\nQ: How long does a typical service take?\nA: [Answer]\n\nQ: Do you offer free estimates?\nA: [Answer]\n\nQ: What areas do you serve?\nA: [Answer]\n\nHave more questions? Drop them in the comments! 💬\n\n#FAQ #${cat.replace(/\s+/g, '')} #CustomerService` },
      { title: `Industry Trends`, body: `📊 Industry Update 📊\n\nHere's what's trending in ${cat.toLowerCase()} this year:\n\n1️⃣ [Trend 1]\n2️⃣ [Trend 2]\n3️⃣ [Trend 3]\n\nStay ahead of the curve with ${name}! We keep up with the latest so you don't have to.\n\n#IndustryTrends #${cat.replace(/\s+/g, '')} #StayAhead` },
      { title: `Team Spotlight`, body: `🌟 Team Spotlight 🌟\n\nMeet [Name] — our amazing [Role] at ${name}!\n\n[They've] been with us for [X] years and brings incredible expertise to every project.\n\nFun fact: [Fun fact about team member]\n\n#TeamSpotlight #OurTeam #${cat.replace(/\s+/g, '')}` },
      { title: `Customer Testimonial`, body: `🗣️ Don't just take our word for it!\n\n"${name} exceeded all my expectations. Professional, timely, and the quality was outstanding!"\n\n— [Customer Name]\n\nWe pride ourselves on 5-star service. Ready to experience it?\n\n#Testimonial #5StarReview #${cat.replace(/\s+/g, '')}` },
      { title: `Holiday/Seasonal Post`, body: `🎄 Happy Holidays from ${name}! 🎄\n\nAs we wrap up another amazing year, we want to thank our incredible customers for your support.\n\nWishing you and your family a wonderful holiday season and a happy New Year! ✨\n\n#HappyHolidays #ThankYou #${cat.replace(/\s+/g, '')}` },
      { title: `Educational: How to Choose`, body: `📚 How to Choose the Right ${cat.replace(/\s+/g, '')} Service\n\nNot sure what to look for? Here are 5 tips:\n\n1️⃣ Check reviews and testimonials\n2️⃣ Ask about experience and training\n3️⃣ Get multiple quotes\n4️⃣ Verify insurance and licenses\n5️⃣ Trust your gut\n\nAt ${name}, we check all the boxes. Book with confidence!\n\n#TipsAndTricks #HowToChoose #${cat.replace(/\s+/g, '')}` },
      { title: `Community Involvement`, body: `🤝 Giving Back to Our Community 🤝\n\nAt ${name}, we believe in supporting our local community.\n\nRecently, we [describe community involvement or charity work].\n\nTogether, we make our community stronger! 💪\n\n#CommunityFirst #GivingBack #LocalLove` },
    ];

    const googlePosts = [
      { title: `Welcome Post`, body: `Welcome to ${name}! We're proud to serve the local community with top-quality ${cat.toLowerCase()} services. Contact us today to learn more about what we can do for you!` },
      { title: `Service Highlight`, body: `Did you know ${name} offers [specific service]? Our team of experienced professionals is ready to help you get the results you deserve. Call or visit our website to book an appointment!` },
      { title: `Customer Appreciation`, body: `Thank you to all our amazing customers! Your support means the world to us. If you haven't visited us yet, now is the perfect time. Check out our latest offers!` },
      { title: `Seasonal Update`, body: `As the seasons change, so do your needs. At ${name}, we're here to help with all your ${cat.toLowerCase()} needs. Contact us to schedule your appointment today!` },
    ];

    const emails = [
      { title: `Welcome Email Series - Part 1`, body: `Subject: Welcome to ${name}! Here's What to Expect\n\nHi [Customer Name],\n\nThank you for choosing ${name}! We're excited to have you on board.\n\nHere's what you can expect from us:\n• Professional, reliable service every time\n• Transparent pricing with no hidden fees\n• A team that truly cares about your satisfaction\n\nReady to get started? Reply to this email or give us a call!\n\nBest regards,\nThe ${name} Team` },
      { title: `Follow-Up & Review Request`, body: `Subject: How Was Your Experience with ${name}?\n\nHi [Customer Name],\n\nWe hope you loved your experience with us! Your feedback helps us improve and helps other customers make informed decisions.\n\nCould you take 30 seconds to leave us a review?\n[Review Link]\n\nAs a thank you, here's [offer/discount] on your next visit!\n\nThanks again for choosing ${name}.\n\nBest regards,\nThe ${name} Team` },
    ];

    const reviews = [
      { title: `5-Star Review Reply`, body: `Thank you so much for your kind words, [Customer Name]! We're thrilled to hear that you had such a positive experience with us. Your satisfaction is our top priority, and we look forward to serving you again in the future!` },
      { title: `4-Star Review Reply`, body: `Thank you for your feedback, [Customer Name]! We're glad you had a good experience with ${name}. We always strive to improve, so if there's anything specific we could do to earn that 5th star, please let us know!` },
      { title: `3-Star Review Reply`, body: `Thank you for your honest feedback, [Customer Name]. We appreciate you taking the time to share your experience. We'd love the opportunity to make things right. Please contact us at [phone/email] so we can address your concerns directly.` },
      { title: `2-Star Review Reply`, body: `We're sorry to hear that your experience didn't meet expectations, [Customer Name]. This is not the standard we strive for at ${name}. Please reach out to us at [phone/email] so we can understand what went wrong and make it right.` },
      { title: `1-Star Review Reply`, body: `We sincerely apologize for your experience, [Customer Name]. We take all feedback seriously and would like to learn more about what happened. Please contact us directly at [phone/email] so we can address your concerns and find a resolution.` },
    ];

    // Insert all content items
    const insertItem = (type, title, body) => {
      query(`INSERT INTO content_items (audit_id, type, title, body, status) VALUES (${safe(id)}, ${safe(type)}, ${safe(title)}, ${safe(body)}, 'draft')`);
    };

    for (const task of planTasks) insertItem('task', task.title, task.body);
    for (const post of socialPosts) insertItem('social_post', post.title, post.body);
    for (const post of googlePosts) insertItem('google_post', post.title, post.body);
    for (const email of emails) insertItem('email', email.title, email.body);
    for (const review of reviews) insertItem('review_reply', review.title, review.body);

    // Mark audit as complete
    query(`UPDATE audits SET status = 'complete' WHERE id = ${safe(id)}`);

    res.json({ success: true, message: 'Audit generated successfully' });
  } catch (err) {
    console.error('Error generating audit:', err);
    res.status(500).json({ error: 'Failed to generate audit content' });
  }
});

// PATCH /api/audits/content/:id/status - Update content item status
router.patch('/content/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['draft', 'approved', 'needs_revision'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const safe = (s) => `'${String(s).replace(/'/g, "''")}'`;
    query(`UPDATE content_items SET status = ${safe(status)} WHERE id = ${safe(id)}`);
    res.json({ success: true });
  } catch (err) {
    console.error('Error updating content status:', err);
    res.status(500).json({ error: 'Failed to update content status' });
  }
});

export default router;