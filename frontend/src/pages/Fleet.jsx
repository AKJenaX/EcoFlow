import { useState, useEffect } from "react";
import { fleetData as mockFleet, fleetSummary as mockSummary } from "../data/mockData";
import { getDrivers, getVehicles } from "../services/api.js";
import StatCard from "../widgets/StatCard.jsx";
import Spinner from "../widgets/Spinner.jsx";

const StatusBadge = ({ status }) => {
  const statusConfig = {
    "On Route": "bg-green-50 border-green-200 text-green-700",
    Available: "bg-blue-50 border-blue-200 text-blue-700",
    "Under Maintenance": "bg-red-50 border-red-200 text-red-700"
  };
  return (
    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-bold ${statusConfig[status] || "bg-slate-50 border-slate-200 text-slate-700"}`}>
      {status}
    </span>
  );
};

const ProgressBar = ({ load }) => (
  <div className="w-full">
    <div className="mb-1 flex items-center justify-between">
      <span className="text-xs font-semibold text-slate-600">{load}%</span>
    </div>
    <div className="h-2 w-full rounded-full bg-slate-100 border border-slate-200/50 overflow-hidden">
      <div className="h-full bg-gradient-to-r from-[#84cc16] to-emerald-500 transition-all duration-300" style={{ width: `${load}%` }} />
    </div>
  </div>
);

function mergeDriverVehicle(drivers, vehicles) {
  return drivers.map((d) => {
    const v = vehicles.find((v) => v.Vehicle_ID === d.Vehicle_ID) || {};
    return {
      vehicleId: v.Vehicle_Number || d.Vehicle_ID || "-",
      driver: d.Name || "-",
      route: d.Address || "-",
      zone: v.Assigned_Location || "-",
      status: "On Route",
      load: 0,
      lastService: "-",
      controlNumber: d.Control_Number || "-",
      vehicleType: v.Vehicle_Type || "-",
      manufacturer: v.Manufacturer || "-"
    };
  });
}

export default function Fleet() {
  const [fleet, setFleet] = useState(mockFleet);
  const [summary, setSummary] = useState(mockSummary);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterTab, setFilterTab] = useState("all"); // "all" | "On Route" | "Available" | "Under Maintenance"

  useEffect(() => {
    let cancelled = false;
    async function fetchFleet() {
      try {
        const [driversRes, vehiclesRes] = await Promise.all([getDrivers(), getVehicles()]);
        const drivers = Array.isArray(driversRes) ? driversRes : driversRes.data || [];
        const vehicles = Array.isArray(vehiclesRes) ? vehiclesRes : vehiclesRes.data || [];
        if (!cancelled && drivers.length > 0) {
          const merged = mergeDriverVehicle(drivers, vehicles);
          setFleet(merged);
          setSummary({
            totalVehicles: vehicles.length || merged.length,
            onRoute: merged.filter((f) => f.status === "On Route").length,
            available: merged.filter((f) => f.status === "Available").length,
            underMaintenance: merged.filter((f) => f.status === "Under Maintenance").length
          });
        }
      } catch {
        if (!cancelled) setError("API unavailable — showing mock data.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchFleet();
    return () => { cancelled = true; };
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr || dateStr === "-") return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  const filteredFleet = fleet.filter((vehicle) => {
    if (filterTab === "all") return true;
    return vehicle.status === filterTab;
  });

  return (
    <section className="fade-in space-y-6">
      <div>
        <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Fleet Management</p>
        <h1 className="mt-1 text-3xl font-bold text-[#1a3a2a] tracking-tight">Vehicle Assignments</h1>
      </div>

      {error && (
        <div className="rounded-lg bg-yellow-50 border border-yellow-200 px-4 py-3 text-sm text-yellow-700">{error}</div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard label="Total Vehicles" value={summary.totalVehicles} />
        <StatCard label="On Route" value={summary.onRoute} />
        <StatCard label="Available" value={summary.available} />
        <StatCard label="Under Maintenance" value={summary.underMaintenance} />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none text-[11px] font-bold uppercase tracking-wider">
        <button
          onClick={() => setFilterTab("all")}
          className={`px-4 py-2 rounded-xl border transition shrink-0 ${filterTab === "all" ? "bg-[#1a3a2a] text-white border-[#1a3a2a] shadow-sm" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}
        >
          All ({fleet.length})
        </button>
        <button
          onClick={() => setFilterTab("On Route")}
          className={`px-4 py-2 rounded-xl border transition shrink-0 ${filterTab === "On Route" ? "bg-green-600 text-white border-green-600 shadow-sm" : "bg-green-50 text-green-700 border-green-100 hover:bg-green-100/50"}`}
        >
          On Route ({fleet.filter(f => f.status === "On Route").length})
        </button>
        <button
          onClick={() => setFilterTab("Available")}
          className={`px-4 py-2 rounded-xl border transition shrink-0 ${filterTab === "Available" ? "bg-blue-600 text-white border-blue-600 shadow-sm" : "bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100/50"}`}
        >
          Available ({fleet.filter(f => f.status === "Available").length})
        </button>
        <button
          onClick={() => setFilterTab("Under Maintenance")}
          className={`px-4 py-2 rounded-xl border transition shrink-0 ${filterTab === "Under Maintenance" ? "bg-red-600 text-white border-red-600 shadow-sm" : "bg-red-50 text-red-700 border-red-100 hover:bg-red-100/50"}`}
        >
          Maintenance ({fleet.filter(f => f.status === "Under Maintenance").length})
        </button>
      </div>

      {loading ? (
        <Spinner size="lg" className="py-20" />
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition-all duration-300">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600">Vehicle ID</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600">Driver</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600">Route</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600">Zone</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600">Status</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600">Load</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600">Last Service</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredFleet.map((vehicle, idx) => (
                  <tr key={vehicle.vehicleId + idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900">{vehicle.vehicleId}</td>
                    <td className="px-6 py-4 text-slate-700">{vehicle.driver}</td>
                    <td className="px-6 py-4 text-slate-700">{vehicle.route}</td>
                    <td className="px-6 py-4 text-slate-700">{vehicle.zone}</td>
                    <td className="px-6 py-4"><StatusBadge status={vehicle.status} /></td>
                    <td className="px-6 py-4 w-32"><ProgressBar load={vehicle.load} /></td>
                    <td className="px-6 py-4 text-sm text-slate-600">{formatDate(vehicle.lastService)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-slate-50 px-6 py-4">
        <p className="text-sm text-slate-600 font-medium">
          Showing <span className="font-semibold text-emerald-850">{filteredFleet.length}</span> of <span className="font-semibold text-emerald-850">{fleet.length}</span> vehicles in fleet
        </p>
      </div>
    </section>
  );
}
