import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import { useAuth } from "../authContext";

export default function AdminUsers() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.role !== "ADMIN") {
      navigate("/dashboard");
      return;
    }
    loadAllUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadAllUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API_BASE_URL}/auth/users`);
      setUsers(res.data || []);
    } catch (err) {
      console.error("Load all users failed", err);
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (id, nextRole) => {
    setSavingId(id);
    setError("");
    try {
      await axios.patch(`${API_BASE_URL}/auth/users/${id}/role`, { role: nextRole });
      await loadAllUsers();
    } catch (err) {
      console.error("Update user role failed", err);
      setError("Failed to update user role");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="border-b bg-white">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">
          <h1 className="text-lg font-semibold text-slate-900">Admin  Users & Roles</h1>
          <button
            type="button"
            onClick={() => navigate("/employee/landing")}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            Back to landing
          </button>
        </div>
      </header>

      <main className="flex-1 flex justify-center">
        <div className="max-w-6xl w-full px-6 py-6">
          <p className="text-sm text-slate-600 mb-4">
            View all users and adjust their roles. Treat <strong>EMPLOYEE</strong> as read access
            and <strong>ADMIN</strong> as full write/admin access.
          </p>

          {error && (
            <div className="mb-3 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-sm text-slate-600">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="text-sm text-slate-500">No users found.</div>
          ) : (
            <div className="overflow-x-auto bg-white rounded shadow">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 border-b">
                  <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">Email</th>
                    <th className="px-3 py-2">Role</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Customer</th>
                    <th className="px-3 py-2">Access (read/write)</th>
                    <th className="px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-t hover:bg-slate-50 text-xs">
                      <td className="px-3 py-2">
                        <div className="font-medium text-slate-900">{u.name}</div>
                        <div className="text-slate-500">#{u.id}</div>
                      </td>
                      <td className="px-3 py-2">{u.email}</td>
                      <td className="px-3 py-2">{u.role}</td>
                      <td className="px-3 py-2">{u.status}</td>
                      <td className="px-3 py-2">{u.customerName || "-"}</td>
                      <td className="px-3 py-2">
                        {u.role === "ADMIN" ? "Write (admin)" : "Read / limited"}
                      </td>
                      <td className="px-3 py-2">
                        <select
                          className="border border-slate-300 rounded px-2 py-1 text-xs"
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          disabled={savingId === u.id}
                        >
                          <option value="EMPLOYEE">EMPLOYEE (read)</option>
                          <option value="ADMIN">ADMIN (write)</option>
                          <option value="CUSTOMER">CUSTOMER</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
