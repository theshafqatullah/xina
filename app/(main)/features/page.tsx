"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Code2,
  Database,
  Download,
  Eye,
  FileCode2,
  GitBranch,
  Grid3X3,
  Key,
  Keyboard,
  Layers,
  MousePointerClick,
  Move,
  Palette,
  Route,
  Sparkles,
  Table2,
  X,
  Zap,
} from "lucide-react";

const SECTIONS = [
  {
    badge: "Canvas",
    badgeColor: "indigo",
    title: "Interactive ERD Canvas",
    desc: "A fully interactive entity-relationship diagram that auto-generates from your Appwrite schema. Drag collections, pan and zoom the canvas, and see every relationship at a glance.",
    features: [
      { icon: Move, label: "Drag & drop collections freely on the canvas" },
      { icon: Grid3X3, label: "Infinite canvas with smooth pan and zoom" },
      { icon: Route, label: "Obstacle-aware orthogonal edge routing" },
      { icon: Palette, label: "Rounded Bézier corners on all connectors" },
    ],
    visual: "canvas",
    accent: "from-indigo-500 to-blue-500",
  },
  {
    badge: "Relationships",
    badgeColor: "violet",
    title: "Smart Relationship Detection",
    desc: "Xina reads your Appwrite relationship attributes and automatically maps connections between collections. Two-way relationships show crow's foot notation; one-way relationships display directional arrows.",
    features: [
      { icon: GitBranch, label: "Two-way relationships with crow's foot (many-to-many) markers" },
      { icon: ArrowRight, label: "One-way relationships with directional arrows to $id" },
      { icon: Layers, label: "Automatic deduplication of mirrored relationship pairs" },
      { icon: Eye, label: "Visual port dots on relationship and $id rows" },
    ],
    visual: "relationships",
    accent: "from-violet-500 to-purple-500",
  },
  {
    badge: "Schema",
    badgeColor: "emerald",
    title: "Full Schema Management",
    desc: "Create and manage databases, collections, attributes, and indexes directly from the studio. Every change is pushed to your Appwrite instance in real-time.",
    features: [
      { icon: Database, label: "Create and switch between multiple databases" },
      { icon: Table2, label: "Add collections with drag-and-drop or the side panel" },
      { icon: Key, label: "System attributes ($id, $createdAt, $updatedAt) shown automatically" },
      { icon: Zap, label: "Real-time sync — changes reflect instantly on the canvas" },
    ],
    visual: "schema",
    accent: "from-emerald-500 to-teal-500",
  },
  {
    badge: "Inspector",
    badgeColor: "amber",
    title: "Inspect & Edit Anything",
    desc: "Click any collection or attribute on the canvas to open the detail panel. View types, required flags, relationships, permissions, and indexes — then edit in place.",
    features: [
      { icon: MousePointerClick, label: "Click-to-select any collection or attribute" },
      { icon: Sparkles, label: "Side panel with schema, permissions, and index tabs" },
      { icon: Table2, label: "Attribute type badges and required indicators" },
      { icon: Layers, label: "Code generation for collections (TypeScript, Python, Dart, etc.)" },
    ],
    visual: "inspect",
    accent: "from-amber-500 to-orange-500",
  },
];

const ATTR_TYPES = [
  { name: "String", color: "emerald", desc: "Text values with optional size limits" },
  { name: "Integer", color: "blue", desc: "Whole numbers with min/max range" },
  { name: "Float", color: "cyan", desc: "Decimal numbers with precision control" },
  { name: "Boolean", color: "amber", desc: "True or false toggle values" },
  { name: "Email", color: "sky", desc: "Validated email address format" },
  { name: "URL", color: "violet", desc: "Validated URL format strings" },
  { name: "IP", color: "rose", desc: "IPv4 or IPv6 address values" },
  { name: "Enum", color: "orange", desc: "Predefined list of allowed values" },
  { name: "Datetime", color: "pink", desc: "ISO 8601 date-time strings" },
  { name: "Relationship", color: "indigo", desc: "Links between collections" },
];

const KEYBOARD_SHORTCUTS = [
  { keys: ["Space", "Drag"], desc: "Pan the canvas" },
  { keys: ["Scroll"], desc: "Zoom in / out" },
  { keys: ["Click"], desc: "Select collection or attribute" },
  { keys: ["Escape"], desc: "Deselect / close panel" },
  { keys: ["F"], desc: "Fit all collections in view" },
  { keys: ["Delete"], desc: "Delete selected item" },
];

const COMPARISON = [
  { feature: "Live Appwrite sync", xina: true, generic: false },
  { feature: "Auto relationship detection", xina: true, generic: false },
  { feature: "Crow's foot ERD notation", xina: true, generic: false },
  { feature: "Obstacle-aware routing", xina: true, generic: false },
  { feature: "Create collections in-tool", xina: true, generic: false },
  { feature: "System attribute display", xina: true, generic: false },
  { feature: "Code generation", xina: true, generic: false },
  { feature: "Free & open source", xina: true, generic: false },
];

const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } };

const badgeColors: Record<string, string> = {
  indigo: "border-indigo-500/20 bg-indigo-500/[0.06] text-indigo-400",
  violet: "border-violet-500/20 bg-violet-500/[0.06] text-violet-400",
  emerald: "border-emerald-500/20 bg-emerald-500/[0.06] text-emerald-400",
  amber: "border-amber-500/20 bg-amber-500/[0.06] text-amber-400",
};

const iconBgColors: Record<string, string> = {
  indigo: "bg-indigo-600/10 text-indigo-400 ring-indigo-500/20",
  violet: "bg-violet-600/10 text-violet-400 ring-violet-500/20",
  emerald: "bg-emerald-600/10 text-emerald-400 ring-emerald-500/20",
  amber: "bg-amber-600/10 text-amber-400 ring-amber-500/20",
};

function FeatureVisual({ type }: { type: string }) {
  const base = "relative h-56 overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0c0c0f] shadow-xl shadow-black/20 md:h-72";

  if (type === "canvas") {
    return (
      <div className={base}>
        <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "radial-gradient(circle, #555 0.8px, transparent 0.8px)", backgroundSize: "20px 20px" }} />
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-indigo-600/[0.06] blur-[60px]" />
        <motion.div initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.2 }} className="absolute left-6 top-6 h-20 w-32 rounded-lg border border-white/[0.08] bg-[#111114] shadow-lg shadow-black/20">
          <div className="flex items-center gap-1.5 border-b border-white/[0.06] bg-white/[0.02] px-3 py-1.5"><Database size={9} className="text-indigo-400" /><span className="text-[9px] font-semibold text-white">Users</span></div>
          <div className="space-y-0.5 px-3 py-1 text-[8px] text-zinc-500"><div>name</div><div>email</div><div className="text-indigo-400">posts →</div></div>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.4 }} className="absolute bottom-8 right-6 h-20 w-32 rounded-lg border border-white/[0.08] bg-[#111114] shadow-lg shadow-black/20">
          <div className="flex items-center gap-1.5 border-b border-white/[0.06] bg-white/[0.02] px-3 py-1.5"><Database size={9} className="text-indigo-400" /><span className="text-[9px] font-semibold text-white">Posts</span></div>
          <div className="space-y-0.5 px-3 py-1 text-[8px] text-zinc-500"><div>title</div><div>content</div><div className="text-indigo-400">← author</div></div>
        </motion.div>
        <svg className="absolute inset-0" style={{ zIndex: 1 }}><motion.path d="M 164 50 L 210 50 L 210 190 L 256 190" fill="none" stroke="url(#fv-grad)" strokeWidth={1.2} initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.5 }} /><defs><linearGradient id="fv-grad"><stop offset="0%" stopColor="#6366f1" stopOpacity={0.7} /><stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.3} /></linearGradient></defs></svg>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0c0c0f] to-transparent" />
      </div>
    );
  }

  if (type === "relationships") {
    return (
      <div className={base + " flex items-center justify-center p-8"}>
        <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-violet-600/[0.06] blur-[60px]" />
        <div className="flex items-center gap-6">
          <motion.div initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.2 }} className="w-28 rounded-lg border border-white/[0.08] bg-[#111114] shadow-lg shadow-black/20">
            <div className="border-b border-white/[0.06] bg-white/[0.02] px-3 py-2 text-[10px] font-semibold text-white">Users</div>
            <div className="px-3 py-1.5 text-[9px] text-violet-400">posts →</div>
          </motion.div>
          <svg width="80" height="30" className="shrink-0">
            <motion.g initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.4 }}>
              <line x1="0" y1="15" x2="12" y2="6" stroke="#8b5cf6" strokeWidth={1.5} />
              <line x1="0" y1="15" x2="12" y2="15" stroke="#8b5cf6" strokeWidth={1.5} />
              <line x1="0" y1="15" x2="12" y2="24" stroke="#8b5cf6" strokeWidth={1.5} />
              <line x1="12" y1="15" x2="68" y2="15" stroke="#8b5cf6" strokeWidth={1.2} opacity={0.4} />
              <line x1="80" y1="15" x2="68" y2="6" stroke="#8b5cf6" strokeWidth={1.5} />
              <line x1="80" y1="15" x2="68" y2="15" stroke="#8b5cf6" strokeWidth={1.5} />
              <line x1="80" y1="15" x2="68" y2="24" stroke="#8b5cf6" strokeWidth={1.5} />
            </motion.g>
          </svg>
          <motion.div initial={{ opacity: 0, x: 10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.3 }} className="w-28 rounded-lg border border-white/[0.08] bg-[#111114] shadow-lg shadow-black/20">
            <div className="border-b border-white/[0.06] bg-white/[0.02] px-3 py-2 text-[10px] font-semibold text-white">Posts</div>
            <div className="px-3 py-1.5 text-[9px] text-violet-400">← author</div>
          </motion.div>
        </div>
        <div className="absolute bottom-6 rounded-full bg-violet-500/[0.06] px-3 py-1 text-center text-[10px] font-medium text-violet-400/60">Many-to-many (two-way)</div>
      </div>
    );
  }

  if (type === "schema") {
    return (
      <div className={base + " p-6"}>
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-600/[0.06] blur-[60px]" />
        <div className="space-y-2">
          {["users", "posts", "comments", "tags"].map((name, i) => (
            <motion.div key={name} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.3, delay: 0.15 * i }} className="flex items-center gap-3 rounded-lg border border-white/[0.04] bg-white/[0.02] px-4 py-2.5 transition-colors hover:border-white/[0.08]">
              <Table2 size={12} className="text-emerald-400" />
              <span className="text-[12px] font-medium text-zinc-300">{name}</span>
              <span className="ml-auto rounded-full bg-white/[0.06] px-2 py-0.5 font-mono text-[9px] text-zinc-600">{3 + i} attrs</span>
            </motion.div>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0c0c0f] to-transparent" />
      </div>
    );
  }

  return (
    <div className={base + " p-6"}>
      <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-amber-600/[0.04] blur-[60px]" />
      <div className="rounded-xl border border-white/[0.06] bg-[#111114] p-4">
        <div className="mb-3 flex items-center gap-2"><Database size={12} className="text-amber-400" /><span className="text-xs font-semibold text-white">Users</span><span className="ml-auto rounded-full bg-indigo-500/10 px-2 py-0.5 text-[8px] font-semibold text-indigo-400">Selected</span></div>
        <div className="space-y-1.5 text-[11px]">
          <div className="flex items-center justify-between rounded-md bg-white/[0.02] px-2 py-1 text-zinc-400"><span>name</span><span className="rounded bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[9px] text-emerald-500">string</span></div>
          <div className="flex items-center justify-between rounded-md px-2 py-1 text-zinc-400"><span>email</span><span className="rounded bg-sky-500/10 px-1.5 py-0.5 font-mono text-[9px] text-sky-500">email</span></div>
          <div className="flex items-center justify-between rounded-md bg-white/[0.02] px-2 py-1 text-zinc-400"><span>isAdmin</span><span className="rounded bg-amber-500/10 px-1.5 py-0.5 font-mono text-[9px] text-amber-500">boolean</span></div>
          <div className="flex items-center justify-between rounded-md px-2 py-1 text-indigo-400"><span>posts</span><span className="rounded bg-indigo-500/10 px-1.5 py-0.5 font-mono text-[9px] text-indigo-400">relation</span></div>
        </div>
      </div>
    </div>
  );
}

const colorMap: Record<string, string> = {
  emerald: "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20",
  blue: "bg-blue-500/10 text-blue-400 ring-blue-500/20",
  cyan: "bg-cyan-500/10 text-cyan-400 ring-cyan-500/20",
  amber: "bg-amber-500/10 text-amber-400 ring-amber-500/20",
  sky: "bg-sky-500/10 text-sky-400 ring-sky-500/20",
  violet: "bg-violet-500/10 text-violet-400 ring-violet-500/20",
  rose: "bg-rose-500/10 text-rose-400 ring-rose-500/20",
  orange: "bg-orange-500/10 text-orange-400 ring-orange-500/20",
  pink: "bg-pink-500/10 text-pink-400 ring-pink-500/20",
  indigo: "bg-indigo-500/10 text-indigo-400 ring-indigo-500/20",
};

export default function FeaturesPage() {
  return (
    <div className="relative overflow-hidden">
      {/* Animated background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        <div className="absolute -top-40 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-indigo-600/[0.07] blur-[150px]" />
        <div className="absolute right-0 top-40 h-[400px] w-[400px] rounded-full bg-violet-600/[0.05] blur-[120px]" />
      </div>

      {/* Header */}
      <section className="relative mx-auto max-w-6xl px-6 pb-16 pt-28 text-center md:pt-36">
        <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }} className="flex flex-col items-center">
          <motion.div variants={fadeUp} transition={{ duration: 0.5 }} className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/[0.06] px-4 py-1.5 text-xs font-medium text-indigo-400 backdrop-blur-sm">
            <Sparkles size={12} /> Features
          </motion.div>
          <motion.h1 variants={fadeUp} transition={{ duration: 0.5 }} className="max-w-3xl text-3xl font-extrabold tracking-tight text-white md:text-5xl">
            Built for{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">Appwrite</span>{" "}
            developers
          </motion.h1>
          <motion.p variants={fadeUp} transition={{ duration: 0.5 }} className="mt-4 max-w-lg text-base text-zinc-400 md:text-lg">Every feature is designed around the Appwrite databases API. No generic diagramming — just the tools you need.</motion.p>
        </motion.div>
      </section>

      {/* Feature sections */}
      {SECTIONS.map((section, i) => (
        <section key={section.title} className="relative mx-auto max-w-6xl px-6 pb-28">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5 }} className={`grid items-center gap-12 md:grid-cols-2 ${i % 2 === 1 ? "md:[direction:rtl]" : ""}`}>
            <div className={i % 2 === 1 ? "md:[direction:ltr]" : ""}>
              <span className={`mb-4 inline-block rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-wider ${badgeColors[section.badgeColor]}`}>{section.badge}</span>
              <h2 className="mb-3 text-xl font-bold text-white md:text-2xl">{section.title}</h2>
              <p className="mb-6 text-[14px] leading-relaxed text-zinc-400">{section.desc}</p>
              <ul className="space-y-3">
                {section.features.map((f) => (
                  <li key={f.label} className="flex items-start gap-3 text-[13px] text-zinc-400">
                    <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ring-1 ${iconBgColors[section.badgeColor]}`}><f.icon size={13} /></span>
                    {f.label}
                  </li>
                ))}
              </ul>
            </div>
            <div className={i % 2 === 1 ? "md:[direction:ltr]" : ""}>
              <div className="relative">
                <div className={`pointer-events-none absolute -inset-3 rounded-3xl bg-gradient-to-br ${section.accent} opacity-[0.04] blur-2xl`} />
                <FeatureVisual type={section.visual} />
              </div>
            </div>
          </motion.div>
        </section>
      ))}

      {/* ─── Supported attribute types ─── */}
      <section className="relative mx-auto max-w-6xl px-6 pb-32">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.5 }} className="mb-14 text-center">
          <span className="mb-3 inline-block rounded-full bg-indigo-500/[0.08] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-indigo-400">Attribute Types</span>
          <h2 className="text-2xl font-bold tracking-tight text-white md:text-4xl">Every Appwrite attribute type</h2>
          <p className="mt-3 text-sm text-zinc-500 md:text-base">Full support for all attribute types — each rendered with distinctive color coding on the canvas.</p>
        </motion.div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {ATTR_TYPES.map((t, i) => (
            <motion.div key={t.name} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-30px" }} transition={{ duration: 0.35, delay: i * 0.04 }} className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 transition-all hover:border-white/[0.1]">
              <span className={`mb-2 inline-block rounded-md px-2.5 py-0.5 font-mono text-[10px] font-semibold ring-1 ${colorMap[t.color]}`}>{t.name}</span>
              <p className="text-[11px] leading-relaxed text-zinc-500">{t.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── Code generation showcase ─── */}
      <section className="relative mx-auto max-w-6xl px-6 pb-32">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5 }} className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <span className="mb-4 inline-block rounded-full border border-emerald-500/20 bg-emerald-500/[0.06] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">Code Generation</span>
            <h2 className="mb-3 text-xl font-bold text-white md:text-2xl">Multi-language Code Generation</h2>
            <p className="mb-6 text-[14px] leading-relaxed text-zinc-400">Select any collection and generate typed code in your language of choice. Interfaces, model classes, schema definitions — ready to copy.</p>
            <ul className="space-y-3">
              {["TypeScript interfaces & Zod schemas", "Python dataclasses & Pydantic models", "Dart, Kotlin, Swift, Go, Rust model classes", "PHP classes & Ruby structs"].map((t) => (
                <li key={t} className="flex items-center gap-3 text-[13px] text-zinc-400">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10"><CheckCircle2 size={12} className="text-emerald-400" /></span> {t}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="relative">
              <div className="pointer-events-none absolute -inset-2 rounded-3xl bg-gradient-to-b from-emerald-600/[0.05] to-transparent blur-xl" />
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
                    {"}"}
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─── Canvas shortcuts ─── */}
      <section className="relative mx-auto max-w-4xl px-6 pb-32">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.5 }} className="mb-10 text-center">
          <span className="mb-3 inline-block rounded-full bg-indigo-500/[0.08] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-indigo-400">Shortcuts</span>
          <h2 className="text-2xl font-bold tracking-tight text-white md:text-4xl">Canvas shortcuts</h2>
          <p className="mt-3 text-sm text-zinc-500">Navigate the ERD canvas efficiently with keyboard and mouse.</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }} className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02]">
          {KEYBOARD_SHORTCUTS.map((s, i) => (
            <div key={s.desc} className={`flex items-center justify-between px-6 py-4 transition-colors hover:bg-white/[0.02] ${i > 0 ? "border-t border-white/[0.04]" : ""}`}>
              <span className="text-[13px] text-zinc-400">{s.desc}</span>
              <div className="flex gap-1.5">
                {s.keys.map((k) => (
                  <kbd key={k} className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-1 font-mono text-[11px] font-medium text-zinc-300 shadow-sm shadow-black/10">{k}</kbd>
                ))}
              </div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ─── Xina vs generic tools ─── */}
      <section className="relative mx-auto max-w-4xl px-6 pb-32">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.5 }} className="mb-10 text-center">
          <span className="mb-3 inline-block rounded-full bg-indigo-500/[0.08] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-indigo-400">Comparison</span>
          <h2 className="text-2xl font-bold tracking-tight text-white md:text-4xl">Xina vs. generic diagramming tools</h2>
          <p className="mt-3 text-sm text-zinc-500">Purpose-built beats generic every time.</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }} className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02]">
          <div className="grid grid-cols-[1fr_80px_80px] border-b border-white/[0.06] bg-white/[0.02] px-6 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            <span>Feature</span><span className="text-center text-indigo-400">Xina</span><span className="text-center">Generic</span>
          </div>
          {COMPARISON.map((r, i) => (
            <div key={r.feature} className={`grid grid-cols-[1fr_80px_80px] px-6 py-3.5 transition-colors hover:bg-white/[0.02] ${i > 0 ? "border-t border-white/[0.04]" : ""}`}>
              <span className="text-[13px] text-zinc-400">{r.feature}</span>
              <span className="flex justify-center">{r.xina ? <CheckCircle2 size={15} className="text-indigo-400" /> : <span className="text-zinc-700">—</span>}</span>
              <span className="flex justify-center">{r.generic ? <CheckCircle2 size={15} className="text-emerald-400" /> : <X size={14} className="text-zinc-700/50" />}</span>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ─── Export & Integrations ─── */}
      <section className="relative mx-auto max-w-6xl px-6 pb-32">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5 }} className="grid items-center gap-12 md:grid-cols-2 md:[direction:rtl]">
          <div className="md:[direction:ltr]">
            <span className="mb-4 inline-block rounded-full border border-violet-500/20 bg-violet-500/[0.06] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-violet-400">Export</span>
            <h2 className="mb-3 text-xl font-bold text-white md:text-2xl">Export & Share</h2>
            <p className="mb-6 text-[14px] leading-relaxed text-zinc-400">Export your ERD as a high-resolution PNG or SVG image for documentation, presentations, or team discussions. Share schemas without requiring others to connect.</p>
            <ul className="space-y-3">
              {["High-resolution PNG & SVG export", "Copy generated code to clipboard", "Share schema snapshots with your team", "Works with Appwrite Cloud & self-hosted"].map((t) => (
                <li key={t} className="flex items-center gap-3 text-[13px] text-zinc-400">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-500/10"><CheckCircle2 size={12} className="text-violet-400" /></span> {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="md:[direction:ltr]">
            <div className="relative">
              <div className="pointer-events-none absolute -inset-2 rounded-3xl bg-gradient-to-b from-violet-600/[0.05] to-transparent blur-xl" />
              <div className="relative h-56 overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0c0c0f] p-8 shadow-xl shadow-black/20 md:h-72">
                <div className="flex h-full flex-col items-center justify-center gap-5">
                  <div className="flex gap-4">
                    {[
                      { icon: Code2, label: "TypeScript", color: "text-indigo-400" },
                      { icon: FileCode2, label: "Python", color: "text-emerald-400" },
                      { icon: Download, label: "SVG", color: "text-violet-400" },
                    ].map((item) => (
                      <motion.div key={item.label} whileHover={{ y: -2 }} className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 text-center transition-all hover:border-white/[0.12]">
                        <item.icon size={22} className={`mx-auto mb-2 ${item.color}`} />
                        <span className="text-[10px] font-medium text-zinc-500">{item.label}</span>
                      </motion.div>
                    ))}
                  </div>
                  <span className="rounded-full bg-white/[0.04] px-3 py-1 text-[11px] text-zinc-600">One-click export to multiple formats</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="relative mx-auto max-w-6xl px-6 pb-28">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-600/[0.12] via-violet-600/[0.06] to-transparent p-10 text-center md:p-16">
          <div className="pointer-events-none absolute -left-20 -top-20 h-60 w-60 rounded-full bg-indigo-600/10 blur-[80px]" />
          <div className="pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-violet-600/10 blur-[60px]" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, #fff 0.5px, transparent 0.5px)", backgroundSize: "20px 20px" }} />
          <div className="relative">
            <h2 className="text-2xl font-bold text-white md:text-4xl">See it in action</h2>
            <p className="mt-3 text-sm text-zinc-400 md:text-base">Connect your Appwrite project and explore every feature.</p>
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
