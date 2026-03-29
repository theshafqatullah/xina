"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Briefcase,
  ChevronDown,
  Compass,
  Mail,
  Menu,
  Newspaper,
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
    label: "Firm",
    children: [
      { href: "/thesis", title: "Thesis", desc: "Our investment philosophy, focus areas, and stage strategy", icon: Compass },
      { href: "/team", title: "Team", desc: "Meet the partners and team behind Xina Ventures", icon: Users },
    ],
  },
  {
    label: "Investments",
    children: [
      { href: "/portfolio", title: "Portfolio", desc: "Companies we've backed across AI, climate, health, and more", icon: Briefcase },
      { href: "/news", title: "News & Insights", desc: "Announcements, investment memos, and perspectives", icon: Newspaper },
    ],
    cta: { href: "/contact", label: "Pitch Us" },
  },
  { label: "Contact", href: "/contact" },
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
          hasActive ? "text-white" : "text-zinc-400 hover:text-zinc-200"
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
            className="absolute inset-x-0 top-full z-50 border-b border-white/[0.06] bg-[#09090b]"
            onMouseEnter={enter}
            onMouseLeave={leave}
          >
            <div className="mx-auto flex max-w-6xl items-stretch gap-0 px-5 py-6">
              <div className="flex flex-1 gap-2">
                {item.children.map((child) => {
                  const active = pathname === child.href;
                  const Icon = child.icon;
                  return (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={() => setOpen(false)}
                      className={`group flex flex-1 gap-4 p-4 transition-colors ${
                        active ? "bg-white/[0.04]" : "hover:bg-white/[0.03]"
                      }`}
                    >
                      <Icon size={20} className="mt-0.5 shrink-0 text-purple-400" />
                      <div>
                        <span className="text-[13px] font-semibold text-white">{child.title}</span>
                        <span className="mt-1 block text-[12px] leading-relaxed text-zinc-500">{child.desc}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
              {item.cta && (
                <div className="ml-6 flex w-48 shrink-0 flex-col justify-center border-l border-white/[0.06] pl-6">
                  <Link
                    href={item.cta.href}
                    onClick={() => setOpen(false)}
                    className="group flex items-center gap-1.5 text-[13px] font-medium text-purple-400 transition-colors hover:text-purple-300"
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
        className="flex w-full items-center justify-between px-3 py-2.5 text-[14px] font-medium text-zinc-400 transition-colors hover:text-white"
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
                    className={`flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium transition-colors ${
                      pathname === child.href ? "text-white" : "text-zinc-500 hover:text-white"
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
    <header className="relative sticky top-0 z-50 w-full border-b border-white/[0.08] bg-[#09090b]">
      <nav className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-5">
        <Link href="/" className="text-[15px] font-bold tracking-tight text-white">
          Xina Ventures
        </Link>

        <div className="hidden items-center gap-0.5 md:flex">
          {NAV_ITEMS.map((item) =>
            "children" in item ? (
              <MegaDropdown key={item.label} item={item as Extract<NavItem, { children: DropdownItem[] }>} />
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3.5 py-2 text-[13px] font-medium transition-colors ${
                  pathname === item.href ? "text-white" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {item.label}
              </Link>
            ),
          )}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/contact"
            className="border border-white/[0.08] px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-white/[0.04]"
          >
            Pitch Us
          </Link>
        </div>

        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center text-zinc-400 transition-colors hover:text-white md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 right-0 top-full z-50 overflow-hidden border-b border-white/[0.08] bg-[#09090b]"
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
                        pathname === item.href ? "text-white" : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      {item.label}
                    </Link>
                  ),
                )}
                <div className="mt-3 flex flex-col gap-2">
                  <Link
                    href="/contact"
                    onClick={() => setMobileOpen(false)}
                    className="border border-white/[0.08] px-4 py-2.5 text-center text-[14px] font-semibold text-white transition-colors hover:bg-white/[0.04]"
                  >
                    Pitch Us
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
    <footer className="relative border-t border-white/[0.06] bg-[#09090b]">
      <div className="pointer-events-none absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
      <div className="relative mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
          <div className="sm:col-span-2 md:col-span-1">
            <p className="text-[15px] font-bold tracking-tight text-white">Xina Ventures</p>
            <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-zinc-500">
              Backing bold founders building the future. Early &amp; growth stage venture capital.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-400">Firm</h4>
            <div className="flex flex-col gap-2.5">
              <Link href="/thesis" className="text-[13px] text-zinc-500 transition-colors hover:text-zinc-300">Thesis</Link>
              <Link href="/team" className="text-[13px] text-zinc-500 transition-colors hover:text-zinc-300">Team</Link>
              <Link href="/portfolio" className="text-[13px] text-zinc-500 transition-colors hover:text-zinc-300">Portfolio</Link>
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-400">Resources</h4>
            <div className="flex flex-col gap-2.5">
              <Link href="/news" className="text-[13px] text-zinc-500 transition-colors hover:text-zinc-300">News</Link>
              <Link href="/contact" className="text-[13px] text-zinc-500 transition-colors hover:text-zinc-300">Contact</Link>
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-400">Connect</h4>
            <div className="flex flex-col gap-2.5">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-[13px] text-zinc-500 transition-colors hover:text-zinc-300">Twitter</a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-[13px] text-zinc-500 transition-colors hover:text-zinc-300">LinkedIn</a>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/[0.04] pt-7 sm:flex-row">
          <p className="text-xs text-zinc-600">&copy; {new Date().getFullYear()} Xina Ventures. All rights reserved.</p>
          <p className="text-xs text-zinc-600">Built with <span className="text-purple-500">&hearts;</span> for ambitious founders</p>
        </div>
      </div>
    </footer>
  );
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#09090b]">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
