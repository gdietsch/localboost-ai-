import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Map content patterns to marketing goals
function inferGoal(item) {
  const title = (item.title || '').toLowerCase();
  const body = (item.body || '').toLowerCase();

  if (title.includes('limited availability') || title.includes('only') && title.includes('spot') || body.includes('call us') && (body.includes('today') || body.includes('now'))) {
    return { label: 'Direct Response', badge: '🔔', color: 'bg-red-100 text-red-700' };
  }
  if (title.includes('before') || title.includes('after') || title.includes('transformation')) {
    return { label: 'Social Proof', badge: '✨', color: 'bg-purple-100 text-purple-700' };
  }
  if (title.includes('education') || title.includes('fact') || title.includes('truth') || title.includes('hidden') || title.includes('tip') || title.includes('hack') || title.includes('pro tip')) {
    return { label: 'Expert Positioning', badge: '🔍', color: 'bg-blue-100 text-blue-700' };
  }
  if (title.includes('proud to serve') || title.includes('neighbor') || title.includes('local') || body.includes('[neighborhood]') || body.includes('#LocalBusiness')) {
    return { label: 'Local Community', badge: '🏡', color: 'bg-green-100 text-green-700' };
  }
  if (title.includes('customer') || title.includes('testimonial') || title.includes('what our') || body.includes('⭐⭐⭐⭐⭐')) {
    return { label: 'Social Proof', badge: '⭐', color: 'bg-purple-100 text-purple-700' };
  }
  if (title.includes('meet') || title.includes('team') || title.includes('spotlight') && !title.includes('service')) {
    return { label: 'Human Connection', badge: '👋', color: 'bg-orange-100 text-orange-700' };
  }
  if (title.includes('season') || title.includes('spring') || title.includes('summer') || title.includes('fall') || title.includes('winter') || title.includes('holiday')) {
    return { label: 'Seasonal Relevance', badge: '🌤️', color: 'bg-yellow-100 text-yellow-700' };
  }
  if (title.includes('special offer') || title.includes('special') || title.includes('discount') || title.includes('off') || title.includes('free')) {
    return { label: 'Direct Offer', badge: '🎯', color: 'bg-amber-100 text-amber-700' };
  }
  if (item.type === 'google_post') {
    return { label: 'Local SEO', badge: '📍', color: 'bg-teal-100 text-teal-700' };
  }
  if (item.type === 'email') {
    return { label: 'Nurture', badge: '✉️', color: 'bg-indigo-100 text-indigo-700' };
  }
  if (item.type === 'review_reply') {
    return { label: 'Reputation', badge: '⭐', color: 'bg-pink-100 text-pink-700' };
  }
  return { label: 'General', badge: '📌', color: 'bg-gray-100 text-gray-600' };
}

const typeColors = {
  task: 'border-l-brand-500',
  social_post: 'border-l-purple-500',
  google_post: 'border-l-teal-500',
  email: 'border-l-indigo-500',
  review_reply: 'border-l-pink-500',
};

const typeIcons = {
  task: '📋',
  social_post: '📸',
  google_post: '📍',
  email: '✉️',
  review_reply: '⭐',
};

export default function Dashboard() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [businesses, setBusinesses] = useState([]);
  const [selectedBiz, setSelectedBiz] = useState(null);
  const [selectedAudit, setSelectedAudit] = useState(null);
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(null);
  const [showEmailForm, setShowEmailForm] = useState(true);

  async function handleLookup(e) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/businesses?email=${encodeURIComponent(email)}`);
      if (!res.ok) throw new Error('Failed to load your businesses');
      const data = await res.json();
      setBusinesses(data);
      setSubmitted(true);
      setShowEmailForm(false);
      if (data.length > 0) selectBusiness(data[0]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function selectBusiness(biz) {
    setSelectedBiz(biz);
    setSelectedAudit(null);
    setContent([]);

    if (biz.audits?.length > 0) {
      const latestAudit = biz.audits[0];
      await loadAudit(latestAudit.id);
    }
  }

  async function loadAudit(auditId) {
    setLoading(true);
    try {
      const res = await fetch(`/api/audits/${auditId}`);
      if (!res.ok) throw new Error('Failed to load audit');
      const data = await res.json();
      setSelectedAudit(data);
      setContent(data.content || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function approveItem(contentId) {
    setUpdating(contentId);
    try {
      const res = await fetch(`/api/approve-content/${contentId}`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to approve');
      setContent(prev => prev.map(c => c.id === contentId ? { ...c, status: 'approved' } : c));
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(null);
    }
  }

  async function rejectItem(contentId) {
    setUpdating(contentId);
    try {
      const res = await fetch(`/api/audits/content/${contentId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'needs_revision' }),
      });
      if (!res.ok) throw new Error('Failed to update');
      setContent(prev => prev.map(c => c.id === contentId ? { ...c, status: 'needs_revision' } : c));
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(null);
    }
  }

  async function approveAll() {
    if (!selectedAudit) return;
    setUpdating('all');
    try {
      const res = await fetch(`/api/approve-all/${selectedAudit.id}`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to approve all');
      setContent(prev => prev.map(c => ({ ...c, status: 'approved' })));
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(null);
    }
  }

  const draftCount = content.filter(c => c.status === 'draft').length;
  const approvedCount = content.filter(c => c.status === 'approved').length;

  // Email entry form
  if (showEmailForm && !submitted) {
    return (
      <div className="max-w-md mx-auto px-4 py-20">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Your Dashboard</h1>
          <p className="text-gray-600">Enter your email to view your content calendar and approvals.</p>
        </div>
        <form onSubmit={handleLookup} className="bg-white rounded-2xl shadow-lg border p-6 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500" required />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-brand-600 text-white py-2.5 rounded-xl font-semibold hover:bg-brand-700 transition disabled:opacity-50">
            {loading ? 'Loading...' : 'View Dashboard'}
          </button>
          <Link to="/subscribe" className="block text-center text-sm text-brand-600 hover:underline">
            Not subscribed yet? Start at $149/month →
          </Link>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Marketing Dashboard</h1>
          {email && <p className="text-gray-500 text-sm">{email}</p>}
        </div>
        <div className="flex items-center gap-3">
          <Link to="/audit/new" className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition">
            + New Audit
          </Link>
          <Link to="/subscribe" className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition">
            Subscribe $149/mo
          </Link>
          <button onClick={() => setShowEmailForm(true)} className="text-sm text-gray-500 hover:text-brand-600 transition">
            Switch Email
          </button>
        </div>
      </div>

      {/* Business selector */}
      {businesses.length > 0 && (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {businesses.map((biz) => (
            <button key={biz.id} onClick={() => selectBusiness(biz)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                selectedBiz?.id === biz.id ? 'bg-brand-600 text-white shadow' : 'bg-white border border-gray-200 text-gray-700 hover:border-brand-300'
              }`}>
              {biz.name}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {loading && (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500">Loading content...</p>
        </div>
      )}

      {!loading && !selectedBiz && (
        <div className="bg-gray-50 rounded-2xl border border-dashed border-gray-300 p-12 text-center">
          <div className="text-4xl mb-3">📊</div>
          <p className="text-gray-500 mb-4">Select a business to view their content calendar.</p>
          <Link to="/audit/new" className="text-brand-600 hover:underline font-medium">Start a free audit →</Link>
        </div>
      )}

      {!loading && selectedBiz && (
        <div className="space-y-6">
          {/* Audit history selector */}
          {selectedBiz.audits?.length > 1 && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Audit History</label>
              <div className="flex gap-2 flex-wrap">
                {selectedBiz.audits.map((audit) => (
                  <button key={audit.id} onClick={() => loadAudit(audit.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      selectedAudit?.id === audit.id ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}>
                    {new Date(audit.created_at).toLocaleDateString()} — {audit.status}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Weekly Strategy View Header */}
          {content.length > 0 && (
            <>
              {/* Stats bar */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                  <div className="text-2xl font-bold text-brand-600">{content.length}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">Total Items</div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">{draftCount}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">Awaiting Approval</div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">Approved</div>
                </div>
              </div>

              {/* Approve All Button */}
              {draftCount > 0 && (
                <button onClick={approveAll} disabled={updating === 'all'}
                  className="w-full bg-brand-600 text-white py-3 rounded-xl font-bold text-lg hover:bg-brand-700 transition disabled:opacity-50 shadow-lg">
                  {updating === 'all' ? 'Approving...' : `✅ Approve All (${draftCount} items)`}
                </button>
              )}

              {/* Weekly Calendar */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="bg-brand-600 text-white px-6 py-4 flex items-center justify-between">
                  <h2 className="font-bold text-lg">📅 Weekly Strategy View</h2>
                  <span className="text-sm text-brand-100">{content.length} items for review</span>
                </div>

                <div className="divide-y divide-gray-100">
                  {content.map((item) => {
                    const goal = inferGoal(item);
                    const isDraft = item.status === 'draft';
                    const isApproved = item.status === 'approved';
                    const isRevision = item.status === 'needs_revision';

                    return (
                      <div key={item.id} className={`px-6 py-4 border-l-4 ${typeColors[item.type] || 'border-l-gray-300'} ${isApproved ? 'bg-green-50/30' : ''} ${isRevision ? 'bg-yellow-50/30' : ''}`}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="text-xs font-medium text-gray-400 uppercase">{typeIcons[item.type]} {item.type.replace('_', ' ')}</span>
                              {/* Goal Badge */}
                              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${goal.color}`}>
                                {goal.badge} {goal.label}
                              </span>
                              {isApproved && <span className="text-[11px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">✅ Approved</span>}
                              {isRevision && <span className="text-[11px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">🔄 Needs Revision</span>}
                              {isDraft && <span className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">📝 Draft</span>}
                            </div>
                            <h3 className="font-semibold text-gray-800 text-sm">{item.title}</h3>
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2 whitespace-pre-wrap">{item.body}</p>
                          </div>

                          {/* Action buttons */}
                          <div className="flex gap-1.5 shrink-0">
                            {isDraft && (
                              <>
                                <button onClick={() => approveItem(item.id)} disabled={updating === item.id}
                                  className="px-3 py-1.5 bg-green-500 text-white text-xs font-medium rounded-lg hover:bg-green-600 transition disabled:opacity-50">
                                  {updating === item.id ? '...' : '✓ Approve'}
                                </button>
                                <button onClick={() => rejectItem(item.id)} disabled={updating === item.id}
                                  className="px-3 py-1.5 bg-yellow-500 text-white text-xs font-medium rounded-lg hover:bg-yellow-600 transition disabled:opacity-50">
                                  {updating === item.id ? '...' : '↻ Revise'}
                                </button>
                              </>
                            )}
                            {isApproved && (
                              <span className="text-green-600 text-xs font-medium px-2 py-1.5">Published ✓</span>
                            )}
                            {isRevision && (
                              <button onClick={() => approveItem(item.id)} disabled={updating === item.id}
                                className="px-3 py-1.5 bg-green-500 text-white text-xs font-medium rounded-lg hover:bg-green-600 transition disabled:opacity-50">
                                {updating === item.id ? '...' : '✓ Approve'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {!loading && content.length === 0 && (
            <div className="bg-gray-50 rounded-2xl border border-dashed border-gray-300 p-12 text-center">
              <div className="text-4xl mb-3">📅</div>
              <p className="text-gray-500 mb-4">No content generated yet for this business.</p>
              <Link to="/subscribe" className="text-brand-600 hover:underline font-medium">
                Subscribe to start weekly content →
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Change email */}
      <div className="text-center mt-8">
        <button onClick={() => setShowEmailForm(true)} className="text-sm text-gray-400 hover:text-brand-600 transition">
          Look up a different email
        </button>
      </div>
    </div>
  );
}