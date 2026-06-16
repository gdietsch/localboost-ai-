import { useParams, useLocation, Link } from 'react-router-dom';

// Import marketing templates
import nicheHooks from '../content/niche-hooks.json';
import copyTemplates from '../content/audit-copy-templates.json';
import benchmarks from '../content/benchmarks.json';

// Map form categories → template slugs
const categorySlug = {
  'Home Cleaners': 'home-cleaning',
  'Pet Services (Pet Sitting, Dog Walking, Grooming)': 'pet-services',
  'Dentists': 'dental',
  'Plastic Surgery': 'plastic-surgery',
  'Med Spas': 'med-spa',
  'Beauty Salons': 'beauty',
  'Nail Salons': 'nail-salons',
  'Gyms/Fitness': 'gym',
  'Landscapers': 'landscaping',
  'Barbers': 'barbers',
  'Photographers': 'photography',
  'Restaurants': 'restaurants',
  'Real Estate Agents': 'default',
  'Massage Therapy': 'med-spa',
  'Chiropractors': 'dental',
  'Veterinarians': 'pet-services',
};

const scoreCategories = ['Website Health', 'Google Business Profile', 'Competitor Position', 'Revenue Opportunity'];

const categoryIcons = {
  'Website Health': '🚀',
  'Google Business Profile': '📍',
  'Competitor Position': '📊',
  'Revenue Opportunity': '💰',
};

const deliverables = [
  { icon: '📋', label: 'Detailed Website Analysis', desc: 'Specific fixes for YOUR site' },
  { icon: '📍', label: 'GBP Optimization Plan', desc: 'Step-by-step to rank higher locally' },
  { icon: '📊', label: 'Competitor Breakdown', desc: 'See exactly what they do better' },
  { icon: '💰', label: 'Revenue Growth Calculator', desc: 'Personalized monthly projections' },
  { icon: '📅', label: '30-Day Action Plan', desc: 'Prioritized weekly tasks' },
  { icon: '📱', label: '12 Custom Content Pieces', desc: 'Social posts, emails, review replies' },
];

function getNicheData(category) {
  const slug = categorySlug[category] || 'default';
  return {
    hooks: nicheHooks[slug] || nicheHooks['default'],
    copy: copyTemplates[slug] || copyTemplates['default'],
    bench: benchmarks[slug] || benchmarks['default'],
  };
}

export default function AuditPreview() {
  const { id } = useParams();
  const location = useLocation();
  const businessName = location.state?.businessName || 'Your Business';
  const category = location.state?.category || 'Home Cleaners';
  const { hooks, copy, bench } = getNicheData(category);

  // Build score cards from copy templates
  const sampleItems = scoreCategories.map((title) => {
    const c = copy[title] || { issue: 'Optimization needed', revenueImpact: '~$800/mo potential' };
    const score = title === 'Website Health' ? 52 : title === 'Google Business Profile' ? 38 : title === 'Competitor Position' ? 45 : 68;
    const grade = score < 40 ? 'F' : score < 60 ? 'F' : score < 70 ? 'D' : 'C';
    const potential = title === 'Revenue Opportunity' ? 95 : title === 'Website Health' ? 85 : title === 'Google Business Profile' ? 90 : 75;
    return { title, score, grade, issue: c.issue, revenueImpact: c.revenueImpact, potential };
  });

  // Calculate total monthly opportunity
  const totalLoss = sampleItems.reduce((sum, item) => {
    const match = item.revenueImpact.match(/\$?([\d,]+)/);
    return sum + (match ? parseInt(match[1].replace(/,/g, '')) : 800);
  }, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Hero — Lost Revenue Hook */}
      <div className="text-center mb-8">
        <div className="inline-block bg-red-100 text-red-700 px-4 py-1 rounded-full text-sm font-medium mb-4">
          ⚠️ Urgent: Revenue Loss Detected
        </div>
        <h1 className="text-3xl font-bold mb-1">{businessName}</h1>
        <p className="text-gray-500 mb-6">{category} · Free Analysis Preview</p>

        <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-2xl p-8 mb-4 shadow-lg">
          <p className="text-sm uppercase tracking-widest font-semibold mb-1">
            {hooks.heroHook || 'Estimated Monthly Revenue Loss'}
          </p>
          <p className="text-6xl md:text-7xl font-bold mb-2">
            ${totalLoss.toLocaleString()}
            <span className="text-2xl text-white/60">/mo</span>
          </p>
          <p className="text-lg text-white/80">{hooks.painPoint || 'Your low scores are costing you real money every month.'}</p>
        </div>

        <a href="https://buy.stripe.com/28EfZh6yHgNRg3MaFd5ZC01" target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-brand-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-brand-700 hover:-translate-y-0.5 transition-all shadow-xl">
          🔓 Unlock Full Analysis — $49
          <span className="text-brand-200">→</span>
        </a>
      </div>

      {/* Score Cards with Revenue Impact */}
      <div className="grid md:grid-cols-2 gap-5 mb-10">
        {sampleItems.map((item) => (
          <div key={item.title} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-700">{categoryIcons[item.title]} {item.title}</span>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                item.grade === 'F' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
              }`}>{item.grade}</span>
            </div>

            <div className="relative mb-2">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className={`h-3 rounded-full ${item.score < 40 ? 'bg-red-500' : item.score < 60 ? 'bg-orange-500' : 'bg-yellow-500'}`}
                  style={{ width: `${item.score}%` }} />
              </div>
              <div className="absolute top-0" style={{ left: `${item.potential}%` }}>
                <div className="w-0.5 h-3 bg-green-500" />
                <span className="text-[10px] text-green-600 font-semibold -ml-2 whitespace-nowrap">🎯 Target</span>
              </div>
            </div>

            <div className="flex justify-between text-xs text-gray-400 mb-3">
              <span>Current: {item.score}%</span>
              <span>Potential: {item.potential}%</span>
            </div>

            <div className="bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-2">
              <span className="text-red-700 font-semibold text-sm">💰 {item.revenueImpact}</span>
            </div>
            <p className="text-xs text-gray-500">{item.issue}</p>
          </div>
        ))}
      </div>

      {/* What's Inside */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8">
        <h2 className="text-xl font-bold mb-6 text-center">📦 What's Inside Your Full Report</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {deliverables.map((d) => (
            <div key={d.label} className="bg-gray-50 rounded-xl p-4 text-center hover:bg-gray-100 transition-colors">
              <span className="text-3xl block mb-2">{d.icon}</span>
              <h3 className="font-semibold text-gray-800 text-sm">{d.label}</h3>
              <p className="text-xs text-gray-500 mt-1">{d.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Urgency Footer */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-800 rounded-2xl p-8 text-white text-center shadow-lg">
        <p className="text-3xl font-bold mb-3">⏱️ Don't let another month slip away</p>
        <p className="text-brand-100 mb-6 max-w-lg mx-auto leading-relaxed">
          Most businesses see a <strong className="text-white">3.2x return</strong> on this $49 investment.
          Your full report is ready with specific fixes that can start recovering revenue this week.
        </p>
        <a href="https://buy.stripe.com/28EfZh6yHgNRg3MaFd5ZC01" target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-white text-brand-700 px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 hover:-translate-y-0.5 transition-all shadow-xl">
          Unlock Full Analysis — $49 →
        </a>
        <p className="text-sm text-brand-200 mt-4">🔒 Secure checkout via Stripe · 30-day money-back guarantee</p>
      </div>
    </div>
  );
}
