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

// --- keep this in sync with PROFILE in the frontend -----------
const PROFILE = {
  name: "MOKSH SHAH",
  handle: "moksh.shah",
  title: "Software Engineering Student",
  location: "Chicago, IL",
  school: "DePaul University — B.S. Computer Science",
  status: "OPEN TO INTERNSHIPS & FULL-TIME ROLES",
  tagline:
    "Building practical software end-to-end — from iOS apps and database schemas to the interfaces people actually use.",
  bio: `Moksh Shah is a computer science undergraduate at DePaul University, graduating June 2026. He's currently in Expedia Group's Emerging Professional program, working with a senior engineer mentor on backend system design and API architecture. He previously founded Revamp Technologies, a small studio that built full-stack web solutions for local businesses. His strongest languages are Java, C++, Python, and JavaScript, and he's most comfortable working across the stack — designing relational databases, writing REST APIs, and shipping React frontends. He's looking for a Summer 2026 software engineering internship.`,
  email: "moksh@hellomoksh.dev",
  github: "github.com/mshah972",
  projects: [
    {
      id: "01",
      name: "Odyssey",
      year: "[Coming Soon]",
      kind: "iOS · AI note-taking app",
      stack: "SWIFT · SWIFTUI · FIREBASE",
      description:
        "Native iOS note-taking app with AI-powered speech-to-text, automatic summarization, and intelligent organization. Backed by Firebase for authentication, cloud storage, and real-time sync across devices.",
      link: "github.com/mshah972/odyssey-ios",
    },
    {
      id: "02",
      name: "Clario",
      year: "[COMING SOON]",
      kind: "iOS · habit tracker",
      stack: "SWIFT · SWIFTUI · AI",
      description:
        "Habit tracker with AI-generated insights and built-in focus sessions — Pomodoro or fixed-duration — paired with music integration to keep you locked in. In active development.",
      link: "www.hellomoksh.dev",
    },
    {
      id: "03",
      name: "Storefront",
      year: "2025",
      kind: "Full-stack e-commerce platform",
      stack: "REACT · FASTAPI · MYSQL",
      description:
        "End-to-end e-commerce app with user authentication, product catalog, and order processing. JWT auth with role-based access, normalized MySQL schemas, and indexed queries that cut API response times by roughly 30%.",
      link: "www.hellomoksh.dev",
    },
    // {
    //   id: "ID",
    //   name: "NAME",
    //   year: "YYYY",
    //   kind: "TAGLINE",
    //   stack: "STACK",
    //   description:
    //     "DESCRIPTION",
    //   link: "LINK",
    // },
  ],
  skills: {
    Languages: ["Swift", "Java", "C++", "Python", "JavaScript", "SQL"],
    Mobile: ["SwiftUI", "iOS SDK", "Firebase", "Core Data"],
    Web: ["React", "FastAPI", "Node", "Tailwind", "REST APIs"],
    Foundations: ["Data Structures", "Algorithms", "OOP", "MySQL", "JWT Auth"],
  },
  timeline: [
    {
      when: "2025 — NOW",
      where: "Independent",
      role: "iOS Developer",
      note: "Building Odyssey and Clario — two native iOS apps with AI integrations, currently in active development.",
    },
    {
      when: "2023 — 2024",
      where: "Revamp Technologies",
      role: "Founder & Software Developer",
      note: "Founded and led a small studio building full-stack web solutions for local businesses. Worked directly with clients from requirements to deployment.",
    },
    {
      when: "2023 - 2023",
      where: "Expedia Group",
      role: "Emerging Professional",
      note: "Selected for Expedia's early career development program. Worked with a senior engineer mentor on backend system design, API architecture, and engineering best practices.",
    },
    {
      when: "2022 — NOW",
      where: "DePaul University",
      role: "B.S. Computer Science",
      note: "Coursework in data structures, algorithms, OOP, database systems, and the software development lifecycle.",
    },
  ],
};

const SYSTEM_PROMPT = `You are the portfolio assistant for ${PROFILE.name}, a ${PROFILE.title}. Answer visitor questions about them in a concise, confident, slightly dry tone. Never invent facts beyond what's below. If asked something not covered, say "That's not in Moksh's public bio — best to ask directly at ${PROFILE.email}." Keep answers under 80 words. No markdown, no lists unless the question demands it. If asked about topics unrelated to Moksh's career or work (general coding help, jokes, trivia, etc.), politely redirect.

BIO: ${PROFILE.bio}

PROJECTS:
${PROFILE.projects.map(p => `- ${p.name} (${p.year}, ${p.stack}): ${p.description}`).join("\n")}

SKILLS: ${Object.entries(PROFILE.skills).map(([k, v]) => `${k}: ${v.join(", ")}`).join(" | ")}

EXPERIENCE:
${PROFILE.timeline.map(t => `- ${t.when} · ${t.where} · ${t.role}${t.note ? `: ${t.note}` : ""}`).join("\n")}

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