export default function MetricCard({ label, value, change, tone = "emerald" }) {
  const tones = {
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
    rose: "border-rose-200 bg-rose-50 text-rose-700",
    sky: "border-sky-200 bg-sky-50 text-sky-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700"
  };

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <div className="mt-3 flex items-end justify-between gap-3">
        <strong className="text-3xl font-semibold tracking-tight">{value}</strong>
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${tones[tone]}`}>
          {change}
        </span>
      </div>
    </section>
  );
}
