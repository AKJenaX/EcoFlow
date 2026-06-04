import BinMap from "../widgets/BinMap.jsx";
import { bins } from "../data/operations.js";

export default function MapPage() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">Live Map</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Smart Bin Coverage</h1>
      </header>

      <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <BinMap />
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Bin Status</h2>
          <div className="mt-4 space-y-3">
            {bins.map((bin) => (
              <div key={bin.id} className="rounded-lg border border-slate-200 p-3">
                <div className="flex items-center justify-between gap-3">
                  <strong>{bin.name}</strong>
                  <span className="text-sm text-slate-500">{bin.fill}%</span>
                </div>
                <p className="mt-1 text-sm text-slate-500">{bin.id} - {bin.status}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
