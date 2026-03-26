"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Code2,
  Database,
  Heart,
  Lock,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";

const VALUES = [
  { icon: Target, title: "Universal builder", desc: "Xina supports 10+ database engines \u2014 from PostgreSQL and MySQL to MongoDB, Appwrite, and Firebase. One tool for every data layer.", accent: "from-purple-500 to-blue-500" },
  { icon: Zap, title: "Developer-first", desc: "Built by developers, for developers. AI-powered generation, drag & drop, keyboard shortcuts, code generation, and zero friction between idea and implementation.", accent: "from-amber-500 to-orange-500" },
  { icon: Lock, title: "Privacy by design", desc: "Your credentials stay in your browser. No telemetry, no analytics, no server-side storage. You own your data completely.", accent: "from-emerald-500 to-teal-500" },
  { icon: Heart, title: "Open & transparent", desc: "Open-source core with a clear roadmap. Every release is documented in the changelog. Community contributions are welcome.", accent: "from-violet-500 to-purple-500" },
];

const TECH_STACK = [
  { name: "Next.js 16", desc: "App Router with React 19 and server components", logo: "https://cdn.simpleicons.org/nextdotjs/white" },
  { name: "TypeScript", desc: "End-to-end type safety across the entire codebase", logo: "https://cdn.simpleicons.org/typescript/white" },
  { name: "Multi-Engine Adapters", desc: "SQL, NoSQL, and BaaS connectors for 10+ databases", logo: "https://cdn.simpleicons.org/postgresql/white" },
  { name: "Framer Motion", desc: "60fps animations for canvas interactions and page transitions", logo: "https://cdn.simpleicons.org/framer/white" },
  { name: "Tailwind CSS 4", desc: "Utility-first styling with dark mode by default", logo: "https://cdn.simpleicons.org/tailwindcss/white" },
  { name: "AI Integration", desc: "GPT-4, Claude, Gemini for natural language schema generation", logo: "/logos/openai.svg" },
];

const TIMELINE = [
  { date: "Mar 2025", title: "v0.1 \u2014 Initial release", desc: "Appwrite connection, collection listing, and initial canvas rendering." },
  { date: "Apr 2025", title: "v0.2 \u2014 Interactive canvas", desc: "Drag, pan, zoom, obstacle-aware edge routing, side panel with schema/perms/indexes." },
  { date: "May 2025", title: "v0.3 \u2014 ERD notation", desc: "Crow's foot markers, system attributes, relationship deduplication, visual polish." },
  { date: "Jun 2025", title: "v0.4 \u2014 Code generation", desc: "Multi-language typed code output, PNG/SVG export, clipboard copy." },
  { date: "Sep 2025", title: "v0.5 \u2014 Multi-engine support", desc: "PostgreSQL, MySQL, SQLite, MongoDB adapters. Universal schema builder." },
  { date: "Jan 2026", title: "v0.6 \u2014 AI & drag-drop", desc: "AI schema generation with GPT-4 & Claude. Drag & drop table builder. Firebase, Oracle, SQL Server support." },
];

const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } };

export default function AboutPage() {
  return (
    <div className="relative overflow-hidden">
      {/* Animated background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        <div className="absolute -top-40 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-purple-600/[0.07] blur-[150px]" />
        <div className="absolute right-0 top-60 h-[400px] w-[400px] rounded-full bg-violet-600/[0.04] blur-[120px]" />
      </div>

      {/* Header */}
      <section className="relative mx-auto max-w-4xl px-6 pb-16 pt-28 text-center md:pt-36">
        <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }} className="flex flex-col items-center">
          <motion.div variants={fadeUp} transition={{ duration: 0.5 }} className="mb-5 inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/[0.06] px-4 py-1.5 text-xs font-medium text-purple-400 backdrop-blur-sm">
            <Sparkles size={12} /> About
          </motion.div>
          <motion.h1 variants={fadeUp} transition={{ duration: 0.5 }} className="max-w-2xl text-3xl font-extrabold tracking-tight text-white md:text-5xl">
            The story behind{" "}
            <span className="text-purple-400">Xina</span>
          </motion.h1>
          <motion.p variants={fadeUp} transition={{ duration: 0.5 }} className="mt-4 max-w-xl text-base leading-relaxed text-zinc-400 md:text-lg">
            Xina was born from a simple frustration: there was no universal visual tool for designing database schemas across SQL, NoSQL, and BaaS platforms. Generic ERD tools don&apos;t understand Appwrite&apos;s relationship model, PostgreSQL constraints, or MongoDB document structures. So we built one that handles them all \u2014 powered by AI.
          </motion.p>
        </motion.div>
      </section>

      {/* Mission */}
      <section className="relative mx-auto max-w-4xl px-6 pb-28">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5 }} className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <span className="mb-3 inline-block rounded-full bg-purple-500/[0.08] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-purple-400">Mission</span>
            <h2 className="mb-3 text-xl font-bold text-white md:text-2xl">Our mission</h2>
            <p className="text-[14px] leading-relaxed text-zinc-400">
              Make database design as intuitive as using a whiteboard \u2014 but with the power to push changes directly to any backend. We believe every developer should be able to visualize, understand, and modify their data model across any database engine without writing boilerplate code.
            </p>
          </div>
          <div className="flex items-center justify-center">
            <div className="group relative h-52 w-52">
              <div className="absolute inset-0 rounded-3xl border border-white/[0.06] bg-white/[0.02] transition-all group-hover:border-white/[0.1]" />
              <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-purple-600/[0.08] blur-[40px]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto mb-3 text-purple-400">
                    <Database size={32} />
                  </div>
              <p className="text-sm font-semibold text-white">Universal Database Design</p>
              <p className="mt-0.5 text-[11px] text-zinc-500">SQL, NoSQL & BaaS</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Values */}
      <section className="relative mx-auto max-w-6xl px-6 pb-32">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.5 }} className="mb-14 text-center">
          <span className="mb-3 inline-block rounded-full bg-violet-500/[0.08] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-violet-400">Values</span>
          <h2 className="text-2xl font-bold tracking-tight text-white md:text-4xl">What we believe</h2>
          <p className="mt-3 text-sm text-zinc-500">The principles that guide every decision.</p>
        </motion.div>
        <div className="grid gap-5 sm:grid-cols-2">
          {VALUES.map((v, i) => (
            <motion.div key={v.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.4, delay: i * 0.06 }} className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-7 transition-all hover:border-white/[0.1]">
              <div className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${v.accent} opacity-0 blur-[40px] transition-opacity group-hover:opacity-[0.06]`} />
              <div className="mb-4 text-purple-400"><v.icon size={22} /></div>
              <h3 className="mb-2 text-[15px] font-semibold text-white">{v.title}</h3>
              <p className="text-[13px] leading-relaxed text-zinc-500">{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="relative mx-auto max-w-3xl px-6 pb-32">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.5 }} className="mb-14 text-center">
          <span className="mb-3 inline-block rounded-full bg-emerald-500/[0.08] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">History</span>
          <h2 className="text-2xl font-bold tracking-tight text-white md:text-4xl">Project timeline</h2>
        </motion.div>
        <div className="space-y-0">
          {TIMELINE.map((t, i) => (
            <motion.div key={t.date} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-30px" }} transition={{ duration: 0.35, delay: i * 0.05 }} className="relative border-l-2 border-white/[0.06] pb-10 pl-8 last:pb-0">
              <div className="absolute -left-2 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-purple-500/40 bg-[#09090b] ring-4 ring-[#09090b]" />
              <span className="block text-xs font-semibold text-purple-400">{t.date}</span>
              <h3 className="mt-1 text-[15px] font-semibold text-white">{t.title}</h3>
              <p className="mt-1 text-[13px] leading-relaxed text-zinc-500">{t.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Tech stack */}
      <section className="relative mx-auto max-w-4xl px-6 pb-32">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.5 }} className="mb-14 text-center">
          <span className="mb-3 inline-block rounded-full bg-amber-500/[0.08] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-400">Stack</span>
          <h2 className="text-2xl font-bold tracking-tight text-white md:text-4xl">Tech stack</h2>
          <p className="mt-3 text-sm text-zinc-500">The technologies powering Xina under the hood.</p>
        </motion.div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TECH_STACK.map((t, i) => (
            <motion.div key={t.name} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-30px" }} transition={{ duration: 0.35, delay: i * 0.04 }} className="group flex items-start gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 transition-all hover:border-white/[0.1]">
              <img src={t.logo} alt={t.name} className="mt-0.5 h-5 w-5 shrink-0 opacity-60" />
              <div>
                <p className="text-[14px] font-semibold text-zinc-200">{t.name}</p>
                <p className="mt-1 text-[12px] leading-relaxed text-zinc-500">{t.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative mx-auto max-w-4xl px-6 pb-28">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5 }} className="relative overflow-hidden rounded-3xl border border-purple-500/20 bg-gradient-to-br from-purple-600/[0.12] via-violet-600/[0.06] to-transparent p-10 text-center md:p-16">
          <div className="pointer-events-none absolute -left-20 -top-20 h-60 w-60 rounded-full bg-purple-600/10 blur-[80px]" />
          <div className="pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-violet-600/10 blur-[60px]" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, #fff 0.5px, transparent 0.5px)", backgroundSize: "20px 20px" }} />
          <div className="relative">
            <h2 className="text-2xl font-bold text-white md:text-4xl">Try Xina today</h2>
            <p className="mt-3 text-sm text-zinc-400 md:text-base">Free, open, and built for every database developer.</p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/studio" className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-[#09090b] shadow-xl transition-all hover:bg-zinc-100">
                Open Studio <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link href="/docs" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-7 py-3.5 text-sm font-semibold text-white transition-all hover:border-white/30 hover:bg-white/[0.06]">
                Read Docs
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
