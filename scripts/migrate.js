import { readFileSync } from 'node:fs';
import postgres from 'postgres';

const url = process.env.DATABASE_URL;
if (!url) throw new Error('Set DATABASE_URL first');
const sql = postgres(url, { max: 1, prepare: false });
for (const file of ['db/schema.sql', 'db/seed.sql']) {
  const statements = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8').split(/;\s*\n/).map((s) => s.trim()).filter(Boolean);
  for (const s of statements) await sql.unsafe(s);
  console.log('applied', file);
}
const rows = await sql.unsafe('select count(*)::int as n from designers');
console.log('designers:', rows[0].n);
await sql.end();
