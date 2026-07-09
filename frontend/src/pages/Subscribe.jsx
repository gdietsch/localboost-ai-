import { useState } from 'react';
import { Link } from 'react-router-dom';

const categories = [
  'Home Cleaners', 'Pet Services', 'Dentists', 'Plastic Surgery',
  'Med Spas', 'Beauty Salons', 'Nail Salons', 'Gyms/Fitness',
  'Landscapers', 'Barbers', 'Photographers', 'Restaurants',
  'Real Estate Agents', 'Massage Therapy', 'Chiropractors', 'Veterinarians', 'Other',
];

const features = [
  { icon: '📅', label: '8 Social Posts / Week', desc: 'Facebook & Instagram content generated for your business' },
  { icon: '📍', label: '4 Google Posts / Week', desc: 'Fresh GBP content keeps your local SEO ranking high' },
  { icon: '⭐', label: 'Auto Review Replies', desc: 'Professional responses to every review, any star rating' },
  { icon: '✉️', label: 'Weekly Newsletter', desc: 'One email campaign sent to your customer list' },
  { icon: '📊', label: 'Monthly SEO Report', desc: 'Page speed, broken links, keyword rankings' },
  { icon: '📱', label: 'Client Dashboard', desc: 'Approve/reject content, view analytics, one-click publish' },
];

export default function Subscribe() {
  const [step, setStep] = useState('form');
  const [form, setForm] = useState({ name: '', website: '', email: '', category: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function normalizeUrl(url) {
    if (!url) return url;
    url = url.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) url = 'https://' + url;
    return url;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.name || !form.website || !form.email || !form.category) {
      setError('Please fill in all fields.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, website: normalizeUrl(form.website) }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Subscription failed');

      setResult(data);
      setStep('success');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  // Success state
  if (step === 'success') {
    return (
      <div className="max-w-xl mx-auto px-4 py-16">
        <div className="bg-green-50 border border-green-200 rounded-2xl p-10 text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-green-800 mb-3">You're Subscribed!</h1>
          <p className="text-green-600 mb-4">
            Welcome to LocalBoost AI. We'll send an invoice to <strong>{form.email}</strong> for $149.
            Once paid, your first week of content will be generated automatically.
          </p>
          {result?.invoiceUrl && (
            <a
              href={result.invoiceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-brand-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-700 transition shadow-lg mb-4"
            >
              Pay Invoice Now →
            </a>
          )}
          <div className="mt-4">
            <Link to="/dashboard" className="text-brand-600 hover:underline font-medium">
              Go to Dashboard →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-block bg-brand-50 text-brand-700 px-4 py-1 rounded-full text-sm font-medium mb-4">
          🚀 AI Marketing Employee
        </div>
        <h1 className="text-4xl font-bold mb-3">$149/month — Start Today</h1>
        <p className="text-gray-600 max-w-lg mx-auto">
          Get a full-time AI marketing employee for your local service business.
          Zero effort. Zero dashboard logging. Everything on autopilot.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 gap-4 mb-10">
        {features.map((f) => (
          <div key={f.label} className="bg-white rounded-xl border border-gray-200 p-5 flex items-start gap-4">
            <span className="text-2xl shrink-0">{f.icon}</span>
            <div>
              <h3 className="font-semibold text-gray-800">{f.label}</h3>
              <p className="text-sm text-gray-500">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl shadow-lg border p-8">
        <h2 className="text-xl font-bold mb-6">Get Started</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Sparkle Clean Co."
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
              <input type="text" name="website" value={form.website} onChange={handleChange} placeholder="e.g. sparkleclean.com"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500" required />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select name="category" value={form.category} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500" required>
                <option value="">Select...</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="bg-brand-50 rounded-xl p-4 border border-brand-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-brand-800">LocalBoost AI — Monthly</p>
                <p className="text-sm text-brand-600">First week of content free. Cancel anytime.</p>
              </div>
              <span className="text-2xl font-bold text-brand-700">$149</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-brand-600 text-white py-3.5 rounded-xl font-bold text-lg hover:bg-brand-700 transition disabled:opacity-50 shadow-lg"
          >
            {submitting ? 'Processing...' : 'Subscribe — $149/month'}
          </button>

          <p className="text-xs text-gray-400 text-center">
            🔒 We'll invoice you via Stripe. No card required upfront. Cancel anytime.
          </p>
        </form>
      </div>
    </div>
  );
}