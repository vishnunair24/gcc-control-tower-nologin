import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config";
import AuthLayout from "../components/AuthLayout";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function ResetChangePassword() {
  const query = useQuery();
  const emailFromQuery = query.get("email") || "";

  const [email, setEmail] = useState(emailFromQuery);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [useToken, setUseToken] = useState(false);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [generatedToken, setGeneratedToken] = useState("");
  const navigate = useNavigate();

  const handleGenerateToken = async () => {
    setError("");
    setMessage("");
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/reset/generate-token`, {
        email,
      });
      setGeneratedToken(res.data?.resetToken || "");
      setUseToken(true);
      setMessage("One-time token generated. Use it below.");
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

    if (newPassword !== confirm) {
      setError("New passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/auth/reset/confirm`, {
        email,
        oldPassword: useToken ? undefined : oldPassword,
        resetToken: useToken ? token || generatedToken || undefined : undefined,
        newPassword,
      });
      setMessage("Password updated successfully.");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      console.error("Password reset failed", err);
      const msg = err?.response?.data?.error || "Failed to reset password";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Use your current password or a one-time token to reset."
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

        {!useToken && (
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Old password
            </label>
            <input
              type="password"
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />
          </div>
        )}

        <div className="text-xs text-slate-600 flex items-center justify-between">
          <span>Or use a one-time token:</span>
          <button
            type="button"
            onClick={handleGenerateToken}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Generate one-time token
          </button>
        </div>

        {useToken && (
          <div>
            <label className="block text-sm font-medium text-slate-700">
              One-time token
            </label>
            <input
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder={
                generatedToken
                  ? `Token: ${generatedToken}`
                  : "Enter token shared with you"
              }
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              New password
            </label>
            <input
              type="password"
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
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
          {loading ? "Updating..." : "Update password"}
        </button>
      </form>
    </AuthLayout>
  );
}
