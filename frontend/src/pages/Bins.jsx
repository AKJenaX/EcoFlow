import "leaflet/dist/leaflet.css";
import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon } from "leaflet";
import { Search, CalendarPlus, X, TrendingUp, Plus } from "lucide-react";
import { binMarkers as mockBins } from "../data/mockData.js";
import { getBins, createPickupRequest, getBinPrediction, getVehicles, getAuthorities, addBin } from "../services/api.js";
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
    high: "bg-emerald-50 border border-emerald-200 text-emerald-700",
    medium: "bg-amber-50 border border-amber-200 text-amber-700",
    low: "bg-red-50 border border-red-200 text-red-700"
  };

  if (loading) return <p className="mt-2 text-xs text-slate-400 animate-pulse font-medium">Loading prediction…</p>;
  if (!pred || pred.error) {
    return (
      <p className="mt-2 text-xs text-slate-400 italic">
        {pred?.error === 'insufficient data' ? 'Not enough history yet' : 'Prediction unavailable'}
      </p>
    );
  }
  if (pred.note) return <p className="mt-2 text-xs text-slate-400 italic">Fill rate flat — no prediction</p>;

  return (
    <div className="mt-2.5 flex items-center gap-2 border-t border-slate-100 pt-2">
      <TrendingUp size={13} className="text-slate-500 shrink-0" />
      <span className="text-xs text-slate-600 font-medium">Full in ~<strong>{pred.hoursUntilFull}h</strong></span>
      <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${confidenceColors[pred.confidence] || 'bg-slate-50 border-slate-200 text-slate-600'}`}>
        {pred.confidence}
      </span>
    </div>
  );
}

const createMarkerIcon = (fillPercentage) => {
  let color;
  if (fillPercentage >= 90) {
    color = "red";
  } else if (fillPercentage >= 75) {
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
  if (fillPercentage >= 90) return "bg-red-50 border-l-4 border-red-500";
  if (fillPercentage >= 75) return "bg-yellow-50 border-l-4 border-yellow-500";
  return "bg-emerald-50 border-l-4 border-emerald-500";
};

const getStatusColor = (fillPercentage) => {
  if (fillPercentage >= 90) return "text-red-700 font-semibold";
  if (fillPercentage >= 75) return "text-yellow-700 font-semibold";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xl hover:shadow-3xl transition-all duration-300">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
        >
          <X size={18} />
        </button>

        <div className="mb-5">
          <h2 className="text-lg font-bold text-[#1a3a2a]">Schedule Pickup</h2>
          <p className="mt-1 text-sm text-slate-500 font-medium">Bin {bin.id} — {bin.area}</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="pickup-bin-id" className="block text-sm font-semibold text-slate-700 mb-1">
              Bin ID
            </label>
            <input
              id="pickup-bin-id"
              type="text"
              value={bin.id}
              readOnly
              className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm text-slate-600 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="pickup-date" className="block text-sm font-semibold text-slate-700 mb-1">
              Scheduled Date <span className="text-red-500">*</span>
            </label>
            <input
              id="pickup-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              required
              className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-4 py-2.5 text-sm focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-200/50 transition duration-200 shadow-sm"
            />
          </div>

          <div>
            <label htmlFor="pickup-notes" className="block text-sm font-semibold text-slate-700 mb-1">
              Notes
            </label>
            <textarea
              id="pickup-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Optional — describe any special instructions"
              className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-4 py-2.5 text-sm focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-200/50 transition duration-200 shadow-sm resize-none"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-xl bg-[#84cc16] px-4 py-2.5 text-sm font-bold text-[#1a3a2a] shadow-md hover:bg-[#72b012] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 transform disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Scheduling…" : "Schedule Pickup"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Add Bin Modal ─────────────────────────────────────────────────────────────
function AddBinModal({ onClose, onSuccess }) {
  const [capacity, setCapacity] = useState(1000);
  const [gsmNumber, setGsmNumber] = useState("+919876543210");
  const [installationDate, setInstallationDate] = useState(new Date().toISOString().split("T")[0]);
  const [assignedLocation, setAssignedLocation] = useState("Koramangala");
  const [vehicleId, setVehicleId] = useState("");
  const [authorityId, setAuthorityId] = useState("");

  const [vehicles, setVehicles] = useState([]);
  const [authorities, setAuthorities] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function loadOptions() {
      try {
        const [vData, aData] = await Promise.all([getVehicles(), getAuthorities()]);
        if (!cancelled) {
          setVehicles(Array.isArray(vData) ? vData : vData.data || []);
          setAuthorities(Array.isArray(aData) ? aData : aData.data || []);
        }
      } catch (err) {
        console.error("Failed to load options for add bin modal:", err);
      } finally {
        if (!cancelled) setLoadingOptions(false);
      }
    }
    loadOptions();
    return () => { cancelled = true; };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await addBin({
        Capacity: Number(capacity),
        GSM_Number: gsmNumber,
        Installation_Date: installationDate,
        Assigned_Location: assignedLocation,
        Vehicle_ID: vehicleId ? Number(vehicleId) : null,
        Authority_ID: authorityId ? Number(authorityId) : null
      });
      onSuccess();
    } catch (err) {
      setError("Failed to add bin. Please check your role permissions.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xl hover:shadow-3xl transition-all duration-300">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
        >
          <X size={18} />
        </button>

        <div className="mb-5">
          <h2 className="text-lg font-bold text-[#1a3a2a]">Add New Smart Bin</h2>
          <p className="mt-1 text-sm text-slate-500 font-medium">Configure installation settings and assignments</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {loadingOptions ? (
          <p className="text-center text-sm text-slate-500 py-6">Loading options...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
            <div>
              <label htmlFor="bin-capacity" className="block text-sm font-semibold text-slate-700 mb-1">Capacity (Liters) *</label>
              <input
                id="bin-capacity"
                type="number"
                required
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-4 py-2 text-sm focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-200/50 transition duration-200 shadow-sm"
              />
            </div>

            <div>
              <label htmlFor="bin-gsm" className="block text-sm font-semibold text-slate-700 mb-1">GSM Number *</label>
              <input
                id="bin-gsm"
                type="text"
                required
                value={gsmNumber}
                onChange={(e) => setGsmNumber(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-4 py-2 text-sm focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-200/50 transition duration-200 shadow-sm"
              />
            </div>

            <div>
              <label htmlFor="bin-installation" className="block text-sm font-semibold text-slate-700 mb-1">Installation Date *</label>
              <input
                id="bin-installation"
                type="date"
                required
                value={installationDate}
                onChange={(e) => setInstallationDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-4 py-2 text-sm focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-200/50 transition duration-200 shadow-sm"
              />
            </div>

            <div>
              <label htmlFor="bin-location" className="block text-sm font-semibold text-slate-700 mb-1">Assigned Location *</label>
              <select
                id="bin-location"
                value={assignedLocation}
                onChange={(e) => setAssignedLocation(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-4 py-2.5 text-sm focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-200/50 transition duration-200 shadow-sm"
              >
                <option value="Koramangala">Koramangala</option>
                <option value="Market Road">Market Road</option>
                <option value="Indiranagar">Indiranagar</option>
                <option value="Whitefield">Whitefield</option>
                <option value="Central Depot">Central Depot</option>
                <option value="West Substation 2">West Substation 2</option>
                <option value="Maintenance Dept">Maintenance Dept</option>
                <option value="Inspection Unit 1">Inspection Unit 1</option>
                <option value="Inspection Unit 2">Inspection Unit 2</option>
                <option value="South Zone">South Zone</option>
                <option value="Central Logistics">Central Logistics</option>
              </select>
            </div>

            <div>
              <label htmlFor="bin-vehicle" className="block text-sm font-semibold text-slate-700 mb-1">Assigned Vehicle</label>
              <select
                id="bin-vehicle"
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-4 py-2.5 text-sm focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-200/50 transition duration-200 shadow-sm"
              >
                <option value="">Unassigned</option>
                {vehicles.map((v) => (
                  <option key={v.Vehicle_ID} value={v.Vehicle_ID}>
                    {v.Vehicle_Number} ({v.Vehicle_Type})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="bin-authority" className="block text-sm font-semibold text-slate-700 mb-1">Assigned Officer / Authority</label>
              <select
                id="bin-authority"
                value={authorityId}
                onChange={(e) => setAuthorityId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-4 py-2.5 text-sm focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-200/50 transition duration-200 shadow-sm"
              >
                <option value="">Unassigned</option>
                {authorities.map((a) => (
                  <option key={a.Authority_ID} value={a.Authority_ID}>
                    {a.Name} ({a.Designation})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 rounded-xl bg-[#84cc16] px-4 py-2.5 text-sm font-bold text-[#1a3a2a] shadow-md hover:bg-[#72b012] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 transform disabled:opacity-50"
              >
                {submitting ? "Adding…" : "Add Bin"}
              </button>
            </div>
          </form>
        )}
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
  const [showAddBin, setShowAddBin] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [filterTab, setFilterTab] = useState("all"); // "all" | "critical" | "warning" | "healthy"

  const fetchBins = async () => {
    try {
      const data = await getBins();
      const list = Array.isArray(data) ? data : data.data || [];
      if (list.length > 0) {
        setBins(list.map(mapApiBin));
      }
    } catch (err) {
      setError("API unavailable — showing mock data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBins();
  }, []);

  const filteredBins = bins.filter((bin) => {
    const matchesSearch = bin.area.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (filterTab === "critical") return bin.fillPercentage >= 80;
    if (filterTab === "warning") return bin.fillPercentage >= 60 && bin.fillPercentage < 80;
    if (filterTab === "healthy") return bin.fillPercentage < 60;
    return true;
  });

  const handleScheduleSuccess = () => {
    setSelectedBin(null);
    setToastMsg("Pickup scheduled successfully!");
    setTimeout(() => setToastMsg(""), 3500);
  };

  const handleAddBinSuccess = () => {
    setShowAddBin(false);
    setToastMsg("New smart bin installed successfully!");
    setTimeout(() => setToastMsg(""), 3500);
    fetchBins();
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">Network</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Bins</h1>
        </div>
        <button
          onClick={() => setShowAddBin(true)}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#1a3a2a] px-4 py-2.5 text-sm font-bold text-white shadow-md hover:shadow-lg hover:bg-[#2d5a40] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 transform shrink-0 font-medium"
        >
          <Plus size={16} />
          Add New Bin
        </button>
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
        <div className="grid gap-6 lg:grid-cols-[1fr_320px] h-[600px] overflow-hidden rounded-xl border border-slate-200 shadow-md">
          <div className="overflow-hidden rounded-l-xl bg-slate-100">
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

          <div className="flex flex-col bg-white rounded-r-xl">
            <div className="border-b border-slate-200 p-4 space-y-3">
              <div className="relative">
                <input type="text" placeholder="Search area..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50/50 py-2 pl-9 pr-3 text-sm placeholder-slate-400 focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-200/50 transition duration-200 shadow-sm" />
                <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
              </div>
              <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none text-[10px] font-bold uppercase tracking-wider">
                <button
                  onClick={() => setFilterTab("all")}
                  className={`px-2 py-1 rounded-lg border transition shrink-0 ${filterTab === "all" ? "bg-[#1a3a2a] text-white border-[#1a3a2a]" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterTab("critical")}
                  className={`px-2 py-1 rounded-lg border transition shrink-0 ${filterTab === "critical" ? "bg-red-600 text-white border-red-600" : "bg-red-50 text-red-700 border-red-100 hover:bg-red-100/50"}`}
                >
                  &ge;80%
                </button>
                <button
                  onClick={() => setFilterTab("warning")}
                  className={`px-2 py-1 rounded-lg border transition shrink-0 ${filterTab === "warning" ? "bg-yellow-500 text-white border-yellow-500" : "bg-yellow-50 text-yellow-750 border-yellow-100 hover:bg-yellow-100/50"}`}
                >
                  60-80%
                </button>
                <button
                  onClick={() => setFilterTab("healthy")}
                  className={`px-2 py-1 rounded-lg border transition shrink-0 ${filterTab === "healthy" ? "bg-emerald-600 text-white border-emerald-600" : "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100/50"}`}
                >
                  &lt;60%
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="space-y-2 p-4">
                {filteredBins.length > 0 ? filteredBins.map((bin) => (
                  <div key={bin.id} className={`rounded-xl p-3.5 cursor-pointer shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5 ${getFillColor(bin.fillPercentage)} ${selectedBin?.id === bin.id ? 'ring-2 ring-offset-1 ring-emerald-500' : ''}`}
                    onClick={() => setSelectedBin(bin)}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900">{bin.id}</p>
                        <p className="text-xs text-slate-600 font-medium">{bin.area}</p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedBin(bin); }}
                        title="Schedule Pickup"
                        className="ml-2 rounded-full p-1.5 text-slate-400 hover:bg-white hover:text-emerald-700 transition"
                      >
                        <CalendarPlus size={16} />
                      </button>
                    </div>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600 font-medium">Fill Level:</span>
                        <span className={getStatusColor(bin.fillPercentage)}>{bin.fillPercentage}%</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                        <div className={`h-full transition-all ${bin.fillPercentage >= 90 ? "bg-red-500" : bin.fillPercentage >= 75 ? "bg-yellow-500" : "bg-emerald-500"}`} style={{ width: `${bin.fillPercentage}%` }} />
                      </div>
                      <p className="text-[11px] text-slate-500">{bin.lastCollected}</p>
                      <PredictionPanel binId={bin.id} />
                    </div>
                  </div>
                )) : (
                  <div className="flex items-center justify-center py-8 text-center">
                    <p className="text-sm text-slate-500 font-medium">No bins found</p>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 rounded-br-xl">
              <p className="font-medium">Showing {filteredBins.length} of {bins.length} bins</p>
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

      {showAddBin && (
        <AddBinModal
          onClose={() => setShowAddBin(false)}
          onSuccess={handleAddBinSuccess}
        />
      )}
    </div>
  );
}
