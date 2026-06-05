import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import { binMarkers, routePaths } from "../data/mockData";
import "leaflet/dist/leaflet.css";
import { Navigation, Loader2 } from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Create custom bin markers with fill-based colors
const createBinMarker = (fillPercentage) => {
  let color;
  if (fillPercentage > 80) {
    color = "#ef4444"; // red
  } else if (fillPercentage > 50) {
    color = "#eab308"; // yellow
  } else {
    color = "#22c55e"; // green
  }

  return new L.Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="32" height="32">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-13c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5z"/>
      </svg>
    `)}`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
    className: "drop-shadow-lg"
  });
};

const optimizedMarker = new L.Icon({
  iconUrl: `data:image/svg+xml;base64,${btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#7c3aed" width="36" height="36">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  `)}`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36]
});

// Create route line colors based on status
const getRouteColor = (status) => {
  switch (status) {
    case "Completed": return "#22c55e";
    case "In Progress": return "#eab308";
    case "Scheduled": return "#94a3b8";
    default: return "#84cc16";
  }
};

export default function MapPage() {
  const bengaluruCenter = [12.9716, 77.5946];
  const [optimizedRoute, setOptimizedRoute] = useState(null);
  const [optimizeLoading, setOptimizeLoading] = useState(false);
  const [optimizeError, setOptimizeError] = useState("");

  const handleOptimize = async () => {
    setOptimizeLoading(true);
    setOptimizeError("");
    setOptimizedRoute(null);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${BASE_URL}/api/routes/optimize?threshold=60`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setOptimizedRoute(data);
    } catch (err) {
      setOptimizeError("Could not load optimized route. " + err.message);
    } finally {
      setOptimizeLoading(false);
    }
  };

  const optimizedPositions =
    optimizedRoute?.route?.map((b) => [Number(b.lat), Number(b.lng)]) || [];

  return (
    <section className="fade-in space-y-4 h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600">Operations</p>
          <h1 className="mt-1 text-3xl font-bold text-[#1a3a2a]">Smart Bin Coverage</h1>
        </div>
        <button
          onClick={handleOptimize}
          disabled={optimizeLoading}
          id="optimize-route-btn"
          className="inline-flex items-center gap-2 rounded-lg bg-[#1a3a2a] px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#2d5a40] disabled:opacity-60"
        >
          {optimizeLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Navigation size={16} />
          )}
          Optimize Route
        </button>
      </div>

      {optimizeError && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">
          {optimizeError}
        </div>
      )}

      {/* Map Container */}
      <div className="flex-1 rounded-lg border border-slate-200 shadow-sm overflow-hidden relative">
        <MapContainer
          center={bengaluruCenter}
          zoom={12}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />

          {/* Route Paths (mock) */}
          {routePaths.map((route) => (
            <Polyline
              key={route.routeId}
              positions={route.path}
              color={getRouteColor(route.status)}
              weight={3}
              opacity={0.7}
              dashArray={route.status === "Scheduled" ? "5, 5" : ""}
            />
          ))}

          {/* Optimized route polyline */}
          {optimizedPositions.length > 1 && (
            <Polyline
              positions={optimizedPositions}
              color="#7c3aed"
              weight={4}
              opacity={0.85}
              dashArray="8, 4"
            />
          )}

          {/* Optimized bin markers */}
          {optimizedRoute?.route?.map((bin, idx) => (
            <Marker
              key={`opt-${bin.id}`}
              position={[Number(bin.lat), Number(bin.lng)]}
              icon={optimizedMarker}
            >
              <Popup>
                <div className="space-y-1 text-sm">
                  <p className="font-semibold text-purple-700">Stop #{idx + 1}</p>
                  <p className="text-slate-700">{bin.area || bin.id}</p>
                  <p className="text-slate-600">Fill: <strong>{bin.fillLevel}%</strong></p>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Regular Bin Markers (when no optimized route) */}
          {!optimizedRoute && binMarkers.map((bin) => (
            <Marker
              key={bin.id}
              position={[bin.lat, bin.lng]}
              icon={createBinMarker(bin.fillPercentage)}
            >
              <Popup>
                <div className="space-y-2 text-sm">
                  <p className="font-semibold text-slate-900">{bin.id}</p>
                  <p className="text-slate-700">{bin.area}</p>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-600">Fill Level:</span>
                    <span className="font-medium text-slate-900">{bin.fillPercentage}%</span>
                  </div>
                  <div className="h-2 w-32 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className={`h-full ${bin.fillPercentage > 80 ? "bg-red-500" : bin.fillPercentage > 50 ? "bg-yellow-500" : "bg-green-500"}`}
                      style={{ width: `${bin.fillPercentage}%` }}
                    />
                  </div>
                  <p className="text-slate-500 text-xs">Last collected: {bin.lastCollected}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 rounded-lg border border-slate-200 bg-white p-4 shadow-lg z-[400] max-w-xs">
          <h3 className="font-semibold text-slate-900 mb-3">Legend</h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold text-slate-600 mb-2">Bin Fill Level</p>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  <span className="text-xs text-slate-700">&lt; 50% (Low)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-yellow-500" />
                  <span className="text-xs text-slate-700">50–80% (Medium)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <span className="text-xs text-slate-700">&gt; 80% (Critical)</span>
                </div>
              </div>
            </div>
            {optimizedRoute && (
              <div className="border-t border-slate-200 pt-3">
                <p className="text-xs font-semibold text-purple-700 mb-1">Optimized Route</p>
                <div className="flex items-center gap-2">
                  <div className="h-1 w-6 bg-purple-600 rounded" style={{ backgroundImage: "repeating-linear-gradient(90deg,#7c3aed 0,#7c3aed 8px,transparent 8px,transparent 12px)" }} />
                  <span className="text-xs text-slate-700">{optimizedRoute.binCount} stops · {optimizedRoute.totalDistanceKm} km</span>
                </div>
              </div>
            )}
            <div className="border-t border-slate-200 pt-3">
              <p className="text-xs font-semibold text-slate-600 mb-2">Route Status</p>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2"><div className="h-1 w-4 bg-green-500" /><span className="text-xs text-slate-700">Completed</span></div>
                <div className="flex items-center gap-2"><div className="h-1 w-4 bg-yellow-500" /><span className="text-xs text-slate-700">In Progress</span></div>
                <div className="flex items-center gap-2"><div className="h-1 w-4 border-2 border-slate-400" style={{ backgroundImage: "repeating-linear-gradient(90deg, #94a3b8 0px, #94a3b8 5px, transparent 5px, transparent 10px)" }} /><span className="text-xs text-slate-700">Scheduled</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Footer */}
      <div className="rounded-lg border border-slate-200 bg-slate-50 px-6 py-3">
        {optimizedRoute ? (
          <p className="text-sm text-slate-700">
            Optimized route: <span className="font-semibold text-purple-700">{optimizedRoute.binCount} bins</span> above {optimizedRoute.fillThreshold}% fill ·{" "}
            <span className="font-semibold">{optimizedRoute.totalDistanceKm} km</span> total distance
            {" "}· <button onClick={() => setOptimizedRoute(null)} className="text-slate-500 underline hover:text-slate-700 text-xs">Clear</button>
          </p>
        ) : (
          <p className="text-sm text-slate-600">
            Showing <span className="font-semibold">{binMarkers.length}</span> bins and{" "}
            <span className="font-semibold">{routePaths.length}</span> active routes across Bengaluru
          </p>
        )}
      </div>
    </section>
  );
}
