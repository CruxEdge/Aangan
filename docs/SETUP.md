# Aangan Studio phone enquiry system: setup and status

Last updated 10 Oct 2026. Evaluator one-pager: `docs/EVALUATOR.md`.

## What runs where

| Piece | Where | Notes |
|---|---|---|
| Voice agent (Chayya) | Vaani, agent "Aangan Studio Enquiry Agent" | Prompt in `docs/agent-prompt.md`, knowledge base from `docs/knowledge-base/aangan-knowledge.md` |
| Database | Supabase project `aangan-studio` (ref `xrenftwueqlzmpxuppjj`, ap-south-1) | Schema `db/schema.sql`, row level security on, API connects as owner |
| API | Supabase Edge Function `aangan` | `https://xrenftwueqlzmpxuppjj.supabase.co/functions/v1/aangan` |
| Dashboard | Vercel project `aangan-studio`, auto-deploys from GitHub `CruxEdge/Aangan` `main` | https://aangan-studio-orcin.vercel.app, `/api/*` is proxied to the function (`vercel.json`) |
| Telegram | Bot `@aanganstudioagbot`, webhook to `/api/telegram` | Needs a chat id per designer (see below) |
| CRM | HubSpot account "aangan studio" (ID 247655121, free plan), service key `aangan-studio` | 8 `aangan_*` deal properties, 74 demo deals, dashboard "Aangan Studio: Founder view" |

## Logins

Designers: username is the lowercase first name (aryan, meera, reyansh, ishita, kabir, ananya, vihaan, tara, samar, nandini, advait, kavya, dev, riya). Voice agent test console: `chayya`.
All passwords are `1234567890` for the class demo. This is deliberately weak and bypasses the normal password rule
(`scripts/demo-passwords.js`). Rotate before any real use: `node scripts/users.js reset <username>`.

## Secrets

Only in `.env` (gitignored) and as Supabase function secrets: `DATABASE_URL`, `AGENT_API_KEY`, `TELEGRAM_BOT_TOKEN`,
`TELEGRAM_WEBHOOK_SECRET`, `HUBSPOT_TOKEN`. Use single quotes around `DATABASE_URL` and write a `$` in the password as `%24`.
Load them for scripts with `set -a; source .env; set +a`.

## Run it

```
npm test                       # 57 tests on an in-memory database
npm run dev                    # local server on a throwaway database
npm run dev:demo               # same, with demo data
node scripts/migrate.js        # apply db/schema.sql and the 14 designers (needs DATABASE_URL)
node scripts/users.js create   # one login per designer plus chayya
node scripts/demo-passwords.js # class demo passwords
node scripts/seed-demo.js      # demo data; add --remove to delete only the demo rows
```

## Deploy the API

```
npm run build:edge
supabase functions deploy aangan --project-ref xrenftwueqlzmpxuppjj --no-verify-jwt --use-api
```
The edge runtime has no `Buffer`, `process` or `setImmediate`; `src/edge-entry.ts` provides them. After deploying, check
`/api/health` returns `{"ok":true,"designers":14}`.

## Vaani agent (configured by hand in app.vaanivoice.ai)

- Language Hindi with English fallback, Indian accent. Greeting "Namaste, you've reached Aangan Studio. This is Chayya. How can I help you today?"
- Speech to text: Sarvam saaras:v3, fallback AssemblyAI. LLM: OpenAI gpt-4o, fallback Groq llama-3.3-70b-versatile.
- Voice: Cartesia sonic-3.5 Arushi, fallback Sarvam bulbul:v3 ritu. Pronunciation: Chayya to "Chaaya".
- Tools (custom, POST, header `x-api-key`): `aangan_check_area` -> `/api/check-area`, `chayya_book` -> `/api/book`,
  `chayya_log_call` -> `/api/log-call`. Vaani tool names are unique across the whole platform, hence the prefixes.
  The header value must be pasted by hand from `AGENT_API_KEY`; it is stored as `PASTE_AGENT_API_KEY_HERE` until then.
- Knowledge base "Aangan Studio knowledge" attached, with Knowledge-base lookup switched on.
- After editing, press cmd+s and check the Overview page. Pasted text sometimes fails to replace old text, so verify the length.

## Telegram: designer chat ids

Each designer opens `@aanganstudioagbot` and presses Start. To find a chat id: send any message to the bot, then
`curl https://api.telegram.org/bot<TOKEN>/deleteWebhook`, `.../getUpdates` (read `message.chat.id`), and set the webhook again
(`setWebhook` with the function URL `.../api/telegram` and `secret_token`=`TELEGRAM_WEBHOOK_SECRET`).
Store it with `update designers set telegram_chat_id='...'`. For the demo one shared chat id for everyone is enough.
Until then bookings succeed and the Telegram step is reported as skipped.

## Open decisions and known gaps

1. **HubSpot dashboard is partial (free plan).** Saved on the dashboard: Deals by Stage, Deal stage overview, and a totals table
   (74 deals, 62,380,000 closed). Reports grouped by the `aangan_*` properties (tier, source, designer) cannot be saved on the
   free plan: "Create from scratch" and saving an AI-built report are locked. The data is in HubSpot (tier: standard 39, priority 25, hot 10)
   and a paid plan would unlock those three charts. Our deals have no HubSpot owner, so "by rep" shows one Unassigned row.
   The backfill sends the 74 qualified demo leads (the brief says 75).
2. An earlier mistaken run touched the school's HubSpot (Mesa School of Business): 74 demo contacts were created and then archived,
   and a service key `aangan-studio` plus the 8 `aangan_*` properties were added there. Delete that key and those properties.
3. Vaani tool headers need the agent key pasted by hand.
4. Vaani speech-to-text boost keywords would not accept entries for Sarvam, so studio and place names are not boosted.
5. No real phone number yet (a paid Vaani Telephony decision). Calls are tested with the Vaani web audio test.
6. WhatsApp is not connected: customer messages are stored as `not_sent`.
7. Live-call transcripts stay in Vaani History until a Vaani API key is connected (`POST /api/call-update` is ready to receive them).
8. One shared Telegram chat for all designers.
9. Demo password `1234567890` is weak by design.
10. Hygiene: the database password and the Telegram bot token were shared in chat. Reset the database password in Supabase
    and revoke the token in BotFather after the demo. Revoke any unused API keys.
