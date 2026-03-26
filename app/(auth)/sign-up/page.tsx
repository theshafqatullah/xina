"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff } from "lucide-react";

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);

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
        <h1 className="text-2xl font-semibold text-white">Create your account</h1>
        <p className="mt-1 text-sm text-zinc-400">Start building schemas in seconds</p>
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-zinc-300">
            Name
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            required
            placeholder="Jane Doe"
            className="h-10 w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 text-sm text-white placeholder:text-zinc-500 outline-none transition focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20"
          />
        </div>

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

        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-zinc-300">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              placeholder="••••••••"
              className="h-10 w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 pr-10 text-sm text-white placeholder:text-zinc-500 outline-none transition focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-purple-600 text-sm font-medium text-white transition hover:bg-purple-500"
        >
          Create account
          <ArrowRight className="size-4" />
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-400">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-purple-400 hover:text-purple-300 transition">
          Sign in
        </Link>
      </p>
    </motion.div>
  );
}
