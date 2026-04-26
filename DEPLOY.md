# Deploy Guide

This portfolio has two halves:

1. **Frontend** — `src/Portfolio.jsx` (React + Vite, static)
2. **Backend proxy** — `api/chat.js` (hides your Anthropic API key, owns the system prompt, rate-limits requests)

You need the proxy in production because any API key shipped to the browser is public.

---

## Architecture

```
  Browser                         Your Backend               Anthropic
 ┌─────────┐   POST /api/chat   ┌──────────────┐  POST    ┌─────────────┐
 │ Visitor │ ─── {messages} ──> │ Serverless   │ ───────> │ /v1/messages│
 │ (React) │                    │ Function     │          │             │
 │         │ <── {content} ──── │ + API key    │ <─────── │             │
 └─────────┘                    └──────────────┘          └─────────────┘
```

The client never sees your API key. The server owns the system prompt and
profile data, so visitors can't turn your portfolio into a free
general-purpose chatbot by editing client code.

---

## Option A — Vercel (recommended)

Fastest path. Free tier is plenty for a personal portfolio.

**1. Project layout** (already set up if you cloned this repo):

```
.
├── api/
│   └── chat.js          ← proxy
├── src/
│   └── Portfolio.jsx    ← the React component
├── package.json
└── vercel.json
```

**2. Install and set the env var:**

```bash
npm install
npm install -g vercel
vercel link
vercel env add ANTHROPIC_API_KEY
# paste your key, apply to Production + Preview
```

**3. Flip the frontend to proxy mode.** In `src/Portfolio.jsx`:

```js
const API_MODE = "proxy"; // was "direct"
```

**4. Deploy:**

```bash
vercel --prod
```

Your chat now calls `/api/chat` on your own domain. The key stays on the server.

For local development with the proxy, run `vercel dev` (not `npm run dev` —
that won't load env vars for serverless functions).

---

## Option B — Cloudflare Workers

Better if you expect heavier traffic, want edge latency, or prefer
Cloudflare's ecosystem. Free tier: 100k requests/day.

```bash
npm install -g wrangler
wrangler login
wrangler init portfolio-api
# copy this repo's worker.js into src/index.js
wrangler secret put ANTHROPIC_API_KEY
wrangler deploy
```

Then update `API_ENDPOINT` in `src/Portfolio.jsx` to your worker URL:

```js
const API_ENDPOINT = "https://portfolio-api.<your-name>.workers.dev";
```

Optionally bind a KV namespace called `RATE_KV` for cross-instance rate
limiting (the in-memory limiter in the Vercel function doesn't survive cold
starts; KV does).

---

## Option C — Your own Node/Express server

If you're hosting on Railway, Fly.io, Render, a VPS, etc.:

```js
// server.js
import express from "express";
import handler from "./api/chat.js";

const app = express();
app.use(express.json());
app.post("/api/chat", (req, res) => handler(req, res));
app.listen(process.env.PORT || 3000);
```

Set `ANTHROPIC_API_KEY` in your host's environment variables.

---

## Production checklist

- [ ] `API_MODE = "proxy"` in `src/Portfolio.jsx`
- [ ] `ANTHROPIC_API_KEY` set as a secret (never committed to git)
- [ ] `PROFILE` in `api/chat.js` kept in sync with `src/Portfolio.jsx`
- [ ] Model string (`model:` in `api/chat.js`) points to a currently active model — see [Anthropic's deprecation page](https://docs.anthropic.com/en/docs/about-claude/model-deprecations)
- [ ] CORS `Access-Control-Allow-Origin` tightened from `*` to your domain
- [ ] Rate limit makes sense for your expected traffic
- [ ] **Monthly spend limit set in the Anthropic console** — critical, a leaked key or abuse can rack up charges fast
- [ ] Browser network tab shows `/api/chat`, not `api.anthropic.com`

---

## Cost expectations

Claude Sonnet 4.5 at ~400 max output tokens per response, with the system
prompt (~800 tokens) and a couple of turns of history, costs roughly
**$0.005–$0.015 per conversation**. A thousand visitors having a full chat is
about $5–15. For a personal portfolio, set a $10/month cap in the Anthropic
console and you'll never be surprised.

Pricing reference: $3 per million input tokens, $15 per million output tokens
for Sonnet 4.5 as of this writing. Check
[anthropic.com/pricing](https://www.anthropic.com/pricing) for current rates.

---

## Troubleshooting

**`/api/chat:1 Failed to load resource: 502`**

The proxy reached the Anthropic API but the API returned an error. Most
common causes:

1. **Model retired or wrong name.** Anthropic retires older models
   periodically. Check the `model:` field in `api/chat.js`. Current valid
   values include `claude-sonnet-4-5` and `claude-opus-4-7`. See the
   [model deprecations page](https://docs.anthropic.com/en/docs/about-claude/model-deprecations).
2. **Invalid API key.** The proxy now returns the real Anthropic error in
   `upstreamBody`. Check the network tab — if you see `authentication_error`,
   regenerate your key.
3. **Rate-limited or out of credits.** Check your usage at
   [console.anthropic.com](https://console.anthropic.com).
4. **Wrong env var name.** Must be exactly `ANTHROPIC_API_KEY`.

**`500: server misconfigured`**

`ANTHROPIC_API_KEY` isn't set. Locally: create `.env.local` with the key and
run `vercel dev`. On Vercel: add the env var in Project → Settings →
Environment Variables and redeploy.

**Chat works locally but not in production**

Make sure you flipped `API_MODE = "proxy"` in `src/Portfolio.jsx`.

---

## Things to add later (when you want to)

- **Streaming responses**: switch the upstream call to Anthropic's streaming
  endpoint and forward SSE to the client. The chat feels noticeably more alive.
- **Conversation persistence**: stash conversations in Vercel KV /
  Cloudflare KV so refreshes don't wipe the thread.
- **Moderation**: pre-screen user inputs or post-screen AI outputs if your
  portfolio is getting weird traffic.
- **Logging**: pipe conversation logs to Axiom / Logtail to see what
  recruiters are actually asking.
- **Analytics**: count questions per day, most-asked topics. Genuinely fun data.

---

## License

MIT — see [LICENSE](./LICENSE).