"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

/** 0x1a2b3c...9f8e — long enough to recognise, short enough to sit in a line. */
export function truncateMiddle(value: string, lead = 6, tail = 4): string {
  if (value.length <= lead + tail + 3) return value;
  return `${value.slice(0, lead)}...${value.slice(-tail)}`;
}

/**
 * A wallet address, transaction digest or Gonka request id. Monospace, truncated
 * in the middle, with a copy button so the full value is never lost.
 */
export function AddressChip({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard access can be blocked; the full value is in the title attribute.
    }
  };

  return (
    <span className="inline-flex items-center gap-2">
      {label && <span className="text-small text-ink-soft">{label}</span>}
      <span
        title={value}
        className="rounded border border-line bg-page px-2 py-0.5 font-mono text-small text-ink"
      >
        {truncateMiddle(value)}
      </span>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "Copied" : "Copy to clipboard"}
        className="text-ink-faint transition-colors hover:text-ink"
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    </span>
  );
}
