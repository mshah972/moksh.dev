# Moksh Shah

> Personal portfolio with a live AI assistant. Built with React, Vite, and Claude.

The site is an editorial-meets-terminal interface for my work as a software
engineering student at DePaul. The headline feature is an AI chat — visitors
can ask anything about my projects, skills, or availability, and Claude answers
based on a curated knowledge base.

**Live**: [hellomoksh.dev](https://hellomoksh.dev)

---

## What's interesting here

- **Live AI assistant** powered by Claude Sonnet 4.5. Section §00 is a real
  terminal chat — not a demo, not a mock — that answers questions about my
  background using a system prompt seeded with my résumé.
- **Animated Xcode hero element** that types Swift source code in real time,
  cycles through three files, and tilts toward the cursor on hover. Built from
  scratch with a hand-rolled Swift tokenizer — no syntax-highlighting library.
- **Serverless API proxy** so the Anthropic API key never reaches the browser.
  The proxy also owns the system prompt, rate-limits per IP, and validates
  message length so the chat can't be turned into a free general-purpose bot.
- **Editorial design system** — Instrument Serif for display type, JetBrains
  Mono for everything else, warm-black surfaces with phosphor amber accents.
  No templates, no component library beyond Tailwind utilities.

---

## Tech stack

| Layer    | Tools                                              |
|----------|----------------------------------------------------|
| Frontend | React 18, Vite 6, Tailwind CSS 3                   |
| AI       | Anthropic Claude Sonnet 4.5 (Messages API)         |
| Backend  | Vercel serverless functions (Node 20)              |
| Hosting  | Vercel                                             |
| Type     | Single-page app, fully client-rendered             |

No state management library, no UI kit, no animation framework. Animations are
plain CSS keyframes and `requestAnimationFrame`.

---

## Running locally

You'll need Node 18+ and an Anthropic API key from
[console.anthropic.com](https://console.anthropic.com).

```bash
git clone https://github.com/mokshshah/moksh.dev.git
cd moksh.dev
npm install

# Frontend only — AI chat will fail without the proxy running
npm run dev
```

For the **full local experience** (frontend + AI proxy together), use the
Vercel CLI:

```bash
npm install -g vercel
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env.local
vercel dev
```

Open `http://localhost:3000`. The chat should now work end-to-end.

---

## Project structure
```
├── api/
│   └── chat.js              ← serverless proxy to Anthropic
├── src/
│   ├── Portfolio.jsx        ← entire site, single file
│   ├── main.jsx             ← React entry point
│   └── index.css            ← Tailwind directives
├── public/                  ← static assets (favicon, OG image)
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── vercel.json
├── DEPLOY.md
└── README.md
```

---
`Portfolio.jsx` is intentionally a single file. It's around 1,400 lines and I
prefer reading it that way — every section is one scroll away from every other
section. Splitting it into 30 component files would optimize for the wrong
thing on a project this size.

---

## Customizing this for yourself

If you fork this, two places hold all the personal data — keep them in sync:

1. `src/Portfolio.jsx` → `PROFILE` constant near the top (drives the visual
   layout).
2. `api/chat.js` → `PROFILE` constant (used as the AI's knowledge base).

Edit your name, projects, skills, timeline, and bio in both files. The AI will
only know what's in `api/chat.js`, so anything you want it to answer about
needs to live there.

---

## Credit

Design and code by Moksh Shah. Built with Claude as a pair programmer.

If you fork this for your own portfolio, no attribution required — but I'd
love to see what you build. Reach out at
[moksh.j.sha@gmail.com](mailto:moksh.j.sha@gmail.com).

---

## License

MIT — see [LICENSE](./LICENSE). The code is free to use; the personal content
(my bio, project descriptions, photos) is not.
