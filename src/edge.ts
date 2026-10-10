import app from "./index";

// Supabase serves the function under /functions/v1/aangan, so strip that prefix before routing.
Deno.serve((req: Request) => {
  const url = new URL(req.url);
  url.pathname = url.pathname.replace(/^\/aangan/, "") || "/";
  return app.fetch(new Request(url, req));
});
