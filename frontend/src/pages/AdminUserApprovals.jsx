import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import { useAuth } from "../authContext";

export default function AdminUserApprovals() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      navigate("/dashboard");
      return;
    }
    loadPending();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadPending = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API_BASE_URL}/auth/users/pending`);
      setUsers(res.data || []);
    } catch (err) {
      console.error("Load pending users failed", err);
      setError("Failed to load pending users");
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (id, action, normalizedCustomerName) => {
    try {
      if (action === "approve") {
        await axios.post(`${API_BASE_URL}/auth/users/${id}/approve`, {
          customerName: normalizedCustomerName || undefined,
        });
      } else {
        await axios.post(`${API_BASE_URL}/auth/users/${id}/reject`);
      }
      await loadPending();
    } catch (err) {
      console.error("Update user status failed", err);
      setError("Failed to update user status");
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">User approvals</h2>
      <p className="text-sm text-slate-600 mb-4">
        Review pending employee and customer signups. Approving a customer lets
        you also standardise the customer name used for reporting.
      </p>

      {error && (
        <div className="mb-3 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-sm text-slate-600">Loading pending users...</div>
      ) : users.length === 0 ? (
        <div className="text-sm text-slate-500">No users pending approval.</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Role</th>
                <th className="px-3 py-2">Customer (submitted)</th>
                <th className="px-3 py-2">Normalised customer name</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <ApprovalRow
                  key={u.id}
                  user={u}
                  onDecision={handleDecision}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ApprovalRow({ user, onDecision }) {
  const [normalizedCustomer, setNormalizedCustomer] = useState(
    user.customerName || ""
  );

  const isCustomer = user.role === "CUSTOMER";

  return (
    <tr className="border-t hover:bg-slate-50 text-xs">
      <td className="px-3 py-2">
        <div className="font-medium text-slate-900">{user.name}</div>
        <div className="text-slate-500">#{user.id}</div>
      </td>
      <td className="px-3 py-2">{user.email}</td>
      <td className="px-3 py-2">{user.role}</td>
      <td className="px-3 py-2">{user.customerName || "-"}</td>
      <td className="px-3 py-2">
        {isCustomer ? (
          <input
            className="mt-1 block w-full rounded border border-slate-300 px-2 py-1 text-xs"
            value={normalizedCustomer}
            onChange={(e) => setNormalizedCustomer(e.target.value)}
            placeholder="e.g. Infinite, VIP, Routeware"
          />
        ) : (
          <span className="text-slate-400">N/A</span>
        )}
      </td>
      <td className="px-3 py-2 space-x-2">
        <button
          type="button"
          onClick={() =>
            onDecision(user.id, "approve", isCustomer ? normalizedCustomer : "")
          }
          className="inline-flex items-center px-2 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700"
        >
          Approve
        </button>
        <button
          type="button"
          onClick={() => onDecision(user.id, "reject")}
          className="inline-flex items-center px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700"
        >
          Reject
        </button>
      </td>
    </tr>
  );
}
