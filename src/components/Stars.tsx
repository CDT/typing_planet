import { Star } from "lucide-react";

export function Stars({ count, total = 3, size = 20 }: { count: 0 | 1 | 2 | 3; total?: number; size?: number }) {
  return (
    <div className="inline-flex gap-1" aria-label={`${count} of ${total} stars`}>
      {Array.from({ length: total }).map((_, i) => (
        <Star
          key={i}
          size={size}
          className={i < count ? "fill-[var(--warning)] stroke-[var(--warning)]" : "stroke-[var(--text-faint)]"}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}
