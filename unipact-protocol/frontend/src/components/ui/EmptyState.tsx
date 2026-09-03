import { ReactNode } from "react";

/**
 * What a list shows when it has nothing in it. There is deliberately no
 * placeholder data anywhere in this app, so this is what fills the gap.
 */
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-card border border-dashed border-line-strong px-6 py-12 text-center">
      <p className="text-card-title font-medium text-ink">{title}</p>
      {description && <p className="mx-auto mt-2 max-w-md text-body text-ink-soft">{description}</p>}
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}
