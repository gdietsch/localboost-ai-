import { useState } from 'react';
import { Link } from 'react-router-dom';

const typeLabels = {
  task: '📋 Action Items',
  social_post: '📸 Social Media Posts',
  google_post: '📍 Google Business Posts',
  email: '✉️ Email Campaigns',
  review_reply: '⭐ Review Reply Templates',
};

export default function MyAudit() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [audit, setAudit] = useState(null);
  const [error, setError] = useState('');

  async function handleLookup(e) {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/audits/my-audit?email=${encodeURIComponent(email)}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'No audit found for this email');
      }

      setAudit(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Form state
  if (!audit) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <div className="inline-block bg-brand-50 text-brand-700 px-4 py-1 rounded-full text-sm font-medium mb-4">🔍 Find Your Audit</div>
          <h1 className="text-3xl font-bold mb-3">My Audit</h1>
          <p className="text-gray-600">Enter the email you used when creating your audit to access your report.</p>
        </div>

        <form onSubmit={handleLookup} className="bg-white rounded-2xl shadow-lg border p-8 space-y-6">
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
            {loading ? 'Searching...' : '🔍 Find My Audit'}
          </button>

          <p className="text-xs text-gray-400 text-center">
            Haven't created one yet?{' '}
            <Link to="/audit/new" className="text-brand-600 hover:underline">Start a free audit</Link>
          </p>
        </form>
      </div>
    );
  }

  // Show audit
  const items = audit.content || [];
  const tasks = items.filter(i => i.type === 'task');

  const grouped = {};
  for (const item of items) {
    if (!grouped[item.type]) grouped[item.type] = [];
    grouped[item.type].push(item);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="bg-white rounded-2xl shadow-sm border p-8 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-brand-100 rounded-2xl flex items-center justify-center text-3xl">📊</div>
          <div>
            <h2 className="text-2xl font-bold">{audit.business_name}</h2>
            <p className="text-gray-500">{audit.category} · {audit.website}</p>
            <Link to="/dashboard" className="text-sm text-brand-600 hover:underline">View in Dashboard →</Link>
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
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center">
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