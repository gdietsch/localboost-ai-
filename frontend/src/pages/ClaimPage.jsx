import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

function getGrade(score) {
  if (score >= 90) return { letter: 'A', color: 'bg-green-500', textColor: 'text-green-700', bgColor: 'bg-green-100' };
  if (score >= 80) return { letter: 'B', color: 'bg-blue-500', textColor: 'text-blue-700', bgColor: 'bg-blue-100' };
  if (score >= 70) return { letter: 'C', color: 'bg-yellow-500', textColor: 'text-yellow-700', bgColor: 'bg-yellow-100' };
  if (score >= 60) return { letter: 'D', color: 'bg-orange-500', textColor: 'text-orange-700', bgColor: 'bg-orange-100' };
  return { letter: 'F', color: 'bg-red-500', textColor: 'text-red-700', bgColor: 'bg-red-100' };
}

const typeLabels = {
  task: '📋 Action Items',
  social_post: '📸 Social Media Posts',
  google_post: '📍 Google Business Posts',
  email: '✉️ Email Campaigns',
  review_reply: '⭐ Review Reply Templates',
};

export default function ClaimPage() {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [loading, setLoading] = useState(false);
  const [audit, setAudit] = useState(null);
  const [error, setError] = useState('');
  const [emailed, setEmailed] = useState(false);
  const [claimed, setClaimed] = useState(false);

  async function handleClaim(e) {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/audits/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'No audit found for this email');
      }

      setAudit(data.audit);
      setEmailed(data.emailed);
      setClaimed(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Form state — show the email form
  if (!claimed) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold mb-3">Claim Your Marketing Audit</h1>
          <p className="text-gray-600">
            You've paid for your audit! Enter the email you used during checkout to claim your report.
            We'll send the full audit to your inbox.
          </p>
        </div>

        <form onSubmit={handleClaim} className="bg-white rounded-2xl shadow-lg border p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-600 text-white py-3.5 rounded-xl font-bold text-lg hover:bg-brand-700 transition disabled:opacity-50 shadow-lg"
          >
            {loading ? 'Finding your audit...' : '🔓 Claim My Audit'}
          </button>

          <p className="text-xs text-gray-400 text-center">
            Don't have an audit yet?{' '}
            <Link to="/audit/new" className="text-brand-600 hover:underline">Start a free audit first</Link>
          </p>
        </form>
      </div>
    );
  }

  // Claimed state — show the audit
  const items = audit?.content || [];
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Success banner */}
      <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-8 text-center">
        <div className="text-4xl mb-3">🎉</div>
        <h1 className="text-2xl font-bold text-green-800 mb-2">Your Audit is Ready!</h1>
        {emailed && (
          <p className="text-green-600">
            We've sent the full report to <strong>{audit.email}</strong>. Check your inbox!
          </p>
        )}
        <p className="text-green-500 text-sm mt-2">
          {!emailed && 'Email delivery is not configured — view your report below.'}
        </p>
      </div>

      {/* Audit content */}
      <div className="bg-white rounded-2xl shadow-sm border p-8 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-brand-100 rounded-2xl flex items-center justify-center text-3xl">📊</div>
          <div>
            <h2 className="text-2xl font-bold">{audit.business_name}</h2>
            <p className="text-gray-500">{audit.category} · {audit.website}</p>
          </div>
        </div>

        {/* 30-Day Action Plan */}
        {tasks.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-bold mb-4">📋 30-Day Action Plan</h3>
            <div className="space-y-3">
              {tasks.map((item) => (
                <div key={item.id} className="border-l-4 border-brand-400 pl-4 py-2">
                  <h4 className="font-semibold text-gray-800">{item.title}</h4>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{item.body}</p>
                  <div className="mt-2">
                    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${
                      item.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>{item.status === 'approved' ? '✅ Approved' : '📝 Draft'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content by type */}
        {Object.entries(grouped).map(([type, typeItems]) => {
          if (type === 'task') return null;
          return (
            <div key={type} className="mb-8">
              <h3 className="text-lg font-bold mb-4">{typeLabels[type] || type} ({typeItems.length})</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {typeItems.map((item) => (
                  <div key={item.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <h4 className="font-semibold text-gray-800 text-sm mb-1">{item.title}</h4>
                    <p className="text-xs text-gray-600 whitespace-pre-wrap line-clamp-4">{item.body}</p>
                    <div className="mt-2">
                      <span className={`inline-block text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                        item.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                      }`}>{item.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center py-6">
        <Link
          to={`/audit/${audit.id}`}
          className="inline-block bg-brand-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-brand-700 transition shadow-lg"
        >
          View Full Report →
        </Link>
      </div>
    </div>
  );
}