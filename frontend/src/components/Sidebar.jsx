import { Link } from "react-router-dom";
import { useAuth } from "../authContext";

function Sidebar() {
  const { user } = useAuth();
  const isCustomer = user?.role === "CUSTOMER";

  return (
    <aside className="fixed top-0 left-0 w-52 bg-gray-900 text-white h-screen p-4">
      <h2 className="text-lg font-semibold mb-6">Navigation</h2>

      <nav className="space-y-3">
        <Link to="/dashboard" className="block hover:text-gray-300">
          Dashboard
        </Link>

        {!isCustomer && (
          <>
            <Link to="/tracker" className="block hover:text-gray-300">
              Tracker
            </Link>

            <Link
              to="/program-intelligence"
              className="block hover:text-gray-300"
            >
              Program Intelligence
            </Link>

            <Link
              to="/infra-tracker"
              className="block hover:text-gray-300"
            >
              Infra Tracker
            </Link>

            <Link
              to="/infra-intelligence"
              className="block hover:text-gray-300"
            >
              Infra Intelligence
            </Link>
          </>
        )}

        <Link to="/ta-dashboard" className="block hover:text-gray-300">
          TA Dashboard
        </Link>

        {!isCustomer && (
          <Link to="/ta-tracker" className="block hover:text-gray-300">
            TA Tracker
          </Link>
        )}
      </nav>
    </aside>
  );
}

export default Sidebar;
