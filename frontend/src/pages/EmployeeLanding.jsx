import { useNavigate } from "react-router-dom";
import { useAuth } from "../authContext";

const CUSTOMERS = [
  {
    key: "Infinite",
    label: "Infinite Electronics",
    logoPath: "/customer-logos/infinite.png",
  },
  {
    key: "VIP",
    label: "VIP",
    logoPath: "/customer-logos/vip.png",
  },
  {
    key: "Routeware",
    label: "Routeware",
    logoPath: "/customer-logos/routeware.png",
  },
];

export default function EmployeeLanding() {
  const { user, selectCustomer } = useAuth();
  const navigate = useNavigate();

  if (!user || user.role !== "EMPLOYEE") {
    // Simple guard: non-employees fall back to dashboard
    navigate("/dashboard");
    return null;
  }

  const handleSelect = (customerKey) => {
    selectCustomer(customerKey);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <div className="max-w-4xl w-full px-6 py-10">
        <h2 className="text-2xl font-semibold text-slate-900 mb-2">
          Choose a customer
        </h2>
        <p className="text-sm text-slate-600 mb-6">
          Select the customer whose dashboards and trackers you want to work on.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {CUSTOMERS.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => handleSelect(c.key)}
              className="group bg-white rounded-xl shadow hover:shadow-lg transition flex flex-col items-center justify-center py-8 px-4 border border-slate-100"
            >
              <div className="h-16 w-32 mb-3 flex items-center justify-center">
                <img
                  src={c.logoPath}
                  alt={c.label}
                  className="max-h-16 max-w-full object-contain opacity-90 group-hover:opacity-100"
                  onError={(e) => {
                    // fallback to initials if logo not present yet
                    e.currentTarget.style.display = "none";
                  }}
                />
                <span className="text-xl font-semibold text-blue-700 hidden group-[&>img[style*='display: none']]:block">
                  {c.label[0]}
                </span>
              </div>
              <div className="text-sm font-medium text-slate-900 mb-1">
                {c.label}
              </div>
              <div className="text-xs text-slate-500">
                Click to open dashboards for {c.key}.
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
