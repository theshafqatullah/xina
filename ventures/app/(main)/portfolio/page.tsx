"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, ArrowUpRight, Filter, ExternalLink } from "lucide-react";

const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } };

type Company = {
  name: string;
  sector: string;
  stage: string;
  description: string;
  status: "active" | "exited";
  url?: string;
  logo?: string;
};

// Maps company names to logo filenames in /logos/
const logoMap: Record<string, string> = {
  "Vercel": "vercel", "Supabase": "supabase", "Linear": "linear", "Prisma": "prisma",
  "Railway": "railway", "Resend": "resend", "Neon": "neon", "Turso": "turso", "Clerk": "clerk",
  "Convex": "convex", "Axiom": "axiom", "Trigger.dev": "triggerdotdev", "Inngest": "inngest",
  "Tinybird": "tinybird", "Upstash": "upstash", "Warp": "warp", "Dub": "dub", "Cal.com": "caldotcom",
  "OpenAI": "openai", "Anthropic": "anthropic", "Replicate": "replicate",
  "Hugging Face": "huggingface", "LangChain": "langchain", "Datadog": "datadog",
  "Cloudflare": "cloudflare", "HashiCorp": "hashicorp", "Figma": "figma",
  "Notion": "notion", "Loom": "loom", "Stripe": "stripe", "Plaid": "plaid",
  "PlanetScale": "planetscale", "Segment": "segment",
  "GitHub": "github", "Heroku": "heroku", "Mulesoft": "mulesoft", "SendGrid": "sendgrid",
};

function CompanyLogo({ name, size = 24 }: { name: string; size?: number }) {
  const slug = logoMap[name];
  if (slug) {
    return (
      <Image
        src={`/logos/${slug}.svg`}
        alt={name}
        width={size}
        height={size}
        className="opacity-80 transition-opacity group-hover:opacity-100"
      />
    );
  }
  return (
    <span
      className="flex items-center justify-center bg-white/[0.06] text-[11px] font-bold text-zinc-400"
      style={{ width: size, height: size }}
    >
      {name[0]}
    </span>
  );
}

const companies: Company[] = [
  { name: "Vercel", sector: "Developer Tools", stage: "Series D", description: "The frontend cloud platform powering the best web experiences. Creators of Next.js, used by Fortune 500 companies and indie developers alike.", status: "active", url: "https://vercel.com" },
  { name: "Supabase", sector: "Developer Tools", stage: "Series C", description: "Open-source Firebase alternative providing instant Postgres databases, auth, edge functions, realtime subscriptions, and storage.", status: "active", url: "https://supabase.com" },
  { name: "Linear", sector: "Developer Tools", stage: "Series B", description: "The issue tracking tool built for speed. Streamlines software project management for high-performance engineering teams.", status: "active", url: "https://linear.app" },
  { name: "Prisma", sector: "Developer Tools", stage: "Series B", description: "Next-generation Node.js and TypeScript ORM transforming how developers interact with databases through a type-safe query builder.", status: "active", url: "https://prisma.io" },
  { name: "Railway", sector: "Developer Tools", stage: "Series A", description: "Infrastructure platform that provisions instant, production-ready environments. Deploy from GitHub in seconds, scale without limits.", status: "active", url: "https://railway.app" },
  { name: "Resend", sector: "Developer Tools", stage: "Series A", description: "Modern email API for developers. Beautiful transactional emails with a developer-first experience and React Email components.", status: "active", url: "https://resend.com" },
  { name: "Neon", sector: "Database Infrastructure", stage: "Series B", description: "Serverless Postgres with branching, autoscaling, and bottomless storage. The database for modern cloud-native applications.", status: "active", url: "https://neon.tech" },
  { name: "Turso", sector: "Database Infrastructure", stage: "Series A", description: "Edge-hosted distributed database built on libSQL. Sub-millisecond reads globally with embedded replicas for lightning-fast apps.", status: "active", url: "https://turso.tech" },
  { name: "Clerk", sector: "Developer Tools", stage: "Series B", description: "Complete user management and authentication platform. Drop-in auth components, session management, and multi-factor authentication.", status: "active", url: "https://clerk.com" },
  { name: "Convex", sector: "Developer Tools", stage: "Series A", description: "The fullstack TypeScript development platform. Reactive database, server functions, and file storage with zero infrastructure management.", status: "active", url: "https://convex.dev" },
  { name: "Axiom", sector: "Observability", stage: "Series A", description: "Cloud-native monitoring and observability platform. Ingest, store, and query unlimited data with zero configuration and instant insights.", status: "active", url: "https://axiom.co" },
  { name: "Trigger.dev", sector: "Developer Tools", stage: "Series A", description: "Open-source background jobs framework for TypeScript. Long-running tasks, scheduled jobs, and event-driven workflows with full observability.", status: "active", url: "https://trigger.dev" },
  { name: "Inngest", sector: "Developer Tools", stage: "Series A", description: "Durable workflow engine for modern applications. Reliable background functions, event-driven architecture, and step functions at any scale.", status: "active", url: "https://inngest.com" },
  { name: "Tinybird", sector: "Data Infrastructure", stage: "Series B", description: "Real-time data analytics API platform. Ingest millions of events, publish blazing-fast SQL-based API endpoints in minutes.", status: "active", url: "https://tinybird.co" },
  { name: "Upstash", sector: "Database Infrastructure", stage: "Series A", description: "Serverless data platform for Redis, Kafka, and QStash. Per-request pricing with global low-latency access for edge computing.", status: "active", url: "https://upstash.com" },
  { name: "Warp", sector: "Developer Tools", stage: "Series B", description: "The modern terminal reimagined with AI, collaborative features, and a GPU-accelerated rendering engine for developer productivity.", status: "active", url: "https://warp.dev" },
  { name: "Dub", sector: "Developer Tools", stage: "Series A", description: "Open-source link management infrastructure. Short links, QR codes, and analytics built for modern marketing and developer teams.", status: "active", url: "https://dub.co" },
  { name: "Cal.com", sector: "Developer Tools", stage: "Series A", description: "Open-source scheduling infrastructure for everyone. Self-hostable alternative for appointment booking with powerful API integrations.", status: "active", url: "https://cal.com" },
  { name: "OpenAI", sector: "Artificial Intelligence", stage: "Growth", description: "Pioneering safe and beneficial artificial general intelligence. Creators of GPT-4, DALL·E, and the ChatGPT platform serving hundreds of millions.", status: "active", url: "https://openai.com" },
  { name: "Anthropic", sector: "AI Safety", stage: "Series C", description: "Building reliable, interpretable, and steerable AI systems. Creators of Claude — designed to be helpful, harmless, and honest.", status: "active", url: "https://anthropic.com" },
  { name: "Replicate", sector: "AI Infrastructure", stage: "Series B", description: "Run and fine-tune open-source machine learning models with a cloud API. Deploy custom models at scale without managing infrastructure.", status: "active", url: "https://replicate.com" },
  { name: "Hugging Face", sector: "AI Infrastructure", stage: "Series D", description: "The AI community building the future. Home to 500K+ models, 100K+ datasets, and the most widely-used open-source ML libraries.", status: "active", url: "https://huggingface.co" },
  { name: "LangChain", sector: "AI Infrastructure", stage: "Series A", description: "Framework for developing applications powered by language models. Composable tooling for chains, agents, and retrieval-augmented generation.", status: "active", url: "https://langchain.com" },
  { name: "Datadog", sector: "Observability", stage: "Growth", description: "Cloud-scale monitoring, security, and observability platform unifying metrics, traces, and logs for 26,000+ enterprise customers worldwide.", status: "active", url: "https://datadoghq.com" },
  { name: "Cloudflare", sector: "Cloud Infrastructure", stage: "Growth", description: "Global cloud network powering 20% of the internet. Web security, performance, reliability, and the Workers edge compute platform.", status: "active", url: "https://cloudflare.com" },
  { name: "HashiCorp", sector: "Cloud Infrastructure", stage: "Growth", description: "Cloud infrastructure automation suite — Terraform, Vault, Consul, and Nomad. The standard for infrastructure as code across every major cloud.", status: "active", url: "https://hashicorp.com" },
  { name: "Figma", sector: "Design Tools", stage: "Growth", description: "Collaborative interface design platform used by millions of product teams. Real-time multiplayer editing, prototyping, and design systems at scale.", status: "active", url: "https://figma.com" },
  { name: "Notion", sector: "Productivity", stage: "Growth", description: "All-in-one workspace for notes, docs, wikis, and project management. Connected productivity platform used by 100M+ people worldwide.", status: "active", url: "https://notion.so" },
  { name: "Loom", sector: "Productivity", stage: "Series C", description: "Async video messaging platform for the workplace. Record, share, and collaborate with video to communicate 2x faster than meetings.", status: "active", url: "https://loom.com" },
  { name: "Stripe", sector: "Fintech", stage: "Growth", description: "Financial infrastructure for the internet. Payments, billing, invoicing, tax, and treasury — powering millions of businesses in 46+ countries.", status: "active", url: "https://stripe.com" },
  { name: "Plaid", sector: "Fintech", stage: "Series D", description: "The universal financial data connectivity platform. Powers 8,000+ fintech apps and connects to 12,000+ financial institutions globally.", status: "active", url: "https://plaid.com" },
  { name: "PlanetScale", sector: "Database Infrastructure", stage: "Series C", description: "Serverless MySQL platform with branching, deploy requests, and unlimited scale. Acquired after reaching 100K+ databases deployed.", status: "exited", url: "https://planetscale.com" },
  { name: "Segment", sector: "Data Infrastructure", stage: "Growth", description: "Customer data platform connecting 400+ marketing and analytics tools. Acquired by Twilio for $3.2B.", status: "exited" },
  { name: "GitHub", sector: "Developer Tools", stage: "Growth", description: "The world's largest source code host and developer community with 100M+ developers. Acquired by Microsoft for $7.5B.", status: "exited" },
  { name: "Heroku", sector: "Developer Tools", stage: "Growth", description: "Pioneer of PaaS cloud computing. Enabled millions of developers to deploy apps instantly. Acquired by Salesforce for $212M.", status: "exited" },
  { name: "Mulesoft", sector: "Developer Tools", stage: "Growth", description: "Enterprise integration platform connecting applications, data, and devices. Acquired by Salesforce for $6.5B.", status: "exited" },
  { name: "SendGrid", sector: "Developer Tools", stage: "Growth", description: "Cloud-based email delivery platform processing 100B+ emails annually. Acquired by Twilio for $3B.", status: "exited" },
];

const allSectors = Array.from(new Set(companies.map((c) => c.sector))).sort();

export default function PortfolioPage() {
  const [filter, setFilter] = useState<string>("All");
  const active = companies.filter((c) => c.status === "active" && (filter === "All" || c.sector === filter));
  const exited = companies.filter((c) => c.status === "exited");

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
            <Briefcase size={12} /> Portfolio
          </motion.div>
          <motion.h1 variants={fadeUp} transition={{ duration: 0.5 }} className="max-w-2xl text-3xl font-extrabold tracking-tight text-white md:text-5xl">
            Powering the world&apos;s best{" "}
            <span className="text-purple-400">tools companies</span>
          </motion.h1>
          <motion.p variants={fadeUp} transition={{ duration: 0.5 }} className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-400 md:text-lg">
            We&apos;ve partnered with {companies.length}+ category-defining companies across developer tools, AI, cloud infrastructure, and fintech — from seed stage to IPO.
          </motion.p>
        </motion.div>
      </section>

      {/* Logo Wall */}
      <section className="relative border-y border-white/[0.06] py-12">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            variants={{ show: { transition: { staggerChildren: 0.03 } } }}
            className="flex flex-wrap items-center justify-center gap-8 md:gap-10"
          >
            {Object.entries(logoMap).filter(([name]) => companies.some((c) => c.name === name && c.status === "active")).slice(0, 16).map(([name, slug]) => (
              <motion.div
                key={name}
                variants={{ hidden: { opacity: 0, scale: 0.8 }, show: { opacity: 1, scale: 1 } }}
                transition={{ duration: 0.4 }}
                className="group relative flex items-center justify-center"
              >
                <Image
                  src={`/logos/${slug}.svg`}
                  alt={name}
                  width={28}
                  height={28}
                  className="opacity-30 transition-all duration-300 group-hover:opacity-80"
                />
                <span className="pointer-events-none absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] text-zinc-600 opacity-0 transition-opacity group-hover:opacity-100">
                  {name}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Sector Filter */}
      <section className="relative mx-auto max-w-6xl px-6 pb-8 pt-16">
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          <Filter size={14} className="shrink-0 text-zinc-600" />
          <button
            onClick={() => setFilter("All")}
            className={`shrink-0 border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-all ${
              filter === "All"
                ? "border-purple-500/30 bg-purple-500/[0.08] text-purple-400"
                : "border-white/[0.06] text-zinc-500 hover:border-white/[0.12] hover:text-zinc-300"
            }`}
          >
            All ({companies.filter((c) => c.status === "active").length})
          </button>
          {allSectors.map((sector) => {
            const count = companies.filter((c) => c.sector === sector && c.status === "active").length;
            if (count === 0) return null;
            return (
              <button
                key={sector}
                onClick={() => setFilter(sector)}
                className={`shrink-0 border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-all ${
                  filter === sector
                    ? "border-purple-500/30 bg-purple-500/[0.08] text-purple-400"
                    : "border-white/[0.06] text-zinc-500 hover:border-white/[0.12] hover:text-zinc-300"
                }`}
              >
                {sector} ({count})
              </button>
            );
          })}
        </div>
      </section>

      {/* Active */}
      <section className="relative mx-auto w-full max-w-6xl px-6 pb-28">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.5 }} className="mb-10">
          <span className="mb-3 inline-block bg-emerald-500/[0.08] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">Active</span>
          <h2 className="text-xl font-bold text-white md:text-2xl">Active Investments</h2>
          <p className="mt-2 text-[14px] text-zinc-500">Companies we&apos;re actively supporting as board members, advisors, and partners.</p>
        </motion.div>
        <AnimatePresence mode="wait">
          <motion.div
            key={filter}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {active.map((company, i) => {
              const CardWrapper = company.url ? "a" : "div";
              const linkProps = company.url ? { href: company.url, target: "_blank", rel: "noopener noreferrer" } : {};
              return (
                <motion.div
                  key={company.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.35, delay: Math.min(i * 0.04, 0.4) }}
                >
                  <CardWrapper
                    {...linkProps}
                    className="group relative flex h-full flex-col border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-300 hover:border-purple-500/20 hover:bg-white/[0.04] hover:shadow-[0_0_40px_-12px_rgba(168,85,247,0.08)]"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex h-10 w-10 items-center justify-center bg-white/[0.04] transition-colors group-hover:bg-white/[0.08]">
                        <CompanyLogo name={company.name} size={22} />
                      </div>
                      <span className="border border-emerald-500/20 bg-emerald-500/[0.06] px-2 py-0.5 text-[10px] font-medium text-emerald-400">{company.stage}</span>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <h3 className="text-base font-semibold text-white">{company.name}</h3>
                      {company.url && (
                        <ExternalLink size={12} className="text-zinc-600 transition-all group-hover:text-purple-400" />
                      )}
                    </div>
                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">{company.sector}</p>
                    <p className="mt-3 flex-1 text-[13px] leading-relaxed text-zinc-500">{company.description}</p>
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-purple-500/0 to-transparent transition-all duration-500 group-hover:via-purple-500/40" />
                  </CardWrapper>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
        {active.length === 0 && (
          <p className="py-12 text-center text-[14px] text-zinc-600">No active companies in this sector.</p>
        )}
      </section>

      {/* Exited */}
      <section className="relative border-t border-white/[0.06] py-28">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.5 }} className="mb-10">
            <span className="mb-3 inline-block bg-amber-500/[0.08] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-400">Exits</span>
            <h2 className="text-xl font-bold text-white md:text-2xl">Notable Exits</h2>
            <p className="mt-2 text-[14px] text-zinc-500">Companies that reached successful outcomes through IPO or acquisition — generating $20B+ in combined exit value for our LPs.</p>
          </motion.div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {exited.map((company, i) => (
              <motion.div
                key={company.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="group border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-300 hover:border-white/[0.1] hover:bg-white/[0.04]"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center bg-white/[0.04]">
                    <CompanyLogo name={company.name} size={22} />
                  </div>
                  <span className="border border-amber-500/20 bg-amber-500/[0.06] px-2 py-0.5 text-[10px] font-medium text-amber-400">Exited</span>
                </div>
                <h3 className="mt-4 text-base font-semibold text-white">{company.name}</h3>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">{company.sector}</p>
                <p className="mt-3 text-[13px] leading-relaxed text-zinc-500">{company.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Stats */}
      <section className="relative border-t border-white/[0.06]">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-0 sm:grid-cols-4">
          {[
            { value: "$20B+", label: "Combined Exit Value" },
            { value: "3.8x", label: "Average Fund MOIC" },
            { value: "45%", label: "Top Quartile IRR" },
            { value: "8+", label: "Avg. Hold Years" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="flex flex-col items-center gap-2 border-white/[0.06] px-4 py-10 [&:not(:last-child)]:border-r"
            >
              <p className="text-xl font-bold text-white">{stat.value}</p>
              <p className="text-center text-[10px] uppercase tracking-wider text-zinc-500">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
