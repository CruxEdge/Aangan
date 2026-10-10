import postgres from 'postgres';

let client;

// Returns { query(text, params) -> rows[] }. Tests install an in-memory database on globalThis.__testDb.
// In the Supabase Edge Function SUPABASE_DB_URL is provided by the platform; elsewhere set DATABASE_URL.
export function getDb() {
  if (globalThis.__testDb) return globalThis.__testDb;
  if (!client) {
    const url = (globalThis.Deno && Deno.env.get('SUPABASE_DB_URL')) || process.env.DATABASE_URL;
    if (!url) throw new Error('DATABASE_URL is not set');
    const sql = postgres(url, { max: 3, prepare: false, idle_timeout: 20 });
    client = { query: (text, params = []) => sql.unsafe(text, params).then((rows) => Array.from(rows)) };
  }
  return client;
}
