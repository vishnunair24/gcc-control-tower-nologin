import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Tracker from "./pages/Tracker";
import ProgramIntelligence from "./pages/ProgramIntelligence";
import InfraTracker from "./pages/InfraTracker";
import InfraIntelligence from "./pages/InfraIntelligence";
import TADashboard from "./pages/TADashboard";
import TATracker from "./pages/TATracker";
import Login from "./pages/Login";
import SignupEmployee from "./pages/SignupEmployee";
import SignupCustomer from "./pages/SignupCustomer";
import ResetRequest from "./pages/ResetRequest";
import EmployeeLanding from "./pages/EmployeeLanding";
import ResetFirstTime from "./pages/ResetFirstTime";
import ResetChangePassword from "./pages/ResetChangePassword";
import AdminUserApprovals from "./pages/AdminUserApprovals";
import { useAuth } from "./authContext";
import summitLogo from "./assets/summit-logo.png";
import BackButton from "./components/BackButton";

const HEADER_HEIGHT = 56; // single frozen header height
const HEADER_BG_COLOR = "#ffffff";

function RequireAuth({ children }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function ShellLayout() {
  return (
    <div>
      <Sidebar />
      <div className="ml-52">
        <div
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            left: "13rem",
            height: HEADER_HEIGHT,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 20px",
            background: HEADER_BG_COLOR,
            borderBottom: "1px solid #e5e7eb",
            zIndex: 50,
          }}
        >
          <Header />
          <img
            src={summitLogo}
            alt="Summit Consulting"
            style={{ height: "40px", objectFit: "contain" }}
          />
        </div>

        <main
          className="p-6 bg-gray-100 min-h-screen"
          style={{ marginTop: HEADER_HEIGHT }}
        >
          <div className="mb-2">
            <BackButton fallback="/dashboard" />
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      {/* Public auth routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup/employee" element={<SignupEmployee />} />
      <Route path="/signup/customer" element={<SignupCustomer />} />
      <Route path="/reset" element={<ResetRequest />} />
      <Route path="/reset/first-time" element={<ResetFirstTime />} />
      <Route path="/reset/change" element={<ResetChangePassword />} />

      {/* Protected routes under common shell */}
      <Route
        element={
          <RequireAuth>
            <ShellLayout />
          </RequireAuth>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/employee/landing" element={<EmployeeLanding />} />
        <Route
          path="/admin/user-approvals"
          element={<AdminUserApprovals />}
        />
        <Route path="/tracker" element={<Tracker />} />
        <Route path="/infra-tracker" element={<InfraTracker />} />
        <Route
          path="/program-intelligence"
          element={<ProgramIntelligence />}
        />
        <Route path="/ta-dashboard" element={<TADashboard />} />
        <Route path="/ta-tracker" element={<TATracker />} />
        <Route
          path="/infra-intelligence"
          element={<InfraIntelligence />}
        />
      </Route>

      {/* Fallback: anything unknown goes to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
