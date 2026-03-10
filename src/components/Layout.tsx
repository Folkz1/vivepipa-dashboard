import { NavLink, Outlet } from "react-router-dom";

const navItems = [
  { to: "/analytics", label: "Analytics", icon: "📊" },
  { to: "/conversations", label: "Conversas", icon: "💬" },
  { to: "/leads", label: "Leads", icon: "🎯" },
  { to: "/servicos", label: "Serviços", icon: "🗺️" },
  { to: "/config", label: "Config", icon: "⚙️" },
];

export default function Layout() {
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-56 bg-pipa-800 text-white flex flex-col">
        <div className="p-4 border-b border-pipa-700">
          <h1 className="text-lg font-bold">Vive Pipa</h1>
          <p className="text-xs text-pipa-100 opacity-70">Dashboard</p>
        </div>
        <nav className="flex-1 p-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded text-sm mb-1 transition-colors ${
                  isActive
                    ? "bg-pipa-600 text-white"
                    : "text-pipa-100 hover:bg-pipa-700"
                }`
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 text-xs text-pipa-100 opacity-50 border-t border-pipa-700">
          Sofia Bot v2
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
