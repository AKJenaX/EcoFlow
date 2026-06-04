# EcoFlow - Smart Waste Management Dashboard

A modern, responsive dashboard for intelligent waste management and collection operations. Built with React, Vite, and real-time data visualization.

## Features

- 📊 **Interactive Dashboards** - Real-time KPI cards and metrics tracking
- 🗺️ **Smart Bin Mapping** - React Leaflet integration with color-coded bin status
- 📈 **Advanced Analytics** - Monthly trends and waste category breakdowns with Recharts
- 🚛 **Fleet Management** - Vehicle tracking and route optimization insights
- 📱 **Fully Responsive** - Mobile-first design with collapsible sidebar navigation
- 🎨 **Modern UI** - Clean, accessible interface with smooth animations
- 🌱 **Green Theme** - Sustainable design with nature-inspired color palette

## Tech Stack

[![React](https://img.shields.io/badge/React-19.0-61dafb?style=flat-square&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-Latest-646cff?style=flat-square&logo=vite)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-Latest-38b2ac?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![Recharts](https://img.shields.io/badge/Recharts-Latest-8884d8?style=flat-square)](https://recharts.org)
[![Leaflet](https://img.shields.io/badge/Leaflet-Latest-1EB1AD?style=flat-square&logo=leaflet)](https://leafletjs.com)

- **Frontend Framework**: React 19 with Hooks
- **Build Tool**: Vite 5+
- **Styling**: Tailwind CSS
- **Charting**: Recharts
- **Mapping**: React Leaflet + Leaflet
- **Icons**: Lucide React
- **Routing**: React Router 7

## Setup Instructions

### Prerequisites
- Node.js 18+
- npm 9+

### Installation

1. **Clone and navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://127.0.0.1:3002`

4. **Build for production**
   ```bash
   npm run build
   ```

5. **Preview production build**
   ```bash
   npm run preview
   ```

## Project Structure

```
frontend/
├── src/
│   ├── pages/              # Page components
│   │   ├── Dashboard.jsx   # KPI cards, charts, alerts
│   │   ├── Bins.jsx        # Interactive map with sidebar list
│   │   ├── Fleet.jsx       # Vehicle assignments table
│   │   ├── Routes.jsx      # Route management
│   │   ├── Reports.jsx     # Analytics and export
│   │   └── MapPage.jsx     # Smart bin coverage map
│   ├── layouts/
│   │   └── MainLayout.jsx  # Responsive layout with sidebar
│   ├── widgets/            # Reusable components
│   │   ├── StatCard.jsx
│   │   ├── BinMap.jsx
│   │   ├── MetricCard.jsx
│   │   ├── RouteChart.jsx
│   │   └── Spinner.jsx     # Loading spinner
│   ├── data/
│   │   ├── mockData.js     # Mock data for development
│   │   └── operations.js   # Sample operations data
│   ├── styles/
│   │   └── styles.css      # Global styles with animations
│   └── main.jsx            # Entry point with routing
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## Key Features Details

### Dashboard (`/dashboard`)
- 4 stat cards: Total Bins, Active Collections, Avg Fill Level, Alerts Today
- Weekly waste collection line chart
- Waste type breakdown pie chart
- Recent alerts table with color-coded status badges

### Bins Management (`/bins`)
- Interactive map centered on Bengaluru
- 10 color-coded bin markers (green/orange/red by fill level)
- Filterable sidebar list with search functionality
- Visual fill level progress bars

### Fleet Management (`/fleet`)
- Vehicle assignments with driver and route information
- Live status tracking
- Load percentage display

### Reports (`/reports`)
- Date range selector for custom reporting
- Monthly collection volume area chart
- Waste category distribution pie chart
- Collection logs table with export CSV functionality

## Design System

### Color Palette
- **Primary**: #1a3a2a (Dark Green - Sidebar)
- **Accent**: #84cc16 (Lime Green - Highlights)
- **Background**: #f1f5f9 (Slate 100)
- **Text**: #0f172a (Slate 950)

### Responsive Breakpoints
- **Mobile**: < 768px (Hamburger menu, single column)
- **Tablet**: 768px - 1024px (Sidebar visible, adjusted padding)
- **Desktop**: > 1024px (Full layout)

### Animation
- Page fade-in: 300ms ease-in-out
- Sidebar transition: 300ms transform
- Smooth interactive states: 200ms

## Component Highlights

### Interactive Maps
- React Leaflet with OpenStreetMap tiles
- Real-time marker updates
- Popup information displays

### Data Visualization
- Recharts line, area, and pie charts
- Interactive tooltips
- Responsive container sizing

### Responsive UI
- Mobile-first design approach
- Collapsible sidebar on small screens
- Touch-friendly interactive elements

## Performance Features
- Code splitting with React Router
- Lazy loading for page components
- Optimized re-renders with useCallback/useMemo
- Lightweight animations with CSS transitions

## Contributing

1. Create a feature branch
2. Make your changes
3. Test responsiveness across breakpoints
4. Submit a pull request

## Future Enhancements

- Real-time WebSocket updates
- Advanced filtering and search
- User authentication and roles
- PDF report generation
- Mobile app version
- Dark mode toggle

## License

MIT License - See LICENSE file for details

## Screenshots

### Dashboard
![Dashboard](./docs/screenshots/dashboard.png)

### Bins Management
![Bins Map](./docs/screenshots/bins-map.png)

### Reports Analytics
![Reports](./docs/screenshots/reports.png)

---

**Built with ♻️ for sustainable waste management**
