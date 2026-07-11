import React from 'react';
import { Link } from 'react-router-dom';

const blogPosts = [
  {
    id: 1,
    title: "The Complete Marketing Checklist for Cleaning Businesses in 2026",
    excerpt: "Everything you need to dominate your local market, book more clients, and scale your cleaning business this year.",
    author: "LocalBoost AI Team",
    date: "July 11, 2026",
    slug: "cleaning-marketing-checklist",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6958?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 2,
    title: "5 Marketing Mistakes Costing Your Cleaning Business Thousands (And How to Fix Them)",
    excerpt: "Are you making these common digital marketing mistakes? Learn how to identify and plug the leaks in your marketing funnel.",
    author: "LocalBoost AI Team",
    date: "July 11, 2026",
    slug: "cleaning-marketing-mistakes",
    image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800",
  },
];

export default function Blog() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <section className="bg-gray-900 py-20 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Link to="/" className="text-brand-400 text-sm mb-4 inline-block hover:underline">← Back to Home</Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">LocalBoost AI Blog</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Actionable marketing advice for local service businesses. No fluff, just growth.
          </p>
        </div>
      </section>

      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <div key={post.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <img src={post.image} alt={post.title} className="w-full h-48 object-cover" />
              <div className="p-6">
                <p className="text-sm text-brand-600 font-semibold mb-2">{post.date}</p>
                <h2 className="text-xl font-bold mb-3 hover:text-brand-600 transition-colors">
                  <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                </h2>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">By {post.author}</span>
                  <Link to={`/blog/${post.slug}`} className="text-brand-600 font-bold text-sm hover:underline">
                    Read More →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Blog CTA */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-brand-50 rounded-3xl p-8 md:p-12 border border-brand-100">
            <h2 className="text-3xl font-bold mb-4">Want more growth tips?</h2>
            <p className="text-gray-600 mb-8">
              We send out weekly actionable marketing strategies specifically for local service businesses.
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
              />
              <button type="submit" className="bg-brand-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-700 transition-colors">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
