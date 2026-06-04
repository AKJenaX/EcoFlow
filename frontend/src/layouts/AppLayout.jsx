import { NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, MapPinned, Recycle, Truck, Route, Trash2, FileBarChart } from "lucide-react";

const navItems = [
  { label: "Dashboard", to: "/", icon: LayoutDashboard },
  { label: "Live Map", to: "/map", icon: MapPinned },
  { label: "Routes", to: "/routes", icon: Route },
  { label: "Fleet", to: "/fleet", icon: Truck },
  { label: "Bins", to: "/bins", icon: Trash2 },
  { label: "Reports", to: "/reports", icon: FileBarChart }
];

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-emerald-900/10 bg-slate-950 p-5 text-white md:block">
        <div className="mb-8 flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-lg bg-emerald-400 text-slate-950">
            <Recycle size={22} />
          </div>
          <div>
            <div className="text-lg font-semibold">EcoFlow</div>
            <div className="text-xs text-emerald-200">Operations desk</div>
          </div>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  [
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                    isActive ? "bg-emerald-400 text-slate-950" : "text-slate-300 hover:bg-white/10 hover:text-white"
                  ].join(" ")
                }
              >
                <Icon size={18} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      <main className="min-h-screen p-4 md:ml-64 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
