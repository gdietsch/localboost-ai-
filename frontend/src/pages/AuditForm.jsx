import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const categories = [
  'Home Cleaners', 'Pet Services (Pet Sitting, Dog Walking, Grooming)',
  'Dentists', 'Plastic Surgery', 'Med Spas', 'Beauty Salons',
  'Nail Salons', 'Gyms/Fitness', 'Landscapers', 'Barbers',
  'Photographers', 'Restaurants', 'Real Estate Agents',
  'Massage Therapy', 'Chiropractors', 'Veterinarians', 'Other',
];

const sources = ['Word of Mouth', 'Google Search', 'Social Media', 'Ads', 'Referrals', 'Other'];
const customerRanges = ['0-10', '10-30', '30-100', '100+'];

export default function AuditForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '', website: '', category: '', email: '',
    source: '', monthlyCustomers: '', avgValue: '',
    competitor1: '', competitor2: '', challenge: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.name || !form.website || !form.category || !form.email) {
      setError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/audits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name, website: form.website,
          category: form.category, email: form.email,
        }),
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
          answers: {
            source: form.source,
            monthlyCustomers: form.monthlyCustomers,
            avgValue: form.avgValue,
            competitors: [form.competitor1, form.competitor2].filter(Boolean).join(', '),
            challenge: form.challenge,
          },
        },
      });
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <div className="inline-block bg-brand-50 text-brand-700 px-4 py-1 rounded-full text-sm font-medium mb-4">🆓 Free Deep-Dive Analysis</div>
        <h1 className="text-3xl font-bold mb-3">Start Your Free Analysis</h1>
        <p className="text-gray-600">Answer a few questions and we'll analyze your business. Get a personalized score + revenue estimate for free.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg border p-8 space-y-6">
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}

        {/* Step progress */}
        <div className="flex gap-2 mb-6">
          <div className={`h-2 flex-1 rounded-full ${step >= 1 ? 'bg-brand-500' : 'bg-gray-200'}`} />
          <div className={`h-2 flex-1 rounded-full ${step >= 2 ? 'bg-brand-500' : 'bg-gray-200'}`} />
        </div>

        {step === 1 && (
          <>
            <h2 className="text-xl font-semibold">About Your Business</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Name *</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Sparkle Clean Co."
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website URL *</label>
              <input type="url" name="website" value={form.website} onChange={handleChange} placeholder="e.g. https://sparkleclean.com"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select name="category" value={form.category} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500" required>
                <option value="">Select a category</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500" required />
            </div>
            <button type="button" onClick={() => setStep(2)}
              className="w-full bg-brand-600 text-white py-3 rounded-xl font-semibold text-lg hover:bg-brand-700 transition">
              Continue → More Questions
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="text-xl font-semibold">Your Marketing & Revenue</h2>
            <p className="text-sm text-gray-500 -mt-3">These help us calculate your revenue opportunity.</p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">How do you get most of your customers?</label>
              <select name="source" value={form.source} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500">
                <option value="">Select...</option>
                {sources.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">How many customers per month?</label>
              <select name="monthlyCustomers" value={form.monthlyCustomers} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500">
                <option value="">Select...</option>
                {customerRanges.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Average customer value ($ per transaction)</label>
              <input type="number" name="avgValue" value={form.avgValue} onChange={handleChange} placeholder="e.g. 150"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Top competitor (website)</label>
              <input type="text" name="competitor1" value={form.competitor1} onChange={handleChange} placeholder="e.g. https://competitor.com"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Second competitor (optional)</label>
              <input type="text" name="competitor2" value={form.competitor2} onChange={handleChange} placeholder="e.g. https://competitor2.com"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">What's the #1 thing holding your business back?</label>
              <textarea name="challenge" value={form.challenge} onChange={handleChange} rows={3} placeholder="e.g. Not enough new customers, don't show up in Google..."
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(1)}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition">
                ← Back
              </button>
              <button type="submit" disabled={submitting}
                className="flex-[2] bg-brand-600 text-white py-3 rounded-xl font-semibold text-lg hover:bg-brand-700 transition disabled:opacity-50">
                {submitting ? 'Generating...' : 'Get My Free Analysis'}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}