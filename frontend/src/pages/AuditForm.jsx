import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const categories = [
  'Home Cleaners',
  'Dentists',
  'Med Spas',
  'Gyms',
  'Landscapers',
  'Barbers',
  'Photographers',
  'Restaurants',
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
      navigate(`/audit/${data.id}`);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-3">Start Your Free Audit</h1>
        <p className="text-gray-600">
          Get a comprehensive marketing audit for your business — including a 30-day plan, content ideas, and more.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg border p-8 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. Sparkle Clean Co."
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
          <input
            type="url"
            name="website"
            value={form.website}
            onChange={handleChange}
            placeholder="e.g. https://sparkleclean.com"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Business Category</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            required
          >
            <option value="">Select a category</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            required
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-brand-600 text-white py-3 rounded-xl font-semibold text-lg hover:bg-brand-700 transition disabled:opacity-50"
        >
          {submitting ? 'Generating Your Audit...' : 'Generate My Audit — $49'}
        </button>

        <p className="text-xs text-gray-400 text-center">
          One-time payment of $49. No subscription required. Your audit will be ready in minutes.
        </p>
      </form>
    </div>
  );
}