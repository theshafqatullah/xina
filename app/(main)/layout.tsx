"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useScroll, useTransform } from "framer-motion";
import { Database, Github, Menu, X } from "lucide-react";
import { useState } from "react";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/docs", label: "Docs" },
  { href: "/changelog", label: "Changelog" },
  { href: "/about", label: "About" },
];

function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();
  const borderOpacity = useTransform(scrollY, [0, 80], [0.08, 0.12]);
  const bgOpacity = useTransform(scrollY, [0, 80], [0.7, 0.9]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-6 pt-4">
      <motion.nav
        style={{ borderColor: useTransform(borderOpacity, (v) => `rgba(255,255,255,${v})`), backgroundColor: useTransform(bgOpacity, (v) => `rgba(9,9,11,${v})`) }}
        className="flex h-14 w-full max-w-6xl items-center justify-between rounded-full px-5 shadow-lg shadow-black/20 backdrop-blur-xl"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 shadow-lg shadow-indigo-600/25">
            <Database size={15} className="text-white" />
          </span>
          <span className="text-[15px] font-bold tracking-tight text-white">Xina</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`relative rounded-lg px-3.5 py-2 text-[13px] font-medium transition-colors ${
                  active ? "text-white" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {label}
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 -z-10 rounded-lg bg-white/[0.06]"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* CTA */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/studio"
            className="rounded-full bg-indigo-600 px-4 py-2 text-[13px] font-semibold text-white shadow-lg shadow-indigo-600/25 transition-all hover:bg-indigo-500 hover:shadow-indigo-500/30"
          >
            Open Studio
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:text-white md:hidden"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </motion.nav>

      {/* Mobile menu */}
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed inset-x-0 top-[4.75rem] z-50 flex justify-center px-6"
        >
          <div className="w-full max-w-6xl rounded-2xl border border-white/[0.08] bg-[#09090b]/95 px-5 pb-5 pt-4 shadow-lg shadow-black/20 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`rounded-lg px-3 py-2.5 text-[14px] font-medium transition-colors ${
                  pathname === href ? "bg-white/[0.06] text-white" : "text-zinc-400 hover:text-white"
                }`}
              >
                {label}
              </Link>
            ))}
            <Link
              href="/studio"
              onClick={() => setOpen(false)}
              className="mt-3 rounded-full bg-indigo-600 px-4 py-2.5 text-center text-[14px] font-semibold text-white"
            >
              Open Studio
            </Link>
          </div>
          </div>
        </motion.div>
      )}
    </header>
  );
}

function Footer() {
  return (
    <footer className="relative border-t border-white/[0.06] bg-[#09090b]">
      <div className="pointer-events-none absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
      <div className="relative mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-600 shadow-lg shadow-indigo-600/20">
                <Database size={13} className="text-white" />
              </span>
              <span className="text-sm font-bold text-white">Xina</span>
            </div>
            <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-zinc-500">
              Visual database schema designer for Appwrite. Design, visualize, and manage your collections.
            </p>
            <div className="mt-4 flex gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04] text-zinc-500 transition-colors hover:bg-white/[0.08] hover:text-white">
                <Github size={14} />
              </span>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-400">Product</h4>
            <div className="flex flex-col gap-2.5">
              <Link href="/features" className="text-[13px] text-zinc-500 transition-colors hover:text-zinc-300">Features</Link>
              <Link href="/pricing" className="text-[13px] text-zinc-500 transition-colors hover:text-zinc-300">Pricing</Link>
              <Link href="/studio" className="text-[13px] text-zinc-500 transition-colors hover:text-zinc-300">Studio</Link>
            </div>
          </div>

          {/* Resources */}
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-400">Resources</h4>
            <div className="flex flex-col gap-2.5">
              <Link href="/docs" className="text-[13px] text-zinc-500 transition-colors hover:text-zinc-300">Documentation</Link>
              <Link href="/changelog" className="text-[13px] text-zinc-500 transition-colors hover:text-zinc-300">Changelog</Link>
              <Link href="/about" className="text-[13px] text-zinc-500 transition-colors hover:text-zinc-300">About</Link>
            </div>
          </div>

          {/* Legal */}
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-400">Legal</h4>
            <div className="flex flex-col gap-2.5">
              <span className="text-[13px] text-zinc-600">Privacy Policy</span>
              <span className="text-[13px] text-zinc-600">Terms of Service</span>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/[0.04] pt-7 sm:flex-row">
          <p className="text-xs text-zinc-600">&copy; {new Date().getFullYear()} Xina. All rights reserved.</p>
          <p className="text-xs text-zinc-600">Built with <span className="text-indigo-500">&hearts;</span> for Appwrite developers</p>
        </div>
      </div>
    </footer>
  );
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#09090b]">
      <Navbar />
      <main className="pt-16">{children}</main>
      <Footer />
    </div>
  );
}
