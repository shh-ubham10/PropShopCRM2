"use client"

import { useEffect, useState } from "react"
import api from "../api"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import AudioModal from "../components/AudioModal"
import { useNavigate } from "react-router-dom"
import "../styles/professional-dashboard.css"

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [hourlyData, setHourlyData] = useState([])
  const [calls, setCalls] = useState([])
  const [openAudio, setOpenAudio] = useState(null)
  const [timeFrame, setTimeFrame] = useState("monthly")
  const navigate = useNavigate()

  useEffect(() => {
    loadData()
  }, [timeFrame])

  async function loadData() {
    try {
      const summaryRes = await api.get("/api/summary")
      setSummary(summaryRes.data)

      const callsRes = await api.get("/api/calls?limit=1000")
      const allCalls = callsRes.data.calls || []
      setCalls(allCalls.slice(0, 10))

      const hourlyMap = {}
      const timeSlots = [
        "Before 10AM",
        "10:00AM - 10:59AM",
        "11:00AM - 11:59AM",
        "12:00PM - 12:59PM",
        "01:00PM - 01:59PM",
        "02:00PM - 02:59PM",
      ]

      timeSlots.forEach((slot) => {
        hourlyMap[slot] = { slot, calls: 0, connected: 0, duration: 0 }
      })

      allCalls.forEach((call) => {
        const hour = call.startMs ? new Date(Number(call.startMs)).getHours() : 0
        let slot = "Before 10AM"
        if (hour >= 10 && hour < 11) slot = "10:00AM - 10:59AM"
        else if (hour >= 11 && hour < 12) slot = "11:00AM - 11:59AM"
        else if (hour >= 12 && hour < 13) slot = "12:00PM - 12:59PM"
        else if (hour >= 13 && hour < 14) slot = "01:00PM - 01:59PM"
        else if (hour >= 14 && hour < 15) slot = "02:00PM - 02:59PM"

        if (hourlyMap[slot]) {
          hourlyMap[slot].calls += 1
          if (call.callType === "incoming") hourlyMap[slot].connected += 1
          hourlyMap[slot].duration += Number(call.endMs || 0) - Number(call.startMs || 0)
        }
      })

      setHourlyData(Object.values(hourlyMap))
    } catch (e) {
      console.error(e)
    }
  }

  function applyExport() {
    window.open((process.env.REACT_APP_API_BASE || "http://localhost:5000") + "/api/export", "_blank")
  }

  if (!summary) return <div style={{ padding: "40px", color: "#6b7280" }}>Loading dashboard...</div>

  const totalDuration = Math.floor((summary.totalDuration || 0) / 60)
  const hours = Math.floor(totalDuration / 60)
  const minutes = totalDuration % 60

  return (
    <div className="main-content">
      <div className="page-header">
        <h1 className="page-title">Reports</h1>
        <button className="btn btn-primary" onClick={applyExport} style={{ marginTop: "12px" }}>
          📥 Export CSV
        </button>
      </div>

      <div className="grid-container">
        <div className="stat-card">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "14px" }}>📞</span>
            <div style={{ flex: 1 }}>
              <div className="stat-label">Total Calls</div>
              <div className="stat-value">{summary.total || 0}</div>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "14px" }}>⏱️</span>
            <div style={{ flex: 1 }}>
              <div className="stat-label">Total Duration</div>
              <div className="stat-value">
                {hours}h {minutes}m
              </div>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "14px" }}>☎️</span>
            <div style={{ flex: 1 }}>
              <div className="stat-label">Connected Calls</div>
              <div className="stat-value">{summary.incoming || 0}</div>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "14px" }}>👤</span>
            <div style={{ flex: 1 }}>
              <div className="stat-label">Unique Clients</div>
              <div className="stat-value">{Object.keys(summary.byEmployee || {}).length}</div>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "14px" }}>✕</span>
            <div style={{ flex: 1 }}>
              <div className="stat-label">Unanswered Calls</div>
              <div className="stat-value">{summary.outgoing || 0}</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "20px", marginBottom: "20px" }}>
        <div className="chart-card">
          <div style={{ marginBottom: "16px" }}>
            <h3 className="chart-title">Reporting & Analytics</h3>
            <div style={{ display: "flex", gap: "12px" }}>
              {["Monthly", "Daily", "Hourly"].map((label) => (
                <button
                  key={label}
                  onClick={() => setTimeFrame(label.toLowerCase())}
                  style={{
                    padding: "6px 12px",
                    background: timeFrame === label.toLowerCase() ? "#1f2937" : "#f3f4f6",
                    color: timeFrame === label.toLowerCase() ? "#fff" : "#6b7280",
                    border: "none",
                    borderRadius: "4px",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={hourlyData.slice(0, 6)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="slot" stroke="#6b7280" fontSize={11} />
              <YAxis stroke="#6b7280" fontSize={11} />
              <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "6px" }} />
              <Legend />
              <Bar dataKey="calls" fill="#10b981" name="Calls" />
              <Bar dataKey="connected" fill="#f59e0b" name="Connected" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Hourly Calls vs Connected Calls</h3>
          <div style={{ fontSize: "11px", color: "#f59e0b", marginBottom: "12px", fontWeight: 600 }}>
            Total Calls: {summary.total} | Connected: {summary.incoming || 0} | Daily Avg: 20
          </div>
          <div style={{ overflowY: "auto", maxHeight: "250px" }}>
            <table style={{ fontSize: "12px" }}>
              <thead>
                <tr>
                  <th>Hourly Time Slot</th>
                  <th>Calls</th>
                  <th>Connected</th>
                  <th>Duration (%)</th>
                </tr>
              </thead>
              <tbody>
                {hourlyData.map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.slot}</td>
                    <td>{row.calls}</td>
                    <td>{row.connected}</td>
                    <td>{row.calls > 0 ? ((row.duration / (summary.totalDuration || 1)) * 100).toFixed(0) : 0}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="chart-card">
        <h3 className="chart-title">Call Recording</h3>
        <div className="table-container">
          <table style={{ fontSize: "12px" }}>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Phone</th>
                <th>Type</th>
                <th>Duration</th>
                <th>When</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {calls.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                    No calls yet
                  </td>
                </tr>
              ) : (
                calls.map((c) => (
                  <tr key={c.id}>
                    <td>{c.employeeId}</td>
                    <td>
                      <code style={{ fontSize: "11px" }}>{c.phoneNumber}</code>
                    </td>
                    <td>
                      <span className={`badge ${c.callType === "incoming" ? "badge-info" : "badge-success"}`}>
                        {c.callType}
                      </span>
                    </td>
                    <td>{Math.floor((Number(c.endMs || 0) - Number(c.startMs || 0)) / 1000)}s</td>
                    <td style={{ fontSize: "11px" }}>
                      {c.startMs ? new Date(Number(c.startMs)).toLocaleString() : "-"}
                    </td>
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
                          ▶️ Play
                        </button>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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
