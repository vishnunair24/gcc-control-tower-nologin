import { useNavigate } from "react-router-dom";
import { useAuth } from "../authContext";
import { CUSTOMERS } from "../customerConfig";
import Header from "../components/Header";
import summitLogo from "../assets/summit-logo.png";

export default function EmployeeLanding() {
  const { user, selectCustomer } = useAuth();
  const navigate = useNavigate();

  if (!user || (user.role !== "EMPLOYEE" && user.role !== "ADMIN")) {
    // Simple guard: only employee and admin can use this landing
    navigate("/dashboard");
    return null;
  }

  const handleSelect = (customerKey) => {
    selectCustomer(customerKey);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="border-b bg-white">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">
          <Header />
          <img
            src={summitLogo}
            alt="Summit Consulting"
            className="h-10 w-auto object-contain"
          />
        </div>
      </header>

      <main className="flex-1 flex justify-center">
        <div className="max-w-5xl w-full px-6 py-10">
          <h2 className="text-2xl font-semibold text-slate-900 mb-2">
            Choose a customer
          </h2>
          <p className="text-sm text-slate-600 mb-6">
            Select the customer whose dashboards and trackers you want to work on.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {CUSTOMERS.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => handleSelect(c.key)}
                className="group bg-white rounded-xl shadow hover:shadow-lg transition flex flex-col items-center justify-center py-8 px-4 border border-slate-100"
              >
                <div className="h-16 w-32 mb-3 flex items-center justify-center">
                  <img
                    src={c.logo}
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
                  Customer name: <span className="font-semibold">{c.key}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>

      <footer className="border-t bg-white">
        <div className="max-w-6xl mx-auto px-6 py-3 text-xs text-slate-500 text-center">
            © {new Date().getFullYear()} Summit Consulting. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
