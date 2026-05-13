export function ProgressBar({ value, max = 1, className = "" }: { value: number; max?: number; className?: string }) {
  const pct = Math.max(0, Math.min(1, value / max));
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct * 100)}
      className={`h-2 w-full rounded-pill bg-[var(--surface-2)] overflow-hidden ${className}`}
    >
      <div
        className="h-full bg-[var(--accent)] transition-[width] duration-150"
        style={{ width: `${pct * 100}%` }}
      />
    </div>
  );
}
