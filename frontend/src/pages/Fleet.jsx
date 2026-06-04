import { fleetData, fleetSummary } from "../data/mockData";

const StatCard = ({ label, value }) => (
  <div className="rounded-lg border border-slate-200 bg-white px-6 py-4 shadow-sm">
    <p className="text-sm font-medium text-slate-600">{label}</p>
    <p className="mt-1 text-2xl font-bold text-[#1a3a2a]">{value}</p>
  </div>
);

const StatusBadge = ({ status }) => {
  const statusConfig = {
    "On Route": "bg-green-100 text-green-800",
    Available: "bg-blue-100 text-blue-800",
    "Under Maintenance": "bg-red-100 text-red-800"
  };

  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusConfig[status]}`}>
      {status}
    </span>
  );
};

const ProgressBar = ({ load }) => (
  <div className="w-full">
    <div className="mb-1 flex items-center justify-between">
      <span className="text-xs font-medium text-slate-600">{load}%</span>
    </div>
    <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
      <div
        className="h-full bg-[#84cc16] transition-all duration-300"
        style={{ width: `${load}%` }}
      />
    </div>
  </div>
);

export default function Fleet() {
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  return (
    <section className="fade-in space-y-6">
      {/* Header */}
      <div>
        <p className="text-sm font-medium text-slate-600">Fleet Management</p>
        <h1 className="mt-1 text-3xl font-bold text-[#1a3a2a]">Vehicle Assignments</h1>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard label="Total Vehicles" value={fleetSummary.totalVehicles} />
        <StatCard label="On Route" value={fleetSummary.onRoute} />
        <StatCard label="Available" value={fleetSummary.available} />
        <StatCard label="Under Maintenance" value={fleetSummary.underMaintenance} />
      </div>

      {/* Fleet Table */}
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">Vehicle ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">Driver</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">Route</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">Zone</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">Load</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">Last Service</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {fleetData.map((vehicle) => (
                <tr key={vehicle.vehicleId} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-900">{vehicle.vehicleId}</td>
                  <td className="px-6 py-4 text-slate-700">{vehicle.driver}</td>
                  <td className="px-6 py-4 text-slate-700">{vehicle.route}</td>
                  <td className="px-6 py-4 text-slate-700">{vehicle.zone}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={vehicle.status} />
                  </td>
                  <td className="px-6 py-4 w-32">
                    <ProgressBar load={vehicle.load} />
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{formatDate(vehicle.lastService)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Footer */}
      <div className="rounded-lg border border-slate-200 bg-slate-50 px-6 py-4">
        <p className="text-sm text-slate-600">
          Showing <span className="font-semibold">{fleetData.length}</span> vehicles in fleet
        </p>
      </div>
    </section>
  );
}
