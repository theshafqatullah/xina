"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, TrendingUp, Building2, DollarSign, Calendar, Globe, Users, Target, Zap, Shield, Lightbulb } from "lucide-react";

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
  "Vercel": "vercel", "Supabase": "supabase", "Linear": "linear", "Prisma": "prisma",
  "Railway": "railway", "Resend": "resend", "Neon": "neon", "Clerk": "clerk", "OpenAI": "openai",
  "Anthropic": "anthropic", "Figma": "figma", "Stripe": "stripe", "Datadog": "datadog",
  "Cloudflare": "cloudflare", "Notion": "notion", "Loom": "loom", "Replicate": "replicate",
  "Axiom": "axiom", "Trigger.dev": "triggerdotdev", "Inngest": "inngest",
  "Tinybird": "tinybird", "Dub": "dub", "Plaid": "plaid", "Segment": "segment",
};

const featuredCompanies = [
  { name: "Vercel", sector: "Developer Tools", description: "The frontend cloud platform powering the best web experiences. Creators of Next.js.", stage: "Series D" },
  { name: "Stripe", sector: "Fintech", description: "Financial infrastructure for the internet. Payments, billing, and financial operations at scale.", stage: "Growth" },
  { name: "Figma", sector: "Design Tools", description: "Collaborative interface design platform used by millions of product teams worldwide.", stage: "Growth" },
  { name: "Datadog", sector: "Infrastructure", description: "Cloud-scale monitoring and observability platform for modern engineering organizations.", stage: "Growth" },
  { name: "OpenAI", sector: "Artificial Intelligence", description: "Pioneering safe and beneficial artificial general intelligence for all of humanity.", stage: "Growth" },
  { name: "Anthropic", sector: "AI Safety", description: "Building reliable, interpretable, and steerable AI systems. Creators of Claude.", stage: "Series C" },
];

const pillars = [
  { icon: Target, title: "Conviction-Led", desc: "We invest behind deep thesis work — not trends. Every deal starts with a contrarian belief about where the market is going." },
  { icon: Zap, title: "Operator DNA", desc: "Our partners have built and scaled companies to billions in revenue. We bring operational muscle, not just capital." },
  { icon: Shield, title: "Long-Term Partners", desc: "We don't flip positions. Average hold period is 8+ years. We ride the entire value-creation curve alongside founders." },
  { icon: Lightbulb, title: "Full-Stack Support", desc: "Dedicated platform team for recruiting, GTM, finance, and international expansion across all portfolio companies." },
];

const logoCompanies = [
  "Vercel", "Stripe", "Figma", "Linear", "Supabase", "OpenAI",
  "Railway", "Resend", "Prisma", "Anthropic", "Cloudflare", "Notion",
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
            Xina Ventures is a multi-stage venture capital firm investing in developer tools, AI, cloud infrastructure, and category-defining software. We partner with technical founders from the earliest stages through IPO — deploying $2.4B across 120+ companies in 18 countries.
          </motion.p>
          <motion.div variants={fadeUp} transition={{ duration: 0.5 }} className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/thesis"
              className="inline-flex items-center justify-center gap-2 bg-purple-600 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-purple-700"
            >
              Our Thesis
              <ArrowRight size={15} />
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
      <section className="relative border-y border-white/[0.06] py-10 overflow-hidden">
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
      <section className="relative border-b border-white/[0.06]">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-0 sm:grid-cols-3 lg:grid-cols-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="flex flex-col items-center gap-2 border-white/[0.06] px-4 py-10 [&:not(:last-child)]:border-r"
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
          <span className="mb-3 inline-block bg-violet-500/[0.08] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-violet-400">Why Xina</span>
          <h2 className="text-xl font-bold text-white md:text-3xl">
            More than capital
          </h2>
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

      {/* Featured Portfolio */}
      <section className="relative border-t border-white/[0.06] py-28">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.5 }} className="mb-14 flex items-end justify-between">
            <div>
              <span className="mb-3 inline-block bg-purple-500/[0.08] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-purple-400">Portfolio</span>
              <h2 className="text-xl font-bold text-white md:text-2xl">
                Featured Companies
              </h2>
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

      {/* Testimonial */}
      <section className="relative border-t border-white/[0.06]">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/4 top-0 h-[300px] w-[400px] bg-purple-600/[0.04] blur-[120px]" />
        </div>
        <div className="relative mx-auto max-w-3xl px-6 py-28 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <span className="mb-6 inline-block bg-amber-500/[0.08] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-400">From our founders</span>
            <blockquote className="text-lg font-medium leading-relaxed text-zinc-300 md:text-xl">
              &ldquo;Xina didn&apos;t just write a check — they helped us recruit our first 10 engineers, refine our pricing model, and connected us with enterprise design partners who became our first $1M contracts. They&apos;re the most operationally helpful investors we&apos;ve worked with.&rdquo;
            </blockquote>
            <div className="mt-6">
              <p className="text-[14px] font-semibold text-white">Guillermo Rauch</p>
              <p className="text-[12px] text-zinc-500">CEO &amp; Founder, Vercel</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative border-t border-white/[0.06]">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute bottom-0 left-1/2 h-[300px] w-[600px] -translate-x-1/2 bg-purple-600/[0.06] blur-[120px]" />
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
