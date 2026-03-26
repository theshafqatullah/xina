"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  ChevronDown,
  CreditCard,
  Database,
  GitBranch,
  Layers,
  MousePointerClick,
  Shield,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import { useState } from "react";

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    desc: "For individual developers designing database schemas.",
    cta: "Get Started",
    ctaHref: "/studio",
    highlight: false,
    features: [
      "10+ database engines supported",
      "AI schema generation",
      "Drag & drop ERD canvas",
      "Relationship visualization",
      "Create & edit tables and columns",
      "Code generation (TypeScript, SQL DDL, etc.)",
      "Unlimited databases & tables",
    ],
  },
  {
    name: "Pro",
    price: "$9",
    period: "/ month",
    desc: "For teams and power users who need advanced capabilities.",
    cta: "Coming Soon",
    ctaHref: "#",
    highlight: true,
    features: [
      "Everything in Free",
      "Team collaboration (shared canvas)",
      "Schema versioning & history",
      "Export to SQL migrations",
      "Custom themes & branding",
      "Priority support",
      "Advanced index & constraint management",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    desc: "For organizations requiring dedicated support and custom integrations.",
    cta: "Contact Us",
    ctaHref: "#",
    highlight: false,
    features: [
      "Everything in Pro",
      "SSO & RBAC",
      "Self-hosted option",
      "Custom database endpoint configs",
      "Dedicated onboarding",
      "SLA & uptime guarantees",
      "Audit logging",
    ],
  },
];

const BENEFITS = [
  { icon: Database, label: "Connects to 10+ database engines", desc: "SQL, NoSQL, and BaaS" },
  { icon: GitBranch, label: "Full relationship mapping", desc: "Included free forever" },
  { icon: Layers, label: "No limits on tables", desc: "Create unlimited schemas" },
  { icon: MousePointerClick, label: "Click-to-inspect everything", desc: "Full detail panel" },
  { icon: Zap, label: "One-click deploy", desc: "Push schemas to any engine" },
  { icon: Sparkles, label: "AI schema generation", desc: "Describe, generate, done" },
];

const COMPARE_FEATURES = [
  { name: "Database engines", free: "10+", pro: "10+", enterprise: "10+" },
  { name: "AI schema generation", free: true, pro: true, enterprise: true },
  { name: "Drag & drop ERD canvas", free: true, pro: true, enterprise: true },
  { name: "Relationship visualization", free: true, pro: true, enterprise: true },
  { name: "Code generation", free: true, pro: true, enterprise: true },
  { name: "Table & column CRUD", free: true, pro: true, enterprise: true },
  { name: "Team collaboration", free: false, pro: true, enterprise: true },
  { name: "Schema versioning", free: false, pro: true, enterprise: true },
  { name: "SQL migration export", free: false, pro: true, enterprise: true },
  { name: "Custom themes", free: false, pro: true, enterprise: true },
  { name: "SSO & RBAC", free: false, pro: false, enterprise: true },
  { name: "Self-hosted option", free: false, pro: false, enterprise: true },
  { name: "SLA & uptime guarantee", free: false, pro: false, enterprise: true },
  { name: "Dedicated onboarding", free: false, pro: false, enterprise: true },
  { name: "Audit logging", free: false, pro: false, enterprise: true },
];

const FAQ = [
  { q: "Is the free plan really free forever?", a: "Yes \u2014 the core ERD canvas, AI schema generation, drag & drop builder, code generation, and all editing tools are permanently free with no time limit across all 10+ supported databases." },
  { q: "What payment methods do you accept?", a: "Pro plans accept all major credit cards via Stripe. Enterprise billing is flexible \u2014 contact us for invoicing." },
  { q: "Can I cancel my Pro plan anytime?", a: "Absolutely. You can downgrade to Free at any time and keep access until the end of your billing period." },
  { q: "Do you offer discounts for startups or OSS?", a: "Yes \u2014 reach out to our team for special pricing for open-source projects, non-profits, and early-stage startups." },
  { q: "Is my data secure?", a: "Xina never stores your database content. Your credentials stay in your browser and are used only to communicate with your own database instances directly." },
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

function CellValue({ value }: { value: boolean | string }) {
  if (typeof value === "string") return <span className="text-[12px] font-medium text-zinc-300">{value}</span>;
  return value ? <Check size={15} className="text-purple-400" /> : <X size={13} className="text-zinc-700/50" />;
}

export default function PricingPage() {
  return (
    <div className="relative overflow-hidden">
      {/* Animated background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
      </div>

      {/* Header */}
      <section className="relative mx-auto max-w-6xl px-6 pb-16 pt-28 text-center md:pt-36">
        <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }} className="flex flex-col items-center">
          <motion.div variants={fadeUp} transition={{ duration: 0.5 }} className="mb-5 inline-flex items-center gap-2 border border-purple-500/20 bg-purple-500/[0.06] px-4 py-1.5 text-xs font-medium text-purple-400">
            <Sparkles size={12} /> Pricing
          </motion.div>
          <motion.h1 variants={fadeUp} transition={{ duration: 0.5 }} className="max-w-3xl text-3xl font-extrabold tracking-tight text-white md:text-5xl">
            Simple,{" "}
            <span className="text-purple-400">transparent</span>{" "}
            pricing
          </motion.h1>
          <motion.p variants={fadeUp} transition={{ duration: 0.5 }} className="mt-4 max-w-lg text-base text-zinc-400 md:text-lg">Start free with full AI-powered ERD and drag & drop capabilities for 10+ database engines. Upgrade when you need team collaboration.</motion.p>
        </motion.div>
      </section>

      {/* Plans */}
      <section className="relative mx-auto max-w-5xl px-6 pb-28">
        <div className="grid gap-6 md:grid-cols-3">
          {PLANS.map((plan, i) => (
            <motion.div key={plan.name} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 + i * 0.08 }} className={`relative flex flex-col overflow-hidden rounded-2xl border p-7 transition-all ${plan.highlight ? "border-purple-500/30 bg-purple-500/[0.06]" : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.1]"}`}>
              <div className="relative">
                <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                {plan.highlight && (
                  <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-purple-600 px-3 py-1 text-[10px] font-semibold text-white">Popular</span>
                )}
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold tracking-tight text-white">{plan.price}</span>
                  {plan.period && <span className="text-sm text-zinc-500">{plan.period}</span>}
                </div>
                <p className="mt-2 text-[13px] leading-relaxed text-zinc-400">{plan.desc}</p>
                <Link href={plan.ctaHref} className={`mt-6 flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold transition-all ${plan.highlight ? "bg-purple-600 text-white hover:bg-purple-700" : "border border-white/[0.1] text-white hover:bg-white/[0.06]"}`}>
                  {plan.cta}
                </Link>
              </div>
              <ul className="mt-7 flex-1 space-y-3 border-t border-white/[0.06] pt-7">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-[13px] text-zinc-400">
                    <Check size={14} className="mt-0.5 shrink-0 text-purple-400" />
                    {f}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Included in every plan */}
      <section className="relative mx-auto max-w-6xl px-6 pb-32">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="mb-14 text-center">
          <span className="mb-3 inline-block text-[10px] font-semibold uppercase tracking-wider text-purple-400">Always Free</span>
          <h2 className="text-2xl font-bold text-white md:text-4xl">Included in every plan</h2>
          <p className="mt-3 text-sm text-zinc-500">Core ERD features are free — no credit card required.</p>
        </motion.div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((b, i) => (
            <motion.div key={b.label} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-30px" }} transition={{ duration: 0.35, delay: i * 0.05 }} className="group flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 transition-all hover:border-white/[0.1]">
              <span className="shrink-0 text-purple-400"><b.icon size={20} /></span>
              <div>
                <span className="text-[13px] font-semibold text-zinc-200">{b.label}</span>
                <p className="text-[11px] text-zinc-500">{b.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── Feature comparison table ─── */}
      <section className="relative mx-auto max-w-4xl px-6 pb-32">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.5 }} className="mb-10 text-center">
          <span className="mb-3 inline-block text-[10px] font-semibold uppercase tracking-wider text-purple-400">Comparison</span>
          <h2 className="text-2xl font-bold tracking-tight text-white md:text-4xl">Compare plans</h2>
          <p className="mt-3 text-sm text-zinc-500">See exactly which features are available on each tier.</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }} className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02]">
          <div className="grid grid-cols-[1fr_72px_72px_90px] border-b border-white/[0.06] bg-white/[0.02] px-6 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            <span>Feature</span><span className="text-center">Free</span><span className="text-center text-purple-400">Pro</span><span className="text-center">Enterprise</span>
          </div>
          {COMPARE_FEATURES.map((r, i) => (
            <div key={r.name} className={`grid grid-cols-[1fr_72px_72px_90px] items-center px-6 py-3.5 transition-colors hover:bg-white/[0.02] ${i > 0 ? "border-t border-white/[0.04]" : ""}`}>
              <span className="text-[13px] text-zinc-400">{r.name}</span>
              <span className="flex justify-center"><CellValue value={r.free} /></span>
              <span className="flex justify-center"><CellValue value={r.pro} /></span>
              <span className="flex justify-center"><CellValue value={r.enterprise} /></span>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ─── Trust badges ─── */}
      <section className="relative mx-auto max-w-4xl px-6 pb-32">
        <div className="grid gap-5 sm:grid-cols-3">
          {[
            { icon: CreditCard, title: "No credit card needed", desc: "Start free instantly — no payment info required.", accent: "from-emerald-500 to-teal-500" },
            { icon: Zap, title: "Cancel anytime", desc: "Downgrade to Free at any time, no questions asked.", accent: "from-amber-500 to-orange-500" },
            { icon: Shield, title: "Your data stays yours", desc: "We never store database content. API keys remain local.", accent: "from-purple-500 to-violet-500" },
          ].map((b, i) => (
            <motion.div key={b.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-30px" }} transition={{ duration: 0.35, delay: i * 0.06 }} className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-7 text-center transition-all hover:border-white/[0.1]">
              <div className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${b.accent} opacity-0 blur-[40px] transition-opacity group-hover:opacity-[0.06]`} />
              <span className="mx-auto mb-4 block text-purple-400"><b.icon size={22} /></span>
              <h3 className="mb-1.5 text-[14px] font-semibold text-white">{b.title}</h3>
              <p className="text-[12px] leading-relaxed text-zinc-500">{b.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── Pricing FAQ ─── */}
      <section className="relative mx-auto max-w-3xl px-6 pb-32">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.5 }} className="mb-10 text-center">
          <span className="mb-3 inline-block text-[10px] font-semibold uppercase tracking-wider text-purple-400">FAQ</span>
          <h2 className="text-2xl font-bold tracking-tight text-white md:text-4xl">Pricing FAQ</h2>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-6">
          {FAQ.map((f) => <FaqItem key={f.q} q={f.q} a={f.a} />)}
        </motion.div>
      </section>

      {/* ─── CTA ─── */}
      <section className="relative mx-auto max-w-6xl px-6 pb-28">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5 }} className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-white/[0.02] p-10 text-center md:p-16">
          <div className="relative">
            <h2 className="text-2xl font-bold text-white md:text-4xl">Start building for free</h2>
            <p className="mt-3 text-sm text-zinc-400 md:text-base">No credit card. No time limit. Just open the studio.</p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/studio" className="inline-flex items-center justify-center gap-2 bg-purple-600 px-7 py-3.5 text-sm font-semibold text-white hover:bg-purple-700">
                Launch Studio <ArrowRight size={15} />
              </Link>
              <Link href="/features" className="inline-flex items-center justify-center gap-2 border border-white/[0.1] px-7 py-3.5 text-sm font-semibold text-white hover:bg-white/[0.06]">
                See All Features
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
