import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import AuditForm from './pages/AuditForm';
import AuditPreview from './pages/AuditPreview';
import AuditResult from './pages/AuditResult';
import Dashboard from './pages/Dashboard';
import StripeCheckout from './pages/StripeCheckout';

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
        </Routes>
      </main>
      <footer className="bg-gray-100 border-t py-6 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} LocalBoost AI. AI-powered marketing for local service businesses.
      </footer>
    </div>
  );
}