"use client"

import { useEffect, useState } from "react"
import api from "../api"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import AudioModal from "../components/AudioModal"
import "../styles/professional-dashboard.css"

export default function Calls() {
  const [calls, setCalls] = useState([])
  const [filters, setFilters] = useState({
    employeeId: "",
    phoneNumber: "",
    callType: "",
    startDate: "",
    endDate: "",
  })
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [totalPages, setTotalPages] = useState(1)
  const [openAudio, setOpenAudio] = useState(null)

  useEffect(() => {
    loadCalls()
  }, [page])

  async function loadCalls(params = {}) {
    try {
      const query = { page, limit, ...filters, ...params }
      const res = await api.get("/api/calls", { params: query })
      const data = res.data
      const rows = data.calls || data
      setCalls(rows)
      if (data.total) setTotalPages(Math.ceil(data.total / limit))
      else setTotalPages(1)
    } catch (e) {
      console.error(e)
    }
  }

  function onFilterApply() {
    setPage(1)
    loadCalls({ page: 1 })
  }

  function onReset() {
    setFilters({
      employeeId: "",
      phoneNumber: "",
      callType: "",
      startDate: "",
      endDate: "",
    })
    setPage(1)
    loadCalls({ page: 1 })
  }

  function doExport() {
    const base = process.env.REACT_APP_API_BASE || "http://localhost:5000"
    window.open(base + "/api/export", "_blank")
  }

  const incomingCount = calls.filter((c) => c.callType === "incoming").length
  const outgoingCount = calls.filter((c) => c.callType === "outgoing").length
  const totalDuration =
    calls.reduce((sum, c) => sum + Math.max(0, Number(c.endMs || 0) - Number(c.startMs || 0)), 0) / 1000 / 60

  const callTypeData = [
    { name: "Incoming", value: incomingCount },
    { name: "Outgoing", value: outgoingCount },
  ]

  const topEmployees = calls
    .reduce((acc, call) => {
      const existing = acc.find((e) => e.name === call.employeeId)
      if (existing) {
        existing.calls += 1
      } else {
        acc.push({ name: call.employeeId, calls: 1 })
      }
      return acc
    }, [])
    .slice(0, 8)
    .sort((a, b) => b.calls - a.calls)

  const COLORS = ["#10b981", "#f59e0b"]

  return (
    <div className="main-content">
      <div className="page-header">
        <h1 className="page-title">Calls</h1>
        <button className="btn btn-primary" onClick={doExport} style={{ marginTop: "12px" }}>
          📥 Export CSV
        </button>
      </div>

      <div className="grid-container">
        <div className="stat-card">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "14px" }}>📞</span>
            <div style={{ flex: 1 }}>
              <div className="stat-label">Total Calls</div>
              <div className="stat-value">{calls.length}</div>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "14px" }}>📥</span>
            <div style={{ flex: 1 }}>
              <div className="stat-label">Incoming</div>
              <div className="stat-value">{incomingCount}</div>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "14px" }}>📤</span>
            <div style={{ flex: 1 }}>
              <div className="stat-label">Outgoing</div>
              <div className="stat-value">{outgoingCount}</div>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "14px" }}>⏱️</span>
            <div style={{ flex: 1 }}>
              <div className="stat-label">Total Duration</div>
              <div className="stat-value">{totalDuration.toFixed(0)}m</div>
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "20px",
          marginBottom: "20px",
        }}
      >
        <div className="chart-card">
          <h3 className="chart-title">Call Type Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={callTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {callTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "6px" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Top Employees by Calls</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topEmployees} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" stroke="#6b7280" fontSize={11} />
              <YAxis dataKey="name" type="category" stroke="#6b7280" width={80} fontSize={11} />
              <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "6px" }} />
              <Bar dataKey="calls" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-card">
        <h3 className="chart-title">Filter Calls</h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "12px",
            marginBottom: "16px",
          }}
        >
          <div className="form-group">
            <label className="form-label">Employee ID</label>
            <input
              className="form-input"
              placeholder="Enter ID"
              value={filters.employeeId}
              onChange={(e) => setFilters((f) => ({ ...f, employeeId: e.target.value }))}
              style={{ fontSize: "12px", padding: "8px" }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              className="form-input"
              placeholder="Phone"
              value={filters.phoneNumber}
              onChange={(e) => setFilters((f) => ({ ...f, phoneNumber: e.target.value }))}
              style={{ fontSize: "12px", padding: "8px" }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Call Type</label>
            <select
              className="form-select"
              value={filters.callType}
              onChange={(e) => setFilters((f) => ({ ...f, callType: e.target.value }))}
              style={{ fontSize: "12px", padding: "8px" }}
            >
              <option value="">All types</option>
              <option value="incoming">Incoming</option>
              <option value="outgoing">Outgoing</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Start Date</label>
            <input
              type="date"
              className="form-input"
              value={filters.startDate}
              onChange={(e) => setFilters((f) => ({ ...f, startDate: e.target.value }))}
              style={{ fontSize: "12px", padding: "8px" }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">End Date</label>
            <input
              type="date"
              className="form-input"
              value={filters.endDate}
              onChange={(e) => setFilters((f) => ({ ...f, endDate: e.target.value }))}
              style={{ fontSize: "12px", padding: "8px" }}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <button className="btn btn-primary" onClick={onFilterApply} style={{ fontSize: "11px", padding: "8px 12px" }}>
            🔍 Apply
          </button>
          <button className="btn btn-secondary" onClick={onReset} style={{ fontSize: "11px", padding: "8px 12px" }}>
            ↺ Reset
          </button>
        </div>
      </div>

      <div className="chart-card">
        <h3 className="chart-title">Call Records</h3>
        <div className="table-container">
          <table style={{ fontSize: "12px" }}>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Phone</th>
                <th>Type</th>
                <th>Start Time</th>
                <th>Duration</th>
                <th>Audio</th>
              </tr>
            </thead>
            <tbody>
              {calls.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                    No calls found
                  </td>
                </tr>
              )}

              {calls.map((c) => (
                <tr key={c.id}>
                  <td>{c.employeeId}</td>
                  <td>
                    <code style={{ fontSize: "11px" }}>{c.phoneNumber}</code>
                  </td>
                  <td>
                    <span
                      className={`badge ${c.callType === "incoming" ? "badge-info" : "badge-success"}`}
                      style={{ fontSize: "10px" }}
                    >
                      {c.callType}
                    </span>
                  </td>
                  <td style={{ fontSize: "11px" }}>{c.startMs ? new Date(Number(c.startMs)).toLocaleString() : "-"}</td>
                  <td>{Math.floor((Number(c.endMs || 0) - Number(c.startMs || 0)) / 1000)}s</td>
                  <td>
                    {c.filename ? (
                      <button
                        style={{
                          background: "none",
                          border: "none",
                          color: "#0ea5e9",
                          cursor: "pointer",
                          fontSize: "11px",
                          fontWeight: 600,
                          padding: 0,
                        }}
                        onClick={() =>
                          setOpenAudio({
                            src: `${process.env.REACT_APP_API_BASE || "http://localhost:5000"}/files/${c.filename}`,
                            filename: c.filename,
                            meta: {
                              employeeId: c.employeeId,
                              phoneNumber: c.phoneNumber,
                              when: c.startMs ? new Date(Number(c.startMs)).toLocaleString() : "",
                            },
                          })
                        }
                      >
                        ▶️
                      </button>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "16px",
          marginTop: "20px",
          padding: "16px",
        }}
      >
        <button
          className="btn btn-secondary"
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
          style={{ fontSize: "11px", padding: "6px 10px" }}
        >
          ← Prev
        </button>
        <span style={{ color: "#6b7280", fontWeight: 600, fontSize: "12px" }}>
          Page <span style={{ color: "#f59e0b" }}>{page}</span> of{" "}
          <span style={{ color: "#f59e0b" }}>{totalPages}</span>
        </span>
        <button
          className="btn btn-secondary"
          disabled={page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
          style={{ fontSize: "11px", padding: "6px 10px" }}
        >
          Next →
        </button>
      </div>

      {openAudio && (
        <AudioModal
          src={openAudio.src}
          filename={openAudio.filename}
          meta={openAudio.meta}
          onClose={() => setOpenAudio(null)}
        />
      )}
    </div>
  )
}
