import { useState, useEffect, useRef, useMemo } from "react";

// ============================================================
//  PORTFOLIO — "Terminal Monolith"
//  Editorial serif + phosphor terminal aesthetic with live AI.
//  Replace the PROFILE constant below with your own details.
// ============================================================

const PROFILE = {
  name: "MOKSH SHAH",
  handle: "moksh.shah",
  title: "Software Engineering Student",
  location: "Chicago, IL",
  school: "DePaul University — B.S. Computer Science",
  status: "OPEN TO INTERNSHIPS & FULL-TIME ROLES",
  tagline:
    "Building practical software end-to-end — from iOS apps and database schemas to the interfaces people actually use.",
  bio: `Moksh Shah is a computer science undergraduate at DePaul University, graduating June 2026 with a minor in Finance. He builds full-stack web apps and ships native iOS — currently developing two apps in active development: Odyssey, an AI-powered note-taking app with speech-to-text and summarization, and Clario, an AI habit tracker with focus-session music integration. He previously founded Revamp Technologies, a studio building full-stack web solutions for local businesses, and was selected for Expedia Group's Emerging Professional program in 2023. His strongest languages are Java, C++, Python, JavaScript, and Swift, and he's comfortable working across the stack — relational databases, REST APIs, React frontends, and SwiftUI. He's looking for a Summer 2026 software engineering internship.`,
  email: "moksh@hellomoksh.dev",
  github: "github.com/mshah972",
  linkedIn: "linkedin.com/in/smoksh17",
  projects: [
    {
      id: "01",
      name: "Odyssey",
      year: "[Coming Soon]",
      kind: "iOS · AI note-taking app",
      stack: "SWIFT · SWIFTUI · FIREBASE",
      description:
        "Native iOS note-taking app with AI-powered speech-to-text, automatic summarization, and intelligent organization. Backed by Firebase for authentication, cloud storage, and real-time sync across devices.",
    },
    {
      id: "02",
      name: "Clario",
      year: "[COMING SOON]",
      kind: "iOS · habit tracker",
      stack: "SWIFT · SWIFTUI · AI",
      description:
        "Habit tracker with AI-generated insights and built-in focus sessions — Pomodoro or fixed-duration — paired with music integration to keep you locked in. In active development.",
    },
    {
      id: "03",
      name: "Storefront",
      year: "2025",
      kind: "Full-stack e-commerce platform",
      stack: "REACT · FASTAPI · MYSQL",
      description:
        "End-to-end e-commerce app with user authentication, product catalog, and order processing. JWT auth with role-based access, normalized MySQL schemas, and indexed queries that cut API response times by roughly 30%.",
      link: "github.com/mshah972/storefront",
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

const SUGGESTED_QUESTIONS = [
  "What's Moksh working on right now?",
  "How did he get a 30% speedup on Storefront?",
  "What makes Odyssey different from other note apps?",
  "Is he available for Summer 2026?",
];

// ============================================================
//  API CONFIG
//  "direct" — calls api.anthropic.com from the browser.
//             Works inside the Claude artifact preview.
//             DO NOT ship this to production (exposes API key).
//  "proxy"  — calls your own backend (/api/chat). Use in prod.
//             See api/chat.js in this project for the proxy.
// ============================================================

const API_MODE = "proxy"; // flip to "proxy" when deploying
const API_ENDPOINT =
  API_MODE === "proxy" ? "/api/chat" : "https://api.anthropic.com/v1/messages";

// ============================================================
//  STYLE INJECTION — fonts, grain, cursor, scrollbar
// ============================================================

function useGlobalStyles() {
  useEffect(() => {
    const fontLink = document.createElement("link");
    fontLink.rel = "stylesheet";
    fontLink.href =
      "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@300;400;500;700&display=swap";
    document.head.appendChild(fontLink);

    const style = document.createElement("style");
    style.textContent = `
      :root {
        --bg: #0b0a08;
        --surface: #121110;
        --border: #2a2722;
        --text: #efe9dc;
        --muted: #807b70;
        --dim: #4a4640;
        --amber: #ffb000;
        --amber-dim: #8a5f00;
      }
      html, body, #root { background: var(--bg); color: var(--text); }
      body {
        font-family: 'JetBrains Mono', ui-monospace, monospace;
        font-feature-settings: "ss01", "ss02";
        -webkit-font-smoothing: antialiased;
      }
      .font-serif { font-family: 'Instrument Serif', 'Times New Roman', serif; font-weight: 400; }
      .font-mono  { font-family: 'JetBrains Mono', ui-monospace, monospace; }

      /* subtle film grain */
      .grain::before {
        content: "";
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 100;
        opacity: 0.06;
        mix-blend-mode: overlay;
        background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
      }

      /* scanline sweep over terminal */
      @keyframes sweep { 0% { transform: translateY(-100%); } 100% { transform: translateY(1200%); } }
      .scanline::after {
        content: "";
        position: absolute;
        left: 0; right: 0;
        height: 2px;
        background: linear-gradient(90deg, transparent, rgba(255,176,0,0.35), transparent);
        animation: sweep 6s linear infinite;
        pointer-events: none;
      }

      /* cursor blink */
      @keyframes blink { 50% { opacity: 0; } }
      .caret { animation: blink 1.05s step-end infinite; }

      /* reveal on load, staggered */
      @keyframes rise { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
      .rise { opacity: 0; animation: rise 0.8s cubic-bezier(.2,.7,.2,1) forwards; }

      /* ticker */
      @keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
      .ticker-track { animation: ticker 60s linear infinite; }

      /* chat loading dots */
      @keyframes dot { 0%, 80%, 100% { opacity: 0.2; } 40% { opacity: 1; } }
      .dot1 { animation: dot 1.2s infinite; }
      .dot2 { animation: dot 1.2s infinite 0.2s; }
      .dot3 { animation: dot 1.2s infinite 0.4s; }

      /* custom selection */
      ::selection { background: var(--amber); color: #000; }

      /* scrollbar */
      ::-webkit-scrollbar { width: 10px; height: 10px; }
      ::-webkit-scrollbar-track { background: var(--bg); }
      ::-webkit-scrollbar-thumb { background: var(--border); }
      ::-webkit-scrollbar-thumb:hover { background: var(--dim); }

      /* hover glitch */
      @keyframes glitch {
        0%, 100% { transform: translate(0); }
        20% { transform: translate(-1px, 1px); }
        40% { transform: translate(1px, -1px); }
        60% { transform: translate(-1px, 0); }
        80% { transform: translate(1px, 1px); }
      }
      .glitch-hover:hover { animation: glitch 0.3s linear; }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(fontLink);
      document.head.removeChild(style);
    };
  }, []);
}

// ============================================================
//  SMALL UI PRIMITIVES
// ============================================================

function Tag({ children }) {
  return (
    <span
      className="font-mono text-[10px] tracking-[0.15em] uppercase px-2 py-1 border"
      style={{ borderColor: "var(--border)", color: "var(--muted)" }}
    >
      {children}
    </span>
  );
}

function SectionLabel({ num, title }) {
  return (
    <div className="flex items-baseline gap-4 mb-8 md:mb-12">
      <span
        className="font-mono text-xs tracking-[0.2em]"
        style={{ color: "var(--amber)" }}
      >
        §{num}
      </span>
      <span
        className="font-mono text-xs tracking-[0.3em] uppercase"
        style={{ color: "var(--muted)" }}
      >
        {title}
      </span>
      <div
        className="flex-1 h-px"
        style={{ background: "var(--border)" }}
      />
    </div>
  );
}

// ============================================================
//  HEADER — live clock, status pill
// ============================================================

function Header() {
  const [time, setTime] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Detect the visitor's timezone once. Falls back to UTC if unavailable.
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

  // Time formatted as HH:MM:SS in the visitor's local timezone.
  const t = time.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: tz,
  });

  // Date formatted as YYYY-MM-DD in the visitor's local timezone.
  // sv-SE locale gives ISO-style dashes for free; alternatively build it manually.
  const d = time.toLocaleDateString("sv-SE", { timeZone: tz });

  // Short timezone label, e.g. "PDT", "EST", "GMT+5:30"
  const tzLabel =
    new Intl.DateTimeFormat("en-US", { timeZone: tz, timeZoneName: "short" })
      .formatToParts(time)
      .find((p) => p.type === "timeZoneName")?.value || "UTC";

  return (
    <header
      className="sticky top-0 z-50 border-b backdrop-blur"
      style={{
        borderColor: "var(--border)",
        background: "rgba(11,10,8,0.75)",
      }}
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-3 flex items-center justify-between font-mono text-[11px] tracking-widest uppercase">
        <div className="flex items-center gap-4">
          <span style={{ color: "var(--amber)" }}>●</span>
          <span style={{ color: "var(--text)" }}>{PROFILE.handle}</span>
          <span className="hidden md:inline" style={{ color: "var(--dim)" }}>
            /
          </span>
          <span className="hidden md:inline" style={{ color: "var(--muted)" }}>
            PORTFOLIO v2.6
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-6" style={{ color: "var(--muted)" }}>
          <a href="#work" className="hover:text-[color:var(--text)]">WORK</a>
          <a href="#stack" className="hover:text-[color:var(--text)]">STACK</a>
          <a href="#history" className="hover:text-[color:var(--text)]">HISTORY</a>
          <a href="#contact" className="hover:text-[color:var(--text)]">CONTACT</a>
        </nav>
        <div className="flex items-center gap-3" style={{ color: "var(--muted)" }}>
          <span>{d}</span>
          <span className="hidden sm:inline" style={{ color: "var(--amber)" }}>
            {t}
          </span>
          <span>{tzLabel}</span>
        </div>
      </div>
    </header>
  );
}

// ============================================================
//  XCODE WINDOW — hero element.
//  A tilted macOS-style editor window that types Swift
//  source code nonstop, cycling through project files.
//  Styled to match the Terminal Monolith palette:
//  warm black surfaces, amber keywords, muted accents.
// ============================================================

const CODE_SNIPPETS = 
[
  {
    filename: "PortfolioView.swift",
    code: `// PortfolioView.swift
    import SwiftUI

    struct PortfolioView: View {
      @StateObject var model = PortfolioModel()

      var body: some View {
        NavigationStack {
          List(model.projects) { p in
            ProjectRow(project: p)
          }
        }
      }
    }`,
    },
    {
      filename: "InferenceClient.swift",
      code: `// InferenceClient.swift
      import Foundation

      actor InferenceClient {
        let endpoint: URL

        func infer(_ prompt: String) async throws -> String {
          var req = URLRequest(url: endpoint)
          req.httpMethod = "POST"
          let (data, _) = try await URLSession.shared.data(for: req)
          return try decoder.decode(Response.self, from: data).text
        }
      }`,
    },
  {
    filename: "Project.swift",
    code: `// Project.swift
    import Foundation

    struct Project: Identifiable, Codable {
      let id: UUID
      let name: String
      let year: Int
      let stack: [String]
    }`,
  },
];

// Swift tokenizer — produces spans for syntax highlighting.
const SWIFT_KEYWORDS = new Set([
  "import", "struct", "class", "actor", "enum", "protocol",
  "var", "let", "func", "init", "self", "some", "any",
  "async", "await", "throws", "try", "throw", "return",
  "if", "else", "for", "in", "while", "guard", "switch", "case",
  "private", "public", "internal", "fileprivate", "static",
  "extension", "where", "as", "is", "nil", "true", "false",
]);

function tokenizeSwift(code) {
  const tokens = [];
  let i = 0;
  while (i < code.length) {
    const rest = code.slice(i);

    // comment
    if (rest.startsWith("//")) {
      const end = rest.indexOf("\n");
      const text = end === -1 ? rest : rest.slice(0, end);
      tokens.push({ type: "comment", text });
      i += text.length;
      continue;
    }
    // string
    if (rest.startsWith('"')) {
      let end = 1;
      while (end < rest.length && rest[end] !== '"') {
        if (rest[end] === "\\") end += 2;
        else end += 1;
      }
      end = Math.min(end + 1, rest.length);
      tokens.push({ type: "string", text: rest.slice(0, end) });
      i += end;
      continue;
    }
    // identifier / keyword / type
    const idMatch = rest.match(/^[A-Za-z_][A-Za-z0-9_]*/);
    if (idMatch) {
      const word = idMatch[0];
      let type = "plain";
      if (SWIFT_KEYWORDS.has(word)) type = "keyword";
      else if (/^[A-Z]/.test(word)) type = "type";
      else if (code[i + word.length] === "(") type = "func";
      tokens.push({ type, text: word });
      i += word.length;
      continue;
    }
    // number
    const numMatch = rest.match(/^\d+/);
    if (numMatch) {
      tokens.push({ type: "number", text: numMatch[0] });
      i += numMatch[0].length;
      continue;
    }
    // attribute (@StateObject, etc)
    if (rest.startsWith("@")) {
      const attrMatch = rest.match(/^@[A-Za-z][A-Za-z0-9_]*/);
      if (attrMatch) {
        tokens.push({ type: "attr", text: attrMatch[0] });
        i += attrMatch[0].length;
        continue;
      }
    }
    // anything else (whitespace, punctuation)
    tokens.push({ type: "plain", text: code[i] });
    i += 1;
  }
  return tokens;
}

const TOKEN_COLOR = {
  keyword: "var(--amber)",
  type:    "#efe9dc",
  func:    "#d8c9a8",
  string:  "#c4a064",
  comment: "#6a6459",
  number:  "var(--amber)",
  attr:    "#d88f52",
  plain:   "#a8a39a",
};

function charDelay(char) {
  if (char === "\n") return 280 + Math.random() * 100;
  if (char === " " || char === "\t") return 40 + Math.random() * 25;
  if (/[{}();,.:]/.test(char)) return 100 + Math.random() * 60;
  return 50 + Math.random() * 40;
}

function XcodeWindow() {
  const snippets = useMemo(
    () => CODE_SNIPPETS.map((s) => ({ ...s, tokens: tokenizeSwift(s.code) })),
    []
  );
  const [snippetIdx, setSnippetIdx] = useState(0);
  const [charsShown, setCharsShown] = useState(0);
  // Phase machine: "typing" → finishes → holds 2.2s → "switching" (fade out 0.6s) → next snippet → "typing"
  const [phase, setPhase] = useState("typing");

  // --- hover tilt state ---
  // Default rest pose matches the original hero-shot angle.
  const REST_TILT = { rx: 4, ry: -7 };
  const windowRef = useRef(null);
  const rafRef = useRef(null);
  const [tilt, setTilt] = useState(REST_TILT);
  const [hovering, setHovering] = useState(false);

  function onMouseMove(e) {
    const el = windowRef.current;
    if (!el) return;
    const { clientX, clientY } = e;
    // throttle to one update per frame — keeps tilt buttery on fast moves
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const rect = el.getBoundingClientRect();
      const dx = (clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
      const dy = (clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
      // Window leans toward the cursor — feels like it's tracking you.
      // X-axis cursor → rotateY (left/right); Y-axis cursor → -rotateX (up/down).
      setTilt({
        rx: Math.max(-1, Math.min(1, -dy)) * 14,
        ry: Math.max(-1, Math.min(1, dx)) * 16,
      });
    });
  }

  function onMouseEnter() {
    setHovering(true);
  }
  function onMouseLeave() {
    setHovering(false);
    setTilt(REST_TILT);
  }

  useEffect(() => () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, []);

  const current = snippets[snippetIdx];
  const total = current.code.length;

  useEffect(() => {
    if (phase === "typing") {
      // still characters to reveal — schedule the next one
      if (charsShown < total) {
        const nextChar = current.code[charsShown] || "";
        const id = setTimeout(() => setCharsShown((c) => c + 1), charDelay(nextChar));
        return () => clearTimeout(id);
      }
      // fully typed — hold the finished file on screen, then begin fade-out
      const id = setTimeout(() => setPhase("switching"), 2200);
      return () => clearTimeout(id);
    }
    if (phase === "switching") {
      // wait for the CSS opacity transition to play, then swap to next snippet.
      // The new snippet will fade back in via the same opacity transition.
      const id = setTimeout(() => {
        setSnippetIdx((i) => (i + 1) % snippets.length);
        setCharsShown(0);
        setPhase("typing");
      }, 600);
      return () => clearTimeout(id);
    }
  }, [phase, charsShown, snippetIdx, total, current.code, snippets.length]);

  // Build visible spans up to charsShown
  let budget = charsShown;
  const visible = [];
  for (let t = 0; t < current.tokens.length && budget > 0; t++) {
    const tok = current.tokens[t];
    if (tok.text.length <= budget) {
      visible.push(tok);
      budget -= tok.text.length;
    } else {
      visible.push({ ...tok, text: tok.text.slice(0, budget) });
      budget = 0;
    }
  }

  const typed = current.code.slice(0, charsShown);
  const lineCount = Math.max(typed.split("\n").length, 1);

  // 1 while typing/holding, 0 during the fade-out before snippet swap.
  // Same value for line numbers + code so they fade together.
  const codeOpacity = phase === "switching" ? 0 : 1;

  return (
    <div
      ref={windowRef}
      onMouseMove={onMouseMove}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="relative"
      style={{
        width: "540px",
        height: "324px",
        display: "flex",
        flexDirection: "column",
        transform: `perspective(1600px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) translateZ(0)`,
        transformStyle: "preserve-3d",
        // Snappy follow while hovering; gentle ease back to rest on leave.
        transition: hovering
          ? "transform 0.12s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.3s ease"
          : "transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.4s ease",
        boxShadow: hovering
          ? `${-tilt.ry * 2}px ${40 + tilt.rx * 2}px 90px rgba(0,0,0,0.65), 0 0 0 1px var(--border), 0 0 80px rgba(255,176,0,0.10)`
          : "0 40px 80px rgba(0,0,0,0.55), 0 0 0 1px var(--border), 0 0 60px rgba(255,176,0,0.06)",
        background: "var(--surface)",
        willChange: "transform",
      }}
    >
        {/* title bar */}
        <div
          className="flex items-center px-3 py-2 border-b"
          style={{ borderColor: "var(--border)", background: "var(--surface)" }}
        >
          <div className="flex gap-[6px]">
            <span
              className="block w-[11px] h-[11px] rounded-full"
              style={{ background: "#ff5f56", boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.25)" }}
            />
            <span
              className="block w-[11px] h-[11px] rounded-full"
              style={{ background: "#ffbd2e", boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.25)" }}
            />
            <span
              className="block w-[11px] h-[11px] rounded-full"
              style={{ background: "#27c93f", boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.25)" }}
            />
          </div>
          <div
            className="flex-1 text-center font-mono text-[10px] tracking-[0.2em] uppercase"
            style={{ color: "var(--muted)" }}
          >
            {current.filename}{" "}
            <span style={{ color: "var(--dim)" }}>— moksh-portfolio</span>
          </div>
          <div
            className="font-mono text-[9px] tracking-widest uppercase"
            style={{ color: "var(--amber)" }}
          >
            ● LIVE
          </div>
        </div>

        {/* tab bar */}
        <div
          className="flex border-b overflow-hidden"
          style={{ borderColor: "var(--border)", background: "var(--bg)" }}
        >
          {snippets.map((s, i) => (
            <div
              key={s.filename}
              className="px-3 py-1.5 font-mono text-[10px] tracking-wider border-r"
              style={{
                borderColor: "var(--border)",
                color: i === snippetIdx ? "var(--text)" : "var(--dim)",
                background:
                  i === snippetIdx ? "var(--surface)" : "transparent",
                borderTop:
                  i === snippetIdx
                    ? "1px solid var(--amber)"
                    : "1px solid transparent",
                transition:
                  "color 0.5s ease, background 0.5s ease, border-color 0.5s ease",
              }}
            >
              {s.filename}
            </div>
          ))}
        </div>

        {/* editor area — fills remaining vertical space */}
        <div
          className="flex flex-1 overflow-hidden"
          style={{ background: "var(--bg)" }}
        >
          {/* line numbers */}
          <div
            className="px-3 py-3 text-right font-mono text-[11px] leading-[1.55] select-none"
            style={{
              color: "var(--dim)",
              borderRight: "1px solid var(--border)",
              minWidth: "44px",
              opacity: codeOpacity,
              transition: "opacity 0.6s ease-in-out",
            }}
          >
            {Array.from({ length: lineCount }).map((_, i) => (
              <div key={i}>{String(i + 1).padStart(2, " ")}</div>
            ))}
          </div>

          {/* code */}
          <pre
            className="flex-1 px-4 py-3 overflow-hidden whitespace-pre"
            style={{
              fontFamily: "'JetBrains Mono', ui-monospace, monospace",
              fontSize: "11px",
              lineHeight: "1.55",
              margin: 0,
              opacity: codeOpacity,
              transition: "opacity 0.6s ease-in-out",
            }}
          >
            {visible.map((tok, i) => (
              <span key={i} style={{ color: TOKEN_COLOR[tok.type] }}>
                {tok.text}
              </span>
            ))}
            <span
              className="caret inline-block align-middle"
              style={{
                width: "7px",
                height: "13px",
                background: "var(--amber)",
                marginLeft: "1px",
                verticalAlign: "-2px",
              }}
            />
          </pre>
        </div>

        {/* status bar */}
        <div
          className="flex items-center justify-between px-3 py-1.5 border-t font-mono text-[9px] tracking-[0.2em] uppercase"
          style={{
            borderColor: "var(--border)",
            background: "var(--surface)",
            color: "var(--muted)",
          }}
        >
          <span>
            <span style={{ color: "#27c93f" }}>●</span> BUILD SUCCEEDED
          </span>
          <span>LN {lineCount} · SWIFT 5.10</span>
          <span style={{ color: "var(--amber)" }}>⌘R</span>
        </div>
    </div>
  );
}

// ============================================================
//  HERO
// ============================================================

function Hero() {
  return (
    <section
      className="relative border-b"
      style={{ borderColor: "var(--border)" }}
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 pt-16 md:pt-24 pb-20 md:pb-28">
        {/* top meta row */}
        <div
          className="rise flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[11px] tracking-[0.2em] uppercase mb-10 md:mb-16"
          style={{ color: "var(--muted)", animationDelay: "0ms" }}
        >
          <span>
            <span style={{ color: "var(--amber)" }}>▸</span> STATUS:{" "}
            <span style={{ color: "var(--text)" }}>{PROFILE.status}</span>
          </span>
          <span>LOC / {PROFILE.location}</span>
        </div>

        {/* MAIN ROW: monolithic name + Xcode window (lg+ only).
            On smaller screens the window is hidden and the name takes the full width. */}
        <div className="lg:grid lg:grid-cols-12 lg:gap-6 lg:items-center">
          <h1
            className="rise lg:col-span-7 font-serif leading-[0.85] tracking-tight"
            style={{
              fontSize: "clamp(3.5rem, 11vw, 10rem)",
              animationDelay: "120ms",
            }}
          >
            {PROFILE.name.split(" ").map((w, i) => (
              <span key={i} className="block">
                {w}
                {i === 0 && (
                  <span className="italic" style={{ color: "var(--amber)" }}>
                    .
                  </span>
                )}
              </span>
            ))}
          </h1>

          {/* Window column — only renders at lg+ where there's room for the 540px window.
              Sits flush right with a soft amber glow behind for atmosphere. */}
          <div className="hidden lg:flex lg:col-span-5 lg:justify-end lg:items-center relative">
            <div
              className="absolute pointer-events-none"
              style={{
                inset: "-30px",
                background:
                  "radial-gradient(ellipse 60% 50% at 60% 50%, rgba(255,176,0,0.10), transparent 70%)",
                filter: "blur(40px)",
                zIndex: 0,
              }}
            />
            <div className="relative" style={{ zIndex: 1 }}>
              <XcodeWindow />
            </div>
          </div>
        </div>

        {/* descriptor row */}
        <div className="grid md:grid-cols-12 gap-8 md:gap-10 mt-12 md:mt-16">
          <div
            className="rise md:col-span-5 font-mono text-xs tracking-wider uppercase space-y-2"
            style={{ color: "var(--muted)", animationDelay: "240ms" }}
          >
            <div>
              <span style={{ color: "var(--dim)" }}>ROLE ————————</span>{" "}
              {PROFILE.title}
            </div>
            <div>
              <span style={{ color: "var(--dim)" }}>EDU —————————</span>{" "}
              {PROFILE.school}
            </div>
            <div>
              <span style={{ color: "var(--dim)" }}>FOCUS ———————</span> Mobile · Web · AI
            </div>
          </div>

          <p
            className="rise md:col-span-7 font-serif italic leading-snug"
            style={{
              fontSize: "clamp(1.25rem, 2.6vw, 2rem)",
              color: "var(--text)",
              animationDelay: "360ms",
            }}
          >
            {PROFILE.tagline}
          </p>
        </div>
      </div>

      {/* marquee ticker */}
      <Ticker />
    </section>
  );
}

function Ticker() {
  const items = [
    "AVAILABLE FOR SUMMER 2026",
    "BASED IN CHICAGO",
    "BUILDING ODYSSEY + CLARIO",
    "SHIPPING ON iOS",
    "CS + FINANCE @ DEPAUL",
    "WRITING SWIFT & PYTHON",
  ];
  const loop = [...items, ...items];
  return (
    <div
      className="border-t border-b overflow-hidden py-3"
      style={{ borderColor: "var(--border)", background: "var(--surface)" }}
    >
      <div className="ticker-track flex whitespace-nowrap font-mono text-xs tracking-[0.3em] uppercase">
        {loop.map((it, i) => (
          <span
            key={i}
            className="flex items-center"
            style={{ color: i % 2 === 0 ? "var(--text)" : "var(--muted)" }}
          >
            <span className="px-8">{it}</span>
            <span style={{ color: "var(--amber)" }}>◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ============================================================
//  AI ASSISTANT — real Claude integration
// ============================================================

function AIAssistant() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  async function ask(question) {
    if (!question.trim() || loading) return;
    const userMsg = { role: "user", content: question };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);

    const systemPrompt = `You are the portfolio assistant for ${PROFILE.name}, a ${PROFILE.title}. Answer visitor questions about them in a concise, confident, slightly dry tone. Never invent facts beyond what's below. If asked something not covered, say "That's not in Moksh's public bio — best to ask directly at ${PROFILE.email}." Keep answers under 80 words. No markdown, no lists unless the question demands it.

BIO: ${PROFILE.bio}

PROJECTS:
${PROFILE.projects
  .map((p) => `- ${p.name} (${p.year}, ${p.stack}): ${p.description}`)
  .join("\n")}

SKILLS: ${Object.entries(PROFILE.skills)
      .map(([k, v]) => `${k}: ${v.join(", ")}`)
      .join(" | ")}

EXPERIENCE:
${PROFILE.timeline.map((t) => `- ${t.when} · ${t.where} · ${t.role}: ${t.note}`).join("\n")}

CONTACT: ${PROFILE.email}, ${PROFILE.github}`;

    try {
      // In proxy mode, the server owns the system prompt + profile,
      // so the client only ever sends the messages array.
      const payload =
        API_MODE === "proxy"
          ? { messages: next.map((m) => ({ role: m.role, content: m.content })) }
          : {
              model: "claude-sonnet-4-5",
              max_tokens: 400,
              system: systemPrompt,
              messages: next.map((m) => ({ role: m.role, content: m.content })),
            };

      const res = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      // Non-2xx response — surface the proxy's error message
      if (!res.ok) {
        const detail =
          data?.upstreamBody?.error?.message ||
          data?.message ||
          data?.error ||
          `HTTP ${res.status}`;
        throw new Error(detail);
      }

      const reply = data.content
        .map((c) => (c.type === "text" ? c.text : ""))
        .filter(Boolean)
        .join("\n");
      setMessages([...next, { role: "assistant", content: reply.trim() }]);
    } catch (err) {
      console.error("chat error:", err);
      setMessages([
        ...next,
        {
          role: "assistant",
          content:
            "Connection dropped: " +
            (err?.message || String(err)) +
            ". Try again, or email Moksh directly at " +
            PROFILE.email,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="border-b" style={{ borderColor: "var(--border)" }}>
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-20 md:py-28">
        <SectionLabel num="00" title="ASK THE ARCHIVE" />

        <div className="grid md:grid-cols-12 gap-10">
          <div className="md:col-span-4">
            <h2
              className="font-serif leading-[0.95]"
              style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
            >
              Interrogate
              <br />
              the résumé
              <span style={{ color: "var(--amber)" }}>.</span>
            </h2>
            <p
              className="mt-6 font-mono text-xs tracking-wider uppercase leading-relaxed"
              style={{ color: "var(--muted)" }}
            >
              Live chat powered by Claude. Ask anything about {PROFILE.name.split(" ")[0]}
              's work, skills, projects, or availability.
            </p>
          </div>

          <div
            className="md:col-span-8 relative scanline overflow-hidden"
            style={{
              border: "1px solid var(--border)",
              background: "var(--surface)",
            }}
          >
            {/* terminal header bar */}
            <div
              className="flex items-center justify-between px-4 py-2 border-b font-mono text-[10px] tracking-widest uppercase"
              style={{
                borderColor: "var(--border)",
                color: "var(--muted)",
              }}
            >
              <span>
                <span style={{ color: "var(--amber)" }}>◉</span> ARCHIVE.SESSION
              </span>
              <span>CLAUDE-SONNET-4.5 / LIVE</span>
            </div>

            {/* message area */}
            <div
              ref={scrollRef}
              className="h-[340px] overflow-y-auto p-5 font-mono text-sm leading-relaxed"
            >
              {messages.length === 0 && (
                <div style={{ color: "var(--muted)" }}>
                  <div className="mb-3">
                    <span style={{ color: "var(--amber)" }}>$</span> archive --init
                  </div>
                  <div className="mb-1">
                    Loaded {PROFILE.projects.length} projects,{" "}
                    {PROFILE.timeline.length} roles, and a brief bio.
                  </div>
                  <div>Ready. Ask anything.</div>
                  <div className="caret inline-block w-2 h-4 ml-1 align-middle" style={{ background: "var(--amber)" }} />
                </div>
              )}

              {messages.map((m, i) => (
                <div key={i} className="mb-4">
                  <div
                    className="text-[10px] tracking-widest uppercase mb-1"
                    style={{
                      color:
                        m.role === "user" ? "var(--amber)" : "var(--muted)",
                    }}
                  >
                    {m.role === "user" ? "> VISITOR" : "> ARCHIVE"}
                  </div>
                  <div
                    style={{
                      color:
                        m.role === "user" ? "var(--text)" : "var(--text)",
                      opacity: m.role === "user" ? 0.9 : 1,
                    }}
                  >
                    {m.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="mb-4">
                  <div
                    className="text-[10px] tracking-widest uppercase mb-1"
                    style={{ color: "var(--muted)" }}
                  >
                    &gt; ARCHIVE
                  </div>
                  <div style={{ color: "var(--amber)" }}>
                    <span className="dot1">●</span>
                    <span className="dot2 ml-1">●</span>
                    <span className="dot3 ml-1">●</span>
                  </div>
                </div>
              )}
            </div>

            {/* suggestions + input */}
            <div
              className="border-t p-4"
              style={{ borderColor: "var(--border)" }}
            >
              {messages.length === 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => ask(q)}
                      className="font-mono text-[10px] tracking-wider uppercase px-2 py-1 border transition-colors hover:border-[color:var(--amber)] hover:text-[color:var(--amber)]"
                      style={{
                        borderColor: "var(--border)",
                        color: "var(--muted)",
                      }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-3">
                <span
                  className="font-mono text-sm"
                  style={{ color: "var(--amber)" }}
                >
                  &gt;
                </span>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") ask(input);
                  }}
                  placeholder="Type a question..."
                  className="flex-1 bg-transparent outline-none font-mono text-sm"
                  style={{ color: "var(--text)" }}
                />
                <button
                  onClick={() => ask(input)}
                  disabled={loading || !input.trim()}
                  className="font-mono text-[10px] tracking-widest uppercase px-3 py-1 border transition-colors disabled:opacity-30"
                  style={{
                    borderColor: "var(--amber)",
                    color: "var(--amber)",
                  }}
                >
                  SEND ↵
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================
//  WORK
// ============================================================

function Work() {
  return (
    <section id="work" className="border-b" style={{ borderColor: "var(--border)" }}>
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-20 md:py-28">
        <SectionLabel num="01" title="SELECTED WORK" />
        <div className="space-y-0">
          {PROFILE.projects.map((p, i) => (
            <ProjectRow key={p.id} p={p} last={i === PROFILE.projects.length - 1} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectRow({ p, last }) {
  const [hover, setHover] = useState(false);
  const hasLink = Boolean(p.link);

  // Render as an anchor if there's a link, plain div otherwise.
  // Same styling either way; only the interaction differs.
  const Wrapper = hasLink ? "a" : "div";
  const wrapperProps = hasLink
    ? { href: `https://${p.link}`, target: "_blank", rel: "noreferrer" }
    : {};

  return (
    <Wrapper
      {...wrapperProps}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="group grid md:grid-cols-12 gap-4 md:gap-6 items-baseline py-6 md:py-8 border-t transition-colors p-4"
      style={{
        borderColor: "var(--border)",
        borderBottom: last ? "1px solid var(--border)" : "",
        background: hover && hasLink ? "var(--surface)" : "transparent",
        cursor: hasLink ? "pointer" : "default",
      }}
    >
      <div
        className="md:col-span-1 font-mono text-xs tracking-widest"
        style={{ color: "var(--amber)" }}
      >
        {p.id}
      </div>

      <div className="md:col-span-4 glitch-hover">
        <div
          className="font-serif leading-none"
          style={{
            fontSize: "clamp(2rem, 4vw, 3rem)",
            color: hover && hasLink ? "var(--amber)" : "var(--text)",
            transition: "color 0.2s",
          }}
        >
          {p.name}
        </div>
        <div
          className="font-mono text-[11px] tracking-widest uppercase mt-2"
          style={{ color: "var(--muted)" }}
        >
          {p.kind} / {p.year}
        </div>
      </div>

      <div
        className="md:col-span-4 font-mono text-sm leading-relaxed"
        style={{ color: "var(--text)", opacity: 0.85 }}
      >
        {p.description}
      </div>

      <div className="md:col-span-3 flex md:justify-end">
        <Tag>{hasLink ? p.stack : "IN DEVELOPMENT"}</Tag>
      </div>
    </Wrapper>
  );
}

// ============================================================
//  STACK — skill matrix
// ============================================================

function Stack() {
  return (
    <section
      id="stack"
      className="border-b"
      style={{ borderColor: "var(--border)", background: "var(--surface)" }}
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-20 md:py-28">
        <SectionLabel num="02" title="STACK / MATRIX" />
        <div className="grid md:grid-cols-4 gap-6 md:gap-10">
          {Object.entries(PROFILE.skills).map(([category, items]) => (
            <div key={category}>
              <div
                className="font-mono text-[10px] tracking-[0.3em] uppercase mb-4 pb-2 border-b"
                style={{
                  color: "var(--amber)",
                  borderColor: "var(--border)",
                }}
              >
                ▸ {category}
              </div>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li
                    key={item}
                    className="font-serif text-2xl leading-tight"
                    style={{ color: "var(--text)" }}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
//  HISTORY — experience timeline
// ============================================================

function History() {
  return (
    <section id="history" className="border-b" style={{ borderColor: "var(--border)" }}>
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-20 md:py-28">
        <SectionLabel num="03" title="HISTORY LOG" />
        <div className="space-y-0">
          {PROFILE.timeline.map((e, i) => (
            <div
              key={i}
              className="grid md:grid-cols-12 gap-4 md:gap-6 py-6 md:py-8 border-t"
              style={{
                borderColor: "var(--border)",
                borderBottom:
                  i === PROFILE.timeline.length - 1
                    ? "1px solid var(--border)"
                    : "",
              }}
            >
              <div
                className="md:col-span-2 font-mono text-[11px] tracking-widest uppercase"
                style={{ color: "var(--amber)" }}
              >
                {e.when}
              </div>
              <div className="md:col-span-4">
                <div
                  className="font-serif"
                  style={{
                    fontSize: "clamp(1.5rem, 2.5vw, 2rem)",
                    lineHeight: 1,
                  }}
                >
                  {e.where}
                </div>
                <div
                  className="font-mono text-[11px] tracking-widest uppercase mt-2"
                  style={{ color: "var(--muted)" }}
                >
                  {e.role}
                </div>
              </div>
              <div
                className="md:col-span-6 font-mono text-sm leading-relaxed"
                style={{ color: "var(--text)", opacity: 0.85 }}
              >
                {e.note}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
//  CONTACT
// ============================================================

function Contact() {
  return (
    <section id="contact" className="border-b" style={{ borderColor: "var(--border)" }}>
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-24 md:py-36">
        <SectionLabel num="04" title="TRANSMIT" />
        <div className="grid md:grid-cols-12 gap-10 items-end">
          <div className="md:col-span-8">
            <h2
              className="font-serif leading-[0.9]"
              style={{ fontSize: "clamp(3rem, 9vw, 8rem)" }}
            >
              Let's build
              <br />
              <span className="italic" style={{ color: "var(--amber)" }}>
                something.
              </span>
            </h2>
          </div>
          <div className="md:col-span-4 space-y-6">
            <a
              href={`mailto:${PROFILE.email}`}
              className="block group"
            >
              <div
                className="font-mono text-[10px] tracking-[0.3em] uppercase mb-1"
                style={{ color: "var(--muted)" }}
              >
                EMAIL
              </div>
              <div
                className="font-serif text-2xl md:text-3xl group-hover:text-[color:var(--amber)] transition-colors"
                style={{ color: "var(--text)" }}
              >
                {PROFILE.email}
              </div>
            </a>
            <a
              href={`https://${PROFILE.github}`}
              target="_blank"
              rel="noreferrer"
              className="block group"
            >
              <div
                className="font-mono text-[10px] tracking-[0.3em] uppercase mb-1"
                style={{ color: "var(--muted)" }}
              >
                GITHUB
              </div>
              <div
                className="font-serif text-2xl md:text-3xl group-hover:text-[color:var(--amber)] transition-colors"
                style={{ color: "var(--text)" }}
              >
                {PROFILE.github}
              </div>
            </a>
            <a
              href={`https://${PROFILE.linkedIn}`}
              target="_blank"
              rel="noreferrer"
              className="block group"
            >
              <div
                className="font-mono text-[10px] tracking-[0.3em] uppercase mb-1"
                style={{ color: "var(--muted)" }}
              >
                LINKEDIN
              </div>
              <div
                className="font-serif text-2xl md:text-3xl group-hover:text-[color:var(--amber)] transition-colors"
                style={{ color: "var(--text)" }}
              >
                {PROFILE.linkedIn}
              </div>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================
//  FOOTER
// ============================================================

function Footer() {
  return (
    <footer>
      <div
        className="max-w-[1400px] mx-auto px-6 md:px-10 py-6 flex flex-wrap justify-between gap-4 font-mono text-[10px] tracking-[0.2em] uppercase"
        style={{ color: "var(--dim)" }}
      >
        <span>© {new Date().getFullYear()} {PROFILE.name} — ALL SYSTEMS NOMINAL</span>
        <div className="flex items-center gap-6">
          <span>DESIGNED + HAND-CODED</span>
          <span style={{ color: "var(--amber)" }}>◆ ◆ ◆</span>
        </div>
      </div>
    </footer>
  );
}

// ============================================================
//  ROOT
// ============================================================

export default function Portfolio() {
  useGlobalStyles();
  return (
    <div className="grain min-h-screen" style={{ background: "var(--bg)" }}>
      <Header />
      <Hero />
      <AIAssistant />
      <Work />
      <Stack />
      <History />
      <Contact />
      <Footer />
    </div>
  );
}