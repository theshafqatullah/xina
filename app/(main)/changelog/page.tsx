"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  GitCommit,
  Sparkles,
  Tag,
} from "lucide-react";

const RELEASES = [
  {
    version: "0.4.0",
    date: "June 2025",
    tag: "Latest",
    changes: [
      { type: "feat", text: "Multi-language code generation (TypeScript, Python, Dart, Kotlin, Swift, PHP, Ruby, Go, Rust)" },
      { type: "feat", text: "Export ERD canvas as high-resolution PNG and SVG" },
      { type: "feat", text: "Copy generated code to clipboard with one click" },
      { type: "fix", text: "Improved edge routing for complex overlapping collections" },
      { type: "fix", text: "Fixed scroll zoom sensitivity on trackpads" },
    ],
  },
  {
    version: "0.3.0",
    date: "May 2025",
    tag: null,
    changes: [
      { type: "feat", text: "Crow's foot markers for two-way (many-to-many) relationships" },
      { type: "feat", text: "Directional arrow markers for one-way relationships" },
      { type: "feat", text: "System attributes ($id, $createdAt, $updatedAt) on every collection card" },
      { type: "feat", text: "Gray neutral zebra striping for attribute rows" },
      { type: "fix", text: "Removed duplicate edges for mirrored relationship pairs" },
      { type: "fix", text: "Port dots now correctly target $id row for one-way links" },
    ],
  },
  {
    version: "0.2.0",
    date: "April 2025",
    tag: null,
    changes: [
      { type: "feat", text: "Interactive ERD canvas with drag, pan, and zoom" },
      { type: "feat", text: "Obstacle-aware orthogonal edge routing with rounded Bézier corners" },
      { type: "feat", text: "Side panel with Schema, Permissions, and Indexes tabs" },
      { type: "feat", text: "Create databases, collections, and attributes from the studio" },
      { type: "fix", text: "Improved auto-layout algorithm for initial collection placement" },
    ],
  },
  {
    version: "0.1.0",
    date: "March 2025",
    tag: null,
    changes: [
      { type: "feat", text: "Initial release — connect to Appwrite via endpoint, project ID, and API key" },
      { type: "feat", text: "List databases and collections from the left sidebar" },
      { type: "feat", text: "Render collections as cards on a canvas" },
      { type: "feat", text: "Basic relationship line rendering between collections" },
    ],
  },
];

const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } };

function TypeBadge({ type }: { type: string }) {
  const styles = type === "feat"
    ? "bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/20"
    : type === "fix"
    ? "bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20"
    : "bg-zinc-500/10 text-zinc-400 ring-1 ring-zinc-500/20";
  return (
    <span className={`rounded-md px-2 py-0.5 font-mono text-[10px] font-semibold uppercase ${styles}`}>
      {type}
    </span>
  );
}

export default function ChangelogPage() {
  return (
    <div className="relative overflow-hidden">
      {/* Animated background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        <div className="absolute -top-40 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-indigo-600/[0.07] blur-[150px]" />
        <div className="absolute left-0 top-80 h-[400px] w-[400px] rounded-full bg-violet-600/[0.04] blur-[120px]" />
      </div>

      {/* Header */}
      <section className="relative mx-auto max-w-4xl px-6 pb-12 pt-28 text-center md:pt-36">
        <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }} className="flex flex-col items-center">
          <motion.div variants={fadeUp} transition={{ duration: 0.5 }} className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/[0.06] px-4 py-1.5 text-xs font-medium text-indigo-400 backdrop-blur-sm">
            <GitCommit size={12} /> Changelog
          </motion.div>
          <motion.h1 variants={fadeUp} transition={{ duration: 0.5 }} className="max-w-2xl text-3xl font-extrabold tracking-tight text-white md:text-5xl">
            What&apos;s{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">new</span>{" "}
            in Xina
          </motion.h1>
          <motion.p variants={fadeUp} transition={{ duration: 0.5 }} className="mt-4 max-w-lg text-base text-zinc-400 md:text-lg">A chronological list of every feature, fix, and improvement — newest first.</motion.p>
        </motion.div>
      </section>

      {/* Timeline */}
      <section className="relative mx-auto max-w-3xl px-6 pb-24">
        <div className="space-y-0">
          {RELEASES.map((release, ri) => (
            <motion.div key={release.version} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.4, delay: ri * 0.05 }} className="relative border-l-2 border-white/[0.06] pb-12 pl-8 last:pb-0">
              {/* Version circle */}
              <div className="absolute -left-[17px] top-0 flex h-8 w-8 items-center justify-center rounded-full border border-indigo-500/30 bg-indigo-600/10 ring-4 ring-[#09090b]">
                <Tag size={13} className="text-indigo-400" />
              </div>

              <div className="flex items-center gap-3 pt-1">
                <h3 className="text-lg font-bold text-white">v{release.version}</h3>
                <span className="text-xs text-zinc-500">{release.date}</span>
                {release.tag && (
                  <span className="rounded-full bg-indigo-600 px-2.5 py-0.5 text-[10px] font-semibold text-white shadow-lg shadow-indigo-600/30">{release.tag}</span>
                )}
              </div>

              <ul className="mt-4 space-y-3">
                {release.changes.map((c) => (
                  <li key={c.text} className="flex items-start gap-3 text-[13px] text-zinc-400">
                    <TypeBadge type={c.type} />
                    <span className="leading-relaxed">{c.text}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Subscribe / CTA */}
      <section className="relative mx-auto max-w-4xl px-6 pb-28">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5 }} className="relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-600/[0.12] via-violet-600/[0.06] to-transparent p-10 text-center md:p-16">
          <div className="pointer-events-none absolute -left-20 -top-20 h-60 w-60 rounded-full bg-indigo-600/10 blur-[80px]" />
          <div className="pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-violet-600/10 blur-[60px]" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, #fff 0.5px, transparent 0.5px)", backgroundSize: "20px 20px" }} />
          <div className="relative">
            <h2 className="text-2xl font-bold text-white md:text-4xl">Stay up to date</h2>
            <p className="mt-3 text-sm text-zinc-400 md:text-base">Try the latest features right now in the studio.</p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/studio" className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-[#09090b] shadow-xl transition-all hover:bg-zinc-100">
                Open Studio <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
