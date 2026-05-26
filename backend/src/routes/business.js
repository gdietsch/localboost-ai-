import { Router } from 'express';
import { query } from '../models/db.js';

const router = Router();

const safe = (s) => `'${String(s).replace(/'/g, "''")}'`;

// GET /api/businesses?email=xxx - Get businesses by email
router.get('/', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ error: 'Email parameter is required' });
    }

    const businesses = query(
      `SELECT b.id, b.name, b.website, b.category, b.email, b.created_at,
              (SELECT COUNT(*) FROM audits a WHERE a.business_id = b.id) as audit_count
       FROM businesses b
       WHERE b.email = ${safe(email)}
       ORDER BY b.created_at DESC`
    );

    if (!businesses || businesses.length === 0) {
      return res.json([]);
    }

    // Get audits for each business
    const result = [];
    for (const biz of businesses) {
      const audits = query(
        `SELECT id, status, created_at FROM audits WHERE business_id = ${safe(biz.id)} ORDER BY created_at DESC`
      );
      result.push({ ...biz, audits: audits || [] });
    }

    res.json(result);
  } catch (err) {
    console.error('Error fetching businesses:', err);
    res.status(500).json({ error: 'Failed to fetch businesses' });
  }
});

export default router;
