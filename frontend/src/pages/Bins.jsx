import "leaflet/dist/leaflet.css";
import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon } from "leaflet";
import { Search } from "lucide-react";
import { binMarkers } from "../data/mockData.js";

// Create custom marker icons for different fill levels
const createMarkerIcon = (fillPercentage) => {
  let color;
  if (fillPercentage >= 80) {
    color = "red";
  } else if (fillPercentage >= 50) {
    color = "orange";
  } else {
    color = "green";
  }

  return new Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

// Color styles for list items
const getFillColor = (fillPercentage) => {
  if (fillPercentage >= 80) {
    return "bg-red-50 border-l-4 border-red-500";
  } else if (fillPercentage >= 50) {
    return "bg-yellow-50 border-l-4 border-yellow-500";
  } else {
    return "bg-emerald-50 border-l-4 border-emerald-500";
  }
};

const getStatusColor = (fillPercentage) => {
  if (fillPercentage >= 80) {
    return "text-red-700 font-semibold";
  } else if (fillPercentage >= 50) {
    return "text-yellow-700 font-semibold";
  } else {
    return "text-emerald-700 font-semibold";
  }
};

export default function Bins() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBins = binMarkers.filter((bin) =>
    bin.area.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
          Network
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Bins</h1>
      </header>

      {/* Map and Sidebar Container */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px] h-[600px] overflow-hidden rounded-lg border border-slate-200 shadow-sm">
        {/* Map */}
        <div className="overflow-hidden rounded-lg bg-slate-100">
          <MapContainer
            center={[12.9716, 77.5946]}
            zoom={12}
            style={{ height: "100%", width: "100%" }}
            className="z-0"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {binMarkers.map((bin) => (
              <Marker
                key={bin.id}
                position={[bin.lat, bin.lng]}
                icon={createMarkerIcon(bin.fillPercentage)}
              >
                <Popup>
                  <div className="space-y-2 text-sm">
                    <p className="font-semibold text-slate-900">{bin.id}</p>
                    <div className="space-y-1">
                      <p className="text-slate-600">
                        <strong>Area:</strong> {bin.area}
                      </p>
                      <p className={getStatusColor(bin.fillPercentage)}>
                        <strong>Fill:</strong> {bin.fillPercentage}%
                      </p>
                      <p className="text-slate-600">
                        <strong>Last Collected:</strong> {bin.lastCollected}
                      </p>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col bg-white">
          {/* Search Input */}
          <div className="border-b border-slate-200 p-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search area..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 py-2 pl-9 pr-3 text-sm placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              />
              <Search
                size={16}
                className="absolute left-3 top-2.5 text-slate-400"
              />
            </div>
          </div>

          {/* Bins List */}
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-2 p-4">
              {filteredBins.length > 0 ? (
                filteredBins.map((bin) => (
                  <div
                    key={bin.id}
                    className={`rounded p-3 ${getFillColor(bin.fillPercentage)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900">
                          {bin.id}
                        </p>
                        <p className="text-xs text-slate-600">{bin.area}</p>
                      </div>
                    </div>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600">Fill Level:</span>
                        <span className={getStatusColor(bin.fillPercentage)}>
                          {bin.fillPercentage}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                        <div
                          className={`h-full transition-all ${
                            bin.fillPercentage >= 80
                              ? "bg-red-500"
                              : bin.fillPercentage >= 50
                                ? "bg-yellow-500"
                                : "bg-emerald-500"
                          }`}
                          style={{
                            width: `${bin.fillPercentage}%`
                          }}
                        />
                      </div>
                      <p className="text-xs text-slate-500">
                        {bin.lastCollected}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center py-8 text-center">
                  <p className="text-sm text-slate-500">No bins found</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer Stats */}
          <div className="border-t border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
            <p>
              Showing {filteredBins.length} of {binMarkers.length} bins
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
