import { ReactNode } from "react";

/** The title block at the top of a dashboard page. */
export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-page-title font-semibold text-ink">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-body text-ink-soft">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/** Initials in a square. Replaces the emoji avatars the old UI used. */
export function Avatar({ name, className = "" }: { name: string; className?: string }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <span
      className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded border border-line bg-page text-small font-medium text-ink-soft ${className}`}
    >
      {initials || "?"}
    </span>
  );
}
