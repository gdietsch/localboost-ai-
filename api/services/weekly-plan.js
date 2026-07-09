/**
 * Weekly Marketing Plan Generator
 * Produces a complete, copy-paste ready marketing plan every Monday.
 * This is the core $149/month value — a marketing department in a document.
 */

const { query, execute } = require('../db.js');
const safe = (s) => `'${String(s).replace(/'/g, "''")}'`;

// ===================== CONTENT DATA =====================

const seasons = { spring: 'Spring', summer: 'Summer', fall: 'Fall', winter: 'Winter' };
const seasonEmojis = { spring: '🌷', summer: '☀️', fall: '🍂', winter: '❄️' };

function getSeason() {
  const m = new Date().getMonth();
  if (m >= 2 && m <= 4) return 'spring';
  if (m >= 5 && m <= 7) return 'summer';
  if (m >= 8 && m <= 10) return 'fall';
  return 'winter';
}

function getWeekDates() {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(d);
  }
  return dates;
}

function formatDate(d) {
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}

function formatShortDate(d) {
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

const random = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ===================== POST GENERATORS =====================
// Each returns a COMPLETE post ready to copy-paste (phone & website are the only placeholders)

function generateUrgencyPost(name, season, weekDates) {
  const friday = formatShortDate(weekDates[4]);
  return `⚡ LIMITED SPOTS — ${friday}

We've got 3 openings left this week at ${name} and they're going fast.

${seasonEmojis[season]} ${seasons[season]} is our busiest season, and we're already booking into next week. If your home needs attention, this is your window.

Here is what's available:
🔹 Monday: 1 spot (9am-1pm)
🔹 Wednesday: 1 spot (1pm-5pm)  
🔹 Friday: 1 spot (8am-12pm)

⏰ First 3 callers to mention this post get 15% off their first deep clean.

📞 Call: [Your Phone Number]
💻 Book: [Your Booking Link]

${name} — [Your City]'s trusted home cleaning team.`;
}

function generateBeforeAfter(name, season) {
  const services = ['Full Home Deep Clean', 'Kitchen Deep Clean', 'Carpet & Upholstery Refresh', 'Move-Out Deep Clean', 'Tile & Grout Restoration'];
  const service = random(services);
  const hours = Math.floor(Math.random() * 3) + 2;
  
  return `✨ BEFORE → AFTER

This home had been neglected for months. Layers of dust, grimy baseboards, cloudy windows, and carpet that had seen better days.

Our team spent ${hours} hours bringing it back to life.

📅 Booked: [Day of week]
📍 Location: [Neighborhood/City]
🧹 Service: ${service}
⏱️ Time: ${hours} hours

The result? A home that actually feels clean — not just surface-wiped.

${name} does not cut corners. We clean walls, baseboards, window tracks, light fixtures, and every single surface. What you see is what you get.

Ready for the same treatment?
📞 Call: [Your Phone Number]
💻 Book: [Your Booking Link]

#BeforeAndAfter #DeepClean #${name.replace(/\s/g,'')} #HomeCleaning`;
}

function generateEducationalPost(name) {
  const topics = [
    { title: 'The Truth About "Self-Cleaning" Vacuums', body: `Most homeowners do not realize their vacuum is actually making things worse.

Here is why: Standard vacuums recirculate fine dust particles back into the air through the exhaust. You cannot see it, but you're breathing it.

That's why we use hospital-grade HEPA filtration with H13-rated vacuum systems. It captures 99.97% of particles down to 0.3 microns — including pollen, pet dander, and dust mites.

The difference? You can actually smell it. After a ${name} deep clean, the air in your home is genuinely cleaner.

Want to experience the difference?
📞 Call: [Your Phone Number]` },
    { title: 'Why Your Kitchen Sponge Is Ruining Your Clean', body: `Here is a statistic that might make you cringe: Your kitchen sponge has more bacteria than your toilet seat.

And most household cleaners do not actually sanitize — they just spread the bacteria around.

At ${name}, we use a color-coded cloth system that prevents cross-contamination between rooms. The cloth that cleans your bathroom never touches your kitchen. Period.

It's not the most glamorous part of cleaning, but it is the most important.

We take hygiene seriously so you do not have to.
📞 Call: [Your Phone Number]` },
    { title: "The Hidden Dirt You are Walking On Every Day", body: `Your carpets look clean. But what's actually in them?

The average home accumulates:
🦠 200,000+ bacteria per square inch in high-traffic areas
🌾 Pollen, dust mites, and pet dander trapped deep in fibers
🧪 Chemical residues from shoes and outdoor pollutants

Regular vacuuming only gets the surface. That's why we include deep carpet agitation in every full-home clean — it lifts what's trapped below the surface.

The result? Not just cleaner carpets, but cleaner air in your home.

See the difference for yourself.
📞 Call: [Your Phone Number]` },
  ];

  return random(topics);
}

function generateLocalPost(name) {
  const neighborhoods = ['Downtown', 'the Westside', 'North Park', 'Eastside', 'Lakeview', 'Oakwood', 'Maple Ridge', 'South Hills'];
  const area = random(neighborhoods);
  const years = Math.floor(Math.random() * 6) + 3;

  return `🏡 We are Local — And We are Here to Stay

${name} has been serving homes in ${area} for ${years} years. We are not a franchise. We are not a gig platform. We are your neighbors.

Here is what one of our ${area} customers said:

"${random(["They showed up on time and my house has never looked better. I am a customer for life.", "I was skeptical about hiring a cleaning service, but these guys completely changed my mind.", "After trying three other services, this is the only one that actually cleans everything without being asked."])}"

We know ${area}. We know the homes. And we know what it takes to keep them clean.

📞 Call: [Your Phone Number]
💻 Book: [Your Booking Link]

#SupportLocal #${area.replace(/\s/g,'')} #${name.replace(/\s/g,'')} #HomeCleaning`;
}

function generateTestimonialPost(name) {
  return `⭐ "I did not know my house could look this good."

That's what [Customer Name] said after their first booking with ${name}.

${random(['After having twins, keeping up with housework became impossible. This service literally saved my sanity.', 'The detail they put into cleaning baseboards and corners was incredible. You can tell they actually care.', 'Moving is stressful enough, but they handled the deep clean perfectly. We got our full security deposit back!'])}

We do not just clean. We restore your peace of mind.

Want to be our next 5-star review?
📞 Call: [Your Phone Number]
💻 Book: [Your Booking Link]

#FiveStars #HappyHome #${name.replace(/\s/g,'')} #HomeCleaning`;
}

function generateStaffPost(name) {
  const names = ['Maria', 'James', 'Sarah', 'David', 'Lisa', 'Angela', 'Chris', 'Rachel', 'Tony', 'Mia'];
  const staffName = random(names);
  const years = Math.floor(Math.random() * 5) + 1;
  const homes = Math.floor(Math.random() * 400) + 200;

  return `👋 Behind Every Clean Home — Meet ${staffName}

${staffName} has been with ${name} for ${years} years and has cleaned over ${homes} homes.

"${random(["I love seeing the before and after - it never gets old.", "Every home tells a story. I take pride in making it shine.", "Clean homes, happy families. That is why I do this.", "Details matter. I treat every home like it is my own."])}" — ${staffName}

${staffName} is available for bookings this week. Request them when you call — they would love to help.

📞 Call: [Your Phone Number]

#MeetTheTeam #${staffName} #${name.replace(/\s/g,'')} #HomeCleaning`;
}

function generateSeasonalPost(name, season) {
  const seasonalPosts = {
    spring: {
      title: '🌷 Spring Cleaning Season Is Here — Here is Your Game Plan',
      body: `Spring is the season of fresh starts. But let's be honest — a full spring clean is a lot of work.

Here is what a proper spring deep clean covers:
✅ Windows — interior and exterior tracks
✅ Baseboards — every room, top to bottom
✅ Ceiling fans — dust buildup removed
✅ Under furniture — yes, we move it
✅ Inside cabinets — wiped down and organized
✅ Carpet — deep agitation extraction
✅ Blinds — every single slat

Most cleaning services charge extra for half of these. At ${name}, they're included in every deep clean.

We are booking 2 weeks out. Lock in your spot.
📞 Call: [Your Phone Number]
💻 Book: [Your Booking Link]`
    },
    summer: {
      title: '☀️ Summer Is Here — Is Your Home Guest-Ready?',
      body: `Summer means BBQs, kids home from school, and unexpected guests dropping by.

Is your home ready?

Between summer travel and hosting, your home takes a beating. That's why we offer:

🔹 Pre-vacation clean — come home to a fresh house
🔹 Post-party cleanup — we handle the mess
🔹 Bi-weekly maintenance — so you never fall behind

Our summer schedule is filling up fast. We've added extra Saturday slots to accommodate demand.

📞 Call: [Your Phone Number]
💻 Book: [Your Booking Link]`
    },
    fall: {
      title: '🍂 Cozy Season Starts Here — Pre-Holiday Cleaning',
      body: `The holidays are coming. Is your home ready for hosting?

Now is the perfect time to schedule a deep clean before the chaos begins:

🍁 Carpets refreshed for holiday gatherings
🍁 Kitchen deep clean — oven, fridge, every surface
🍁 Windows cleaned for the shorter days
🍁 Guest rooms prepped for visitors

Don't wait until December when everyone is scrambling. Book now and enjoy the holidays without the cleanup stress.

📞 Call: [Your Phone Number]
💻 Book: [Your Booking Link]`
    },
    winter: {
      title: '❄️ Winter Home Care — Keep the Cozy, Lose the Mess',
      body: `Winter means more time indoors — and more mess.

Muddy boots, wet floors, and the general chaos of being cooped up inside. Your home takes a beating during the cold months.

Here is what we recommend:
❄️ Entryway focused cleaning — high-traffic areas
❄️ Carpet deep clean — winter salt and slush damage
❄️ Kitchen and bathroom deep clean — where germs hide
❄️ Window track cleaning — even if you do not open them

Keep your home warm and clean this winter.
📞 Call: [Your Phone Number]
💻 Book: [Your Booking Link]`
    },
  };

  return seasonalPosts[season] || seasonalPosts.spring;
}

function generateOfferPost(name) {
  const offers = [
    {
      title: '🎯 New Customer Special — First Deep Clean 15% Off',
      body: `First time with ${name}? Welcome.

We are so confident you'll love our service that we're offering 15% off your first deep clean.

Here is what you get:
✅ Full home deep clean — every room, every surface
✅ HEPA vacuumed carpets and upholstery
✅ Kitchen and bathroom deep sanitization
✅ Baseboards, windows, blinds, and ceiling fans
✅ Satisfaction guaranteed — or we come back free

How to claim:
1️⃣ Call [Your Phone Number]
2️⃣ Mention this post
3️⃣ Get 15% off your first booking

⏰ Limited to first 5 new customers this week.

${name} — quality you can see, results you can trust.`
    },
    {
      title: '🎯 Refer a Friend — You Both Save',
      body: `Know a neighbor who could use a clean home?

Refer them to ${name}, and you both get 15% off your next clean.

Here is how it works:
1️⃣ Tell your friend about ${name}
2️⃣ They book a deep clean
3️⃣ You both get 15% off

It's that simple. Your friend gets a clean home. You get a discount. Everyone wins.

📞 Call: [Your Phone Number] to refer someone today.`
    },
    {
      title: '🎯 Book 3 Cleanings — Get Your 4th Free',
      body: `Consistency is the secret to a clean home.

That's why we're offering: Book 3 bi-weekly or monthly cleanings upfront, and your 4th is on us.

Why commit?
✅ Priority scheduling — never wait for a spot
✅ Same trusted team every time
✅ Your home stays consistently clean, not just after a deep clean
✅ Save money — 4th clean free is like getting 25% off

This is for homeowners who are done with the "clean for a day, messy for a month" cycle.

📞 Call: [Your Phone Number] to set up your schedule.

${name} — clean you can count on, every time.`
    },
  ];

  return random(offers);
}

function generateGBPPost(name, season, postType) {
  const posts = {
    seasonal: {
      title: `${seasonEmojis[season]} ${seasons[season]} Cleaning — Book Your Spot`,
      body: `${seasonEmojis[season]} ${seasons[season]} is here and we're helping homes in [Your City] get ${season}-ready. Our deep clean covers everything — windows, carpets, baseboards, and more. Limited spots available this week. Call [Your Phone Number] to schedule.`
    },
    spotlight: {
      title: `🧹 Service Spotlight: Deep Clean`,
      body: `Did you know we offer comprehensive deep cleaning? It's one of our most requested services. Our team is trained, insured, and thorough. Starting at $149. Call [Your Phone Number] for a free quote.`
    },
    review: {
      title: `⭐ What Our Customers Say`,
      body: `"${random(['Absolutely amazing service!', 'Best cleaning we have ever had', 'Thorough, professional, and friendly', 'Worth every penny', 'Spotless results every time'])}" — ${random(['Sarah M.', 'James T.', 'Linda R.', 'Mike P.', 'Angela D.'])}. Ready to join our 5-star family? Call [Your Phone Number] to book.`
    },
    offer: {
      title: `🎉 ${seasonEmojis[season]} Seasonal Special`,
      body: `${seasonEmojis[season]} Special offer this week: New customers get 15% off their first deep clean. Mention this post when you call. Limited availability. Call [Your Phone Number] to book.`
    },
  };

  return posts[postType] || posts.seasonal;
}

function generateNewsletter(name, season) {
  const tips = [
    `Pro tip: Run your ceiling fans before we arrive. It helps circulate air and prevents dust from settling back after we clean.`,
    `Did you know? Cleaning your dishwasher filter once a month can add years to its life. We include this in every kitchen deep clean.`,
    `Quick win: Wipe down your shower walls with a squeegee after each use. It cuts soap scum buildup by 80%.`,
    `Hidden spot alert: Light fixtures collect more dust than any other surface in your home. We get them every time.`,
    `Floor care: Never use vinegar on natural stone or hardwood — the acidity can etch the finish over time.`,
  ];

  return {
    title: `📬 ${name} Weekly — ${formatDate(getWeekDates()[0])}`,
    body: `Subject: Your Weekly Cleaning Plan from ${name}

Hi [Customer Name],

Hope you're having a great week! Here is what's happening at ${name}:

🏠 TIP OF THE WEEK
${random(tips)}

📅 BOOKING REMINDER
We are booking ${Math.floor(Math.random() * 14) + 7} days out. If you're due for a clean, now's the time to lock in your regular slot.

🎁 EXCLUSIVE OFFER
Show this email and get a free kitchen sparkle service (cabinet fronts, backsplash, and countertops) on your next booking.

📞 Book: [Your Phone Number]
💻 Visit: [Your Website]

Stay clean,
The ${name} Team

P.S. We offer eco-friendly cleaning products upon request — just ask when you book!`
  };
}

function generateReviewReplies(name) {
  return [
    { title: '5-Star Reply', body: `Wow, thank you for this! We are so glad you had a great experience with ${name}. Reviews like yours make our team's day. We look forward to serving you again soon!` },
    { title: '5-Star Reply (Alt)', body: `Thank you for the kind words! Our team works hard to make every home shine, and we're thrilled it shows. We appreciate you choosing ${name}!` },
    { title: '4-Star Reply', body: `Thank you for your feedback! We are happy you enjoyed your experience. We are always looking to improve — if there's anything we can do to earn that 5th star next time, please reach out. We'd love to hear from you.` },
    { title: '3-Star Reply', body: `Thank you for taking the time to leave an honest review. We'd love the opportunity to make things right. Please contact us directly at [Your Phone Number] or [Your Email] so we can understand what happened and find a solution. Your satisfaction is our priority.` },
    { title: '1-2 Star Reply', body: `We are sorry to hear your experience did not meet expectations. This is not the standard we strive for at ${name}. Please reach out to us at [Your Phone Number] so we can personally address your concerns. We appreciate you giving us the opportunity to improve.` },
  ];
}

// ===================== PLAN GENERATOR =====================

async function generateWeeklyPlan(businessId, auditId, name, category) {
  const season = getSeason();
  const weekDates = getWeekDates();
  const monday = formatDate(weekDates[0]);
  const friday = formatDate(weekDates[4]);

  // Generate all content
  const socialPosts = [
    generateUrgencyPost(name, season, weekDates),
    generateBeforeAfter(name, season),
    generateEducationalPost(name),
    generateLocalPost(name),
    generateTestimonialPost(name),
    generateStaffPost(name),
    generateSeasonalPost(name, season),
    generateOfferPost(name),
  ];

  const gbpPosts = [
    generateGBPPost(name, season, 'seasonal'),
    generateGBPPost(name, season, 'spotlight'),
    generateGBPPost(name, season, 'review'),
    generateGBPPost(name, season, 'offer'),
  ];

  const newsletter = generateNewsletter(name, season);
  const reviewReplies = generateReviewReplies(name);

  // Build the complete weekly plan document
  const plan = `════════════════════════════════════════════════
  ${name} — WEEKLY MARKETING PLAN
  ${monday} — ${friday}
════════════════════════════════════════════════

📊 THIS WEEK'S FOCUS
${seasons[season]} ${seasonEmojis[season]} — ${season === 'summer' ? 'Peak season, families at home, pre-vacation cleaning' : season === 'spring' ? 'Spring cleaning push, allergy season prep' : season === 'fall' ? 'Pre-holiday prep, cozy season' : 'Winter indoor focus, holiday prep'}

📅 DAILY POSTING SCHEDULE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Monday    | 9:00 AM  — Before/After post
          | 12:00 PM — GBP: Service Spotlight
Tuesday   | 9:00 AM  — Educational post
          | 10:00 AM — NEWSLETTER SENT
Wednesday | 9:00 AM  — Customer testimonial
          | 12:00 PM — GBP: Review Highlight
Thursday  | 9:00 AM  — Staff spotlight
          | 12:00 PM — GBP: Seasonal Offer
Friday    | 8:00 AM  — Limited availability post
          | 12:00 PM — GBP: Seasonal Update
Saturday  | 10:00 AM — Community/local post
          | 2:00 PM  — Special offer post
Sunday    | OFF — No posts scheduled

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 POST 1 — LIMITED AVAILABILITY (Post Friday 8AM)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${socialPosts[0]}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 POST 2 — BEFORE & AFTER (Post Monday 9AM)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${socialPosts[1]}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 POST 3 — EDUCATIONAL (Post Tuesday 9AM)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${socialPosts[2].body}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 POST 4 — LOCAL COMMUNITY (Post Saturday 10AM)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${socialPosts[3]}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 POST 5 — CUSTOMER TESTIMONIAL (Post Wednesday 9AM)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${socialPosts[4]}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 POST 6 — STAFF SPOTLIGHT (Post Thursday 9AM)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${socialPosts[5]}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 POST 7 — SEASONAL (Post Saturday 2PM)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${socialPosts[6].body}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 POST 8 — SPECIAL OFFER (Post Saturday 2PM)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${socialPosts[7].body}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 GOOGLE BUSINESS PROFILE POSTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Post 1 (Monday 12PM): ${gbpPosts[0].title}
${gbpPosts[0].body}

Post 2 (Wednesday 12PM): ${gbpPosts[1].title}
${gbpPosts[1].body}

Post 3 (Thursday 12PM): ${gbpPosts[2].title}
${gbpPosts[2].body}

Post 4 (Friday 12PM): ${gbpPosts[3].title}
${gbpPosts[3].body}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📬 NEWSLETTER (Send Tuesday 10AM)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${newsletter.body}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⭐ REVIEW REPLY TEMPLATES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${reviewReplies.map(r => `${r.title}:
${r.body}
`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 SEO TIP OF THE WEEK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Action: Check your Google Business Profile for Q&A questions
Why: Customers often ask questions directly on your GBP. If you do not answer within 24 hours, Google may stop showing your profile in search results.
How: Open your Google Business Profile → Click "Questions & Answers" → Answer any unanswered questions.

⏱️ Estimated time: 5 minutes

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ THIS WEEK'S ACTION LIST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[ ] Monday — Post Before/After at 9AM, GBP post at 12PM
[ ] Tuesday — Post Educational content at 9AM, Send Newsletter at 10AM
[ ] Wednesday — Post Testimonial at 9AM, GBP post at 12PM
[ ] Thursday — Post Staff Spotlight at 9AM, GBP post at 12PM
[ ] Friday — Post Limited Availability at 8AM, GBP post at 12PM
[ ] Saturday — Post Local Community at 10AM, Post Offer at 2PM
[ ] This week — Check GBP for Q&A questions
[ ] This week — Respond to any new reviews using templates above

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Need help? Reply to this email or call [Your Phone Number].
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

  // Store the full plan as an email-type content item
  await execute(`INSERT INTO content_items (audit_id, type, title, body, status) VALUES (${safe(auditId)}, 'email', 'Weekly Marketing Plan — ${monday}', ${safe(plan)}, 'draft')`);

  // Also store individual social posts as separate items
  for (let i = 0; i < socialPosts.length; i++) {
    const post = socialPosts[i];
    const title = `Post ${i+1}: ${post.title || (typeof post === 'object' ? post.body?.substring(0, 40) : post.substring(0, 40))}`;
    const body = typeof post === 'object' ? (post.body || JSON.stringify(post)) : post;
    await execute(`INSERT INTO content_items (audit_id, type, title, body, status) VALUES (${safe(auditId)}, 'social_post', ${safe(title)}, ${safe(body)}, 'draft')`);
  }

  // Store GBP posts
  for (const post of gbpPosts) {
    await execute(`INSERT INTO content_items (audit_id, type, title, body, status) VALUES (${safe(auditId)}, 'google_post', ${safe(post.title)}, ${safe(post.body)}, 'draft')`);
  }

  // Store review replies
  for (const reply of reviewReplies) {
    await execute(`INSERT INTO content_items (audit_id, type, title, body, status) VALUES (${safe(auditId)}, 'review_reply', ${safe(reply.title)}, ${safe(reply.body)}, 'draft')`);
  }

  return plan;
}

module.exports = { generateWeeklyPlan };