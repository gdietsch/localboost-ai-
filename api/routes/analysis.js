/**
 * Analysis route for deep-dive website audit.
 */
const express = require('express');
const { query, execute } = require('../db.js');
const { analyzeWebsite, saveAnalysis } = require('../services/analyzer.js');

const router = express.Router();
const safe = (s) => `'${String(s).replace(/'/g, "''")}'`;

/**
 * POST /api/analysis/:auditId
 * Runs a full deep-dive analysis on the business website.
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

    // Run the analysis
    const report = await analyzeWebsite(biz.website, answers);

    // Save results to DB
    await saveAnalysis(auditId, report);

    res.json({
      success: true,
      overall: report.overall,
      grade: report.grade,
      scores: report.scores,
      findings: report.findings,
      revenueEstimate: report.revenueEstimate,
    });
  } catch (err) {
    console.error('Analysis error:', err);
    res.status(500).json({ error: 'Failed to analyze website' });
  }
});

/**
 * GET /api/analysis/:auditId/results
 * Returns the full analysis results for an audit.
 */
router.get('/:auditId/results', async (req, res) => {
  try {
    const { auditId } = req.params;

    const audits = await query(
      `SELECT a.id, a.status, b.name, b.website, b.category
       FROM audits a JOIN businesses b ON a.business_id = b.id
       WHERE a.id = ${safe(auditId)}`
    );

    if (!audits || audits.length === 0) {
      return res.status(404).json({ error: 'Audit not found' });
    }

    const content = await query(
      `SELECT id, type, title, body, status FROM content_items WHERE audit_id = ${safe(auditId)} ORDER BY id`
    );

    res.json({ ...audits[0], content: content || [] });
  } catch (err) {
    console.error('Error fetching analysis:', err);
    res.status(500).json({ error: 'Failed to fetch analysis' });
  }
});

module.exports = router;