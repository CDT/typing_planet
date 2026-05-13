import { memo } from "react";
import { FINGER_COLOR, fingerFor } from "@/features/engine/finger-map";

interface Props {
  nextKey?: string;
  showFingerOverlay?: boolean;
}

const ROWS: string[][] = [
  ["`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "="],
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]", "\\"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'"],
  ["z", "x", "c", "v", "b", "n", "m", ",", ".", "/"],
  [" "],
];

function Key({ k, highlighted, showFingerOverlay }: { k: string; highlighted: boolean; showFingerOverlay: boolean }) {
  const isSpace = k === " ";
  const label = isSpace ? "" : k;
  const fingerColor = showFingerOverlay ? FINGER_COLOR[fingerFor(k)] : undefined;
  return (
    <div
      className={`relative flex items-center justify-center rounded-md border text-sm font-mono uppercase select-none transition-all ${
        highlighted
          ? "bg-[var(--accent)] text-[var(--accent-fg)] border-[var(--accent)] scale-105 shadow-sm"
          : "bg-[var(--surface)] text-[var(--text-muted)] border-[var(--border)]"
      }`}
      style={{
        height: 36,
        minWidth: isSpace ? 220 : 36,
        flexGrow: isSpace ? 6 : 0,
      }}
    >
      {label}
      {fingerColor && !highlighted && (
        <span
          aria-hidden
          className="absolute bottom-1 w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: fingerColor }}
        />
      )}
    </div>
  );
}

const MemoKey = memo(Key);

export function VirtualKeyboard({ nextKey, showFingerOverlay = false }: Props) {
  const target = nextKey?.toLowerCase();
  return (
    <div className="w-full max-w-[720px] mx-auto flex flex-col gap-1.5">
      {ROWS.map((row, ri) => (
        <div key={ri} className="flex gap-1.5 justify-center">
          {row.map((k) => (
            <MemoKey key={k} k={k} highlighted={target === k} showFingerOverlay={showFingerOverlay} />
          ))}
        </div>
      ))}
    </div>
  );
}
