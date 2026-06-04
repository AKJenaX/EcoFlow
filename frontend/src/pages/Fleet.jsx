import { fleet } from "../data/operations.js";

export default function Fleet() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">Fleet</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Vehicle Assignments</h1>
      </header>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-slate-100 text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Vehicle</th>
              <th className="px-4 py-3 font-semibold">Driver</th>
              <th className="px-4 py-3 font-semibold">Route</th>
              <th className="px-4 py-3 font-semibold">Load</th>
              <th className="px-4 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {fleet.map((vehicle) => (
              <tr key={vehicle.id} className="border-t border-slate-200">
                <td className="px-4 py-3 font-semibold">{vehicle.id}</td>
                <td className="px-4 py-3">{vehicle.driver}</td>
                <td className="px-4 py-3">{vehicle.route}</td>
                <td className="px-4 py-3">{vehicle.load}%</td>
                <td className="px-4 py-3">{vehicle.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
