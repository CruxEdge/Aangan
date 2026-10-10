// Class demo only: sets every login's password to 1234567890 straight in the database, bypassing the password rule.
// It is deliberately weak. Record and rotate before any real use: `node scripts/users.js reset <username>`.
import { writeFileSync } from 'node:fs';
import postgres from 'postgres';
import { hashPassword } from '../lib/auth.js';

const PASSWORD = '1234567890';
const url = (process.env.DATABASE_URL || '').replace(/^(["'])(.*)\1$/, '$2');
if (!url) throw new Error('Set DATABASE_URL first');
const sql = postgres(url, { max: 1, prepare: false });
const users = await sql.unsafe('select id, username, role from users order by id');
const hash = await hashPassword(PASSWORD);
await sql.unsafe('update users set password_hash = $1, must_change = false, failed_attempts = 0, locked_until = null', [hash]);
writeFileSync(new URL('../credentials.local.txt', import.meta.url),
  `WEAK DEMO PASSWORDS. Every login below uses the password ${PASSWORD}. Do not use outside the class demo.\n` +
  users.map((u) => `${u.username}\t${u.role}`).join('\n') + '\n');
console.log(`set demo password on ${users.length} logins`);
await sql.end();
