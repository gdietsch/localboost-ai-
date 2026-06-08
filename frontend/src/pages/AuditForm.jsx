import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const categories = [
  'Home Cleaners',
  'Pet Services (Pet Sitting, Dog Walking, Grooming)',
  'Dentists',
  'Plastic Surgery',
  'Med Spas',
  'Beauty Salons',
  'Nail Salons',
  'Gyms/Fitness',
  'Landscapers',
  'Barbers',
  'Photographers',
  'Restaurants',
  'Real Estate Agents',
  'Massage Therapy',
  'Chiropractors',
  'Veterinarians',
  'Other',
];

export default function AuditForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    website: '',
    category: '',
    email: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
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
      // Navigate to free preview page
      navigate(`/audit/preview/${data.id}`, { state: { businessName: form.name, category: form.category } });
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <div className="inline-block bg-brand-50 text-brand-700 px-4 py-1 rounded-full text-sm font-medium mb-4">
          🆓 Free — No Credit Card Needed
        </div>
        <h1 className="text-3xl font-bold mb-3">Start Your Free Audit</h1>
        <p className="text-gray-600">
          Get a free preview of your marketing audit. See what our AI can do — then unlock the full 28-item report for $49.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg border p-8 space-y-6">
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
          <input type="url" name="website" value={form.website} onChange={handleChange} placeholder="e.g. https://sparkleclean.com"
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

        <button type="submit" disabled={submitting}
          className="w-full bg-brand-600 text-white py-3 rounded-xl font-semibold text-lg hover:bg-brand-700 transition disabled:opacity-50">
          {submitting ? 'Creating Preview...' : 'Get My Free Preview'}
        </button>

        <p className="text-xs text-gray-400 text-center">
          🔒 No credit card required. Get 4 sample items free. Unlock all 28 for $49.
        </p>
      </form>

      <div className="mt-10 text-center">
        <h3 className="font-semibold text-gray-700 mb-3">What you'll get in the full audit:</h3>
        <div className="grid grid-cols-2 gap-2 text-sm text-gray-500 max-w-sm mx-auto">
          <span>✓ Website & competitor scan</span>
          <span>✓ 30-day marketing plan</span>
          <span>✓ 12 social media posts</span>
          <span>✓ 4 Google Business posts</span>
          <span>✓ 2 email drafts</span>
          <span>✓ 5 review templates</span>
        </div>
      </div>
    </div>
  );
}