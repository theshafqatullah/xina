"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowRight,
  TrendingUp,
  Building2,
  DollarSign,
  Calendar,
  Globe,
  Users,
  Target,
  Zap,
  Shield,
  Lightbulb,
  Cpu,
  Code2,
  Layers,
  Landmark,
  Flame,
  Brain,
  Search as SearchIcon,
  Handshake,
  Rocket,
  LineChart,
  MapPin,
} from "lucide-react";

const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } };

const stats = [
  { icon: DollarSign, label: "Assets Under Management", value: "$2.4B" },
  { icon: Building2, label: "Portfolio Companies", value: "120+" },
  { icon: TrendingUp, label: "Successful Exits", value: "34" },
  { icon: Globe, label: "Countries", value: "18" },
  { icon: Users, label: "Founders Backed", value: "280+" },
  { icon: Calendar, label: "Years Active", value: "12" },
];

const logoMap: Record<string, string> = {
  Linear: "linear", Prisma: "prisma", Railway: "railway", Resend: "resend",
  Neon: "neon", Clerk: "clerk", Replicate: "replicate", Axiom: "axiom",
  "Trigger.dev": "triggerdotdev", Inngest: "inngest", Tinybird: "tinybird",
  Dub: "dub", Warp: "warp", Upstash: "upstash", LangChain: "langchain",
  Convex: "convex", Turso: "turso", "Cal.com": "caldotcom",
};

const featuredCompanies = [
  { name: "Linear", sector: "Developer Tools", description: "The issue tracking tool built for speed. Streamlines project management for high-performance engineering teams.", stage: "Series B" },
  { name: "Neon", sector: "Database Infrastructure", description: "Serverless Postgres with branching, autoscaling, and bottomless storage for modern apps.", stage: "Series B" },
  { name: "Railway", sector: "Developer Tools", description: "Infrastructure platform that provisions instant, production-ready environments. Deploy in seconds.", stage: "Series A" },
  { name: "Replicate", sector: "AI Infrastructure", description: "Run and fine-tune open-source ML models with a cloud API. No infrastructure management needed.", stage: "Series B" },
  { name: "Warp", sector: "Developer Tools", description: "The modern terminal reimagined with AI, collaborative features, and GPU-accelerated rendering.", stage: "Series B" },
  { name: "LangChain", sector: "AI Infrastructure", description: "Framework for building LLM-powered apps. Chains, agents, and retrieval-augmented generation.", stage: "Series A" },
];

const pillars = [
  { icon: Target, title: "Conviction-Led", desc: "We invest behind deep thesis work — not trends. Every deal starts with a contrarian belief about where the market is going." },
  { icon: Zap, title: "Operator DNA", desc: "Our partners have built and scaled companies to billions in revenue. We bring operational muscle, not just capital." },
  { icon: Shield, title: "Long-Term Partners", desc: "We don't flip positions. Average hold period is 8+ years. We ride the entire value-creation curve alongside founders." },
  { icon: Lightbulb, title: "Full-Stack Support", desc: "Dedicated platform team for recruiting, GTM, finance, and international expansion across all portfolio companies." },
];

const focusAreas = [
  { icon: Cpu, title: "Artificial Intelligence", description: "From model inference to AI-native apps. We've backed Replicate, LangChain, Modal, Together AI, and Qdrant.", accent: "from-purple-500 to-blue-500" },
  { icon: Code2, title: "Developer Tools", description: "Platforms that make engineers 10x more productive — Linear, Prisma, Railway, Resend, Zed, Mintlify.", accent: "from-amber-500 to-orange-500" },
  { icon: Layers, title: "Cloud & Data", description: "Databases, observability, edge compute, and real-time pipelines — Neon, Turso, Tinybird, MotherDuck, Axiom.", accent: "from-cyan-500 to-blue-500" },
  { icon: Landmark, title: "Fintech", description: "Startup banking, payments infrastructure, and financial workflows — Mercury.", accent: "from-blue-500 to-indigo-500" },
  { icon: Flame, title: "Climate & Energy", description: "Energy storage, carbon capture, grid optimization, and sustainable infrastructure.", accent: "from-emerald-500 to-teal-500" },
  { icon: Brain, title: "AI Infrastructure", description: "Vector search, GPU compute, workflow orchestration — the picks and shovels of the AI revolution.", accent: "from-rose-500 to-pink-500" },
];

const processSteps = [
  { icon: SearchIcon, title: "Source", description: "We develop independent thesis on where markets are heading, then proactively seek founders building in those spaces — often before anyone else." },
  { icon: Handshake, title: "Partner", description: "We lead or co-lead rounds and take board seats. Our role goes beyond capital — recruiting, GTM strategy, and connecting founders to our 1,200+ operator network." },
  { icon: Rocket, title: "Build", description: "Hands-on support from our platform team in hiring, pricing, product strategy, and international expansion at every growth stage." },
  { icon: LineChart, title: "Scale", description: "Help with M&A strategy, follow-on fundraising, executive recruiting, and IPO readiness. We stay invested for 8+ years on average." },
];

const testimonials = [
  { quote: "Zinaplus didn't just write a check — they helped us recruit our first 10 engineers, refine our pricing model, and connected us with enterprise design partners who became our first $1M contracts. They're the most operationally helpful investors we've worked with.", name: "Karri Saarinen", title: "CEO & Co-Founder, Linear" },
  { quote: "What sets Zinaplus apart is their depth of technical understanding. They don't just evaluate markets — they understand the code, the architecture, and the engineering challenges. That made them invaluable partners as we scaled from 10 to 200 engineers.", name: "Nikita Shamgunov", title: "CEO & Co-Founder, Neon" },
];

const offices = [
  { city: "San Francisco", label: "HQ" },
  { city: "New York", label: "East Coast" },
  { city: "London", label: "Europe" },
];

const logoCompanies = [
  "Linear", "Neon", "Railway", "Resend", "Prisma", "Clerk",
  "Warp", "Replicate", "Tinybird", "Axiom", "LangChain", "Dub",
];

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      {/* Animated background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "radial-gradient(circle, #555 0.8px, transparent 0.8px)", backgroundSize: "24px 24px" }} />
        <div className="absolute -top-40 left-1/2 h-[600px] w-[900px] -translate-x-1/2 bg-purple-600/[0.07] blur-[150px]" />
        <div className="absolute right-0 top-60 h-[400px] w-[400px] bg-violet-600/[0.04] blur-[120px]" />
      </div>

      {/* Hero */}
      <section className="relative mx-auto max-w-6xl px-6 pb-24 pt-28 text-center md:pt-40">
        <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1 } } }} className="flex flex-col items-center">
          <motion.div variants={fadeUp} transition={{ duration: 0.5 }} className="mb-5 inline-flex items-center gap-2 border border-purple-500/20 bg-purple-500/[0.06] px-4 py-1.5 text-xs font-medium text-purple-400 backdrop-blur-sm">
            Early &amp; Growth Stage Venture Capital
          </motion.div>
          <motion.h1 variants={fadeUp} transition={{ duration: 0.5 }} className="max-w-4xl text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl md:text-7xl">
            We back the founders building{" "}
            <span className="text-purple-400">tomorrow&apos;s infrastructure</span>
          </motion.h1>
          <motion.p variants={fadeUp} transition={{ duration: 0.5 }} className="mt-6 max-w-2xl text-base leading-relaxed text-zinc-400 md:text-lg">
            Zinaplus Ventures is a multi-stage venture capital firm investing in developer tools, AI, cloud infrastructure, and category-defining software. We partner with technical founders from the earliest stages through IPO — deploying $2.4B across 120+ companies in 18 countries.
          </motion.p>
          <motion.div variants={fadeUp} transition={{ duration: 0.5 }} className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/thesis"
              className="inline-flex items-center justify-center gap-2 bg-purple-600 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-purple-700"
            >
              Our Thesis <ArrowRight size={15} />
            </Link>
            <Link
              href="/portfolio"
              className="inline-flex items-center justify-center gap-2 border border-white/[0.1] bg-white/[0.04] px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/[0.08]"
            >
              View Portfolio
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Portfolio Marquee */}
      <section className="relative py-10 overflow-hidden">
        <div className="mx-auto max-w-6xl px-6">
          <p className="mb-8 text-center text-[11px] font-semibold uppercase tracking-widest text-zinc-600">Trusted by category-defining companies</p>
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-40px" }}
            variants={{ show: { transition: { staggerChildren: 0.05 } } }}
            className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6"
          >
            {logoCompanies.map((name) => {
              const slug = logoMap[name];
              return (
                <motion.div
                  key={name}
                  variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
                  transition={{ duration: 0.4 }}
                  className="group relative flex items-center gap-2.5"
                >
                  {slug ? (
                    <Image
                      src={`/logos/${slug}.svg`}
                      alt={name}
                      width={20}
                      height={20}
                      className="opacity-30 transition-opacity duration-300 group-hover:opacity-70"
                    />
                  ) : null}
                  <span className="text-[13px] font-semibold text-zinc-600 transition-colors duration-300 group-hover:text-white">{name}</span>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-0 sm:grid-cols-3 lg:grid-cols-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="flex flex-col items-center gap-2 border-white/[0.04] px-4 py-10 [&:not(:last-child)]:border-r"
            >
              <stat.icon size={16} className="text-purple-400" />
              <p className="text-xl font-bold text-white">{stat.value}</p>
              <p className="text-center text-[10px] uppercase tracking-wider text-zinc-500">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Why Us */}
      <section className="relative mx-auto max-w-6xl px-6 py-28">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.5 }} className="mb-14 text-center">
          <span className="mb-3 inline-block bg-violet-500/[0.08] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-violet-400">Why Zinaplus</span>
          <h2 className="text-xl font-bold text-white md:text-3xl">More than capital</h2>
          <p className="mx-auto mt-3 max-w-lg text-[14px] text-zinc-500">
            We bring decades of operating experience, a global network of 1,200+ executives, and a dedicated platform team to every partnership.
          </p>
        </motion.div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((pillar, i) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="group border border-white/[0.06] bg-white/[0.02] p-6 transition-all hover:border-white/[0.1] hover:bg-white/[0.04]"
              >
                <div className="mb-4 inline-flex h-9 w-9 items-center justify-center bg-gradient-to-br from-purple-500 to-violet-600 text-white">
                  <Icon size={18} />
                </div>
                <h3 className="font-semibold text-white">{pillar.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-zinc-500">{pillar.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Focus Areas */}
      <section className="relative py-28">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.5 }} className="mb-14 text-center">
            <span className="mb-3 inline-block bg-purple-500/[0.08] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-purple-400">Focus Areas</span>
            <h2 className="text-xl font-bold text-white md:text-3xl">Where we invest</h2>
            <p className="mx-auto mt-3 max-w-lg text-[14px] text-zinc-500">
              Six sectors where we have deep conviction, operator experience, and a track record of category-defining investments.
            </p>
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
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="group border border-white/[0.06] bg-white/[0.02] p-6 transition-all hover:border-white/[0.1] hover:bg-white/[0.04]"
                >
                  <div className={`mb-4 inline-flex h-9 w-9 items-center justify-center bg-gradient-to-br ${area.accent} text-white`}>
                    <Icon size={18} />
                  </div>
                  <h3 className="font-semibold text-white">{area.title}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-zinc-500">{area.description}</p>
                </motion.div>
              );
            })}
          </div>
          <div className="mt-10 text-center">
            <Link href="/thesis" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-purple-400 transition-colors hover:text-purple-300">
              Read our full thesis <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </section>

      {/* How We Work */}
      <section className="relative py-28">
        <div className="mx-auto max-w-5xl px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.5 }} className="mb-14 text-center">
            <span className="mb-3 inline-block bg-emerald-500/[0.08] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">Process</span>
            <h2 className="text-xl font-bold text-white md:text-3xl">How we work with founders</h2>
            <p className="mx-auto mt-3 max-w-lg text-[14px] text-zinc-500">
              From first meeting to IPO — a partnership built on deep involvement at every stage.
            </p>
          </motion.div>
          <div className="grid gap-0 sm:grid-cols-2 lg:grid-cols-4">
            {processSteps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="relative p-6"
                >
                  <div className="mb-2 flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 text-xs font-bold text-white">
                      {i + 1}
                    </span>
                    <Icon size={16} className="text-zinc-500" />
                  </div>
                  <h3 className="font-semibold text-white">{step.title}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-zinc-500">{step.description}</p>
                  {i < processSteps.length - 1 && (
                    <div className="pointer-events-none absolute right-0 top-1/2 hidden h-12 w-px -translate-y-1/2 bg-gradient-to-b from-transparent via-white/[0.06] to-transparent lg:block" />
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Portfolio */}
      <section className="relative py-28">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.5 }} className="mb-14 flex items-end justify-between">
            <div>
              <span className="mb-3 inline-block bg-purple-500/[0.08] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-purple-400">Portfolio</span>
              <h2 className="text-xl font-bold text-white md:text-2xl">Featured Companies</h2>
              <p className="mt-2 text-[14px] text-zinc-500">
                A selection of the 120+ companies we&apos;re proud to partner with.
              </p>
            </div>
            <Link
              href="/portfolio"
              className="hidden items-center gap-1.5 text-[13px] font-medium text-purple-400 transition-colors hover:text-purple-300 sm:flex"
            >
              View all <ArrowRight size={13} />
            </Link>
          </motion.div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredCompanies.map((company, i) => {
              const slug = logoMap[company.name];
              return (
                <motion.div
                  key={company.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  className="group relative border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-300 hover:border-purple-500/20 hover:bg-white/[0.04] hover:shadow-[0_0_40px_-12px_rgba(168,85,247,0.08)]"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center bg-white/[0.04] transition-colors group-hover:bg-white/[0.08]">
                      {slug ? (
                        <Image src={`/logos/${slug}.svg`} alt={company.name} width={22} height={22} className="opacity-80 transition-opacity group-hover:opacity-100" />
                      ) : (
                        <span className="text-[11px] font-bold text-zinc-400">{company.name[0]}</span>
                      )}
                    </div>
                    <span className="border border-purple-500/20 bg-purple-500/[0.06] px-2 py-0.5 text-[10px] font-medium text-purple-400">
                      {company.stage}
                    </span>
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-white">{company.name}</h3>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">{company.sector}</p>
                  <p className="mt-3 text-[13px] leading-relaxed text-zinc-500">{company.description}</p>
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-purple-500/0 to-transparent transition-all duration-500 group-hover:via-purple-500/40" />
                </motion.div>
              );
            })}
          </div>
          <div className="mt-8 text-center sm:hidden">
            <Link href="/portfolio" className="text-[13px] font-medium text-purple-400 hover:text-purple-300">
              View all portfolio &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80&auto=format&fit=crop"
            alt=""
            fill
            className="object-cover opacity-[0.07]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#09090b] via-transparent to-[#09090b]" />
        </div>
        <div className="relative mx-auto max-w-5xl px-6 py-28">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mb-12 text-center">
            <span className="mb-3 inline-block bg-amber-500/[0.08] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-400">From our founders</span>
          </motion.div>
          <div className="grid gap-8 md:grid-cols-2">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="border border-white/[0.06] bg-white/[0.02] p-8"
              >
                <blockquote className="text-[14px] font-medium leading-relaxed text-zinc-300">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <div className="mt-5">
                  <p className="text-[14px] font-semibold text-white">{t.name}</p>
                  <p className="text-[12px] text-zinc-500">{t.title}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Global Presence */}
      <section className="relative py-28">
        <div className="mx-auto max-w-5xl px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.5 }} className="mb-14 text-center">
            <span className="mb-3 inline-block bg-cyan-500/[0.08] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-cyan-400">Global</span>
            <h2 className="text-xl font-bold text-white md:text-3xl">Investing across borders</h2>
            <p className="mx-auto mt-3 max-w-lg text-[14px] text-zinc-500">
              Three offices, 18 countries, and a network that spans every major tech ecosystem.
            </p>
          </motion.div>
          <div className="flex flex-wrap items-center justify-center gap-6">
            {offices.map((office, i) => (
              <motion.div
                key={office.city}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="flex items-center gap-3 border border-white/[0.06] bg-white/[0.02] px-6 py-4"
              >
                <MapPin size={16} className="text-cyan-400" />
                <div>
                  <p className="text-sm font-semibold text-white">{office.city}</p>
                  <p className="text-[11px] text-zinc-500">{office.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="relative mt-12 h-48 w-full overflow-hidden md:h-64"
          >
            <Image
              src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1400&q=80&auto=format&fit=crop"
              alt="Global network"
              fill
              className="object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-[#09090b]" />
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/5 to-purple-600/5" />
          </motion.div>
        </div>
      </section>

      {/* Fund Performance */}
      <section className="relative py-28">
        <div className="mx-auto max-w-4xl px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.5 }} className="mb-14 text-center">
            <span className="mb-3 inline-block bg-amber-500/[0.08] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-400">Track Record</span>
            <h2 className="text-xl font-bold text-white md:text-3xl">Consistent top-quartile returns</h2>
            <p className="mx-auto mt-3 max-w-lg text-[14px] text-zinc-500">
              Across 4 funds and 12 years, our disciplined approach has delivered outsized outcomes for founders and LPs alike.
            </p>
          </motion.div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { value: "$2.4B", label: "AUM" },
              { value: "3.8x", label: "Avg Fund MOIC" },
              { value: "45%", label: "Net IRR" },
              { value: "$20B+", label: "Combined Exits" },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="flex flex-col items-center gap-2 border border-white/[0.06] bg-white/[0.02] px-4 py-8"
              >
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-center text-[10px] uppercase tracking-wider text-zinc-500">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1534972195531-d756b9bfa9f2?w=1920&q=80&auto=format&fit=crop"
            alt=""
            fill
            className="object-cover opacity-[0.06]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/80 to-[#09090b]" />
        </div>
        <div className="relative mx-auto max-w-4xl px-6 py-28 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
              Building the next category-defining company?
            </h2>
            <p className="mt-4 max-w-lg mx-auto text-[14px] text-zinc-500">
              We review every pitch that comes through. Our partners respond within 48 hours for companies within our thesis. No warm intro needed.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 bg-purple-600 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-purple-700"
              >
                Submit Your Deck <ArrowRight size={15} />
              </Link>
              <Link
                href="/thesis"
                className="inline-flex items-center justify-center gap-2 border border-white/[0.1] bg-white/[0.04] px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/[0.08]"
              >
                Read Our Thesis
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
