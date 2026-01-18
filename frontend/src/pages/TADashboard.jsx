import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { API_BASE_URL } from "../config";

function TADashboard() {
  const [tiles, setTiles] = useState(null);
  const [demandByTech, setDemandByTech] = useState([]);
  const [recruiterPerf, setRecruiterPerf] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/ta/dashboard`)
      .then((res) => res.json())
      .then((data) => {
        setTiles(data.tiles || null);
        setDemandByTech(data.demandByTechnology || []);
        setRecruiterPerf(data.recruiterPerformance || []);
      })
      .catch(() => {
        setTiles(null);
        setDemandByTech([]);
        setRecruiterPerf([]);
      });
  }, []);

  const kpis = [
    {
      key: "totalApprovedDemand",
      label: "Total Approved Demand",
      color: "bg-blue-600",
    },
    {
      key: "totalJoiners",
      label: "Total Joiners",
      color: "bg-green-600",
    },
    {
      key: "offersAcceptedYetToJoin",
      label: "Offers Accepted (Yet to Join)",
      color: "bg-emerald-500",
    },
    {
      key: "offersInProgress",
      label: "Offers In Progress",
      color: "bg-amber-500",
    },
    {
      key: "offersDeclined",
      label: "Offers Declined",
      color: "bg-red-500",
    },
    {
      key: "openActivePositions",
      label: "Open Active Positions",
      color: "bg-indigo-500",
    },
    {
      key: "positionsOnHold",
      label: "Positions On Hold",
      color: "bg-yellow-500",
    },
    {
      key: "cancelledPositions",
      label: "Cancelled Positions",
      color: "bg-slate-500",
    },
    {
      key: "avgPositionAgeing",
      label: "Avg Position Ageing (Days)",
      color: "bg-sky-600",
    },
    {
      key: "avgProfileAgeing",
      label: "Avg Profile Ageing (Days)",
      color: "bg-teal-600",
    },
    {
      key: "avgTimeToFill",
      label: "Avg Time to Fill (Days)",
      color: "bg-purple-600",
    },
    {
      key: "avgTimeToStart",
      label: "Avg Time to Start (Days)",
      color: "bg-cyan-600",
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">TA Dashboard</h2>

      {/* KPI CARDS – same style as main Dashboard */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {kpis.map(({ key, label, color }) => (
          <KpiCard
            key={key}
            title={label}
            value={
              tiles && tiles[key] !== undefined && tiles[key] !== null
                ? Math.round(tiles[key])
                : "--"
            }
            color={color}
          />
        ))}
      </div>

      {/* SECTION: DEMAND VS FULFILMENT BY TECHNOLOGY */}
      <div className="bg-white rounded shadow p-4 mb-6">
        <h3 className="font-semibold mb-3">Demand vs Fulfilment by Technology</h3>
        <SimpleTable
          columns={[
            "Technology",
            "Approved Demand",
            "Joined",
            "Offers Accepted",
            "In Progress",
            "Open Active",
            "On Hold",
            "Cancelled",
          ]}
          rows={demandByTech.map((r) => ({
            Technology: r.technology,
            "Approved Demand": r.approvedDemand,
            Joined: r.joined,
            "Offers Accepted": r.offersAccepted,
            "In Progress": r.inProgress,
            "Open Active": r.openActive,
            "On Hold": r.onHold,
            Cancelled: r.cancelled,
          }))}
        />
      </div>

      {/* SECTION: RECRUITER PERFORMANCE */}
      <div className="bg-white rounded shadow p-4 mb-6">
        <h3 className="font-semibold mb-3">Recruiter Performance Snapshot</h3>
        <SimpleTable
          columns={[
            "Recruiter",
            "Positions Assigned",
            "Profiles Submitted",
            "Interviews Scheduled",
            "Offers Released",
            "Joiners",
            "Avg TAT (Days)",
          ]}
          rows={recruiterPerf.map((r) => ({
            Recruiter: r.recruiter,
            "Positions Assigned": r.positionsAssigned,
            "Profiles Submitted": r.profilesSubmitted,
            "Interviews Scheduled": r.interviewsScheduled,
            "Offers Released": r.offersReleased,
            Joiners: r.joiners,
            "Avg TAT (Days)": Math.round(r.avgTatDays || 0),
          }))}
        />
      </div>

      {/* SECTION: AGEING & RISK (placeholder until we add explicit logic) */}
      <div className="bg-white rounded shadow p-4">
        <h3 className="font-semibold mb-3">Ageing Risk Analysis</h3>
        <SimpleTable
          columns={[
            "Technology",
            "<30 Days",
            "30-60 Days",
            "60+ Days",
            "Avg Ageing",
            "Risk Flag",
          ]}
          rows={[]}
        />
      </div>
    </div>
  );
}

function SimpleTable({ columns, rows }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-[12.5px] leading-tight">
        <thead className="bg-gray-100">
          <tr className="text-gray-700 uppercase text-[11px] tracking-wide">
            {columns.map((c) => (
              <th key={c} className="px-2 py-1.5 text-left whitespace-nowrap">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows && rows.length > 0 ? (
            rows.map((row, idx) => (
              <tr key={idx} className="border-t hover:bg-gray-50">
                {columns.map((col) => (
                  <td key={col} className="px-2 py-1.5">
                    {row[col] ?? ""}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                className="px-2 py-3 text-center text-gray-400"
              >
                No data available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function KpiCard({ title, value, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`${color} text-white rounded-lg p-6 shadow`}
    >
      <div className="text-sm opacity-80">{title}</div>
      <div className="text-3xl font-bold">{value}</div>
    </motion.div>
  );
}

export default TADashboard;
