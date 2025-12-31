// src/pages/Dashboard.js
import React, { useEffect, useState } from "react";
import api from "../api";
import { Pie, Bar, Line } from "react-chartjs-2";
import AudioModal from "../components/AudioModal";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [recent, setRecent] = useState([]);
  const [employeeNames, setEmployeeNames] = useState([]);
  const [employeeCounts, setEmployeeCounts] = useState([]);
  const [openAudio, setOpenAudio] = useState(null);
  const [filters, setFilters] = useState({ employeeId: "", startDate: "", endDate: "" });
  const navigate = useNavigate();

  useEffect(() => {
    loadSummary();
    loadRecent();
  }, []);
  //commit


//CHNAGES FILES
  

  async function loadSummary() {
    try {
      const res = await api.get("/api/summary");
      const data = res.data;
      setSummary(data);

      const names = Object.keys(data.byEmployee || {});
      const counts = Object.values(data.byEmployee || {});
      setEmployeeNames(names);
      setEmployeeCounts(counts);
    } catch (e) { console.error(e); }
  }

 async function loadRecent() {
  try {
    const res = await api.get("/api/calls");
    setRecent((res.data.calls || []).slice(0, 10));
  } catch (e) {
    console.error(e);
  }
}


  async function applyExport() {
    window.open((process.env.REACT_APP_API_BASE || "http://localhost:5000") + "/api/export", "_blank");
  }

  const onEmployeeClick = (id) => navigate(`/employee/${encodeURIComponent(id)}`);

  if (!summary) return <div>Loading...</div>;

  return (
    <div>
      {/* HEADER */}
      <div style={styles.header}>
        <h1 style={styles.title}>Dashboard</h1>
        <button style={styles.secondary} onClick={applyExport}>Export CSV</button>
      </div>

      {/* SUMMARY CARDS */}
      <div style={styles.cardsGrid}>
        <StatCard title="Total Calls" value={summary.total} />
        <StatCard title="Incoming" value={summary.incoming} />
        <StatCard title="Outgoing" value={summary.outgoing} />
        <StatCard title="Total Duration (min)" value={(summary.totalDuration || 0).toFixed(1)} />
      </div>

      {/* CHARTS */}
      <div style={styles.chartsRow}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Incoming vs Outgoing</h3>
          <div style={styles.chartWrap}>
            <Pie
              data={{
                labels: ["Incoming", "Outgoing"],
                datasets: [{
                  data: [summary.incoming || 0, summary.outgoing || 0],
                  backgroundColor: ["#3b82f6", "#ef4444"]
                }]
              }}
            />
          </div>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Calls per Employee</h3>

          <div style={styles.chartWrap}>
            <Bar
              data={{
                labels: employeeNames,
                datasets: [{
                  label: "Calls",
                  data: employeeCounts,
                  backgroundColor: "#8b5cf6"
                }]
              }}
            />
          </div>

          <div style={styles.employeeList}>
            {employeeNames.map((n, i) => (
              <button key={n} style={styles.empBtn} onClick={() => onEmployeeClick(n)}>
                {n} <span style={styles.empBadge}>{employeeCounts[i]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* TREND LINE CHART */}
      <div style={{ marginTop: 18 }}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Calls Trend (Last 30 Days)</h3>
          <div style={styles.chartWrap}>
            <Line
              data={{
                labels: Array.from({ length: 12 }, (_, i) => `Day ${i + 1}`),
                datasets: [{
                  label: "Calls",
                  data: Array.from({ length: 12 }, () => Math.floor(Math.random() * 8) + 2),
                  borderColor: "#06b6d4",
                  fill: false
                }]
              }}
            />
          </div>
        </div>
      </div>

      {/* RECENT + QUICK FILTER */}
      <div style={styles.bottomGrid}>
        {/* RECENT CALLS */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Recent Calls</h3>

          <table className="table">
            <thead>
              <tr><th>Employee</th><th>Number</th><th>Type</th><th>Duration</th><th>When</th><th>Action</th></tr>
            </thead>
            <tbody>
              {recent.map(c => (
                <tr key={c.id}>
                  <td>{c.employeeId}</td>
                  <td>{c.phoneNumber}</td>
                  <td>{c.callType}</td>
                  <td>{Math.max(0, Math.floor((Number(c.endMs || 0) - Number(c.startMs || 0)) / 1000))}s</td>
                  <td>{c.startMs ? new Date(Number(c.startMs)).toLocaleString() : "-"}</td>
                  <td>
                    {c.filename ? (
                      <button style={styles.playSmall} onClick={() =>
                        setOpenAudio({
                          src: `${process.env.REACT_APP_API_BASE || "http://localhost:5000"}/files/${c.filename}`,
                          filename: c.filename,
                          meta: {
                            employeeId: c.employeeId,
                            phoneNumber: c.phoneNumber,
                            when: c.startMs ? new Date(Number(c.startMs)).toLocaleString() : ""
                          }
                        })
                      }>
                        Play
                      </button>
                    ) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* QUICK FILTERS */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Quick Filters</h3>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <select value={filters.employeeId} onChange={(e) => setFilters(f => ({ ...f, employeeId: e.target.value }))} style={styles.input}>
              <option value="">All Employees</option>
              {employeeNames.map(n => <option key={n} value={n}>{n}</option>)}
            </select>

            <input type="date" value={filters.startDate} onChange={(e) => setFilters(f => ({ ...f, startDate: e.target.value }))} style={styles.input} />
            <input type="date" value={filters.endDate} onChange={(e) => setFilters(f => ({ ...f, endDate: e.target.value }))} style={styles.input} />

            <div style={{ display: "flex", gap: 8 }}>
              <button style={styles.primary}>Apply</button>
              <button style={styles.secondary} onClick={() => setFilters({ employeeId: "", startDate: "", endDate: "" })}>Reset</button>
            </div>
          </div>
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
  );
}

/* --- Stat Card --- */
function StatCard({ title, value }) {
  return (
    <div style={styles.statCard}>
      <div style={{ color: "var(--muted-text)", fontSize: 13 }}>{title}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text)" }}>{value}</div>
    </div>
  );
}

/* --- Styles (Improved but Minimal Changes) --- */
const styles = {
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  title: { margin: 0 },

  cardsGrid: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 18 },
  statCard: { background: "var(--surface)", padding: 16, borderRadius: 12, boxShadow: "var(--shadow)", border: "1px solid var(--border)" },

  chartsRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 18 },

  card: { background: "var(--surface)", padding: 16, borderRadius: 12, boxShadow: "var(--shadow)", border: "1px solid var(--border)" },
  cardTitle: { margin: 0, marginBottom: 12, fontSize: 16 },

  chartWrap: { padding: 10, height: 280 },

  employeeList: { marginTop: 12, display: "flex", flexWrap: "wrap", gap: 8 },
  empBtn: { background: "var(--muted-surface)", border: "1px solid var(--border)", padding: "6px 10px", borderRadius: 8, cursor: "pointer" },
  empBadge: { marginLeft: 8, background: "var(--surface)", padding: "2px 6px", borderRadius: 6, fontSize: 12 },

  bottomGrid: { display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginTop: 18 },

  playSmall: { padding: "6px 8px", borderRadius: 8, background: "var(--accent)", color: "#fff", border: "none", cursor: "pointer" },
  input: { padding: "8px 10px", borderRadius: 8, border: "1px solid var(--border)" },

  primary: { padding: "10px 12px", borderRadius: 8, background: "var(--accent)", color: "#fff", border: "none", cursor: "pointer" },
  secondary: { padding: "10px 12px", borderRadius: 8, background: "var(--muted-surface)", color: "var(--text)", border: "1px solid var(--border)", cursor: "pointer" }
};
