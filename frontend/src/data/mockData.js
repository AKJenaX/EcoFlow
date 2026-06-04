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

// Routes data - Collection routes with zone coverage
export const routesData = [
  {
    routeId: "Route-A1",
    zone: "Koramangala",
    driver: "Rajesh Kumar",
    vehicle: "KA-01-AB-2045",
    stops: 24,
    status: "Completed",
    startTime: "06:00 AM",
    progress: 100,
    binStops: [
      { binId: "BIN-101", area: "Koramangala Main", fillLevel: 42 },
      { binId: "BIN-102", area: "Koramangala Cross", fillLevel: 58 },
      { binId: "BIN-103", area: "Koramangala Market", fillLevel: 75 },
      { binId: "BIN-104", area: "Koramangala Square", fillLevel: 94 }
    ]
  },
  {
    routeId: "Route-A2",
    zone: "Indiranagar",
    driver: "Priya Singh",
    vehicle: "KA-01-CD-3156",
    stops: 28,
    status: "In Progress",
    startTime: "06:15 AM",
    progress: 62,
    binStops: [
      { binId: "BIN-107", area: "Indiranagar 100ft Road", fillLevel: 28 },
      { binId: "BIN-108", area: "Indiranagar 12th Main", fillLevel: 45 },
      { binId: "BIN-109", area: "Indiranagar IT Park", fillLevel: 67 },
      { binId: "BIN-110", area: "Indiranagar Cafe Zone", fillLevel: 52 }
    ]
  },
  {
    routeId: "Route-B1",
    zone: "Whitefield",
    driver: "Arun Patel",
    vehicle: "KA-01-EF-4267",
    stops: 26,
    status: "Completed",
    startTime: "05:45 AM",
    progress: 100,
    binStops: [
      { binId: "BIN-111", area: "Whitefield Tech Park", fillLevel: 67 },
      { binId: "BIN-112", area: "Whitefield Residential", fillLevel: 34 },
      { binId: "BIN-113", area: "Whitefield Main Road", fillLevel: 81 },
      { binId: "BIN-114", area: "Whitefield Commercial", fillLevel: 48 }
    ]
  },
  {
    routeId: "Route-B2",
    zone: "HSR Layout",
    driver: "Meera Gupta",
    vehicle: "KA-01-GH-5378",
    stops: 22,
    status: "In Progress",
    startTime: "06:30 AM",
    progress: 45,
    binStops: [
      { binId: "BIN-115", area: "HSR Layout 1st Block", fillLevel: 51 },
      { binId: "BIN-116", area: "HSR Layout 2nd Block", fillLevel: 39 },
      { binId: "BIN-117", area: "HSR Layout Market", fillLevel: 72 },
      { binId: "BIN-118", area: "HSR Layout Main Gate", fillLevel: 78 }
    ]
  },
  {
    routeId: "Route-C1",
    zone: "Jayanagar",
    driver: "Vikram Reddy",
    vehicle: "KA-01-IJ-6489",
    stops: 20,
    status: "Scheduled",
    startTime: "07:00 AM",
    progress: 0,
    binStops: [
      { binId: "BIN-119", area: "Jayanagar 1st Block", fillLevel: 42 },
      { binId: "BIN-120", area: "Jayanagar 4th Block", fillLevel: 55 },
      { binId: "BIN-121", area: "Jayanagar Market", fillLevel: 68 },
      { binId: "BIN-122", area: "Jayanagar South", fillLevel: 46 }
    ]
  },
  {
    routeId: "Route-C2",
    zone: "Marathahalli",
    driver: "Sanjana Desai",
    vehicle: "KA-01-KL-7590",
    stops: 25,
    status: "Completed",
    startTime: "05:50 AM",
    progress: 100,
    binStops: [
      { binId: "BIN-123", area: "Marathahalli Bridge", fillLevel: 61 },
      { binId: "BIN-124", area: "Marathahalli Signal", fillLevel: 37 },
      { binId: "BIN-125", area: "Marathahalli IT Zone", fillLevel: 74 },
      { binId: "BIN-126", area: "Marathahalli Lake View", fillLevel: 49 }
    ]
  },
  {
    routeId: "Route-D1",
    zone: "Yelahanka",
    driver: "Mahesh Sharma",
    vehicle: "KA-01-MN-8601",
    stops: 23,
    status: "In Progress",
    startTime: "06:20 AM",
    progress: 58,
    binStops: [
      { binId: "BIN-127", area: "Yelahanka Old Town", fillLevel: 44 },
      { binId: "BIN-128", area: "Yelahanka New Town", fillLevel: 62 },
      { binId: "BIN-129", area: "Yelahanka Market", fillLevel: 79 },
      { binId: "BIN-130", area: "Yelahanka Industrial", fillLevel: 55 }
    ]
  },
  {
    routeId: "Route-D2",
    zone: "BTM Layout",
    driver: "Divya Nair",
    vehicle: "KA-01-OP-9712",
    stops: 21,
    status: "Scheduled",
    startTime: "07:15 AM",
    progress: 0,
    binStops: [
      { binId: "BIN-131", area: "BTM 1st Stage", fillLevel: 38 },
      { binId: "BIN-132", area: "BTM 2nd Stage", fillLevel: 53 },
      { binId: "BIN-133", area: "BTM Market Circle", fillLevel: 71 },
      { binId: "BIN-134", area: "BTM Park View", fillLevel: 45 }
    ]
  }
];

// Routes summary stats
export const routesSummary = {
  totalRoutes: 8,
  activeToday: 6,
  completedThisWeek: 28
};

// Fleet vehicles data
export const fleetData = [
  {
    vehicleId: "KA-01-AB-2045",
    driver: "Rajesh Kumar",
    route: "Route-A1",
    zone: "Koramangala",
    status: "On Route",
    load: 68,
    lastService: "2024-05-15"
  },
  {
    vehicleId: "KA-01-CD-3156",
    driver: "Priya Singh",
    route: "Route-A2",
    zone: "Indiranagar",
    status: "On Route",
    load: 45,
    lastService: "2024-05-18"
  },
  {
    vehicleId: "KA-01-EF-4267",
    driver: "Arun Patel",
    route: "Route-B1",
    zone: "Whitefield",
    status: "Available",
    load: 22,
    lastService: "2024-05-12"
  },
  {
    vehicleId: "KA-01-GH-5378",
    driver: "Meera Gupta",
    route: "Route-B2",
    zone: "HSR Layout",
    status: "On Route",
    load: 56,
    lastService: "2024-05-20"
  },
  {
    vehicleId: "KA-01-IJ-6489",
    driver: "Vikram Reddy",
    route: "-",
    zone: "-",
    status: "Under Maintenance",
    load: 0,
    lastService: "2024-06-04"
  },
  {
    vehicleId: "KA-01-KL-7590",
    driver: "Sanjana Desai",
    route: "Route-C2",
    zone: "Marathahalli",
    status: "On Route",
    load: 71,
    lastService: "2024-05-17"
  },
  {
    vehicleId: "KA-01-MN-8601",
    driver: "Mahesh Sharma",
    route: "Route-D1",
    zone: "Yelahanka",
    status: "On Route",
    load: 52,
    lastService: "2024-05-19"
  },
  {
    vehicleId: "KA-01-OP-9712",
    driver: "Divya Nair",
    route: "-",
    zone: "-",
    status: "Available",
    load: 15,
    lastService: "2024-05-10"
  }
];

// Fleet summary stats
export const fleetSummary = {
  totalVehicles: 8,
  onRoute: 5,
  available: 2,
  underMaintenance: 1
};

// Route paths with coordinates for mapping
export const routePaths = [
  {
    routeId: "Route-A1",
    zone: "Koramangala",
    status: "Completed",
    path: [
      [12.9352, 77.6245],
      [12.9380, 77.6210],
      [12.9410, 77.6180],
      [12.9440, 77.6150]
    ]
  },
  {
    routeId: "Route-A2",
    zone: "Indiranagar",
    status: "In Progress",
    path: [
      [13.0011, 77.6394],
      [13.0040, 77.6360],
      [13.0070, 77.6330],
      [13.0100, 77.6300]
    ]
  },
  {
    routeId: "Route-B1",
    zone: "Whitefield",
    status: "Completed",
    path: [
      [12.9698, 77.7499],
      [12.9720, 77.7480],
      [12.9750, 77.7450],
      [12.9780, 77.7420]
    ]
  },
  {
    routeId: "Route-B2",
    zone: "HSR Layout",
    status: "In Progress",
    path: [
      [12.9789, 77.5905],
      [12.9810, 77.5880],
      [12.9840, 77.5850],
      [12.9870, 77.5820]
    ]
  },
  {
    routeId: "Route-C1",
    zone: "Jayanagar",
    status: "Scheduled",
    path: [
      [13.0285, 77.6706],
      [13.0310, 77.6680],
      [13.0340, 77.6650],
      [13.0370, 77.6620]
    ]
  },
  {
    routeId: "Route-C2",
    zone: "Marathahalli",
    status: "Completed",
    path: [
      [13.0051, 77.5507],
      [13.0080, 77.5480],
      [13.0110, 77.5450],
      [13.0140, 77.5420]
    ]
  },
  {
    routeId: "Route-D1",
    zone: "Yelahanka",
    status: "In Progress",
    path: [
      [12.9469, 77.6138],
      [12.9490, 77.6110],
      [12.9520, 77.6080],
      [12.9550, 77.6050]
    ]
  },
  {
    routeId: "Route-D2",
    zone: "BTM Layout",
    status: "Scheduled",
    path: [
      [12.9277, 77.5465],
      [12.9300, 77.5440],
      [12.9330, 77.5410],
      [12.9360, 77.5380]
    ]
  }
];
