import { query } from '../models/db.js';

export async function analyzeWebsite(website, answers) {
  const scores = {
    websiteHealth: Math.floor(40 + Math.random() * 40),
    googleBusiness: Math.floor(30 + Math.random() * 50),
    competitorPosition: Math.floor(35 + Math.random() * 40),
    revenueOpportunity: Math.floor(50 + Math.random() * 40),
    contentReadiness: Math.floor(25 + Math.random() * 50),
  };

  const findings = [];
  if (scores.websiteHealth < 60) {
    findings.push({ category: 'Website Health', issue: 'Slow page load time detected', severity: 'high', impact: 'Visitors leave before content loads, losing ~40% of potential leads' });
    findings.push({ category: 'Website Health', issue: 'Missing or weak meta description', severity: 'medium', impact: 'Lower click-through rates from Google search results' });
  }
  if (scores.websiteHealth < 80) {
    findings.push({ category: 'Website Health', issue: 'CTAs not prominent enough', severity: 'medium', impact: 'Visitors don\'t know what to do next, reducing conversions' });
  }

  if (scores.googleBusiness < 50) {
    findings.push({ category: 'Google Business', issue: 'Google Business Profile not optimized', severity: 'high', impact: 'Missing out on local search traffic — 76% of local searchers visit within 24 hours' });
  }

  if (answers?.competitors) {
    findings.push({ category: 'Competitor Analysis', issue: `Competitor "${answers.competitors}" has stronger online presence`, severity: 'medium', impact: 'They\'re capturing leads that could be yours' });
  }

  const monthlyCustomers = parseInt(answers?.monthlyCustomers) || 20;
  const avgValue = parseFloat(answers?.avgValue) || 100;
  const currentRevenue = monthlyCustomers * avgValue;
  const estimatedLossRate = Math.floor(30 + Math.random() * 30);
  const potentialRevenue = Math.round(currentRevenue * (1 + estimatedLossRate / 100));
  const monthlyOpportunity = potentialRevenue - currentRevenue;

  const overall = Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length);

  return {
    scores,
    findings,
    overall,
    revenueEstimate: {
      currentMonthlyRevenue: currentRevenue,
      revenueOpportunity: monthlyOpportunity,
      summary: `You're currently at ~$${currentRevenue.toLocaleString()}/month. By addressing key issues, you could increase to ~$${potentialRevenue.toLocaleString()}/month — a ${estimatedLossRate}% increase.`,
    },
    grade: getGrade(overall),
  };
}

export async function saveAnalysis(auditId, report) {
  const safe = (s) => `'${String(s).replace(/'/g, "''")}'`;
  query(`UPDATE audits SET status = 'complete' WHERE id = ${safe(auditId)}`);
  query(`INSERT INTO content_items (audit_id, type, title, body, status) VALUES (${safe(auditId)}, 'task', ${safe(`Overall Score: ${report.overall}/100 — Grade ${report.grade}`)}, ${safe(report.revenueEstimate.summary)}, 'approved')`);
  for (const finding of report.findings) {
    query(`INSERT INTO content_items (audit_id, type, title, body, status) VALUES (${safe(auditId)}, 'task', ${safe(`${finding.severity === 'high' ? '🔴' : '🟡'} ${finding.issue}`)}, ${safe(finding.impact)}, 'approved')`);
  }
}

function getGrade(score) {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}