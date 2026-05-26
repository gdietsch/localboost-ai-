# LocalBoost AI

AI-powered marketing employee for local service businesses.

## Project Structure

```
localboost-app/
├── backend/              # Express API server (Node.js)
│   └── src/
│       ├── server.js     # Server entry point
│       ├── models/
│       │   └── db.js     # team-db wrapper
│       └── routes/
│           ├── audit.js  # Audit CRUD + generation API
│           └── business.js  # Business lookup API
├── frontend/             # React SPA (Vite + Tailwind)
│   └── src/
│       ├── App.jsx       # Main app with routing
│       ├── pages/
│       │   ├── LandingPage.jsx  # Marketing landing page
│       │   ├── AuditForm.jsx    # Audit request form
│       │   ├── AuditResult.jsx  # Audit results display
│       │   └── Dashboard.jsx    # User dashboard
│       └── components/
│           └── Navbar.jsx
├── .gitignore
└── README.md
```

## Setup

```bash
# Install dependencies
cd backend && npm install
cd frontend && npm install

# Build frontend
cd frontend && npm run build

# Start server
cd backend && npm start
```

The server serves the frontend as static files on port 3001.

## Database

Tables (via team-db shared SQLite):
- `businesses` — id, name, website, category, email, created_at
- `audits` — id, business_id, status, created_at
- `content_items` — id, audit_id, type, title, body, status

## Pricing

- **One-Time Audit**: $49 — website scan, competitor analysis, 30-day marketing plan
- **Monthly Subscription**: $149/month — weekly automated content, reviews, lead follow-up, reports
