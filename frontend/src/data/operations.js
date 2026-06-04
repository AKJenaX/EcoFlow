export const metrics = [
  { label: "Active bins", value: "128", change: "+8 today", tone: "emerald" },
  { label: "Open alerts", value: "14", change: "3 critical", tone: "rose" },
  { label: "Routes live", value: "9", change: "2 optimized", tone: "sky" },
  { label: "Collection rate", value: "87%", change: "+5%", tone: "amber" }
];

export const fillTrend = [
  { day: "Mon", fill: 62, pickups: 18 },
  { day: "Tue", fill: 68, pickups: 21 },
  { day: "Wed", fill: 74, pickups: 25 },
  { day: "Thu", fill: 70, pickups: 22 },
  { day: "Fri", fill: 79, pickups: 28 },
  { day: "Sat", fill: 65, pickups: 19 },
  { day: "Sun", fill: 58, pickups: 16 }
];

export const bins = [
  { id: "BIN-104", name: "Market Road", status: "Critical", fill: 94, lat: 20.2961, lng: 85.8245 },
  { id: "BIN-118", name: "Station Square", status: "Warning", fill: 78, lat: 20.2648, lng: 85.8436 },
  { id: "BIN-122", name: "Tech Park", status: "Healthy", fill: 46, lat: 20.3417, lng: 85.8079 },
  { id: "BIN-136", name: "Lake View", status: "Warning", fill: 72, lat: 20.3099, lng: 85.8131 }
];

export const fleet = [
  { id: "TRK-01", driver: "Ravi Kumar", route: "North Loop", load: 68, status: "On route" },
  { id: "TRK-04", driver: "Mina Das", route: "Market Sweep", load: 83, status: "Collecting" },
  { id: "TRK-07", driver: "Akash Sen", route: "Lake Sector", load: 41, status: "Available" }
];

export const activity = [
  "Critical alert raised at Market Road",
  "Route North Loop optimized",
  "TRK-04 completed 12 pickups",
  "Station Square bin moved to warning"
];
