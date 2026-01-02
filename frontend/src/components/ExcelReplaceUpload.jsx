import { useState } from "react";
import axios from "axios";

export default function ExcelReplaceUpload({ onSuccess }) {
  const [file, setFile] = useState(null);

  const upload = async () => {
    if (!file) {
      alert("Please select an Excel file first");
      return;
    }

    if (
      !window.confirm(
        "This will completely replace all existing tracker data. Continue?"
      )
    )
      return;

    const formData = new FormData();
    formData.append("file", file);

    await axios.post("http://localhost:4000/excel/replace", formData);
    onSuccess();
  };

  return (
    <div className="excel-action-bar">
      <label className="file-label">
        Choose Excel
        <input
          type="file"
          hidden
          onChange={(e) => setFile(e.target.files[0])}
        />
      </label>

      <span className="file-name">
        {file ? file.name : "No file selected"}
      </span>

      <button className="btn-danger btn-xs" onClick={upload}>
        Replace Data
      </button>
    </div>
  );
}
