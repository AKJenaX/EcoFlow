import React from "react";
import { Link, useLocation } from "react-router-dom";

function Navbar() {
  const location = useLocation();

  const coreModules = [
    { name: "Hub", path: "/", icon: "🏠" },
    { name: "Command Center", path: "/incident-center", icon: "⚡" },
    { name: "Live Map", path: "/iot-telemetry", icon: "📍" },
    { name: "Incidents", path: "/incident-center", icon: "🚨" },
    { name: "Routes", path: "/routes", icon: "🛣️" },
    { name: "Analytics", path: "/analytics", icon: "📊" },
  ];

  const managementModules = [
    { name: "Authority", path: "/authority", icon: "🏛️" },
    { name: "Driver", path: "/driver", icon: "👨‍✈️" },
    { name: "Vehicle", path: "/vehicle", icon: "🚛" },
    { name: "Smart Bin", path: "/bin", icon: "🗑️" },
    { name: "User", path: "/user", icon: "👥" },
  ];

  const intelligenceModules = [
    { name: "Forecasting", path: "/forecasting", icon: "🔮" },
    { name: "Anomalies", path: "/anomalies", icon: "🔍" },
    { name: "SLA Monitor", path: "/sla-monitoring", icon: "⏱️" },
    { name: "IoT Telemetry", path: "/iot-telemetry", icon: "📡" },
  ];

  const supportModules = [
    { name: "Complaints", path: "/complaints", icon: "💬" },
  ];

  const renderNavItems = (items) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      {items.map((item, index) => {
        const isActive =
          location.pathname === item.path &&
          items.findIndex((candidate) => candidate.path === item.path) === index;

        return (
          <Link
            key={item.name}
            to={item.path}
            className="nav-item"
            style={{
              background: isActive ? "rgba(0, 255, 136, 0.15)" : "transparent",
              color: isActive ? "#00ff88" : "inherit",
              borderLeft: isActive ? "3px solid #00ff88" : "none",
              paddingLeft: isActive ? "calc(16px - 3px)" : "16px",
            }}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.name}</span>
          </Link>
        );
      })}
    </div>
  );

  return (
    <>
      <aside className="sidebar">
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span style={{ fontSize: "20px" }}>♻️</span>
            <span>EcoFlow</span>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <div className="sidebar-nav">
          {/* Core Operations */}
          <div>
            <div style={{ fontSize: "11px", fontWeight: "600", textTransform: "uppercase", color: "#a0b0c0", marginBottom: "12px", paddingLeft: "16px", letterSpacing: "0.5px" }}>
              Core Operations
            </div>
            {renderNavItems(coreModules.map((item) => (
              item.name === "Incidents" ? { ...item, path: "/incidents" } : item
            )))}
          </div>

          {/* Management */}
          <div style={{ marginTop: "24px" }}>
            <div style={{ fontSize: "11px", fontWeight: "600", textTransform: "uppercase", color: "#a0b0c0", marginBottom: "12px", paddingLeft: "16px", letterSpacing: "0.5px" }}>
              Resource Management
            </div>
            {renderNavItems(managementModules)}
          </div>

          {/* Intelligence */}
          <div style={{ marginTop: "24px" }}>
            <div style={{ fontSize: "11px", fontWeight: "600", textTransform: "uppercase", color: "#a0b0c0", marginBottom: "12px", paddingLeft: "16px", letterSpacing: "0.5px" }}>
              Intelligence & Monitoring
            </div>
            {renderNavItems(intelligenceModules)}
          </div>

          {/* Support */}
          <div style={{ marginTop: "24px" }}>
            <div style={{ fontSize: "11px", fontWeight: "600", textTransform: "uppercase", color: "#a0b0c0", marginBottom: "12px", paddingLeft: "16px", letterSpacing: "0.5px" }}>
              Support & Settings
            </div>
            {renderNavItems(supportModules)}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <button
            className="btn btn-accent"
            style={{ width: "100%" }}
          >
            ⚡ Optimize Fleet
          </button>
        </div>
      </aside>
    </>
  );
}

export default Navbar;
