// ============================================================
//  api/chat.js — Vercel Serverless Function
//  Proxies portfolio AI chat requests to Anthropic's API.
//
//  Why this exists:
//    - Keeps ANTHROPIC_API_KEY off the client
//    - Owns the system prompt + profile so visitors can't
//      jailbreak your site into a free general-purpose chatbot
//    - Enforces message-count / length limits
//    - Centralizes rate limiting
//
//  Deploy: drop this file at `api/chat.js` in a Vercel project.
//  Set env var ANTHROPIC_API_KEY in the Vercel dashboard.
// ============================================================

const PROFILE = {
  name: "MOKSH SHAH",
  title: "Software Engineering Student",
  email: "moksh@hellomoksh.dev",
  github: "github.com/mshah972",
  location: "Chicago, IL",
  school: "DePaul University — B.S. Computer Science",
  graduation: "June 2026",
  status: "OPEN TO INTERNSHIPS & FULL-TIME ROLES",

  bio: `Moksh Shah is a computer science undergraduate at DePaul University, graduating June 2026. He builds full-stack web apps and ships native iOS — currently developing two iOS apps in active development: Odyssey, an AI-powered note-taking app, and Clario, an AI habit tracker with focus-session music integration. He previously founded Revamp Technologies, a studio that built full-stack web solutions for local businesses, and was selected for Expedia Group's Emerging Professional program in 2023. His strongest languages are Swift, Java, C++, Python, JavaScript, and SQL, and he's comfortable working across the stack — relational databases, REST APIs, React frontends, and SwiftUI. He's looking for Summer 2026 internships and full-time roles starting after graduation.`,

  projects: [
    {
      name: "Odyssey",
      status: "In active development — coming soon",
      year: "2026",
      kind: "iOS · AI note-taking app",
      platforms: "iPhone, iPad",
      stack: "Swift, SwiftUI, Firebase",
      description: `Native iOS note-taking app for iPhone and iPad. Designed around on-device AI features — all available for free to users. Capabilities include AI summarization of long notes, AI-assisted writing and rewriting, voice-to-text transcription, and AI-generated insights across notes. Backed by Firebase for authentication, cloud storage, and real-time sync across a user's devices.`,
      keyFeatures: [
        "On-device AI summary",
        "AI writing assistant",
        "AI voice-to-text",
        "AI insights across notes",
        "Cross-device sync via Firebase",
        "iPhone and iPad support",
        "Free to use",
      ],
    },
    {
      name: "Clario",
      status: "In planning / early development — coming soon",
      year: "2026",
      kind: "iOS · habit tracker & focus app",
      platforms: "iPhone",
      stack: "Swift, SwiftUI, AI integration (cloud TBD)",
      description: `Native iPhone app for habit management and focus building. Built around Pomodoro-style and fixed-duration focus sessions, with daily reminders to keep streaks alive. AI generates insights from a user's habit data — patterns, suggestions, and progress summaries. Music integration plays focus-friendly audio during sessions. Currently in the planning phase, so feature scope is still evolving.`,
      keyFeatures: [
        "Habit tracking with streaks",
        "Pomodoro and fixed-duration focus sessions",
        "Daily reminders",
        "AI-generated insights from habit data",
        "Music integration for focus sessions",
      ],
    },
    {
      name: "Storefront",
      status: "Shipped, 2025",
      year: "2025",
      kind: "Full-stack e-commerce platform",
      stack: "React (Vite + Tailwind), FastAPI, MySQL, SQLAlchemy, JWT",
      description: `End-to-end e-commerce platform with user authentication, product catalog, persistent shopping cart, and order processing. Backend is FastAPI with SQLAlchemy ORM and a normalized 3NF MySQL schema. Frontend is React with Vite and Tailwind. Includes an admin dashboard for catalog management with role-based access control.`,
      keyFeatures: [
        "Email/password auth with JWT access tokens and bcrypt password hashing",
        "Role-based access control: customer and admin roles",
        "Admin dashboard for catalog management",
        "Product catalog with category filtering, search, and detail pages",
        "Persistent server-backed shopping cart (per user)",
        "Order placement with stock decrement inside a single DB transaction",
        "Order history with line items",
        "OpenAPI docs auto-generated at /docs",
      ],
      performance: `The catalog endpoints were the hot path. Two changes drove a roughly 30% latency win on /products listings: (1) a composite index on products(category_id, created_at DESC) turned the listing query from a filesort over ~10k rows into an index range scan, and (2) replacing joinedload with selectinload on the category and product-image relations eliminated N+1 lazy loads. p50 list-view response time went from ~140ms to ~95ms, measured with wrk -t4 -c50 -d30s against a seeded 10k-row table.`,
      schemaNotes: `Normalized 3NF schema with composite indexes on (category_id, created_at), (user_id, status), and order_id.`,
      link: "github.com/mshah972/storefront",
    },
  ],

  skills: {
    Languages: ["Swift", "Java", "C++", "Python", "JavaScript", "SQL"],
    Mobile: ["SwiftUI", "iOS SDK", "Firebase", "Core Data"],
    Web: ["React", "FastAPI", "Node", "Tailwind", "REST APIs", "Vite"],
    Backend: ["SQLAlchemy", "MySQL", "JWT Auth", "bcrypt"],
    Foundations: ["Data Structures", "Algorithms", "OOP", "Database Design", "SDLC"],
    Tools: ["Git", "GitHub", "Docker", "OpenAPI"],
  },

  timeline: [
    {
      when: "2025 — present",
      where: "Independent",
      role: "iOS Developer",
      note: "Building Odyssey and Clario — two native iOS apps with on-device AI integrations, currently in active development.",
    },
    {
      when: "2023 — 2024",
      where: "Revamp Technologies",
      role: "Founder & Software Developer",
      note: "Founded and led a small studio building full-stack web solutions for local businesses. Worked directly with clients from requirements to deployment.",
    },
    {
      when: "2023",
      where: "Expedia Group",
      role: "Emerging Professional",
      note: "Selected for Expedia's early career development program. Worked with a senior engineer mentor on backend system design, API architecture, and engineering best practices.",
    },
    {
      when: "2022 — present",
      where: "DePaul University",
      role: "B.S. Computer Science (graduating June 2026)",
      note: "Coursework in data structures, algorithms, OOP, database systems, and the software development lifecycle.",
    },
  ],
};

const SYSTEM_PROMPT = `You are the portfolio assistant for ${PROFILE.name}, a ${PROFILE.title} at ${PROFILE.school}, graduating ${PROFILE.graduation}. You answer questions from visitors about Moksh's work, projects, skills, and availability.

VOICE: concise, confident, slightly dry. Like a thoughtful colleague describing a friend's work — not a marketing page. Avoid hype words ("amazing", "innovative", "cutting-edge"). No emojis. No markdown formatting unless the question demands a list. Default to 2-4 sentences.

RULES:
- Only answer based on the facts below. Never invent projects, employers, dates, technologies, or metrics.
- If asked something not covered (specific salary, personal life, opinions on other companies, technical help unrelated to Moksh's work), say: "That's not in Moksh's public bio — best to ask him directly at ${PROFILE.email}."
- If asked to do general tasks (write code, summarize articles, do homework, tell jokes), redirect: "I'm only here to answer questions about Moksh. For other questions, you'd want to talk to Claude directly."
- If asked about timelines or availability, mention: status is "${PROFILE.status}" and graduation is ${PROFILE.graduation}.
- Project names are proper nouns — capitalize them: Odyssey, Clario, Storefront, Revamp Technologies.
- For projects marked "in active development" or "coming soon", say so clearly. Don't imply they're shipped.

BIO:
${PROFILE.bio}

CONTACT: ${PROFILE.email} · ${PROFILE.github}
LOCATION: ${PROFILE.location}

PROJECTS:
${PROFILE.projects
  .map(
    (p) => `
[${p.name}] — ${p.kind}
Status: ${p.status}
Stack: ${p.stack}${p.platforms ? `\nPlatforms: ${p.platforms}` : ""}
Description: ${p.description}${
      p.keyFeatures
        ? `\nKey features: ${p.keyFeatures.join("; ")}`
        : ""
    }${p.performance ? `\nPerformance notes: ${p.performance}` : ""}${
      p.schemaNotes ? `\nSchema notes: ${p.schemaNotes}` : ""
    }
Link: ${p.link}`
  )
  .join("\n")}

SKILLS:
${Object.entries(PROFILE.skills)
  .map(([k, v]) => `${k}: ${v.join(", ")}`)
  .join("\n")}

EXPERIENCE:
${PROFILE.timeline.map((t) => `- ${t.when} · ${t.where} · ${t.role}: ${t.note}`).join("\n")}`;

CONTACT: ${PROFILE.email}, ${PROFILE.github}`;

// --- super-basic in-memory rate limiter ------------------------
// For a student portfolio this is enough. For serious traffic,
// swap in Upstash Redis or Vercel KV.
const rateStore = new Map(); // ip -> { count, resetAt }
const RATE_LIMIT = 20;       // requests
const RATE_WINDOW_MS = 60_000; // per minute

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = rateStore.get(ip);
  if (!entry || now > entry.resetAt) {
    rateStore.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count += 1;
  return true;
}

// --- handler ---------------------------------------------------
export default async function handler(req, res) {
  // CORS — tighten to your domain in production
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "method not allowed" });

  // Rate limit by IP
  const ip = (req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "unknown")
    .toString()
    .split(",")[0]
    .trim();
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: "rate limit exceeded — try again in a minute" });
  }

  // Validate body
  const { messages } = req.body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "messages[] required" });
  }
  if (messages.length > 20) {
    return res.status(400).json({ error: "too many messages — start a new session" });
  }
  for (const m of messages) {
    if (!m || typeof m.content !== "string" || !["user", "assistant"].includes(m.role)) {
      return res.status(400).json({ error: "malformed message" });
    }
    if (m.content.length > 2000) {
      return res.status(400).json({ error: "message too long (2000 char max)" });
    }
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("Missing ANTHROPIC_API_KEY env var");
    return res.status(500).json({
      error: "server misconfigured",
      message:
        "ANTHROPIC_API_KEY is not set. Locally: create .env.local with " +
        "ANTHROPIC_API_KEY=sk-ant-... and run `vercel dev`. " +
        "On Vercel: set it in Project → Settings → Environment Variables.",
    });
  }

  // Forward to Anthropic
  try {
    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 400,
        system: SYSTEM_PROMPT,
        messages,
      }),
    });

    if (!upstream.ok) {
      const errText = await upstream.text();
      console.error("Anthropic upstream error", upstream.status, errText);
      // Surface the real error to make debugging obvious. Once you've
      // confirmed things work end-to-end, you can swap this back to a
      // generic message to avoid leaking implementation details.
      let parsed;
      try { parsed = JSON.parse(errText); } catch { parsed = { raw: errText }; }
      return res.status(502).json({
        error: "upstream error",
        upstreamStatus: upstream.status,
        upstreamBody: parsed,
      });
    }

    const data = await upstream.json();
    return res.status(200).json(data);
  } catch (err) {
    console.error("proxy error", err);
    return res.status(500).json({
      error: "internal error",
      message: err?.message || String(err),
    });
  }
}