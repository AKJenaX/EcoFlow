import "leaflet/dist/leaflet.css";
import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon } from "leaflet";
import { Search, CalendarPlus, X, TrendingUp } from "lucide-react";
import { binMarkers as mockBins } from "../data/mockData.js";
import { getBins, createPickupRequest, getBinPrediction } from "../services/api.js";
import Spinner from "../widgets/Spinner.jsx";

// ── Fill Prediction Panel ─────────────────────────────────────────────────────
function PredictionPanel({ binId }) {
  const [pred, setPred] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setPred(null);
    getBinPrediction(binId)
      .then((data) => { if (!cancelled) setPred(data); })
      .catch(() => { if (!cancelled) setPred({ error: 'unavailable' }); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [binId]);

  const confidenceColors = {
    high: "bg-emerald-100 text-emerald-700",
    medium: "bg-amber-100 text-amber-700",
    low: "bg-red-100 text-red-700"
  };

  if (loading) return <p className="mt-2 text-xs text-slate-400 animate-pulse">Loading prediction…</p>;
  if (!pred || pred.error) {
    return (
      <p className="mt-2 text-xs text-slate-400 italic">
        {pred?.error === 'insufficient data' ? 'Not enough history yet' : 'Prediction unavailable'}
      </p>
    );
  }
  if (pred.note) return <p className="mt-2 text-xs text-slate-400 italic">Fill rate flat — no prediction</p>;

  return (
    <div className="mt-2 flex items-center gap-2">
      <TrendingUp size={13} className="text-slate-500 shrink-0" />
      <span className="text-xs text-slate-600">Full in ~<strong>{pred.hoursUntilFull}h</strong></span>
      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${confidenceColors[pred.confidence] || 'bg-slate-100 text-slate-600'}`}>
        {pred.confidence}
      </span>
    </div>
  );
}

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
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

const getFillColor = (fillPercentage) => {
  if (fillPercentage >= 80) return "bg-red-50 border-l-4 border-red-500";
  if (fillPercentage >= 50) return "bg-yellow-50 border-l-4 border-yellow-500";
  return "bg-emerald-50 border-l-4 border-emerald-500";
};

const getStatusColor = (fillPercentage) => {
  if (fillPercentage >= 80) return "text-red-700 font-semibold";
  if (fillPercentage >= 50) return "text-yellow-700 font-semibold";
  return "text-emerald-700 font-semibold";
};

function mapApiBin(apiBin) {
  return {
    id: apiBin.Bin_ID || apiBin.id || "Unknown",
    area: apiBin.Assigned_Location || apiBin.area || "Unknown",
    lat: parseFloat(apiBin.gps_lat || apiBin.lat || 12.9716),
    lng: parseFloat(apiBin.gps_lng || apiBin.lng || 77.5946),
    fillPercentage: parseInt(apiBin.fill_pct || apiBin.fillPercentage || 0),
    capacity: apiBin.Capacity || "-",
    gsm: apiBin.GSM_Number || "-",
    lastCollected: apiBin.lastCollected || "-"
  };
}

// ── Schedule Pickup Modal ─────────────────────────────────────────────────────
function SchedulePickupModal({ bin, onClose, onSuccess }) {
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date) { setError("Please select a scheduled date."); return; }
    setSubmitting(true);
    setError("");
    try {
      await createPickupRequest({ binId: bin.id, scheduledDate: date, notes });
      onSuccess();
    } catch (err) {
      setError("Failed to schedule pickup. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          <X size={18} />
        </button>

        <div className="mb-5">
          <h2 className="text-lg font-semibold text-[#1a3a2a]">Schedule Pickup</h2>
          <p className="mt-1 text-sm text-slate-500">Bin {bin.id} — {bin.area}</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="pickup-bin-id" className="block text-sm font-medium text-slate-700 mb-1">
              Bin ID
            </label>
            <input
              id="pickup-bin-id"
              type="text"
              value={bin.id}
              readOnly
              className="w-full rounded-lg border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm text-slate-600"
            />
          </div>

          <div>
            <label htmlFor="pickup-date" className="block text-sm font-medium text-slate-700 mb-1">
              Scheduled Date <span className="text-red-500">*</span>
            </label>
            <input
              id="pickup-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              required
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            />
          </div>

          <div>
            <label htmlFor="pickup-notes" className="block text-sm font-medium text-slate-700 mb-1">
              Notes
            </label>
            <textarea
              id="pickup-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Optional — describe any special instructions"
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-lg bg-[#84cc16] px-4 py-2.5 text-sm font-semibold text-[#1a3a2a] shadow-md hover:bg-[#65a30d] disabled:opacity-50"
            >
              {submitting ? "Scheduling…" : "Schedule Pickup"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Bins Page ────────────────────────────────────────────────────────────
export default function Bins() {
  const [searchQuery, setSearchQuery] = useState("");
  const [bins, setBins] = useState(mockBins);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedBin, setSelectedBin] = useState(null);
  const [toastMsg, setToastMsg] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function fetchBins() {
      try {
        const data = await getBins();
        const list = Array.isArray(data) ? data : data.data || [];
        if (!cancelled && list.length > 0) {
          setBins(list.map(mapApiBin));
        }
      } catch (err) {
        if (!cancelled) setError("API unavailable — showing mock data.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchBins();
    return () => { cancelled = true; };
  }, []);

  const filteredBins = bins.filter((bin) =>
    bin.area.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleScheduleSuccess = () => {
    setSelectedBin(null);
    setToastMsg("Pickup scheduled successfully!");
    setTimeout(() => setToastMsg(""), 3500);
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">Network</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Bins</h1>
      </header>

      {error && (
        <div className="rounded-lg bg-yellow-50 border border-yellow-200 px-4 py-3 text-sm text-yellow-700">{error}</div>
      )}

      {toastMsg && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700 font-medium">
          ✓ {toastMsg}
        </div>
      )}

      {loading ? (
        <Spinner size="lg" className="py-20" />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px] h-[600px] overflow-hidden rounded-lg border border-slate-200 shadow-sm">
          <div className="overflow-hidden rounded-lg bg-slate-100">
            <MapContainer center={[12.9716, 77.5946]} zoom={12} style={{ height: "100%", width: "100%" }} className="z-0">
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
              {filteredBins.map((bin) => (
                <Marker key={bin.id} position={[bin.lat, bin.lng]} icon={createMarkerIcon(bin.fillPercentage)}>
                  <Popup>
                    <div className="space-y-2 text-sm">
                      <p className="font-semibold text-slate-900">{bin.id}</p>
                      <div className="space-y-1">
                        <p className="text-slate-600"><strong>Area:</strong> {bin.area}</p>
                        <p className={getStatusColor(bin.fillPercentage)}><strong>Fill:</strong> {bin.fillPercentage}%</p>
                        {bin.capacity !== "-" && <p className="text-slate-600"><strong>Capacity:</strong> {bin.capacity}L</p>}
                        {bin.gsm !== "-" && <p className="text-slate-600"><strong>GSM:</strong> {bin.gsm}</p>}
                        <p className="text-slate-600"><strong>Last Collected:</strong> {bin.lastCollected}</p>
                      </div>
                      <button
                        onClick={() => setSelectedBin(bin)}
                        className="mt-1 w-full rounded bg-[#84cc16] px-3 py-1.5 text-xs font-semibold text-[#1a3a2a] hover:bg-[#65a30d]"
                      >
                        Schedule Pickup
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          <div className="flex flex-col bg-white">
            <div className="border-b border-slate-200 p-4">
              <div className="relative">
                <input type="text" placeholder="Search area..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 py-2 pl-9 pr-3 text-sm placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200" />
                <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="space-y-2 p-4">
                {filteredBins.length > 0 ? filteredBins.map((bin) => (
                  <div key={bin.id} className={`rounded p-3 cursor-pointer ${getFillColor(bin.fillPercentage)} ${selectedBin?.id === bin.id ? 'ring-2 ring-offset-1 ring-emerald-500' : ''}`}
                    onClick={() => setSelectedBin(bin)}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900">{bin.id}</p>
                        <p className="text-xs text-slate-600">{bin.area}</p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedBin(bin); }}
                        title="Schedule Pickup"
                        className="ml-2 rounded-full p-1 text-slate-400 hover:bg-white hover:text-emerald-700"
                      >
                        <CalendarPlus size={16} />
                      </button>
                    </div>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600">Fill Level:</span>
                        <span className={getStatusColor(bin.fillPercentage)}>{bin.fillPercentage}%</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                        <div className={`h-full transition-all ${bin.fillPercentage >= 80 ? "bg-red-500" : bin.fillPercentage >= 50 ? "bg-yellow-500" : "bg-emerald-500"}`} style={{ width: `${bin.fillPercentage}%` }} />
                      </div>
                      <p className="text-xs text-slate-500">{bin.lastCollected}</p>
                      <PredictionPanel binId={bin.id} />
                    </div>
                  </div>
                )) : (
                  <div className="flex items-center justify-center py-8 text-center">
                    <p className="text-sm text-slate-500">No bins found</p>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
              <p>Showing {filteredBins.length} of {bins.length} bins</p>
            </div>
          </div>
        </div>
      )}

      {selectedBin && (
        <SchedulePickupModal
          bin={selectedBin}
          onClose={() => setSelectedBin(null)}
          onSuccess={handleScheduleSuccess}
        />
      )}
    </div>
  );
}
