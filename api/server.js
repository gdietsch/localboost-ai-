/**
 * Minimal Vercel serverless entry point for LocalBoost AI API.
 */
const express = require('express');
const app = express();
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = app;