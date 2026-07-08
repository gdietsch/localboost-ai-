import { useParams, useLocation, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

const gradeColor = (g) => g === 'A' || g === 'B' ? 'text-green-400' : g === 'C' ? 'text-yellow-400' : 'text-red-400';
const gradeBg = (g) => g === 'A' || g === 'B' ? 'bg-green-500' : g === 'C' ? 'bg-yellow-500' : 'bg-red-500';

export default function AuditPreview() {
  const { id } = useParams();
  const location = useLocation();
  const bizName = location.state?.businessName || 'Your Business';
  const category = location.state?.category || 'Home Cleaners';
  const real = location.state?.realResults || null;
  const [loading, setLoading] = useState(!real);
  const [results, setResults] = useState(real);

  useEffect(() => {
    if (real) { setLoading(false); return; }
    async function fetchAudit() {
      try {
        const res = await fetch(`/api/audits/${id}`);
        if (res.ok) {
          const d = await res.json();
          if (d?.findings?.length) setResults(d);
        }
      } catch(e) {}
      setLoading(false);
    }
    fetchAudit();
  }, [id]);

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-20 text-center"><div className="text-4xl mb-4 animate-pulse">🔍</div><p className="text-gray-500">Analyzing your website...</p></div>;

  const findings = results?.findings || [];
  const scores = results?.scores || {};
  const overall = results?.overall || 0;
  const grade = results?.grade || 'N/A';
  const revenue = results?.revenueEstimate || {};
  const hasData = !!(results?.success || findings.length > 0);
  const high = findings.filter(f => f.severity === 'high');
  const medium = findings.filter(f => f.severity === 'medium');

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Hero */}
      <div className="text-center mb-8">
        <div className="inline-block bg-red-100 text-red-700 px-4 py-1 rounded-full text-sm font-medium mb-4">
          {hasData ? '📊 Real Analysis Results' : '⚠️ Estimated Preview'}
        </div>
        <h1 className="text-3xl font-bold mb-1">{bizName}</h1>
        <p className="text-gray-500 mb-6">{category}</p>

        <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-2xl p-8 mb-4 shadow-lg">
          {hasData ? (
            <>
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="text-center">
                  <p className="text-xs text-gray-400 uppercase">Grade</p>
                  <p className={`text-6xl font-black ${gradeColor(grade)}`}>{grade}</p>
                </div>
                <div className="text-left">
                  <p className="text-xs text-gray-400 uppercase">Score</p>
                  <p className="text-4xl font-bold">{overall}<span className="text-lg text-gray-400">/100</span></p>
                  <div className="w-40 bg-gray-700 rounded-full h-2 mt-2">
                    <div className={`h-2 rounded-full ${gradeBg(grade)}`} style={{ width: `${overall}%` }} />
                  </div>
                </div>
              </div>
              {revenue.summary && <div className="bg-white/10 rounded-xl p-4 mt-4"><p className="text-sm text-gray-300">{revenue.summary}</p></div>}
            </>
          ) : (
            <>
              <p className="text-4xl font-bold mb-2">No real data yet</p>
              <p className="text-gray-400">Run the free audit to see your actual scores.</p>
            </>
          )}
        </div>

        <a href="https://buy.stripe.com/28EfZh6yHgNRg3MaFd5ZC01" target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-brand-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-brand-700 hover:-translate-y-0.5 transition-all shadow-xl">
          🔓 Unlock Full Fix Plan — $49 →
        </a>
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
          After paying, claim your report at <a href="/claim" className="text-blue-700 underline font-medium">localboosts.biz/claim</a>
        </div>
      </div>

      {/* Scores */}
      {Object.keys(scores).length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {Object.entries(scores).map(([key, val]) => (
            <div key={key} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-700">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${val < 50 ? 'bg-red-100 text-red-700' : val < 70 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>{val}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className={`h-2 rounded-full ${val < 50 ? 'bg-red-500' : val < 70 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${val}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Findings */}
      {high.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">🔴 Critical Issues Found</h2>
          <div className="space-y-3">
            {high.map((f, i) => (
              <div key={i} className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                <span className="text-red-500 text-xl shrink-0 mt-0.5">🔴</span>
                <div>
                  <p className="font-semibold text-red-800">{f.issue}</p>
                  <p className="text-sm text-red-700 mt-1">{f.impact}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {medium.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">⚠️ Needs Improvement</h2>
          <div className="space-y-3">
            {medium.map((f, i) => (
              <div key={i} className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
                <span className="text-yellow-500 text-xl shrink-0 mt-0.5">⚠️</span>
                <div>
                  <p className="font-semibold text-yellow-800">{f.issue}</p>
                  <p className="text-sm text-yellow-700 mt-1">{f.impact}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-800 rounded-2xl p-8 text-white text-center shadow-lg">
        <p className="text-3xl font-bold mb-3">⏱️ Your Full Report is Ready</p>
        <p className="text-brand-100 mb-6 max-w-lg mx-auto">
          {findings.length > 0
            ? `We found ${findings.length} issues affecting your revenue. The full fix plan has step-by-step instructions for each one.`
            : 'Enter your website above to see what\'s holding you back.'}
        </p>
        <a href="https://buy.stripe.com/28EfZh6yHgNRg3MaFd5ZC01" target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-white text-brand-700 px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 hover:-translate-y-0.5 transition-all shadow-xl">
          Unlock Full Analysis — $49 →
        </a>
        <p className="text-sm text-brand-200 mt-4">🔒 Secure checkout via Stripe</p>
      </div>
    </div>
  );
}