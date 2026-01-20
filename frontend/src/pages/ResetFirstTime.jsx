import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config";
import AuthLayout from "../components/AuthLayout";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function ResetFirstTime() {
  const query = useQuery();
  const emailFromQuery = query.get("email") || "";

  const [email, setEmail] = useState(emailFromQuery);
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleGenerateToken = async () => {
    setError("");
    setMessage("");
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/reset/generate-token`, {
        email,
      });
      const generated = res.data?.resetToken || "";
      if (generated) {
        setToken(generated);
        setMessage("One-time token generated. It has been filled in below.");
      } else {
        setMessage("Token generated. Please use the value shared with you.");
      }
    } catch (err) {
      console.error("Generate reset token failed", err);
      const msg = err?.response?.data?.error || "Failed to generate token";
      setError(msg);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/auth/set-password-first`, {
        email,
        password,
        resetToken: token || undefined,
      });
      setMessage("Password set successfully. You can now sign in.");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      console.error("First-time password set failed", err);
      const msg = err?.response?.data?.error || "Failed to set password";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your password"
      subtitle="Your profile is approved. Set your password to start using GCC Control Tower."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
        {message && (
          <div className="rounded-md bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-700">
            {message}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Email address
          </label>
          <input
            type="email"
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm bg-slate-50"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-slate-700">
              One-time token (optional)
            </label>
            <button
              type="button"
              onClick={handleGenerateToken}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              Generate token
            </button>
          </div>
          <input
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="If provided, it will be validated"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              New password
            </label>
            <input
              type="password"
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Confirm password
            </label>
            <input
              type="password"
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex justify-center items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Saving..." : "Set password"}
        </button>
      </form>
    </AuthLayout>
  );
}
