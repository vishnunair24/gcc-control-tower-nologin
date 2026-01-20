import genericCustomerLogo from "../assets/customer-logo.png";
import { useAuth } from "../authContext";
import { useNavigate } from "react-router-dom";
import { CUSTOMER_LOGO_MAP } from "../customerConfig";

export default function Header() {
  const { user, currentCustomerName, logout } = useAuth();
  const navigate = useNavigate();

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((p) => p[0])
        .join("")
        .toUpperCase()
    : "U";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const activeLogo =
    currentCustomerName && CUSTOMER_LOGO_MAP[currentCustomerName]
      ? CUSTOMER_LOGO_MAP[currentCustomerName]
      : genericCustomerLogo;

  return (
    <div className="flex items-center w-full gap-4">
      {/* LEFT: App Title */}
      <h1 className="text-xl font-medium tracking-tight text-gray-900">
        GCC Control Tower
      </h1>

      {/* CENTER: Current customer (if any) */}
      {currentCustomerName && (
        <div className="text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
          Customer: <span className="font-medium">{currentCustomerName}</span>
        </div>
      )}

      {/* RIGHT: Customer Logo + User Avatar */}
      <div className="flex items-center ml-auto gap-4">
        <div className="flex items-center pr-4 border-r border-gray-300">
          <img
            src={activeLogo}
            alt={currentCustomerName ? `${currentCustomerName} logo` : "Customer Logo"}
            style={{
              height: "28px",
              objectFit: "contain",
              opacity: 0.95,
            }}
          />
        </div>

        {user && (
          <div className="flex items-center gap-3">
            <div className="flex flex-col text-right text-xs">
              <span className="font-medium text-gray-900 truncate max-w-[160px]">
                {user.name}
              </span>
              <span className="text-gray-500 uppercase tracking-wide">
                {user.role}
              </span>
              {user.role === "ADMIN" && (
                <button
                  type="button"
                  onClick={() => navigate("/admin/user-approvals")}
                  className="text-[11px] text-blue-600 hover:text-blue-700 font-medium mt-0.5"
                >
                  User approvals
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold shadow">
                {initials}
              </div>
              <button
                type="button"
                onClick={handleLogout}
                title="Sign out"
                className="text-gray-500 hover:text-red-600"
              >
                ⎋
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}