import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config";
import AuthLayout from "../components/AuthLayout";
import { useAuth } from "../authContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      });

      const user = res.data;
      login(user);

      if (user.role === "EMPLOYEE" || user.role === "ADMIN") {
        navigate("/employee/landing");
      } else if (user.role === "CUSTOMER") {
        navigate("/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Login failed", err);
      const msg =
        err?.response?.data?.error ||
        "Unable to sign in. Please check your credentials.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Sign in"
      subtitle="Access GCC Control Tower with your Summit credentials."
      showBackButton={false}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Email address
          </label>
          <input
            type="email"
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Password
          </label>
          <input
            type="password"
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex justify-center items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <div className="flex flex-col gap-2 text-sm text-slate-700 mt-2">
          <div className="flex justify-between">
            <span>New here?</span>
            <div className="space-x-3">
              <Link
                to="/signup/employee"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign up as Employee
              </Link>
            </div>
          </div>

          <div className="flex justify-end">
            <Link
              to="/signup/customer"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Sign up as Customer
            </Link>
          </div>

          <div className="flex justify-between pt-2 border-t border-slate-100 mt-2">
            <span className="text-slate-500">Forgot password?</span>
            <Link
              to="/reset"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Reset password
            </Link>
          </div>
        </div>
      </form>
    </AuthLayout>
  );
}
