// src/pages/Employees.js
import React, { useEffect, useState } from "react";
import api from "../api";

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null); // employee being edited
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const emptyForm = {
    name: "",
    employeeId: "",
    phone: "",
    role: "",
    status: "active",
  };
  const [form, setForm] = useState(emptyForm);

  // Load employees from API
  useEffect(() => {
    loadEmployees();
  }, []);

  async function loadEmployees() {
    setLoading(true);
    try {
      const res = await api.get("/api/employees");
      // expect array like [{id, name, employeeId, phone, role, status, totalCalls}]
      setEmployees(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function openAddModal() {
    setSelected(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEditModal(emp) {
    setSelected(emp);
    setForm({
      name: emp.name || "",
      employeeId: emp.employeeId || "",
      phone: emp.phone || "",
      role: emp.role || "",
      status: emp.status || "active",
    });
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.name || !form.employeeId) return;

    try {
      setSaving(true);
      if (selected && selected.id) {
        await api.put(`/api/employees/${selected.id}`, form);
      } else {
        await api.post("/api/employees", form);
      }
      setModalOpen(false);
      await loadEmployees();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(emp) {
    if (!window.confirm(`Delete employee ${emp.name}?`)) return;
    try {
      await api.delete(`/api/employees/${emp.id}`);
      await loadEmployees();
    } catch (e) {
      console.error(e);
    }
  }

  // Derived stats for cards
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(e => e.status === "active").length;
  const inactiveEmployees = employees.filter(e => e.status === "inactive").length;
  const topCaller = employees
    .slice()
    .sort((a, b) => (b.totalCalls || 0) - (a.totalCalls || 0))[0];

  const filtered = employees.filter(e => {
    const q = search.toLowerCase();
    return (
      e.name?.toLowerCase().includes(q) ||
      e.employeeId?.toLowerCase().includes(q) ||
      e.phone?.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      {/* HEADER */}
      <div style={styles.header}>
        <h2 style={{ margin: 0 }}>Employees</h2>
        <button style={styles.primary} onClick={openAddModal}>
          + Add Employee
        </button>
      </div>

      {/* SUMMARY CARDS */}
      <div style={styles.cardsRow}>
        <StatCard label="Total Employees" value={totalEmployees} />
        <StatCard label="Active" value={activeEmployees} />
        <StatCard label="Inactive" value={inactiveEmployees} />
        <StatCard
          label="Top Caller"
          value={topCaller ? topCaller.name : "—"}
          sub={topCaller ? `${topCaller.totalCalls || 0} calls` : ""}
        />
      </div>

      {/* SEARCH + FILTER BAR */}
      <div style={styles.filterBar}>
        <input
          placeholder="Search by name, ID or phone"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={styles.searchInput}
        />
        {/* could add role/status filters here later */}
      </div>

      {/* TABLE CARD */}
      <div style={styles.tableCard}>
        {loading ? (
          <div style={{ padding: 20, textAlign: "center", color: "var(--muted-text)" }}>
            Loading employees...
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Employee ID</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Status</th>
                <th>Total Calls</th>
                <th style={{ width: 140 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: 20, color: "var(--muted-text)" }}>
                    No employees found
                  </td>
                </tr>
              )}

              {filtered.map(emp => (
                <tr key={emp.id}>
                  <td>{emp.name}</td>
                  <td>{emp.employeeId}</td>
                  <td>{emp.phone}</td>
                  <td>{emp.role || "—"}</td>
                  <td>
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: 999,
                        fontSize: 12,
                        fontWeight: 600,
                        background:
                          emp.status === "inactive"
                            ? "#fee2e2"
                            : "#dcfce7",
                        color:
                          emp.status === "inactive"
                            ? "#b91c1c"
                            : "#15803d",
                      }}
                    >
                      {emp.status || "active"}
                    </span>
                  </td>
                  <td>{emp.totalCalls || 0}</td>
                  <td>
                    <button
                      style={styles.smallBtn}
                      onClick={() => openEditModal(emp)}
                    >
                      Edit
                    </button>
                    <button
                      style={styles.smallDanger}
                      onClick={() => handleDelete(emp)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div style={styles.modalBackdrop}>
          <div style={styles.modalCard}>
            <h3 style={{ marginTop: 0, marginBottom: 12 }}>
              {selected ? "Edit Employee" : "Add Employee"}
            </h3>

            <div style={styles.modalBody}>
              <label style={styles.label}>
                Name
                <input
                  style={styles.modalInput}
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                />
              </label>

              <label style={styles.label}>
                Employee ID
                <input
                  style={styles.modalInput}
                  value={form.employeeId}
                  onChange={e =>
                    setForm(f => ({ ...f, employeeId: e.target.value }))
                  }
                />
              </label>

              <label style={styles.label}>
                Phone
                <input
                  style={styles.modalInput}
                  value={form.phone}
                  onChange={e =>
                    setForm(f => ({ ...f, phone: e.target.value }))
                  }
                />
              </label>

              <label style={styles.label}>
                Role
                <input
                  style={styles.modalInput}
                  value={form.role}
                  onChange={e =>
                    setForm(f => ({ ...f, role: e.target.value }))
                  }
                />
              </label>

              <label style={styles.label}>
                Status
                <select
                  style={styles.modalInput}
                  value={form.status}
                  onChange={e =>
                    setForm(f => ({ ...f, status: e.target.value }))
                  }
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </label>
            </div>

            <div style={styles.modalFooter}>
              <button
                style={styles.secondary}
                onClick={() => setModalOpen(false)}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                style={styles.primary}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* Small stat card component */
function StatCard({ label, value, sub }) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statLabel}>{label}</div>
      <div style={styles.statValue}>{value}</div>
      {sub && <div style={styles.statSub}>{sub}</div>}
    </div>
  );
}

/* Premium styles */
const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },

  cardsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 16,
    marginBottom: 18,
  },

  statCard: {
    background: "var(--surface)",
    borderRadius: 14,
    padding: 16,
    boxShadow: "var(--shadow)",
    border: "1px solid var(--border)",
  },

  statLabel: {
    fontSize: 13,
    color: "var(--muted-text)",
    marginBottom: 4,
  },

  statValue: {
    fontSize: 22,
    fontWeight: 700,
    color: "var(--text)",
  },

  statSub: {
    fontSize: 12,
    color: "var(--muted-text)",
    marginTop: 4,
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

  smallBtn: {
    padding: "6px 10px",
    borderRadius: 8,
    border: "1px solid var(--border)",
    background: "var(--surface)",
    cursor: "pointer",
    fontSize: 13,
    marginRight: 6,
  },

  smallDanger: {
    padding: "6px 10px",
    borderRadius: 8,
    border: "none",
    background: "#ef4444",
    color: "#fff",
    cursor: "pointer",
    fontSize: 13,
  },

  filterBar: {
    marginBottom: 14,
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
  },

  searchInput: {
    flex: 1,
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid var(--border)",
    background: "var(--surface)",
  },

  tableCard: {
    background: "var(--surface)",
    borderRadius: 12,
    boxShadow: "var(--shadow)",
    border: "1px solid var(--border)",
    padding: 16,
  },

  // Modal
  modalBackdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(15,23,42,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
  },

  modalCard: {
    width: 420,
    maxWidth: "90%",
    background: "var(--surface)",
    borderRadius: 16,
    padding: 20,
    boxShadow: "0 18px 40px rgba(15,23,42,0.35)",
    border: "1px solid var(--border)",
  },

  modalBody: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    marginTop: 6,
    marginBottom: 16,
  },

  label: {
    fontSize: 13,
    color: "var(--muted-text)",
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },

  modalInput: {
    padding: "9px 10px",
    borderRadius: 8,
    border: "1px solid var(--border)",
    background: "var(--surface)",
  },

  modalFooter: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
  },
};
