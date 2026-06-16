import { useState } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';

const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/28EfZh6yHgNRg3MaFd5ZC01';

const categories = [
  'Home Cleaners', 'Dentists', 'Med Spas', 'Gyms',
  'Landscapers', 'Barbers', 'Photographers', 'Restaurants',
  'Pet Services', 'Plastic Surgery', 'Beauty Salons', 'Nail Salons',
  'Real Estate Agents', 'Massage Therapy', 'Chiropractors', 'Veterinarians',
  'Other',
];

export default function StripeCheckout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const routeParams = useParams();
  const routeType = routeParams?.type || '';

  const paidParam = searchParams.get('paid');
  const isSuccessRoute = routeType === 'success';
  const businessIdParam = searchParams.get('business_id');

  const [step, setStep] = useState(
    paidParam === 'true' || isSuccessRoute ? 'success' : 'form'
  );
  const [form, setForm] = useState({
    name: '',
    website: '',
    category: '',
    email: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [auditId, setAuditId] = useState(null);
  const [error, setError] = useState('');

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function normalizeUrl(url) {
    if (!url) return url;
    url = url.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    return url;
  }

  // Create a free audit — no payment needed
  async function startFreeAudit(e) {
    e.preventDefault();
    setError('');

    if (!form.name || !form.website || !form.category || !form.email) {
      setError('Please fill in all fields.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/audits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, website: normalizeUrl(form.website) }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create audit');
      }

      const data = await res.json();
      navigate(`/audit/preview/${data.id}`, {
        state: {
          businessName: form.name,
          category: form.category,
        },
      });
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  // Create audit, then redirect to Stripe payment link
  async function handleBuy(e) {
    e.preventDefault();
    setError('');

    if (!form.name || !form.website || !form.category || !form.email) {
      setError('Please fill in all fields.');
      return;
    }

    setSubmitting(true);

    try {
      // Create the business + audit in our DB
      const res = await fetch('/api/audits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, website: normalizeUrl(form.website) }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create audit');
      }

      const data = await res.json();
      setAuditId(data.id);

      // Redirect to Stripe payment link
      window.location.href = STRIPE_PAYMENT_LINK;
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  // Success state after Stripe payment
  if (step === 'success') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="bg-green-50 border border-green-200 rounded-2xl p-10">
          <div className="text-5xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-green-800 mb-3">Payment Successful!</h1>
          <p className="text-green-600 mb-6">
            Your payment was confirmed. You can now view your full audit report.
          </p>
          {businessIdParam && (
            <button
              onClick={() => navigate(`/audit/${businessIdParam}`)}
              className="bg-brand-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-brand-700 transition"
            >
              View My Audit
            </button>
          )}
          <div className="mt-4">
            <button
              onClick={() => navigate('/')}
              className="text-brand-600 underline hover:text-brand-700"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isSubscription = routeType === 'subscription';
  const priceLabel = isSubscription ? '$149/month' : '$49 one-time';
  const buttonLabel = isSubscription ? 'Subscribe — $149/month' : 'Buy Audit — $49';

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-3">
          {isSubscription ? 'Subscribe to LocalBoost AI' : 'Buy Your Marketing Audit'}
        </h1>
        <p className="text-gray-600">
          {isSubscription
            ? 'Get weekly automated content, review management, lead follow-ups, and performance reports.'
            : 'Get a comprehensive marketing audit — including website scan, competitor analysis, a 30-day plan, and more.'}
        </p>
        <div className="inline-block mt-4 bg-brand-50 text-brand-700 px-6 py-2 rounded-full font-bold text-lg">
          {priceLabel}
        </div>
      </div>

      <form onSubmit={handleBuy} className="bg-white rounded-2xl shadow-lg border p-8 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
        )}

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
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Business Category</label>
          <select name="category" value={form.category} onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500" required>
            <option value="">Select a category</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500" required />
        </div>

        {!isSubscription && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm text-amber-800">
              <strong>🤫 Want to try it first?</strong>{' '}
              <button
                type="button"
                onClick={startFreeAudit}
                className="text-amber-700 underline hover:text-amber-900 font-medium"
              >
                Start a free audit instead
              </button>
              {' '}(no payment needed).
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-brand-600 text-white py-3.5 rounded-xl font-bold text-lg hover:bg-brand-700 transition disabled:opacity-50 shadow-lg"
        >
          {submitting ? 'Creating...' : `Pay ${priceLabel} →`}
        </button>

        <p className="text-xs text-gray-400 text-center">
          🔒 Secure payment via Stripe. You'll be redirected to Stripe's checkout page.
        </p>
      </form>
    </div>
  );
}