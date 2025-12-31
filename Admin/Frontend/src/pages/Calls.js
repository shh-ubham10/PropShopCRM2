// src/pages/Calls.js
import React, { useEffect, useState } from "react";
import api from "../api";
import AudioModal from "../components/AudioModal";

export default function Calls() {
  const [calls, setCalls] = useState([]);
  const [filters, setFilters] = useState({
    employeeId: "",
    phoneNumber: "",
    callType: "",
    startDate: "",
    endDate: "",
  });

  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [openAudio, setOpenAudio] = useState(null);

  useEffect(() => {
    loadCalls();
  }, [page]);

  async function loadCalls(params = {}) {
    try {
      const query = { page, limit, ...filters, ...params };
      const res = await api.get("/api/calls", { params: query });
      const data = res.data;

      const rows = data.calls || data;
      setCalls(rows);

      if (data.total) setTotalPages(Math.ceil(data.total / limit));
      else setTotalPages(1);
    } catch (e) {
      console.error(e);
    }
  }

  function onFilterApply() {
    setPage(1);
    loadCalls({ page: 1 });
  }

  function onReset() {
    setFilters({
      employeeId: "",
      phoneNumber: "",
      callType: "",
      startDate: "",
      endDate: "",
    });
    setPage(1);
    loadCalls({ page: 1 });
  }

  function doExport() {
    const base = process.env.REACT_APP_API_BASE || "http://localhost:5000";
    window.open(base + "/api/export", "_blank");
  }

  return (
    <div>

      {/* HEADER */}
      <div style={styles.header}>
        <h2 style={{ margin: 0 }}>Calls</h2>
        <button style={styles.primary} onClick={doExport}>
          Export CSV
        </button>
      </div>

      {/* FILTER CARD — Updated Version A */}
      <div style={styles.filterCard}>

        <input
          placeholder="Employee ID"
          value={filters.employeeId}
          onChange={(e) =>
            setFilters((f) => ({ ...f, employeeId: e.target.value }))
          }
          style={styles.input}
        />

        <input
          placeholder="Phone number"
          value={filters.phoneNumber}
          onChange={(e) =>
            setFilters((f) => ({ ...f, phoneNumber: e.target.value }))
          }
          style={styles.input}
        />

        <select
          value={filters.callType}
          onChange={(e) =>
            setFilters((f) => ({ ...f, callType: e.target.value }))
          }
          style={styles.input}
        >
          <option value="">All types</option>
          <option value="incoming">Incoming</option>
          <option value="outgoing">Outgoing</option>
        </select>

        <input
          type="date"
          value={filters.startDate}
          onChange={(e) =>
            setFilters((f) => ({ ...f, startDate: e.target.value }))
          }
          style={styles.input}
        />

        <input
          type="date"
          value={filters.endDate}
          onChange={(e) =>
            setFilters((f) => ({ ...f, endDate: e.target.value }))
          }
          style={styles.input}
        />

        <button style={styles.primary} onClick={onFilterApply}>
          Apply
        </button>

        <button style={styles.secondary} onClick={onReset}>
          Reset
        </button>
      </div>

      {/* TABLE CARD */}
      <div style={styles.tableCard}>
        <table className="table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Number</th>
              <th>Type</th>
              <th>Start</th>
              <th>Duration</th>
              <th>Audio</th>
            </tr>
          </thead>

          <tbody>
            {calls.length === 0 && (
              <tr>
                <td
                  colSpan="6"
                  style={{
                    textAlign: "center",
                    padding: 20,
                    color: "var(--muted-text)",
                  }}
                >
                  No calls found
                </td>
              </tr>
            )}

            {calls.map((c) => (
              <tr key={c.id}>
                <td>{c.employeeId}</td>
                <td>{c.phoneNumber}</td>
                <td>{c.callType}</td>
                <td>
                  {c.startMs
                    ? new Date(Number(c.startMs)).toLocaleString()
                    : "-"}
                </td>
                <td>
                  {Math.floor(
                    (Number(c.endMs || 0) - Number(c.startMs || 0)) / 1000
                  )}
                  s
                </td>

                <td>
                  {c.filename ? (
                    <>
                      <button
                        style={styles.playSmall}
                        onClick={() =>
                          setOpenAudio({
                            src: `${
                              process.env.REACT_APP_API_BASE ||
                              "http://localhost:5000"
                            }/files/${c.filename}`,
                            filename: c.filename,
                            meta: {
                              employeeId: c.employeeId,
                              phoneNumber: c.phoneNumber,
                              when: c.startMs
                                ? new Date(Number(c.startMs)).toLocaleString()
                                : "",
                            },
                          })
                        }
                      >
                        Play
                      </button>

                      <a
                        href={`${
                          process.env.REACT_APP_API_BASE ||
                          "http://localhost:5000"
                        }/files/${c.filename}`}
                        download
                        style={styles.downloadLink}
                      >
                        Download
                      </a>
                    </>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div style={styles.pager}>
        <button
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
          style={styles.pagerBtn}
        >
          Prev
        </button>

        <span style={{ color: "var(--muted-text)" }}>
          Page {page} / {totalPages}
        </span>

        <button
          disabled={page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
          style={styles.pagerBtn}
        >
          Next
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
  );
}

/* ----------------------------------------- */
/* STYLES — MATCH DASHBOARD EXACTLY          */
/* ----------------------------------------- */
const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  primary: {
    padding: "10px 14px",
    background: "var(--accent)",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 600,
  },

  secondary: {
    padding: "10px 14px",
    background: "var(--muted-surface)",
    color: "var(--text)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 500,
  },

  filterCard: {
    background: "var(--surface)",
    padding: 18,
    borderRadius: 12,
    boxShadow: "var(--shadow)",
    border: "1px solid var(--border)",
    display: "flex",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },

  input: {
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid var(--border)",
    background: "var(--surface)",
    minWidth: 150,
  },

  tableCard: {
    background: "var(--surface)",
    borderRadius: 12,
    boxShadow: "var(--shadow)",
    border: "1px solid var(--border)",
    padding: 16,
    marginTop: 10,
  },

  playSmall: {
    padding: "6px 10px",
    borderRadius: 8,
    background: "var(--accent)",
    color: "#fff",
    border: "none",
    cursor: "pointer",
  },

  downloadLink: {
    marginLeft: 10,
    textDecoration: "none",
    color: "var(--accent)",
    fontSize: 14,
  },

  pager: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
  },

  pagerBtn: {
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px solid var(--border)",
    background: "var(--surface)",
    cursor: "pointer",
  },
};
