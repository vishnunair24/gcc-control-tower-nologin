import { API_BASE_URL } from "../config";
import { useState, useRef } from "react";
import axios from "axios";
import { useAuth } from "../authContext";

export default function ExcelReplaceUpload({
  endpoint = `${API_BASE_URL}/excel/replace`,
  confirmText =
    "If the Excel is for this customer, their data will be replaced; otherwise rows will be appended. Continue?",
  onSuccess,
}) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🔑 CRITICAL FIX
  const fileInputRef = useRef(null);
  const { currentCustomerName } = useAuth();

  const upload = async () => {
    if (!file) {
      alert("Please select an Excel file");
      return;
    }

    if (!window.confirm(confirmText)) return;

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    const url = currentCustomerName
      ? `${endpoint}?customerName=${encodeURIComponent(
          currentCustomerName
        )}`
      : endpoint;

    try {
      const res = await axios.post(url, formData);

      alert(
        `Excel Replace Successful!\n\nDeleted: ${res.data.deleted}\nInserted: ${res.data.inserted}`
      );

      onSuccess?.();
    } catch (err) {
      console.error("Excel upload failed:", err);
      const serverMessage = err?.response?.data?.error;
      if (serverMessage) {
        alert(serverMessage);
      } else {
        alert("Excel replace failed. Check backend logs.");
      }
    } finally {
      setLoading(false);

      // ✅ RESET FILE INPUT SO SAME FILE CAN BE UPLOADED AGAIN
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="excel-action-bar">
      <label className="file-label">
        Choose Excel
        <input
          ref={fileInputRef}
          type="file"
          hidden
          onChange={(e) => setFile(e.target.files[0])}
        />
      </label>

      <span className="file-name">
        {file ? file.name : "No file selected"}
      </span>

      <button
        className="btn-danger btn-xs"
        onClick={upload}
        disabled={loading}
      >
        {loading ? "Replacing..." : "Replace Data"}
      </button>
    </div>
  );
}
