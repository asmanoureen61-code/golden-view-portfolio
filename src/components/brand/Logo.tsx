import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid size-9 shrink-0 place-items-center rounded-[10px] border border-border-brand bg-surface",
        className,
      )}
    >
      <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor">
        <path
          d="M4 16.5 9 11l3.5 3.2L20 6.5"
          className="text-primary"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M15.5 6.5H20V11" className="text-primary" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 20h16" className="text-subtle-foreground" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </span>
  );
}

export function Logo({ className, to = "/" }: { className?: string; to?: string }) {
  return (
    <Link
      to={to}
      className={cn("inline-flex items-center gap-2.5 rounded-md", className)}
      aria-label="Portfolia home"
    >
      <LogoMark />
      <span className="text-[1.05rem] font-bold tracking-[-0.02em]">
        Portfol<span className="text-primary">ia</span>
      </span>
    </Link>
  );
}
