import { ReactNode } from "react";

/** The small caps label that introduces a block inside a card. */
export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-small font-medium uppercase tracking-wide text-ink-faint">{children}</p>
  );
}
