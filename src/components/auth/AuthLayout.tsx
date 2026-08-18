import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import type { ReactNode } from "react";

import { Logo } from "@/components/brand/Logo";

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 size-[520px] -translate-x-1/2 rounded-full bg-primary/10 blur-[140px]"
      />
      <div className="relative w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Link to="/" aria-label="Portfolia home">
            <Logo />
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="glass-surface brand-edge relative rounded-xl border border-border bg-surface p-6 shadow-2xl sm:p-8"
        >
          <span className="card-glow pointer-events-none absolute inset-0 rounded-xl" aria-hidden="true" />
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{title}</h1>
          {subtitle && <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </motion.div>

        {footer && <div className="mt-5 text-center text-sm text-muted-foreground">{footer}</div>}
      </div>
    </div>
  );
}
