import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();

  function scrollToPricing(e) {
    e.preventDefault();
    if (location.pathname === '/') {
      // Already on landing page, just scroll
      const el = document.getElementById('pricing');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      // Navigate to landing page with pricing hash
      window.location.href = '/#pricing';
    }
  }

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-brand-600">LocalBoost</span>
            <span className="text-sm bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full font-medium">AI</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="text-sm font-medium text-gray-600 hover:text-brand-600 transition">
              Dashboard
            </Link>
            <a
              href="#pricing"
              onClick={scrollToPricing}
              className="text-sm font-medium text-gray-600 hover:text-brand-600 transition cursor-pointer"
            >
              Pricing
            </a>
            <Link
              to="/audit/new"
              className="bg-brand-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition shadow-sm"
            >
              Start Free Audit
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}