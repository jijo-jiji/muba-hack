"use client";

import { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

const CONTROL =
  "w-full rounded-input border border-line-strong bg-surface px-3 py-2 text-body text-ink " +
  "placeholder:text-ink-faint focus:border-accent focus:outline-none disabled:bg-page disabled:text-ink-faint";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(CONTROL, className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(CONTROL, "min-h-[120px] resize-y", className)} {...props} />;
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(CONTROL, "pr-8", className)} {...props}>
      {children}
    </select>
  );
}

/** Label, optional hint, optional error message, wrapped around one control. */
export function Field({
  label,
  hint,
  error,
  htmlFor,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-small font-medium text-ink">
        {label}
      </label>
      {hint && <p className="text-small text-ink-soft">{hint}</p>}
      {children}
      {error && <p className="text-small text-danger">{error}</p>}
    </div>
  );
}
