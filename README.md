![CI](https://github.com/AKJenaX/EcoFlow/actions/workflows/ci.yml/badge.svg)

# EcoFlow - Smart Waste Management System

A full-stack smart waste management platform with a React dashboard and Express REST API. Features real-time IoT telemetry, route optimisation, fleet tracking, incident management, and analytics — built for Bengaluru-scale municipal operations.

## Features

- 🔐 **Authentication** - JWT-based login with protected routes and role-based access control
- 📊 **Interactive Dashboard** - Real-time KPI cards, charts, and live incident alerts from the API
- 🗺️ **Smart Bin Mapping** - React Leaflet maps with color-coded bin markers and route polylines
- 🚛 **Fleet Management** - Driver + vehicle data merged from the API with status tracking
- 👮 **Authority Management** - Full CRUD for authority officers (add/edit/delete via API)
- 📈 **Advanced Analytics** - Monthly trends, waste category breakdowns, and collection logs
- 🛣️ **Route Management** - Collection routes with expandable bin-stop details
- 📱 **Fully Responsive** - Mobile-first design with collapsible sidebar navigation
- 🔄 **Offline Fallback** - Graceful mock data fallback when the API is unavailable

## Tech Stack

### Frontend

[![React](https://img.shields.io/badge/React-19.0-61dafb?style=flat-square&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-Latest-646cff?style=flat-square&logo=vite)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-Latest-38b2ac?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![Recharts](https://img.shields.io/badge/Recharts-Latest-8884d8?style=flat-square)](https://recharts.org)
[![Leaflet](https://img.shields.io/badge/Leaflet-Latest-1EB1AD?style=flat-square&logo=leaflet)](https://leafletjs.com)

- **Framework**: React 19 with Hooks
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Charting**: Recharts
- **Mapping**: React Leaflet + Leaflet
- **Icons**: Lucide React
- **Routing**: React Router 7

### Backend

[![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat-square&logo=express)](https://expressjs.com)
[![MySQL](https://img.shields.io/badge/MySQL-8.x-4479A1?style=flat-square&logo=mysql)](https://mysql.com)
[![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=flat-square&logo=jsonwebtokens)](https://jwt.io)

- **Runtime**: Node.js with Express
- **Database**: MySQL
- **Auth**: JWT (Bearer tokens) with bcrypt password hashing
- **Security**: Helmet, CORS, rate limiting
- **Architecture**: Role-based access control with audit logging

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/login` | Authenticate with username + password → returns `{ accessToken }` |
| `POST` | `/auth/register` | Register a new user → returns `{ message, userId }` |
| `GET` | `/authority` | List all authority officers |
| `POST` | `/authority/add` | Add new authority |
| `PUT` | `/authority/update/:id` | Update authority |
| `DELETE` | `/authority/delete/:id` | Delete authority |
| `GET` | `/driver` | List all drivers |
| `GET` | `/vehicle` | List all vehicles |
| `GET` | `/bin` | List all bins |
| `GET` | `/iot` | Live IoT telemetry (fill %, GPS, smoke, tilt) |
| `GET` | `/incidents` | Incidents list |
| `GET` | `/analytics` | Analytics data |
| `GET` | `/anomalies` | Anomaly detection |
| `GET` | `/complaints` | Complaints |

## Setup Instructions

### Prerequisites
- Node.js 18+
- npm 9+
- MySQL 8+

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment** — copy `.env.example` to `.env` and fill in your MySQL credentials and JWT secret.

4. **Start the server**
   ```bash
   node server.js
   ```
   The API will be available at `http://localhost:3000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment** — copy `.env.example` to `.env`:
   ```
   VITE_API_URL=http://localhost:3000
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://127.0.0.1:3001`

5. **Build for production**
   ```bash
   npm run build
   ```

### Default Login

Use the `/register` page to create an account, then log in with your **username** and **password**.

> **Dev Mode**: Set `ALLOW_DEV_AUTH_BYPASS=true` in backend `.env` and log in with any username + password `devpass` to skip the database auth check during development.

## Project Structure

```
ecoflow/
├── backend/
│   ├── routes/               # API route handlers
│   │   ├── auth.js           # Login & token refresh
│   │   ├── iot.js            # IoT telemetry
│   │   ├── incidents.js      # Incident management
│   │   ├── analytics.js      # Analytics queries
│   │   ├── anomalies.js      # Anomaly detection
│   │   ├── complaints.js     # Complaint tracking
│   │   └── ...
│   ├── middleware/
│   │   ├── auth.js           # JWT verification, RBAC
│   │   ├── audit.js          # Audit logging
│   │   └── errorHandler.js   # Global error handler
│   ├── services/
│   │   └── rulesEngine.js    # Business rules engine
│   ├── authority.js          # Authority CRUD
│   ├── driver.js             # Driver CRUD
│   ├── vehicle.js            # Vehicle CRUD
│   ├── bin.js                # Bin CRUD
│   ├── db.js                 # MySQL connection pool
│   ├── server.js             # Express app entry point
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx     # Authentication page
│   │   │   ├── Dashboard.jsx # KPI cards, charts, live incidents
│   │   │   ├── Bins.jsx      # Interactive bin map (API + mock fallback)
│   │   │   ├── Fleet.jsx     # Drivers + vehicles merged view
│   │   │   ├── Authority.jsx # Authority officers CRUD
│   │   │   ├── Routes.jsx    # Collection route management
│   │   │   ├── Reports.jsx   # Analytics and CSV export
│   │   │   └── MapPage.jsx   # Full-page bin coverage map
│   │   ├── services/
│   │   │   └── api.js        # Centralised API client (fetch + Bearer auth)
│   │   ├── layouts/
│   │   │   └── MainLayout.jsx # Sidebar nav + header + logout
│   │   ├── widgets/
│   │   │   ├── StatCard.jsx  # Shared stat card component
│   │   │   ├── Spinner.jsx   # Loading spinner
│   │   │   ├── BinMap.jsx
│   │   │   ├── MetricCard.jsx
│   │   │   └── RouteChart.jsx
│   │   ├── data/
│   │   │   └── mockData.js   # Offline fallback data
│   │   ├── styles.css        # Global styles with animations
│   │   └── main.jsx          # Entry point with ProtectedRoute
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Page Details

### Login (`/login`) & Register (`/register`)
- Username + password authentication via `POST /auth/login`
- New user registration via `POST /auth/register` with bcrypt-hashed passwords
- JWT token stored in localStorage
- Auto-redirects to dashboard on success
- Green-themed UI matching the app

### Dashboard (`/dashboard`)
- 4 stat cards: Total Bins, Active Collections, Avg Fill Level, Alerts Today
- Weekly waste collection line chart
- Waste type breakdown bar chart
- **Live incidents table** fetched from `/incidents` API (falls back to mock data)

### Bins (`/bins`)
- Interactive Leaflet map centered on Bengaluru
- **Live bin data** from `/bin` API with `Bin_ID`, `Assigned_Location`, `Capacity`, `GSM_Number`
- Color-coded markers (green/orange/red by fill level)
- Filterable sidebar list with search

### Fleet (`/fleet`)
- **Drivers + Vehicles merged** from `/driver` and `/vehicle` APIs
- Maps: `Name`, `Address`, `Control_Number`, `Vehicle_Number`, `Vehicle_Type`, `Assigned_Location`
- Status badges and load percentage progress bars

### Authority (`/authority`)
- **Full CRUD** — Add, Edit, Delete authority officers via the API
- Table: Name, Designation, Control Room, Works Under
- Inline form with validation

### Routes (`/routes`)
- 8 collection routes with zone coverage
- Expandable detail panels showing bin stops per route
- Progress bars and status badges (Completed / In Progress / Scheduled)

### Reports (`/reports`)
- Date range selector
- Monthly collection volume area chart
- Waste category distribution pie chart
- Collection logs table with CSV export

### Map (`/map`)
- Full-page React Leaflet map with bin markers and route polylines
- Legend: bin fill levels + route status colours

## Design System

### Color Palette
- **Primary**: `#1a3a2a` (Dark Green — Sidebar)
- **Accent**: `#84cc16` (Lime Green — Buttons, highlights)
- **Background**: `#f1f5f9` (Slate 100)
- **Text**: `#0f172a` (Slate 950)

### Responsive Breakpoints
- **Mobile**: < 768px (Hamburger menu, single column)
- **Tablet**: 768px – 1024px (Sidebar visible, adjusted grid)
- **Desktop**: > 1024px (Full layout)

## Architecture

```
┌─────────────┐     fetch + Bearer token     ┌──────────────┐
│   React UI  │ ──────────────────────────▶  │  Express API │
│  (Vite dev) │ ◀──────────────────────────  │  port 3000   │
│  port 3001  │        JSON responses        │              │
└─────────────┘                              │  MySQL DB    │
      │                                      │  JWT Auth    │
      ▼                                      │  RBAC + Audit│
 Mock fallback                               └──────────────┘
 (mockData.js)
```

## Docker

Run the full stack (backend, frontend, MySQL) with three commands:

```bash
git clone https://github.com/AKJenaX/EcoFlow.git
cd EcoFlow
cp .env.example .env   # fill in your values
docker-compose up --build
```

- **Frontend** → http://localhost (port 80)
- **Backend API** → http://localhost:3000
- **MySQL** → port 3306 (internal, not exposed by default)

> MySQL data is persisted in a named Docker volume (`mysql_data`). Run migrations inside the container with:
> ```bash
> docker-compose exec backend npm run migrate
> docker-compose exec backend npm run seed:rbac
> ```

## Deployment (Railway)

The fastest way to deploy EcoFlow to a live URL is via [Railway](https://railway.app).

### One-command deploy

```bash
npm install -g @railway/cli   # install Railway CLI once
railway login                  # authenticate (browser opens)
railway link                   # link to your Railway project
railway up                     # deploy all services
```

### Setup steps

1. **Provision MySQL** — in the Railway dashboard, add a **MySQL plugin** to your project. Railway will inject `MYSQL_URL` automatically; map it in your service env as `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME`.

2. **Create two services** in Railway pointing to this repo:
   - `backend` — root dir `./backend`, uses `backend/railway.json`
   - `frontend` — root dir `./frontend`, uses `frontend/railway.json`

3. **Set these environment variables** in the Railway dashboard for the `backend` service (copy from `.env.example`):

| Variable | Description |
|---|---|
| `DB_HOST` | Railway MySQL internal hostname |
| `DB_PORT` | `3306` |
| `DB_USER` | Railway MySQL user |
| `DB_PASS` | Railway MySQL password |
| `DB_NAME` | Railway MySQL database name |
| `JWT_SECRET` | Long random string — generate with `openssl rand -base64 32` |
| `ALLOW_DEV_AUTH_BYPASS` | `false` in production |
| `ENABLE_IOT` | `true` |
| `SIMULATE_SENSORS` | `false` in production |
| `PORT` | `3000` |

4. **Set for the `frontend` service:**

| Variable | Description |
|---|---|
| `VITE_API_URL` | The Railway public URL of your backend service (e.g. `https://ecoflow-backend.up.railway.app`) |

5. **Run migrations** via Railway shell after first deploy:
   ```bash
   railway run --service backend npm run migrate
   railway run --service backend npm run seed:rbac
   ```

## Contributing

1. Create a feature branch
2. Make your changes
3. Test responsiveness across breakpoints
4. Run `npm run build` in frontend to verify
5. Submit a pull request

## License

MIT License — See LICENSE file for details

## Screenshots

<!-- Screenshot coming soon: Dashboard overview showing KPI cards, weekly collection chart, waste type breakdown, and live incidents table -->

<!-- Screenshot coming soon: Bins map page showing interactive Leaflet map with color-coded bin markers across Bengaluru and filterable sidebar -->

<!-- Screenshot coming soon: Reports page showing monthly collection analytics, waste category pie chart, and CSV export table -->

---

**Built with ♻️ for sustainable waste management**
