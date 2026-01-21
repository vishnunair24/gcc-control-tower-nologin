import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import AuthLayout from "../components/AuthLayout";

export default function ResetRequest() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/reset/info`, { email });
      const { exists, status, hasPassword } = res.data || {};

      if (!exists) {
        setMessage("If this email is registered and approved, reset options will be available.");
        return;
      }

      if (status === "PENDING") {
        setMessage("Your signup request is pending admin approval.");
        return;
      }

      if (status === "REJECTED") {
        setMessage("Your signup request has been rejected. Please contact the administrator.");
        return;
      }

      if (status === "APPROVED" && !hasPassword) {
        navigate(`/reset/first-time?email=${encodeURIComponent(email)}`);
        return;
      }

      if (status === "APPROVED" && hasPassword) {
        navigate(`/reset/change?email=${encodeURIComponent(email)}`);
        return;
      }

      setMessage("Reset request processed. Please follow the instructions provided.");
    } catch (err) {
      console.error("Reset info error", err);
      setError("Unable to process reset request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Set / reset password"
      subtitle="Enter your registered email to view reset options."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
        {message && (
          <div className="rounded-md bg-slate-50 border border-slate-200 px-3 py-2 text-sm text-slate-700">
            {message}
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

        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex justify-center items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Checking..." : "Continue"}
        </button>
      </form>
    </AuthLayout>
  );
}
