import { useRef, useState } from 'react';
import { toPng } from 'html-to-image';

function getGradeColor(grade) {
  const colors = {
    'A': { bg: 'from-green-500 to-emerald-600', text: 'text-green-700', light: 'bg-green-50 border-green-200' },
    'B': { bg: 'from-blue-500 to-blue-600', text: 'text-blue-700', light: 'bg-blue-50 border-blue-200' },
    'C': { bg: 'from-yellow-500 to-amber-600', text: 'text-yellow-700', light: 'bg-yellow-50 border-yellow-200' },
    'D': { bg: 'from-orange-500 to-red-500', text: 'text-orange-700', light: 'bg-orange-50 border-orange-200' },
    'F': { bg: 'from-red-500 to-red-700', text: 'text-red-700', light: 'bg-red-50 border-red-200' },
  };
  return colors[grade] || colors.F;
}

export default function ShareCard({ businessName, grade, score, monthlyLoss, findingsCount, website }) {
  const cardRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  const colors = getGradeColor(grade);
  const gradeLabel = grade === 'A' ? 'EXCELLENT' : grade === 'B' ? 'GOOD' : grade === 'C' ? 'AVERAGE' : grade === 'D' ? 'POOR' : 'CRITICAL';

  async function handleDownload() {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, { quality: 0.95, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `${businessName.replace(/\s+/g, '-')}-audit-score.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.warn('Could not generate image:', err);
    }
    setDownloading(false);
  }

  async function handleShare() {
    const text = `🔍 I just audited ${businessName}'s website!\n\n📊 Overall Score: ${score}/100 — Grade: ${grade} (${gradeLabel})\n💰 Estimated monthly revenue loss: ~$${monthlyLoss?.toLocaleString() || '0'}\n🔧 ${findingsCount} specific issues found\n\nGet your FREE website audit at localboosts.biz!`;

    if (navigator.share) {
      try {
        await navigator.share({ title: `${businessName} Website Audit`, text });
        return;
      } catch (e) {}
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      // Final fallback: select text manually
      prompt('Copy this share text:', text);
    }
  }

  return (
    <div className="mb-8">
      <div className="flex justify-end gap-2 mb-3">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition disabled:opacity-50 flex items-center gap-2"
        >
          {downloading ? '⏳ Generating...' : '📸 Download Image'}
        </button>
        <button
          onClick={handleShare}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 transition flex items-center gap-2"
        >
          {copied ? '✅ Copied!' : '📤 Share Score'}
        </button>
      </div>

      {/* The Shareable Card */}
      <div
        ref={cardRef}
        className="relative overflow-hidden rounded-2xl shadow-2xl border"
        style={{
          background: 'white',
          width: '600px',
          maxWidth: '100%',
        }}
      >
        {/* Top gradient bar */}
        <div className={`h-3 bg-gradient-to-r ${colors.bg}`} />

        <div className="p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-1">Website Audit Report</p>
              <h2 className="text-2xl font-bold text-gray-900">{businessName}</h2>
              {website && <p className="text-sm text-gray-400 mt-0.5">{website}</p>}
            </div>
            <div className="text-right">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${colors.bg} flex items-center justify-center shadow-lg`}>
                <span className="text-4xl font-black text-white">{grade}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1 font-semibold">{gradeLabel}</p>
            </div>
          </div>

          {/* Big Score Number */}
          <div className="text-center mb-6">
            <div className="text-6xl font-black text-gray-800">{score}<span className="text-3xl text-gray-400">/100</span></div>
            <p className="text-sm text-gray-500 mt-1">Overall Website Health Score</p>
          </div>

          {/* Revenue Loss - The Viral Hook */}
          <div className={`rounded-xl ${colors.light} p-5 mb-6 text-center`}>
            <p className="text-sm uppercase tracking-wider font-semibold text-gray-500 mb-1">Estimated Monthly Revenue Loss</p>
            <p className={`text-5xl font-black ${colors.text}`}>
              ${monthlyLoss?.toLocaleString() || '0'}
              <span className="text-xl font-semibold">/mo</span>
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {findingsCount} specific issues found that are costing you money
            </p>
          </div>

          {/* Issues List Preview */}
          <div className="space-y-2 mb-6">
            <div className="flex items-center gap-2 text-sm">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-gray-600">SSL / Security Check</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="w-2 h-2 rounded-full bg-yellow-500" />
              <span className="text-gray-600">Page Speed & Mobile Performance</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-gray-600">SEO Meta Tags & Content</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="w-2 h-2 rounded-full bg-yellow-500" />
              <span className="text-gray-600">Google Business Profile</span>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center border-t border-gray-100 pt-5">
            <p className="text-sm font-semibold text-gray-700 mb-1">
              Get your FREE audit at <span className="text-brand-600">localboosts.biz</span>
            </p>
            <p className="text-xs text-gray-400">See exactly what's costing you money and how to fix it</p>
          </div>
        </div>

        {/* Bottom watermark bar */}
        <div className="bg-gray-50 px-8 py-2 border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center">Generated by LocalBoost AI · localboosts.biz</p>
        </div>
      </div>
    </div>
  );
}