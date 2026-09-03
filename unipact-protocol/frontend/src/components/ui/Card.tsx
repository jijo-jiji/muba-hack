import { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** A white panel with a hairline border. No shadow by default, ever. */
export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("rounded-card border border-line bg-surface", className)}>{children}</div>;
}

export function CardHeader({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("border-b border-line px-6 py-4", className)}>{children}</div>;
}

export function CardTitle({ children }: { children: ReactNode }) {
  return <h2 className="text-card-title font-medium text-ink">{children}</h2>;
}

export function CardBody({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("px-6 py-6", className)}>{children}</div>;
}

export function CardFooter({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("border-t border-line px-6 py-4", className)}>{children}</div>;
}
