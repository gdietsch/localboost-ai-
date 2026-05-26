import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!submitted) {
    return (
      <div className="max-w-md mx-auto px-4 py-20">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Your Dashboard</h1>
          <p className="text-gray-600">Enter your email to view your audits and content.</p>
        </div>
        <form onSubmit={handleLookup} className="bg-white rounded-2xl shadow-lg border p-6 space-y-4">
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
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-600 text-white py-2.5 rounded-xl font-semibold hover:bg-brand-700 transition disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'View My Businesses'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Your Dashboard</h1>
          <p className="text-gray-500 text-sm">{email}</p>
        </div>
        <Link
          to="/audit/new"
          className="bg-brand-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-700 transition"
        >
          + New Audit
        </Link>
      </div>

      {businesses.length === 0 ? (
        <div className="bg-gray-50 rounded-2xl border border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500 mb-4">No businesses found for this email.</p>
          <Link to="/audit/new" className="text-brand-600 hover:underline font-medium">
            Start your first audit →
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {businesses.map((biz) => (
            <div key={biz.id} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold">{biz.name}</h2>
                  <p className="text-sm text-gray-500">{biz.website} · {biz.category}</p>
                </div>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  {biz.audit_count || 0} audit{biz.audit_count !== 1 ? 's' : ''}
                </span>
              </div>

              {biz.audits?.length > 0 && (
                <div className="space-y-2">
                  {biz.audits.map((audit) => (
                    <Link
                      key={audit.id}
                      to={`/audit/${audit.id}`}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition border border-gray-100"
                    >
                      <div>
                        <span className="text-sm font-medium text-gray-700">
                          Audit from {new Date(audit.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        audit.status === 'complete' ? 'bg-green-100 text-green-700' :
                        audit.status === 'generating' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {audit.status}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-10 text-center">
        <button
          onClick={() => setSubmitted(false)}
          className="text-sm text-gray-500 hover:text-brand-600 transition"
        >
          Look up a different email
        </button>
      </div>
    </div>
  );
}