"use client";

export default function ProgressBar({
  current,
  target,
}: {
  current: number;
  target: number;
}) {
  const pct = Math.min(100, Math.round((current / target) * 100));

  return (
    <div>
      <div className="mb-1.5 flex justify-between text-xs text-ink-light">
        <span>{current.toLocaleString()}</span>
        <span>{target.toLocaleString()}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-stone-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-orange-400 to-orange-500 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-1 text-right text-[10px] font-medium text-peach-deep">
        {pct}%
      </p>
    </div>
  );
}
