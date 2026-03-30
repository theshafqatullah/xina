"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Cpu, Flame, Code2, HeartPulse, Landmark, Rocket, Sparkles, ArrowRight, CheckCircle2, Eye, Layers, Box, Shield, Brain } from "lucide-react";

const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } };

const focusAreas = [
  { icon: Cpu, title: "Artificial Intelligence", description: "From model inference to AI-native applications. We've backed Replicate, LangChain, Modal, Together AI, and Qdrant — investing at every layer of the AI stack.", examples: "Replicate, LangChain, Modal, Together AI", accent: "from-purple-500 to-blue-500" },
  { icon: Code2, title: "Developer Tools & Infrastructure", description: "Platforms that make engineers 10x more productive — from code to deployment. We believe developer experience is the ultimate moat. Our portfolio includes the tools the best engineers reach for daily.", examples: "Linear, Prisma, Railway, Resend, Zed", accent: "from-amber-500 to-orange-500" },
  { icon: Layers, title: "Cloud & Data Infrastructure", description: "The foundational infrastructure layer powering modern applications — databases, observability, edge compute, and real-time data pipelines serving billions of requests.", examples: "Neon, Turso, Upstash, Tinybird, MotherDuck", accent: "from-cyan-500 to-blue-500" },
  { icon: Landmark, title: "Fintech", description: "Reimagining financial infrastructure from the ground up — startup banking, payments, and embedded finance powering the next generation of commerce.", examples: "Mercury", accent: "from-blue-500 to-indigo-500" },
  { icon: Flame, title: "Climate & Energy", description: "Breakthrough technologies in energy storage, carbon capture, grid optimization, and sustainable infrastructure. We invest where deep science meets massive market opportunity.", examples: "Multiple stealth investments", accent: "from-emerald-500 to-teal-500" },
  { icon: Brain, title: "AI Infrastructure", description: "Vector search, GPU compute, workflow orchestration — the essential picks and shovels of the AI revolution. We back the infrastructure layer that every AI company depends on.", examples: "Qdrant, Modal", accent: "from-rose-500 to-pink-500" },
];

const stages = [
  { name: "Pre-Seed", check: "$250K – $1M", description: "Conviction-based bets on exceptional founding teams before product-market fit. We back technical founders with deep domain expertise and a contrarian view of where their market is heading. At this stage, we're investing in people and ideas — not metrics.", investments: "30+ companies" },
  { name: "Seed", check: "$1M – $5M", description: "Partnering at the earliest inflection point — where strong signals emerge from early traction, design partners, or waitlist demand. We help founders refine positioning, build their first GTM motion, and recruit their founding engineering team.", investments: "40+ companies" },
  { name: "Series A", check: "$5M – $20M", description: "Scaling proven models with significant capital and hands-on operational support. At this stage, we focus on companies with clear product-market fit, repeatable revenue, and a path to category leadership. We take board seats and get deeply involved.", investments: "35+ companies" },
  { name: "Growth", check: "$20M – $100M+", description: "Selective follow-on and new investments in breakout companies approaching or exceeding $50M ARR. We help with international expansion, M&A strategy, executive recruiting, and IPO readiness. Our network of 1,200+ operators becomes especially valuable here.", investments: "15+ companies" },
];

const principles = [
  { icon: Eye, title: "Contrarian Conviction", description: "We invest behind thesis-driven insights that most of the market hasn't priced in yet. Every deal starts with a non-consensus belief about where the world is going." },
  { icon: Shield, title: "Founder Alignment", description: "We optimize for long-term value creation, not short-term markups. Average hold period of 8+ years. We've never forced a founder into an exit they didn't want." },
  { icon: Box, title: "Concentrated Bets", description: "We make fewer, larger investments than most firms our size. 120+ companies across 12 years means roughly 10 new investments per year — each one deeply diligenced." },
  { icon: CheckCircle2, title: "Operational Depth", description: "Our partners have collectively built companies to $10B+ in valuation. We bring recruiting networks, pricing playbooks, sales methodologies, and board governance — not just advice." },
];

export default function ThesisPage() {
  return (
    <div className="relative overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "radial-gradient(circle, #555 0.8px, transparent 0.8px)", backgroundSize: "24px 24px" }} />
        <div className="absolute -top-40 left-1/2 h-[600px] w-[900px] -translate-x-1/2 bg-purple-600/[0.07] blur-[150px]" />
      </div>

      {/* Header */}
      <section className="relative mx-auto max-w-4xl px-6 pb-16 pt-28 text-center md:pt-36">
        <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }} className="flex flex-col items-center">
          <motion.div variants={fadeUp} transition={{ duration: 0.5 }} className="mb-5 inline-flex items-center gap-2 border border-purple-500/20 bg-purple-500/[0.06] px-4 py-1.5 text-xs font-medium text-purple-400 backdrop-blur-sm">
            <Sparkles size={12} /> Thesis
          </motion.div>
          <motion.h1 variants={fadeUp} transition={{ duration: 0.5 }} className="max-w-3xl text-3xl font-extrabold tracking-tight text-white md:text-5xl">
            Investing in the{" "}
            <span className="text-purple-400">infrastructure layer</span>{" "}
            of the future
          </motion.h1>
          <motion.p variants={fadeUp} transition={{ duration: 0.5 }} className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-400 md:text-lg">
            We invest in technology companies that solve hard problems at scale. Our thesis is built on 12 years of pattern recognition: the biggest outcomes come from backing brilliant founders early, supporting them deeply across every stage, and staying patient for outsized returns.
          </motion.p>
        </motion.div>
      </section>

      {/* Philosophy */}
      <section className="relative mx-auto max-w-5xl px-6 pb-28">
        {/* Philosophy image */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative mb-14 h-64 w-full overflow-hidden md:h-80"
        >
          <Image
            src="https://images.unsplash.com/photo-1620121692029-d088224ddc74?w=1400&q=80&auto=format&fit=crop"
            alt="Abstract purple light"
            fill
            className="object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-transparent" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5 }} className="grid items-start gap-10 md:grid-cols-2">
          <div>
            <span className="mb-3 inline-block bg-purple-500/[0.08] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-purple-400">Philosophy</span>
            <h2 className="mb-3 text-xl font-bold text-white md:text-2xl">How we think about investing</h2>
            <p className="text-[14px] leading-relaxed text-zinc-400">
              Great companies are built by founders who see the world differently. We look for contrarian conviction, deep domain expertise, and the relentless grit to build through years of uncertainty. The best investments we&apos;ve made were in founders everyone else thought were too early, too niche, or too ambitious.
            </p>
            <p className="mt-4 text-[14px] leading-relaxed text-zinc-400">
              We don&apos;t chase consensus deals. We develop independent thesis work on where markets are heading, then actively seek founders building in those spaces — often before anyone else is paying attention.
            </p>
          </div>
          <div className="space-y-4 text-[14px] leading-relaxed text-zinc-400">
            <p>
              We lead or co-lead rounds and take board seats when it matters. Our role goes beyond capital — we help with recruiting the first 50 hires, refining go-to-market strategy, structuring follow-on fundraising, and connecting founders to our network of 1,200+ operators and executives across 18 countries.
            </p>
            <p>
              We are multi-stage investors, writing first checks as small as $250K and follow-on investments exceeding $100M. We optimize for long-term ownership and deep partnership, not deal volume. Our average fund has made just 30-40 investments — each one with conviction.
            </p>
            <p>
              Across 4 funds and $2.4B in AUM, we&apos;ve maintained top-quartile returns with a 3.8x average MOIC and 45% net IRR. We believe this discipline — fewer bets, deeper support, longer holds — is why our founders re-up with us round after round.
            </p>
          </div>
        </motion.div>
      </section>

      {/* Investment Principles */}
      <section className="relative py-28">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.5 }} className="mb-14 text-center">
            <span className="mb-3 inline-block bg-amber-500/[0.08] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-400">Principles</span>
            <h2 className="text-xl font-bold text-white md:text-2xl">What guides our decisions</h2>
            <p className="mx-auto mt-2 max-w-lg text-[14px] text-zinc-500">Four principles that have remained constant across 12 years and 120+ investments.</p>
          </motion.div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {principles.map((p, i) => {
              const Icon = p.icon;
              return (
                <motion.div
                  key={p.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  className="group border border-white/[0.06] bg-white/[0.02] p-6 transition-all hover:border-white/[0.1] hover:bg-white/[0.04]"
                >
                  <div className="mb-4 inline-flex h-9 w-9 items-center justify-center bg-gradient-to-br from-amber-500 to-orange-600 text-white">
                    <Icon size={18} />
                  </div>
                  <h3 className="font-semibold text-white">{p.title}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-zinc-500">{p.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Focus Areas */}
      <section className="relative py-28">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.5 }} className="mb-14">
            <span className="mb-3 inline-block bg-violet-500/[0.08] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-violet-400">Focus Areas</span>
            <h2 className="text-xl font-bold text-white md:text-2xl">Where we invest</h2>
            <p className="mt-2 max-w-lg text-[14px] text-zinc-500">Sectors where we have deep conviction, operator experience, and a track record of category-defining investments.</p>
          </motion.div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {focusAreas.map((area, i) => {
              const Icon = area.icon;
              return (
                <motion.div
                  key={area.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  className="group border border-white/[0.06] bg-white/[0.02] p-6 transition-all hover:border-white/[0.1] hover:bg-white/[0.04]"
                >
                  <div className={`mb-4 inline-flex h-9 w-9 items-center justify-center bg-gradient-to-br ${area.accent} text-white`}>
                    <Icon size={18} />
                  </div>
                  <h3 className="font-semibold text-white">{area.title}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-zinc-500">{area.description}</p>
                  <p className="mt-3 text-[11px] font-medium text-zinc-600">
                    <span className="text-zinc-500">Portfolio:</span> {area.examples}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stage */}
      <section className="relative py-28">
        <div className="mx-auto max-w-4xl px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.5 }} className="mb-14">
            <span className="mb-3 inline-block bg-emerald-500/[0.08] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">Stages</span>
            <h2 className="text-xl font-bold text-white md:text-2xl">Stage &amp; Check Size</h2>
            <p className="mt-2 text-[14px] text-zinc-500">We invest across the full lifecycle — from first check to IPO readiness.</p>
          </motion.div>
          <div className="space-y-0">
            {stages.map((stage, i) => (
              <motion.div
                key={stage.name}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="flex gap-6 border-l border-white/[0.08] py-6 pl-6"
              >
                <div className="flex-1">
                  <div className="flex items-baseline gap-3">
                    <h3 className="font-semibold text-white">{stage.name}</h3>
                    <span className="text-[12px] font-medium text-purple-400">{stage.check}</span>
                    <span className="text-[10px] font-medium text-zinc-600">{stage.investments}</span>
                  </div>
                  <p className="mt-1 text-[13px] leading-relaxed text-zinc-500">{stage.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What We Look For */}
      <section className="relative py-28">
        <div className="mx-auto max-w-4xl px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.5 }} className="mb-14 text-center">
            <span className="mb-3 inline-block bg-purple-500/[0.08] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-purple-400">Criteria</span>
            <h2 className="text-xl font-bold text-white md:text-2xl">What we look for in founders</h2>
          </motion.div>
          <div className="grid gap-6 sm:grid-cols-2">
            {[
              { title: "Technical depth", desc: "We gravitate toward founders who are domain experts — people who've spent years thinking about the problem they're solving and can articulate a non-obvious insight." },
              { title: "Market timing", desc: "The best companies ride a secular tailwind. We look for founders who understand why their market is inflecting now and can capture the window before incumbents react." },
              { title: "Capital efficiency", desc: "We value founders who can do more with less. Capital discipline in early stages often predicts long-term operational excellence and margin expansion." },
              { title: "Distribution advantage", desc: "A great product isn't enough. We back founders with clear insights on how to reach customers — whether through bottom-up adoption, community, or enterprise sales." },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="border-l border-purple-500/20 pl-6"
              >
                <h3 className="font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-zinc-500">{item.desc}</p>
              </motion.div>
            ))}
          </div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="mt-16 text-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 bg-purple-600 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-purple-700"
            >
              Pitch Us <ArrowRight size={15} />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
