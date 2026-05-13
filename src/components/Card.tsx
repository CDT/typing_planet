import type { HTMLAttributes } from "react";

export function Card({ className = "", ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-sm ${className}`}
      {...rest}
    />
  );
}
