import React, { useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "../config";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../authContext";
import ExcelReplaceUpload from "../components/ExcelReplaceUpload";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "./Tracker.css";

const generateTempId = () =>
  `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const createEmptyNewRequisition = () => ({
  _tempId: generateTempId(),
  requisitionId: "",
  jobTitle: "",
  hiringManager: "",
  technology: "",
  approvedPositions: 0,
  requisitionStatus: "Open",
  priority: "",
});

const createEmptyNewCandidate = () => ({
  _tempId: generateTempId(),
  requisitionId: "",
  candidateName: "",
  recruiter: "",
  currentStage: "",
  candidateStatus: "",
});

const createEmptyNewInterview = () => ({
  _tempId: generateTempId(),
  requisitionId: "",
  candidateId: "",
  interviewRound: "",
  interviewDate: "",
  feedbackDate: "",
  interviewResult: "",
});

const createEmptyNewOffer = () => ({
  _tempId: generateTempId(),
  requisitionId: "",
  candidateId: "",
  offerReleasedDate: "",
  offerStatus: "",
  expectedDoj: "",
  actualDoj: "",
  declineReason: "",
});

const createEmptyNewJoiner = () => ({
  _tempId: generateTempId(),
  requisitionId: "",
  candidateId: "",
  joiningDate: "",
  joiningStatus: "",
  onboardingStatus: "",
});

function TATracker() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    jobId: "",
    jobTitle: "",
    hiringManager: "",
    technology: "",
    status: "",
  });
  const [excelMessage, setExcelMessage] = useState("");
  const [requisitions, setRequisitions] = useState([]);
  const [data, setData] = useState({
    candidates: [],
    interviews: [],
    offers: [],
    joiners: [],
  });

  const [editRowId, setEditRowId] = useState(null);
  const [editData, setEditData] = useState(null);
  const [newRows, setNewRows] = useState([]);

  const [editCandidateId, setEditCandidateId] = useState(null);
  const [candidateEdit, setCandidateEdit] = useState(null);
  const [newCandidates, setNewCandidates] = useState([]);

  const [editInterviewId, setEditInterviewId] = useState(null);
  const [interviewEdit, setInterviewEdit] = useState(null);
  const [newInterviews, setNewInterviews] = useState([]);

  const [editOfferId, setEditOfferId] = useState(null);
  const [offerEdit, setOfferEdit] = useState(null);
  const [newOffers, setNewOffers] = useState([]);

  const [editJoinerId, setEditJoinerId] = useState(null);
  const [joinerEdit, setJoinerEdit] = useState(null);
  const [newJoiners, setNewJoiners] = useState([]);

  const { user, currentCustomerName } = useAuth();

  const loadTracker = () => {
    const url = currentCustomerName
      ? `${API_BASE_URL}/ta/tracker?customerName=${encodeURIComponent(
          currentCustomerName
        )}`
      : `${API_BASE_URL}/ta/tracker`;

    fetch(url)
      .then((res) => res.json())
      .then((payload) => {
        setRequisitions(payload.requisitions || []);
        setData({
          candidates: payload.candidates || [],
          interviews: payload.interviews || [],
          offers: payload.offers || [],
          joiners: payload.joiners || [],
        });
      })
      .catch(() => {
        setRequisitions([]);
        setData({
          candidates: [],
          interviews: [],
          offers: [],
          joiners: [],
        });
      });
  };

  useEffect(() => {
    if (user?.role === "EMPLOYEE" && !currentCustomerName) {
      navigate("/employee/landing");
      return;
    }
    loadTracker();
  }, [user, currentCustomerName]);

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
    return requisitions.filter((r) => {
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
  }, [requisitions, filters]);

  const normalizeReqPayload = (row) => ({
    requisitionId: row.requisitionId?.toString().trim() || "",
    jobTitle: row.jobTitle?.toString().trim() || "",
    hiringManager: row.hiringManager?.toString().trim() || null,
    technology: row.technology?.toString().trim() || null,
    approvedPositions: Number(row.approvedPositions) || 0,
    priority: row.priority?.toString().trim() || null,
    requisitionStatus:
      row.requisitionStatus?.toString().trim() || "Open",
  });

  const startEdit = (row) => {
    setEditRowId(row.id);
    setEditData({ ...row });
  };

  const cancelEdit = () => {
    setEditRowId(null);
    setEditData(null);
  };

  const handleEditChange = (field, value) => {
    setEditData((prev) => ({ ...(prev || {}), [field]: value }));
  };

  const saveEdit = async () => {
    if (!editData || !editRowId) return;
    const payload = normalizeReqPayload(editData);
    await fetch(`${API_BASE_URL}/ta/requisitions/${editRowId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setEditRowId(null);
    setEditData(null);
    loadTracker();
  };

  const deleteRequisition = async (id) => {
    if (!window.confirm("Delete this requisition?")) return;
    await fetch(`${API_BASE_URL}/ta/requisitions/${id}`, {
      method: "DELETE",
    });
    loadTracker();
  };

  const addNewRow = () => {
    setNewRows((prev) => [...prev, createEmptyNewRequisition()]);
  };

  const updateNewRow = (id, field, value) => {
    setNewRows((prev) =>
      prev.map((r) => (r._tempId === id ? { ...r, [field]: value } : r))
    );
  };

  const cancelNewRow = (id) => {
    setNewRows((prev) => prev.filter((r) => r._tempId !== id));
  };

  const saveNewRow = async (row) => {
    const payload = normalizeReqPayload(row);
    await fetch(`${API_BASE_URL}/ta/requisitions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setNewRows((prev) => prev.filter((r) => r._tempId !== row._tempId));
    loadTracker();
  };

  const saveAllNewRows = async () => {
    for (const row of newRows) {
      const payload = normalizeReqPayload(row);
      await fetch(`${API_BASE_URL}/ta/requisitions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
    setNewRows([]);
    loadTracker();
  };

  const normalizeCandidatePayload = (row) => ({
    requisitionId: row.requisitionId?.toString().trim() || "",
    candidateName: row.candidateName?.toString().trim() || "",
    recruiter: row.recruiter?.toString().trim() || null,
    currentStage: row.currentStage?.toString().trim() || null,
    candidateStatus: row.candidateStatus?.toString().trim() || null,
  });

  const startCandidateEdit = (row) => {
    setEditCandidateId(row.id);
    setCandidateEdit({ ...row });
  };

  const cancelCandidateEdit = () => {
    setEditCandidateId(null);
    setCandidateEdit(null);
  };

  const handleCandidateChange = (field, value) => {
    setCandidateEdit((prev) => ({ ...(prev || {}), [field]: value }));
  };

  const saveCandidateEdit = async () => {
    if (!candidateEdit || !editCandidateId) return;
    const payload = normalizeCandidatePayload(candidateEdit);
    await fetch(`${API_BASE_URL}/ta/candidates/${editCandidateId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setEditCandidateId(null);
    setCandidateEdit(null);
    loadTracker();
  };

  const deleteCandidate = async (id) => {
    if (!window.confirm("Delete this candidate?")) return;
    await fetch(`${API_BASE_URL}/ta/candidates/${id}`, {
      method: "DELETE",
    });
    loadTracker();
  };

  const addNewCandidate = () => {
    setNewCandidates((prev) => [...prev, createEmptyNewCandidate()]);
  };

  const updateNewCandidate = (id, field, value) => {
    setNewCandidates((prev) =>
      prev.map((r) => (r._tempId === id ? { ...r, [field]: value } : r))
    );
  };

  const cancelNewCandidate = (id) => {
    setNewCandidates((prev) => prev.filter((r) => r._tempId !== id));
  };

  const saveNewCandidate = async (row) => {
    const payload = normalizeCandidatePayload(row);
    await fetch(`${API_BASE_URL}/ta/candidates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setNewCandidates((prev) => prev.filter((r) => r._tempId !== row._tempId));
    loadTracker();
  };

  const normalizeInterviewPayload = (row) => ({
    requisitionId: row.requisitionId?.toString().trim() || "",
    candidateId: row.candidateId?.toString().trim() || "",
    interviewRound: row.interviewRound?.toString().trim() || null,
    interviewDate: row.interviewDate || null,
    feedbackDate: row.feedbackDate || null,
    interviewResult: row.interviewResult?.toString().trim() || null,
  });

  const startInterviewEdit = (row) => {
    setEditInterviewId(row.id);
    setInterviewEdit({ ...row });
  };

  const cancelInterviewEdit = () => {
    setEditInterviewId(null);
    setInterviewEdit(null);
  };

  const handleInterviewChange = (field, value) => {
    setInterviewEdit((prev) => ({ ...(prev || {}), [field]: value }));
  };

  const saveInterviewEdit = async () => {
    if (!interviewEdit || !editInterviewId) return;
    const payload = normalizeInterviewPayload(interviewEdit);
    await fetch(`${API_BASE_URL}/ta/interviews/${editInterviewId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setEditInterviewId(null);
    setInterviewEdit(null);
    loadTracker();
  };

  const deleteInterview = async (id) => {
    if (!window.confirm("Delete this interview record?")) return;
    await fetch(`${API_BASE_URL}/ta/interviews/${id}`, {
      method: "DELETE",
    });
    loadTracker();
  };

  const addNewInterview = () => {
    setNewInterviews((prev) => [...prev, createEmptyNewInterview()]);
  };

  const updateNewInterview = (id, field, value) => {
    setNewInterviews((prev) =>
      prev.map((r) => (r._tempId === id ? { ...r, [field]: value } : r))
    );
  };

  const cancelNewInterview = (id) => {
    setNewInterviews((prev) => prev.filter((r) => r._tempId !== id));
  };

  const saveNewInterview = async (row) => {
    const payload = normalizeInterviewPayload(row);
    await fetch(`${API_BASE_URL}/ta/interviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setNewInterviews((prev) => prev.filter((r) => r._tempId !== row._tempId));
    loadTracker();
  };

  const normalizeOfferPayload = (row) => ({
    requisitionId: row.requisitionId?.toString().trim() || "",
    candidateId: row.candidateId?.toString().trim() || "",
    offerReleasedDate: row.offerReleasedDate || null,
    offerStatus: row.offerStatus?.toString().trim() || null,
    expectedDoj: row.expectedDoj || null,
    actualDoj: row.actualDoj || null,
    declineReason: row.declineReason?.toString().trim() || null,
  });

  const startOfferEdit = (row) => {
    setEditOfferId(row.id);
    setOfferEdit({ ...row });
  };

  const cancelOfferEdit = () => {
    setEditOfferId(null);
    setOfferEdit(null);
  };

  const handleOfferChange = (field, value) => {
    setOfferEdit((prev) => ({ ...(prev || {}), [field]: value }));
  };

  const saveOfferEdit = async () => {
    if (!offerEdit || !editOfferId) return;
    const payload = normalizeOfferPayload(offerEdit);
    await fetch(`${API_BASE_URL}/ta/offers/${editOfferId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setEditOfferId(null);
    setOfferEdit(null);
    loadTracker();
  };

  const deleteOffer = async (id) => {
    if (!window.confirm("Delete this offer record?")) return;
    await fetch(`${API_BASE_URL}/ta/offers/${id}`, {
      method: "DELETE",
    });
    loadTracker();
  };

  const addNewOffer = () => {
    setNewOffers((prev) => [...prev, createEmptyNewOffer()]);
  };

  const updateNewOffer = (id, field, value) => {
    setNewOffers((prev) =>
      prev.map((r) => (r._tempId === id ? { ...r, [field]: value } : r))
    );
  };

  const cancelNewOffer = (id) => {
    setNewOffers((prev) => prev.filter((r) => r._tempId !== id));
  };

  const saveNewOffer = async (row) => {
    const payload = normalizeOfferPayload(row);
    await fetch(`${API_BASE_URL}/ta/offers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setNewOffers((prev) => prev.filter((r) => r._tempId !== row._tempId));
    loadTracker();
  };

  const normalizeJoinerPayload = (row) => ({
    requisitionId: row.requisitionId?.toString().trim() || "",
    candidateId: row.candidateId?.toString().trim() || "",
    joiningDate: row.joiningDate || null,
    joiningStatus: row.joiningStatus?.toString().trim() || null,
    onboardingStatus: row.onboardingStatus?.toString().trim() || null,
  });

  const startJoinerEdit = (row) => {
    setEditJoinerId(row.id);
    setJoinerEdit({ ...row });
  };

  const cancelJoinerEdit = () => {
    setEditJoinerId(null);
    setJoinerEdit(null);
  };

  const handleJoinerChange = (field, value) => {
    setJoinerEdit((prev) => ({ ...(prev || {}), [field]: value }));
  };

  const saveJoinerEdit = async () => {
    if (!joinerEdit || !editJoinerId) return;
    const payload = normalizeJoinerPayload(joinerEdit);
    await fetch(`${API_BASE_URL}/ta/joiners/${editJoinerId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setEditJoinerId(null);
    setJoinerEdit(null);
    loadTracker();
  };

  const deleteJoiner = async (id) => {
    if (!window.confirm("Delete this joiner record?")) return;
    await fetch(`${API_BASE_URL}/ta/joiners/${id}`, {
      method: "DELETE",
    });
    loadTracker();
  };

  const addNewJoiner = () => {
    setNewJoiners((prev) => [...prev, createEmptyNewJoiner()]);
  };

  const updateNewJoiner = (id, field, value) => {
    setNewJoiners((prev) =>
      prev.map((r) => (r._tempId === id ? { ...r, [field]: value } : r))
    );
  };

  const cancelNewJoiner = (id) => {
    setNewJoiners((prev) => prev.filter((r) => r._tempId !== id));
  };

  const saveNewJoiner = async (row) => {
    const payload = normalizeJoinerPayload(row);
    await fetch(`${API_BASE_URL}/ta/joiners`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setNewJoiners((prev) => prev.filter((r) => r._tempId !== row._tempId));
    loadTracker();
  };

  return (
    <div className="tracker-page">
      {/* Header aligned with Program Tracker */}
      <div className="tracker-header">
        <h2>TA Tracker</h2>
        <p className="subtitle">Operational TA pipeline and offer tracking</p>
      </div>

      {/* ACTION BAR - Excel controls only */}
      <div className="action-bar">
        <div className="left-actions">
          <ExcelReplaceUpload
            endpoint={`${API_BASE_URL}/excel/ta-replace`}
            confirmText="This will completely replace ALL TA Tracker data. Continue?"
            onSuccess={() => {
              loadTracker();
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
      <SectionCard title="Open Requisition Tracker" onAddRow={addNewRow}>
        <div className="ta-table-container">
          <table className="ta-table">
            <thead>
              <tr>
                <th>Job ID</th>
                <th>Job Title</th>
                <th>Hiring Manager</th>
                <th>Technology</th>
                <th>Open Positions</th>
                <th>Status</th>
                <th>Ageing (Days)</th>
                <th>Priority</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {newRows.map((row) => (
                <tr key={row._tempId} className="editing-row">
                  <td>
                    <input
                      className="cell-input"
                      value={row.requisitionId}
                      onChange={(e) =>
                        updateNewRow(row._tempId, "requisitionId", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      className="cell-input"
                      value={row.jobTitle}
                      onChange={(e) =>
                        updateNewRow(row._tempId, "jobTitle", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      className="cell-input"
                      value={row.hiringManager}
                      onChange={(e) =>
                        updateNewRow(row._tempId, "hiringManager", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      className="cell-input"
                      value={row.technology}
                      onChange={(e) =>
                        updateNewRow(row._tempId, "technology", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      className="cell-input"
                      type="number"
                      value={row.approvedPositions}
                      onChange={(e) =>
                        updateNewRow(
                          row._tempId,
                          "approvedPositions",
                          e.target.value
                        )
                      }
                    />
                  </td>
                  <td>
                    <select
                      className="cell-input"
                      value={row.requisitionStatus}
                      onChange={(e) =>
                        updateNewRow(
                          row._tempId,
                          "requisitionStatus",
                          e.target.value
                        )
                      }
                    >
                      <option>Open</option>
                      <option>In Progress</option>
                      <option>Offer Released</option>
                      <option>Joined</option>
                      <option>On Hold</option>
                      <option>Cancelled</option>
                    </select>
                  </td>
                  <td>-</td>
                  <td>
                    <input
                      className="cell-input"
                      value={row.priority}
                      onChange={(e) =>
                        updateNewRow(row._tempId, "priority", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <button
                      className="btn-primary btn-xs"
                      onClick={() => saveNewRow(row)}
                    >
                      Save
                    </button>{" "}
                    <button
                      className="btn-secondary btn-xs"
                      onClick={() => cancelNewRow(row._tempId)}
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              ))}

              {filteredRequisitions.map((r) => (
                <tr
                  key={r.id}
                  className={editRowId === r.id ? "editing-row" : ""}
                >
                  {editRowId === r.id ? (
                    <>
                      <td>
                        <input
                          className="cell-input"
                          value={editData?.requisitionId || ""}
                          onChange={(e) =>
                            handleEditChange("requisitionId", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          className="cell-input"
                          value={editData?.jobTitle || ""}
                          onChange={(e) =>
                            handleEditChange("jobTitle", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          className="cell-input"
                          value={editData?.hiringManager || ""}
                          onChange={(e) =>
                            handleEditChange("hiringManager", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          className="cell-input"
                          value={editData?.technology || ""}
                          onChange={(e) =>
                            handleEditChange("technology", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          className="cell-input"
                          type="number"
                          value={editData?.approvedPositions ?? 0}
                          onChange={(e) =>
                            handleEditChange("approvedPositions", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <select
                          className="cell-input"
                          value={editData?.requisitionStatus || "Open"}
                          onChange={(e) =>
                            handleEditChange("requisitionStatus", e.target.value)
                          }
                        >
                          <option>Open</option>
                          <option>In Progress</option>
                          <option>Offer Released</option>
                          <option>Joined</option>
                          <option>On Hold</option>
                          <option>Cancelled</option>
                        </select>
                      </td>
                      <td>-</td>
                      <td>
                        <input
                          className="cell-input"
                          value={editData?.priority || ""}
                          onChange={(e) =>
                            handleEditChange("priority", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <button
                          className="btn-primary btn-xs"
                          onClick={saveEdit}
                        >
                          Save
                        </button>{" "}
                        <button
                          className="btn-secondary btn-xs"
                          onClick={cancelEdit}
                        >
                          Cancel
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{r.requisitionId}</td>
                      <td>{r.jobTitle}</td>
                      <td>{r.hiringManager}</td>
                      <td>{r.technology}</td>
                      <td>{r.approvedPositions}</td>
                      <td>{r.requisitionStatus}</td>
                      <td></td>
                      <td>{r.priority}</td>
                      <td>
                        <button
                          className="btn-primary btn-xs"
                          onClick={() => startEdit(r)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn-danger btn-xs"
                          style={{ marginLeft: 4, paddingInline: 6 }}
                          onClick={() => deleteRequisition(r.id)}
                          title="Delete row"
                        >
                          -
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}

              {filteredRequisitions.length === 0 && newRows.length === 0 && (
                <tr>
                  <td colSpan={9} className="ta-table-empty">
                    No data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* CANDIDATE STAGE TRACKER */}
      <SectionCard
        title="Candidate Pipeline (TA View)"
        onAddRow={addNewCandidate}
      >
        <div className="ta-table-container">
          <table className="ta-table">
            <thead>
              <tr>
                <th>Job ID</th>
                <th>Candidate Name</th>
                <th>Recruiter</th>
                <th>Advanced</th>
                <th>Current Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {newCandidates.map((row) => (
                <tr key={row._tempId} className="editing-row">
                  <td>
                    <input
                      className="cell-input"
                      value={row.requisitionId}
                      onChange={(e) =>
                        updateNewCandidate(row._tempId, "requisitionId", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      className="cell-input"
                      value={row.candidateName}
                      onChange={(e) =>
                        updateNewCandidate(row._tempId, "candidateName", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      className="cell-input"
                      value={row.recruiter}
                      onChange={(e) =>
                        updateNewCandidate(row._tempId, "recruiter", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      className="cell-input"
                      value={row.currentStage}
                      onChange={(e) =>
                        updateNewCandidate(row._tempId, "currentStage", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      className="cell-input"
                      value={row.candidateStatus}
                      onChange={(e) =>
                        updateNewCandidate(row._tempId, "candidateStatus", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <button
                      className="btn-primary btn-xs"
                      onClick={() => saveNewCandidate(row)}
                    >
                      Save
                    </button>{" "}
                    <button
                      className="btn-secondary btn-xs"
                      onClick={() => cancelNewCandidate(row._tempId)}
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              ))}

              {data.candidates.map((c) => (
                <tr
                  key={c.id}
                  className={editCandidateId === c.id ? "editing-row" : ""}
                >
                  {editCandidateId === c.id ? (
                    <>
                      <td>
                        <input
                          className="cell-input"
                          value={candidateEdit?.requisitionId || ""}
                          onChange={(e) =>
                            handleCandidateChange("requisitionId", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          className="cell-input"
                          value={candidateEdit?.candidateName || ""}
                          onChange={(e) =>
                            handleCandidateChange("candidateName", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          className="cell-input"
                          value={candidateEdit?.recruiter || ""}
                          onChange={(e) =>
                            handleCandidateChange("recruiter", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          className="cell-input"
                          value={candidateEdit?.currentStage || ""}
                          onChange={(e) =>
                            handleCandidateChange("currentStage", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          className="cell-input"
                          value={candidateEdit?.candidateStatus || ""}
                          onChange={(e) =>
                            handleCandidateChange("candidateStatus", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <button
                          className="btn-primary btn-xs"
                          onClick={saveCandidateEdit}
                        >
                          Save
                        </button>{" "}
                        <button
                          className="btn-secondary btn-xs"
                          onClick={cancelCandidateEdit}
                        >
                          Cancel
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{c.requisitionId}</td>
                      <td>{c.candidateName}</td>
                      <td>{c.recruiter}</td>
                      <td>{c.currentStage}</td>
                      <td>{c.candidateStatus}</td>
                      <td>
                        <button
                          className="btn-primary btn-xs"
                          onClick={() => startCandidateEdit(c)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn-danger btn-xs"
                          style={{ marginLeft: 4, paddingInline: 6 }}
                          onClick={() => deleteCandidate(c.id)}
                          title="Delete row"
                        >
                          -
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}

              {data.candidates.length === 0 && newCandidates.length === 0 && (
                <tr>
                  <td colSpan={6} className="ta-table-empty">
                    No data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* INTERVIEW & FEEDBACK TAT */}
      <SectionCard
        title="Interview Turnaround Tracking"
        onAddRow={addNewInterview}
      >
        <div className="ta-table-container">
          <table className="ta-table">
            <thead>
              <tr>
                <th>Job ID</th>
                <th>Candidate</th>
                <th>Interview Round</th>
                <th>Interview Date</th>
                <th>Feedback Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {newInterviews.map((row) => (
                <tr key={row._tempId} className="editing-row">
                  <td>
                    <input
                      className="cell-input"
                      value={row.requisitionId}
                      onChange={(e) =>
                        updateNewInterview(row._tempId, "requisitionId", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      className="cell-input"
                      value={row.candidateId}
                      onChange={(e) =>
                        updateNewInterview(row._tempId, "candidateId", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      className="cell-input"
                      value={row.interviewRound}
                      onChange={(e) =>
                        updateNewInterview(row._tempId, "interviewRound", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      className="cell-input"
                      type="date"
                      value={row.interviewDate}
                      onChange={(e) =>
                        updateNewInterview(row._tempId, "interviewDate", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      className="cell-input"
                      type="date"
                      value={row.feedbackDate}
                      onChange={(e) =>
                        updateNewInterview(row._tempId, "feedbackDate", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      className="cell-input"
                      value={row.interviewResult}
                      onChange={(e) =>
                        updateNewInterview(row._tempId, "interviewResult", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <button
                      className="btn-primary btn-xs"
                      onClick={() => saveNewInterview(row)}
                    >
                      Save
                    </button>{" "}
                    <button
                      className="btn-secondary btn-xs"
                      onClick={() => cancelNewInterview(row._tempId)}
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              ))}

              {data.interviews.map((i) => (
                <tr
                  key={i.id}
                  className={editInterviewId === i.id ? "editing-row" : ""}
                >
                  {editInterviewId === i.id ? (
                    <>
                      <td>
                        <input
                          className="cell-input"
                          value={interviewEdit?.requisitionId || ""}
                          onChange={(e) =>
                            handleInterviewChange("requisitionId", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          className="cell-input"
                          value={interviewEdit?.candidateId || ""}
                          onChange={(e) =>
                            handleInterviewChange("candidateId", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          className="cell-input"
                          value={interviewEdit?.interviewRound || ""}
                          onChange={(e) =>
                            handleInterviewChange("interviewRound", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          className="cell-input"
                          type="date"
                          value={
                            interviewEdit?.interviewDate
                              ? new Date(interviewEdit.interviewDate)
                                  .toISOString()
                                  .slice(0, 10)
                              : ""
                          }
                          onChange={(e) =>
                            handleInterviewChange("interviewDate", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          className="cell-input"
                          type="date"
                          value={
                            interviewEdit?.feedbackDate
                              ? new Date(interviewEdit.feedbackDate)
                                  .toISOString()
                                  .slice(0, 10)
                              : ""
                          }
                          onChange={(e) =>
                            handleInterviewChange("feedbackDate", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          className="cell-input"
                          value={interviewEdit?.interviewResult || ""}
                          onChange={(e) =>
                            handleInterviewChange("interviewResult", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <button
                          className="btn-primary btn-xs"
                          onClick={saveInterviewEdit}
                        >
                          Save
                        </button>{" "}
                        <button
                          className="btn-secondary btn-xs"
                          onClick={cancelInterviewEdit}
                        >
                          Cancel
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{i.requisitionId}</td>
                      <td>{i.candidateId}</td>
                      <td>{i.interviewRound}</td>
                      <td>
                        {i.interviewDate
                          ? new Date(i.interviewDate).toISOString().slice(0, 10)
                          : ""}
                      </td>
                      <td>
                        {i.feedbackDate
                          ? new Date(i.feedbackDate).toISOString().slice(0, 10)
                          : ""}
                      </td>
                      <td>{i.interviewResult}</td>
                      <td>
                        <button
                          className="btn-primary btn-xs"
                          onClick={() => startInterviewEdit(i)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn-danger btn-xs"
                          style={{ marginLeft: 4, paddingInline: 6 }}
                          onClick={() => deleteInterview(i.id)}
                          title="Delete row"
                        >
                          -
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}

              {data.interviews.length === 0 && newInterviews.length === 0 && (
                <tr>
                  <td colSpan={7} className="ta-table-empty">
                    No data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* OFFER MANAGEMENT */}
      <SectionCard title="Offer Lifecycle" onAddRow={addNewOffer}>
        <div className="ta-table-container">
          <table className="ta-table">
            <thead>
              <tr>
                <th>Job ID</th>
                <th>Candidate</th>
                <th>Offer Released Date</th>
                <th>Offer Status</th>
                <th>Expected DOJ</th>
                <th>Actual DOJ</th>
                <th>Remarks</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {newOffers.map((row) => (
                <tr key={row._tempId} className="editing-row">
                  <td>
                    <input
                      className="cell-input"
                      value={row.requisitionId}
                      onChange={(e) =>
                        updateNewOffer(row._tempId, "requisitionId", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      className="cell-input"
                      value={row.candidateId}
                      onChange={(e) =>
                        updateNewOffer(row._tempId, "candidateId", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      className="cell-input"
                      type="date"
                      value={row.offerReleasedDate}
                      onChange={(e) =>
                        updateNewOffer(row._tempId, "offerReleasedDate", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      className="cell-input"
                      value={row.offerStatus}
                      onChange={(e) =>
                        updateNewOffer(row._tempId, "offerStatus", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      className="cell-input"
                      type="date"
                      value={row.expectedDoj}
                      onChange={(e) =>
                        updateNewOffer(row._tempId, "expectedDoj", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      className="cell-input"
                      type="date"
                      value={row.actualDoj}
                      onChange={(e) =>
                        updateNewOffer(row._tempId, "actualDoj", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      className="cell-input"
                      value={row.declineReason}
                      onChange={(e) =>
                        updateNewOffer(row._tempId, "declineReason", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <button
                      className="btn-primary btn-xs"
                      onClick={() => saveNewOffer(row)}
                    >
                      Save
                    </button>{" "}
                    <button
                      className="btn-secondary btn-xs"
                      onClick={() => cancelNewOffer(row._tempId)}
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              ))}

              {data.offers.map((o) => (
                <tr
                  key={o.id}
                  className={editOfferId === o.id ? "editing-row" : ""}
                >
                  {editOfferId === o.id ? (
                    <>
                      <td>
                        <input
                          className="cell-input"
                          value={offerEdit?.requisitionId || ""}
                          onChange={(e) =>
                            handleOfferChange("requisitionId", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          className="cell-input"
                          value={offerEdit?.candidateId || ""}
                          onChange={(e) =>
                            handleOfferChange("candidateId", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          className="cell-input"
                          type="date"
                          value={
                            offerEdit?.offerReleasedDate
                              ? new Date(offerEdit.offerReleasedDate)
                                  .toISOString()
                                  .slice(0, 10)
                              : ""
                          }
                          onChange={(e) =>
                            handleOfferChange("offerReleasedDate", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          className="cell-input"
                          value={offerEdit?.offerStatus || ""}
                          onChange={(e) =>
                            handleOfferChange("offerStatus", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          className="cell-input"
                          type="date"
                          value={
                            offerEdit?.expectedDoj
                              ? new Date(offerEdit.expectedDoj)
                                  .toISOString()
                                  .slice(0, 10)
                              : ""
                          }
                          onChange={(e) =>
                            handleOfferChange("expectedDoj", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          className="cell-input"
                          type="date"
                          value={
                            offerEdit?.actualDoj
                              ? new Date(offerEdit.actualDoj)
                                  .toISOString()
                                  .slice(0, 10)
                              : ""
                          }
                          onChange={(e) =>
                            handleOfferChange("actualDoj", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          className="cell-input"
                          value={offerEdit?.declineReason || ""}
                          onChange={(e) =>
                            handleOfferChange("declineReason", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <button
                          className="btn-primary btn-xs"
                          onClick={saveOfferEdit}
                        >
                          Save
                        </button>{" "}
                        <button
                          className="btn-secondary btn-xs"
                          onClick={cancelOfferEdit}
                        >
                          Cancel
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{o.requisitionId}</td>
                      <td>{o.candidateId}</td>
                      <td>
                        {o.offerReleasedDate
                          ? new Date(o.offerReleasedDate)
                              .toISOString()
                              .slice(0, 10)
                          : ""}
                      </td>
                      <td>{o.offerStatus}</td>
                      <td>
                        {o.expectedDoj
                          ? new Date(o.expectedDoj).toISOString().slice(0, 10)
                          : ""}
                      </td>
                      <td>
                        {o.actualDoj
                          ? new Date(o.actualDoj).toISOString().slice(0, 10)
                          : ""}
                      </td>
                      <td>{o.declineReason}</td>
                      <td>
                        <button
                          className="btn-primary btn-xs"
                          onClick={() => startOfferEdit(o)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn-danger btn-xs"
                          style={{ marginLeft: 4, paddingInline: 6 }}
                          onClick={() => deleteOffer(o.id)}
                          title="Delete row"
                        >
                          -
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}

              {data.offers.length === 0 && newOffers.length === 0 && (
                <tr>
                  <td colSpan={8} className="ta-table-empty">
                    No data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* JOINER PIPELINE */}
      <SectionCard
        title="Joiner Pipeline (TA-Owned)"
        onAddRow={addNewJoiner}
      >
        <div className="ta-table-container">
          <table className="ta-table">
            <thead>
              <tr>
                <th>Job ID</th>
                <th>Candidate</th>
                <th>DOJ</th>
                <th>Status</th>
                <th>Drop Risk</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {newJoiners.map((row) => (
                <tr key={row._tempId} className="editing-row">
                  <td>
                    <input
                      className="cell-input"
                      value={row.requisitionId}
                      onChange={(e) =>
                        updateNewJoiner(row._tempId, "requisitionId", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      className="cell-input"
                      value={row.candidateId}
                      onChange={(e) =>
                        updateNewJoiner(row._tempId, "candidateId", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      className="cell-input"
                      type="date"
                      value={row.joiningDate}
                      onChange={(e) =>
                        updateNewJoiner(row._tempId, "joiningDate", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      className="cell-input"
                      value={row.joiningStatus}
                      onChange={(e) =>
                        updateNewJoiner(row._tempId, "joiningStatus", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      className="cell-input"
                      value={row.onboardingStatus}
                      onChange={(e) =>
                        updateNewJoiner(row._tempId, "onboardingStatus", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <button
                      className="btn-primary btn-xs"
                      onClick={() => saveNewJoiner(row)}
                    >
                      Save
                    </button>{" "}
                    <button
                      className="btn-secondary btn-xs"
                      onClick={() => cancelNewJoiner(row._tempId)}
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              ))}

              {data.joiners.map((j) => (
                <tr
                  key={j.id}
                  className={editJoinerId === j.id ? "editing-row" : ""}
                >
                  {editJoinerId === j.id ? (
                    <>
                      <td>
                        <input
                          className="cell-input"
                          value={joinerEdit?.requisitionId || ""}
                          onChange={(e) =>
                            handleJoinerChange("requisitionId", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          className="cell-input"
                          value={joinerEdit?.candidateId || ""}
                          onChange={(e) =>
                            handleJoinerChange("candidateId", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          className="cell-input"
                          type="date"
                          value={
                            joinerEdit?.joiningDate
                              ? new Date(joinerEdit.joiningDate)
                                  .toISOString()
                                  .slice(0, 10)
                              : ""
                          }
                          onChange={(e) =>
                            handleJoinerChange("joiningDate", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          className="cell-input"
                          value={joinerEdit?.joiningStatus || ""}
                          onChange={(e) =>
                            handleJoinerChange("joiningStatus", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          className="cell-input"
                          value={joinerEdit?.onboardingStatus || ""}
                          onChange={(e) =>
                            handleJoinerChange("onboardingStatus", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <button
                          className="btn-primary btn-xs"
                          onClick={saveJoinerEdit}
                        >
                          Save
                        </button>{" "}
                        <button
                          className="btn-secondary btn-xs"
                          onClick={cancelJoinerEdit}
                        >
                          Cancel
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{j.requisitionId}</td>
                      <td>{j.candidateId}</td>
                      <td>
                        {j.joiningDate
                          ? new Date(j.joiningDate).toISOString().slice(0, 10)
                          : ""}
                      </td>
                      <td>{j.joiningStatus}</td>
                      <td>{j.onboardingStatus}</td>
                      <td>
                        <button
                          className="btn-primary btn-xs"
                          onClick={() => startJoinerEdit(j)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn-danger btn-xs"
                          style={{ marginLeft: 4, paddingInline: 6 }}
                          onClick={() => deleteJoiner(j.id)}
                          title="Delete row"
                        >
                          -
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}

              {data.joiners.length === 0 && newJoiners.length === 0 && (
                <tr>
                  <td colSpan={6} className="ta-table-empty">
                    No data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

function SectionCard({ title, children, onAddRow }) {
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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span style={{ fontSize: "11px", color: "#9ca3af" }}>
            (Operational TA view)
          </span>
          {onAddRow && (
            <button
              className="btn-primary btn-xs"
              style={{
                background: "#16a34a",
                borderColor: "#16a34a",
              }}
              onClick={onAddRow}
            >
              + Add Row
            </button>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

function SimpleTable({ columns, rows }) {
  return (
    <div className="ta-table-container">
      <table className="ta-table">
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
              <td colSpan={columns.length} className="ta-table-empty">
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
