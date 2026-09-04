import { ReactNode } from "react";

/** A label above a number. Used for balances, budgets and scores. */
export function Stat({
  label,
  value,
  note,
}: {
  label: string;
  value: ReactNode;
  note?: ReactNode;
}) {
  return (
    <div>
      <p className="text-small text-ink-soft">{label}</p>
      <p className="mt-1 text-section font-semibold text-ink">{value}</p>
      {note && <p className="mt-1 text-small text-ink-faint">{note}</p>}
    </div>
  );
}
