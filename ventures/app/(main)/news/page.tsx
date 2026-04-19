"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Newspaper } from "lucide-react";

const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } };

type Post = {
  title: string;
  date: string;
  category: string;
  excerpt: string;
  slug: string;
  featured?: boolean;
  image?: string;
};

const posts: Post[] = [
  {
    title: "Zinaplus Ventures Closes Fund IV at $850M to Back Developer Tools and AI Infrastructure",
    date: "April 2, 2026",
    category: "Announcement",
    excerpt: "We're excited to announce the close of our fourth and largest fund, bringing total AUM to $2.4B. Fund IV will double down on our core thesis — developer tools, AI infrastructure, cloud databases, and fintech — with check sizes from $5M to $100M. With this fund, we're expanding our growth-stage capabilities to support portfolio companies through IPO.",
    slug: "fund-iv-close",
    featured: true,
    image: "https://images.unsplash.com/photo-1639322537228-f710d846310a?w=1200&q=80&auto=format&fit=crop",
  },
  {
    title: "Why We Led Neon's Series B: The Future of Serverless Postgres",
    date: "March 15, 2026",
    category: "Investment",
    excerpt: "Neon is redefining what a database can be — serverless scaling, instant branching, and bottomless storage built on top of Postgres. We led their $46M Series B because we believe every application in the next decade will run on serverless databases, and Neon is the clear category leader.",
    slug: "neon-series-b",
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&q=80&auto=format&fit=crop",
  },
  {
    title: "The AI Infrastructure Stack in 2026: Where We're Investing",
    date: "February 28, 2026",
    category: "Insights",
    excerpt: "After investing in OpenAI, Anthropic, Hugging Face, Replicate, and LangChain, we've developed a comprehensive view of the AI infrastructure stack. In this memo, we break down the seven layers of AI infra — from training compute to application frameworks — and identify where the next $100B companies will emerge.",
    slug: "ai-infrastructure-2026",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&q=80&auto=format&fit=crop",
  },
  {
    title: "Trigger.dev Joins the Portfolio: Redefining Background Jobs for TypeScript",
    date: "February 10, 2026",
    category: "Investment",
    excerpt: "We're thrilled to lead Trigger.dev's Series A. The team is building the open-source background jobs framework that TypeScript developers have been waiting for — long-running tasks, scheduled jobs, and event-driven workflows with full observability. Already adopted by thousands of developers.",
    slug: "trigger-dev-series-a",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&q=80&auto=format&fit=crop",
  },
  {
    title: "Inside Our Portfolio: How Vercel Scaled to 1M+ Developers",
    date: "January 20, 2026",
    category: "Insights",
    excerpt: "We've been investors in Vercel since Series A. In this deep dive, we share the lessons from watching Guillermo Rauch and the team build the frontend cloud from an open-source project to a platform powering some of the largest websites in the world — and what other developer tools founders can learn from their journey.",
    slug: "vercel-growth-story",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80&auto=format&fit=crop",
  },
  {
    title: "Announcing Our Investment in Convex: The Fullstack TypeScript Platform",
    date: "December 15, 2025",
    category: "Investment",
    excerpt: "Convex represents a new paradigm in application development — a reactive database, server functions, and file storage unified in one TypeScript-first platform. We led their Series A because we believe the complexity tax of modern web development is unsustainable, and Convex is the answer.",
    slug: "convex-series-a",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&q=80&auto=format&fit=crop",
  },
  {
    title: "Developer Tools in 2025: Lessons from 120+ Investments",
    date: "November 15, 2025",
    category: "Insights",
    excerpt: "After 12 years and 120+ investments, we share the patterns that separate breakout developer tools companies from the rest. Key takeaways: developer experience is the ultimate moat, open-source is table stakes, and the best companies grow bottom-up before layering enterprise sales.",
    slug: "devtools-lessons-2025",
    image: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=600&q=80&auto=format&fit=crop",
  },
  {
    title: "GitHub Acquired by Microsoft for $7.5B — Our First Billion-Dollar Exit",
    date: "October 20, 2025",
    category: "Exit",
    excerpt: "We invested in GitHub at Series A, and today we celebrate their acquisition by Microsoft in what became a defining moment for developer tooling. GitHub proved that developer platforms can build lasting, category-defining businesses. The 85x return exemplifies our patient, conviction-led approach.",
    slug: "github-acquisition",
    image: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=600&q=80&auto=format&fit=crop",
  },
  {
    title: "How Supabase Became the Open-Source Alternative to Firebase",
    date: "September 28, 2025",
    category: "Insights",
    excerpt: "Paul Copplestone and Ant Wilson built Supabase with a radical bet: that an open-source, Postgres-based platform could challenge Google's Firebase. Three years later, with 700K+ databases deployed and a thriving community, the bet is paying off. Here's the inside story of our investment.",
    slug: "supabase-story",
    image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&q=80&auto=format&fit=crop",
  },
  {
    title: "Segment Acquired by Twilio for $3.2B — A Masterclass in Data Infrastructure",
    date: "August 5, 2025",
    category: "Exit",
    excerpt: "Portfolio company Segment's acquisition by Twilio for $3.2B marks one of the largest infrastructure acquisitions in recent years. From our seed investment through IPO-trajectory growth, Peter Reinhardt and the team built the definitive customer data platform. A 42x return for our LPs.",
    slug: "segment-twilio",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80&auto=format&fit=crop",
  },
];

const categoryStyle: Record<string, string> = {
  Announcement: "border-blue-500/20 bg-blue-500/[0.06] text-blue-400",
  Investment: "border-emerald-500/20 bg-emerald-500/[0.06] text-emerald-400",
  Insights: "border-amber-500/20 bg-amber-500/[0.06] text-amber-400",
  Exit: "border-purple-500/20 bg-purple-500/[0.06] text-purple-400",
};

export default function NewsPage() {
  const featured = posts.find((p) => p.featured);
  const rest = posts.filter((p) => !p.featured);

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
            <Newspaper size={12} /> News
          </motion.div>
          <motion.h1 variants={fadeUp} transition={{ duration: 0.5 }} className="max-w-2xl text-3xl font-extrabold tracking-tight text-white md:text-5xl">
            News &amp; <span className="text-purple-400">Insights</span>
          </motion.h1>
          <motion.p variants={fadeUp} transition={{ duration: 0.5 }} className="mt-4 max-w-xl text-base leading-relaxed text-zinc-400 md:text-lg">
            Fund announcements, investment memos, portfolio deep dives, and perspectives from the Zinaplus team on developer tools, AI, and the future of software infrastructure.
          </motion.p>
        </motion.div>
      </section>

      {/* Featured Post */}
      {featured && (
        <section className="relative mx-auto w-full max-w-3xl px-6 pb-16">
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="group overflow-hidden border border-purple-500/20 bg-purple-500/[0.03]"
          >
            <div className="relative h-56 w-full overflow-hidden md:h-64">
              <Image
                src="https://images.unsplash.com/photo-1639322537228-f710d846310a?w=1200&q=80&auto=format&fit=crop"
                alt="Fund IV announcement"
                fill
                className="object-cover opacity-40 transition-opacity duration-500 group-hover:opacity-50"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/60 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-transparent" />
            </div>
            <div className="p-8">
              <div className="flex items-center gap-3">
                <span className="border border-purple-500/30 bg-purple-500/[0.1] px-2 py-0.5 text-[10px] font-semibold text-purple-400">Featured</span>
                <span className={`border px-2 py-0.5 text-[10px] font-medium ${categoryStyle[featured.category] ?? "border-zinc-500/20 bg-zinc-500/[0.06] text-zinc-400"}`}>
                  {featured.category}
                </span>
                <time className="text-[12px] text-zinc-600">{featured.date}</time>
              </div>
              <h2 className="mt-4 text-xl font-bold text-white transition-colors group-hover:text-purple-400 md:text-2xl">
                <Link href={`/news/${featured.slug}`}>{featured.title}</Link>
              </h2>
              <p className="mt-3 text-[14px] leading-relaxed text-zinc-400">
                {featured.excerpt}
              </p>
            </div>
          </motion.article>
        </section>
      )}

      {/* Posts */}
      <section className="relative mx-auto w-full max-w-3xl px-6 pb-28">
        <div className="space-y-0">
          {rest.map((post, i) => (
            <motion.article
              key={post.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.04 }}
              className="group border-b border-white/[0.06] py-8 first:pt-0 last:border-0"
            >
              <div className="flex gap-5">
                {post.image && (
                  <div className="relative hidden h-24 w-36 shrink-0 overflow-hidden sm:block">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover opacity-50 transition-opacity duration-300 group-hover:opacity-70"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#09090b]/40" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className={`border px-2 py-0.5 text-[10px] font-medium ${categoryStyle[post.category] ?? "border-zinc-500/20 bg-zinc-500/[0.06] text-zinc-400"}`}>
                      {post.category}
                    </span>
                    <time className="text-[12px] text-zinc-600">{post.date}</time>
                  </div>
                  <h2 className="mt-3 text-lg font-semibold text-white transition-colors group-hover:text-purple-400">
                    <Link href={`/news/${post.slug}`}>{post.title}</Link>
                  </h2>
                  <p className="mt-2 text-[14px] leading-relaxed text-zinc-500">
                    {post.excerpt}
                  </p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </section>
    </div>
  );
}
