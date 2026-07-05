import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { targets } from '../content/landingContent.js';

export default function LandingPage() {
  const [checkUrl, setCheckUrl] = useState('');
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState(null);
  const [checkError, setCheckError] = useState('');
  const resultRef = useRef(null);

  function scrollToPricing(e) {
    e.preventDefault();
    const el = document.getElementById('pricing');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }

  async function handleUrlCheck(e) {
    e.preventDefault();
    if (!checkUrl.trim()) return;
    setChecking(true);
    setCheckError('');
    setCheckResult(null);
    try {
      const res = await fetch('/api/analysis/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Quick Check',
          website: checkUrl.trim(),
          category: 'Home Cleaners',
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        try {
          const err = JSON.parse(text);
          throw new Error(err.error || 'Failed to analyze');
        } catch (parseErr) {
          throw new Error('Server error — please try again in a moment');
        }
      }
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseErr) {
        throw new Error('Invalid response — please try again');
      }
      setCheckResult(data);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
    } catch (err) {
      setCheckError(err.message);
    }
    setChecking(false);
  }

  // Real example data for the report mockup section
  const sampleFindings = [
    { severity: 'high', issue: 'Mobile PageSpeed 38/100', fix: 'Compress images, enable caching, remove render-blocking JS', impact: '$600/mo' },
    { severity: 'high', issue: 'No XML Sitemap', fix: 'Generate & submit to Google Search Console', impact: '$400/mo' },
    { severity: 'high', issue: 'H1 Missing Keywords', fix: 'Rewrite H1 to include primary keyword', impact: '$350/mo' },
    { severity: 'medium', issue: 'Meta Description Too Long', fix: 'Shorten to under 160 characters', impact: '$200/mo' },
  ];

  return (
    <div>
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden bg-gray-900 text-white min-h-screen flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900 to-brand-950" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 25% 50%, #fff 0.5px, transparent 0.5px)', backgroundSize: '40px 40px' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <div>
              <div className="inline-flex items-center gap-2 bg-brand-500/10 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-medium mb-6 border border-brand-500/20">
                🎯 See Your Score in Under 10 Seconds
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 tracking-tight">
                Type Your URL.<br />
                See What You're Leaking.
              </h1>
              <p className="text-xl text-gray-300 mb-6 max-w-xl leading-relaxed">
                Get a real, data-driven audit of your website. No account. No email. Just your URL.
              </p>
              
              {/* Live URL checker */}
              <form onSubmit={handleUrlCheck} className="flex flex-col sm:flex-row gap-3 max-w-lg mb-4">
                <input
                  type="text"
                  value={checkUrl}
                  onChange={(e) => setCheckUrl(e.target.value)}
                  placeholder="mypetsloveit.com"
                  className="flex-1 px-5 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-lg"
                />
                <button
                  type="submit"
                  disabled={checking}
                  className="px-8 py-4 rounded-xl bg-brand-500 text-white font-semibold text-lg hover:bg-brand-400 transition-all disabled:opacity-50 shadow-xl hover:shadow-2xl whitespace-nowrap"
                >
                  {checking ? 'Scanning...' : 'Check Score →'}
                </button>
              </form>
              <p className="text-sm text-gray-500">Enter any website. Free scan. No signup required.</p>

              {/* Inline result */}
              {checkError && (
                <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-xl p-4 max-w-lg">
                  <p className="text-red-300 text-sm">{checkError}</p>
                </div>
              )}
              {checkResult && (
                <div ref={resultRef} className="mt-4 bg-white/5 border border-white/10 rounded-xl p-4 max-w-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-400">YOUR SCORE</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-3xl font-black ${checkResult.overall < 50 ? 'text-red-400' : checkResult.overall < 70 ? 'text-yellow-400' : 'text-green-400'}`}>
                        {checkResult.grade}
                      </span>
                      <span className="text-sm text-gray-400">({checkResult.overall}/100)</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
                    <div className={`h-2 rounded-full ${checkResult.overall < 50 ? 'bg-red-500' : checkResult.overall < 70 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${checkResult.overall}%` }} />
                  </div>
                  <Link
                    to="/audit/new"
                    className="block w-full text-center bg-brand-600 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-brand-700 transition mt-2"
                  >
                    Get Full Fix Plan — $49 →
                  </Link>
                </div>
              )}
            </div>

            {/* Right: Trust + comparison */}
            <div className="space-y-6">
              {/* Agency cost comparison */}
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">💰</span>
                  <span className="text-lg font-semibold">What Others Charge</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-red-500/10 rounded-xl p-4 text-center">
                    <p className="text-xs text-gray-400 mb-1">Marketing Agency</p>
                    <p className="text-2xl font-bold text-red-400">$1,500</p>
                    <p className="text-xs text-gray-500">per month</p>
                  </div>
                  <div className="bg-green-500/10 rounded-xl p-4 text-center border-2 border-green-500/30">
                    <p className="text-xs text-gray-400 mb-1">LocalBoost AI</p>
                    <p className="text-2xl font-bold text-green-400">$49</p>
                    <p className="text-xs text-gray-500">one-time</p>
                  </div>
                </div>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap gap-3">
                {[
                  { icon: '🔒', label: '256-bit SSL' },
                  { icon: '⚡', label: 'Stripe Checkout' },
                  { icon: '🛡️', label: 'Instant Results' },
                  { icon: '📊', label: 'Real Data' },
                ].map((b) => (
                  <div key={b.label} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-gray-300">
                    <span>{b.icon}</span>
                    <span>{b.label}</span>
                  </div>
                ))}
              </div>

              {/* Scarcity */}
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-5 py-3">
                <p className="text-sm text-amber-300 font-medium">📈 Price increasing to $79 — next month</p>
                <p className="text-xs text-amber-400/60 mt-1">Lock in $49 while it lasts</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== WHAT THE FULL REPORT LOOKS LIKE ===== */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-brand-600 font-semibold text-sm tracking-wider uppercase">Preview</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2">What $49 Gets You</h2>
            <p className="text-gray-500 mt-3 max-w-2xl mx-auto">Every audit delivers a complete fix-it plan with copy-paste instructions.</p>
          </div>

          <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            {/* Terminal bar */}
            <div className="flex items-center gap-2 px-6 py-3 bg-gray-100 border-b border-gray-200">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <span className="text-sm text-gray-500 ml-3 font-mono">your-audit.localboosts.biz</span>
            </div>
            
            <div className="grid md:grid-cols-2">
              {/* Left: Score + Findings */}
              <div className="p-6 md:p-8 border-r border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Grade</span>
                  <span className="text-5xl font-black text-red-500">D<span className="text-lg text-gray-400 font-normal"> (66/100)</span></span>
                </div>
                <div className="space-y-4">
                  <p className="text-sm font-semibold text-gray-700">⚠️ Critical Issues Found</p>
                  {sampleFindings.map((f, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                        f.severity === 'high' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'
                      }`}>{f.severity === 'high' ? '!' : '•'}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{f.issue}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{f.fix}</p>
                        <p className="text-xs font-semibold text-red-500 mt-0.5">Costing: {f.impact}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Fix instructions */}
              <div className="p-6 md:p-8 bg-gray-50">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-4">📋 Step-by-Step Fix Instructions</p>
                <div className="space-y-4">
                  {[
                    { num: '01', platform: 'WordPress', instruction: 'Install "Smush" plugin → enable lazy load → compress all existing images' },
                    { num: '02', platform: 'Squarespace', instruction: 'Settings → Performance → Enable "Accelerated Mobile Pages"' },
                    { num: '03', platform: 'Wix', instruction: 'Wix Speed Booster → run optimization → enable caching' },
                  ].map((s) => (
                    <div key={s.num} className="bg-white rounded-xl border border-gray-200 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-brand-100 text-brand-700 text-xs font-bold px-2 py-0.5 rounded">{s.platform}</span>
                        <span className="text-xs text-gray-400">Step {s.num}</span>
                      </div>
                      <p className="text-sm text-gray-700">{s.instruction}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                  <p className="text-sm font-medium text-green-700">+ 28 ready-to-use content pieces included</p>
                  <p className="text-xs text-green-600 mt-1">Social posts, Google posts, emails, review replies</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 px-6 md:px-8 py-4 flex items-center justify-between">
              <p className="text-sm text-gray-400">
                Estimated monthly loss: <span className="text-red-400 font-bold">$1,840/mo</span>
                {' · '}Annual: $22,080
              </p>
              <a
                href="https://buy.stripe.com/28EfZh6yHgNRg3MaFd5ZC01"
                target="_blank" rel="noopener noreferrer"
                className="bg-brand-500 text-white px-5 py-2 rounded-lg font-semibold text-sm hover:bg-brand-400 transition"
              >
                Get Yours — $49 →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-brand-600 font-semibold text-sm tracking-wider uppercase">3 Minutes</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2">How It Works</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12 max-w-4xl mx-auto">
            {[
              { num: '1', icon: '🔍', title: 'Enter Your URL', desc: 'Type your website. We scan 20+ data points in under 30 seconds.' },
              { num: '2', icon: '📊', title: 'Get Your Grade', desc: 'See your score, top issues, and exactly how much revenue you\'re losing.' },
              { num: '3', icon: '✅', title: 'Get the Fix Plan', desc: '$49 unlocks step-by-step instructions, content templates, and your full action plan.' },
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
            <h2 className="text-3xl md:text-4xl font-bold mt-2">Everything Included</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { icon: '🚀', title: 'Website Health Scan', items: ['PageSpeed mobile + desktop', 'SSL certificate check', 'Meta tag analysis (title, H1, desc)', 'Open Graph / social preview', 'Robots.txt & sitemap audit', 'Mobile responsiveness'] },
              { icon: '📍', title: 'Local SEO Deep-Dive', items: ['Google Business Profile audit', 'Competitor comparison (3 URLs)', 'Local keyword opportunities', 'Citation & NAP consistency', 'Review profile assessment', 'Local pack ranking gaps'] },
              { icon: '📋', title: 'Fix-It Plan + Content', items: ['Step-by-step fix instructions', 'Platform-specific (WP/Wix/Squarespace)', '28 ready-to-use content pieces', 'Revenue loss calculator', 'Copy-paste social posts & emails', '30-day priority action plan'] },
            ].map((section) => (
              <div key={section.title} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all">
                <div className="text-3xl mb-4">{section.icon}</div>
                <h3 className="text-lg font-bold mb-3">{section.title}</h3>
                <ul className="space-y-2">
                  {section.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-gray-600"><span className="text-green-500 shrink-0 mt-0.5">✓</span>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== AGENCY COST COMPARISON ===== */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-brand-600 font-semibold text-sm tracking-wider uppercase">Comparison</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2">Agency vs. LocalBoost</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-2xl border border-gray-200 p-8">
              <div className="text-3xl mb-3">🏢</div>
              <h3 className="text-xl font-bold text-gray-800 mb-1">Marketing Agency</h3>
              <p className="text-4xl font-bold text-gray-800 mb-4"><span className="text-2xl text-gray-400">$</span>1,500<span className="text-lg text-gray-400 font-normal">/mo</span></p>
              <ul className="space-y-3">
                {['Monthly retainer', 'Onboarding calls & meetings', 'Dashboard you have to check', 'Generic content templates', 'Hard to cancel'].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-gray-600"><span className="text-red-400 mt-0.5">✕</span>{item}</li>
                ))}
              </ul>
            </div>
            <div className="bg-brand-50 rounded-2xl border-2 border-brand-200 p-8 relative">
              <div className="absolute -top-3 right-6 bg-brand-600 text-white px-4 py-0.5 rounded-full text-xs font-bold">BEST VALUE</div>
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="text-xl font-bold text-brand-800 mb-1">LocalBoost AI</h3>
              <p className="text-4xl font-bold text-brand-600 mb-4"><span className="text-2xl text-brand-400">$</span>49<span className="text-lg text-brand-400 font-normal"> one-time</span></p>
              <ul className="space-y-3">
                {['No monthly fees', 'No calls or meetings', 'Nothing to log into', 'Custom data from YOUR site', 'Instant purchase, instant results'].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-gray-700"><span className="text-green-500 mt-0.5 font-bold">✓</span>{item}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="text-center mt-8">
            <a
              href="https://buy.stripe.com/28EfZh6yHgNRg3MaFd5ZC01"
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center bg-brand-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-brand-700 hover:-translate-y-0.5 transition-all shadow-xl"
            >
              Get Your Audit — $49 →
            </a>
          </div>
        </div>
      </section>

      {/* ===== TRUST BADGES ===== */}
      <section className="py-12 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-400 mb-6 uppercase tracking-wider font-semibold">Secure & Trusted</p>
          <div className="flex flex-wrap justify-center gap-6">
            {[
              { icon: '🔒', label: '256-bit SSL Encrypted', desc: 'Your data is safe in transit' },
              { icon: '⚡', label: 'Stripe Checkout', desc: 'Pay via credit/debit card' },
              { icon: '📊', label: 'Real-Time Analysis', desc: 'Results in under 30 seconds' },
              { icon: '🎯', label: 'Custom Data', desc: 'Scans YOUR website, not templates' },
            ].map((b) => (
              <div key={b.label} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-5 py-4">
                <span className="text-2xl">{b.icon}</span>
                <div className="text-left">
                  <p className="text-sm font-semibold">{b.label}</p>
                  <p className="text-xs text-gray-400">{b.desc}</p>
                </div>
              </div>
            ))}
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
              <p className="text-sm text-gray-500 mb-2">Complete website analysis + fix-it plan + content kit</p>
              <p className="text-5xl font-bold text-brand-600 mb-1">$49</p>
              <p className="text-sm text-gray-400 mb-2">one-time · no subscription</p>
              <p className="text-xs text-amber-600 font-medium mb-6">📈 Price increasing to $79 next month</p>
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
            Type your URL above. Get your score in 10 seconds. No signup required.
          </p>
          <Link
            to="/audit/new"
            className="inline-flex items-center justify-center bg-white text-brand-700 px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 hover:-translate-y-0.5 transition-all shadow-2xl"
          >
            Run Full Free Audit →
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