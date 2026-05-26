import { Link } from 'react-router-dom';

const targets = [
  'Home Cleaners', 'Dentists', 'Med Spas', 'Gyms',
  'Landscapers', 'Barbers', 'Photographers', 'Restaurants',
];

const steps = [
  {
    number: '1',
    title: 'Connect',
    desc: 'Tell us about your business — name, website, and industry. We\'ll scan your entire online presence.',
  },
  {
    number: '2',
    title: 'Generate',
    desc: 'Our AI creates a full marketing plan with social posts, Google Business content, emails, and more.',
  },
  {
    number: '3',
    title: 'Grow',
    desc: 'Get weekly automated content, review management, lead follow-ups, and performance reports.',
  },
];

const features = [
  'Website & competitor audit',
  '12 social media post ideas/month',
  '4 Google Business posts/month',
  '2 email campaign drafts/month',
  '5 review reply templates',
  '30-day marketing plan',
  'Weekly performance reports',
  'Lead follow-up automation',
];

export default function LandingPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-3xl">
            <div className="inline-block bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              🚀 AI-Powered Marketing for Local Businesses
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              AI Marketing Employee for Local Service Businesses
            </h1>
            <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-2xl">
              Get a full-time marketing team powered by AI — audits, content, reviews, and lead follow-ups — for a fraction of agency pricing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/audit/new"
                className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-white text-brand-700 font-semibold text-lg hover:bg-gray-100 transition shadow-xl"
              >
                Start Your Free Audit
              </Link>
              <a
                href="#pricing"
                className="inline-flex items-center justify-center px-8 py-4 rounded-xl border-2 border-white/30 text-white font-semibold text-lg hover:bg-white/10 transition"
              >
                See Pricing
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Target Customers */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-4">Built for Local Service Businesses</h2>
          <p className="text-gray-600 text-center mb-10 max-w-2xl mx-auto">
            We specialize in helping local businesses attract more customers and grow their online presence.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {targets.map((t) => (
              <div key={t} className="bg-white rounded-xl px-6 py-4 text-center shadow-sm border border-gray-100 hover:border-brand-200 hover:shadow-md transition">
                <span className="font-medium text-gray-800">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-4">How It Works</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Three simple steps to transform your online marketing.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s) => (
              <div key={s.number} className="text-center">
                <div className="w-16 h-16 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {s.number}
                </div>
                <h3 className="text-xl font-semibold mb-2">{s.title}</h3>
                <p className="text-gray-600">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-4">Everything You Get</h2>
          <p className="text-gray-600 text-center mb-10 max-w-2xl mx-auto">
            A complete marketing solution that works while you focus on your business.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f) => (
              <div key={f} className="bg-white rounded-xl px-5 py-4 shadow-sm border border-gray-100 flex items-start gap-3">
                <span className="text-green-500 mt-0.5">✓</span>
                <span className="text-gray-700">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-4">Simple, Transparent Pricing</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            No hidden fees. No long-term contracts. Cancel anytime.
          </p>
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Audit */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 flex flex-col">
              <h3 className="text-xl font-semibold mb-2">One-Time Audit</h3>
              <p className="text-4xl font-bold text-brand-600 mb-1">$49</p>
              <p className="text-sm text-gray-500 mb-6">one-time payment</p>
              <ul className="space-y-3 mb-8 flex-1">
                <li className="flex items-start gap-2 text-sm">
                  <span className="text-green-500">✓</span> Website & competitor scan
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <span className="text-green-500">✓</span> 30-day marketing plan
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <span className="text-green-500">✓</span> 12 social media post ideas
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <span className="text-green-500">✓</span> Review reply templates
                </li>
              </ul>
              <Link
                to="/audit/new"
                className="w-full text-center bg-gray-100 text-gray-800 py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
              >
                Get Started
              </Link>
            </div>

            {/* Subscription */}
            <div className="bg-white rounded-2xl shadow-xl border-2 border-brand-500 p-8 flex flex-col relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-600 text-white px-4 py-0.5 rounded-full text-xs font-semibold">
                MOST POPULAR
              </div>
              <h3 className="text-xl font-semibold mb-2">Monthly Subscription</h3>
              <p className="text-4xl font-bold text-brand-600 mb-1">$149</p>
              <p className="text-sm text-gray-500 mb-6">per month</p>
              <ul className="space-y-3 mb-8 flex-1">
                <li className="flex items-start gap-2 text-sm">
                  <span className="text-green-500">✓</span> Everything in Audit
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <span className="text-green-500">✓</span> Weekly automated content
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <span className="text-green-500">✓</span> Review management & replies
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <span className="text-green-500">✓</span> Email campaigns (2/month)
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <span className="text-green-500">✓</span> Lead follow-up automation
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <span className="text-green-500">✓</span> Weekly performance reports
                </li>
              </ul>
              <Link
                to="/audit/new"
                className="w-full text-center bg-brand-600 text-white py-3 rounded-xl font-semibold hover:bg-brand-700 transition shadow-lg"
              >
                Start Free Audit
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-brand-600 to-indigo-800 text-white">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Grow Your Business?
          </h2>
          <p className="text-xl text-white/80 mb-8">
            Join hundreds of local businesses using LocalBoost AI to attract more customers.
          </p>
          <Link
            to="/audit/new"
            className="inline-block bg-white text-brand-700 px-10 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition shadow-xl"
          >
            Start Your Free Audit — $49
          </Link>
        </div>
      </section>
    </div>
  );
}