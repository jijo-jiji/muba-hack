import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/** The "go back up one level" link that sits above a page title. */
export function BackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 text-small text-ink-soft transition-colors hover:text-ink"
    >
      <ArrowLeft className="h-3.5 w-3.5" />
      {children}
    </Link>
  );
}
