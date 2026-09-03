import { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "neutral" | "success" | "warning" | "error";

/**
 * Status colour appears here and nowhere else: small text on a very light
 * background. Never a full-width fill, never a glow.
 */
const TONES: Record<Tone, string> = {
  neutral: "border-line-strong bg-page text-ink-soft",
  success: "border-success/30 bg-success/5 text-success",
  warning: "border-warning/30 bg-warning/5 text-warning",
  error: "border-danger/30 bg-danger/5 text-danger",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-small font-medium",
        TONES[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
