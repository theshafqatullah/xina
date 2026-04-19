"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff } from "lucide-react";

export default function SignInPage() {
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
          <img src="/zinaplus-logo.svg" alt="Zinaplus" className="mx-auto mb-6 h-8 w-auto" />
        </Link>
        <h1 className="text-3xl text-zinc-900">Welcome back</h1>
        <p className="mt-1 text-sm text-zinc-600">Sign in to pick up where you left off.</p>
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-zinc-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            className="h-10 w-full rounded-lg border border-zinc-200 bg-zinc-100 px-3 text-sm text-zinc-900 placeholder:text-zinc-500 outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium text-zinc-700">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-emerald-600 hover:text-emerald-700 transition"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              placeholder="••••••••"
              className="h-10 w-full rounded-lg border border-zinc-200 bg-zinc-100 px-3 pr-10 text-sm text-zinc-900 placeholder:text-zinc-500 outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700 transition"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 text-sm font-medium text-white transition hover:bg-emerald-500"
        >
          Sign in
          <ArrowRight className="size-4" />
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-600">
        Don&apos;t have an account?{" "}
        <Link href="/sign-up" className="text-emerald-600 hover:text-emerald-700 transition">
          Sign up
        </Link>
      </p>
    </motion.div>
  );
}
