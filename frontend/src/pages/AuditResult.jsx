import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ShareCard from '../components/ShareCard';

// Rich icon set for a consulting-grade feel
const findingIcons = {
  title_tag: '📌',
  meta_description: '📝',
  h1_tag: '🔤',
  pagespeed: '⚡',
  ssl: '🔒',
  viewport: '📱',
  og_tags: '🖼️',
  robots: '🤖',
  sitemap: '🗺️',
  favicon: '🎯',
  word_count: '📄',
  gbp: '📍',
  competitor: '📊',
  cta: '🎯',
  default: '⚠️',
};

// Tool links for each finding category
const toolLinks = {
  pagespeed: 'https://pagespeed.web.dev/',
  search_console: 'https://search.google.com/search-console',
  business_profile: 'https://business.google.com/',
  tiny_png: 'https://tinypng.com/',
  yoast: 'https://yoast.com/',
  wordpress_admin: ' (yourdomain.com/wp-admin)',
};

// Platform options for the intake form
const platformOptions = [
  { value: '', label: 'Select your platform...' },
  { value: 'wordpress', label: 'WordPress' },
  { value: 'squarespace', label: 'Squarespace' },
  { value: 'wix', label: 'Wix' },
  { value: 'shopify', label: 'Shopify' },
  { value: 'other', label: 'Other / Custom' },
];

// Map findings categories to playbook keys in fix-it-playbook.json
function findingToPlaybookKey(findingTitle) {
  const t = findingTitle.toLowerCase();
  if (t.includes('title tag')) return 'title_tag';
  if (t.includes('meta description') || t.includes('meta desc')) return 'meta_description';
  if (t.includes('h1') || t.includes('heading')) return 'h1_tag';
  if (t.includes('pagespeed') || t.includes('speed')) return 'pagespeed';
  if (t.includes('ssl') || t.includes('secure') || t.includes('certificate')) return 'ssl_fix';
  if (t.includes('viewport') || t.includes('mobile')) return null; // handled inline
  if (t.includes('open graph') || t.includes('og tag') || t.includes('social sharing') || t.includes('social preview')) return 'og_tags';
  if (t.includes('robots')) return 'sitemap_robots';
  if (t.includes('sitemap')) return 'sitemap_robots';
  if (t.includes('favicon') || t.includes('icon')) return 'favicon';
  if (t.includes('word count') || t.includes('content depth') || t.includes('thin content')) return 'word_count';
  if (t.includes('google business') || t.includes('gbp') || t.includes('maps') || t.includes('profile')) return 'gbp_optimization';
  if (t.includes('competitor')) return 'competitor_strategy';
  if (t.includes('cta') || t.includes('call to action') || t.includes('button')) return 'cta_clarity';
  return null;
}

function getRevenueImpact(severity, category) {
  if (severity === 'safe') return null;
  const impacts = {
    high: { min: 1200, max: 3600, label: 'Critical Revenue Leak' },
    medium: { min: 400, max: 1200, label: 'Moderate Revenue Impact' },
  };
  const level = impacts[severity] || impacts.medium;
  return {
    ...level,
    display: `$${level.min.toLocaleString()}–$${level.max.toLocaleString()}/mo`,
  };
}

// Category-specific page for each finding with step-by-step instructions
function FindingCard({ finding, index, playbook, platform }) {
  const [expanded, setExpanded] = useState(index < 3); // Auto-expand first 3
  const pbKey = findingToPlaybookKey(finding.title || finding.issue);
  const pbData = pbKey ? playbook[pbKey] : null;
  
  // Determine platform-specific guide
  let platformGuide = null;
  let platformExactText = null;
  if (pbData) {
    if (pbData[platform]) {
      platformGuide = pbData[platform].steps;
      platformExactText = pbData[platform].exact_text;
    } else if (pbData.general) {
      platformGuide = pbData.general.steps;
      platformExactText = pbData.general.exact_text;
    } else if (pbData.all_platforms) {
      platformGuide = pbData.all_platforms.steps;
      platformExactText = pbData.all_platforms.exact_text;
    } else if (pbData.google) {
      platformGuide = pbData.google.steps;
      platformExactText = pbData.google.exact_text;
    } else {
      // Fallback to first available platform
      const firstKey = Object.keys(pbData)[0];
      if (firstKey) {
        platformGuide = pbData[firstKey].steps;
        platformExactText = pbData[firstKey].exact_text;
      }
    }
  }

  const severity = finding.severity || 'medium';
  const revenue = getRevenueImpact(severity, finding.category);
  const isSafe = severity === 'safe';
  const cleanIssue = (finding.title || finding.issue || '').replace(/^[🔴🟡✅]\s*/, '').replace(/^\[.*?\]\s*/, '');
  const icon = findingIcons[pbKey] || findingIcons.default;

  return (
    <div className={`bg-white rounded-2xl shadow-sm border-2 overflow-hidden transition-all hover:shadow-md ${
      isSafe ? 'border-green-200' : severity === 'high' ? 'border-red-200' : 'border-amber-200'
    }`}>
      {/* Card Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-5 flex items-start gap-4 hover:bg-gray-50/50 transition-colors"
      >
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${
          isSafe ? 'bg-green-100' : severity === 'high' ? 'bg-red-100' : 'bg-amber-100'
        }`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-bold text-gray-400">#{index + 1}</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              isSafe ? 'bg-green-100 text-green-700' : severity === 'high' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
            }`}>
              {isSafe ? '✅ On Track' : severity === 'high' ? '🔴 Critical' : '🟡 Needs Work'}
            </span>
          </div>
          <h3 className="font-bold text-gray-900 text-base leading-snug">{cleanIssue}</h3>
          {!isSafe && revenue && (
            <p className="text-sm font-semibold text-red-600 mt-1">
              💰 {revenue.label}: {revenue.display}
            </p>
          )}
        </div>
        <div className="text-gray-400 text-xl shrink-0 mt-2">
          {expanded ? '−' : '+'}
        </div>
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="px-5 pb-6 border-t border-gray-100 pt-4">
          {/* What's Wrong */}
          <div className="mb-4">
            <p className="text-sm text-gray-700 leading-relaxed">{finding.impact || finding.body}</p>
          </div>

          {/* Step-by-Step Fix */}
          {platformGuide && platformGuide.length > 0 && !isSafe && (
            <div className="mb-4">
              <h4 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-1">
                ✅ Step-by-Step Fix {platform !== 'other' && platform !== '' ? `(for ${platform.charAt(0).toUpperCase() + platform.slice(1)})` : ''}
              </h4>
              <div className="space-y-1.5">
                {platformGuide.map((step, si) => (
                  <div key={si} className="flex items-start gap-2 text-sm">
                    <span className="w-5 h-5 bg-brand-100 text-brand-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{si + 1}</span>
                    <span className="text-gray-700">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Exact Text to Copy-Paste */}
          {platformExactText && !isSafe && (
            <div className="mb-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h4 className="text-sm font-bold text-blue-800 mb-2 flex items-center gap-1">
                📝 Copy-Paste This Text
              </h4>
              <div className="relative">
                <pre className="text-sm text-blue-900 bg-white rounded-lg p-3 border border-blue-100 overflow-x-auto whitespace-pre-wrap font-mono text-xs">
                  {platformExactText}
                </pre>
                <button
                  onClick={() => navigator.clipboard?.writeText(platformExactText)}
                  className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded hover:bg-blue-700 transition"
                >
                  Copy
                </button>
              </div>
              <p className="text-xs text-blue-600 mt-2">
                💡 Replace [CATEGORY], [CITY], [BUSINESS NAME] etc. with your actual info
              </p>
            </div>
          )}

          {/* Tool Links */}
          {pbKey && toolLinks[pbKey] && !isSafe && (
            <div className="mb-3">
              <h4 className="text-sm font-bold text-gray-800 mb-1.5">🔗 Recommended Tools</h4>
              <a
                href={toolLinks[pbKey]}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700 font-medium"
              >
                {toolLinks[pbKey]}
                <span className="text-xs">↗</span>
              </a>
            </div>
          )}

          {/* Generic pagespeed tool link */}
          {pbKey === 'pagespeed' && (
            <div className="mb-3">
              <h4 className="text-sm font-bold text-gray-800 mb-1.5">🔗 Recommended Tools</h4>
              <div className="flex flex-wrap gap-2">
                <a href="https://pagespeed.web.dev/" target="_blank" rel="noopener noreferrer"
                  className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
                  Google PageSpeed Insights ↗
                </a>
                <a href="https://tinypng.com/" target="_blank" rel="noopener noreferrer"
                  className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
                  TinyPNG ↗
                </a>
              </div>
            </div>
          )}

          {/* Search Console link for sitemap issues */}
          {pbKey === 'sitemap_robots' && (
            <div className="mb-3">
              <h4 className="text-sm font-bold text-gray-800 mb-1.5">🔗 Recommended Tools</h4>
              <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer"
                className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
                Google Search Console ↗
              </a>
            </div>
          )}

          {/* GBP tool link */}
          {pbKey === 'gbp_optimization' && (
            <div className="mb-3">
              <h4 className="text-sm font-bold text-gray-800 mb-1.5">🔗 Recommended Tools</h4>
              <a href="https://business.google.com/" target="_blank" rel="noopener noreferrer"
                className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
                Google Business Profile ↗
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AuditResult() {
  const { id } = useParams();
  const [audit, setAudit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [platform, setPlatform] = useState('wordpress');
  const [playbook, setPlaybook] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        // Load the fix-it playbook
        const pbRes = await fetch('/fix-it-playbook.json');
        if (pbRes.ok) {
          const pbData = await pbRes.json();
          if (!cancelled) setPlaybook(pbData);
        }

        // Load audit results
        const res = await fetch(`/api/analysis/${id}/results`);
        if (!res.ok) throw new Error('Audit not found');
        const data = await res.json();
        if (!cancelled) {
          setAudit(data);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) { setError(err.message); setLoading(false); }
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 border-[5px] border-brand-100 border-t-brand-600 rounded-full animate-spin mx-auto mb-6" />
        <p className="text-gray-500 text-lg">Building your personalized playbook...</p>
        <p className="text-gray-400 text-sm mt-2">This takes 3–5 seconds</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-8 max-w-lg mx-auto">
          <div className="text-4xl mb-4">🔍</div>
          <h2 className="text-xl font-semibold mb-2">Report Not Found</h2>
          <p className="text-sm mb-4">{error}</p>
          <Link to="/audit/new" className="inline-block bg-brand-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-brand-700 transition">
            Start New Analysis
          </Link>
        </div>
      </div>
    );
  }

  if (!audit) return null;

  const allContent = audit.content || [];
  const findings = audit.findings || [];
  const tasks = allContent.filter(i => i.type === 'task' && !i.title?.includes('Overall Score'));
  const socialPosts = allContent.filter(i => i.type === 'social_post');
  const googlePosts = allContent.filter(i => i.type === 'google_post');
  const emails = allContent.filter(i => i.type === 'email');
  const reviews = allContent.filter(i => i.type === 'review_reply');

  // Determine findings: use the structured findings from API or extract from content items
  const displayFindings = findings.length > 0 ? findings : tasks.slice(0, 10);

  const highIssues = displayFindings.filter(f => f.severity === 'high').length;
  const medIssues = displayFindings.filter(f => f.severity === 'medium').length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Link to="/dashboard" className="hover:text-brand-600">Dashboard</Link>
          <span>→</span>
          <span className="text-gray-700 font-medium">Action Playbook</span>
        </div>

        {/* Premium Header */}
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-brand-900 rounded-3xl p-8 md:p-10 mb-8 text-white shadow-xl">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center text-4xl font-bold backdrop-blur-sm border border-white/10">
              {audit.grade || '?'}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs uppercase tracking-widest text-brand-300 font-semibold">Step-by-Step Action Playbook</span>
                <span className="bg-white/10 text-white text-[10px] px-2 py-0.5 rounded-full">Premium</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-1">{audit.business_name}</h1>
              <p className="text-white/70">{audit.category} · {audit.website}</p>
            </div>
            <div className="text-right text-sm text-white/50">
              <p>Generated {audit.created_at ? new Date(audit.created_at).toLocaleDateString() : 'Today'}</p>
              <p className="text-brand-300 font-semibold">Overall: {audit.overall || 0}/100</p>
            </div>
          </div>

          {/* Quick stats row */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/10">
            <div>
              <div className="text-2xl font-bold">{highIssues}</div>
              <div className="text-xs text-white/50 uppercase tracking-wider">Critical Fixes</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{medIssues}</div>
              <div className="text-xs text-white/50 uppercase tracking-wider">Improvements</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{allContent.length}</div>
              <div className="text-xs text-white/50 uppercase tracking-wider">Assets Included</div>
            </div>
          </div>
        </div>

        {/* Platform Selector */}
        {displayFindings.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border p-5 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <label className="text-sm font-semibold text-gray-700 shrink-0">🌐 Your Website Platform:</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              >
                {platformOptions.map((opt) => (
                  <option key={opt.value} value={opt.value} disabled={opt.value === ''}>{opt.label}</option>
                ))}
              </select>
              <p className="text-xs text-gray-400">We'll show platform-specific fixes for each finding</p>
            </div>
          </div>
        )}

        {/* Playbook: Numbered Action Cards */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">📋 Your Personalized Fix Plan</h2>
            <span className="text-sm text-gray-400">{displayFindings.length} actions</span>
          </div>

          {displayFindings.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border p-10 text-center">
              <div className="text-4xl mb-3">✅</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">All Clear!</h3>
              <p className="text-gray-500">No issues found. Your business is in great shape.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayFindings.map((finding, idx) => (
                <FindingCard
                  key={idx}
                  finding={finding}
                  index={idx}
                  playbook={playbook || {}}
                  platform={platform}
                />
              ))}
            </div>
          )}
        </div>

        {/* Shareable Score Card */}
        <div className="mb-6">
          <ShareCard
            businessName={audit.business_name || 'Your Business'}
            grade={audit.grade || '?'}
            score={audit.overall || 0}
            monthlyLoss={Math.round((audit.overall ? (100 - audit.overall) * 24 : 1200))}
            findingsCount={allContent.length}
            website={audit.website}
          />
        </div>

        {/* Revenue Estimate Section */}
        {audit.revenueEstimate?.summary && (
          <div className="bg-gradient-to-r from-brand-600 to-brand-800 rounded-2xl p-8 mb-6 text-white shadow-lg">
            <h2 className="text-xl font-bold mb-3">💰 Revenue Impact Assessment</h2>
            <p className="text-white/80 leading-relaxed mb-4">{audit.revenueEstimate.summary}</p>
            {audit.revenueEstimate.topOpportunity && (
              <div className="bg-white/10 rounded-xl p-4">
                <p className="text-sm font-medium">🎯 Top Opportunity</p>
                <p className="text-white/80 text-sm mt-1">{audit.revenueEstimate.topOpportunity}</p>
              </div>
            )}
          </div>
        )}

        {/* Content Library */}
        {allContent.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border p-8 mb-6">
            <h2 className="text-xl font-bold mb-6">📦 Included Marketing Assets ({allContent.length})</h2>

            {socialPosts.length > 0 && (
              <div className="mb-6">
                <h3 className="font-bold text-gray-800 mb-3">📸 Social Media Posts ({socialPosts.length})</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {socialPosts.slice(0, 4).map((item) => (
                    <div key={item.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <h4 className="font-semibold text-sm text-gray-800 mb-1">{item.title}</h4>
                      <p className="text-xs text-gray-600 line-clamp-2">{item.body}</p>
                    </div>
                  ))}
                  {socialPosts.length > 4 && (
                    <div className="bg-gray-50 rounded-xl p-4 border border-dashed border-gray-200 flex items-center justify-center text-sm text-gray-400">
                      + {socialPosts.length - 4} more posts
                    </div>
                  )}
                </div>
              </div>
            )}

            {googlePosts.length > 0 && (
              <div className="mb-6">
                <h3 className="font-bold text-gray-800 mb-3">📍 Google Business Posts ({googlePosts.length})</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {googlePosts.map((item) => (
                    <div key={item.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <h4 className="font-semibold text-sm text-gray-800 mb-1">{item.title}</h4>
                      <p className="text-xs text-gray-600 line-clamp-2">{item.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {emails.length > 0 && (
              <div className="mb-6">
                <h3 className="font-bold text-gray-800 mb-3">✉️ Email Campaigns ({emails.length})</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {emails.map((item) => (
                    <div key={item.id} className="bg-brand-50 rounded-xl p-4 border border-brand-100">
                      <h4 className="font-semibold text-sm text-brand-800 mb-1">{item.title}</h4>
                      <p className="text-xs text-brand-700 line-clamp-2">{item.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {reviews.length > 0 && (
              <div className="mb-6">
                <h3 className="font-bold text-gray-800 mb-3">⭐ Review Reply Templates ({reviews.length})</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {reviews.map((item) => (
                    <div key={item.id} className="bg-yellow-50 rounded-xl p-4 border border-yellow-100">
                      <h4 className="font-semibold text-sm text-yellow-800 mb-1">{item.title}</h4>
                      <p className="text-xs text-yellow-700 line-clamp-2">{item.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* CTA */}
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">Need help implementing your playbook?</p>
          <Link to="/dashboard"
            className="inline-block bg-brand-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-brand-700 transition shadow-lg">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}