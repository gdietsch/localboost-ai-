import { useState } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';

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

  // Detect success state — either from URL params or from the route path
  const paidParam = searchParams.get('paid');
  const isSuccessRoute = routeType === 'success';
  const businessIdParam = searchParams.get('business_id');
  const typeParam = searchParams.get('type') || 'audit';

  const [step, setStep] = useState(
    paidParam === 'true' || isSuccessRoute ? 'success' : 'form'
  );
  const [form, setForm] = useState({
    name: '',
    website: '',
    category: '',
    email: '',
  });
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleBuy(e) {
    e.preventDefault();
    setError('');

    if (!form.name || !form.website || !form.category || !form.email) {
      setError('Please fill in all fields.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, type: typeParam }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create checkout');
      }

      const data = await res.json();
      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

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
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create audit');
      }

      const data = await res.json();
      navigate(`/audit/${data.id}`);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  // Auto-generate audit content after successful payment
  async function generateAudit() {
    if (generating || generated || !businessIdParam || typeParam === 'subscription') return;
    setGenerating(true);

    try {
      // First create the audit via the audits endpoint
      const res = await fetch(`/api/audits/${businessIdParam}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        console.warn('Audit auto-generation returned non-OK:', await res.text());
      } else {
        const data = await res.json();
        console.log('Audit generated:', data);
      }
      setGenerated(true);
    } catch (err) {
      console.warn('Could not auto-generate audit content:', err.message);
      // Don't block the user — they can still view the audit
      setGenerated(true);
    }
  }

  // Success state after Stripe payment
  if (step === 'success') {
    // Trigger auto-generation once when success page mounts
    if (!generating && !generated && businessIdParam && typeParam !== 'subscription') {
      generateAudit();
    }

    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="bg-green-50 border border-green-200 rounded-2xl p-10">
          <div className="text-5xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-green-800 mb-3">Payment Successful!</h1>
          <p className="text-green-600 mb-6">
            {typeParam === 'subscription'
              ? 'Your subscription is active! Your marketing content will be generated shortly.'
              : generating
                ? 'Your audit is being generated... This should only take a moment.'
                : generated
                  ? 'Your audit has been generated and is ready to view!'
                  : 'Your payment was confirmed. Redirecting...'}
          </p>
          {generating && (
            <div className="flex justify-center mb-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
            </div>
          )}
          {(generated || typeParam === 'subscription') && (
            <button
              onClick={() => {
                if (typeParam === 'subscription') {
                  navigate(`/dashboard?email=${encodeURIComponent(searchParams.get('business_id') || '')}`);
                } else {
                  navigate(`/audit/${businessIdParam}`);
                }
              }}
              className="bg-brand-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-brand-700 transition"
            >
              {typeParam === 'subscription' ? 'Go to Dashboard' : 'View My Audit'}
            </button>
          )}
        </div>
      </div>
    );
  }

  const isSubscription = typeParam === 'subscription';
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

      <form onSubmit={isSubscription ? handleBuy : startFreeAudit} className="bg-white rounded-2xl shadow-lg border p-8 space-y-6">
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
          <input type="text" name="website" value={form.website} onChange={handleChange} placeholder="e.g. sparkleclean.com or https://sparkleclean.com"
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
          {submitting ? 'Processing...' : buttonLabel}
        </button>

        <p className="text-xs text-gray-400 text-center">
          🔒 Secure payment via Stripe. Your information is encrypted.
        </p>
      </form>
    </div>
  );
}
