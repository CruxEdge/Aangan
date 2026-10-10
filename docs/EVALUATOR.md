# Evaluator briefing: Aangan Studio, Case 03 "Unanswered Enquiries"

**Problem.** 48% of about 200 monthly enquiries get no answer within 48 hours. Scope: incoming phone calls.
**Solution.** Chayya, an AI front desk on Vaani, answers every call, qualifies it against the founder's rubric, books the next
designer in rotation, alerts them on Telegram, and logs everything. Designers work from a web dashboard.

## Try it (5 minutes)
1. Dashboard: https://aangan-studio-orcin.vercel.app. Log in as `aryan` / `1234567890` (any designer's first name works; `chayya` shows the voice agent console).
2. **My leads**: tiers (hot, priority, standard), call-by countdown, status path. **Needs attention**: escalations, missed calls, declines with a reverse button. **Calendar**: your week, others shown as busy. **My projects**: stages, designs, site photos, messages, uploads.
3. **Chayya console** (login `chayya`): last 24 hours, calls handled, and the test script (English, Hindi, Marathi, one decline, one escalation).
4. Place a test call from the Vaani agent page ("Start Test", web audio). Then refresh the dashboard to see the lead.

## Rules the agent follows (from the founder's rubric)
Design and execution for homes and small offices only; Pune and PCMC only (area read back before declining); at least 6 weeks of lead time;
never quotes a price; never asks budget; one question at a time in a fixed order; read back and confirm before booking; escalates unhappy
existing clients with a promised callback within 15 minutes; declines are reviewable and reversible by a designer.

## How it is built
Vaani voice agent -> three tools -> Hono API on a Supabase Edge Function -> Supabase Postgres. Dashboard on Vercel, proxied to the API.
57 automated tests cover tiers, slots, area check, store, auth, API roles and demo data. Roles are enforced: a designer cannot see another
designer's leads, and the Chayya login cannot open designer pages. Demo data (85 calls, 44 projects, calendars, designs, photos) is flagged
`is_demo` and removable with `node scripts/seed-demo.js --remove`.

## Known gaps (honest list)
- No real phone number yet (a paid decision); WhatsApp not connected (messages saved as not sent); one shared Telegram chat.
- Vaani transcripts are not synced to the dashboard until a Vaani API key is connected.
- HubSpot founder dashboard and deal sync are not live: the connected HubSpot account is a school's admissions CRM, pending a decision (see `docs/SETUP.md`).
- Weak demo password by design. Secrets shared in chat must be rotated.
