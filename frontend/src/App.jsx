import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";

import DashboardHome from "./pages/DashboardHome";
import AuthorityPage from "./pages/Authority";
import BinPage from "./pages/Bin";
import DriverPage from "./pages/Driver";
import UserPage from "./pages/User";
import VehiclePage from "./pages/Vehicle";
import StitchPreview from "./pages/StitchPreview";
import IncidentCommandCenter from "./pages/IncidentCommandCenter";
import Analytics from "./pages/Analytics";
import RouteOptimization from "./pages/RouteOptimization";
import Forecasting from "./pages/Forecasting";
import AnomalyDetection from "./pages/AnomalyDetection";
import SLAMonitoring from "./pages/SLAMonitoring";
import IoTTelemetry from "./pages/IoTTelemetry";
import ComplaintsManagement from "./pages/ComplaintsManagement";

function DashboardLayout({ children }) {
  return (
    <>
      {children}
    </>
  );
}

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        
        <div className="main-wrapper">
          <Routes>
          {/* DASHBOARD HOME */}
          <Route
            path="/"
            element={
              <DashboardLayout>
                <DashboardHome />
              </DashboardLayout>
            }
          />

          {/* DASHBOARD PAGES */}
          <Route
            path="/authority"
            element={
              <DashboardLayout>
                <AuthorityPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/bin"
            element={
              <DashboardLayout>
                <BinPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/driver"
            element={
              <DashboardLayout>
                <DriverPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/user"
            element={
              <DashboardLayout>
                <UserPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/vehicle"
            element={
              <DashboardLayout>
                <VehiclePage />
              </DashboardLayout>
            }
          />
          <Route
            path="/stitch-preview"
            element={
              <DashboardLayout>
                <StitchPreview />
              </DashboardLayout>
            }
          />
          <Route
            path="/incident-center"
            element={
              <DashboardLayout>
                <IncidentCommandCenter />
              </DashboardLayout>
            }
          />
          <Route
            path="/incidents"
            element={
              <DashboardLayout>
                <IncidentCommandCenter />
              </DashboardLayout>
            }
          />

          {/* ADVANCED ANALYTICS & MONITORING */}
          <Route
            path="/analytics"
            element={
              <DashboardLayout>
                <Analytics />
              </DashboardLayout>
            }
          />
          <Route
            path="/routes"
            element={
              <DashboardLayout>
                <RouteOptimization />
              </DashboardLayout>
            }
          />
          <Route
            path="/forecasting"
            element={
              <DashboardLayout>
                <Forecasting />
              </DashboardLayout>
            }
          />
          <Route
            path="/anomalies"
            element={
              <DashboardLayout>
                <AnomalyDetection />
              </DashboardLayout>
            }
          />
          <Route
            path="/sla-monitoring"
            element={
              <DashboardLayout>
                <SLAMonitoring />
              </DashboardLayout>
            }
          />
          <Route
            path="/iot-telemetry"
            element={
              <DashboardLayout>
                <IoTTelemetry />
              </DashboardLayout>
            }
          />
          <Route
            path="/complaints"
            element={
              <DashboardLayout>
                <ComplaintsManagement />
              </DashboardLayout>
            }
          />
        </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
