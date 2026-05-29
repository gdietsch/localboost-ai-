/**
 * Database helper for Vercel deployment using @libsql/client.
 * Replaces team-db CLI calls with direct Turso HTTP connection.
 */
const { createClient } = require('@libsql/client');

const db = createClient({
  url: process.env.TEAM_DB_URL || 'libsql://agent-team-b739afa0-cto.aws-us-west-2.turso.io',
  authToken: process.env.TEAM_DB_AUTH_TOKEN || '',
});

/**
 * Execute a SQL query and return the rows as an array.
 * @param {string} sql - SQL statement to execute
 * @returns {Array<Object>} Array of result rows
 */
async function query(sql) {
  try {
    const result = await db.execute(sql);
    // Convert @libsql/client rows to plain objects
    if (!result.rows || result.rows.length === 0) return [];
    return result.rows.map(row => {
      const obj = {};
      result.columns.forEach((col, i) => {
        obj[col] = row[i];
      });
      return obj;
    });
  } catch (err) {
    console.error('Database error:', err.message);
    throw new Error(`Database query failed: ${err.message}`);
  }
}

/**
 * Execute a write query (INSERT, UPDATE, DELETE) with no return value.
 */
async function execute(sql) {
  try {
    await db.execute(sql);
    return true;
  } catch (err) {
    console.error('Database error:', err.message);
    throw new Error(`Database execute failed: ${err.message}`);
  }
}

module.exports = { query, execute };
