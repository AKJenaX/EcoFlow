import React, { useState } from "react";
import { Plus, ChevronDown, ChevronUp } from "lucide-react";
import { routesData, routesSummary } from "../data/mockData";
import StatCard from "../widgets/StatCard.jsx";


const StatusBadge = ({ status }) => {
  const statusConfig = {
    Completed: "bg-green-50 border-green-200 text-green-700",
    "In Progress": "bg-yellow-50 border-yellow-200 text-yellow-700",
    Scheduled: "bg-slate-50 border-slate-200 text-slate-700"
  };

  return (
    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-bold ${statusConfig[status]}`}>
      {status}
    </span>
  );
};

const ProgressBar = ({ progress }) => (
  <div className="w-full">
    <div className="mb-1 flex items-center justify-between">
      <span className="text-xs font-semibold text-slate-600">{progress}%</span>
    </div>
    <div className="h-2 w-full rounded-full bg-slate-100 border border-slate-200/50 overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-[#84cc16] to-emerald-500 transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
  </div>
);

export default function RoutesPage() {
  const [expandedRouteId, setExpandedRouteId] = useState(null);

  const toggleExpand = (routeId) => {
    setExpandedRouteId(expandedRouteId === routeId ? null : routeId);
  };

  return (
    <section className="fade-in space-y-6">
      {/* Header with Add Route Button */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600">Operations</p>
          <h1 className="mt-1 text-3xl font-bold text-[#1a3a2a]">Collection Routes</h1>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-[#84cc16] px-4 py-2 text-sm font-bold text-[#1a3a2a] shadow-md transition-all hover:shadow-lg hover:bg-[#72b012] hover:-translate-y-0.5 active:translate-y-0 duration-200 transform">
          <Plus className="h-5 w-5" />
          Add Route
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard label="Total Routes" value={routesSummary.totalRoutes} />
        <StatCard label="Active Today" value={routesSummary.activeToday} />
        <StatCard label="Completed This Week" value={routesSummary.completedThisWeek} />
      </div>

      {/* Routes Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition-all duration-300">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50">
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600">Route ID</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600">Zone</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600">Driver</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600">Vehicle</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600">Stops</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600">Status</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600">Start Time</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600">Progress</th>
                <th className="px-6 py-3.5 text-center text-xs font-semibold text-slate-600">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {routesData.map((route) => (
                <React.Fragment key={route.routeId}>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900">{route.routeId}</td>
                    <td className="px-6 py-4 text-slate-700">{route.zone}</td>
                    <td className="px-6 py-4 text-slate-700">{route.driver}</td>
                    <td className="px-6 py-4 text-sm font-mono text-slate-600">{route.vehicle}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{route.stops}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={route.status} />
                    </td>
                    <td className="px-6 py-4 text-slate-700">{route.startTime}</td>
                    <td className="px-6 py-4 w-32">
                      <ProgressBar progress={route.progress} />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => toggleExpand(route.routeId)}
                        className="text-slate-500 hover:text-slate-700 transition-colors"
                      >
                        {expandedRouteId === route.routeId ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </button>
                    </td>
                  </tr>

                  {/* Expanded Detail Panel */}
                  {expandedRouteId === route.routeId && (
                    <tr className="bg-slate-50 border-l-4 border-l-emerald-600">
                      <td colSpan="9" className="px-6 py-6">
                        <div className="space-y-4">
                          <h3 className="font-semibold text-slate-900">Bin Stops for {route.routeId}</h3>
                          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
                            {route.binStops.map((stop) => (
                              <div
                                key={stop.binId}
                                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-bold text-[#1a3a2a]">{stop.binId}</span>
                                  <span className="text-xs font-semibold text-slate-600">{stop.fillLevel}%</span>
                                </div>
                                <p className="text-sm text-slate-700 mb-3">{stop.area}</p>
                                <div className="h-2 w-full rounded-full bg-slate-100 border border-slate-200/50 overflow-hidden">
                                  <div
                                    className={`h-full transition-all ${
                                      stop.fillLevel > 80
                                        ? "bg-red-500"
                                        : stop.fillLevel > 50
                                        ? "bg-yellow-500"
                                        : "bg-emerald-500"
                                    }`}
                                    style={{ width: `${stop.fillLevel}%` }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Footer */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 px-6 py-4">
        <p className="text-sm text-slate-600 font-medium">
          Showing <span className="font-semibold text-emerald-850">{routesData.length}</span> collection routes
        </p>
      </div>
    </section>
  );
}
