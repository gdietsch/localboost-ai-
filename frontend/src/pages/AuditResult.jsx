import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const typeLabels = {
  task: '📋 Action Items',
  social_post: '📸 Social Media Posts',
  google_post: '📍 Google Business Posts',
  email: '✉️ Email Campaigns',
  review_reply: '⭐ Review Reply Templates',
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
        const res = await fetch(`/api/audits/${id}`);
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
  const tasks = items.filter(i => i.type === 'task');
  const socialPosts = items.filter(i => i.type === 'social_post');
  const googlePosts = items.filter(i => i.type === 'google_post');
  const emails = items.filter(i => i.type === 'email');
  const reviews = items.filter(i => i.type === 'review_reply');

  const grouped = {};
  for (const item of items) {
    if (!grouped[item.type]) grouped[item.type] = [];
    grouped[item.type].push(item);
  }

  const totalFindings = tasks.length;
  const highIssues = Math.ceil(tasks.length * 0.4);
  const medIssues = Math.ceil(tasks.length * 0.3);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <Link to="/dashboard" className="text-brand-600 hover:underline text-sm">&larr; Back to Dashboard</Link>

        {/* Report Header */}
        <div className="bg-white rounded-2xl shadow-sm border p-8 mb-6 mt-4">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-24 h-24 rounded-2xl bg-brand-600 flex items-center justify-center text-4xl font-bold text-white">
              {audit.business_name?.[0] || '?'}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-1">Marketing Audit Report</h1>
              <p className="text-gray-500 mb-2">for <strong>{audit.business_name || audit.name}</strong> · {audit.category}</p>
              <p className="text-gray-600 text-sm">Complete audit with {items.length} content pieces ready for your business.</p>
            </div>
            <div className="text-right text-sm text-gray-400">
              <p>Generated {audit.created_at ? new Date(audit.created_at).toLocaleDateString() : 'Today'}</p>
              <p className="font-semibold text-brand-600">Full Report</p>
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="bg-white rounded-2xl shadow-sm border p-8 mb-6">
          <h2 className="text-xl font-bold mb-4">📋 Executive Summary</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            We analyzed <strong>{audit.business_name || audit.name}</strong>'s online presence and generated a comprehensive
            marketing plan with <strong>{items.length} content items</strong> to help you attract more customers.
          </p>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-brand-50 rounded-xl p-4">
              <div className="text-2xl font-bold text-brand-600">{items.length}</div>
              <div className="text-xs text-brand-600">Total Content Items</div>
            </div>
            <div className="bg-green-50 rounded-xl p-4">
              <div className="text-2xl font-bold text-green-600">{tasks.length}</div>
              <div className="text-xs text-green-600">Action Tasks</div>
            </div>
            <div className="bg-purple-50 rounded-xl p-4">
              <div className="text-2xl font-bold text-purple-600">{socialPosts.length + googlePosts.length}</div>
              <div className="text-xs text-purple-600">Social & Google Posts</div>
            </div>
          </div>
        </div>

        {/* 30-Day Action Plan */}
        {tasks.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border p-8 mb-6">
            <h2 className="text-xl font-bold mb-4">📋 30-Day Action Plan</h2>
            <div className="space-y-4">
              {tasks.map((item) => (
                <div key={item.id} className="border-l-4 border-brand-400 pl-4 py-2">
                  <h3 className="font-semibold text-gray-800">{item.title}</h3>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap mt-1">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Revenue Opportunity */}
        <div className="bg-gradient-to-r from-brand-600 to-brand-800 rounded-2xl p-8 mb-6 text-white">
          <h2 className="text-xl font-bold mb-3">💰 Revenue Opportunity</h2>
          <p className="text-brand-100 mb-4">
            Implementing the weekly action plan above can help you attract more customers and grow revenue.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold">{tasks.length}</div>
              <div className="text-sm text-brand-200">Weekly Actions</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold">{socialPosts.length + googlePosts.length}</div>
              <div className="text-sm text-brand-200">Ready-to-Post Content</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold">{emails.length + reviews.length}</div>
              <div className="text-sm text-brand-200">Templates Included</div>
            </div>
          </div>
        </div>

        {/* Content Library */}
        {Object.entries(grouped).map(([type, typeItems]) => {
          if (type === 'task') return null;
          return (
            <div key={type} className="bg-white rounded-2xl shadow-sm border p-8 mb-6">
              <h2 className="text-xl font-bold mb-4">{typeLabels[type] || type} ({typeItems.length})</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {typeItems.map((item) => (
                  <div key={item.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <h3 className="font-semibold text-gray-800 text-sm mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{item.body}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* CTA */}
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">Need help implementing your marketing plan?</p>
          <Link to="/dashboard"
            className="inline-block bg-brand-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-brand-700 transition shadow-lg">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}