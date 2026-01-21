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
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // Load security questions for this email
  const loadQuestions = async (targetEmail) => {
    if (!targetEmail) return;
    setError("");
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/reset/questions`, {
        email: targetEmail,
      });
      const qs = res.data?.questions || [];
      setQuestions(qs);
      setAnswers(qs.map(() => ""));
    } catch (err) {
      console.error("Load security questions failed", err);
      const msg = err?.response?.data?.error ||
        "Unable to load security questions for this user.";
      setError(msg);
      setQuestions([]);
      setAnswers([]);
    }
  };

  // Initial load when component mounts
  if (questions.length === 0 && emailFromQuery && email === emailFromQuery) {
    // Fire and forget; React render is sync but this call is async
    loadQuestions(emailFromQuery);
  }

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
        answers,
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
      subtitle="Answer your security questions to set a new password."
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
            onChange={(e) => {
              setEmail(e.target.value);
              setQuestions([]);
              setAnswers([]);
            }}
            required
          />
        </div>

        {questions.length > 0 && (
          <div className="space-y-3 border border-slate-200 rounded-md p-3 bg-slate-50">
            <p className="text-xs font-semibold text-slate-800">
              Answer your security questions
            </p>
            {questions.map((q, idx) => (
              <div key={idx}>
                <label className="block text-xs font-medium text-slate-700">
                  {q}
                </label>
                <input
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={answers[idx] || ""}
                  onChange={(e) => {
                    const next = [...answers];
                    next[idx] = e.target.value;
                    setAnswers(next);
                  }}
                  required
                />
              </div>
            ))}
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
