import { useState, useEffect } from "react";
import { fleetData as mockFleet, fleetSummary as mockSummary } from "../data/mockData";
import { getDrivers, getVehicles } from "../services/api.js";
import StatCard from "../widgets/StatCard.jsx";
import Spinner from "../widgets/Spinner.jsx";

const StatusBadge = ({ status }) => {
  const statusConfig = {
    "On Route": "bg-green-100 text-green-800",
    Available: "bg-blue-100 text-blue-800",
    "Under Maintenance": "bg-red-100 text-red-800"
  };
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusConfig[status] || "bg-slate-100 text-slate-800"}`}>
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
      <div className="h-full bg-[#84cc16] transition-all duration-300" style={{ width: `${load}%` }} />
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
      } catch (err) {
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

  return (
    <section className="fade-in space-y-6">
      <div>
        <p className="text-sm font-medium text-slate-600">Fleet Management</p>
        <h1 className="mt-1 text-3xl font-bold text-[#1a3a2a]">Vehicle Assignments</h1>
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

      {loading ? (
        <Spinner size="lg" className="py-20" />
      ) : (
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
                {fleet.map((vehicle, idx) => (
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

      <div className="rounded-lg border border-slate-200 bg-slate-50 px-6 py-4">
        <p className="text-sm text-slate-600">
          Showing <span className="font-semibold">{fleet.length}</span> vehicles in fleet
        </p>
      </div>
    </section>
  );
}
