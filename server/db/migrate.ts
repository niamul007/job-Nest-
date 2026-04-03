import {pool} from '../src/config/db';
import fs from 'node:fs/promises';
import path from 'node:path';

async function runMigrations() {
  try {
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = await fs.readdir(migrationsDir);
    const sqlFiles = files.filter(file => file.endsWith('.sql')).sort();
    for (const file of sqlFiles) {
      const filePath = path.join(migrationsDir, file);
      const sql = await fs.readFile(filePath, 'utf-8');
      console.log(`Running migration: ${file}`);
      await pool.query(sql);
    }
    console.log('All migrations ran successfully');
  } catch (err) {
    console.error('Error running migrations:', err);
  } finally {
    await pool.end();
  } 
}

runMigrations();

