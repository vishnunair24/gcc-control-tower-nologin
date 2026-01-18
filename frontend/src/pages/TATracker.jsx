import React, { useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "../config";
import ExcelReplaceUpload from "../components/ExcelReplaceUpload";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "./Tracker.css";

function TATracker() {
  const [filters, setFilters] = useState({
    jobId: "",
    jobTitle: "",
    hiringManager: "",
    technology: "",
    status: "",
  });
  const [excelMessage, setExcelMessage] = useState("");
  const [data, setData] = useState({
    requisitions: [],
    candidates: [],
    interviews: [],
    offers: [],
    joiners: [],
  });

  useEffect(() => {
    fetch(`${API_BASE_URL}/ta/tracker`)
      .then((res) => res.json())
      .then((payload) => {
        setData({
          requisitions: payload.requisitions || [],
          candidates: payload.candidates || [],
          interviews: payload.interviews || [],
          offers: payload.offers || [],
          joiners: payload.joiners || [],
        });
      })
      .catch(() => {
        setData({
          requisitions: [],
          candidates: [],
          interviews: [],
          offers: [],
          joiners: [],
        });
      });
  }, []);

  const downloadTemplate = () => {
    // Sheet 1: Open Requisition Tracker
    const reqHeaders = [
      "Job ID",
      "Job Title",
      "Hiring Manager",
      "Technology",
      "Open Positions",
      "Status",
      "Ageing (Days)",
      "Priority",
    ];
    const reqData = [
      reqHeaders,
      [
        "JOB-001",
        "Senior Java Engineer",
        "Alice Hiring",
        "Java",
        3,
        "Open",
        15,
        "High",
      ],
      [
        "JOB-002",
        "Frontend Developer",
        "Bob Hiring",
        "React",
        2,
        "On Hold",
        5,
        "Medium",
      ],
      [
        "JOB-003",
        "Data Engineer",
        "Carol Hiring",
        "Data Engineering",
        1,
        "Cancelled",
        30,
        "Low",
      ],
    ];
    const reqWs = XLSX.utils.aoa_to_sheet(reqData);

    // Sheet 2: Candidate Pipeline (TA View)
    const candHeaders = [
      "Job ID",
      "Candidate Name",
      "Recruiter",
      "TA Screening",
      "HM Screening",
      "Int 1",
      "Int 2",
      "Advanced",
      "Current Status",
    ];
    const candData = [
      candHeaders,
      [
        "JOB-001",
        "John Doe",
        "Ravi Recruiter",
        "Completed",
        "Cleared",
        "Cleared",
        "--",
        "Offer Stage",
        "In Process",
      ],
      [
        "JOB-001",
        "Jane Smith",
        "Ravi Recruiter",
        "Completed",
        "Cleared",
        "Cleared",
        "Cleared",
        "Final Round",
        "Interviewing",
      ],
      [
        "JOB-002",
        "Mark Taylor",
        "Priya Recruiter",
        "Completed",
        "Pending",
        "--",
        "--",
        "Screening",
        "On Hold",
      ],
    ];
    const candWs = XLSX.utils.aoa_to_sheet(candData);

    // Sheet 3: Interview Turnaround Tracking
    const intHeaders = [
      "Job ID",
      "Candidate",
      "Interview Round",
      "Interview Date",
      "Feedback Date",
      "TAT (Days)",
      "Status",
    ];
    const intData = [
      intHeaders,
      [
        "JOB-001",
        "John Doe",
        "Technical Round 1",
        "2026-01-10",
        "2026-01-11",
        1,
        "Cleared",
      ],
      [
        "JOB-001",
        "Jane Smith",
        "Technical Round 2",
        "2026-01-12",
        "2026-01-13",
        1,
        "Pending Feedback",
      ],
      [
        "JOB-002",
        "Mark Taylor",
        "TA Screening",
        "2026-01-09",
        "2026-01-09",
        0,
        "On Hold",
      ],
    ];
    const intWs = XLSX.utils.aoa_to_sheet(intData);

    // Sheet 4: Offer Lifecycle
    const offerHeaders = [
      "Job ID",
      "Candidate",
      "Offer Released Date",
      "Offer Status",
      "Expected DOJ",
      "Actual DOJ",
      "Remarks",
    ];
    const offerData = [
      offerHeaders,
      [
        "JOB-001",
        "John Doe",
        "2026-01-14",
        "Accepted",
        "2026-02-01",
        "",
        "Joining in Feb batch",
      ],
      [
        "JOB-001",
        "Jane Smith",
        "2026-01-16",
        "Pending",
        "2026-02-15",
        "",
        "Waiting for candidate confirmation",
      ],
      [
        "JOB-003",
        "Alex Lee",
        "2026-01-05",
        "Declined",
        "2026-01-25",
        "",
        "Offer declined - salary mismatch",
      ],
    ];
    const offerWs = XLSX.utils.aoa_to_sheet(offerData);

    // Sheet 5: Joiner Pipeline
    const joinHeaders = [
      "Hiring Manager",
      "Job ID",
      "Candidate",
      "Offer Accepted Date",
      "DOJ",
      "Status",
      "Drop Risk",
    ];
    const joinData = [
      joinHeaders,
      [
        "Alice Hiring",
        "JOB-001",
        "John Doe",
        "2026-01-18",
        "2026-02-01",
        "Joined",
        "Low",
      ],
      [
        "Bob Hiring",
        "JOB-002",
        "Mark Taylor",
        "2026-01-20",
        "2026-02-10",
        "Yet to Join",
        "Medium",
      ],
      [
        "Carol Hiring",
        "JOB-003",
        "Alex Lee",
        "2026-01-08",
        "2026-01-25",
        "No Show",
        "High",
      ],
    ];
    const joinWs = XLSX.utils.aoa_to_sheet(joinData);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, reqWs, "Open_Requisition_Tracker");
    XLSX.utils.book_append_sheet(wb, candWs, "Candidate_Pipeline");
    XLSX.utils.book_append_sheet(wb, intWs, "Interview_TAT");
    XLSX.utils.book_append_sheet(wb, offerWs, "Offer_Lifecycle");
    XLSX.utils.book_append_sheet(wb, joinWs, "Joiner_Pipeline");

    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([buffer], {
        type:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      "TA_Tracker_Template.xlsx"
    );
  };

  const filteredRequisitions = useMemo(() => {
    return data.requisitions.filter((r) => {
      return (
        (!filters.jobId ||
          (r.requisitionId || "")
            .toLowerCase()
            .includes(filters.jobId.toLowerCase())) &&
        (!filters.jobTitle ||
          (r.jobTitle || "")
            .toLowerCase()
            .includes(filters.jobTitle.toLowerCase())) &&
        (!filters.hiringManager ||
          (r.hiringManager || "")
            .toLowerCase()
            .includes(filters.hiringManager.toLowerCase())) &&
        (!filters.technology ||
          (r.technology || "")
            .toLowerCase()
            .includes(filters.technology.toLowerCase())) &&
        (!filters.status ||
          (r.requisitionStatus || "")
            .toLowerCase()
            .includes(filters.status.toLowerCase()))
      );
    });
  }, [data.requisitions, filters]);

  return (
    <div className="tracker-page">
      {/* Header aligned with Program Tracker */}
      <div className="tracker-header">
        <h2>TA Tracker</h2>
        <p className="subtitle">Operational TA pipeline and offer tracking</p>
      </div>

      {/* ACTION BAR - mirrors existing tracker/infratracker */}
      <div className="action-bar">
        <div className="left-actions">
          <ExcelReplaceUpload
            endpoint={`${API_BASE_URL}/excel/ta-replace`}
            confirmText="This will completely replace ALL TA Tracker data. Continue?"
            onSuccess={() => {
              setExcelMessage("TA Excel uploaded successfully.");
              setTimeout(() => setExcelMessage(""), 4000);
            }}
          />

          <button className="btn-outline btn-xs" onClick={downloadTemplate}>
            Download Excel
          </button>
        </div>

        {/* Right side kept free for future navigation if needed */}
      </div>

      {excelMessage && (
        <div className="excel-success">{excelMessage}</div>
      )}

      {/* FILTER BAR - same visual pattern as Tracker, TA-specific fields */}
      <div className="filter-bar">
        <input
          placeholder="Job ID"
          value={filters.jobId}
          onChange={(e) => setFilters({ ...filters, jobId: e.target.value })}
        />
        <input
          placeholder="Job Title"
          value={filters.jobTitle}
          onChange={(e) => setFilters({ ...filters, jobTitle: e.target.value })}
        />
        <input
          placeholder="Hiring Manager"
          value={filters.hiringManager}
          onChange={(e) =>
            setFilters({ ...filters, hiringManager: e.target.value })
          }
        />
        <input
          placeholder="Technology"
          value={filters.technology}
          onChange={(e) =>
            setFilters({ ...filters, technology: e.target.value })
          }
        />
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">All Status</option>
          <option>Open</option>
          <option>In Progress</option>
          <option>Offer Released</option>
          <option>Joined</option>
          <option>On Hold</option>
          <option>Cancelled</option>
        </select>
        <button
          className="btn-secondary btn-xs"
          onClick={() =>
            setFilters({
              jobId: "",
              jobTitle: "",
              hiringManager: "",
              technology: "",
              status: "",
            })
          }
        >
          Clear
        </button>
      </div>

      {/* OPEN REQUISITION TRACKER */}
      <SectionCard title="Open Requisition Tracker">
        <SimpleTable
          columns={[
            "Job ID",
            "Job Title",
            "Hiring Manager",
            "Technology",
            "Open Positions",
            "Status",
            "Ageing (Days)",
            "Priority",
          ]}
          rows={filteredRequisitions.map((r) => ({
            "Job ID": r.requisitionId,
            "Job Title": r.jobTitle,
            "Hiring Manager": r.hiringManager,
            Technology: r.technology,
            "Open Positions": r.approvedPositions,
            Status: r.requisitionStatus,
            "Ageing (Days)": "",
            Priority: r.priority,
          }))}
        />
      </SectionCard>

      {/* CANDIDATE STAGE TRACKER */}
      <SectionCard title="Candidate Pipeline (TA View)">
        <SimpleTable
          columns={[
            "Job ID",
            "Candidate Name",
            "Recruiter",
            "TA Screening",
            "HM Screening",
            "Int 1",
            "Int 2",
            "Advanced",
            "Current Status",
          ]}
          rows={data.candidates.map((c) => ({
            "Job ID": c.requisitionId,
            "Candidate Name": c.candidateName,
            Recruiter: c.recruiter,
            "TA Screening": "",
            "HM Screening": "",
            "Int 1": "",
            "Int 2": "",
            Advanced: c.currentStage,
            "Current Status": c.candidateStatus,
          }))}
        />
      </SectionCard>

      {/* INTERVIEW & FEEDBACK TAT */}
      <SectionCard title="Interview Turnaround Tracking">
        <SimpleTable
          columns={[
            "Job ID",
            "Candidate",
            "Interview Round",
            "Interview Date",
            "Feedback Date",
            "TAT (Days)",
            "Status",
          ]}
          rows={data.interviews.map((i) => ({
            "Job ID": i.requisitionId,
            Candidate: i.candidateId,
            "Interview Round": i.interviewRound,
            "Interview Date": i.interviewDate
              ? new Date(i.interviewDate).toISOString().slice(0, 10)
              : "",
            "Feedback Date": i.feedbackDate
              ? new Date(i.feedbackDate).toISOString().slice(0, 10)
              : "",
            "TAT (Days)": "",
            Status: i.interviewResult,
          }))}
        />
      </SectionCard>

      {/* OFFER MANAGEMENT */}
      <SectionCard title="Offer Lifecycle">
        <SimpleTable
          columns={[
            "Job ID",
            "Candidate",
            "Offer Released Date",
            "Offer Status",
            "Expected DOJ",
            "Actual DOJ",
            "Remarks",
          ]}
          rows={data.offers.map((o) => ({
            "Job ID": o.requisitionId,
            Candidate: o.candidateId,
            "Offer Released Date": o.offerReleasedDate
              ? new Date(o.offerReleasedDate).toISOString().slice(0, 10)
              : "",
            "Offer Status": o.offerStatus,
            "Expected DOJ": o.expectedDoj
              ? new Date(o.expectedDoj).toISOString().slice(0, 10)
              : "",
            "Actual DOJ": o.actualDoj
              ? new Date(o.actualDoj).toISOString().slice(0, 10)
              : "",
            Remarks: o.declineReason,
          }))}
        />
      </SectionCard>

      {/* JOINER PIPELINE */}
      <SectionCard title="Joiner Pipeline (TA-Owned)">
        <SimpleTable
          columns={[
            "Hiring Manager",
            "Job ID",
            "Candidate",
            "Offer Accepted Date",
            "DOJ",
            "Status",
            "Drop Risk",
          ]}
          rows={data.joiners.map((j) => ({
            "Hiring Manager": "",
            "Job ID": j.requisitionId,
            Candidate: j.candidateId,
            "Offer Accepted Date": "",
            DOJ: j.joiningDate
              ? new Date(j.joiningDate).toISOString().slice(0, 10)
              : "",
            Status: j.joiningStatus,
            "Drop Risk": j.onboardingStatus,
          }))}
        />
      </SectionCard>
    </div>
  );
}

function SectionCard({ title, children }) {
  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: "6px",
        background: "#ffffff",
        padding: "8px 10px",
        marginBottom: "10px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "6px",
        }}
      >
        <h3
          style={{
            fontSize: "13px",
            fontWeight: 600,
            color: "#111827",
            margin: 0,
          }}
        >
          {title}
        </h3>
        <span
          style={{ fontSize: "11px", color: "#9ca3af" }}
        >
          (Operational TA view)
        </span>
      </div>
      {children}
    </div>
  );
}

function SimpleTable({ columns, rows }) {
  return (
    <div className="table-container">
      <table className="tracker-table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows && rows.length > 0 ? (
            rows.map((row, idx) => (
              <tr key={idx}>
                {columns.map((c) => (
                  <td key={c}>{row[c] ?? ""}</td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: "center" }}>
                No data available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default TATracker;
