"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  ChevronDown,
  Clock,
  CreditCard,
  Github,
  LayoutGrid,
  Menu,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { useRef, useState } from "react";

type DropdownItem = { href: string; title: string; desc: string; icon: React.ElementType };
type NavItem =
  | { label: string; href: string }
  | { label: string; children: DropdownItem[]; cta?: { href: string; label: string } };

const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/" },
  {
    label: "Product",
    children: [
      { href: "/features", title: "Features", desc: "AI generation, drag & drop builder, multi-engine support, and more", icon: Sparkles },
      { href: "/pricing", title: "Pricing", desc: "Free forever for individuals. Pro & Enterprise for teams", icon: CreditCard },
    ],
  },
  {
    label: "Resources",
    children: [
      { href: "/docs", title: "Documentation", desc: "Step-by-step guides, API reference, and troubleshooting", icon: BookOpen },
      { href: "/changelog", title: "Changelog", desc: "Every feature, fix, and improvement — newest first", icon: Clock },
    ],
    cta: { href: "/docs", label: "Get Started" },
  },
  {
    label: "Company",
    children: [
      { href: "/about", title: "About", desc: "Our story, values, tech stack, and the team behind Zinaplus", icon: Users },
    ],
  },
];

/* ── Full-width desktop mega dropdown ── */
function MegaDropdown({ item }: { item: Extract<NavItem, { children: DropdownItem[] }> }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  const enter = () => { clearTimeout(timeout.current); setOpen(true); };
  const leave = () => { timeout.current = setTimeout(() => setOpen(false), 120); };

  const hasActive = item.children.some((c) => pathname === c.href);

  return (
    <div className="static" onMouseEnter={enter} onMouseLeave={leave}>
      <button
        type="button"
        className={`flex items-center gap-1 px-3.5 py-2 text-[13px] font-medium transition-colors ${
          hasActive ? "text-zinc-900" : "text-zinc-600 hover:text-zinc-800"
        }`}
        onClick={() => setOpen((v) => !v)}
      >
        {item.label}
        <ChevronDown
          size={12}
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-x-0 top-full z-50 border-b border-zinc-200 bg-white"
            onMouseEnter={enter}
            onMouseLeave={leave}
          >
            <div className="mx-auto flex max-w-6xl items-stretch gap-0 px-5 py-6">
              {/* Links grid */}
              <div className="flex flex-1 gap-2">
                {item.children.map((child) => {
                  const active = pathname === child.href;
                  const Icon = child.icon;
                  return (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={() => setOpen(false)}
                      className={`group flex flex-1 gap-4 rounded-xl p-4 transition-colors ${
                        active ? "bg-zinc-100" : "hover:bg-zinc-50"
                      }`}
                    >
                      <Icon size={20} className="mt-0.5 shrink-0 text-emerald-600" />
                      <div>
                        <span className="text-[13px] font-semibold text-zinc-900">{child.title}</span>
                        <span className="mt-1 block text-[12px] leading-relaxed text-zinc-500">{child.desc}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
              {/* Optional CTA column */}
              {item.cta && (
                <div className="ml-6 flex w-48 shrink-0 flex-col justify-center border-l border-zinc-200 pl-6">
                  <Link
                    href={item.cta.href}
                    onClick={() => setOpen(false)}
                    className="group flex items-center gap-1.5 text-[13px] font-medium text-emerald-600 transition-colors hover:text-emerald-700"
                  >
                    {item.cta.label}
                    <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Mobile accordion ── */
function MobileAccordion({
  item, pathname, onNavigate,
}: { item: Extract<NavItem, { children: DropdownItem[] }>; pathname: string; onNavigate: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-3 py-2.5 text-[14px] font-medium text-zinc-600 transition-colors hover:text-zinc-900"
      >
        {item.label}
        <ChevronDown size={14} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-0.5 pb-1 pl-3">
              {item.children.map((child) => {
                const Icon = child.icon;
                return (
                  <Link
                    key={child.href}
                    href={child.href}
                    onClick={onNavigate}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors ${
                      pathname === child.href ? "text-zinc-900" : "text-zinc-500 hover:text-zinc-900"
                    }`}
                  >
                    <Icon size={15} className="shrink-0 text-zinc-500" />
                    {child.title}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="relative sticky top-0 z-50 w-full border-b border-zinc-200 bg-white">
      <nav className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-5">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <img src="/zinaplus-logo.svg" alt="Zinaplus" className="h-7 w-auto" />
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-0.5 md:flex">
          {NAV_ITEMS.map((item) =>
            "children" in item ? (
              <MegaDropdown key={item.label} item={item as Extract<NavItem, { children: DropdownItem[] }>} />
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3.5 py-2 text-[13px] font-medium transition-colors ${
                  pathname === item.href ? "text-zinc-900" : "text-zinc-600 hover:text-zinc-800"
                }`}
              >
                {item.label}
              </Link>
            ),
          )}
        </div>

        {/* CTA */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/sign-in"
            className="px-3.5 py-2 text-[13px] font-medium text-zinc-600 transition-colors hover:text-zinc-800"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="rounded-lg border border-zinc-200 px-4 py-2 text-[13px] font-semibold text-zinc-900 transition-colors hover:bg-zinc-100"
          >
            Sign up
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center text-zinc-600 transition-colors hover:text-zinc-900 md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 right-0 top-full z-50 overflow-hidden border-b border-zinc-200 bg-white"
          >
            <div className="mx-auto w-full max-w-6xl px-5 pb-5 pt-3 md:hidden">
              <div className="flex flex-col gap-0.5">
                {NAV_ITEMS.map((item) =>
                  "children" in item ? (
                    <MobileAccordion
                      key={item.label}
                      item={item as Extract<NavItem, { children: DropdownItem[] }>}
                      pathname={pathname}
                      onNavigate={() => setMobileOpen(false)}
                    />
                  ) : (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`px-3 py-2.5 text-[14px] font-medium transition-colors ${
                        pathname === item.href ? "text-zinc-900" : "text-zinc-600 hover:text-zinc-900"
                      }`}
                    >
                      {item.label}
                    </Link>
                  ),
                )}
                <div className="mt-3 flex flex-col gap-2">
                  <Link
                    href="/sign-in"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg border border-zinc-200 px-4 py-2.5 text-center text-[14px] font-medium text-zinc-700 transition-colors hover:bg-zinc-100"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/sign-up"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg border border-zinc-200 px-4 py-2.5 text-center text-[14px] font-semibold text-zinc-900 transition-colors hover:bg-zinc-100"
                  >
                    Sign up
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function Footer() {
  return (
    <footer className="relative border-t border-zinc-200 bg-white">
      <div className="pointer-events-none absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.08) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
      <div className="relative mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 md:col-span-1">
            <div className="flex items-center">
              <img src="/zinaplus-logo.svg" alt="Zinaplus" className="h-6 w-auto" />
            </div>
            <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-zinc-500">
              Visual database schema designer for Appwrite. Design, visualize, and manage your collections.
            </p>
            <div className="mt-4 flex gap-2">
              <span className="text-zinc-500 transition-colors hover:text-zinc-900">
                <Github size={16} />
              </span>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-600">Product</h4>
            <div className="flex flex-col gap-2.5">
              <Link href="/features" className="text-[13px] text-zinc-500 transition-colors hover:text-zinc-700">Features</Link>
              <Link href="/pricing" className="text-[13px] text-zinc-500 transition-colors hover:text-zinc-700">Pricing</Link>
              <Link href="/studio" className="text-[13px] text-zinc-500 transition-colors hover:text-zinc-700">Studio</Link>
            </div>
          </div>

          {/* Resources */}
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-600">Resources</h4>
            <div className="flex flex-col gap-2.5">
              <Link href="/docs" className="text-[13px] text-zinc-500 transition-colors hover:text-zinc-700">Documentation</Link>
              <Link href="/changelog" className="text-[13px] text-zinc-500 transition-colors hover:text-zinc-700">Changelog</Link>
              <Link href="/about" className="text-[13px] text-zinc-500 transition-colors hover:text-zinc-700">About</Link>
            </div>
          </div>

          {/* Legal */}
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-600">Legal</h4>
            <div className="flex flex-col gap-2.5">
              <span className="text-[13px] text-zinc-400">Privacy Policy</span>
              <span className="text-[13px] text-zinc-400">Terms of Service</span>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-zinc-200 pt-7 sm:flex-row">
          <p className="text-xs text-zinc-400">&copy; {new Date().getFullYear()} Zinaplus. All rights reserved.</p>
          <p className="text-xs text-zinc-400">Built with <span className="text-emerald-700">&hearts;</span> for Appwrite developers</p>
        </div>
      </div>
    </footer>
  );
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
