import { useState, useEffect } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { AlertCircle, TrendingUp, Zap, Trash2, Radio } from "lucide-react";
import {
  weeklyCollectionData, wasteTypeData,
  recentAlerts as mockAlerts, dashboardStats
} from "../data/mockData.js";
import { getIncidents, getPickupRequests, updatePickupRequest } from "../services/api.js";
import { onMessage } from "../services/socket.js";
import StatCard from "../widgets/StatCard.jsx";
import Spinner from "../widgets/Spinner.jsx";

function AlertBadge({ status }) {
  const statusStyles = {
    Critical: "bg-red-100 text-red-800",
    Warning: "bg-yellow-100 text-yellow-800",
    Healthy: "bg-emerald-100 text-emerald-800",
    Open: "bg-red-100 text-red-800",
    Resolved: "bg-emerald-100 text-emerald-800",
    Pending: "bg-yellow-100 text-yellow-800"
  };
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[status] || "bg-slate-100 text-slate-800"}`}>
      {status}
    </span>
  );
}

function mapIncident(inc) {
  return {
    id: inc.Incident_ID || inc.id || "INC-??",
    location: inc.Location || inc.location || "-",
    fillPercentage: parseInt(inc.fill_pct || inc.fillPercentage || 0),
    status: inc.Status || inc.status || "Open",
    timestamp: inc.Reported_At || inc.timestamp || "-"
  };
}

export default function Dashboard() {
  const [alerts, setAlerts] = useState(mockAlerts);
  const [alertsLoading, setAlertsLoading] = useState(true);
  const [alertsError, setAlertsError] = useState("");
  const [wsConnected, setWsConnected] = useState(false);
  const [pickupRequests, setPickupRequests] = useState([]);
  const [pickupLoading, setPickupLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState(null);

  // Initial HTTP fetch on mount
  useEffect(() => {
    let cancelled = false;
    async function fetchIncidents() {
      try {
        const data = await getIncidents();
        const list = Array.isArray(data) ? data : data.data || [];
        if (!cancelled && list.length > 0) {
          setAlerts(list.map(mapIncident));
        }
      } catch (err) {
        if (!cancelled) setAlertsError("API unavailable — showing mock data.");
      } finally {
        if (!cancelled) setAlertsLoading(false);
      }
    }
    fetchIncidents();
    return () => { cancelled = true; };
  }, []);

  // WebSocket live updates — replace or prepend updated alerts
  useEffect(() => {
    const unsubscribe = onMessage((msg) => {
      if (msg.type === "ALERT_UPDATE" || msg.type === "BIN_UPDATE") {
        setWsConnected(true);
        const updated = mapIncident(msg.data);
        setAlerts((prev) => {
          const idx = prev.findIndex((a) => a.id === updated.id);
          if (idx !== -1) {
            const next = [...prev];
            next[idx] = updated;
            return next;
          }
          return [updated, ...prev].slice(0, 50);
        });
      }
    });
    return unsubscribe;
  }, []);

  // Fetch pending pickup requests
  useEffect(() => {
    let cancelled = false;
    async function fetchPickups() {
      try {
        const data = await getPickupRequests("pending");
        if (!cancelled) setPickupRequests(Array.isArray(data) ? data : []);
      } catch {
        // silently ignore — feature may not have migration run yet
      } finally {
        if (!cancelled) setPickupLoading(false);
      }
    }
    fetchPickups();
    return () => { cancelled = true; };
  }, []);

  const handleConfirmPickup = async (id) => {
    setConfirmingId(id);
    try {
      await updatePickupRequest(id, { status: "confirmed" });
      setPickupRequests((prev) => prev.filter((r) => r.Request_ID !== id));
    } catch {
      alert("Failed to confirm pickup request.");
    } finally {
      setConfirmingId(null);
    }
  };

  const fillPercentageColor = (fill) => {
    if (fill >= 80) return "text-red-600 font-semibold";
    if (fill >= 60) return "text-yellow-600 font-semibold";
    return "text-emerald-600 font-semibold";
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">Overview</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Dashboard</h1>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Trash2} label="Total Bins" value={dashboardStats.totalBins} bgColor="bg-blue-500" />
        <StatCard icon={TrendingUp} label="Active Collections" value={dashboardStats.activeCollections} bgColor="bg-emerald-600" />
        <StatCard icon={Zap} label="Avg Fill Level" value={dashboardStats.avgFillLevel} unit="%" bgColor="bg-amber-500" />
        <StatCard icon={AlertCircle} label="Alerts Today" value={dashboardStats.alertsToday} bgColor="bg-red-500" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Weekly Collections</h2>
          <p className="mt-1 text-sm text-slate-600">Waste collected over the past 7 days</p>
          <div className="mt-6">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyCollectionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "0.5rem" }} />
                <Legend />
                <Line type="monotone" dataKey="collections" stroke="#84cc16" strokeWidth={3} dot={{ fill: "#84cc16", r: 5 }} activeDot={{ r: 7 }} />
                <Line type="monotone" dataKey="tons" stroke="#1a3a2a" strokeWidth={3} dot={{ fill: "#1a3a2a", r: 5 }} activeDot={{ r: 7 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Waste Breakdown</h2>
          <p className="mt-1 text-sm text-slate-600">Distribution by waste type</p>
          <div className="mt-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={wasteTypeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "0.5rem" }} />
                <Bar dataKey="value" fill="#84cc16" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-slate-900">Recent Alerts</h2>
          {wsConnected && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
              <Radio size={11} className="animate-pulse" /> Live
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-slate-600">Latest bin status updates across the network</p>
        {alertsError && (
          <div className="mt-3 rounded-lg bg-yellow-50 border border-yellow-200 px-4 py-2 text-xs text-yellow-700">{alertsError}</div>
        )}
        <div className="mt-6 overflow-x-auto">
          {alertsLoading ? (
            <Spinner size="md" className="py-12" />
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="px-4 py-3 font-semibold text-slate-700">ID</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Location</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Fill %</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Status</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Time</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((alert, idx) => (
                  <tr key={alert.id + idx} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-slate-900">{alert.id}</td>
                    <td className="px-4 py-3 text-slate-700">{alert.location}</td>
                    <td className={`px-4 py-3 ${fillPercentageColor(alert.fillPercentage)}`}>{alert.fillPercentage}%</td>
                    <td className="px-4 py-3"><AlertBadge status={alert.status} /></td>
                    <td className="px-4 py-3 text-slate-500">{alert.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {/* Pickup Requests Panel */}
      {(!pickupLoading && pickupRequests.length > 0) && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-amber-900">Pending Pickup Requests</h2>
              <p className="mt-0.5 text-sm text-amber-700">{pickupRequests.length} request{pickupRequests.length !== 1 ? "s" : ""} awaiting confirmation</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-amber-200">
                  <th className="px-4 py-2 font-semibold text-amber-800">Bin ID</th>
                  <th className="px-4 py-2 font-semibold text-amber-800">Location</th>
                  <th className="px-4 py-2 font-semibold text-amber-800">Requested By</th>
                  <th className="px-4 py-2 font-semibold text-amber-800">Date</th>
                  <th className="px-4 py-2 font-semibold text-amber-800">Notes</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {pickupRequests.map((req) => (
                  <tr key={req.Request_ID} className="border-b border-amber-100 hover:bg-amber-100/50">
                    <td className="px-4 py-3 font-semibold text-slate-900">{req.Bin_ID}</td>
                    <td className="px-4 py-3 text-slate-700">{req.bin_location || "-"}</td>
                    <td className="px-4 py-3 text-slate-700">{req.Requested_By}</td>
                    <td className="px-4 py-3 text-slate-700">{req.Scheduled_Date?.split("T")[0] || req.Scheduled_Date}</td>
                    <td className="px-4 py-3 text-slate-500 max-w-xs truncate">{req.Notes || "-"}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleConfirmPickup(req.Request_ID)}
                        disabled={confirmingId === req.Request_ID}
                        className="rounded-lg bg-[#1a3a2a] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#2d5a40] disabled:opacity-50"
                      >
                        {confirmingId === req.Request_ID ? "Confirming…" : "Confirm"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
