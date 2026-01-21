import { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";
import AuthLayout from "../components/AuthLayout";
import { SECURITY_QUESTION_BANK } from "../securityQuestions";

export default function SignupCustomer() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    country: "",
    place: "",
    customerName: "",
  });
  const [security, setSecurity] = useState({
    q1: "",
    a1: "",
    q2: "",
    a2: "",
    q3: "",
    a3: "",
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
      const securityQuestions = [
        { question: security.q1, answer: security.a1 },
        { question: security.q2, answer: security.a2 },
        { question: security.q3, answer: security.a3 },
      ];

      await axios.post(`${API_BASE_URL}/auth/signup/customer`, {
        ...form,
        securityQuestions,
      });
      setSuccess(
        "Request submitted successfully. Your profile is pending admin approval."
      );
      setForm({
        name: "",
        email: "",
        phone: "",
        country: "",
        place: "",
        customerName: "",
      });
      setSecurity({ q1: "", a1: "", q2: "", a2: "", q3: "", a3: "" });
    } catch (err) {
      console.error("Signup customer failed", err);
      const msg = err?.response?.data?.error || "Failed to submit signup";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Sign up as Customer"
      subtitle="Create a customer profile for GCC Control Tower."
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

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Customer name
          </label>
          <input
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={form.customerName}
            onChange={(e) => handleChange("customerName", e.target.value)}
            required
          />
          <p className="mt-1 text-xs text-slate-500">
            This will be used to link dashboards and trackers to your
            organisation.
          </p>
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

        <div className="border border-slate-200 rounded-md p-3 space-y-3 bg-slate-50">
          <p className="text-sm font-semibold text-slate-800">
            Security questions (used only if you forget your password)
          </p>
          <p className="text-xs text-slate-600">
            Choose three questions and provide answers you will remember. These will be
            used to verify your identity during password reset.
          </p>

          {[1, 2, 3].map((idx) => (
            <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-700">
                  Question {idx}
                </label>
                <select
                  className="mt-1 block w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={security[`q${idx}`]}
                  onChange={(e) =>
                    setSecurity((prev) => ({ ...prev, [`q${idx}`]: e.target.value }))
                  }
                  required
                >
                  <option value="">Select a question</option>
                  {SECURITY_QUESTION_BANK.map((q) => (
                    <option key={q} value={q}>
                      {q}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700">
                  Answer
                </label>
                <input
                  className="mt-1 block w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={security[`a${idx}`]}
                  onChange={(e) =>
                    setSecurity((prev) => ({ ...prev, [`a${idx}`]: e.target.value }))
                  }
                  required
                />
              </div>
            </div>
          ))}
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
