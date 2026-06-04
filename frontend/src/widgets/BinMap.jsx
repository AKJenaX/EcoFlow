import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import { bins } from "../data/operations.js";

function colorFor(status) {
  if (status === "Critical") return "#e11d48";
  if (status === "Warning") return "#f59e0b";
  return "#059669";
}

export default function BinMap() {
  return (
    <div className="h-[520px] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <MapContainer center={[20.2961, 85.8245]} zoom={12} scrollWheelZoom={false}>
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {bins.map((bin) => (
          <CircleMarker
            key={bin.id}
            center={[bin.lat, bin.lng]}
            radius={12}
            pathOptions={{ color: colorFor(bin.status), fillColor: colorFor(bin.status), fillOpacity: 0.75 }}
          >
            <Popup>
              <strong>{bin.name}</strong>
              <br />
              {bin.id} - {bin.fill}% full
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
