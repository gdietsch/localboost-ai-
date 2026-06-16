/**
 * Database helper using team-db CLI.
 * All database operations go through this module.
 */
import { execSync } from 'child_process';

function db(query) {
  try {
    const result = execSync(`team-db "${query.replace(/"/g, '\\"')}"`, {
      encoding: 'utf-8',
      timeout: 10000,
    });
    return JSON.parse(result.trim());
  } catch (err) {
    console.error('Database error:', err.message);
    throw new Error(`Database query failed: ${err.message}`);
  }
}

export function query(sql) {
  return db(sql);
}

export function execute(sql) {
  return db(sql);
}

export default { query, execute };