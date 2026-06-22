/**
 * Analysis routes for deep-dive website audit.
 */
const express = require('express');
const { query, execute } = require('../db.js');
const { analyzeWebsite, saveAnalysis, getGrade } = require('../services/analyzer.js');

const router = express.Router();
const safe = (s) => `'${String(s).replace(/'/g, "''")}'`;

/**
 * POST /api/analysis/analyze
 * Takes: { name, website, category, competitors, email }
 * Runs a full website analysis from scratch, creates a business & audit in the DB, and stores results.
 */
router.post('/analyze', async (req, res) => {
  try {
    const { name, website, category, competitors, email } = req.body;

    if (!website) {
      return res.status(400).json({ error: 'Website is required' });
    }

    const bizName = name || 'Local Business';
    const bizCategory = category || 'Home Cleaners';
    
    // Normalize website URL — prepend https:// if missing
    let targetUrl = website.trim();
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl;
    }

    // Default guest email if none is provided
    const bizEmail = email || `audit-${Date.now()}@localboosts.biz`;

    // 1. Get or create business in DB
    let businesses = await query(`SELECT id FROM businesses WHERE email = ${safe(bizEmail)} AND name = ${safe(bizName)} LIMIT 1`);
    let businessId;
    if (businesses && businesses.length > 0) {
      businessId = businesses[0].id;
    } else {
      await execute(`INSERT INTO businesses (name, website, category, email) VALUES (${safe(bizName)}, ${safe(targetUrl)}, ${safe(bizCategory)}, ${safe(bizEmail)})`);
      const newBiz = await query(`SELECT id FROM businesses WHERE email = ${safe(bizEmail)} AND name = ${safe(bizName)} ORDER BY created_at DESC LIMIT 1`);
      businessId = newBiz?.[0]?.id;
    }

    if (!businessId) {
      return res.status(500).json({ error: 'Failed to create business in database' });
    }

    // 2. Create new audit in DB
    await execute(`INSERT INTO audits (business_id, status) VALUES (${safe(businessId)}, 'generating')`);
    const auditResult = await query(`SELECT id FROM audits WHERE business_id = ${safe(businessId)} ORDER BY created_at DESC LIMIT 1`);
    const auditId = auditResult[0]?.id;

    if (!auditId) {
      return res.status(500).json({ error: 'Failed to create audit record in database' });
    }

    // 3. Run the live website analysis
    const report = await analyzeWebsite(targetUrl, {
      name: bizName,
      category: bizCategory,
      competitors: competitors || ''
    });

    // 4. Save results (which updates audit to 'complete' and generates tasks + custom marketing items)
    await saveAnalysis(auditId, report);

    // 5. Respond with full structured results
    res.json({
      success: true,
      auditId,
      businessId,
      overall: report.overall,
      grade: report.grade,
      scores: report.scores,
      findings: report.findings,
      revenueEstimate: report.revenueEstimate,
      screenshot_url: report.screenshots[0]
    });
  } catch (err) {
    console.error('API /analyze error:', err);
    res.status(500).json({ error: 'Failed to run website analysis: ' + err.message });
  }
});

/**
 * POST /api/analysis/:auditId
 * Runs a full deep-dive analysis on the business website of an existing audit.
 * Body: { source, monthlyCustomers, avgValue, competitors, challenge }
 */
router.post('/:auditId', async (req, res) => {
  try {
    const { auditId } = req.params;
    const answers = req.body;

    // Get the audit and business info
    const audits = await query(
      `SELECT a.id, a.status, b.name, b.website, b.category, b.email
       FROM audits a JOIN businesses b ON a.business_id = b.id
       WHERE a.id = ${safe(auditId)}`
    );

    if (!audits || audits.length === 0) {
      return res.status(404).json({ error: 'Audit not found' });
    }

    const biz = audits[0];
    await execute(`UPDATE audits SET status = 'generating' WHERE id = ${safe(auditId)}`);

    // Run the analysis with answers merged in
    const report = await analyzeWebsite(biz.website, {
      name: biz.name,
      category: biz.category,
      competitors: answers.competitors || '',
      monthlyCustomers: answers.monthlyCustomers,
      avgValue: answers.avgValue
    });

    // Save results to DB
    await saveAnalysis(auditId, report);

    res.json({
      success: true,
      overall: report.overall,
      grade: report.grade,
      scores: report.scores,
      findings: report.findings,
      revenueEstimate: report.revenueEstimate,
      screenshot_url: report.screenshots[0]
    });
  } catch (err) {
    console.error('Analysis error:', err);
    res.status(500).json({ error: 'Failed to analyze website' });
  }
});

/**
 * GET /api/analysis/:id/results
 * Returns the full analysis results, including specific findings, scores, and screenshot.
 */
router.get('/:id/results', async (req, res) => {
  try {
    const { id } = req.params;

    const audits = await query(
      `SELECT a.id, a.status, a.created_at, b.name as business_name, b.website, b.category, b.email
       FROM audits a JOIN businesses b ON a.business_id = b.id
       WHERE a.id = ${safe(id)}`
    );

    if (!audits || audits.length === 0) {
      return res.status(404).json({ error: 'Audit not found' });
    }

    const audit = audits[0];

    // Load tasks, social posts, emails from content_items
    const content = await query(
      `SELECT id, type, title, body, status FROM content_items WHERE audit_id = ${safe(id)} ORDER BY id`
    );

    // Extract the findings from the content items of type 'task' (excluding the overall score header)
    const taskItems = content.filter(item => item.type === 'task');
    
    // Attempt to extract overall score from the content items
    const scoreItem = taskItems.find(item => item.title.includes('Overall Score'));
    let overall = 65; // fallback
    let grade = 'D'; // fallback
    let summary = '';

    if (scoreItem) {
      const matchScore = scoreItem.title.match(/Overall Score:\s*(\d+)/i);
      if (matchScore) {
        overall = parseInt(matchScore[1]);
        grade = getGrade(overall);
      }
      summary = scoreItem.body;
    }

    const findings = taskItems
      .filter(item => !item.title.includes('Overall Score'))
      .map(item => {
        const severity = item.title.includes('🔴') ? 'high' : 'medium';
        const cleanTitle = item.title.replace(/^[🔴🟡✅]\s*/, '').replace(/^\[.*?\]\s*/, '');
        const categoryMatch = item.title.match(/^\[(.*?)\]/);
        const category = categoryMatch ? categoryMatch[1] : 'Website Health';
        return {
          category,
          issue: cleanTitle,
          severity,
          impact: item.body
        };
      });

    // Make dynamic screenshot URL using microlink
    const screenshotUrl = `https://api.microlink.io/?url=${encodeURIComponent(audit.website)}&screenshot=true&embed=screenshot.url`;

    res.json({
      success: true,
      id: audit.id,
      status: audit.status,
      created_at: audit.created_at,
      business_name: audit.business_name,
      website: audit.website,
      category: audit.category,
      email: audit.email,
      overall,
      grade,
      screenshot_url: screenshotUrl,
      findings: findings,
      content: content || [],
      revenueEstimate: {
        summary: summary || `fixing issues could add potential clients monthly.`,
        topOpportunity: `Optimizing your top issues can generate more revenue.`
      }
    });
  } catch (err) {
    console.error('Error fetching analysis:', err);
    res.status(500).json({ error: 'Failed to fetch analysis' });
  }
});

module.exports = router;
