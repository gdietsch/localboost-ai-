import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import AuditForm from './pages/AuditForm';
import AuditPreview from './pages/AuditPreview';
import AuditResult from './pages/AuditResult';
import Dashboard from './pages/Dashboard';
import StripeCheckout from './pages/StripeCheckout';
import ClaimPage from './pages/ClaimPage';
import MyAudit from './pages/MyAudit';
import Subscribe from './pages/Subscribe';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/audit/new" element={<AuditForm />} />
          <Route path="/audit/preview/:id" element={<AuditPreview />} />
          <Route path="/audit/:id" element={<AuditResult />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/checkout" element={<StripeCheckout />} />
          <Route path="/checkout/:type" element={<StripeCheckout />} />
          <Route path="/claim" element={<ClaimPage />} />
          <Route path="/my-audit" element={<MyAudit />} />
          <Route path="/subscribe" element={<Subscribe />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
        </Routes>
      </main>
      <footer className="bg-gray-100 border-t py-8 text-center text-sm text-gray-500">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-center gap-6 mb-3">
            <Link to="/privacy" className="hover:text-gray-700 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-gray-700 transition-colors">Terms of Service</Link>
            <a href="https://buy.stripe.com/28EfZh6yHgNRg3MaFd5ZC01" target="_blank" rel="noopener noreferrer" className="hover:text-gray-700 transition-colors">Buy Audit</a>
          </div>
          <p>&copy; {new Date().getFullYear()} LocalBoost AI. AI-powered marketing for local service businesses.</p>
        </div>
      </footer>
    </div>
  );
}