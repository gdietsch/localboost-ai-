import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

function getGrade(score) {
  if (score >= 90) return { letter: 'A', color: 'bg-green-500', textColor: 'text-green-700', bgColor: 'bg-green-100' };
  if (score >= 80) return { letter: 'B', color: 'bg-blue-500', textColor: 'text-blue-700', bgColor: 'bg-blue-100' };
  if (score >= 70) return { letter: 'C', color: 'bg-yellow-500', textColor: 'text-yellow-700', bgColor: 'bg-yellow-100' };
  if (score >= 60) return { letter: 'D', color: 'bg-orange-500', textColor: 'text-orange-700', bgColor: 'bg-orange-100' };
  return { letter: 'F', color: 'bg-red-500', textColor: 'text-red-700', bgColor: 'bg-red-100' };
}

const categoryConfig = {
  websiteHealth: { label: 'Website Health', icon: '🚀' },
  googleBusiness: { label: 'Google Business Profile', icon: '📍' },
  competitorPosition: { label: 'Competitor Position', icon: '📊' },
  revenueOpportunity: { label: 'Revenue Opportunity', icon: '💰' },
  contentReadiness: { label: 'Content Readiness', icon: '📱' },
};

export default function AuditResult() {
  const { id } = useParams();
  const [audit, setAudit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function fetchAudit() {
      try {
        const res = await fetch(`/api/analysis/${id}/results`);
        if (!res.ok) throw new Error('Audit not found');
        const data = await res.json();
        if (!cancelled) {
          setAudit(data);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) { setError(err.message); setLoading(false); }
      }
    }

    fetchAudit();
    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500">Loading your report...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-2">Oops!</h2>
          <p>{error}</p>
          <Link to="/audit/new" className="text-brand-600 hover:underline mt-4 inline-block">Try again</Link>
        </div>
      </div>
    );
  }

  if (!audit) return null;

  const items = audit.content || [];
  const scoreItem = items.find(i => i.title?.startsWith('Overall Score'));
  const findings = items.filter(i => i.title?.startsWith('🔴') || i.title?.startsWith('🟡'));
  const tasks = items.filter(i => i.type === 'task' && !i.title?.startsWith('Overall') && !i.title?.startsWith('🔴') && !i.title?.startsWith('🟡'));
  const socialPosts = items.filter(i => i.type === 'social_post');
  const googlePosts = items.filter(i => i.type === 'google_post');
  const emails = items.filter(i => i.type === 'email');
  const reviews = items.filter(i => i.type === 'review_reply');

  // Estimate scores from findings
  const totalFindings = findings.length;
  const highIssues = findings.filter(f => f.title?.startsWith('🔴')).length;
  const medIssues = findings.filter(f => f.title?.startsWith('🟡')).length;

  return (
    <div className="max-5xl mx-auto px-4 py-10 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <Link to="/dashboard" className="text-brand-600 hover:underline text-sm">&larr; Back to Dashboard</Link>

        {/* Report Header */}
        <div className="bg-white rounded-2xl shadow-sm border p-8 mb-6 mt-4">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className={`w-24 h-24 rounded-2xl flex items-center justify-center text-4xl font-bold text-white ${scoreItem ? getGrade(75).color : 'bg-gray-300'}`}>
              {scoreItem ? getGrade(75).letter : '?'}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-1">Marketing Audit Report</h1>
              <p className="text-gray-500 mb-2">for <strong>{audit.name}</strong> · {audit.category}</p>
              {scoreItem && <p className="text-gray-600 text-sm">{scoreItem.body}</p>}
            </div>
            <div className="text-right text-sm text-gray-400">
              <p>Generated {new Date().toLocaleDateString()}</p>
              <p className="font-semibold text-brand-600">Paid Report</p>
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="bg-white rounded-2xl shadow-sm border p-8 mb-6">
          <h2 className="text-xl font-bold mb-4">📋 Executive Summary</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            We analyzed <strong>{audit.name}</strong>'s online presence and found <strong>{totalFindings} key issues</strong>
            {highIssues > 0 ? `, including ${highIssues} critical problems` : ''} that are impacting your ability to attract new customers.
          </p>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-red-50 rounded-xl p-4">
              <div className="text-2xl font-bold text-red-600">{highIssues}</div>
              <div className="text-xs text-red-600">Critical Issues</div>
            </div>
            <div className="bg-yellow-50 rounded-xl p-4">
              <div className="text-2xl font-bold text-yellow-600">{medIssues}</div>
              <div className="text-xs text-yellow-600">Improvements</div>
            </div>
            <div className="bg-green-50 rounded-xl p-4">
              <div className="text-2xl font-bold text-green-600">{totalFindings > 0 ? `${Math.round((totalFindings - highIssues - medIssues) / totalFindings * 100) || 0}%` : 'N/A'}</div>
              <div className="text-xs text-green-600">Opportunity Score</div>
            </div>
          </div>
        </div>

        {/* Critical Findings */}
        {findings.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border p-8 mb-6">
            <h2 className="text-xl font-bold mb-4">🔍 Key Findings</h2>
            <div className="space-y-3">
              {findings.slice(0, 6).map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                  <span className="text-lg mt-0.5">{item.title?.startsWith('🔴') ? '🔴' : '🟡'}</span>
                  <div>
                    <p className="font-medium text-gray-800">{item.title?.replace(/^[🔴🟡]\s*/, '')}</p>
                    <p className="text-sm text-gray-500">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 30-Day Action Plan */}
        {tasks.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border p-8 mb-6">
            <h2 className="text-xl font-bold mb-4">📋 30-Day Action Plan</h2>
            <div className="space-y-3">
              {tasks.map((item) => (
                <div key={item.id} className="border-l-4 border-brand-400 pl-4 py-2">
                  <h3 className="font-semibold text-gray-800">{item.title}</h3>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Revenue Opportunity */}
        <div className="bg-gradient-to-r from-brand-600 to-brand-800 rounded-2xl p-8 mb-6 text-white">
          <h2 className="text-xl font-bold mb-3">💰 Revenue Opportunity</h2>
          <p className="text-brand-100 mb-4">
            Based on our analysis, addressing the issues we found could significantly increase your monthly revenue.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold">{totalFindings}</div>
              <div className="text-sm text-brand-200">Issues to Fix</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold">{highIssues + medIssues}</div>
              <div className="text-sm text-brand-200">Priority Actions</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold">${(highIssues * 800 + medIssues * 300).toLocaleString()}+</div>
              <div className="text-sm text-brand-200">Est. Monthly Upside</div>
            </div>
          </div>
        </div>

        {/* Content Library */}
        <div className="bg-white rounded-2xl shadow-sm border p-8 mb-6">
          <h2 className="text-xl font-bold mb-4">📱 Content Library</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {socialPosts.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="font-semibold text-gray-700 mb-2">📸 Social Posts ({socialPosts.length})</p>
                <p className="text-sm text-gray-500">{socialPosts[0]?.title}</p>
              </div>
            )}
            {googlePosts.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="font-semibold text-gray-700 mb-2">🔍 Google Posts ({googlePosts.length})</p>
                <p className="text-sm text-gray-500">{googlePosts[0]?.title}</p>
              </div>
            )}
            {emails.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="font-semibold text-gray-700 mb-2">✉️ Email Drafts ({emails.length})</p>
                <p className="text-sm text-gray-500">{emails[0]?.title}</p>
              </div>
            )}
            {reviews.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="font-semibold text-gray-700 mb-2">⭐ Review Templates ({reviews.length})</p>
                <p className="text-sm text-gray-500">{reviews[0]?.title}</p>
              </div>
            )}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">Want the full breakdown with screenshots and competitor analysis?</p>
          <Link to="/dashboard"
            className="inline-block bg-brand-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-brand-700 transition shadow-lg">
            View All Reports
          </Link>
        </div>
      </div>
    </div>
  );
}