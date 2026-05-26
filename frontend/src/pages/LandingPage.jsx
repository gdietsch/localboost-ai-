import { Link } from 'react-router-dom';

const targets = [
  'Home Cleaners', 'Dentists', 'Med Spas', 'Gyms',
  'Landscapers', 'Barbers', 'Photographers', 'Restaurants',
];

const steps = [
  {
    number: '1',
    title: 'Connect',
    desc: 'Tell us about your business — name, website, and industry. We\'ll scan your entire online presence in seconds.',
    icon: '🔗',
  },
  {
    number: '2',
    title: 'Generate',
    desc: 'Our AI creates a full marketing plan with social posts, Google Business content, emails, and review templates.',
    icon: '⚡',
  },
  {
    number: '3',
    title: 'Grow',
    desc: 'Get weekly automated content, review management, lead follow-ups, and performance reports delivered to your inbox.',
    icon: '📈',
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

const testimonials = [
  {
    name: 'Sarah Johnson',
    business: 'Sparkle Clean Homes, Austin TX',
    quote: 'We went from 2 bookings a week to 14 after the first month. The automated content is a game-changer for our small team.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=face',
  },
  {
    name: 'Mike Torres',
    business: 'Torres Landscaping, Phoenix AZ',
    quote: 'I was spending 10 hours a week on marketing. Now the AI does it all and I just approve. Best $149 I spend every month.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
  },
  {
    name: 'Dr. Emily Chen',
    business: 'Bright Smile Dental, Portland OR',
    quote: 'The audit found 7 issues with my Google Business profile I didn\'t know about. Fixed them and calls went up 40%. Incredible.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
  },
];

const stats = [
  { number: '500+', label: 'Businesses Audited' },
  { number: '98%', label: 'Satisfaction Rate' },
  { number: '3.2x', label: 'Average Lead Growth' },
];

const trustBadges = [
  { label: '256-bit SSL Encrypted', icon: '🔒' },
  { label: 'Google Partner Ready', icon: '⭐' },
  { label: '30-Day Money Back', icon: '🛡️' },
];

export default function LandingPage() {
  return (
    <div>
      {/* ===== HERO SECTION ===== */}
      <section className="relative overflow-hidden bg-gray-900 text-white min-h-[85vh] flex items-center">
        {/* Background image with overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1600&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/95 via-gray-900/80 to-gray-900/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 via-transparent to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 w-full">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-medium mb-6 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              🚀 AI-Powered Marketing for Local Businesses
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold leading-tight mb-6 tracking-tight">
              AI Marketing Employee for{' '}
              <span className="bg-gradient-to-r from-brand-300 to-brand-100 bg-clip-text text-transparent">
                Local Service Businesses
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl leading-relaxed">
              Get a full-time marketing team powered by AI — audits, content, reviews, and lead follow-ups — for a fraction of agency pricing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/audit/new"
                className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-brand-500 text-white font-semibold text-lg hover:bg-brand-400 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
              >
                Start Your Free Audit
                <span className="ml-2 text-brand-200">→</span>
              </Link>
              <a
                href="#pricing"
                className="inline-flex items-center justify-center px-8 py-4 rounded-xl border-2 border-white/20 text-white font-semibold text-lg hover:bg-white/10 transition-all hover:-translate-y-0.5"
              >
                See Pricing
              </a>
            </div>

            {/* Social proof mini-bar */}
            <div className="mt-12 flex flex-wrap items-center gap-6 text-sm text-gray-400">
              <div className="flex -space-x-2">
                {['https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop&crop=face',
                  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=40&h=40&fit=crop&crop=face',
                ].map((url, i) => (
                  <img key={i} src={url} alt="" className="w-8 h-8 rounded-full border-2 border-gray-800" />
                ))}
              </div>
              <span><strong className="text-white">500+</strong> business owners trust LocalBoost</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TARGET CUSTOMERS ===== */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-brand-600 font-semibold text-sm tracking-wider uppercase">Industries We Serve</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2">Built for Local Service Businesses</h2>
            <p className="text-gray-500 mt-3 max-w-2xl mx-auto">
              We specialize in helping local businesses attract more customers and grow their online presence.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {targets.map((t) => (
              <div
                key={t}
                className="group bg-gray-50 rounded-xl px-6 py-5 text-center border border-gray-100 hover:border-brand-200 hover:bg-brand-50 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-default"
              >
                <span className="font-semibold text-gray-800 group-hover:text-brand-700 transition-colors">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-brand-600 font-semibold text-sm tracking-wider uppercase">Simple Process</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2">How It Works</h2>
            <p className="text-gray-500 mt-3 max-w-2xl mx-auto">
              Three simple steps to transform your online marketing.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((s, i) => (
              <div key={s.number} className="relative text-center group">
                <div className="w-20 h-20 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center text-3xl mx-auto mb-6 group-hover:bg-brand-200 group-hover:scale-110 transition-all duration-200 shadow-sm">
                  {s.icon}
                </div>
                <div className="absolute top-8 left-[calc(50%+3rem)] hidden md:block" style={{ width: 'calc(100% - 5rem)' }}>
                  {i < 2 && <div className="h-px bg-gradient-to-r from-brand-200 to-transparent" />}
                </div>
                <h3 className="text-xl font-bold mb-3">{s.title}</h3>
                <p className="text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-brand-600 font-semibold text-sm tracking-wider uppercase">Full Suite</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2">Everything You Get</h2>
            <p className="text-gray-500 mt-3 max-w-2xl mx-auto">
              A complete marketing solution that works while you focus on your business.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f) => (
              <div
                key={f}
                className="group bg-white rounded-xl px-5 py-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-brand-200 hover:-translate-y-0.5 transition-all duration-200 flex items-start gap-3"
              >
                <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold mt-0.5 group-hover:bg-green-200 transition-colors">✓</span>
                <span className="text-gray-700 font-medium">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TRUST STATS BAR ===== */}
      <section className="py-16 bg-gradient-to-r from-brand-600 to-brand-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {stats.map((s) => (
              <div key={s.label} className="py-6">
                <div className="text-5xl md:text-6xl font-bold mb-2 text-white">{s.number}</div>
                <div className="text-brand-200 text-lg font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-brand-600 font-semibold text-sm tracking-wider uppercase">Testimonials</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2">Trusted by Local Business Owners</h2>
            <p className="text-gray-500 mt-3 max-w-2xl mx-auto">
              See what our customers are saying about LocalBoost AI.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col"
              >
                <div className="flex mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <span key={i} className="text-yellow-400 text-lg">★</span>
                  ))}
                </div>
                <p className="text-gray-600 leading-relaxed mb-6 flex-1">"{t.quote}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-12 h-12 rounded-full object-cover"
                    loading="lazy"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">{t.name}</div>
                    <div className="text-sm text-gray-500">{t.business}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-brand-600 font-semibold text-sm tracking-wider uppercase">Pricing</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2">Simple, Transparent Pricing</h2>
            <p className="text-gray-500 mt-3 max-w-2xl mx-auto">
              No hidden fees. No long-term contracts. Cancel anytime.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Audit */}
            <div className="group bg-white rounded-2xl shadow-lg border border-gray-200 p-8 flex flex-col hover:shadow-2xl hover:-translate-y-1 transition-all duration-200">
              <h3 className="text-xl font-bold mb-2">One-Time Audit</h3>
              <p className="text-sm text-gray-500 mb-2">Perfect for getting started</p>
              <p className="text-5xl font-bold text-brand-600 mb-1">$49</p>
              <p className="text-sm text-gray-400 mb-8">one-time payment · no subscription</p>
              <ul className="space-y-4 mb-8 flex-1">
                {['Website & competitor scan', '30-day marketing plan', '12 social media post ideas', 'Review reply templates'].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm">
                    <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">✓</span>
                    <span className="text-gray-600">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/audit/new"
                className="w-full text-center bg-gray-100 text-gray-800 py-3.5 rounded-xl font-semibold hover:bg-gray-200 hover:-translate-y-0.5 transition-all"
              >
                Get Started
              </Link>
            </div>

            {/* Subscription */}
            <div className="group bg-white rounded-2xl shadow-xl border-2 border-brand-500 p-8 flex flex-col relative hover:shadow-2xl hover:-translate-y-1 transition-all duration-200">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-brand-600 text-white px-5 py-1 rounded-full text-xs font-bold tracking-wider shadow-lg">
                MOST POPULAR
              </div>
              <h3 className="text-xl font-bold mb-2">Monthly Subscription</h3>
              <p className="text-sm text-gray-500 mb-2">Full marketing automation</p>
              <p className="text-5xl font-bold text-brand-600 mb-1">$149</p>
              <p className="text-sm text-gray-400 mb-8">per month · cancel anytime</p>
              <ul className="space-y-4 mb-8 flex-1">
                {[
                  'Everything in Audit, plus...',
                  'Weekly automated content',
                  'Review management & replies',
                  'Email campaigns (2/month)',
                  'Lead follow-up automation',
                  'Weekly performance reports',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm">
                    <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">✓</span>
                    <span className="text-gray-600">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/audit/new"
                className="w-full text-center bg-brand-600 text-white py-3.5 rounded-xl font-semibold hover:bg-brand-700 hover:-translate-y-0.5 transition-all shadow-lg"
              >
                Start Free Audit
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CASE STUDY ===== */}
      <section className="py-20 bg-gray-900 text-white relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1600&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900/95 to-brand-900/80" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-brand-400 font-semibold text-sm tracking-wider uppercase">Case Study</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2">Real Results for Real Businesses</h2>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
            <div className="grid md:grid-cols-2">
              {/* Before */}
              <div className="p-8 md:p-10 border-b md:border-b-0 md:border-r border-white/10">
                <div className="inline-block bg-red-500/20 text-red-300 px-3 py-1 rounded-full text-xs font-semibold mb-4">BEFORE</div>
                <h3 className="text-2xl font-bold mb-4">Sparkle Clean Homes</h3>
                <ul className="space-y-3">
                  {[
                    '2-3 bookings per week',
                    'No social media presence',
                    'Outdated Google Business profile',
                    'Spending $2,000/mo on ads with poor ROI',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-gray-300">
                      <span className="text-red-400 mt-0.5">✕</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              {/* After */}
              <div className="p-8 md:p-10 bg-gradient-to-br from-green-900/20 to-brand-900/20">
                <div className="inline-block bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-xs font-semibold mb-4">AFTER (30 DAYS)</div>
                <h3 className="text-2xl font-bold mb-4 text-green-300">14+ bookings/week</h3>
                <ul className="space-y-3">
                  {[
                    '14+ bookings per week (7x growth)',
                    'Active on Instagram & Facebook',
                    'Fully optimized Google profile',
                    'Organic leads up 300%',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-gray-200">
                      <span className="text-green-400 mt-0.5 font-bold">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="px-8 md:px-10 py-5 border-t border-white/10 bg-white/5">
              <p className="text-sm text-gray-400 text-center">
                "LocalBoost AI replaced our agency. Same results, 90% less cost." — Sarah Johnson, Owner
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="py-24 bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-brand-300 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto text-center px-4">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Ready to Grow Your Business?
          </h2>
          <p className="text-xl text-brand-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join 500+ local businesses using LocalBoost AI to attract more customers and grow their revenue.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/audit/new"
              className="inline-flex items-center justify-center bg-white text-brand-700 px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 hover:-translate-y-0.5 transition-all shadow-2xl"
            >
              Start Your Free Audit — $49
              <span className="ml-2">→</span>
            </Link>
            <a
              href="#pricing"
              className="inline-flex items-center justify-center border-2 border-white/30 text-white px-10 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 hover:-translate-y-0.5 transition-all"
            >
              Compare Plans
            </a>
          </div>
          <p className="text-sm text-brand-200 mt-6">
            🔒 No credit card required · 30-day money-back guarantee
          </p>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-gray-900 text-gray-400 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-8 mb-10">
            {trustBadges.map((badge) => (
              <div key={badge.label} className="flex items-center gap-2 text-sm">
                <span className="text-lg">{badge.icon}</span>
                <span>{badge.label}</span>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-10 text-center md:text-left">
            <div>
              <div className="flex items-center gap-2 mb-3 justify-center md:justify-start">
                <span className="text-xl font-bold text-white">LocalBoost</span>
                <span className="text-xs bg-brand-600 text-white px-2 py-0.5 rounded-full font-medium">AI</span>
              </div>
              <p className="text-sm leading-relaxed">
                AI-powered marketing automation for local service businesses. We help you attract, engage, and retain customers.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#pricing" className="hover:text-white transition">Pricing</a></li>
                <li><Link to="/audit/new" className="hover:text-white transition">Free Audit</Link></li>
                <li><Link to="/dashboard" className="hover:text-white transition">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Industries</h4>
              <ul className="space-y-2 text-sm">
                {targets.slice(0, 4).map((t) => (
                  <li key={t} className="hover:text-white transition cursor-default">{t}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} LocalBoost AI. All rights reserved. AI-powered marketing for local service businesses.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}