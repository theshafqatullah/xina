"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Mail, MapPin, Clock, ArrowRight, MessageCircle, Shield, Briefcase, Users, Newspaper } from "lucide-react";
import Link from "next/link";

const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } };

const contacts = [
  { icon: Briefcase, title: "Founders & Pitch Decks", description: "Building something bold in developer tools, AI, cloud infrastructure, or fintech? We review every pitch deck we receive — no warm intro required. Include a brief description of your company, team background, and current traction. If your pitch is within our thesis, a partner will follow up directly.", email: "founders@xinaventures.com" },
  { icon: Users, title: "Limited Partners", description: "Interested in learning more about our funds, track record, and performance? Our Fund IV ($850M) closed in Q1 2026. We welcome institutional investors, family offices, and endowments to our LP base. Reach out for our latest fund materials and performance data.", email: "ir@xinaventures.com" },
  { icon: Newspaper, title: "Press & Media", description: "For press inquiries, speaker requests, thought leadership, and media partnerships. Our team regularly contributes to discussions on developer tools, venture capital, and the future of AI infrastructure.", email: "press@xinaventures.com" },
  { icon: MessageCircle, title: "Careers at Xina", description: "We're always looking for exceptional people who are passionate about technology and building. Open roles span investing, platform, operations, and marketing. Even if there's no listed role, we encourage you to reach out — we've hired many team members from inbound interest.", email: "careers@xinaventures.com" },
];

const offices = [
  { city: "San Francisco", address: "One Market Street, Suite 3600\nSan Francisco, CA 94105", primary: true, image: "https://images.unsplash.com/photo-1521747116042-5a810fda9664?w=600&q=80&auto=format&fit=crop" },
  { city: "New York", address: "55 Hudson Yards, 30th Floor\nNew York, NY 10001", primary: false, image: "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=600&q=80&auto=format&fit=crop" },
  { city: "London", address: "22 Bishopsgate, Level 33\nLondon EC2N 4BQ", primary: false, image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&q=80&auto=format&fit=crop" },
];

const faqs = [
  { q: "Do I need a warm intro to pitch Xina?", a: "No. We believe the best founders can come from anywhere. We review every pitch that hits our inbox and our partners respond directly to companies within our thesis. Over 30% of our investments originated from cold inbound." },
  { q: "What stage do you invest at?", a: "We invest across pre-seed through growth, with check sizes from $250K to $100M+. However, the majority of our new investments are made at Seed and Series A, where we typically lead or co-lead rounds." },
  { q: "What sectors are you focused on?", a: "Developer tools, AI infrastructure, cloud & data infrastructure, fintech, and climate tech. We look for companies building foundational technology that millions of developers or businesses will rely on." },
  { q: "How quickly do you respond to pitches?", a: "Within 48 hours for companies within our thesis areas. For out-of-scope pitches, we try to respond within 2 weeks. If we pass, we'll tell you why — and we often revisit companies at later stages." },
  { q: "Do you take board seats?", a: "Yes, for Seed and Series A investments where we lead or co-lead. We believe active board participation is essential to being a great partner. At growth stage, we're more flexible." },
];

export default function ContactPage() {
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
            <Mail size={12} /> Contact
          </motion.div>
          <motion.h1 variants={fadeUp} transition={{ duration: 0.5 }} className="max-w-2xl text-3xl font-extrabold tracking-tight text-white md:text-5xl">
            Let&apos;s{" "}
            <span className="text-purple-400">connect</span>
          </motion.h1>
          <motion.p variants={fadeUp} transition={{ duration: 0.5 }} className="mt-4 max-w-xl text-base leading-relaxed text-zinc-400 md:text-lg">
            Whether you&apos;re a founder with a bold idea, an LP exploring our funds, or a talented individual looking to join our team — we&apos;d love to hear from you. No gatekeepers.
          </motion.p>
        </motion.div>
      </section>

      {/* Contact Cards */}
      <section className="relative mx-auto w-full max-w-5xl px-6 pb-28">
        <div className="grid gap-4 sm:grid-cols-2">
          {contacts.map((contact, i) => {
            const Icon = contact.icon;
            return (
              <motion.div
                key={contact.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="group border border-white/[0.06] bg-white/[0.02] p-6 transition-all hover:border-white/[0.1] hover:bg-white/[0.04]"
              >
                <div className="mb-3 inline-flex h-8 w-8 items-center justify-center bg-gradient-to-br from-purple-500 to-violet-600 text-white">
                  <Icon size={16} />
                </div>
                <h2 className="font-semibold text-white">{contact.title}</h2>
                <p className="mt-2 text-[13px] leading-relaxed text-zinc-500">{contact.description}</p>
                <p className="mt-3 text-[13px] font-medium text-purple-400">{contact.email}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Offices */}
      <section className="relative py-28">
        <div className="mx-auto max-w-5xl px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.5 }} className="mb-10">
            <span className="mb-3 inline-block bg-violet-500/[0.08] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-violet-400">Global Presence</span>
            <h2 className="text-xl font-bold text-white md:text-2xl">Our Offices</h2>
            <p className="mt-2 text-[14px] text-zinc-500">Three offices across two continents, supporting portfolio companies in 18 countries.</p>
          </motion.div>
          <div className="grid gap-4 sm:grid-cols-3">
            {offices.map((office, i) => (
              <motion.div
                key={office.city}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="border border-white/[0.06] bg-white/[0.02] p-6 overflow-hidden"
              >
                <div className="relative -mx-6 -mt-6 mb-5 h-36 overflow-hidden">
                  <Image
                    src={office.image}
                    alt={office.city}
                    fill
                    className="object-cover opacity-60 transition-opacity duration-300 group-hover:opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] to-transparent" />
                </div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-white">{office.city}</h3>
                  {office.primary && (
                    <span className="border border-purple-500/20 bg-purple-500/[0.06] px-2 py-0.5 text-[9px] font-semibold uppercase text-purple-400">HQ</span>
                  )}
                </div>
                <p className="mt-2 whitespace-pre-line text-[13px] text-zinc-500">{office.address}</p>
              </motion.div>
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mt-4 border border-white/[0.06] bg-white/[0.02] p-6"
          >
            <div className="flex items-start gap-4">
              <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                <Clock size={16} />
              </div>
              <div>
                <h3 className="font-semibold text-white">Response Commitment</h3>
                <p className="mt-1 text-[13px] leading-relaxed text-zinc-500">
                  We respond to all founder inquiries within 48 hours for companies within our thesis. For out-of-scope pitches, we respond within 2 weeks with honest feedback. If we pass, we&apos;ll tell you why. General inquiries: <span className="text-purple-400">hello@xinaventures.com</span>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative py-28">
        <div className="mx-auto max-w-3xl px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.5 }} className="mb-14 text-center">
            <span className="mb-3 inline-block bg-amber-500/[0.08] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-400">FAQ</span>
            <h2 className="text-xl font-bold text-white md:text-2xl">Frequently Asked Questions</h2>
          </motion.div>
          <div className="space-y-0">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="border-b border-white/[0.06] py-6 first:pt-0 last:border-0"
              >
                <h3 className="font-semibold text-white">{faq.q}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-zinc-500">{faq.a}</p>
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
              Ready to build something extraordinary?
            </h2>
            <p className="mt-4 mx-auto max-w-lg text-[14px] text-zinc-500">
              The best companies in our portfolio started with a single email. We review every pitch and respond within 48 hours.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <a
                href="mailto:founders@xinaventures.com"
                className="inline-flex items-center justify-center gap-2 bg-purple-600 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-purple-700"
              >
                Email Us Your Deck <ArrowRight size={15} />
              </a>
              <Link href="/thesis" className="px-6 py-2.5 text-[13px] font-medium text-zinc-400 transition-colors hover:text-zinc-200">
                Read Our Thesis
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
