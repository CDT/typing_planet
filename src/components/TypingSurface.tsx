import { memo, useMemo } from "react";
import type { EngineState } from "@/features/engine/engine";

interface Props {
  state: EngineState;
}

export const TypingSurface = memo(function TypingSurface({ state }: Props) {
  const chars = useMemo(() => state.text.split(""), [state.text]);

  return (
    <div
      role="textbox"
      aria-readonly="true"
      aria-label="Practice text"
      className="font-mono text-2xl sm:text-3xl leading-relaxed tracking-wide px-6 py-10 select-none"
      style={{ wordBreak: "keep-all" }}
    >
      {chars.map((c, i) => {
        const typed = state.typed[i];
        let cls = "text-[var(--char-pending)]";
        let bg = "";
        if (typed) {
          cls = typed.correct ? "text-[var(--char-correct)]" : "text-[var(--char-incorrect)] underline decoration-wavy";
          if (!typed.correct) bg = "bg-[color-mix(in_srgb,var(--char-incorrect)_12%,transparent)]";
        }
        const isCurrent = i === state.cursor;
        return (
          <span
            key={i}
            className={`${cls} ${bg} ${isCurrent ? "border-b-2 border-[var(--caret)] animate-pulse" : ""} ${
              c === " " ? "px-0.5" : ""
            }`}
          >
            {c === " " ? " " : c}
          </span>
        );
      })}
    </div>
  );
});
