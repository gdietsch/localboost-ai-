import { Link } from 'react-router-dom';
import { targets } from '../content/landingContent.js';

export default function LandingPage() {
  function scrollToPricing(e) {
    e.preventDefault();
    const el = document.getElementById('pricing');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }

  // Real data from a live audit run
  const sampleAudit = {
    grade: 'D',
    overall: 66,
    scores: { websiteHealth: 80, googleBusiness: 84, competitorPosition: 45, revenueOpportunity: 20 },
    findings: [
      { issue: 'Mobile PageSpeed 38/100', severity: 'high', impact: '53% of visitors leave slow mobile sites' },
      { issue: 'Meta description too long', severity: 'medium', impact: 'Google truncates in search results' },
      { issue: 'H1 missing keywords', severity: 'high', impact: 'Hard to rank in top 3' },
      { issue: 'No XML sitemap', severity: 'high', impact: 'Pages not indexed by Google' },
    ],
    revenueEstimate: { monthlyLoss: 1840, annualLoss: 22080, topFix: 'Fix PageSpeed to recover ~$600/mo' },
  };

  return (
    <div>
      {/* ===== HERO SECTION ===== */}
      <section className="relative overflow-hidden bg-gray-900 text-white min-h-screen flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900 to-brand-950" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 25% 50%, #fff 0.5px, transparent 0.5px)', backgroundSize: '40px 40px' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Copy */}
            <div>
              <div className="inline-flex items-center gap-2 bg-red-500/10 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-medium mb-6 border border-red-500/20">
                <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                Real Data — Not Template Fluff
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 tracking-tight">
                Your Website Is Leaking{' '}
                <span className="text-red-400">${sampleAudit.revenueEstimate.monthlyLoss.toLocaleString()}/mo</span>
              </h1>
              <p className="text-xl text-gray-300 mb-8 max-w-xl leading-relaxed">
                One scan finds exactly where. No agency, no dashboard to learn — just a 
                plain-English fix-it plan with copy-paste instructions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/audit/new"
                  className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-brand-500 text-white font-semibold text-lg hover:bg-brand-400 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
                >
                  Run Free Audit →
                </Link>
                <a
                  href="#pricing"
                  onClick={scrollToPricing}
                  className="inline-flex items-center justify-center px-8 py-4 rounded-xl border-2 border-white/20 text-white font-semibold text-lg hover:bg-white/10 transition-all hover:-translate-y-0.5"
                >
                  See What You Get
                </a>
              </div>
              <p className="text-sm text-gray-500 mt-4">Free preview. $49 to unlock the full fix-it plan + content kit.</p>
            </div>

            {/* Right: Live Audit Preview Card */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
              {/* Score header */}
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-400 font-medium">YOUR SCORE</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-4xl font-black ${sampleAudit.overall < 50 ? 'text-red-400' : sampleAudit.overall < 70 ? 'text-yellow-400' : 'text-green-400'}`}>
                      {sampleAudit.grade}
                    </span>
                    <span className="text-lg text-gray-400">({sampleAudit.overall}/100)</span>
                  </div>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${sampleAudit.overall < 50 ? 'bg-red-500' : sampleAudit.overall < 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
                    style={{ width: `${sampleAudit.overall}%` }}
                  />
                </div>
              </div>
              {/* Findings */}
              <div className="p-6 space-y-4">
                <p className="text-sm font-semibold text-gray-300 uppercase tracking-wider text-xs">⚠️ Critical Issues Found</p>
                {sampleAudit.findings.map((f, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                      f.severity === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {f.severity === 'high' ? '!' : '•'}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-white">{f.issue}</p>
                      <p className="text-xs text-gray-400">{f.impact}</p>
                    </div>
                  </div>
                ))}
              </div>
              {/* Revenue leak */}
              <div className="p-6 bg-gradient-to-r from-red-500/10 to-orange-500/10 border-t border-white/10">
                <p className="text-sm text-gray-400 mb-1">Estimated Monthly Revenue Loss</p>
                <p className="text-3xl font-black text-red-400">${sampleAudit.revenueEstimate.monthlyLoss.toLocaleString()}<span className="text-lg text-gray-500 font-normal">/mo</span></p>
                <p className="text-xs text-gray-500 mt-2">💡 {sampleAudit.revenueEstimate.topFix}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-brand-600 font-semibold text-sm tracking-wider uppercase">3-Minute Process</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2">How It Works</h2>
            <p className="text-gray-500 mt-3 max-w-2xl mx-auto">No login. No onboarding call. Just real data.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {[
              { num: '1', icon: '🔍', title: 'Enter Your URL', desc: 'Type your website address, pick your category, and tell us your biggest challenge.' },
              { num: '2', icon: '📊', title: 'Get Your Score', desc: 'We scan 20+ data points: PageSpeed, SSL, meta tags, competitors, GBP, and more.' },
              { num: '3', icon: '✅', title: 'Fix & Grow', desc: 'Get a prioritized fix-it plan with copy-paste instructions. Pay $49 to unlock every detail.' },
            ].map((s, i) => (
              <div key={s.num} className="relative text-center group">
                <div className="w-20 h-20 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center text-3xl mx-auto mb-6 group-hover:bg-brand-200 group-hover:scale-110 transition-all shadow-sm">{s.icon}</div>
                {i < 2 && <div className="absolute top-8 left-[calc(50%+3rem)] hidden md:block" style={{ width: 'calc(100% - 5rem)' }}><div className="h-px bg-gradient-to-r from-brand-200 to-transparent" /></div>}
                <h3 className="text-xl font-bold mb-3">{s.title}</h3>
                <p className="text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== WHAT YOU GET ===== */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-brand-600 font-semibold text-sm tracking-wider uppercase">$49 Delivers</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2">What's Inside Your Audit</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { icon: '🚀', title: 'Website Health Scan', items: ['PageSpeed scores (mobile + desktop)', 'SSL certificate check', 'Meta tag analysis (title, H1, description)', 'Open Graph / social preview check', 'Robots.txt & sitemap audit', 'Mobile responsiveness check'] },
              { icon: '📍', title: 'Local SEO Deep-Dive', items: ['Google Business Profile analysis', 'Competitor comparison (3 URLs)', 'Local keyword opportunities', 'Citation & NAP consistency check', 'Review profile assessment', 'Local pack ranking gaps'] },
              { icon: '📋', title: 'Fix-It Plan + Content', items: ['Step-by-step fix instructions', 'Platform-specific guides (WP/Wix/Squarespace)', '28 ready-to-use content pieces', 'Revenue loss calculator', 'Copy-paste social posts & emails', '30-day priority action plan'] },
            ].map((section) => (
              <div key={section.title} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all">
                <div className="text-3xl mb-4">{section.icon}</div>
                <h3 className="text-lg font-bold mb-3">{section.title}</h3>
                <ul className="space-y-2">
                  {section.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-green-500 shrink-0 mt-0.5">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== REAL DATA DEMO ===== */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-brand-600 font-semibold text-sm tracking-wider uppercase">Real Example</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2">What a Real Audit Found</h2>
            <p className="text-gray-500 mt-3 max-w-2xl mx-auto">This is from an actual scan — no mock data, no templates.</p>
          </div>
          <div className="max-w-4xl mx-auto bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
            {/* Top bar */}
            <div className="flex items-center gap-2 px-6 py-3 bg-gray-800">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-sm text-gray-400 ml-3 font-mono">mypetsloveit.com — Audit Results</span>
            </div>
            {/* Content */}
            <div className="p-6 md:p-8 grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-3 font-semibold">Score Breakdown</p>
                {Object.entries(sampleAudit.scores).map(([key, val]) => (
                  <div key={key} className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span className={val < 50 ? 'text-red-400' : val < 70 ? 'text-yellow-400' : 'text-green-400'}>{val}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className={`h-2 rounded-full ${val < 50 ? 'bg-red-500' : val < 70 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${val}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-3 font-semibold">Top Fixes (Priority Order)</p>
                <div className="space-y-3">
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                    <p className="text-sm font-medium text-red-300">1. Fix Mobile PageSpeed (38/100)</p>
                    <p className="text-xs text-gray-400">Compress images, enable caching, remove render-blocking JS → recover ~$600/mo</p>
                  </div>
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                    <p className="text-sm font-medium text-yellow-300">2. Add XML Sitemap</p>
                    <p className="text-xs text-gray-400">Helps Google index all your pages → recover ~$400/mo</p>
                  </div>
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                    <p className="text-sm font-medium text-yellow-300">3. Fix H1 Missing Keywords</p>
                    <p className="text-xs text-gray-400">Use a descriptive H1 with your main keyword → recover ~$350/mo</p>
                  </div>
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                    <p className="text-sm font-medium text-green-300">4. Shorten Meta Description</p>
                    <p className="text-xs text-gray-400">Under 160 characters so Google shows the full text → recover ~$200/mo</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 px-6 md:px-8 py-4 border-t border-gray-700">
              <p className="text-sm text-gray-400">
                <span className="text-red-400 font-bold">Estimated monthly loss: ${sampleAudit.revenueEstimate.monthlyLoss.toLocaleString()}</span>
                {' · '}
                <span className="text-gray-500">Annual: ${sampleAudit.revenueEstimate.annualLoss.toLocaleString()}</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CATEGORIES ===== */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-brand-600 font-semibold text-sm tracking-wider uppercase">Works For</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2">Any Local Service Business</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {targets.map((t) => (
              <div key={t} className="group bg-white rounded-xl px-6 py-5 text-center border border-gray-200 hover:border-brand-200 hover:bg-brand-50 hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-default">
                <span className="font-semibold text-gray-800 group-hover:text-brand-700 transition-colors">{t}</span>
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
            <h2 className="text-3xl md:text-4xl font-bold mt-2">One Price. Real Results.</h2>
          </div>
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-xl border-2 border-brand-500 p-8 text-center relative hover:shadow-2xl hover:-translate-y-1 transition-all">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-brand-600 text-white px-5 py-1 rounded-full text-xs font-bold tracking-wider shadow-lg">
                BEST VALUE
              </div>
              <h3 className="text-xl font-bold mb-2">One-Time Marketing Audit</h3>
              <p className="text-sm text-gray-500 mb-2">Everything you need to fix your online presence</p>
              <p className="text-5xl font-bold text-brand-600 mb-1">$49</p>
              <p className="text-sm text-gray-400 mb-8">one-time · no subscription</p>
              <a
                href="https://buy.stripe.com/28EfZh6yHgNRg3MaFd5ZC01"
                target="_blank" rel="noopener noreferrer"
                className="block w-full bg-brand-600 text-white py-3.5 rounded-xl font-semibold text-lg hover:bg-brand-700 hover:-translate-y-0.5 transition-all shadow-lg mb-4"
              >
                Buy Audit — $49
              </a>
              <p className="text-xs text-gray-400">🔒 Secure checkout via Stripe</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="py-24 bg-gradient-to-br from-gray-900 via-gray-900 to-brand-950 text-white relative overflow-hidden">
        <div className="relative max-w-3xl mx-auto text-center px-4">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            See What Your Website Is Leaking
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            No login. No commitment. Just a real, data-driven analysis of your website in under 3 minutes.
          </p>
          <Link
            to="/audit/new"
            className="inline-flex items-center justify-center bg-white text-brand-700 px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 hover:-translate-y-0.5 transition-all shadow-2xl"
          >
            Run Free Audit →
          </Link>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-gray-900 text-gray-400 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} LocalBoost AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}