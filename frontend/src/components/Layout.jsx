import { Link, Outlet, useLocation } from "react-router-dom";

function Layout() {
  const location = useLocation();

  const linkClass = (path) =>
    `block px-4 py-2 rounded ${
      location.pathname === path
        ? "bg-blue-600 text-white"
        : "text-gray-700 hover:bg-gray-100"
    }`;

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white shadow">
        <div className="p-4 text-xl font-semibold border-b">
          GCC Control Tower
        </div>

        <nav className="p-4 space-y-2">
          <Link to="/dashboard" className={linkClass("/dashboard")}>
            Executive Dashboard
          </Link>

          <Link to="/tracker" className={linkClass("/tracker")}>
            Task Tracker
          </Link>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
