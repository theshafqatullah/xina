"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Code2,
  Database,
  GitBranch,
  HelpCircle,
  Key,
  Layers,
  Lightbulb,
  Monitor,
  Settings,
  Sparkles,
  Table2,
  Terminal,
  Zap,
} from "lucide-react";

const STEPS = [
  {
    step: "1",
    title: "Create an Appwrite Project",
    icon: Database,
    content: [
      "Sign up at cloud.appwrite.io and create a new project.",
      "Navigate to your project settings and copy:",
    ],
    code: `Endpoint:   https://cloud.appwrite.io/v1
Project ID: your-project-id
API Key:    your-api-key (with databases scope)`,
    note: "Your API key needs read/write permissions for the databases scope.",
  },
  {
    step: "2",
    title: "Open Xina Studio",
    icon: Sparkles,
    content: [
      'Click "Open Studio" or navigate to /studio.',
      "You'll see the configuration panel on the right side.",
    ],
    code: null,
    note: null,
  },
  {
    step: "3",
    title: "Enter Your Credentials",
    icon: Key,
    content: [
      "In the studio's right panel, enter your Appwrite endpoint, project ID, and API key.",
      'Click "Connect" to sync with your Appwrite instance.',
    ],
    code: `Endpoint:    https://cloud.appwrite.io/v1
Project ID:  6457a...
API Key:     standard_8f3d...`,
    note: "Credentials are stored locally in your browser — never sent to any server.",
  },
  {
    step: "4",
    title: "Explore Your Schema",
    icon: Layers,
    content: [
      "Once connected, your databases appear in the left panel.",
      "Select a database to load its collections onto the ERD canvas.",
      "Collections are auto-arranged and connected by their relationship attributes.",
    ],
    code: null,
    note: null,
  },
  {
    step: "5",
    title: "Create & Edit",
    icon: Zap,
    content: [
      "Create new databases and collections directly from the left panel.",
      "Click any collection on the canvas to inspect and edit its attributes.",
      "Add relationship attributes to connect collections — edges appear automatically.",
    ],
    code: null,
    note: null,
  },
];

const TOPICS = [
  { icon: Table2, title: "Collections & Attributes", desc: "Collections appear as cards on the canvas. Each card shows $id at the top, user attributes in the middle, and $createdAt / $updatedAt at the bottom." },
  { icon: GitBranch, title: "Relationships", desc: "Relationship attributes are auto-detected. Two-way relationships display crow's foot (many-to-many) markers at both ends. One-way relationships show an arrow pointing to the target's $id row." },
  { icon: Settings, title: "Canvas Controls", desc: "Scroll to zoom, click-drag the background to pan, and drag collection headers to reposition cards. Use the floating controls to zoom in, out, or reset." },
  { icon: BookOpen, title: "Side Panel Tabs", desc: "When a collection is selected, the right panel shows three tabs: Schema (attributes list), Perms (permissions), and Idx (indexes). Edit inline or add new entries." },
  { icon: Code2, title: "Code Generation", desc: "Select a collection and switch to the code tab to generate typed interfaces in TypeScript, Python, Dart, Kotlin, Swift, and more. Copy with one click." },
  { icon: Database, title: "System Attributes", desc: "Every collection automatically displays $id at the top and $createdAt / $updatedAt at the bottom. These system attributes are read-only but visible for reference." },
];

const TROUBLESHOOTING = [
  { icon: AlertTriangle, title: "Connection failed", desc: 'Double-check your endpoint URL (must end with /v1), project ID, and API key. Ensure the key has "databases" scope enabled.' },
  { icon: HelpCircle, title: "Collections not loading", desc: "Make sure your selected database has at least one collection. Try switching databases or refreshing the connection." },
  { icon: Lightbulb, title: "Relationships not showing", desc: "Relationship edges only appear for attributes of type 'relationship'. Verify the attribute exists in both collections for two-way links." },
  { icon: Monitor, title: "Canvas looks empty", desc: "If collections are off-screen, use the fit-all button in the floating controls or scroll to zoom out." },
];

const API_REFERENCE = [
  { method: "GET", path: "/databases", desc: "List all databases in the project" },
  { method: "GET", path: "/databases/{id}/collections", desc: "List collections in a database" },
  { method: "GET", path: "/databases/{id}/collections/{id}/attributes", desc: "List attributes of a collection" },
  { method: "POST", path: "/databases/{id}/collections", desc: "Create a new collection" },
  { method: "POST", path: "/databases/{id}/collections/{id}/attributes/string", desc: "Create a string attribute" },
  { method: "DELETE", path: "/databases/{id}/collections/{id}", desc: "Delete a collection" },
];

const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } };

export default function DocsPage() {
  return (
    <div className="relative overflow-hidden">
      {/* Animated background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        <div className="absolute -top-40 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-indigo-600/[0.07] blur-[150px]" />
        <div className="absolute right-0 top-96 h-[400px] w-[400px] rounded-full bg-violet-600/[0.04] blur-[120px]" />
      </div>

      {/* Header */}
      <section className="relative mx-auto max-w-4xl px-6 pb-12 pt-28 text-center md:pt-36">
        <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }} className="flex flex-col items-center">
          <motion.div variants={fadeUp} transition={{ duration: 0.5 }} className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/[0.06] px-4 py-1.5 text-xs font-medium text-indigo-400 backdrop-blur-sm">
            <BookOpen size={12} /> Documentation
          </motion.div>
          <motion.h1 variants={fadeUp} transition={{ duration: 0.5 }} className="max-w-2xl text-3xl font-extrabold tracking-tight text-white md:text-5xl">
            Getting{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">Started</span>
          </motion.h1>
          <motion.p variants={fadeUp} transition={{ duration: 0.5 }} className="mt-4 max-w-lg text-base text-zinc-400 md:text-lg">Connect Xina to your Appwrite project in under two minutes. Here&apos;s everything you need.</motion.p>
        </motion.div>
      </section>

      {/* Table of contents */}
      <section className="relative mx-auto max-w-3xl px-6 pb-12">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-sm">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">On this page</h3>
          <ul className="space-y-2">
            {["Getting Started (5 steps)", "Key Concepts", "Canvas Controls", "Troubleshooting", "API Reference"].map((title, i) => (
              <li key={title} className="flex items-center gap-2.5 text-[13px] text-zinc-400 transition-colors hover:text-indigo-400 cursor-default">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-white/[0.04] text-[10px] font-semibold text-zinc-500">{i + 1}</span>
                {title}
              </li>
            ))}
          </ul>
        </motion.div>
      </section>

      {/* Steps */}
      <section className="relative mx-auto max-w-3xl px-6 pb-24">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="mb-10 text-center">
          <span className="mb-3 inline-block rounded-full bg-emerald-500/[0.08] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">Setup Guide</span>
          <h2 className="text-2xl font-bold text-white md:text-4xl">5 steps to get started</h2>
        </motion.div>
        <div className="space-y-0">
          {STEPS.map((s, i) => (
            <motion.div key={s.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.4, delay: i * 0.05 }} className="relative border-l-2 border-white/[0.06] pb-10 pl-8 last:pb-0">
              <div className="absolute -left-[17px] top-0 flex h-8 w-8 items-center justify-center rounded-full border border-indigo-500/30 bg-indigo-600/10 text-xs font-bold text-indigo-400 ring-4 ring-[#09090b]">{s.step}</div>
              <div className="flex items-center gap-2.5 pt-1">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600/10 text-indigo-400"><s.icon size={14} /></span>
                <h3 className="text-lg font-bold text-white">{s.title}</h3>
              </div>
              <div className="mt-3 space-y-2">{s.content.map((line, li) => <p key={li} className="text-[14px] leading-relaxed text-zinc-400">{line}</p>)}</div>
              {s.code && (
                <div className="mt-4 overflow-hidden rounded-xl border border-white/[0.06]">
                  <div className="flex items-center gap-1.5 border-b border-white/[0.06] bg-white/[0.02] px-4 py-2">
                    <span className="h-2 w-2 rounded-full bg-red-500/50" />
                    <span className="h-2 w-2 rounded-full bg-yellow-500/50" />
                    <span className="h-2 w-2 rounded-full bg-green-500/50" />
                    <span className="ml-2 text-[10px] text-zinc-600">config</span>
                  </div>
                  <pre className="overflow-x-auto bg-[#0c0c0f] p-4 font-mono text-[12px] leading-relaxed text-zinc-400">{s.code}</pre>
                </div>
              )}
              {s.note && <div className="mt-3 rounded-lg border border-amber-500/15 bg-amber-500/[0.05] px-4 py-2.5 text-[12px] text-amber-400/80"><strong className="font-semibold">Note:</strong> {s.note}</div>}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Key concepts */}
      <section className="relative mx-auto max-w-4xl px-6 pb-28">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="mb-14 text-center">
          <span className="mb-3 inline-block rounded-full bg-indigo-500/[0.08] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-indigo-400">Reference</span>
          <h2 className="text-2xl font-bold text-white md:text-4xl">Key Concepts</h2>
          <p className="mt-3 text-sm text-zinc-500">Quick reference for the main studio features.</p>
        </motion.div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TOPICS.map((t, i) => (
            <motion.div key={t.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-30px" }} transition={{ duration: 0.35, delay: i * 0.05 }} className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 transition-all hover:border-white/[0.1]">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/10 ring-1 ring-indigo-500/20 text-indigo-400 transition-all group-hover:bg-indigo-600/15"><t.icon size={17} /></div>
              <h3 className="mb-1.5 text-[15px] font-semibold text-white">{t.title}</h3>
              <p className="text-[13px] leading-relaxed text-zinc-500">{t.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Canvas controls */}
      <section className="relative mx-auto max-w-3xl px-6 pb-28">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <div className="mb-10 text-center">
            <span className="mb-3 inline-block rounded-full bg-violet-500/[0.08] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-violet-400">Controls</span>
            <h2 className="text-2xl font-bold text-white md:text-4xl">Canvas Controls</h2>
          </div>
          <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02]">
            {[
              ["Scroll", "Zoom in / out"],
              ["Click + drag background", "Pan canvas"],
              ["Click + drag header", "Move collection"],
              ["Click collection", "Select & show details"],
              ["Click attribute row", "Inspect attribute"],
              ["Escape", "Deselect / close panel"],
              ["F", "Fit all collections in view"],
              ["Delete", "Delete selected item"],
            ].map(([key, action], i) => (
              <div key={key} className={`flex items-center justify-between px-6 py-3.5 text-[13px] transition-colors hover:bg-white/[0.02] ${i > 0 ? "border-t border-white/[0.04]" : ""}`}>
                <kbd className="rounded-md border border-white/[0.08] bg-white/[0.04] px-3 py-1 font-mono text-[11px] text-zinc-300 shadow-sm shadow-black/20">{key}</kbd>
                <span className="text-zinc-500">{action}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Troubleshooting */}
      <section className="relative mx-auto max-w-4xl px-6 pb-28">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="mb-14 text-center">
          <span className="mb-3 inline-block rounded-full bg-amber-500/[0.08] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-400">Help</span>
          <h2 className="text-2xl font-bold text-white md:text-4xl">Troubleshooting</h2>
          <p className="mt-3 text-sm text-zinc-500">Common issues and how to resolve them.</p>
        </motion.div>
        <div className="grid gap-4 sm:grid-cols-2">
          {TROUBLESHOOTING.map((t, i) => (
            <motion.div key={t.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-30px" }} transition={{ duration: 0.35, delay: i * 0.05 }} className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 transition-all hover:border-white/[0.1]">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 ring-1 ring-amber-500/20 text-amber-400 transition-all group-hover:bg-amber-500/15"><t.icon size={17} /></div>
              <h3 className="mb-1.5 text-[15px] font-semibold text-white">{t.title}</h3>
              <p className="text-[13px] leading-relaxed text-zinc-500">{t.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* API reference */}
      <section className="relative mx-auto max-w-3xl px-6 pb-28">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <div className="mb-10 text-center">
            <span className="mb-3 inline-block rounded-full bg-indigo-500/[0.08] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-indigo-400">API</span>
            <div className="mt-2 flex items-center justify-center gap-2"><Terminal size={16} className="text-indigo-400" /><h2 className="text-2xl font-bold text-white md:text-4xl">Appwrite API Reference</h2></div>
            <p className="mt-3 text-sm text-zinc-500">The Appwrite REST endpoints Xina uses under the hood.</p>
          </div>
          <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02]">
            <div className="border-b border-white/[0.06] bg-white/[0.02] px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              Endpoints
            </div>
            {API_REFERENCE.map((r, i) => (
              <div key={r.path + r.method} className={`flex items-center gap-4 px-6 py-3.5 transition-colors hover:bg-white/[0.02] ${i > 0 ? "border-t border-white/[0.04]" : ""}`}>
                <span className={`rounded-md px-2.5 py-0.5 font-mono text-[10px] font-bold ${r.method === "GET" ? "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20" : r.method === "POST" ? "bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20" : "bg-red-500/10 text-red-400 ring-1 ring-red-500/20"}`}>{r.method}</span>
                <span className="font-mono text-[12px] text-zinc-400">{r.path}</span>
                <span className="ml-auto hidden text-[11px] text-zinc-600 sm:block">{r.desc}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Self-host section */}
      <section className="relative mx-auto max-w-4xl px-6 pb-28">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5 }} className="grid items-center gap-8 md:grid-cols-2">
          <div>
            <span className="mb-3 inline-block rounded-full bg-emerald-500/[0.08] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">Self-hosted</span>
            <h2 className="mb-3 text-xl font-bold text-white md:text-2xl">Works with self-hosted Appwrite</h2>
            <p className="mb-4 text-[14px] leading-relaxed text-zinc-400">Running Appwrite on your own server? Just enter your custom endpoint and Xina connects directly — no cloud dependency required.</p>
            <div className="overflow-hidden rounded-xl border border-white/[0.06]">
              <div className="flex items-center gap-1.5 border-b border-white/[0.06] bg-white/[0.02] px-4 py-2">
                <span className="h-2 w-2 rounded-full bg-red-500/50" />
                <span className="h-2 w-2 rounded-full bg-yellow-500/50" />
                <span className="h-2 w-2 rounded-full bg-green-500/50" />
                <span className="ml-2 text-[10px] text-zinc-600">config</span>
              </div>
              <pre className="overflow-x-auto bg-[#0c0c0f] p-4 font-mono text-[12px] leading-relaxed text-zinc-400">{`Endpoint:   https://appwrite.your-domain.com/v1
Project ID: your-project-id
API Key:    your-api-key`}</pre>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="group w-full max-w-xs rounded-2xl border border-white/[0.06] bg-white/[0.02] p-7 text-center transition-all hover:border-white/[0.1]">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-600/10 ring-1 ring-indigo-500/20 text-indigo-400 transition-all group-hover:bg-indigo-600/15"><Database size={24} /></div>
              <p className="text-[15px] font-semibold text-white">Any Appwrite 1.4+</p>
              <p className="mt-1 text-[12px] text-zinc-500">Cloud or self-hosted</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="relative mx-auto max-w-4xl px-6 pb-28">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-600/[0.12] via-violet-600/[0.06] to-transparent p-10 text-center md:p-16">
          <div className="pointer-events-none absolute -left-20 -top-20 h-60 w-60 rounded-full bg-indigo-600/10 blur-[80px]" />
          <div className="pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-violet-600/10 blur-[60px]" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, #fff 0.5px, transparent 0.5px)", backgroundSize: "20px 20px" }} />
          <div className="relative">
            <h2 className="text-2xl font-bold text-white md:text-4xl">Ready to start?</h2>
            <p className="mt-3 text-sm text-zinc-400 md:text-base">Open the studio, paste your Appwrite credentials, and see your schema come to life.</p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/studio" className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-[#09090b] shadow-xl transition-all hover:bg-zinc-100">
                Open Studio <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link href="/features" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-7 py-3.5 text-sm font-semibold text-white transition-all hover:border-white/30 hover:bg-white/[0.06]">
                See Features
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
