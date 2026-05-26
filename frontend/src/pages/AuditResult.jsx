import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function AuditResult() {
  const { id } = useParams();
  const [audit, setAudit] = useState(null);
  const [busy, setBusy] = useState(null);
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
          if (data.status === 'pending' || data.status === 'generating') {
            // Poll until complete
            setTimeout(fetchAudit, 2000);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      }
    }

    fetchAudit();
    return () => { cancelled = true; };
  }, [id]);

  // Generate mock content for display (in production, AI generates this)
  useEffect(() => {
    if (audit && audit.status === 'pending') {
      // Instead of waiting, auto-generate content after a brief delay
      const timer = setTimeout(async () => {
        try {
          await fetch(`/api/audits/${id}/generate`, { method: 'POST' });
        } catch (e) {
          // ignore
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [audit, id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-96 mx-auto"></div>
        </div>
        <p className="text-gray-500 mt-6">Loading your audit...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-2">Oops!</h2>
          <p>{error}</p>
          <Link to="/audit/new" className="text-brand-600 hover:underline mt-4 inline-block">
            Try again
          </Link>
        </div>
      </div>
    );
  }

  if (!audit || audit.status !== 'complete') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto"></div>
        </div>
        <h2 className="text-2xl font-bold mb-2">Generating Your Audit</h2>
        <p className="text-gray-500">Our AI is analyzing your business and creating your marketing plan...</p>
        <p className="text-sm text-gray-400 mt-4">This usually takes about 30 seconds.</p>
      </div>
    );
  }

  const planItems = audit.content?.filter(c => c.type === 'task') || [];
  const socialPosts = audit.content?.filter(c => c.type === 'social_post') || [];
  const googlePosts = audit.content?.filter(c => c.type === 'google_post') || [];
  const emails = audit.content?.filter(c => c.type === 'email') || [];
  const reviews = audit.content?.filter(c => c.type === 'review_reply') || [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8">
        <Link to="/dashboard" className="text-brand-600 hover:underline text-sm">&larr; Back to Dashboard</Link>
        <h1 className="text-3xl font-bold mt-2">Your Marketing Audit</h1>
        <p className="text-gray-500">for <strong>{audit.business_name}</strong></p>
      </div>

      {/* 30-Day Marketing Plan */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">30-Day Marketing Plan</h2>
        <div className="grid gap-3">
          {planItems.map((item) => (
            <ContentCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      {/* Social Media Posts */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Social Media Post Ideas</h2>
        <div className="grid gap-3">
          {socialPosts.map((item) => (
            <ContentCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      {/* Google Business Posts */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Google Business Posts</h2>
        <div className="grid gap-3">
          {googlePosts.map((item) => (
            <ContentCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      {/* Emails */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Email Campaign Drafts</h2>
        <div className="grid gap-3">
          {emails.map((item) => (
            <ContentCard key={item.id} item={item} isEmail />
          ))}
        </div>
      </section>

      {/* Review Replies */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Review Reply Templates</h2>
        <div className="grid gap-3">
          {reviews.map((item) => (
            <ContentCard key={item.id} item={item} />
          ))}
        </div>
      </section>
    </div>
  );
}

function ContentCard({ item, isEmail }) {
  const [status, setStatus] = useState(item.status);

  async function updateStatus(newStatus) {
    try {
      const res = await fetch(`/api/audits/content/${item.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) setStatus(newStatus);
    } catch (e) {
      // ignore
    }
  }

  return (
    <div className={`bg-white rounded-xl border p-5 ${status === 'approved' ? 'border-green-300 ring-1 ring-green-200' : 'border-gray-200'}`}>
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-gray-800">{item.title}</h3>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
          status === 'approved' ? 'bg-green-100 text-green-700' :
          status === 'needs_revision' ? 'bg-yellow-100 text-yellow-700' :
          'bg-gray-100 text-gray-600'
        }`}>
          {status === 'needs_revision' ? 'Needs Revision' : status === 'approved' ? 'Approved' : 'Draft'}
        </span>
      </div>
      <div className={`text-gray-600 text-sm whitespace-pre-wrap ${isEmail ? 'bg-gray-50 rounded-lg p-4 border' : ''}`}>
        {item.body}
      </div>
      <div className="flex gap-2 mt-3">
        <button
          onClick={() => updateStatus('approved')}
          className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
            status === 'approved'
              ? 'bg-green-100 text-green-700 cursor-default'
              : 'bg-gray-100 text-gray-700 hover:bg-green-100 hover:text-green-700'
          }`}
        >
          👍 Approve
        </button>
        <button
          onClick={() => updateStatus('needs_revision')}
          className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
            status === 'needs_revision'
              ? 'bg-yellow-100 text-yellow-700 cursor-default'
              : 'bg-gray-100 text-gray-700 hover:bg-yellow-100 hover:text-yellow-700'
          }`}
        >
          🔄 Needs Revision
        </button>
        <button
          onClick={() => { navigator.clipboard.writeText(item.body); }}
          className="text-xs px-3 py-1.5 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
        >
          📋 Copy
        </button>
      </div>
    </div>
  );
}