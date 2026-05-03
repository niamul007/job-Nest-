import { pool } from '../src/config/db';
import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * Database migration runner.
 * Reads all .sql files from /db/migrations/ in alphabetical order
 * and executes them against PostgreSQL.
 *
 * Files must be named with numeric prefixes to ensure correct order:
 *   001_create_users.sql
 *   002_create_companies.sql
 *   003_create_jobs.sql
 *   004_create_applications.sql
 *
 * Order matters — tables with foreign keys must be created after
 * the tables they reference (users before companies, companies before jobs).
 *
 * Run with: npm run migrate
 */
async function runMigrations() {
  try {
    const migrationsDir = path.join(__dirname, 'migrations');

    // Read all files in migrations folder
    const files = await fs.readdir(migrationsDir);

    // Filter .sql files only and sort alphabetically
    // Sorting ensures tables are created in correct dependency order
    const sqlFiles = files.filter(file => file.endsWith('.sql')).sort();

    // Run each migration file in order
    for (const file of sqlFiles) {
      const filePath = path.join(migrationsDir, file);
      const sql = await fs.readFile(filePath, 'utf-8'); // read SQL as string
      console.log(`Running migration: ${file}`);
      await pool.query(sql); // execute against PostgreSQL
    }

    console.log('✅ All migrations ran successfully');

  } catch (err) {
    console.error('❌ Error running migrations:', err);

  } finally {
    // Always close the pool — prevents Node.js process from hanging
    // Runs whether migrations succeeded or failed
    await pool.end();
  }
}

runMigrations();