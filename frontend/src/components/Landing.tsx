import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

/* ----------------------------- Shared Primitives ----------------------------- */

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
} as const;

function GradientText({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <span className={`text-gradient ${className}`}>{children}</span>;
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs mono text-muted-foreground backdrop-blur">
      <span className="h-1.5 w-1.5 rounded-full bg-glow shadow-[0_0_10px_var(--glow)]" />
      {children}
    </span>
  );
}

function GlowButton({
  children,
  variant = "primary",
  onClick,
}: {
  children: React.ReactNode;
  variant?: "primary" | "ghost";
  onClick?: () => void;
}) {
  if (variant === "ghost") {
    return (
      <button
        onClick={onClick}
        className="group inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-foreground transition hover:bg-white/10 hover:border-white/20"
      >
        {children}
      </button>
    );
  }
  return (
    <button
      onClick={onClick}
      className="group relative inline-flex items-center gap-2 rounded-xl bg-foreground px-5 py-3 text-sm font-semibold text-background transition hover:scale-[1.02] active:scale-[0.99]"
      style={{
        boxShadow:
          "0 0 0 1px color-mix(in oklab, var(--glow) 50%, transparent), 0 10px 40px -10px color-mix(in oklab, var(--glow) 60%, transparent)",
      }}
    >
      <span className="absolute inset-0 rounded-xl opacity-0 transition group-hover:opacity-100"
            style={{ background: "linear-gradient(135deg, color-mix(in oklab, var(--glow) 30%, transparent), color-mix(in oklab, var(--glow-2) 30%, transparent))" }} />
      <span className="relative">{children}</span>
    </button>
  );
}

/* --------------------------------- Background -------------------------------- */

function Particles() {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (reduce) return;
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
    };
    resize();
    window.addEventListener("resize", resize);
    const N = 60;
    const pts = Array.from({ length: N }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.15 * dpr,
      vy: (Math.random() - 0.5) * 0.15 * dpr,
      r: Math.random() * 1.4 * dpr + 0.4 * dpr,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of pts) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(160, 220, 255, 0.5)";
        ctx.fill();
      }
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const a = pts[i], b = pts[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d = Math.hypot(dx, dy);
          if (d < 120 * dpr) {
            ctx.strokeStyle = `rgba(120, 200, 255, ${0.12 * (1 - d / (120 * dpr))})`;
            ctx.lineWidth = dpr * 0.6;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, [reduce]);
  return <canvas ref={ref} className="absolute inset-0 h-full w-full" />;
}

function BackgroundFX() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 hero-bg" />
      <div className="absolute inset-0 grid-bg" />
      <div className="absolute inset-0 opacity-60"><Particles /></div>
    </div>
  );
}

/* ----------------------------------- Nav ------------------------------------ */

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="relative grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/5">
        <div className="absolute inset-0 rounded-lg" style={{ background: "linear-gradient(135deg, color-mix(in oklab, var(--glow) 30%, transparent), color-mix(in oklab, var(--glow-2) 30%, transparent))" }} />
        <svg viewBox="0 0 24 24" className="relative h-4 w-4 text-foreground" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 4h18M5 4v6a7 7 0 0 0 14 0V4M9 20h6M12 17v3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <span className="display text-base font-semibold tracking-tight">Venture Court</span>
    </div>
  );
}

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all ${scrolled ? "py-2" : "py-4"}`}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4">
        <div className={`flex w-full items-center justify-between rounded-2xl px-4 py-2.5 transition ${scrolled ? "glass-strong" : ""}`}>
          <Logo />
          <nav className="hidden items-center gap-7 md:flex">
            {["Workflow", "Council", "Architecture", "Demo"].map((l) => (
              <a key={l} href={`#${l.toLowerCase()}`} className="text-sm text-muted-foreground transition hover:text-foreground">{l}</a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <a href="#trial" className="hidden text-sm text-muted-foreground hover:text-foreground sm:inline">Sign in</a>
            <GlowButton>Open Court →</GlowButton>
          </div>
        </div>
      </div>
    </header>
  );
}

/* ---------------------------------- Hero ----------------------------------- */

const HERO_LOGS = [
  { agent: "CMO", tone: "var(--glow)", text: "TAM appears larger than expected. ICP signals strong on Reddit r/startups…" },
  { agent: "CTO", tone: "var(--glow-3)", text: "MVP technically feasible in ~2 weeks. Stack: Next.js + Postgres + pgvector." },
  { agent: "CONTRARIAN", tone: "#ff7a90", text: "CAC may kill margins. Distribution moat unclear. Pressure-test pricing." },
  { agent: "CEO", tone: "var(--glow-2)", text: "Verdict: Proceed to Market Research. Spawn research agents…" },
];

function useTypewriter(text: string, speed = 18, start = true) {
  const [out, setOut] = useState("");
  useEffect(() => {
    if (!start) return;
    setOut("");
    let i = 0;
    const id = setInterval(() => {
      i++;
      setOut(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed, start]);
  return out;
}

function StreamingLog() {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState<number[]>([]);
  const current = HERO_LOGS[step];
  const typed = useTypewriter(current.text, 14, true);
  useEffect(() => {
    if (typed === current.text) {
      const t = setTimeout(() => {
        setDone((d) => [...d, step]);
        setStep((s) => (s + 1) % HERO_LOGS.length);
      }, 1200);
      return () => clearTimeout(t);
    }
  }, [typed, current.text, step]);

  return (
    <div className="glass-strong border-gradient relative overflow-hidden rounded-2xl p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          <span className="ml-3 mono text-xs text-muted-foreground">council.stream</span>
        </div>
        <span className="mono text-[10px] text-muted-foreground">SSE • LIVE</span>
      </div>
      <div className="space-y-2.5 mono text-[13px] leading-relaxed">
        {HERO_LOGS.slice(0, step).map((l, i) => (
          <div key={i} className="flex gap-3">
            <span className="shrink-0 font-semibold" style={{ color: l.tone as string }}>{l.agent}</span>
            <span className="text-muted-foreground">→ {l.text}</span>
          </div>
        ))}
        <div className="flex gap-3">
          <span className="shrink-0 font-semibold" style={{ color: current.tone as string }}>{current.agent}</span>
          <span className="text-foreground/90">→ {typed}<span className="inline-block w-1.5 h-3.5 -mb-0.5 bg-foreground/80 animate-blink ml-0.5" /></span>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2 border-t border-white/5 pt-3 mono text-[11px] text-muted-foreground">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-glow opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-glow" />
        </span>
        streaming reasoning · {done.length + 1}/{HERO_LOGS.length}
      </div>
    </div>
  );
}

function FloatingAgent({ name, color, x, y, delay }: { name: string; color: string; x: string; y: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.8 }}
      className="absolute hidden lg:block"
      style={{ left: x, top: y }}
    >
      <div className="animate-float" style={{ animationDelay: `${delay}s` }}>
        <div className="glass relative flex items-center gap-2.5 rounded-xl px-3 py-2 shadow-xl">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-70" style={{ background: color }} />
            <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: color, boxShadow: `0 0 12px ${color}` }} />
          </span>
          <span className="mono text-xs font-semibold tracking-wide">{name}</span>
        </div>
      </div>
    </motion.div>
  );
}

function Hero() {
  const [idea, setIdea] = useState("");
  return (
    <section className="relative isolate overflow-hidden pt-32 pb-24">
      <BackgroundFX />
      <div className="relative mx-auto max-w-6xl px-4">
        <FloatingAgent name="CEO"        color="oklch(0.65 0.22 305)" x="6%"  y="60px"  delay={0.2} />
        <FloatingAgent name="CMO"        color="oklch(0.78 0.18 200)" x="84%" y="40px"  delay={0.5} />
        <FloatingAgent name="CTO"        color="oklch(0.72 0.2 155)"  x="2%"  y="320px" delay={0.8} />
        <FloatingAgent name="CONTRARIAN" color="oklch(0.7 0.22 25)"   x="86%" y="300px" delay={1.1} />

        <motion.div initial="hidden" animate="show" variants={fadeUp} className="mx-auto max-w-3xl text-center">
          <Pill>Multi-agent AI startup council · v1.0</Pill>
          <h1 className="display mt-6 text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
            Your AI <GradientText>Boardroom</GradientText> for<br className="hidden sm:block" /> Startup Decisions
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
            CMO, CTO, Contrarian, and CEO AI agents debate your startup idea in real time —
            then generate market research and a working MVP automatically.
          </p>

          <div id="trial" className="mx-auto mt-10 max-w-2xl">
            <div className="glass-strong border-gradient flex items-center gap-2 rounded-2xl p-2">
              <div className="pl-3 text-muted-foreground">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v3M12 19v3M5 12H2M22 12h-3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2" strokeLinecap="round" /></svg>
              </div>
              <input
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="A marketplace for freelance AI prompt engineers…"
                className="flex-1 bg-transparent px-2 py-2.5 text-sm outline-none placeholder:text-muted-foreground/70"
              />
              <GlowButton>Put on Trial →</GlowButton>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
              <button className="rounded-full border border-white/10 px-3 py-1 hover:bg-white/5">▶ Watch Demo</button>
              <span className="mono">⌘K to open court</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.9 }}
          className="relative mx-auto mt-16 max-w-3xl"
        >
          <div className="absolute -inset-8 -z-10 rounded-[2rem] opacity-60 blur-3xl"
               style={{ background: "radial-gradient(closest-side, color-mix(in oklab, var(--glow) 50%, transparent), transparent 70%)" }} />
          <StreamingLog />
        </motion.div>
      </div>
    </section>
  );
}

/* ----------------------------- Section helpers ----------------------------- */

function SectionHeader({ eyebrow, title, sub }: { eyebrow: string; title: React.ReactNode; sub?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto max-w-2xl text-center"
    >
      <Pill>{eyebrow}</Pill>
      <h2 className="display mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">{title}</h2>
      {sub && <p className="mt-4 text-muted-foreground">{sub}</p>}
    </motion.div>
  );
}

/* ------------------------------- How it works ------------------------------ */

const STAGES = [
  {
    n: "01", title: "Ideation",
    desc: "AI agents debate your startup idea using a Karpathy-style reasoning council.",
    color: "var(--glow)",
    features: ["CEO orchestration", "CMO market thinking", "CTO technical analysis", "Contrarian stress testing", "Real-time streamed reasoning"],
    icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 3a6 6 0 0 0-4 10.5V17a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-3.5A6 6 0 0 0 12 3Z"/><path d="M10 21h4"/></svg>),
  },
  {
    n: "02", title: "Market Research",
    desc: "Live market validation powered by web-scraping agents and competitive analysis.",
    color: "var(--glow-3)",
    features: ["Competitor discovery", "Reddit / TikTok signals", "Market sizing", "Risk analysis", "Customer pain extraction"],
    icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>),
  },
  {
    n: "03", title: "Prototyping",
    desc: "AI software engineers generate and refine a working MVP automatically.",
    color: "var(--glow-2)",
    features: ["AI-generated codebase", "Automated code review", "Self-healing iteration loop", "Live preview iframe", "Feedback refinement cycle"],
    icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m8 18-6-6 6-6"/><path d="m16 6 6 6-6 6"/></svg>),
  },
];

function HowItWorks() {
  return (
    <section id="workflow" className="relative py-28">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeader
          eyebrow="The 3-stage workflow"
          title={<>From raw idea to <GradientText>validated MVP</GradientText></>}
          sub="A continuous loop. Reason → Research → Build. Repeat until conviction."
        />
        <div className="relative mt-16 grid gap-6 md:grid-cols-3">
          <div className="absolute left-0 right-0 top-24 hidden h-px md:block"
               style={{ background: "linear-gradient(90deg, transparent, color-mix(in oklab, var(--glow) 50%, transparent), color-mix(in oklab, var(--glow-2) 50%, transparent), transparent)" }} />
          {STAGES.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="glass border-gradient group relative rounded-2xl p-6 transition hover:-translate-y-1"
            >
              <div className="mb-5 flex items-center justify-between">
                <div className="grid h-12 w-12 place-items-center rounded-xl border border-white/10"
                     style={{ background: `radial-gradient(closest-side, color-mix(in oklab, ${s.color} 30%, transparent), transparent)` }}>
                  <div className="h-6 w-6" style={{ color: s.color as string }}>{s.icon}</div>
                </div>
                <span className="mono text-xs text-muted-foreground">{s.n}</span>
              </div>
              <h3 className="display text-2xl font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              <ul className="mt-5 space-y-2 text-sm">
                {s.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-muted-foreground">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full" style={{ background: s.color as string, boxShadow: `0 0 8px ${s.color}` }} />
                    {f}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ AI Council Cards ----------------------------- */

const AGENTS = [
  { name: "CEO",        role: "Strategic Orchestrator", color: "var(--glow-2)", quote: "Synthesizing council verdict…" },
  { name: "CMO",        role: "Market Strategist",      color: "var(--glow)",   quote: "TAM ≈ $2.4B. Wedge: prosumer." },
  { name: "CTO",        role: "Technical Architect",    color: "var(--glow-3)", quote: "Stack ready. Build path clear." },
  { name: "CONTRARIAN", role: "Devil's Advocate",       color: "oklch(0.7 0.22 25)", quote: "Distribution risk too high." },
  { name: "SWE-1",      role: "Builder Agent",          color: "oklch(0.78 0.18 240)", quote: "Scaffolded 14 files…" },
  { name: "SWE-2",      role: "Reviewer Agent",         color: "oklch(0.72 0.18 100)", quote: "All checks passing ✓" },
];

function AgentCard({ a, i }: { a: typeof AGENTS[0]; i: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, delay: i * 0.06 }}
      className="glass border-gradient group relative overflow-hidden rounded-2xl p-5 transition hover:-translate-y-1"
    >
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-40 blur-2xl transition group-hover:opacity-70"
           style={{ background: a.color as string }} />
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5">
            <span className="absolute inset-0 rounded-xl animate-pulse-glow" style={{ ["--glow" as string]: a.color }} />
            <span className="mono relative text-[10px] font-bold" style={{ color: a.color as string }}>{a.name.slice(0,2)}</span>
          </div>
          <div>
            <div className="display text-sm font-semibold">{a.name}</div>
            <div className="text-xs text-muted-foreground">{a.role}</div>
          </div>
        </div>
        <span className="mono text-[10px] text-muted-foreground">online</span>
      </div>
      <div className="relative mt-4 rounded-lg border border-white/5 bg-black/20 p-3 mono text-[12px] text-muted-foreground">
        <span className="opacity-60">›</span> {a.quote}
      </div>
    </motion.div>
  );
}

function Council() {
  return (
    <section id="council" className="relative py-28">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeader
          eyebrow="The AI council"
          title={<>Six agents. <GradientText>One verdict.</GradientText></>}
          sub="Each agent reasons in its own lens. The court synthesizes the truth."
        />
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {AGENTS.map((a, i) => <AgentCard key={a.name} a={a} i={i} />)}
        </div>
      </div>
    </section>
  );
}

/* --------------------------- Karpathy Council Orbit -------------------------- */

const PERSONAS = [
  { name: "The Contrarian",            color: "oklch(0.7 0.22 25)" },
  { name: "First Principles Thinker",  color: "var(--glow)" },
  { name: "The Expansionist",          color: "var(--glow-2)" },
  { name: "The Outsider",              color: "var(--glow-3)" },
  { name: "The Executor",              color: "oklch(0.78 0.18 240)" },
];

function CouncilOrbit() {
  return (
    <section className="relative py-28">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeader
          eyebrow="Karpathy-style reasoning"
          title={<>The <GradientText>council debate</GradientText></>}
          sub="Every major decision is stress-tested through multiple reasoning lenses before a verdict is reached."
        />
        <div className="relative mx-auto mt-16 aspect-square w-full max-w-[560px]">
          {/* rings */}
          {[0.45, 0.72, 1].map((r, i) => (
            <div key={i} className="absolute inset-0 m-auto rounded-full border border-white/5"
                 style={{ width: `${r*100}%`, height: `${r*100}%` }} />
          ))}
          <div className="absolute inset-0 m-auto rounded-full"
               style={{ width: "30%", height: "30%", background: "radial-gradient(closest-side, color-mix(in oklab, var(--glow) 40%, transparent), transparent)" }} />
          <div className="absolute inset-0 grid place-items-center">
            <div className="glass border-gradient relative grid h-28 w-28 place-items-center rounded-full text-center">
              <div>
                <div className="display text-sm font-semibold">Verdict</div>
                <div className="mono text-[10px] text-muted-foreground">consensus engine</div>
              </div>
            </div>
          </div>
          {/* orbit nodes */}
          {PERSONAS.map((p, i) => {
            const angle = (i / PERSONAS.length) * Math.PI * 2;
            const r = 42; // %
            const x = 50 + Math.cos(angle) * r;
            const y = 50 + Math.sin(angle) * r;
            return (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, scale: 0.7 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i, duration: 0.5 }}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${x}%`, top: `${y}%` }}
              >
                <div className="glass flex items-center gap-2 rounded-full px-3 py-1.5">
                  <span className="h-2 w-2 rounded-full animate-pulse-glow"
                        style={{ background: p.color as string, ["--glow" as string]: p.color }} />
                  <span className="mono text-[11px] font-semibold whitespace-nowrap">{p.name}</span>
                </div>
              </motion.div>
            );
          })}
          {/* connecting lines */}
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100">
            {PERSONAS.map((_, i) => {
              const a = (i / PERSONAS.length) * Math.PI * 2;
              const x = 50 + Math.cos(a) * 42;
              const y = 50 + Math.sin(a) * 42;
              return (
                <line key={i} x1="50" y1="50" x2={x} y2={y}
                      stroke="url(#lineGrad)" strokeWidth="0.2" strokeDasharray="0.8 0.8" />
              );
            })}
            <defs>
              <linearGradient id="lineGrad" x1="0" x2="1">
                <stop offset="0%" stopColor="oklch(0.78 0.18 200)" stopOpacity="0.6" />
                <stop offset="100%" stopColor="oklch(0.65 0.22 305)" stopOpacity="0.3" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ Live workflow demo --------------------------- */

const RESEARCH_CARDS = [
  { title: "Competitors", value: "12 found", color: "var(--glow)" },
  { title: "TAM",         value: "$2.4B",    color: "var(--glow-2)" },
  { title: "Reddit pain", value: "+218 posts", color: "var(--glow-3)" },
];

const CODE_LINES = [
  "▸ scaffold next-app",
  "✓ generated 14 files",
  "▸ install deps (bun)",
  "✓ 184 packages added",
  "▸ swe-2 review pass",
  "✓ 0 errors · 2 warnings",
  "▸ deploy preview",
  "✓ live at trial-7f3.app",
];

function ProgressTracker({ stage }: { stage: number }) {
  const labels = ["Ideation", "Research", "Prototype"];
  return (
    <div className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 p-3">
      {labels.map((l, i) => (
        <div key={l} className="flex flex-1 items-center gap-2">
          <div className={`grid h-6 w-6 place-items-center rounded-full mono text-[10px] font-bold transition ${i <= stage ? "bg-foreground text-background" : "border border-white/15 text-muted-foreground"}`}>{i+1}</div>
          <span className={`text-xs ${i <= stage ? "text-foreground" : "text-muted-foreground"}`}>{l}</span>
          {i < labels.length - 1 && (
            <div className="relative ml-2 h-px flex-1 bg-white/10">
              <motion.div initial={{ width: 0 }} animate={{ width: i < stage ? "100%" : i === stage ? "60%" : "0%" }} transition={{ duration: 0.6 }}
                          className="absolute left-0 top-0 h-px" style={{ background: "linear-gradient(90deg, var(--glow), var(--glow-2))" }} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function LiveWorkflow() {
  const [stage, setStage] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setStage((s) => (s + 1) % 3), 4500);
    return () => clearInterval(id);
  }, []);
  return (
    <section id="demo" className="relative py-28">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeader
          eyebrow="Live workflow"
          title={<>Watch your idea <GradientText>come alive</GradientText></>}
          sub="From debate to deployed prototype — in one continuous stream."
        />
        <div className="mt-12">
          <ProgressTracker stage={stage} />
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {/* Left: streaming reasoning */}
            <div className="glass border-gradient rounded-2xl p-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="mono text-xs text-muted-foreground">reasoning.stream</span>
                <span className="mono text-[10px] text-glow">● LIVE</span>
              </div>
              <div className="space-y-2 mono text-[12.5px] leading-relaxed">
                {HERO_LOGS.map((l, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}>
                    <span className="font-semibold" style={{ color: l.tone as string }}>{l.agent}</span>
                    <span className="text-muted-foreground"> → {l.text}</span>
                  </motion.div>
                ))}
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {RESEARCH_CARDS.map((r) => (
                    <div key={r.title} className="rounded-lg border border-white/10 bg-white/5 p-2">
                      <div className="mono text-[10px] text-muted-foreground">{r.title}</div>
                      <div className="display text-sm font-semibold" style={{ color: r.color as string }}>{r.value}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 space-y-1 rounded-lg border border-white/5 bg-black/20 p-3 text-[12px]">
                  {CODE_LINES.map((c, i) => (
                    <motion.div key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                                className={c.startsWith("✓") ? "text-glow-3" : "text-muted-foreground"}>{c}</motion.div>
                  ))}
                </div>
              </div>
            </div>
            {/* Right: MVP browser */}
            <div className="glass border-gradient rounded-2xl p-5">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                </div>
                <div className="flex-1 ml-3 mono text-[11px] text-muted-foreground rounded-md border border-white/10 bg-black/30 px-2 py-1">https://trial-7f3.venture.court</div>
              </div>
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-white/10"
                   style={{ background: "linear-gradient(135deg, color-mix(in oklab, var(--glow) 14%, var(--card)), color-mix(in oklab, var(--glow-2) 14%, var(--card)))" }}>
                <div className="absolute inset-0 grid-bg opacity-50" />
                <div className="relative flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
                  <div className="mono text-[10px] text-muted-foreground">PROMPT-MARKET · v0.1</div>
                  <div className="display text-2xl font-semibold">Hire AI prompt engineers, instantly.</div>
                  <div className="text-xs text-muted-foreground">Vetted prompt artisans for your next release.</div>
                  <div className="mt-2 flex gap-2">
                    <div className="rounded-lg bg-foreground px-3 py-1.5 mono text-[11px] font-semibold text-background">Browse talent</div>
                    <div className="rounded-lg border border-white/15 px-3 py-1.5 mono text-[11px]">Post a brief</div>
                  </div>
                  <div className="mt-3 grid w-full max-w-xs grid-cols-3 gap-2">
                    {[1,2,3].map((i) => (
                      <div key={i} className="glass rounded-lg p-2 text-left">
                        <div className="h-6 w-6 rounded-full bg-white/10 mb-1" />
                        <div className="mono text-[9px] text-muted-foreground">Engineer #{i}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between mono text-[11px] text-muted-foreground">
                <span>build #284 · self-healed 2x</span>
                <span className="text-glow-3">deployed ✓</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- Architecture stack ---------------------------- */

const STACK = [
  { name: "Claude Sonnet 4", tag: "reasoning" },
  { name: "FastAPI",         tag: "backend" },
  { name: "React",           tag: "frontend" },
  { name: "Tailwind",        tag: "styling" },
  { name: "Nia by Nozomi",   tag: "intelligence" },
  { name: "CLod",            tag: "compute" },
  { name: "Greptile",        tag: "code review" },
  { name: "Allscale",        tag: "infra" },
];

const PIPELINES = [
  "Multi-agent orchestration",
  "Streaming SSE infrastructure",
  "Autonomous prototyping loop",
  "AI code review pipeline",
];

function Architecture() {
  return (
    <section id="architecture" className="relative py-28">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeader
          eyebrow="Built for builders"
          title={<>The <GradientText>operating system</GradientText> beneath</>}
          sub="A composable, streaming-first architecture optimized for autonomous reasoning and code generation."
        />
        <div className="mt-14 grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {STACK.map((s, i) => (
              <motion.div key={s.name} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                          transition={{ delay: i * 0.04 }}
                          className="glass border-gradient group rounded-2xl p-4 transition hover:-translate-y-1">
                <div className="mb-3 grid h-8 w-8 place-items-center rounded-lg border border-white/10 mono text-[10px] font-bold"
                     style={{ background: "linear-gradient(135deg, color-mix(in oklab, var(--glow) 25%, transparent), color-mix(in oklab, var(--glow-2) 25%, transparent))" }}>
                  {s.name.slice(0,2)}
                </div>
                <div className="display text-sm font-semibold">{s.name}</div>
                <div className="mono text-[10px] text-muted-foreground">{s.tag}</div>
              </motion.div>
            ))}
          </div>
          <div className="glass border-gradient rounded-2xl p-5 lg:col-span-2">
            <div className="mono text-xs text-muted-foreground mb-3">pipelines</div>
            <ul className="space-y-3">
              {PIPELINES.map((p, i) => (
                <li key={p} className="flex items-center gap-3">
                  <div className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 mono text-[10px] text-glow"
                       style={{ background: "color-mix(in oklab, var(--glow) 10%, transparent)" }}>
                    {String(i+1).padStart(2,"0")}
                  </div>
                  <span className="text-sm">{p}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5 rounded-lg border border-white/10 bg-black/30 p-3 mono text-[11px] text-muted-foreground">
              <div><span className="text-glow">POST</span> /api/v1/trial</div>
              <div className="opacity-60">→ stream: text/event-stream</div>
              <div className="opacity-60">→ events: agent.token, stage.delta, mvp.ready</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------- Stats ---------------------------------- */

function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        const start = performance.now();
        const dur = 1200;
        const tick = (t: number) => {
          const p = Math.min(1, (t - start) / dur);
          setN(Math.floor(p * value));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        io.disconnect();
      }
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [value]);
  return <span ref={ref}>{n}{suffix}</span>;
}

const STATS = [
  { v: 6,  s: "",      label: "AI Agents" },
  { v: 3,  s: "",      label: "Autonomous Stages" },
  { v: 100, s: "%",    label: "Streamed Reasoning" },
  { v: 24, s: "/7",    label: "Self-Improving Loop" },
];

function Stats() {
  return (
    <section className="relative py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="glass border-gradient grid grid-cols-2 gap-px overflow-hidden rounded-3xl bg-white/5 md:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="bg-card/40 p-6 text-center">
              <div className="display text-4xl font-semibold text-gradient">
                <AnimatedNumber value={s.v} suffix={s.s} />
              </div>
              <div className="mt-2 text-xs text-muted-foreground mono uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --------------------------- Demo / Judge Pitch ---------------------------- */

const TIMELINE = [
  { t: "00:00", agent: "USER",  text: "Idea: A marketplace for freelance AI prompt engineers." },
  { t: "00:02", agent: "CMO",   text: "Strong demand signal — prompt-eng job postings up 340% YoY." },
  { t: "00:04", agent: "CONTRARIAN", text: "Talent supply will commoditize. Differentiate on trust + reviews." },
  { t: "00:09", agent: "CTO",   text: "Marketplace MVP feasible in 9 days. Core: profiles, escrow, briefs." },
  { t: "00:14", agent: "RESEARCH", text: "12 competitors mapped. Closest: PromptBase (transactional, no SLAs)." },
  { t: "00:21", agent: "SWE-1", text: "Generated 31 files. Pages: /browse, /brief, /engineer/[id]." },
  { t: "00:24", agent: "SWE-2", text: "Review passed. Type checks ✓. Live preview deployed." },
  { t: "00:25", agent: "CEO",   text: "Verdict: SHIP MVP. Recommended next steps in dossier." },
];

function PitchDemo() {
  return (
    <section className="relative py-28">
      <div className="mx-auto max-w-5xl px-4">
        <SectionHeader
          eyebrow="See it in action"
          title={<>“A marketplace for <GradientText>freelance AI prompt engineers</GradientText>”</>}
          sub="A real trial in under 30 seconds. Reasoning, research, and a live MVP."
        />
        <div className="relative mt-14">
          <div className="absolute left-[68px] top-2 bottom-2 w-px bg-gradient-to-b from-transparent via-white/15 to-transparent md:left-[80px]" />
          <ul className="space-y-4">
            {TIMELINE.map((row, i) => (
              <motion.li key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.2 }}
                         transition={{ delay: i * 0.05 }}
                         className="relative flex items-start gap-4">
                <div className="w-14 shrink-0 mono text-[11px] text-muted-foreground pt-2 md:w-20">{row.t}</div>
                <div className="relative">
                  <div className="absolute -left-[10px] top-3 h-3 w-3 rounded-full bg-glow shadow-[0_0_12px_var(--glow)]" />
                </div>
                <div className="glass flex-1 rounded-xl p-3">
                  <div className="mono text-[11px] font-semibold text-glow">{row.agent}</div>
                  <div className="mt-0.5 text-sm text-foreground/90">{row.text}</div>
                </div>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------- Final CTA -------------------------------- */

function FinalCTA() {
  return (
    <section className="relative py-32">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 hero-bg opacity-90" />
        <div className="absolute inset-0 grid-bg" />
      </div>
      <div className="mx-auto max-w-3xl px-4 text-center">
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                   className="display text-5xl font-semibold tracking-tight sm:text-7xl">
          Stop Building <GradientText>Blind.</GradientText>
        </motion.h2>
        <p className="mx-auto mt-5 max-w-xl text-muted-foreground">
          Let an AI startup council challenge your assumptions before you commit
          months of time and money.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <GlowButton>Start Your First Trial →</GlowButton>
          <GlowButton variant="ghost">View Architecture</GlowButton>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------- Footer --------------------------------- */

function Footer() {
  return (
    <footer className="relative border-t border-white/5 py-12">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div>
            <Logo />
            <p className="mt-3 text-xs text-muted-foreground mono">Built with Claude Code</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {["Nia by Nozomi", "CLod", "Greptile", "Allscale"].map((s) => (
              <span key={s} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 mono text-[11px] text-muted-foreground">{s}</span>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <a href="#" aria-label="GitHub" className="rounded-lg border border-white/10 bg-white/5 p-2 text-muted-foreground transition hover:text-foreground">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5C5.65.5.5 5.65.5 12a11.5 11.5 0 0 0 7.86 10.93c.58.11.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.69 1.24 3.34.95.1-.74.4-1.24.72-1.53-2.55-.29-5.23-1.27-5.23-5.66 0-1.25.45-2.27 1.18-3.07-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.15 1.17a10.94 10.94 0 0 1 5.74 0c2.19-1.48 3.15-1.17 3.15-1.17.62 1.58.23 2.75.12 3.04.74.8 1.18 1.82 1.18 3.07 0 4.4-2.69 5.36-5.25 5.65.41.36.78 1.07.78 2.16v3.2c0 .31.21.68.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z"/></svg>
            </a>
            <a href="#" aria-label="Twitter" className="rounded-lg border border-white/10 bg-white/5 p-2 text-muted-foreground transition hover:text-foreground">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2H21l-6.52 7.45L22 22h-6.99l-4.66-5.97L4.8 22H2l6.99-7.99L2 2h7.14l4.21 5.51L18.244 2Zm-1.224 18h1.62L7.06 4H5.34l11.68 16Z"/></svg>
            </a>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-start justify-between gap-2 border-t border-white/5 pt-6 text-xs text-muted-foreground md:flex-row">
          <p>© {new Date().getFullYear()} Venture Court. All rights reserved.</p>
          <p className="mono">put-your-startup-on-trial</p>
        </div>
      </div>
    </footer>
  );
}

/* ---------------------------------- Page ---------------------------------- */

export default function Landing() {
  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <Council />
        <CouncilOrbit />
        <LiveWorkflow />
        <Architecture />
        <Stats />
        <PitchDemo />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
