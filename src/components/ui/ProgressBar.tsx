export default function ProgressBar({
  current,
  target,
}: {
  current: number;
  target: number;
}) {
  const pct = Math.min(100, Math.round((current / target) * 100));
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs text-stone-500">
        <span>
          {current.toLocaleString("ru-RU")} / {target.toLocaleString("ru-RU")}
        </span>
        <span className="font-semibold text-emerald-600">{pct}%</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-emerald-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
