import { Link } from 'react-router-dom';

export default function Privacy() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link to="/" className="text-brand-600 text-sm mb-6 inline-block">← Back to Home</Link>
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="text-sm text-gray-500 mb-8">Last updated: July 9, 2026</p>

      <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
        <h2 className="text-xl font-semibold text-gray-900">1. Information We Collect</h2>
        <p>When you use LocalBoost AI, we collect:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Business information:</strong> Business name, website URL, email address, and service category you provide when requesting an audit.</li>
          <li><strong>Payment data:</strong> When you purchase an audit, payment is processed by Stripe. We do not store credit card numbers. Stripe may share your name, email, and billing address with us.</li>
          <li><strong>Website data:</strong> When you enter a URL for analysis, we scan publicly available information about that website (page speed, SEO metadata, SSL status, etc.).</li>
          <li><strong>Analytics:</strong> Basic usage data such as page views and referral sources.</li>
        </ul>

        <h2 className="text-xl font-semibold text-gray-900">2. How We Use Your Information</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Generate your marketing audit and deliver it to your email</li>
          <li>Send follow-up reminders about unfinished audits</li>
          <li>Improve our analysis engine and service quality</li>
          <li>Communicate with you about your account or purchases</li>
        </ul>

        <h2 className="text-xl font-semibold text-gray-900">3. Data Sharing</h2>
        <p>We do not sell your personal information. We share data only with trusted service providers who help us operate (Stripe for payments, Plunk for email delivery, Vercel for hosting). These providers are contractually bound to protect your data.</p>

        <h2 className="text-xl font-semibold text-gray-900">4. Data Retention</h2>
        <p>We retain your audit data and business information for as long as your account is active. You may request deletion of your data at any time by emailing hello@localboosts.biz.</p>

        <h2 className="text-xl font-semibold text-gray-900">5. Your Rights</h2>
        <p>You have the right to access, correct, or delete your personal data. To exercise these rights, contact us at hello@localboosts.biz. We will respond within 30 days.</p>

        <h2 className="text-xl font-semibold text-gray-900">6. Cookies</h2>
        <p>We use minimal cookies essential for site functionality (session management). We do not use tracking cookies or third-party ad cookies.</p>

        <h2 className="text-xl font-semibold text-gray-900">7. Security</h2>
        <p>We implement industry-standard security measures including SSL encryption, secure payment processing via Stripe, and restricted access to personal data.</p>

        <h2 className="text-xl font-semibold text-gray-900">8. Contact</h2>
        <p>For privacy questions or data requests, email hello@localboosts.biz.</p>
      </div>
    </div>
  );
}