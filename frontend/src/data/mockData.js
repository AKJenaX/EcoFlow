// Weekly waste collection data (7 days)
export const weeklyCollectionData = [
  { day: "Mon", collections: 24, tons: 3.2 },
  { day: "Tue", collections: 32, tons: 4.1 },
  { day: "Wed", collections: 28, tons: 3.8 },
  { day: "Thu", collections: 35, tons: 4.5 },
  { day: "Fri", collections: 38, tons: 5.2 },
  { day: "Sat", collections: 42, tons: 5.8 },
  { day: "Sun", collections: 28, tons: 3.9 }
];

// Waste type breakdown
export const wasteTypeData = [
  { name: "Organic", value: 45, fill: "#84cc16" },
  { name: "Plastic", value: 28, fill: "#22c55e" },
  { name: "Paper", value: 18, fill: "#16a34a" },
  { name: "Metal", value: 9, fill: "#15803d" }
];

// Recent alerts
export const recentAlerts = [
  {
    id: "BIN-104",
    location: "Market Road",
    fillPercentage: 94,
    status: "Critical",
    timestamp: "2 mins ago"
  },
  {
    id: "BIN-118",
    location: "Station Square",
    fillPercentage: 78,
    status: "Warning",
    timestamp: "15 mins ago"
  },
  {
    id: "BIN-122",
    location: "Tech Park",
    fillPercentage: 46,
    status: "Healthy",
    timestamp: "1 hour ago"
  },
  {
    id: "BIN-136",
    location: "Lake View",
    fillPercentage: 72,
    status: "Warning",
    timestamp: "1 hour ago"
  },
  {
    id: "BIN-145",
    location: "Central Mall",
    fillPercentage: 88,
    status: "Warning",
    timestamp: "2 hours ago"
  },
  {
    id: "BIN-167",
    location: "Park Avenue",
    fillPercentage: 32,
    status: "Healthy",
    timestamp: "3 hours ago"
  }
];

// Dashboard stats
export const dashboardStats = {
  totalBins: 156,
  activeCollections: 12,
  avgFillLevel: 62,
  alertsToday: 18
};

// Mock bin markers for map - Bengaluru coordinates
export const binMarkers = [
  {
    id: "BIN-101",
    area: "Koramangala",
    lat: 12.9352,
    lng: 77.6245,
    fillPercentage: 42,
    lastCollected: "2 hours ago"
  },
  {
    id: "BIN-104",
    area: "Market Road",
    lat: 12.9716,
    lng: 77.5946,
    fillPercentage: 94,
    lastCollected: "5 hours ago"
  },
  {
    id: "BIN-107",
    area: "Indiranagar",
    lat: 13.0011,
    lng: 77.6394,
    fillPercentage: 28,
    lastCollected: "1 hour ago"
  },
  {
    id: "BIN-110",
    area: "Whitefield",
    lat: 12.9698,
    lng: 77.7499,
    fillPercentage: 67,
    lastCollected: "3 hours ago"
  },
  {
    id: "BIN-118",
    area: "Station Square",
    lat: 12.9789,
    lng: 77.5905,
    fillPercentage: 78,
    lastCollected: "4 hours ago"
  },
  {
    id: "BIN-122",
    area: "Tech Park",
    lat: 13.0285,
    lng: 77.6706,
    fillPercentage: 46,
    lastCollected: "45 mins ago"
  },
  {
    id: "BIN-136",
    area: "Lake View",
    lat: 13.0051,
    lng: 77.5507,
    fillPercentage: 72,
    lastCollected: "6 hours ago"
  },
  {
    id: "BIN-145",
    area: "Central Mall",
    lat: 12.9716,
    lng: 77.6245,
    fillPercentage: 88,
    lastCollected: "7 hours ago"
  },
  {
    id: "BIN-156",
    area: "Park Avenue",
    lat: 12.9469,
    lng: 77.6138,
    fillPercentage: 32,
    lastCollected: "30 mins ago"
  },
  {
    id: "BIN-167",
    area: "Marina District",
    lat: 13.0277,
    lng: 77.5465,
    fillPercentage: 55,
    lastCollected: "2 hours ago"
  }
];

// Monthly collection volume data (12 months)
export const monthlyCollectionData = [
  { month: "Jan", volume: 1240, activeCollections: 84 },
  { month: "Feb", volume: 1180, activeCollections: 79 },
  { month: "Mar", volume: 1450, activeCollections: 92 },
  { month: "Apr", volume: 1620, activeCollections: 105 },
  { month: "May", volume: 1780, activeCollections: 118 },
  { month: "Jun", volume: 1920, activeCollections: 128 },
  { month: "Jul", volume: 2050, activeCollections: 135 },
  { month: "Aug", volume: 1950, activeCollections: 130 },
  { month: "Sep", volume: 1840, activeCollections: 122 },
  { month: "Oct", volume: 1680, activeCollections: 110 },
  { month: "Nov", volume: 1520, activeCollections: 98 },
  { month: "Dec", volume: 1350, activeCollections: 89 }
];

// Waste category distribution
export const wasteCategoryData = [
  { name: "Organic", value: 45 },
  { name: "Plastic", value: 28 },
  { name: "Paper", value: 18 },
  { name: "Metal", value: 9 }
];

// Collection logs data
export const collectionLogs = [
  {
    date: "2024-06-04",
    route: "Route-A1",
    binsCollected: 24,
    totalWeight: 285.5,
    status: "Completed"
  },
  {
    date: "2024-06-04",
    route: "Route-B2",
    binsCollected: 18,
    totalWeight: 215.3,
    status: "Completed"
  },
  {
    date: "2024-06-04",
    route: "Route-C3",
    binsCollected: 22,
    totalWeight: 268.7,
    status: "In Progress"
  },
  {
    date: "2024-06-03",
    route: "Route-A1",
    binsCollected: 26,
    totalWeight: 310.2,
    status: "Completed"
  },
  {
    date: "2024-06-03",
    route: "Route-D4",
    binsCollected: 20,
    totalWeight: 245.8,
    status: "Completed"
  },
  {
    date: "2024-06-02",
    route: "Route-B2",
    binsCollected: 24,
    totalWeight: 290.4,
    status: "Completed"
  },
  {
    date: "2024-06-02",
    route: "Route-E5",
    binsCollected: 19,
    totalWeight: 228.6,
    status: "Completed"
  },
  {
    date: "2024-06-01",
    route: "Route-C3",
    binsCollected: 25,
    totalWeight: 305.9,
    status: "Completed"
  },
  {
    date: "2024-06-01",
    route: "Route-A1",
    binsCollected: 23,
    totalWeight: 275.1,
    status: "Completed"
  },
  {
    date: "2024-05-31",
    route: "Route-D4",
    binsCollected: 21,
    totalWeight: 252.3,
    status: "Completed"
  }
];
