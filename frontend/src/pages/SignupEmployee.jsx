import { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";
import AuthLayout from "../components/AuthLayout";

export default function SignupEmployee() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    country: "",
    place: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/auth/signup/employee`, form);
      setSuccess(
        "Request submitted successfully. Your profile is pending admin approval."
      );
      setForm({ name: "", email: "", phone: "", country: "", place: "" });
    } catch (err) {
      console.error("Signup employee failed", err);
      const msg = err?.response?.data?.error || "Failed to submit signup";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Sign up as Employee"
      subtitle="Use your official email to request access."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-md bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-700">
            {success}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700">Name</label>
          <input
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Official email ID
          </label>
          <input
            type="email"
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Phone number
            </label>
            <input
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={form.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Country
            </label>
            <input
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={form.country}
              onChange={(e) => handleChange("country", e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Place / City
          </label>
          <input
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={form.place}
            onChange={(e) => handleChange("place", e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex justify-center items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Submitting..." : "Submit for approval"}
        </button>
      </form>
    </AuthLayout>
  );
}
