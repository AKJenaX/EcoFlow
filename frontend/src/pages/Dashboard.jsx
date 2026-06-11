import { useState, useEffect } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { AlertCircle, TrendingUp, Zap, Trash2, Radio } from "lucide-react";
import {
  weeklyCollectionData, wasteTypeData,
  recentAlerts as mockAlerts
} from "../data/mockData.js";
import { getIncidents, getPickupRequests, updatePickupRequest, getAnalytics, getBins } from "../services/api.js";
import { onMessage } from "../services/socket.js";
import StatCard from "../widgets/StatCard.jsx";
import Spinner from "../widgets/Spinner.jsx";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

const criticalMarkerIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function AlertBadge({ status }) {
  const statusStyles = {
    Critical: "bg-red-50 text-red-700 border-red-200",
    Warning: "bg-yellow-50 text-yellow-700 border-yellow-200",
    Healthy: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Open: "bg-red-50 text-red-700 border-red-200",
    Resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Pending: "bg-yellow-50 text-yellow-700 border-yellow-200"
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold ${statusStyles[status] || "bg-slate-50 text-slate-700 border-slate-200"}`}>
      {status}
    </span>
  );
}

function mapIncident(inc) {
  const fillPercentage = parseInt(
    inc.fill_pct || 
    inc.fillPercentage || 
    (inc.severity === 'critical' ? 95 : inc.severity === 'warning' ? 80 : 0)
  );

  const derivedStatus = fillPercentage >= 90 ? "Critical" : fillPercentage >= 75 ? "Warning" : "Healthy";
  const rawStatus = inc.Status || inc.status || inc.severity || derivedStatus;
  const status = typeof rawStatus === "string" 
    ? (rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1)) 
    : "Open";

  // ID mapping: backend returns `id` for incident, WS has `Bin_ID`
  const id = inc.id || inc.Incident_ID || (inc.Bin_ID ? `BIN-${inc.Bin_ID}` : "INC-??");

  // Location mapping: derive from bin_id, location, or area
  const location = inc.location || inc.Location || inc.area || (inc.bin_id ? `Bin ${inc.bin_id}` : (inc.Bin_ID ? `Bin ${inc.Bin_ID}` : "-"));

  // Timestamp: use opened_at, created_at, or timestamp
  let timestamp = inc.opened_at || inc.created_at || inc.timestamp || "-";
  if (timestamp && typeof timestamp === "string" && timestamp.includes("T")) {
    try {
      timestamp = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      // fallback
    }
  }

  return {
    id,
    location,
    fillPercentage,
    status,
    timestamp
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
  const [criticalBins, setCriticalBins] = useState([]);

  const [stats, setStats] = useState({
    totalBins: "-",
    activeCollections: "-",
    avgFillLevel: "-",
    alertsToday: "-"
  });

  // Fetch critical bins for dashboard mini-map
  useEffect(() => {
    let cancelled = false;
    async function fetchBins() {
      try {
        const data = await getBins();
        const list = Array.isArray(data) ? data : data.data || [];
        if (!cancelled) {
          const criticals = list
            .map((b) => ({
              id: b.Bin_ID || b.id || "Unknown",
              area: b.Assigned_Location || b.area || "Unknown",
              lat: parseFloat(b.gps_lat || b.lat || 12.9716),
              lng: parseFloat(b.gps_lng || b.lng || 77.5946),
              fillPercentage: parseInt(b.fill_pct || b.fillPercentage || 0)
            }))
            .filter((b) => b.fillPercentage >= 80);
          setCriticalBins(criticals);
        }
      } catch (err) {
        console.error("Failed to fetch bins in dashboard:", err);
      }
    }
    fetchBins();
    return () => { cancelled = true; };
  }, []);

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
      } catch {
        if (!cancelled) setAlertsError("API unavailable — showing mock data.");
      } finally {
        if (!cancelled) setAlertsLoading(false);
      }
    }
    fetchIncidents();
    return () => { cancelled = true; };
  }, []);

  // Fetch KPI stats
  useEffect(() => {
    let cancelled = false;
    async function fetchStats() {
      try {
        const data = await getAnalytics();
        if (!cancelled && data) {
          const total_bins = data.telemetryStats?.total_bins ?? "-";
          const total_incidents = data.incidentStats?.total_incidents ?? 0;
          const avg_fill_pct = data.telemetryStats?.avg_fill_pct 
            ? Math.round(parseFloat(data.telemetryStats.avg_fill_pct)) 
            : 0;
          const critical_incidents = data.incidentStats?.critical_incidents ?? 0;

          setStats({
            totalBins: total_bins,
            activeCollections: total_incidents,
            avgFillLevel: avg_fill_pct,
            alertsToday: critical_incidents
          });
        }
      } catch (err) {
        console.error("Failed to fetch analytics stats:", err);
      }
    }
    fetchStats();
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
        <StatCard icon={Trash2} label="Total Bins" value={stats.totalBins} bgColor="bg-blue-500" />
        <StatCard icon={TrendingUp} label="Active Collections" value={stats.activeCollections} bgColor="bg-emerald-600" />
        <StatCard icon={Zap} label="Avg Fill Level" value={stats.avgFillLevel} unit="%" bgColor="bg-amber-500" />
        <StatCard icon={AlertCircle} label="Alerts Today" value={stats.alertsToday} bgColor="bg-red-500" />
      </div>

      {/* Sustainability & Environmental Impact Tracker */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300">
        <div>
          <h2 className="text-lg font-bold text-[#1a3a2a]">Sustainability & Environmental Impact</h2>
          <p className="text-sm text-slate-500 font-medium mt-0.5">Real-time green operations indicator logs</p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-3 mt-6">
          {/* CO2 Savings */}
          <div className="flex items-center gap-4 bg-emerald-50 border border-emerald-100 p-4 rounded-xl shadow-sm hover:shadow transition-all duration-200">
            <div className="p-3 bg-emerald-500 rounded-xl text-white shadow-inner">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">CO₂ Reduction</span>
              <span className="text-2xl font-black text-emerald-800 tracking-tight">2.4 Tons</span>
              <span className="text-[10px] text-emerald-600 block mt-0.5 font-bold">✓ 14% improvement this week</span>
            </div>
          </div>

          {/* Recycled Weight */}
          <div className="flex items-center gap-4 bg-lime-50 border border-lime-100 p-4 rounded-xl shadow-sm hover:shadow transition-all duration-200">
            <div className="p-3 bg-lime-500 rounded-xl text-[#1a3a2a] shadow-inner">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Recycled Weight</span>
              <span className="text-2xl font-black text-[#1a3a2a] tracking-tight">12.8 Tons</span>
              <span className="text-[10px] text-lime-700 block mt-0.5 font-bold">✓ 38% total waste diverted</span>
            </div>
          </div>

          {/* Landfill Diversion Rate (radial/circle display) */}
          <div className="flex items-center gap-4 bg-[#1a3a2a] text-white p-4 rounded-xl shadow-sm hover:shadow transition-all duration-200">
            <div className="relative flex items-center justify-center w-12 h-12 shrink-0">
              <svg className="w-12 h-12 transform -rotate-90">
                <circle cx="24" cy="24" r="18" className="text-emerald-800" strokeWidth="4" fill="transparent" stroke="currentColor" />
                <circle cx="24" cy="24" r="18" className="text-[#84cc16]" strokeWidth="4" fill="transparent" strokeDasharray="113" strokeDashoffset="25" strokeLinecap="round" stroke="currentColor" />
              </svg>
              <span className="absolute text-[10px] font-extrabold text-white">78%</span>
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider block text-emerald-200/80">Landfill Diversion</span>
              <span className="text-base font-bold tracking-tight block mt-0.5">Eco-friendly Segment</span>
              <span className="text-[9px] text-[#84cc16] block mt-0.5 font-bold">✓ Exceptional efficiency rank</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300">
          <h2 className="text-lg font-semibold text-slate-900">Weekly Collections</h2>
          <p className="mt-1 text-sm text-slate-600">Waste collected over the past 7 days</p>
          <div className="mt-6">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyCollectionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "0.75rem" }} />
                <Legend />
                <Line type="monotone" dataKey="collections" stroke="#84cc16" strokeWidth={3} dot={{ fill: "#84cc16", r: 5 }} activeDot={{ r: 7 }} />
                <Line type="monotone" dataKey="tons" stroke="#1a3a2a" strokeWidth={3} dot={{ fill: "#1a3a2a", r: 5 }} activeDot={{ r: 7 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300">
          <h2 className="text-lg font-semibold text-slate-900">Waste Breakdown</h2>
          <p className="mt-1 text-sm text-slate-600">Distribution by waste type</p>
          <div className="mt-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={wasteTypeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "0.75rem" }} />
                <Bar dataKey="value" fill="#84cc16" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Left Column: Recent Alerts */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-slate-900">Recent Alerts</h2>
            {wsConnected && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
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
                  <tr className="border-b border-slate-200 bg-slate-50/50">
                    <th className="px-4 py-3 font-semibold text-slate-700 rounded-l-lg">ID</th>
                    <th className="px-4 py-3 font-semibold text-slate-700">Location</th>
                    <th className="px-4 py-3 font-semibold text-slate-700">Fill %</th>
                    <th className="px-4 py-3 font-semibold text-slate-700">Status</th>
                    <th className="px-4 py-3 font-semibold text-slate-700 rounded-r-lg">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {alerts.map((alert, idx) => (
                    <tr key={alert.id + idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
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

        {/* Right Column: Mini Critical Map Widget */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-[420px]">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Critical Locations</h2>
            <p className="mt-1 text-xs text-slate-500 font-medium">Map view of bins filled &ge; 80%</p>
          </div>
          <div className="flex-1 mt-4 overflow-hidden rounded-xl bg-slate-100 relative h-full">
            <MapContainer center={[12.9716, 77.5946]} zoom={10} style={{ height: "100%", width: "100%" }} className="z-0">
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
              {criticalBins.map((bin) => (
                <Marker key={bin.id} position={[bin.lat, bin.lng]} icon={criticalMarkerIcon}>
                  <Popup>
                    <div className="space-y-1 text-xs">
                      <p className="font-bold text-slate-900">{bin.id}</p>
                      <p className="text-slate-600"><strong>Area:</strong> {bin.area}</p>
                      <p className="text-red-650 font-bold"><strong>Fill Level:</strong> {bin.fillPercentage}%</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>
      </div>

      {/* Pickup Requests Panel */}
      {(!pickupLoading && pickupRequests.length > 0) && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-6 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-amber-950">Pending Pickup Requests</h2>
              <p className="mt-0.5 text-sm text-amber-800">{pickupRequests.length} request{pickupRequests.length !== 1 ? "s" : ""} awaiting confirmation</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-amber-200 bg-amber-100/50">
                  <th className="px-4 py-3.5 font-semibold text-amber-900 rounded-l-lg">Bin ID</th>
                  <th className="px-4 py-3.5 font-semibold text-amber-900">Location</th>
                  <th className="px-4 py-3.5 font-semibold text-amber-900">Requested By</th>
                  <th className="px-4 py-3.5 font-semibold text-amber-900">Date</th>
                  <th className="px-4 py-3.5 font-semibold text-amber-900">Notes</th>
                  <th className="px-4 py-3.5 rounded-r-lg"></th>
                </tr>
              </thead>
              <tbody>
                {pickupRequests.map((req) => (
                  <tr key={req.Request_ID} className="border-b border-amber-100 hover:bg-amber-100/30 transition-colors">
                    <td className="px-4 py-3.5 font-semibold text-slate-900">{req.Bin_ID}</td>
                    <td className="px-4 py-3.5 text-slate-700">{req.bin_location || "-"}</td>
                    <td className="px-4 py-3.5 text-slate-700">{req.Requested_By}</td>
                    <td className="px-4 py-3.5 text-slate-700">{req.Scheduled_Date?.split("T")[0] || req.Scheduled_Date}</td>
                    <td className="px-4 py-3.5 text-slate-500 max-w-xs truncate">{req.Notes || "-"}</td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => handleConfirmPickup(req.Request_ID)}
                        disabled={confirmingId === req.Request_ID}
                        className="rounded-lg bg-[#1a3a2a] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#2d5a40] hover:-translate-y-0.5 active:translate-y-0 shadow-sm transition-all duration-200 transform disabled:opacity-50 disabled:cursor-not-allowed"
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
