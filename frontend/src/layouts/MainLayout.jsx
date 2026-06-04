import { useState } from "react";
import { Bell, Menu, X, LogOut } from "lucide-react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

const navItems = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Bins", to: "/bins" },
  { label: "Routes", to: "/routes" },
  { label: "Fleet", to: "/fleet" },
  { label: "Map", to: "/map" },
  { label: "Reports", to: "/reports" },
  { label: "Authority", to: "/authority" }
];

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

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
        className={`fixed inset-y-0 left-0 z-20 w-64 bg-[#1a3a2a] px-5 py-6 text-white transition-transform duration-300 md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } flex flex-col`}
      >
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
            EcoFlow
          </p>
          <h1 className="mt-2 text-xl font-semibold">Operations</h1>
        </div>

        <nav className="space-y-2 flex-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                [
                  "block rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-[#84cc16] text-[#1a3a2a] font-semibold shadow-md"
                    : "text-emerald-50 hover:bg-white/10"
                ].join(" ")
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-emerald-50 hover:bg-white/10 transition-all duration-200"
        >
          <LogOut size={18} />
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
          <button
            type="button"
            aria-label="Notifications"
            className="grid size-10 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
          >
            <Bell size={20} />
          </button>
        </header>

        <main className="p-6 md:p-8 fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
