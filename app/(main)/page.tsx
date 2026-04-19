"use client";

import Link from "next/link";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Database,
  GitBranch,
  Github,
  Layers,
  Monitor,
  MousePointerClick,
  Shield,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";
import { useState } from "react";

const FEATURES = [
  { icon: Sparkles, title: "AI-drafted schemas", desc: "Describe your data model in a sentence. Zinaplus turns it into a complete schema — tables, columns, relationships, and indexes — ready to tweak on the canvas." },
  { icon: Database, title: "10+ Database Engines", desc: "Design schemas for PostgreSQL, MySQL, MongoDB, SQLite, SQL Server, Oracle, MariaDB, CockroachDB, Appwrite, Firebase, and more — all from one canvas." },
  { icon: GitBranch, title: "Relationship Mapping", desc: "Foreign keys, one-to-many, many-to-many, and document references are auto-detected and rendered with proper ERD notation." },
  { icon: Layers, title: "Drag & Drop Canvas", desc: "Build schemas visually with an intuitive drag & drop interface. Add tables, drag columns, and connect relationships without writing a single query." },
  { icon: MousePointerClick, title: "Click to Inspect", desc: "Select any table or column to view details, edit properties, manage constraints, indexes, and permissions in the side panel." },
  { icon: Zap, title: "One-click ship", desc: "Push your schema straight to the connected database. Zinaplus writes the DDL, migrations, or API calls so you don't have to." },
];

const STEPS = [
  { num: "01", title: "Choose Engine", desc: "Pick your target database — PostgreSQL, MySQL, MongoDB, Appwrite, Firebase, or any of 10+ supported engines.", icon: Database },
  { num: "02", title: "Design or Describe", desc: "Drag & drop tables and columns visually, or describe your data model in plain language and let AI generate the schema.", icon: Sparkles },
  { num: "03", title: "Visualize", desc: "See your schema as an interactive ERD with relationships, constraints, and indexes — all editable on the canvas.", icon: Monitor },
  { num: "04", title: "Deploy", desc: "One-click deploy to your connected database. Zinaplus generates the right DDL, migration, or API calls automatically.", icon: Zap },
];

const STATS = [
  { value: "10+", label: "Database engines", icon: Database },
  { value: "<2min", label: "Schema to deploy", icon: Zap },
  { value: "100%", label: "Free core features", icon: Sparkles },
  { value: "∞", label: "Tables & collections", icon: Layers },
];

const TESTIMONIALS = [
  { name: "Alex M.", role: "Full-stack Developer", text: "Zinaplus replaced all my manual ERD tools. I switch between PostgreSQL and MongoDB projects and the same canvas handles both beautifully.", avatar: "A" },
  { name: "Sarah K.", role: "Backend Engineer", text: "The AI schema generation is incredible. I described my e-commerce data model and Zinaplus generated 12 tables with proper foreign keys in seconds.", avatar: "S" },
  { name: "Raj P.", role: "Indie Hacker", text: "I use Appwrite and Firebase for different projects. Zinaplus lets me design schemas visually for both without switching tools.", avatar: "R" },
];

const AI_PARTNERS = [
  { name: "GPT-4", provider: "OpenAI", capabilities: "Advanced schema generation from natural language descriptions", logo: "/logos/openai.svg" },
  { name: "Claude", provider: "Anthropic", capabilities: "Complex data model reasoning and optimization suggestions", logo: "https://cdn.simpleicons.org/anthropic/white" },
  { name: "Gemini", provider: "Google", capabilities: "Multi-modal schema understanding and validation", logo: "https://cdn.simpleicons.org/googlegemini/white" },
  { name: "LLaMA", provider: "Meta", capabilities: "On-device schema generation with privacy protection", logo: "https://cdn.simpleicons.org/meta/white" },
];

const TECH = [
  { name: "Next.js 16", desc: "App Router with React 19", logo: "https://cdn.simpleicons.org/nextdotjs/white" },
  { name: "Multi-Engine", desc: "SQL, NoSQL, and BaaS adapters", logo: "https://cdn.simpleicons.org/postgresql/white" },
  { name: "TypeScript", desc: "End-to-end type safety", logo: "https://cdn.simpleicons.org/typescript/white" },
  { name: "Framer Motion", desc: "Smooth 60fps animations", logo: "https://cdn.simpleicons.org/framer/white" },
  { name: "Local-only", desc: "Credentials never leave your browser", logo: "https://cdn.simpleicons.org/letsencrypt/white" },
  { name: "Secure by Default", desc: "Scoped API keys & read-only mode", logo: "https://cdn.simpleicons.org/auth0/white" },
];

const FAQ = [
  { q: "Is Zinaplus free?", a: "Yes — the core ERD canvas, AI schema generation, drag & drop builder, and all editing tools are completely free for all supported databases." },
  { q: "Which databases does Zinaplus support?", a: "Zinaplus supports PostgreSQL, MySQL, SQLite, SQL Server, Oracle, MariaDB, CockroachDB, MongoDB, Appwrite, Firebase Firestore, and more. New engines are added regularly." },
  { q: "Does Zinaplus store my credentials?", a: "Your credentials are stored only in your browser's local state. They are never sent to any server other than your own database instance." },
  { q: "Can I switch between database engines?", a: "Yes. Start with one engine and switch to another at any time. Zinaplus translates your schema to the target engine's format automatically." },
  { q: "Do I need to install anything?", a: "No. Zinaplus runs entirely in the browser. Just open the studio, pick your database engine, and start designing." },
  { q: "How does the AI generation work?", a: "Describe your data model in plain language. Zinaplus uses GPT-4, Claude, Gemini, or other AI models to generate a complete schema with tables, columns, relationships, and constraints." },
];

const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } };

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-zinc-200 last:border-0">
      <button type="button" onClick={() => setOpen(!open)} className="flex w-full items-center justify-between gap-4 px-1 py-5 text-left">
        <span className="text-[14px] font-medium text-zinc-800">{q}</span>
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


      {/* ─── Hero ─── */}
      <section className="relative mx-auto max-w-6xl px-6 pb-20 pt-8">
        <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1 } } }} className="flex flex-col items-center text-center">
          <motion.div variants={fadeUp} transition={{ duration: 0.5 }} className="mb-6 inline-flex items-center gap-2 border border-emerald-500/20 bg-emerald-500/[0.06] px-4 py-1.5 text-xs font-medium text-emerald-600">
            <Sparkles size={12} /> The universal visual database designer
          </motion.div>
          <motion.h1 variants={fadeUp} transition={{ duration: 0.5 }} className="max-w-4xl text-5xl font-normal leading-[1.02] tracking-tight text-zinc-900 sm:text-6xl md:text-[84px]">
            Design databases, <em className="italic text-emerald-600">beautifully.</em>
          </motion.h1>
          <motion.p variants={fadeUp} transition={{ duration: 0.5 }} className="mt-6 max-w-2xl font-sans text-base leading-relaxed text-zinc-600 md:text-lg">
            One canvas for every data layer. Sketch tables by hand, let AI draft your schema from a sentence, and ship straight to PostgreSQL, MySQL, MongoDB, Appwrite, Firebase — or whatever comes next.
          </motion.p>
          <motion.div variants={fadeUp} transition={{ duration: 0.5 }} className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link href="/studio" className="inline-flex items-center justify-center gap-2 bg-emerald-600 px-7 py-3.5 text-sm font-semibold text-white hover:bg-emerald-700">
              Open Studio <ArrowRight size={15} />
            </Link>
            <Link href="/docs" className="inline-flex items-center justify-center gap-2 border border-zinc-300 bg-zinc-100 px-7 py-3.5 text-sm font-semibold text-zinc-900 hover:bg-zinc-200">
              Get Started
            </Link>
          </motion.div>
          <motion.p variants={fadeUp} transition={{ duration: 0.5 }} className="mt-5 flex items-center gap-2 text-xs text-zinc-500">
            <Shield size={11} /> Free forever &middot; No credit card &middot; 10+ database engines supported
          </motion.p>
        </motion.div>

        {/* Hero visual */}
        <motion.div initial={{ opacity: 0, y: 50, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }} className="relative mx-auto mt-16 max-w-5xl">
          <div className="relative overflow-hidden border border-zinc-200 bg-white">
            <div className="flex items-center gap-2 border-b border-zinc-200 bg-zinc-50 px-5 py-3">
              <span className="h-3 w-3 bg-[#ff5f57]" /><span className="h-3 w-3 bg-[#febc2e]" /><span className="h-3 w-3 bg-[#28c840]" />
              <span className="ml-3 text-xs text-zinc-400">Zinaplus Studio — AI Database Builder</span>
              <span className="ml-auto bg-emerald-500/10 px-2.5 py-0.5 text-[9px] font-semibold text-emerald-600">Connected</span>
            </div>
            <div className="relative h-72 bg-zinc-50 p-8 md:h-[420px]">
              {/* Dot grid */}
              <div className="absolute inset-0 opacity-[0.12]" style={{ backgroundImage: "radial-gradient(circle, #555 0.8px, transparent 0.8px)", backgroundSize: "24px 24px" }} />

              {/* Users collection */}
              <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.7 }} className="absolute left-6 top-6 w-48 border border-zinc-200 bg-white md:left-12 md:top-10 md:w-56">
                <div className="flex items-center gap-2 border-b border-zinc-200 bg-zinc-50 px-4 py-2.5"><Database size={12} className="text-emerald-600" /><span className="text-xs font-semibold text-zinc-900">Users</span><span className="ml-auto bg-zinc-100 px-1.5 py-0.5 font-mono text-[9px] text-zinc-500">5 attrs</span></div>
                <div className="space-y-0 text-[11px]">
                  <div className="flex items-center gap-2 px-4 py-1.5 text-zinc-500"><span className="text-zinc-400">$id</span><span className="ml-auto bg-zinc-200/80 px-1.5 py-0.5 font-mono text-[8px] uppercase text-zinc-400">string</span></div>
                  <div className="flex items-center gap-2 bg-zinc-50 px-4 py-1.5 text-zinc-600"><span>name</span><span className="ml-auto bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[8px] uppercase text-emerald-600">string</span></div>
                  <div className="flex items-center gap-2 px-4 py-1.5 text-zinc-600"><span>email</span><span className="ml-auto bg-sky-500/10 px-1.5 py-0.5 font-mono text-[8px] uppercase text-sky-600">email</span></div>
                  <div className="flex items-center gap-2 bg-zinc-50 px-4 py-1.5 text-emerald-600"><span>posts</span><span className="ml-auto bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[8px] uppercase text-emerald-700">relation</span></div>
                </div>
              </motion.div>

              {/* Connection lines */}
              <svg className="absolute inset-0 h-full w-full" style={{ zIndex: 1 }}>
                <motion.path d="M 272 78 L 330 78 L 330 160 L 388 160" fill="none" stroke="#000" strokeWidth={1.5} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, delay: 1.2 }} opacity={0.1} />
                <motion.path d="M 272 78 L 310 78 L 310 310 L 388 310" fill="none" stroke="#000" strokeWidth={1.5} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.4, delay: 1.5 }} className="hidden md:block" opacity={0.1} />
              </svg>

              {/* Posts collection */}
              <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.9 }} className="absolute right-6 top-6 w-48 border border-zinc-200 bg-white md:right-12 md:top-10 md:w-56">
                <div className="flex items-center gap-2 border-b border-zinc-200 bg-zinc-50 px-4 py-2.5"><Database size={12} className="text-emerald-600" /><span className="text-xs font-semibold text-zinc-900">Posts</span><span className="ml-auto bg-zinc-100 px-1.5 py-0.5 font-mono text-[9px] text-zinc-500">4 attrs</span></div>
                <div className="space-y-0 text-[11px]">
                  <div className="flex items-center gap-2 px-4 py-1.5 text-zinc-500"><span className="text-zinc-400">$id</span><span className="ml-auto bg-zinc-200/80 px-1.5 py-0.5 font-mono text-[8px] uppercase text-zinc-400">string</span></div>
                  <div className="flex items-center gap-2 bg-zinc-50 px-4 py-1.5 text-zinc-600"><span>title</span><span className="ml-auto bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[8px] uppercase text-emerald-600">string</span></div>
                  <div className="flex items-center gap-2 px-4 py-1.5 text-zinc-600"><span>body</span><span className="ml-auto bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[8px] uppercase text-emerald-600">string</span></div>
                  <div className="flex items-center gap-2 bg-zinc-50 px-4 py-1.5 text-emerald-600"><span>author</span><span className="ml-auto bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[8px] uppercase text-emerald-700">relation</span></div>
                </div>
              </motion.div>

              {/* Comments collection (third — visible on md+) */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 1.1 }} className="absolute bottom-16 right-6 hidden w-56 border border-zinc-200 bg-white md:right-12 md:block">
                <div className="flex items-center gap-2 border-b border-zinc-200 bg-zinc-50 px-4 py-2.5"><Database size={12} className="text-cyan-600" /><span className="text-xs font-semibold text-zinc-900">Comments</span><span className="ml-auto bg-zinc-100 px-1.5 py-0.5 font-mono text-[9px] text-zinc-500">3 attrs</span></div>
                <div className="space-y-0 text-[11px]">
                  <div className="flex items-center gap-2 px-4 py-1.5 text-zinc-500"><span className="text-zinc-400">$id</span><span className="ml-auto bg-zinc-200/80 px-1.5 py-0.5 font-mono text-[8px] uppercase text-zinc-400">string</span></div>
                  <div className="flex items-center gap-2 bg-zinc-50 px-4 py-1.5 text-zinc-600"><span>body</span><span className="ml-auto bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[8px] uppercase text-emerald-600">string</span></div>
                  <div className="flex items-center gap-2 px-4 py-1.5 text-emerald-600"><span>postId</span><span className="ml-auto bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[8px] uppercase text-emerald-700">relation</span></div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─── Works with ─── */}
      <section className="relative mx-auto max-w-4xl px-6 pb-20">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center">
          <p className="mb-6 text-xs font-medium uppercase tracking-widest text-zinc-400">Powering schemas for the world&apos;s top databases</p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {[
              { label: "PostgreSQL", logo: "https://cdn.simpleicons.org/postgresql/white" },
              { label: "MySQL", logo: "https://cdn.simpleicons.org/mysql/white" },
              { label: "MongoDB", logo: "https://cdn.simpleicons.org/mongodb/white" },
              { label: "Appwrite", logo: "https://cdn.simpleicons.org/appwrite/white" },
              { label: "Firebase", logo: "https://cdn.simpleicons.org/firebase/white" },
              { label: "SQL Server", logo: "/logos/microsoftsqlserver.svg" },
              { label: "SQLite", logo: "https://cdn.simpleicons.org/sqlite/white" },
              { label: "Oracle", logo: "/logos/oracle.svg" },
              { label: "MariaDB", logo: "https://cdn.simpleicons.org/mariadb/white" },
              { label: "CockroachDB", logo: "https://cdn.simpleicons.org/cockroachlabs/white" },
            ].map((b) => (
              <div key={b.label} className="flex items-center gap-2.5 text-zinc-500 transition-colors hover:text-zinc-700">
                <img src={b.logo} alt={b.label} className="h-5 w-5 opacity-50 transition-opacity hover:opacity-80" />
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
            <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35, delay: i * 0.08 }} className="relative overflow-hidden border border-zinc-200 bg-zinc-50 p-6 text-center transition-colors hover:border-zinc-300">
              <div className="mx-auto mb-3 text-emerald-600"><s.icon size={20} /></div>
              <p className="text-2xl font-extrabold text-zinc-900 md:text-3xl">{s.value}</p>
              <p className="mt-1 text-xs text-zinc-500">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ─── How it works ─── */}
      <section className="relative mx-auto max-w-6xl px-6 pb-32">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.5 }} className="mb-14 text-center">
          <span className="mb-3 inline-block text-[10px] font-semibold uppercase tracking-wider text-emerald-600">How it works</span>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 md:text-4xl">Four steps to a complete schema</h2>
          <p className="mt-3 text-sm text-zinc-500 md:text-base">From zero to a visual ERD in under two minutes.</p>
        </motion.div>
        <div className="relative grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <motion.div key={s.num} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.4, delay: i * 0.1 }} className="relative border border-zinc-200 bg-zinc-50 p-6 transition-all hover:border-zinc-300 hover:bg-zinc-100">
              <div className="mb-4 text-emerald-600">
                <s.icon size={22} />
              </div>
              <span className="mb-1 block font-mono text-[11px] font-bold uppercase tracking-wider text-emerald-700/40">Step {s.num}</span>
              <h3 className="mb-1.5 text-[16px] font-semibold text-zinc-900">{s.title}</h3>
              <p className="text-[13px] leading-relaxed text-zinc-500">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── Features grid (bento) ─── */}
      <section className="relative mx-auto max-w-6xl px-6 pb-32">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.5 }} className="mb-14 text-center">
          <span className="mb-3 inline-block text-[10px] font-semibold uppercase tracking-wider text-emerald-600">Features</span>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 md:text-4xl">Everything you need to design databases</h2>
          <p className="mt-3 text-sm text-zinc-500 md:text-base">A visual database builder for SQL, NoSQL, and BaaS platforms.</p>
        </motion.div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.4, delay: i * 0.06 }} className="relative overflow-hidden border border-zinc-200 bg-zinc-50 p-6 transition-all hover:border-zinc-300">
              <div className="relative">
                <div className="mb-4 text-emerald-600"><f.icon size={22} /></div>
                <h3 className="mb-1.5 text-[15px] font-semibold text-zinc-900">{f.title}</h3>
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
            <span className="mb-3 inline-block text-[10px] font-semibold uppercase tracking-wider text-emerald-600">Code Generation</span>
            <h2 className="mb-4 text-2xl font-bold text-zinc-900 md:text-3xl">Generate typed code<br />in seconds</h2>
            <p className="mb-8 text-[15px] leading-relaxed text-zinc-600">
              Select a collection and Zinaplus generates typed interfaces, model classes, or schema definitions in your language of choice.
            </p>
            <ul className="space-y-3">
              {["TypeScript interfaces & Zod schemas", "Python dataclasses & Pydantic", "Dart, Kotlin, Swift model classes", "PHP, Ruby, Go, Rust structs"].map((t) => (
                <li key={t} className="flex items-center gap-3 text-[14px] text-zinc-600">
                  <CheckCircle2 size={14} className="shrink-0 text-emerald-600" /> {t}
                </li>
              ))}
            </ul>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5 }}>
            <div className="relative">
              <div className="relative overflow-hidden border border-zinc-200 bg-white">
                <div className="flex items-center gap-2 border-b border-zinc-200 bg-zinc-50 px-4 py-2.5">
                  <span className="bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">TypeScript</span>
                  <span className="bg-zinc-100 px-2 py-0.5 text-[10px] text-zinc-400">Python</span>
                  <span className="bg-zinc-100 px-2 py-0.5 text-[10px] text-zinc-400">Dart</span>
                </div>
                <pre className="overflow-x-auto p-5 font-mono text-[12px] leading-relaxed">
                  <code>
                    <span className="text-emerald-600">interface</span>{" "}<span className="text-emerald-600">Users</span>{" "}{"{\n"}
                    {"  "}<span className="text-zinc-600">$id</span><span className="text-zinc-400">:</span>{" "}<span className="text-amber-600">string</span>{";\n"}
                    {"  "}<span className="text-zinc-600">name</span><span className="text-zinc-400">:</span>{" "}<span className="text-amber-600">string</span>{";"}{" "}<span className="text-zinc-300">{"// required"}</span>{"\n"}
                    {"  "}<span className="text-zinc-600">email</span><span className="text-zinc-400">:</span>{" "}<span className="text-amber-600">string</span>{";"}{" "}<span className="text-zinc-300">{"// email"}</span>{"\n"}
                    {"  "}<span className="text-zinc-600">avatar</span><span className="text-zinc-400">?:</span>{" "}<span className="text-amber-600">string</span>{";"}{" "}<span className="text-zinc-300">{"// URL"}</span>{"\n"}
                    {"  "}<span className="text-zinc-600">role</span><span className="text-zinc-400">:</span>{" "}<span className="text-cyan-600">{'"admin"'}</span>{" "}<span className="text-zinc-400">|</span>{" "}<span className="text-cyan-600">{'"user"'}</span>{";\n"}
                    {"  "}<span className="text-zinc-600">posts</span><span className="text-zinc-400">:</span>{" "}<span className="text-emerald-600">Posts</span>{"[];"}{" "}<span className="text-zinc-300">{"// relationship"}</span>{"\n"}
                    {"  "}<span className="text-zinc-600">$createdAt</span><span className="text-zinc-400">:</span>{" "}<span className="text-amber-600">string</span>{";\n"}
                    {"  "}<span className="text-zinc-600">$updatedAt</span><span className="text-zinc-400">:</span>{" "}<span className="text-amber-600">string</span>{";\n"}
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
          <span className="mb-3 inline-block text-[10px] font-semibold uppercase tracking-wider text-emerald-600">Testimonials</span>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 md:text-4xl">Loved by developers</h2>
          <p className="mt-3 text-sm text-zinc-500 md:text-base">See what developers building with SQL, NoSQL, and BaaS are saying about Zinaplus.</p>
        </motion.div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <motion.div key={t.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.4, delay: i * 0.06 }} className="relative overflow-hidden border border-zinc-200 bg-zinc-50 p-6 transition-all hover:border-zinc-300">
              {/* Stars */}
              <div className="mb-4 flex gap-0.5">{[...Array(5)].map((_, si) => <Star key={si} size={13} className="fill-amber-400/80 text-amber-600/80" />)}</div>
              <p className="mb-6 text-[14px] leading-relaxed text-zinc-600">&ldquo;{t.text}&rdquo;</p>
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center text-xs font-bold text-emerald-600">{t.avatar}</span>
                <div>
                  <p className="text-[13px] font-semibold text-zinc-900">{t.name}</p>
                  <p className="text-[11px] text-zinc-500">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── AI Partners ─── */}
      <section className="relative mx-auto max-w-6xl px-6 pb-32">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.5 }} className="mb-14 text-center">
          <span className="mb-3 inline-block text-[10px] font-semibold uppercase tracking-wider text-emerald-600">Powered by Leading AI</span>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 md:text-4xl">Enterprise AI Models</h2>
          <p className="mt-3 text-sm text-zinc-500 md:text-base">Integrated with the world's most advanced AI models for superior schema generation.</p>
        </motion.div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {AI_PARTNERS.map((p, i) => (
            <motion.div key={p.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.4, delay: i * 0.08 }} className="border border-zinc-200 bg-zinc-50 p-6 transition-all hover:border-zinc-300 hover:bg-zinc-100">
              <img src={p.logo} alt={p.provider} className="mb-4 h-6 w-6 opacity-70" />
              <h3 className="mb-1 text-[15px] font-semibold text-zinc-900">{p.name}</h3>
              <p className="mb-3 text-[12px] font-medium text-zinc-500">{p.provider}</p>
              <p className="text-[13px] leading-relaxed text-zinc-600">{p.capabilities}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── Tech stack ─── */}
      <section className="relative mx-auto max-w-6xl px-6 pb-32">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.5 }} className="mb-14 text-center">
          <span className="mb-3 inline-block text-[10px] font-semibold uppercase tracking-wider text-emerald-600">Under the hood</span>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 md:text-4xl">Built with modern tech</h2>
          <p className="mt-3 text-sm text-zinc-500 md:text-base">A transparent look at the stack powering Zinaplus.</p>
        </motion.div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TECH.map((t, i) => (
            <motion.div key={t.name} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-30px" }} transition={{ duration: 0.35, delay: i * 0.05 }} className="flex items-center gap-4 border border-zinc-200 bg-zinc-50 p-5 transition-all hover:border-zinc-300">
              <img src={t.logo} alt={t.name} className="h-5 w-5 shrink-0 opacity-60" />
              <div>
                <p className="text-[14px] font-semibold text-zinc-800">{t.name}</p>
                <p className="text-[12px] text-zinc-500">{t.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── Open Source ─── */}
      <section className="relative mx-auto max-w-4xl px-6 pb-32">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5 }} className="relative overflow-hidden border border-zinc-200 bg-zinc-50 p-8 md:p-12">
          <div className="relative grid items-center gap-8 md:grid-cols-[1fr_auto]">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <Github size={20} className="text-zinc-900" />
                <span className="bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-600">Open Source</span>
              </div>
              <h2 className="mb-2 text-xl font-bold text-zinc-900 md:text-2xl">Built in the open</h2>
              <p className="text-[14px] leading-relaxed text-zinc-600">
                Zinaplus is open source with an MIT license. Explore the code, report issues, contribute features, or self-host your own instance. Community-driven development means a tool that gets better with every contribution.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
              <Link href="/studio" className="inline-flex items-center justify-center gap-2 border border-zinc-300 bg-zinc-100 px-5 py-2.5 text-sm font-medium text-zinc-900 hover:bg-zinc-200">
                <Sparkles size={14} /> Try It Now
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="relative mx-auto max-w-3xl px-6 pb-32">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.5 }} className="mb-10 text-center">
          <span className="mb-3 inline-block text-[10px] font-semibold uppercase tracking-wider text-emerald-600">FAQ</span>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 md:text-4xl">Frequently asked questions</h2>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }} className="border border-zinc-200 bg-zinc-50 px-6">
          {FAQ.map((f) => <FaqItem key={f.q} q={f.q} a={f.a} />)}
        </motion.div>
      </section>

      {/* ─── CTA banner ─── */}
      <section className="relative mx-auto max-w-6xl px-6 pb-28">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5 }} className="relative overflow-hidden border border-zinc-200 bg-zinc-50 p-10 text-center md:p-16">
          <div className="relative">
            <h2 className="text-2xl font-bold text-zinc-900 md:text-4xl">Ready to build your database?</h2>
            <p className="mt-3 text-sm text-zinc-600 md:text-base">Pick your engine, drag & drop or describe your schema, and deploy in seconds.</p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/studio" className="inline-flex items-center justify-center gap-2 bg-emerald-600 px-7 py-3.5 text-sm font-semibold text-white hover:bg-emerald-700">
                Launch Studio <ArrowRight size={15} />
              </Link>
              <Link href="/features" className="inline-flex items-center justify-center gap-2 border border-zinc-300 px-7 py-3.5 text-sm font-semibold text-zinc-900 hover:bg-zinc-100">
                Explore Features
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
