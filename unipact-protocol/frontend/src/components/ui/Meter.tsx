type Tone = "neutral" | "success" | "warning" | "error";

const FILLS: Record<Tone, string> = {
  neutral: "bg-ink-faint",
  success: "bg-success",
  warning: "bg-warning",
  error: "bg-danger",
};

/**
 * A flat score bar. No animation and no gradient: the number beside it is the
 * point, this only makes it easier to read at a glance.
 */
export function Meter({ value, tone = "neutral" }: { value: number; tone?: Tone }) {
  const width = Math.max(0, Math.min(100, value));
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
      <div className={`h-full ${FILLS[tone]}`} style={{ width: `${width}%` }} />
    </div>
  );
}
