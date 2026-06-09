import { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';

const sampleItems = [
  { type: 'score', title: 'Website Health', score: 52, grade: 'F', detail: 'Missing meta description, slow load time, no clear CTA' },
  { type: 'score', title: 'Google Business Profile', score: 38, grade: 'F', detail: 'Profile incomplete — missing hours, photos, and categories' },
  { type: 'score', title: 'Competitor Position', score: 45, grade: 'F', detail: 'Competitors outrank you on local search terms' },
  { type: 'score', title: 'Revenue Opportunity', score: 68, grade: 'D', detail: 'Estimated ~$2,400/month in missed revenue' },
];

const categoryIcons = {
  'Website Health': '🚀',
  'Google Business Profile': '📍',
  'Competitor Position': '📊',
  'Revenue Opportunity': '💰',
};

export default function AuditPreview() {
  const { id } = useParams();
  const location = useLocation();
  const businessName = location.state?.businessName || 'Your Business';

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <div className="inline-block bg-green-100 text-green-700 px-4 py-1 rounded-full text-sm font-medium mb-4">🆓 Free Preview</div>
        <h1 className="text-3xl font-bold mb-2">Your Free Analysis Preview</h1>
        <p className="text-gray-500">for <strong>{businessName}</strong></p>
      </div>

      {/* Score badges teaser */}
      <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-8 mb-8">
        <p className="text-lg font-semibold text-amber-800 mb-1">🔒 Full analysis locked</p>
        <p className="text-amber-600 mb-6">Here's a preview of your scores. Unlock the full report to see detailed findings, competitor comparisons, and your revenue opportunity.</p>
        <Link to={`/checkout/audit?business_id=${id}`}
          className="inline-block bg-brand-600 text-white px-8 py-3.5 rounded-xl font-bold text-lg hover:bg-brand-700 transition shadow-lg">
          Unlock Full Analysis — $49
        </Link>
      </div>

      {/* Score cards */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        {sampleItems.map((item) => (
          <div key={item.title} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-700">{categoryIcons[item.title]} {item.title}</span>
              <span className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                item.grade === 'F' ? 'bg-red-100 text-red-700' :
                item.grade === 'D' ? 'bg-orange-100 text-orange-700' : ''
              }`}>{item.grade}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div className={`h-2 rounded-full ${item.score < 40 ? 'bg-red-500' : item.score < 60 ? 'bg-orange-500' : 'bg-yellow-500'}`}
                style={{ width: `${item.score}%` }} />
            </div>
            <p className="text-xs text-gray-500">{item.detail}</p>
          </div>
        ))}
      </div>

      <div className="text-center">
        <p className="text-gray-500 mb-4 text-sm">+ Full competitor comparison, 30-day action plan, and detailed findings for each category</p>
        <Link to={`/checkout/audit?business_id=${id}`}
          className="inline-block bg-brand-600 text-white px-8 py-3.5 rounded-xl font-bold text-lg hover:bg-brand-700 transition shadow-lg">
          Unlock Full Analysis — $49
        </Link>
      </div>
    </div>
  );
}