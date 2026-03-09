"use client";

import Link from "next/link";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Cloud,
  Code2,
  Database,
  ExternalLink,
  GitBranch,
  Github,
  Globe,
  Key,
  Layers,
  Lock,
  Monitor,
  MousePointerClick,
  Quote,
  Server,
  Shield,
  Sparkles,
  Star,
  Terminal,
  Zap,
} from "lucide-react";
import { useState } from "react";

const FEATURES = [
  { icon: Database, title: "Live Schema Sync", desc: "Connect your Appwrite project and see every database, collection, and attribute instantly reflected on the canvas.", accent: "from-indigo-500 to-blue-500" },
  { icon: GitBranch, title: "Relationship Mapping", desc: "One-way and two-way relationships are auto-detected and rendered with proper ERD notation — crow's foot and arrows.", accent: "from-violet-500 to-purple-500" },
  { icon: Layers, title: "Visual ERD Canvas", desc: "Drag, pan, and zoom a fully interactive entity-relationship diagram. Obstacle-aware edge routing keeps lines clean.", accent: "from-cyan-500 to-teal-500" },
  { icon: MousePointerClick, title: "Click to Inspect", desc: "Select any collection or attribute to view its details, edit properties, and manage indexes in the side panel.", accent: "from-amber-500 to-orange-500" },
  { icon: Zap, title: "Instant Operations", desc: "Create databases, collections, and attributes directly from the studio. Changes are pushed to Appwrite in real-time.", accent: "from-emerald-500 to-green-500" },
  { icon: Sparkles, title: "Smart Layout", desc: "Collections auto-arrange on the canvas. System attributes ($id, $createdAt, $updatedAt) are shown automatically.", accent: "from-pink-500 to-rose-500" },
];

const STEPS = [
  { num: "01", title: "Connect", desc: "Paste your Appwrite endpoint, project ID, and API key.", icon: Key },
  { num: "02", title: "Visualize", desc: "Your databases and collections render as an interactive ERD.", icon: Monitor },
  { num: "03", title: "Edit", desc: "Create, modify, or delete schema elements from the canvas.", icon: Code2 },
  { num: "04", title: "Ship", desc: "Changes sync to Appwrite instantly. Your backend is ready.", icon: Zap },
];

const STATS = [
  { value: "100%", label: "Free core features", icon: Sparkles },
  { value: "<2min", label: "Setup time", icon: Zap },
  { value: "13+", label: "Attribute types", icon: Database },
  { value: "∞", label: "Collections & databases", icon: Layers },
];

const TESTIMONIALS = [
  { name: "Alex M.", role: "Full-stack Developer", text: "Xina replaced my manual ERD drawings. I connect my Appwrite project and the schema is right there, live and editable.", avatar: "A", gradient: "from-indigo-500 to-violet-500" },
  { name: "Sarah K.", role: "Backend Engineer", text: "The relationship visualization is exactly what I needed. Crow's foot notation makes it easy to understand my data model at a glance.", avatar: "S", gradient: "from-violet-500 to-purple-500" },
  { name: "Raj P.", role: "Indie Hacker", text: "I use Appwrite for all my side projects. Xina lets me design schemas visually before writing a single line of code.", avatar: "R", gradient: "from-blue-500 to-cyan-500" },
];

const TECH = [
  { icon: Globe, name: "Next.js 16", desc: "App Router with React 19" },
  { icon: Server, name: "Appwrite", desc: "Databases, collections, attributes" },
  { icon: Terminal, name: "TypeScript", desc: "End-to-end type safety" },
  { icon: Layers, name: "Framer Motion", desc: "Smooth 60fps animations" },
  { icon: Shield, name: "Local-only", desc: "Credentials never leave your browser" },
  { icon: Lock, name: "API Key Scoped", desc: "Minimal permissions required" },
];

const FAQ = [
  { q: "Is Xina free?", a: "Yes — the core ERD canvas, schema management, relationship visualization, and all editing tools are completely free." },
  { q: "Does Xina store my API key?", a: "Your credentials are stored only in your browser's local state. They are never sent to any server other than your own Appwrite instance." },
  { q: "Which Appwrite versions are supported?", a: "Xina works with Appwrite Cloud and any self-hosted Appwrite 1.4+ instance via the REST API." },
  { q: "Can I use Xina with multiple projects?", a: "Yes. Switch credentials in the studio to connect to different Appwrite projects at any time." },
  { q: "Do I need to install anything?", a: "No. Xina runs entirely in the browser. Just open the studio and connect your project." },
  { q: "What attribute types are supported?", a: "All Appwrite attribute types: string, integer, float, boolean, email, URL, IP, enum, datetime, relationship, and more." },
];

const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } };

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/[0.06] last:border-0">
      <button type="button" onClick={() => setOpen(!open)} className="flex w-full items-center justify-between gap-4 px-1 py-5 text-left">
        <span className="text-[14px] font-medium text-zinc-200">{q}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={16} className="shrink-0 text-zinc-500" />
        </motion.span>
      </button>
      <motion.div initial={false} animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
        <p className="pb-5 pl-1 text-[13px] leading-relaxed text-zinc-500">{a}</p>
      </motion.div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      {/* Animated grid background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        <div className="absolute -top-40 left-1/2 h-[800px] w-[1000px] -translate-x-1/2 rounded-full bg-indigo-600/[0.07] blur-[150px]" />
        <div className="absolute right-0 top-20 h-[500px] w-[500px] rounded-full bg-violet-600/[0.05] blur-[120px]" />
        <div className="absolute -left-40 top-[600px] h-[400px] w-[400px] rounded-full bg-blue-600/[0.04] blur-[100px]" />
        <motion.div animate={{ y: [0, -30, 0], x: [0, 15, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }} className="absolute left-1/4 top-1/3 h-2 w-2 rounded-full bg-indigo-400/20" />
        <motion.div animate={{ y: [0, 20, 0], x: [0, -10, 0] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 5 }} className="absolute right-1/3 top-1/4 h-1.5 w-1.5 rounded-full bg-violet-400/20" />
        <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 3 }} className="absolute left-2/3 top-1/2 h-1 w-1 rounded-full bg-blue-400/30" />
      </div>

      {/* ─── Hero ─── */}
      <section className="relative mx-auto max-w-6xl px-6 pb-20 pt-8">
        <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1 } } }} className="flex flex-col items-center text-center">
          <motion.div variants={fadeUp} transition={{ duration: 0.5 }} className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/[0.06] px-4 py-1.5 text-xs font-medium text-indigo-400 backdrop-blur-sm">
            <motion.span animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}><Sparkles size={12} /></motion.span> Visual Database Designer for Appwrite
          </motion.div>
          <motion.h1 variants={fadeUp} transition={{ duration: 0.5 }} className="max-w-4xl text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl md:text-7xl">
            Design your schema,{" "}
            <span className="relative">
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">visually</span>
              <motion.span initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }} className="absolute -bottom-1 left-0 h-[3px] w-full origin-left rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 opacity-40" />
            </span>
          </motion.h1>
          <motion.p variants={fadeUp} transition={{ duration: 0.5 }} className="mt-6 max-w-2xl text-base leading-relaxed text-zinc-400 md:text-lg">
            Xina connects to your Appwrite project and generates a live, interactive ERD canvas. Create collections, define relationships, and manage attributes — all from one place.
          </motion.p>
          <motion.div variants={fadeUp} transition={{ duration: 0.5 }} className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link href="/studio" className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-indigo-600 px-7 py-3.5 text-sm font-semibold text-white shadow-xl shadow-indigo-600/25 transition-all hover:bg-indigo-500 hover:shadow-indigo-500/30">
              <span className="relative z-10 flex items-center gap-2">Open Studio <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" /></span>
              <motion.span className="absolute inset-0 -z-0 bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
            <Link href="/docs" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-7 py-3.5 text-sm font-semibold text-zinc-300 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/[0.06]">
              Get Started
            </Link>
          </motion.div>
          <motion.p variants={fadeUp} transition={{ duration: 0.5 }} className="mt-5 flex items-center gap-2 text-xs text-zinc-600">
            <Shield size={11} /> Free forever &middot; No credit card &middot; No sign-up required
          </motion.p>
        </motion.div>

        {/* Hero visual */}
        <motion.div initial={{ opacity: 0, y: 50, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }} className="relative mx-auto mt-16 max-w-5xl">
          {/* Glow behind the window */}
          <div className="pointer-events-none absolute -inset-4 rounded-3xl bg-gradient-to-b from-indigo-600/[0.08] via-transparent to-transparent blur-2xl" />
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c0c0f] shadow-2xl shadow-black/50">
            <div className="flex items-center gap-2 border-b border-white/[0.06] bg-white/[0.02] px-5 py-3">
              <span className="h-3 w-3 rounded-full bg-[#ff5f57]" /><span className="h-3 w-3 rounded-full bg-[#febc2e]" /><span className="h-3 w-3 rounded-full bg-[#28c840]" />
              <span className="ml-3 text-xs text-zinc-600">Xina Studio — my-project</span>
              <span className="ml-auto rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[9px] font-semibold text-emerald-400">Connected</span>
            </div>
            <div className="relative h-72 bg-[#0a0a0c] p-8 md:h-[420px]">
              {/* Dot grid */}
              <div className="absolute inset-0 opacity-[0.12]" style={{ backgroundImage: "radial-gradient(circle, #555 0.8px, transparent 0.8px)", backgroundSize: "24px 24px" }} />

              {/* Users collection */}
              <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.7 }} className="absolute left-6 top-6 w-48 rounded-xl border border-white/[0.08] bg-[#111114] shadow-lg shadow-black/30 md:left-12 md:top-10 md:w-56">
                <div className="flex items-center gap-2 border-b border-white/[0.06] bg-white/[0.02] px-4 py-2.5"><Database size={12} className="text-indigo-400" /><span className="text-xs font-semibold text-white">Users</span><span className="ml-auto rounded-full bg-white/[0.06] px-1.5 py-0.5 font-mono text-[9px] text-zinc-500">5 attrs</span></div>
                <div className="space-y-0 text-[11px]">
                  <div className="flex items-center gap-2 px-4 py-1.5 text-zinc-500"><span className="text-zinc-600">$id</span><span className="ml-auto rounded bg-zinc-800/60 px-1.5 py-0.5 font-mono text-[8px] uppercase text-zinc-600">string</span></div>
                  <div className="flex items-center gap-2 bg-white/[0.02] px-4 py-1.5 text-zinc-400"><span>name</span><span className="ml-auto rounded bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[8px] uppercase text-emerald-600">string</span></div>
                  <div className="flex items-center gap-2 px-4 py-1.5 text-zinc-400"><span>email</span><span className="ml-auto rounded bg-sky-500/10 px-1.5 py-0.5 font-mono text-[8px] uppercase text-sky-600">email</span></div>
                  <div className="flex items-center gap-2 bg-white/[0.02] px-4 py-1.5 text-indigo-400"><span>posts</span><span className="ml-auto rounded bg-indigo-500/10 px-1.5 py-0.5 font-mono text-[8px] uppercase text-indigo-500">relation</span></div>
                </div>
              </motion.div>

              {/* Connection lines */}
              <svg className="absolute inset-0 h-full w-full" style={{ zIndex: 1 }}>
                <motion.path d="M 272 78 L 330 78 L 330 160 L 388 160" fill="none" stroke="url(#line-gradient)" strokeWidth={1.5} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, delay: 1.2 }} />
                <motion.path d="M 272 78 L 310 78 L 310 310 L 388 310" fill="none" stroke="url(#line-gradient-2)" strokeWidth={1.5} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.4, delay: 1.5 }} className="hidden md:block" />
                <defs>
                  <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#6366f1" stopOpacity={0.6} /><stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.3} /></linearGradient>
                  <linearGradient id="line-gradient-2" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} /><stop offset="100%" stopColor="#06b6d4" stopOpacity={0.2} /></linearGradient>
                </defs>
              </svg>

              {/* Posts collection */}
              <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.9 }} className="absolute right-6 top-6 w-48 rounded-xl border border-white/[0.08] bg-[#111114] shadow-lg shadow-black/30 md:right-12 md:top-10 md:w-56">
                <div className="flex items-center gap-2 border-b border-white/[0.06] bg-white/[0.02] px-4 py-2.5"><Database size={12} className="text-indigo-400" /><span className="text-xs font-semibold text-white">Posts</span><span className="ml-auto rounded-full bg-white/[0.06] px-1.5 py-0.5 font-mono text-[9px] text-zinc-500">4 attrs</span></div>
                <div className="space-y-0 text-[11px]">
                  <div className="flex items-center gap-2 px-4 py-1.5 text-zinc-500"><span className="text-zinc-600">$id</span><span className="ml-auto rounded bg-zinc-800/60 px-1.5 py-0.5 font-mono text-[8px] uppercase text-zinc-600">string</span></div>
                  <div className="flex items-center gap-2 bg-white/[0.02] px-4 py-1.5 text-zinc-400"><span>title</span><span className="ml-auto rounded bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[8px] uppercase text-emerald-600">string</span></div>
                  <div className="flex items-center gap-2 px-4 py-1.5 text-zinc-400"><span>body</span><span className="ml-auto rounded bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[8px] uppercase text-emerald-600">string</span></div>
                  <div className="flex items-center gap-2 bg-white/[0.02] px-4 py-1.5 text-indigo-400"><span>author</span><span className="ml-auto rounded bg-indigo-500/10 px-1.5 py-0.5 font-mono text-[8px] uppercase text-indigo-500">relation</span></div>
                </div>
              </motion.div>

              {/* Comments collection (third — visible on md+) */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 1.1 }} className="absolute bottom-16 right-6 hidden w-56 rounded-xl border border-white/[0.08] bg-[#111114] shadow-lg shadow-black/30 md:right-12 md:block">
                <div className="flex items-center gap-2 border-b border-white/[0.06] bg-white/[0.02] px-4 py-2.5"><Database size={12} className="text-cyan-400" /><span className="text-xs font-semibold text-white">Comments</span><span className="ml-auto rounded-full bg-white/[0.06] px-1.5 py-0.5 font-mono text-[9px] text-zinc-500">3 attrs</span></div>
                <div className="space-y-0 text-[11px]">
                  <div className="flex items-center gap-2 px-4 py-1.5 text-zinc-500"><span className="text-zinc-600">$id</span><span className="ml-auto rounded bg-zinc-800/60 px-1.5 py-0.5 font-mono text-[8px] uppercase text-zinc-600">string</span></div>
                  <div className="flex items-center gap-2 bg-white/[0.02] px-4 py-1.5 text-zinc-400"><span>body</span><span className="ml-auto rounded bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[8px] uppercase text-emerald-600">string</span></div>
                  <div className="flex items-center gap-2 px-4 py-1.5 text-indigo-400"><span>postId</span><span className="ml-auto rounded bg-indigo-500/10 px-1.5 py-0.5 font-mono text-[8px] uppercase text-indigo-500">relation</span></div>
                </div>
              </motion.div>

              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0a0a0c] to-transparent" />
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─── Works with ─── */}
      <section className="relative mx-auto max-w-4xl px-6 pb-20">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center">
          <p className="mb-6 text-xs font-medium uppercase tracking-widest text-zinc-600">Works seamlessly with</p>
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            {[
              { icon: Cloud, label: "Appwrite Cloud" },
              { icon: Server, label: "Self-hosted" },
              { icon: Database, label: "Any Appwrite 1.4+" },
              { icon: Shield, label: "REST API v1" },
            ].map((b) => (
              <div key={b.label} className="flex items-center gap-2 text-zinc-500 transition-colors hover:text-zinc-300">
                <b.icon size={16} />
                <span className="text-sm font-medium">{b.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ─── Stats bar ─── */}
      <section className="relative mx-auto max-w-5xl px-6 pb-28">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5 }} className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {STATS.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35, delay: i * 0.08 }} className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 text-center transition-colors hover:border-white/[0.1]">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-indigo-600/[0.03] to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="mx-auto mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600/10 text-indigo-400"><s.icon size={16} /></div>
              <p className="text-2xl font-extrabold text-white md:text-3xl">{s.value}</p>
              <p className="mt-1 text-xs text-zinc-500">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ─── How it works ─── */}
      <section className="relative mx-auto max-w-6xl px-6 pb-32">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.5 }} className="mb-14 text-center">
          <span className="mb-3 inline-block rounded-full bg-indigo-500/[0.08] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-indigo-400">How it works</span>
          <h2 className="text-2xl font-bold tracking-tight text-white md:text-4xl">Four steps to a complete schema</h2>
          <p className="mt-3 text-sm text-zinc-500 md:text-base">From zero to a visual ERD in under two minutes.</p>
        </motion.div>
        <div className="relative grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Connecting line */}
          <div className="pointer-events-none absolute left-0 right-0 top-14 hidden h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent lg:block" />
          {STEPS.map((s, i) => (
            <motion.div key={s.num} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.4, delay: i * 0.1 }} className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all hover:border-indigo-500/20 hover:bg-white/[0.04]">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-indigo-500/20 bg-indigo-600/10">
                <s.icon size={18} className="text-indigo-400" />
              </div>
              <span className="mb-1 block font-mono text-[11px] font-bold uppercase tracking-wider text-indigo-500/40">Step {s.num}</span>
              <h3 className="mb-1.5 text-[16px] font-semibold text-white">{s.title}</h3>
              <p className="text-[13px] leading-relaxed text-zinc-500">{s.desc}</p>
              {i < STEPS.length - 1 && (
                <div className="absolute -right-3 top-[3.25rem] hidden h-px w-6 bg-indigo-500/20 lg:block">
                  <ArrowRight size={10} className="absolute -right-1 -top-[4px] text-indigo-500/40" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── Features grid (bento) ─── */}
      <section className="relative mx-auto max-w-6xl px-6 pb-32">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.5 }} className="mb-14 text-center">
          <span className="mb-3 inline-block rounded-full bg-indigo-500/[0.08] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-indigo-400">Features</span>
          <h2 className="text-2xl font-bold tracking-tight text-white md:text-4xl">Everything you need to design schemas</h2>
          <p className="mt-3 text-sm text-zinc-500 md:text-base">A purpose-built visual tool for Appwrite databases.</p>
        </motion.div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.4, delay: i * 0.06 }} className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all hover:border-white/[0.12]">
              <div className={`pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-gradient-to-br ${f.accent} opacity-0 blur-[60px] transition-opacity duration-500 group-hover:opacity-[0.06]`} />
              <div className="relative">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.04] ring-1 ring-white/[0.08] transition-all group-hover:bg-white/[0.06] group-hover:ring-white/[0.12]"><f.icon size={18} className="text-indigo-400" /></div>
                <h3 className="mb-1.5 text-[15px] font-semibold text-white">{f.title}</h3>
                <p className="text-[13px] leading-relaxed text-zinc-500">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── Code generation preview ─── */}
      <section className="relative mx-auto max-w-6xl px-6 pb-32">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5 }}>
            <span className="mb-3 inline-block rounded-full bg-emerald-500/[0.08] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">Code Generation</span>
            <h2 className="mb-4 text-2xl font-bold text-white md:text-3xl">Generate typed code<br />in seconds</h2>
            <p className="mb-8 text-[15px] leading-relaxed text-zinc-400">
              Select a collection and Xina generates typed interfaces, model classes, or schema definitions in your language of choice.
            </p>
            <ul className="space-y-3">
              {["TypeScript interfaces & Zod schemas", "Python dataclasses & Pydantic", "Dart, Kotlin, Swift model classes", "PHP, Ruby, Go, Rust structs"].map((t) => (
                <li key={t} className="flex items-center gap-3 text-[14px] text-zinc-400">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10"><CheckCircle2 size={12} className="text-emerald-400" /></span> {t}
                </li>
              ))}
            </ul>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5 }}>
            <div className="relative">
              <div className="pointer-events-none absolute -inset-2 rounded-3xl bg-gradient-to-b from-indigo-600/[0.06] to-transparent blur-xl" />
              <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c0c0f] shadow-xl shadow-black/30">
                <div className="flex items-center gap-2 border-b border-white/[0.06] bg-white/[0.02] px-4 py-2.5">
                  <span className="rounded bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold text-indigo-400">TypeScript</span>
                  <span className="rounded bg-white/[0.04] px-2 py-0.5 text-[10px] text-zinc-600">Python</span>
                  <span className="rounded bg-white/[0.04] px-2 py-0.5 text-[10px] text-zinc-600">Dart</span>
                </div>
                <pre className="overflow-x-auto p-5 font-mono text-[12px] leading-relaxed">
                  <code>
                    <span className="text-violet-400">interface</span>{" "}<span className="text-emerald-400">Users</span>{" "}{"{\n"}
                    {"  "}<span className="text-zinc-400">$id</span><span className="text-zinc-600">:</span>{" "}<span className="text-amber-400">string</span>{";\n"}
                    {"  "}<span className="text-zinc-400">name</span><span className="text-zinc-600">:</span>{" "}<span className="text-amber-400">string</span>{";"}{" "}<span className="text-zinc-700">{"// required"}</span>{"\n"}
                    {"  "}<span className="text-zinc-400">email</span><span className="text-zinc-600">:</span>{" "}<span className="text-amber-400">string</span>{";"}{" "}<span className="text-zinc-700">{"// email"}</span>{"\n"}
                    {"  "}<span className="text-zinc-400">avatar</span><span className="text-zinc-600">?:</span>{" "}<span className="text-amber-400">string</span>{";"}{" "}<span className="text-zinc-700">{"// URL"}</span>{"\n"}
                    {"  "}<span className="text-zinc-400">role</span><span className="text-zinc-600">:</span>{" "}<span className="text-cyan-400">{'"admin"'}</span>{" "}<span className="text-zinc-600">|</span>{" "}<span className="text-cyan-400">{'"user"'}</span>{";\n"}
                    {"  "}<span className="text-zinc-400">posts</span><span className="text-zinc-600">:</span>{" "}<span className="text-emerald-400">Posts</span>{"[];"}{" "}<span className="text-zinc-700">{"// relationship"}</span>{"\n"}
                    {"  "}<span className="text-zinc-400">$createdAt</span><span className="text-zinc-600">:</span>{" "}<span className="text-amber-400">string</span>{";\n"}
                    {"  "}<span className="text-zinc-400">$updatedAt</span><span className="text-zinc-600">:</span>{" "}<span className="text-amber-400">string</span>{";\n"}
                    {"}"}
                  </code>
                </pre>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section className="relative mx-auto max-w-6xl px-6 pb-32">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.5 }} className="mb-14 text-center">
          <span className="mb-3 inline-block rounded-full bg-indigo-500/[0.08] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-indigo-400">Testimonials</span>
          <h2 className="text-2xl font-bold tracking-tight text-white md:text-4xl">Loved by developers</h2>
          <p className="mt-3 text-sm text-zinc-500 md:text-base">See what Appwrite developers are saying about Xina.</p>
        </motion.div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <motion.div key={t.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.4, delay: i * 0.06 }} className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all hover:border-white/[0.1]">
              <div className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-gradient-to-br from-indigo-600/[0.04] to-violet-600/[0.04] blur-2xl opacity-0 transition-opacity group-hover:opacity-100" />
              {/* Stars */}
              <div className="mb-4 flex gap-0.5">{[...Array(5)].map((_, si) => <Star key={si} size={13} className="fill-amber-400/80 text-amber-400/80" />)}</div>
              <p className="mb-6 text-[14px] leading-relaxed text-zinc-400">&ldquo;{t.text}&rdquo;</p>
              <div className="flex items-center gap-3">
                <span className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br ${t.gradient} text-xs font-bold text-white`}>{t.avatar}</span>
                <div>
                  <p className="text-[13px] font-semibold text-white">{t.name}</p>
                  <p className="text-[11px] text-zinc-500">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── Tech stack ─── */}
      <section className="relative mx-auto max-w-6xl px-6 pb-32">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.5 }} className="mb-14 text-center">
          <span className="mb-3 inline-block rounded-full bg-indigo-500/[0.08] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-indigo-400">Under the hood</span>
          <h2 className="text-2xl font-bold tracking-tight text-white md:text-4xl">Built with modern tech</h2>
          <p className="mt-3 text-sm text-zinc-500 md:text-base">A transparent look at the stack powering Xina.</p>
        </motion.div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TECH.map((t, i) => (
            <motion.div key={t.name} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-30px" }} transition={{ duration: 0.35, delay: i * 0.05 }} className="group flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 transition-all hover:border-white/[0.1]">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] ring-1 ring-white/[0.08] text-indigo-400 transition-all group-hover:bg-indigo-600/10 group-hover:ring-indigo-500/20"><t.icon size={18} /></span>
              <div>
                <p className="text-[14px] font-semibold text-zinc-200">{t.name}</p>
                <p className="text-[12px] text-zinc-500">{t.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── Open Source ─── */}
      <section className="relative mx-auto max-w-4xl px-6 pb-32">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5 }} className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 md:p-12">
          <div className="pointer-events-none absolute -left-20 -top-20 h-60 w-60 rounded-full bg-violet-600/[0.06] blur-[80px]" />
          <div className="relative grid items-center gap-8 md:grid-cols-[1fr_auto]">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <Github size={20} className="text-white" />
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400">Open Source</span>
              </div>
              <h2 className="mb-2 text-xl font-bold text-white md:text-2xl">Built in the open</h2>
              <p className="text-[14px] leading-relaxed text-zinc-400">
                Xina is open source with an MIT license. Explore the code, report issues, contribute features, or self-host your own instance. Community-driven development means a tool that gets better with every contribution.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
              <Link href="/studio" className="inline-flex items-center justify-center gap-2 rounded-full bg-white/[0.06] px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-white/[0.1]">
                <Sparkles size={14} /> Try It Now
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="relative mx-auto max-w-3xl px-6 pb-32">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.5 }} className="mb-10 text-center">
          <span className="mb-3 inline-block rounded-full bg-indigo-500/[0.08] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-indigo-400">FAQ</span>
          <h2 className="text-2xl font-bold tracking-tight text-white md:text-4xl">Frequently asked questions</h2>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-6">
          {FAQ.map((f) => <FaqItem key={f.q} q={f.q} a={f.a} />)}
        </motion.div>
      </section>

      {/* ─── CTA banner ─── */}
      <section className="relative mx-auto max-w-6xl px-6 pb-28">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5 }} className="relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-600/[0.12] via-violet-600/[0.06] to-transparent p-10 text-center md:p-16">
          <div className="pointer-events-none absolute -left-20 -top-20 h-60 w-60 rounded-full bg-indigo-600/10 blur-[80px]" />
          <div className="pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-violet-600/10 blur-[60px]" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, #fff 0.5px, transparent 0.5px)", backgroundSize: "20px 20px" }} />
          <div className="relative">
            <h2 className="text-2xl font-bold text-white md:text-4xl">Ready to visualize your schema?</h2>
            <p className="mt-3 text-sm text-zinc-400 md:text-base">Connect your Appwrite project and start designing in seconds.</p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/studio" className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-[#09090b] shadow-xl transition-all hover:bg-zinc-100">
                Launch Studio <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link href="/features" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-7 py-3.5 text-sm font-semibold text-white transition-all hover:border-white/30 hover:bg-white/[0.06]">
                Explore Features
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
