"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function ForgotPasswordPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-sm"
    >
      <div className="mb-8 text-center">
        <Link href="/">
          <img src="/xina-logo.svg" alt="Xina" className="mx-auto mb-6 h-8 w-auto" />
        </Link>
        <h1 className="text-2xl font-semibold text-white">Reset your password</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-zinc-300">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            className="h-10 w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 text-sm text-white placeholder:text-zinc-500 outline-none transition focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20"
          />
        </div>

        <button
          type="submit"
          className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-purple-600 text-sm font-medium text-white transition hover:bg-purple-500"
        >
          Send reset link
          <ArrowRight className="size-4" />
        </button>
      </form>

      <Link
        href="/sign-in"
        className="mt-6 flex items-center justify-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-300 transition"
      >
        <ArrowLeft className="size-3.5" />
        Back to sign in
      </Link>
    </motion.div>
  );
}
