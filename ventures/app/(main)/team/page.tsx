"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Users, ArrowRight, Briefcase, GraduationCap, Globe } from "lucide-react";
import Link from "next/link";

const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } };

type TeamMember = {
  name: string;
  role: string;
  bio: string;
  background: string;
  boardSeats?: string[];
};

const partners: TeamMember[] = [
  {
    name: "Sarah Chen",
    role: "Managing Partner",
    bio: "Former CTO at Salesforce, where she led the engineering organization through the $27B acquisition of Slack. 18 years of operating experience building enterprise software platforms at scale. Sarah has personally invested in 40+ companies including Vercel, Datadog, Linear, and Supabase.",
    background: "Stanford CS • ex-Salesforce CTO • ex-Google",
    boardSeats: ["Vercel", "Linear", "Supabase", "Clerk"],
  },
  {
    name: "David Amara",
    role: "General Partner",
    bio: "Serial entrepreneur who co-founded and sold two fintech companies — one to Stripe ($180M) and one to Visa ($420M). Deep expertise in payments infrastructure, financial data, and embedded finance. David led our investments in Stripe and Plaid.",
    background: "Wharton MBA • 2x Founder • ex-JP Morgan",
    boardSeats: ["Stripe", "Plaid", "Resend"],
  },
  {
    name: "Priya Nair",
    role: "General Partner",
    bio: "PhD in Computer Science from MIT, specializing in distributed systems. Former VP of Engineering at Cloudflare, where she led the Workers edge compute platform from inception to 3M+ developers. Priya leads our cloud infrastructure and database investments.",
    background: "MIT PhD • ex-Cloudflare VP Eng • ex-AWS",
    boardSeats: ["Neon", "Turso", "Upstash", "Tinybird"],
  },
  {
    name: "Marcus Lee",
    role: "Partner",
    bio: "Former VP of Product at GitHub during the Microsoft acquisition era, then founding Head of Product at Figma's platform division. Marcus brings deep product intuition and developer ecosystem expertise. He leads our developer tools and AI investments.",
    background: "Carnegie Mellon • ex-GitHub • ex-Figma",
    boardSeats: ["Prisma", "Railway", "Warp", "Trigger.dev"],
  },
  {
    name: "Amelia Torres",
    role: "General Partner",
    bio: "Former Chief Scientist at DeepMind, where she led research on large language model alignment and safety. Transitioned to venture in 2020 to back the next wave of AI companies. Led our investments in OpenAI and Anthropic at their earliest stages.",
    background: "Oxford DPhil • ex-DeepMind • ex-Meta AI",
    boardSeats: ["OpenAI", "Anthropic", "Replicate", "Hugging Face"],
  },
];

const team: TeamMember[] = [
  { name: "Elena Rodriguez", role: "Principal", bio: "Covers AI infrastructure and developer tools. Previously a principal at Andreessen Horowitz covering enterprise software. Before that, she was a senior engineer at Datadog building their APM product line.", background: "Berkeley EECS • ex-a16z • ex-Datadog" },
  { name: "James Okafor", role: "Principal", bio: "Focuses on cloud infrastructure and database technologies. Former staff engineer at AWS leading DynamoDB's global tables feature. Has deep technical knowledge that helps founders solve their hardest architecture decisions.", background: "Georgia Tech CS • ex-AWS • ex-MongoDB" },
  { name: "Anika Patel", role: "Vice President", bio: "Generalist covering fintech and data infrastructure. Previously at Tiger Global where she sourced and executed 15+ growth-stage investments. Brings a strong quantitative lens to market sizing and competitive analysis.", background: "Harvard MBA • ex-Tiger Global • ex-Goldman", },
  { name: "Tom Reeves", role: "Head of Platform", bio: "Leads talent acquisition, go-to-market coaching, CFO services, and operational support across all 120+ portfolio companies. Previously ran business operations at Notion through their Series C. Manages our network of 1,200+ executive advisors.", background: "ex-Notion • ex-McKinsey" },
  { name: "Maya Kim", role: "Associate", bio: "Covers developer tools and open-source software. Former software engineer at Vercel working on Next.js core. Brings a practitioner's perspective to evaluating developer experience and technical moats.", background: "MIT CS • ex-Vercel" },
  { name: "Ricardo Santos", role: "Associate", bio: "Focuses on AI applications and vertical SaaS. Previously a founding engineer at a YC-backed AI startup that reached $10M ARR in 18 months. Strong technical evaluation skills across ML/AI stack.", background: "Stanford AI Lab • YC alum" },
  { name: "Sophie Laurent", role: "Head of Marketing & Communications", bio: "Leads brand, content, events, and LP communications. Previously VP of Marketing at Linear, where she built their iconic developer brand. Before that, led developer marketing at Stripe.", background: "ex-Linear • ex-Stripe" },
  { name: "Daniel Park", role: "CFO & Head of Fund Operations", bio: "Oversees fund accounting, legal, compliance, and LP reporting across all four funds. 15 years of experience in venture fund administration. Previously at SVB Capital and Sequoia Capital's finance team.", background: "CPA • ex-SVB Capital • ex-Sequoia" },
];

const advisors = [
  { name: "Guillermo Rauch", title: "CEO, Vercel" },
  { name: "Patrick Collison", title: "CEO, Stripe" },
  { name: "Dario Amodei", title: "CEO, Anthropic" },
  { name: "Dylan Field", title: "CEO, Figma" },
  { name: "Karri Saarinen", title: "CEO, Linear" },
  { name: "Paul Copplestone", title: "CEO, Supabase" },
];

function PersonCard({ person, index, large }: { person: TeamMember; index: number; large?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="group border border-white/[0.06] bg-white/[0.02] p-6 transition-all hover:border-white/[0.1] hover:bg-white/[0.04]"
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center bg-gradient-to-br from-purple-500 to-violet-600 text-sm font-bold text-white">
        {person.name.split(" ").map((n) => n[0]).join("")}
      </div>
      <h3 className="font-semibold text-white">{person.name}</h3>
      <p className="text-[12px] font-medium text-purple-400">{person.role}</p>
      <p className="mt-1 text-[11px] text-zinc-600">{person.background}</p>
      <p className="mt-3 text-[13px] leading-relaxed text-zinc-500">{person.bio}</p>
      {person.boardSeats && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {person.boardSeats.map((seat) => (
            <span key={seat} className="border border-white/[0.06] bg-white/[0.02] px-2 py-0.5 text-[10px] font-medium text-zinc-500">
              {seat}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}

export default function TeamPage() {
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
            <Users size={12} /> Team
          </motion.div>
          <motion.h1 variants={fadeUp} transition={{ duration: 0.5 }} className="max-w-2xl text-3xl font-extrabold tracking-tight text-white md:text-5xl">
            The people behind{" "}
            <span className="text-purple-400">Zinaplus</span>
          </motion.h1>
          <motion.p variants={fadeUp} transition={{ duration: 0.5 }} className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-400 md:text-lg">
            Former CTOs, founding engineers, repeat founders, and research scientists — united by a shared mission to back the most ambitious technical founders in the world. Our team has collectively built companies worth $100B+.
          </motion.p>
        </motion.div>
      </section>

      {/* Team Hero Image */}
      <section className="relative">
        <div className="relative mx-auto max-w-6xl overflow-hidden px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative h-64 w-full overflow-hidden md:h-80"
          >
            <Image
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1400&q=80&auto=format&fit=crop"
              alt="Team collaboration"
              fill
              className="object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/40 to-[#09090b]/80" />
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-violet-600/5" />
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-center text-sm font-medium text-zinc-400 md:text-base">Operators building for operators</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Key stats */}
      <section className="relative">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-0 sm:grid-cols-4">
          {[
            { icon: Briefcase, value: "80+", label: "Years Combined Experience" },
            { icon: GraduationCap, value: "5", label: "PhDs on the Team" },
            { icon: Users, value: "1,200+", label: "Executive Network" },
            { icon: Globe, value: "18", label: "Countries Covered" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="flex flex-col items-center gap-2 border-white/[0.06] px-4 py-8 [&:not(:last-child)]:border-r"
            >
              <stat.icon size={16} className="text-purple-400" />
              <p className="text-xl font-bold text-white">{stat.value}</p>
              <p className="text-center text-[10px] uppercase tracking-wider text-zinc-500">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Partners */}
      <section className="relative mx-auto w-full max-w-6xl px-6 py-28">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.5 }} className="mb-10">
          <span className="mb-3 inline-block bg-purple-500/[0.08] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-purple-400">Leadership</span>
          <h2 className="text-xl font-bold text-white md:text-2xl">Partners</h2>
          <p className="mt-2 text-[14px] text-zinc-500">The investment decision-makers and board members driving our portfolio strategy.</p>
        </motion.div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {partners.map((person, i) => (
            <PersonCard key={person.name} person={person} index={i} large />
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="relative py-28">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.5 }} className="mb-10">
            <span className="mb-3 inline-block bg-violet-500/[0.08] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-violet-400">Team</span>
            <h2 className="text-xl font-bold text-white md:text-2xl">Investment &amp; Platform Team</h2>
            <p className="mt-2 text-[14px] text-zinc-500">The team working alongside our partners to source, evaluate, and support portfolio companies.</p>
          </motion.div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((person, i) => (
              <PersonCard key={person.name} person={person} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Advisory Board */}
      <section className="relative py-28">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.5 }} className="mb-10 text-center">
            <span className="mb-3 inline-block bg-amber-500/[0.08] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-400">Advisors</span>
            <h2 className="text-xl font-bold text-white md:text-2xl">Founder Advisory Board</h2>
            <p className="mx-auto mt-2 max-w-lg text-[14px] text-zinc-500">Portfolio founders who actively advise our team and mentor the next generation of companies.</p>
          </motion.div>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {advisors.map((advisor, i) => (
              <motion.div
                key={advisor.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="border border-white/[0.06] bg-white/[0.02] p-4 text-center transition-all hover:border-white/[0.1]"
              >
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center bg-gradient-to-br from-amber-500 to-orange-600 text-xs font-bold text-white">
                  {advisor.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <p className="text-[13px] font-semibold text-white">{advisor.name}</p>
                <p className="text-[11px] text-zinc-500">{advisor.title}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Join Us CTA */}
      <section className="relative">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&q=80&auto=format&fit=crop"
            alt=""
            fill
            className="object-cover opacity-[0.06]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/80 to-[#09090b]" />
        </div>
        <div className="relative mx-auto max-w-4xl px-6 py-28 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
              Join the Zinaplus team
            </h2>
            <p className="mt-4 mx-auto max-w-lg text-[14px] text-zinc-500">
              We&apos;re always looking for exceptional people who are passionate about technology and want to work at the intersection of investing and building. No open roles required — reach out anytime.
            </p>
            <Link
              href="/contact"
              className="mt-8 inline-flex items-center justify-center gap-2 bg-purple-600 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-purple-700"
            >
              Get in Touch <ArrowRight size={15} />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
