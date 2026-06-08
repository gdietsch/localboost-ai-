import { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';

const sampleItems = [
  { type: 'task', title: 'Week 1: Optimize Your Google Business Profile', body: 'Update your business hours, add photos, select the right categories, and write a compelling description. This is the #1 thing that drives local leads.' },
  { type: 'social_post', title: 'Pro Tip Post', body: '💡 Pro Tip!\n\nDid you know? [Insert helpful industry tip]\n\nSave this for later and tag a friend who needs to know! 👇\n\n#LocalBusiness #ProTips' },
  { type: 'google_post', title: 'Welcome Post (sample)', body: 'Welcome to [Business Name]! We\'re proud to serve our local community with top-quality services. Contact us today to learn more!' },
  { type: 'review_reply', title: '5-Star Review Reply (sample)', body: 'Thank you so much for your kind words! We\'re thrilled to hear you had a great experience. Your satisfaction is our top priority.' },
];

export default function AuditPreview() {
  const { id } = useParams();
  const location = useLocation();
  const businessName = location.state?.businessName || 'Your Business';
  const category = location.state?.category || 'Service Business';

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="text-center mb-10">
        <div className="inline-block bg-green-100 text-green-700 px-4 py-1 rounded-full text-sm font-medium mb-4">
          🆓 Free Preview
        </div>
        <h1 className="text-3xl font-bold mb-2">Your Free Audit Preview</h1>
        <p className="text-gray-500">for <strong>{businessName}</strong> · {category}</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 mb-10 text-center">
        <p className="text-lg font-semibold text-amber-800 mb-2">
          🔒 You're viewing a free preview (4 of 28 items)
        </p>
        <p className="text-amber-600 mb-6">
          Unlock the full audit to get your complete 30-day marketing plan, 12 social media posts,
          4 Google Business posts, 2 email campaigns, and 5 review reply templates.
        </p>
        <Link
          to={`/checkout/audit?business_id=${id}`}
          className="inline-block bg-brand-600 text-white px-8 py-3.5 rounded-xl font-bold text-lg hover:bg-brand-700 transition shadow-lg"
        >
          Unlock Full Audit — $49
        </Link>
      </div>

      <div className="space-y-4 mb-10">
        {sampleItems.map((item, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-gray-800">{item.title}</h3>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                {item.type === 'task' ? '📋 Task' : item.type === 'social_post' ? '📱 Social' : item.type === 'google_post' ? '🔍 Google' : '⭐ Review'}
              </span>
            </div>
            <div className="text-gray-600 text-sm whitespace-pre-wrap">{item.body}</div>
          </div>
        ))}
      </div>

      <div className="text-center bg-gray-50 rounded-2xl border border-dashed border-gray-300 p-8">
        <p className="text-gray-500 mb-4">
          + 24 more items including a complete 30-day plan, 11 more social posts,
          3 more Google posts, 2 email drafts, and 4 more review templates
        </p>
        <Link
          to={`/checkout/audit?business_id=${id}`}
          className="inline-block bg-brand-600 text-white px-8 py-3.5 rounded-xl font-bold text-lg hover:bg-brand-700 transition shadow-lg"
        >
          Unlock Full Audit — $49
        </Link>
      </div>
    </div>
  );
}