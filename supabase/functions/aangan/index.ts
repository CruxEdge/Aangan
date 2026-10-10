// @ts-nocheck
// Entry for the Supabase Edge Function. The edge runtime has no global Buffer or process, which the
// handlers and the Postgres driver expect, so install them before loading the bundled app (./app.ts).
import { Buffer } from "node:buffer";
import process from "node:process";
globalThis.Buffer ??= Buffer;
globalThis.process ??= process;
globalThis.setImmediate ??= (fn, ...a) => setTimeout(fn, 0, ...a);
globalThis.clearImmediate ??= (id) => clearTimeout(id);

let boot;
try { boot = await import("./app.ts"); } catch (e) { boot = { error: String((e && e.stack) || e) }; }

Deno.serve((req) => {
  if (boot.error) { console.error("boot failed:", boot.error); return new Response("server error", { status: 500 }); }
  const url = new URL(req.url);
  url.pathname = url.pathname.replace(/^\/aangan/, "") || "/";
  return boot.default.fetch(new Request(url, req));
});
