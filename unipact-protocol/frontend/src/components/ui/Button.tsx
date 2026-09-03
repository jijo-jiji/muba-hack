"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-action text-white hover:bg-action-hover border border-action disabled:bg-ink-faint disabled:border-ink-faint",
  secondary: "bg-surface text-ink border border-line-strong hover:bg-page",
  ghost: "bg-transparent text-ink-soft border border-transparent hover:text-ink hover:bg-page",
};

const SIZES: Record<Size, string> = {
  sm: "h-8 px-3 text-small",
  md: "h-10 px-4 text-body",
  lg: "h-12 px-6 text-body",
};

const BASE =
  "inline-flex items-center justify-center gap-2 rounded font-medium transition-colors " +
  "disabled:cursor-not-allowed disabled:opacity-60";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", className, ...props },
  ref
) {
  return <button ref={ref} className={cn(BASE, VARIANTS[variant], SIZES[size], className)} {...props} />;
});

/** Same look, but it navigates instead of firing a handler. */
export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
}: {
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={cn(BASE, VARIANTS[variant], SIZES[size], className)}>
      {children}
    </Link>
  );
}
