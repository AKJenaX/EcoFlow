import { useState, useEffect, useRef } from "react";
import { 
  LayoutDashboard, 
  Trash2, 
  Route, 
  Truck, 
  Map, 
  BarChart3, 
  ShieldAlert, 
  Bell, 
  Menu, 
  X, 
  LogOut,
  AlertTriangle,
  Info
} from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { getIncidents } from "../services/api.js";

const navItems = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Bins", to: "/bins", icon: Trash2 },
  { label: "Routes", to: "/routes", icon: Route },
  { label: "Fleet", to: "/fleet", icon: Truck },
  { label: "Map", to: "/map", icon: Map },
  { label: "Reports", to: "/reports", icon: BarChart3 },
  { label: "Authority", to: "/authority", icon: ShieldAlert }
];

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const [username] = useState(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.username || "User";
      } catch (err) {
        console.error("Failed to parse token in layout:", err);
      }
    }
    return "User";
  });

  const getInitials = (name) => {
    if (!name) return "";
    const cleanName = name.replace(/[0-9]/g, '');
    const nameToUse = cleanName.trim() ? cleanName : name;
    const parts = nameToUse.trim().split(/[\s_-]+/);
    if (parts.length >= 2) {
      const firstPart = parts[0][0] || '';
      const secondPart = parts[1][0] || '';
      return (firstPart + secondPart).toUpperCase();
    }
    return nameToUse.slice(0, 2).toUpperCase();
  };

  const initials = getInitials(username);

  const fetchNotifications = async () => {
    try {
      const data = await getIncidents();
      const list = Array.isArray(data) ? data : data.data || [];
      setNotifications(list.slice(0, 5));
      const activeCount = list.filter(inc => inc.status === 'open' || inc.status === 'assigned' || inc.status === 'in_progress').length;
      setUnreadCount(activeCount);
    } catch (err) {
      console.warn("Failed to fetch layout notifications:", err);
    }
  };

  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      if (active) fetchNotifications();
    }, 0);

    const interval = window.setInterval(() => {
      if (active) fetchNotifications();
    }, 20000);

    return () => {
      active = false;
      clearTimeout(timer);
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-10 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-20 w-64 bg-gradient-to-b from-[#163022] to-[#1a3a2a] px-5 py-6 text-white transition-transform duration-300 md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } flex flex-col shadow-xl`}
      >
        <div className="mb-10 px-2">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#84cc16]">
            EcoFlow
          </p>
          <h1 className="mt-2 text-xl font-bold tracking-tight text-white">Operations</h1>
        </div>

        <nav className="space-y-1.5 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  [
                    "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 transform",
                    isActive
                      ? "bg-[#84cc16] text-[#1a3a2a] font-semibold shadow-lg translate-x-1"
                      : "text-emerald-100/90 hover:bg-white/10 hover:text-white hover:translate-x-1"
                  ].join(" ")
                }
              >
                <Icon size={18} className="shrink-0" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-emerald-100/90 hover:bg-white/10 hover:text-white hover:translate-x-1 transition-all duration-200 transform"
        >
          <LogOut size={18} className="shrink-0" />
          Logout
        </button>
      </aside>

      <div className="min-h-screen md:pl-64">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 md:px-8">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-slate-100"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? (
              <X size={24} className="text-slate-600" />
            ) : (
              <Menu size={24} className="text-slate-600" />
            )}
          </button>
          <h2 className="text-lg font-semibold flex-1 md:flex-none md:ml-0 ml-4">EcoFlow</h2>
          
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                aria-label="Notifications"
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications) fetchNotifications();
                }}
                className="relative grid size-10 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition duration-150 active:scale-95"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-extrabold text-white animate-bounce shadow-md">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 z-50 w-80 rounded-xl border border-slate-200 bg-white p-4 shadow-2xl animate-fade-in origin-top-right transform scale-100 transition-all">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                    <h3 className="text-sm font-bold text-slate-900">Operations Alerts</h3>
                    <span className="text-[10px] bg-slate-100 text-slate-600 rounded px-1.5 py-0.5 font-bold uppercase tracking-wider">
                      {unreadCount} Active
                    </span>
                  </div>

                  <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                    {notifications.length > 0 ? (
                      notifications.map((notif) => {
                        const isCritical = notif.severity === "critical" || notif.severity === "high";
                        const isOpen = notif.status === "open";
                        return (
                          <div
                            key={notif.id}
                            className={`flex items-start gap-2.5 rounded-lg p-2 transition ${
                              isOpen ? "bg-slate-50 border-l-2 border-emerald-500" : "bg-white"
                            }`}
                          >
                            <div className={`mt-0.5 shrink-0 rounded-full p-1 ${isCritical ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'}`}>
                              {isCritical ? <AlertTriangle size={14} /> : <Info size={14} />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1.5">
                                <p className="text-xs font-bold text-slate-800 truncate uppercase tracking-wider">
                                  {notif.incident_type.replace('_', ' ')}
                                </p>
                                <span className={`text-[9px] font-bold rounded-full px-1.5 py-0.2 border capitalize ${
                                  isCritical ? 'bg-red-50 text-red-650 border-red-200' : 'bg-amber-50 text-amber-650 border-amber-200'
                                }`}>
                                  {notif.severity}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-600 font-semibold mt-0.5 line-clamp-2">
                                {notif.description || `Bin ${notif.bin_id || '??'} requires attention.`}
                              </p>
                              <p className="text-[9px] text-slate-400 mt-1 font-medium">
                                {new Date(notif.opened_at || notif.openedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-center text-xs text-slate-400 font-medium py-6">No operational alerts.</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Initials Avatar */}
            <div 
              title={username}
              className="flex size-10 items-center justify-center rounded-full bg-emerald-700 text-white font-extrabold text-xs shadow-inner border border-emerald-850/20 select-none cursor-pointer hover:bg-emerald-800 transition duration-150 active:scale-95"
            >
              {initials}
            </div>
          </div>
        </header>

        <main className="p-6 md:p-8 fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
