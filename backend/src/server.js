import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import auditRoutes from './routes/audit.js';
import businessRoutes from './routes/business.js';
import stripeRoutes from './routes/payments.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());

// Stripe webhook needs raw body — mount BEFORE json parser
app.use('/api/stripe', stripeRoutes);

// JSON parser for all other routes
app.use(express.json());

// API routes
app.use('/api/audits', auditRoutes);
app.use('/api/businesses', businessRoutes);

// Serve static frontend files
const frontendDist = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendDist));

// SPA fallback - serve index.html for all non-API routes
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(frontendDist, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`LocalBoost AI server running on http://0.0.0.0:${PORT}`);
});