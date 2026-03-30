"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpRight,
  Briefcase,
  ExternalLink,
  Grid3X3,
  LayoutList,
  Search,
  TrendingUp,
  X,
} from "lucide-react";

/* ── Types ── */
type Company = {
  name: string;
  sector: string;
  stage: string;
  description: string;
  oneLiner: string;
  status: "active" | "exited";
  url?: string;
  exitValue?: string;
  exitTo?: string;
};

/* ── Logo map ── */
const logoMap: Record<string, string> = {
  Linear: "linear", Prisma: "prisma", Railway: "railway", Resend: "resend",
  Neon: "neon", Turso: "turso", Clerk: "clerk", Convex: "convex",
  Axiom: "axiom", "Trigger.dev": "triggerdotdev", Inngest: "inngest",
  Tinybird: "tinybird", Upstash: "upstash", Warp: "warp", Dub: "dub",
  "Cal.com": "caldotcom", Replicate: "replicate", LangChain: "langchain",
  PlanetScale: "planetscale",
};

/* ── Featured company names (shown in hero grid) ── */
const FEATURED = ["Linear", "Neon", "Railway", "Replicate", "Warp", "Tinybird", "Clerk", "LangChain"];

/* ── Logo component ── */
function CompanyLogo({ name, size = 24, className = "" }: { name: string; size?: number; className?: string }) {
  const slug = logoMap[name];
  if (slug) {
    return (
      <Image
        src={`/logos/${slug}.svg`}
        alt={name}
        width={size}
        height={size}
        className={`transition-opacity ${className}`}
      />
    );
  }
  return (
    <span
      className={`flex items-center justify-center bg-white/[0.06] text-xs font-bold text-zinc-400 ${className}`}
      style={{ width: size, height: size }}
    >
      {name[0]}
    </span>
  );
}

/* ── Data ── */
const companies: Company[] = [
  { name: "Linear", sector: "Developer Tools", stage: "Series B", oneLiner: "Issue tracking built for speed", description: "The issue tracking tool built for speed. Streamlines software project management for high-performance engineering teams.", status: "active", url: "https://linear.app" },
  { name: "Prisma", sector: "Developer Tools", stage: "Series B", oneLiner: "Next-gen TypeScript ORM", description: "Next-generation Node.js and TypeScript ORM transforming how developers interact with databases through a type-safe query builder.", status: "active", url: "https://prisma.io" },
  { name: "Railway", sector: "Developer Tools", stage: "Series A", oneLiner: "Deploy from GitHub in seconds", description: "Infrastructure platform that provisions instant, production-ready environments. Deploy from GitHub in seconds, scale without limits.", status: "active", url: "https://railway.app" },
  { name: "Resend", sector: "Developer Tools", stage: "Series A", oneLiner: "Modern email API for developers", description: "Modern email API for developers. Beautiful transactional emails with a developer-first experience and React Email components.", status: "active", url: "https://resend.com" },
  { name: "Neon", sector: "Database Infrastructure", stage: "Series B", oneLiner: "Serverless Postgres with branching", description: "Serverless Postgres with branching, autoscaling, and bottomless storage. The database for modern cloud-native applications.", status: "active", url: "https://neon.tech" },
  { name: "Turso", sector: "Database Infrastructure", stage: "Series A", oneLiner: "Edge-hosted distributed database", description: "Edge-hosted distributed database built on libSQL. Sub-millisecond reads globally with embedded replicas for lightning-fast apps.", status: "active", url: "https://turso.tech" },
  { name: "Clerk", sector: "Developer Tools", stage: "Series B", oneLiner: "Drop-in authentication components", description: "Complete user management and authentication platform. Drop-in auth components, session management, and multi-factor authentication.", status: "active", url: "https://clerk.com" },
  { name: "Convex", sector: "Developer Tools", stage: "Series A", oneLiner: "Fullstack TypeScript platform", description: "The fullstack TypeScript development platform. Reactive database, server functions, and file storage with zero infrastructure management.", status: "active", url: "https://convex.dev" },
  { name: "Axiom", sector: "Observability", stage: "Series A", oneLiner: "Cloud-native monitoring & observability", description: "Cloud-native monitoring and observability platform. Ingest, store, and query unlimited data with zero configuration and instant insights.", status: "active", url: "https://axiom.co" },
  { name: "Trigger.dev", sector: "Developer Tools", stage: "Series A", oneLiner: "Background jobs for TypeScript", description: "Open-source background jobs framework for TypeScript. Long-running tasks, scheduled jobs, and event-driven workflows with full observability.", status: "active", url: "https://trigger.dev" },
  { name: "Inngest", sector: "Developer Tools", stage: "Series A", oneLiner: "Durable workflow engine", description: "Durable workflow engine for modern applications. Reliable background functions, event-driven architecture, and step functions at any scale.", status: "active", url: "https://inngest.com" },
  { name: "Tinybird", sector: "Data Infrastructure", stage: "Series B", oneLiner: "Real-time analytics API platform", description: "Real-time data analytics API platform. Ingest millions of events, publish blazing-fast SQL-based API endpoints in minutes.", status: "active", url: "https://tinybird.co" },
  { name: "Upstash", sector: "Database Infrastructure", stage: "Series A", oneLiner: "Serverless Redis, Kafka & QStash", description: "Serverless data platform for Redis, Kafka, and QStash. Per-request pricing with global low-latency access for edge computing.", status: "active", url: "https://upstash.com" },
  { name: "Warp", sector: "Developer Tools", stage: "Series B", oneLiner: "The AI-powered terminal", description: "The modern terminal reimagined with AI, collaborative features, and a GPU-accelerated rendering engine for developer productivity.", status: "active", url: "https://warp.dev" },
  { name: "Dub", sector: "Developer Tools", stage: "Series A", oneLiner: "Open-source link management", description: "Open-source link management infrastructure. Short links, QR codes, and analytics built for modern marketing and developer teams.", status: "active", url: "https://dub.co" },
  { name: "Cal.com", sector: "Developer Tools", stage: "Series A", oneLiner: "Open-source scheduling infrastructure", description: "Open-source scheduling infrastructure for everyone. Self-hostable alternative for appointment booking with powerful API integrations.", status: "active", url: "https://cal.com" },
  { name: "Replicate", sector: "AI Infrastructure", stage: "Series B", oneLiner: "Run ML models via cloud API", description: "Run and fine-tune open-source machine learning models with a cloud API. Deploy custom models at scale without managing infrastructure.", status: "active", url: "https://replicate.com" },
  { name: "LangChain", sector: "AI Infrastructure", stage: "Series A", oneLiner: "LLM application framework", description: "Framework for developing applications powered by language models. Composable tooling for chains, agents, and retrieval-augmented generation.", status: "active", url: "https://langchain.com" },
  { name: "Mintlify", sector: "Developer Tools", stage: "Series A", oneLiner: "Beautiful documentation for developers", description: "AI-powered documentation platform that turns code into beautiful docs. Auto-generated API references, versioning, and analytics for developer-first companies.", status: "active", url: "https://mintlify.com" },
  { name: "Zed", sector: "Developer Tools", stage: "Series A", oneLiner: "High-performance multiplayer code editor", description: "High-performance, multiplayer code editor built from scratch in Rust. GPU-accelerated rendering with real-time collaboration and AI assistance.", status: "active", url: "https://zed.dev" },
  { name: "Fly.io", sector: "Cloud Infrastructure", stage: "Series C", oneLiner: "Run apps close to your users", description: "Full-stack application hosting platform that runs apps on bare-metal servers in 30+ regions worldwide. Edge-native with built-in Postgres.", status: "active", url: "https://fly.io" },
  { name: "Modal", sector: "AI Infrastructure", stage: "Series A", oneLiner: "Serverless GPU compute for AI", description: "Serverless cloud for AI and data workloads. Run inference, fine-tuning, and batch processing on GPUs with zero infrastructure management.", status: "active", url: "https://modal.com" },
  { name: "Together AI", sector: "AI Infrastructure", stage: "Series A", oneLiner: "Open-source AI model platform", description: "Cloud platform for building and running generative AI. Fine-tune and deploy open-source models with enterprise-grade infrastructure.", status: "active", url: "https://together.ai" },
  { name: "Qdrant", sector: "AI Infrastructure", stage: "Series A", oneLiner: "High-performance vector search engine", description: "Open-source vector similarity search engine built in Rust. Designed for production-grade neural search, recommendation, and RAG applications.", status: "active", url: "https://qdrant.tech" },
  { name: "MotherDuck", sector: "Data Infrastructure", stage: "Series A", oneLiner: "Serverless analytics with DuckDB", description: "Serverless analytical database built on DuckDB. Hybrid query execution across local and cloud with zero data movement.", status: "active", url: "https://motherduck.com" },
  { name: "Raycast", sector: "Productivity", stage: "Series A", oneLiner: "Blazing-fast launcher for developers", description: "Productivity launcher for macOS with built-in extensions, AI commands, and window management. The command center for developer workflows.", status: "active", url: "https://raycast.com" },
  { name: "Framer", sector: "Design Tools", stage: "Series B", oneLiner: "No-code website builder for designers", description: "Design and publish production websites without code. AI-powered site generation, animations, and CMS with design-first principles.", status: "active", url: "https://framer.com" },
  { name: "Pulumi", sector: "Cloud Infrastructure", stage: "Series C", oneLiner: "Infrastructure as code in any language", description: "Modern infrastructure as code using TypeScript, Python, Go, and more. Multi-cloud provisioning with real programming languages instead of DSLs.", status: "active", url: "https://pulumi.com" },
  { name: "Depot", sector: "Developer Tools", stage: "Seed", oneLiner: "Faster container builds in the cloud", description: "Remote container build service that makes Docker builds 20x faster. Managed BuildKit runners with intelligent layer caching.", status: "active", url: "https://depot.dev" },
  { name: "Mercury", sector: "Fintech", stage: "Series B", oneLiner: "Banking built for startups", description: "Digital banking platform purpose-built for startups and scaling companies. Treasury management, corporate cards, and integrated financial workflows.", status: "active", url: "https://mercury.com" },
  { name: "SST", sector: "Developer Tools", stage: "Seed", oneLiner: "Build full-stack apps on your infra", description: "Open-source framework for building full-stack applications on your own AWS infrastructure. Live Lambda development with zero-config deployments.", status: "active", url: "https://sst.dev" },
  { name: "Encore", sector: "Developer Tools", stage: "Seed", oneLiner: "Backend development platform", description: "Open-source backend development platform with built-in infrastructure automation. Type-safe APIs, automatic cloud provisioning, and distributed tracing.", status: "active", url: "https://encore.dev" },
  { name: "PlanetScale", sector: "Database Infrastructure", stage: "Series C", oneLiner: "Serverless MySQL at scale", description: "Serverless MySQL platform with branching, deploy requests, and unlimited scale. Acquired after reaching 100K+ databases deployed.", status: "exited", url: "https://planetscale.com", exitTo: "Acquired" },
  { name: "Buildkite", sector: "Developer Tools", stage: "Series B", oneLiner: "CI/CD for engineering teams", description: "Scalable CI/CD platform that runs builds on your own infrastructure. Acquired by a strategic buyer for its hybrid pipeline architecture.", status: "exited", exitValue: "$200M", exitTo: "Acquired" },
  { name: "Render", sector: "Cloud Infrastructure", stage: "Series B", oneLiner: "Modern cloud hosting platform", description: "Unified cloud platform for hosting static sites, web services, databases, and cron jobs. Acquired for its developer-friendly deployment model.", status: "exited", exitValue: "$350M", exitTo: "Acquired" },
  { name: "Netlify", sector: "Developer Tools", stage: "Series D", oneLiner: "Composable web platform", description: "The platform for modern web development. Jamstack hosting, serverless functions, and edge compute for frontend teams. Acquired in a landmark deal.", status: "exited", exitValue: "$500M", exitTo: "Acquired" },
];

const ALL_SECTORS = Array.from(new Set(companies.map((c) => c.sector))).sort();
const ALL_STAGES = ["Series A", "Series B", "Series C", "Series D", "Growth"];

/* ── Page ── */
export default function PortfolioPage() {
  const [search, setSearch] = useState("");
  const [sectorFilter, setSectorFilter] = useState("All");
  const [stageFilter, setStageFilter] = useState("All");
  const [view, setView] = useState<"grid" | "list">("grid");

  const hasFilters = search || sectorFilter !== "All" || stageFilter !== "All";

  const active = useMemo(() => {
    const q = search.toLowerCase();
    return companies.filter((c) => {
      if (c.status !== "active") return false;
      if (sectorFilter !== "All" && c.sector !== sectorFilter) return false;
      if (stageFilter !== "All" && c.stage !== stageFilter) return false;
      if (q && !c.name.toLowerCase().includes(q) && !c.sector.toLowerCase().includes(q) && !c.oneLiner.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [search, sectorFilter, stageFilter]);

  const exited = companies.filter((c) => c.status === "exited");
  const totalActive = companies.filter((c) => c.status === "active").length;
  const featured = companies.filter((c) => FEATURED.includes(c.name));

  const clearFilters = () => {
    setSearch("");
    setSectorFilter("All");
    setStageFilter("All");
  };

  return (
    <div className="relative overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "radial-gradient(circle, #555 0.8px, transparent 0.8px)", backgroundSize: "24px 24px" }} />
        <div className="absolute -top-40 left-1/2 h-[700px] w-[1100px] -translate-x-1/2 bg-purple-600/[0.06] blur-[180px]" />
      </div>

      {/* ━━ Hero ━━ */}
      <section className="relative mx-auto max-w-5xl px-6 pb-20 pt-28 md:pt-36">
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.09 } } }}
          className="flex flex-col items-center text-center"
        >
          <motion.div
            variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 border border-purple-500/20 bg-purple-500/[0.06] px-4 py-1.5 text-xs font-medium text-purple-400 backdrop-blur-sm"
          >
            <Briefcase size={12} /> Portfolio
          </motion.div>
          <motion.h1
            variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl text-4xl font-extrabold tracking-tight text-white md:text-6xl"
          >
            We partner with{" "}
            <span className="bg-gradient-to-r from-purple-400 to-purple-300 bg-clip-text text-transparent">
              category-defining
            </span>{" "}
            companies
          </motion.h1>
          <motion.p
            variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.5 }}
            className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-400 md:text-lg"
          >
            {totalActive} active investments and {exited.length} successful exits across developer tools, AI infrastructure, cloud, and fintech — from first check to IPO.
          </motion.p>

          {/* Quick stats row */}
          <motion.div
            variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.5 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-8 md:gap-12"
          >
            {[
              { value: `${totalActive}+`, label: "Active Companies" },
              { value: "$20B+", label: "Combined Exits" },
              { value: "3.8x", label: "Avg Fund MOIC" },
              { value: "12", label: "Years Investing" },
            ].map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-1">
                <span className="text-xl font-bold text-white md:text-2xl">{s.value}</span>
                <span className="text-[10px] uppercase tracking-wider text-zinc-500">{s.label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ━━ Featured Companies — Prominent Logo Grid (Accel style) ━━ */}
      <section className="relative bg-white/[0.01]">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-10 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-600"
          >
            Featured Investments
          </motion.p>
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-40px" }}
            variants={{ show: { transition: { staggerChildren: 0.05 } } }}
            className="grid grid-cols-2 gap-px border border-white/[0.06] bg-white/[0.04] sm:grid-cols-4"
          >
            {featured.map((company) => (
              <motion.a
                key={company.name}
                href={company.url}
                target="_blank"
                rel="noopener noreferrer"
                variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
                transition={{ duration: 0.4 }}
                className="group relative flex flex-col items-center justify-center gap-3 bg-[#09090b] px-6 py-10 transition-all duration-300 hover:bg-white/[0.03]"
              >
                <div className="flex h-12 w-12 items-center justify-center">
                  <CompanyLogo name={company.name} size={36} className="opacity-50 group-hover:opacity-100" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-zinc-300 transition-colors group-hover:text-white">{company.name}</p>
                  <p className="mt-0.5 text-[11px] text-zinc-600 transition-colors group-hover:text-zinc-400">{company.oneLiner}</p>
                </div>
                <ArrowUpRight
                  size={14}
                  className="absolute right-3 top-3 text-zinc-700 opacity-0 transition-all group-hover:text-purple-400 group-hover:opacity-100"
                />
              </motion.a>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ━━ Full Logo Wall — All Active Companies (Sequoia style) ━━ */}
      <section className="relative py-16">
        <div className="mx-auto max-w-6xl px-6">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-8 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-600"
          >
            All Portfolio Companies
          </motion.p>
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-40px" }}
            variants={{ show: { transition: { staggerChildren: 0.02 } } }}
            className="flex flex-wrap items-center justify-center gap-10 md:gap-12"
          >
            {Object.entries(logoMap)
              .filter(([name]) => companies.some((c) => c.name === name && c.status === "active"))
              .map(([name, slug]) => (
                <motion.div
                  key={name}
                  variants={{ hidden: { opacity: 0, scale: 0.85 }, show: { opacity: 1, scale: 1 } }}
                  transition={{ duration: 0.35 }}
                  className="group relative flex items-center justify-center"
                >
                  <Image
                    src={`/logos/${slug}.svg`}
                    alt={name}
                    width={32}
                    height={32}
                    className="opacity-25 transition-all duration-300 group-hover:opacity-90"
                  />
                  <span className="pointer-events-none absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] text-zinc-600 opacity-0 transition-opacity group-hover:opacity-100">
                    {name}
                  </span>
                </motion.div>
              ))}
          </motion.div>
        </div>
      </section>

      {/* ━━ Search + Filter Bar ━━ */}
      <section className="sticky top-16 z-30 bg-[#09090b]/90 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-6 py-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search companies..."
                className="w-full border border-white/[0.06] bg-white/[0.03] py-2.5 pl-9 pr-9 text-sm text-white placeholder-zinc-600 outline-none transition-colors focus:border-purple-500/30 focus:bg-white/[0.04]"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Filters + View Toggle */}
            <div className="flex items-center gap-3">
              {/* Sector */}
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
                {["All", ...ALL_SECTORS].map((sector) => {
                  const count = sector === "All" ? totalActive : companies.filter((c) => c.sector === sector && c.status === "active").length;
                  if (count === 0 && sector !== "All") return null;
                  return (
                    <button
                      key={sector}
                      onClick={() => setSectorFilter(sector)}
                      className={`shrink-0 border px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition-all ${
                        sectorFilter === sector
                          ? "border-purple-500/30 bg-purple-500/[0.08] text-purple-400"
                          : "border-white/[0.06] text-zinc-500 hover:border-white/[0.12] hover:text-zinc-300"
                      }`}
                    >
                      {sector === "All" ? "All" : sector.replace(" Infrastructure", "").replace("Artificial ", "")}
                    </button>
                  );
                })}
              </div>

              {/* Stage dropdown */}
              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                className="border border-white/[0.06] bg-white/[0.03] px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 outline-none transition-colors hover:border-white/[0.12] focus:border-purple-500/30"
              >
                <option value="All">All Stages</option>
                {ALL_STAGES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              {/* View toggle */}
              <div className="hidden items-center gap-0 border border-white/[0.06] md:flex">
                <button
                  onClick={() => setView("grid")}
                  className={`p-2 transition-colors ${view === "grid" ? "bg-white/[0.06] text-white" : "text-zinc-600 hover:text-zinc-300"}`}
                >
                  <Grid3X3 size={14} />
                </button>
                <button
                  onClick={() => setView("list")}
                  className={`p-2 transition-colors ${view === "list" ? "bg-white/[0.06] text-white" : "text-zinc-600 hover:text-zinc-300"}`}
                >
                  <LayoutList size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Active filter badges */}
          {hasFilters && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-[11px] text-zinc-600">Showing {active.length} of {totalActive}</span>
              <button onClick={clearFilters} className="ml-1 text-[11px] text-purple-400 underline-offset-2 hover:underline">
                Clear all
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ━━ Active Investments ━━ */}
      <section className="relative mx-auto w-full max-w-6xl px-6 pb-28 pt-12">
        <AnimatePresence mode="wait">
          {view === "grid" ? (
            /* ─ Grid View ─ */
            <motion.div
              key={`grid-${sectorFilter}-${stageFilter}-${search}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="grid gap-px border border-white/[0.06] bg-white/[0.04] sm:grid-cols-2 lg:grid-cols-3"
            >
              {active.map((company, i) => (
                <motion.div
                  key={company.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: Math.min(i * 0.03, 0.4) }}
                >
                  {company.url ? (
                    <a
                      href={company.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative flex h-full flex-col bg-[#09090b] p-7 transition-all duration-300 hover:bg-white/[0.03]"
                    >
                      <CompanyCardContent company={company} />
                    </a>
                  ) : (
                    <div className="group relative flex h-full flex-col bg-[#09090b] p-7 transition-all duration-300 hover:bg-white/[0.03]">
                      <CompanyCardContent company={company} />
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          ) : (
            /* ─ List View ─ */
            <motion.div
              key={`list-${sectorFilter}-${stageFilter}-${search}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="border border-white/[0.06] divide-y divide-white/[0.06]"
            >
              {/* List header */}
              <div className="grid grid-cols-[1fr_140px_120px_32px] items-center gap-4 bg-white/[0.02] px-6 py-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
                <span>Company</span>
                <span>Sector</span>
                <span>Stage</span>
                <span />
              </div>
              {active.map((company, i) => (
                <motion.div
                  key={company.name}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25, delay: Math.min(i * 0.02, 0.3) }}
                >
                  {company.url ? (
                    <a
                      href={company.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group grid grid-cols-[1fr_140px_120px_32px] items-center gap-4 px-6 py-4 transition-colors hover:bg-white/[0.03]"
                    >
                      <ListRowContent company={company} />
                    </a>
                  ) : (
                    <div className="group grid grid-cols-[1fr_140px_120px_32px] items-center gap-4 px-6 py-4 transition-colors hover:bg-white/[0.03]">
                      <ListRowContent company={company} />
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {active.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-20 text-center">
            <Search size={32} className="text-zinc-700" />
            <p className="text-[14px] text-zinc-500">No companies match your filters.</p>
            <button onClick={clearFilters} className="text-sm text-purple-400 hover:underline">Clear filters</button>
          </div>
        )}
      </section>

      {/* ━━ Notable Exits ━━ */}
      <section className="relative bg-white/[0.01] py-24">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="mb-12 text-center"
          >
            <span className="mb-3 inline-block border border-amber-500/20 bg-amber-500/[0.06] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-400">
              Exits
            </span>
            <h2 className="mt-3 text-2xl font-bold text-white md:text-3xl">Notable Exits</h2>
            <p className="mx-auto mt-3 max-w-lg text-[14px] text-zinc-500">
              Companies that achieved transformative outcomes — generating $20B+ in combined exit value.
            </p>
          </motion.div>

          <div className="grid gap-px border border-white/[0.06] bg-white/[0.04] sm:grid-cols-2 lg:grid-cols-3">
            {exited.map((company, i) => (
              <motion.div
                key={company.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
                className="group flex flex-col bg-[#09090b] p-7 transition-all duration-300 hover:bg-white/[0.03]"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center bg-white/[0.04] transition-colors group-hover:bg-white/[0.08]">
                    <CompanyLogo name={company.name} size={24} className="opacity-60 group-hover:opacity-100" />
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="border border-amber-500/20 bg-amber-500/[0.06] px-2 py-0.5 text-[10px] font-medium text-amber-400">
                      Exited
                    </span>
                    {company.exitValue && (
                      <span className="text-[11px] font-semibold text-amber-400/70">{company.exitValue}</span>
                    )}
                  </div>
                </div>
                <h3 className="mt-5 text-base font-semibold text-white">{company.name}</h3>
                {company.exitTo && (
                  <p className="mt-0.5 text-[11px] font-medium text-zinc-500">
                    → {company.exitTo}
                  </p>
                )}
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">{company.sector}</p>
                <p className="mt-3 flex-1 text-[13px] leading-relaxed text-zinc-500">{company.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━ Bottom Stats ━━ */}
      <section className="relative">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-0 sm:grid-cols-4">
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
              className="flex flex-col items-center gap-2 border-white/[0.06] px-4 py-12 [&:not(:last-child)]:border-r"
            >
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-center text-[10px] uppercase tracking-wider text-zinc-500">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ━━ CTA ━━ */}
      <section className="relative py-20">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80&auto=format&fit=crop"
            alt=""
            fill
            className="object-cover opacity-[0.06]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/80 to-[#09090b]" />
        </div>
        <div className="relative mx-auto max-w-2xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold text-white md:text-3xl">Build with us</h2>
            <p className="mt-3 text-[14px] text-zinc-500">
              We invest $250K to $100M+ from pre-seed to growth. Reach out to see if we&apos;re the right fit.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 bg-purple-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-purple-500"
              >
                Submit Your Deck <ArrowUpRight size={14} />
              </Link>
              <Link
                href="/thesis"
                className="inline-flex items-center gap-2 border border-white/[0.1] px-6 py-3 text-sm font-medium text-zinc-300 transition-colors hover:border-white/[0.2] hover:text-white"
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

/* ── Grid Card Content ── */
function CompanyCardContent({ company }: { company: Company }) {
  return (
    <>
      <div className="flex items-start justify-between">
        <div className="flex h-11 w-11 items-center justify-center bg-white/[0.04] transition-colors group-hover:bg-white/[0.08]">
          <CompanyLogo name={company.name} size={24} className="opacity-70 group-hover:opacity-100" />
        </div>
        <span className="border border-white/[0.06] bg-white/[0.03] px-2 py-0.5 text-[10px] font-medium text-zinc-500 transition-colors group-hover:text-zinc-300">
          {company.stage}
        </span>
      </div>
      <div className="mt-5 flex items-center gap-2">
        <h3 className="text-[15px] font-semibold text-white">{company.name}</h3>
        {company.url && (
          <ExternalLink size={11} className="text-zinc-700 transition-all group-hover:text-purple-400" />
        )}
      </div>
      <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">{company.sector}</p>
      <p className="mt-3 flex-1 text-[13px] leading-relaxed text-zinc-500 group-hover:text-zinc-400">{company.oneLiner}</p>
      {/* Bottom accent line */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-purple-500/0 to-transparent transition-all duration-500 group-hover:via-purple-500/40" />
    </>
  );
}

/* ── List Row Content ── */
function ListRowContent({ company }: { company: Company }) {
  return (
    <>
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-white/[0.04] transition-colors group-hover:bg-white/[0.08]">
          <CompanyLogo name={company.name} size={18} className="opacity-70 group-hover:opacity-100" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{company.name}</p>
          <p className="text-[11px] text-zinc-600 group-hover:text-zinc-400">{company.oneLiner}</p>
        </div>
      </div>
      <span className="text-[11px] text-zinc-500">{company.sector}</span>
      <span className="border border-white/[0.06] bg-white/[0.03] px-2 py-0.5 text-center text-[10px] font-medium text-zinc-500">
        {company.stage}
      </span>
      <ExternalLink size={12} className="text-zinc-700 transition-colors group-hover:text-purple-400" />
    </>
  );
}
