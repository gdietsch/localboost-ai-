import React from 'react';
import { Link } from 'react-router-dom';

export default function BlogPost2() {
  return (
    <div className="bg-white min-h-screen">
      {/* Header / Hero */}
      <section className="bg-gray-900 py-20 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Link to="/blog" className="text-brand-400 font-semibold mb-4 inline-block hover:underline">← Back to Blog</Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">5 Marketing Mistakes Costing Your Cleaning Business Thousands (And How to Fix Them)</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            In 2026, the cleaning industry is more competitive than ever. Are you making these common digital marketing mistakes?
          </p>
        </div>
      </section>

      {/* Content */}
      <article className="max-w-4xl mx-auto px-4 py-16 prose prose-lg prose-brand">
        <p className="lead text-xl text-gray-600 mb-12">
          If your phone isn't ringing as often as you'd like, or if your website traffic isn't converting into booked appointments, you likely have "marketing leaks." These are hidden flaws in your digital presence that drive potential customers straight into the arms of your competitors.
        </p>

        <h2 className="text-3xl font-bold mt-12 mb-6">1. Your Website is a "Digital Paperweight" (Speed Matters)</h2>
        <p>
          Most cleaning business owners treat their website like a static brochure. But if your site takes more than 3 seconds to load on a mobile device, 53% of users will abandon it. 
        </p>
        <p>
          Google also uses page speed as a primary ranking factor for local search. A slow site doesn't just frustrate users; it makes you invisible to Google.
        </p>
        <div className="bg-amber-50 p-6 rounded-xl border border-amber-200 my-8">
          <p className="font-bold text-amber-900 mb-2">The Fix:</p>
          <p className="text-amber-800 m-0">Use a tool like PageSpeed Insights to check your mobile performance. Often, the culprit is uncompressed high-resolution images or too many heavy plugins.</p>
        </div>

        <h2 className="text-3xl font-bold mt-12 mb-6">2. You’re Invisible in the "Local 3-Pack"</h2>
        <p>
          When someone searches for "house cleaning near me," Google shows three businesses at the top of the results next to a map. This is the <strong>Local 3-Pack</strong>. If you aren't in those top three spots, you're missing out on 70% of local search clicks.
        </p>
        <div className="bg-amber-50 p-6 rounded-xl border border-amber-200 my-8">
          <p className="font-bold text-amber-900 mb-2">The Fix:</p>
          <p className="text-amber-800 m-0">Optimize your Google Business Profile (GBP). Ensure your name, address, and phone number (NAP) are consistent across the web. Post updates to your GBP at least once a week—Google rewards active profiles.</p>
        </div>

        <h2 className="text-3xl font-bold mt-12 mb-6">3. You Lack "Social Proof" (Reviews are the New Gold)</h2>
        <p>
          A customer is 90% more likely to book a service after reading a positive review. If you have 5 reviews and your competitor has 50, the competitor wins every time—even if they charge more.
        </p>
        <div className="bg-amber-50 p-6 rounded-xl border border-amber-200 my-8">
          <p className="font-bold text-amber-900 mb-2">The Fix:</p>
          <p className="text-amber-800 m-0">Automate your review collection. Send a text or email immediately after every cleaning job. Don't just wait for reviews to happen; make them part of your standard operating procedure.</p>
        </div>

        <h2 className="text-3xl font-bold mt-12 mb-6">4. Generic Content That Doesn’t Build Authority</h2>
        <p>
          Posting "We clean houses!" on Facebook once a month isn't enough. Customers want to know <em>why</em> they should trust you inside their homes. They want to see the people behind the business and understand your expertise.
        </p>
        <div className="bg-amber-50 p-6 rounded-xl border border-amber-200 my-8">
          <p className="font-bold text-amber-900 mb-2">The Fix:</p>
          <p className="text-amber-800 m-0">Share educational content. Explain the difference between HEPA filtration and standard vacuuming. Show "Before and After" transformations. Introduce your staff. Position yourself as the local expert, not just another cleaner.</p>
        </div>

        <h2 className="text-3xl font-bold mt-12 mb-6">5. There’s No Clear Path to "Book Now"</h2>
        <p>
          If a potential customer has to search your site for more than 5 seconds to find how to contact you or book a slot, you've lost them. 
        </p>
        <div className="bg-amber-50 p-6 rounded-xl border border-amber-200 my-8">
          <p className="font-bold text-amber-900 mb-2">The Fix:</p>
          <p className="text-amber-800 m-0">Your "Book Now" or "Get a Quote" button should be prominent, contrasting in color, and visible on every page. Make it as easy as possible for someone to give you their money.</p>
        </div>

        <hr className="my-16 border-gray-200" />

        <h3 className="text-2xl font-bold mb-6">How Healthy is Your Cleaning Business Marketing?</h3>
        <p>
          Identifying these mistakes is the first step. Fixing them is where the growth happens. 
        </p>
        <p>
          Most business owners don't have the time to manually audit every technical SEO factor or monitor their competitor's rankings daily. That's why we built the <strong>LocalBoost AI Audit</strong>.
        </p>

        {/* CTA Section */}
        <div className="mt-12 p-8 md:p-12 bg-gray-900 rounded-3xl text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-brand-500/10" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Stop Leaking Revenue</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              For just $49, our AI scans your website, your GBP, and your competitors to find exactly what’s holding you back. 
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/audit/new"
                className="bg-brand-500 hover:bg-brand-400 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-xl"
              >
                Get Your $49 Audit Now →
              </Link>
            </div>
            <ul className="mt-8 text-gray-400 text-sm flex flex-wrap justify-center gap-x-6 gap-y-2 list-none p-0">
              <li>✓ Technical SEO Score</li>
              <li>✓ Step-by-Step Fixes</li>
              <li>✓ 28 Content Pieces</li>
              <li>✓ 30-Day Action Plan</li>
            </ul>
          </div>
        </div>
      </article>
    </div>
  );
}
