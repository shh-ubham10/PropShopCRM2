"use client"

import { useEffect, useState } from "react"
import api from "../api"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import "../styles/professional-dashboard.css"

export default function Employees() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const emptyForm = { name: "", employeeId: "", phone: "", role: "", status: "active" }
  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    loadEmployees()
  }, [])

  async function loadEmployees() {
  setLoading(true)
  try {
    const res = await api.get("/api/employees")

    const normalized = res?.data?.employees.map(emp => ({
      ...emp,
      id: emp._id,
      name: emp.username,
      status: "active",
      totalCalls: 0,
      phone: emp.phone_number,
    }))

    setEmployees(normalized)
  } catch (e) {
    console.error(e)
  } finally {
    setLoading(false)
  }
}



  function openAddModal() {
    setSelected(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  function openEditModal(emp) {
    setSelected(emp)
    setForm({
      name: emp.name || "",
      employeeId: emp.employeeId || "",
      phone: emp.phone || "",
      role: emp.role || "",
      status: emp.status || "active",
    })
    setModalOpen(true)
  }

  async function handleSave() {
    if (!form.name || !form.employeeId) return
    try {
      setSaving(true)
      if (selected && selected.id) {
        await api.put(`/api/employees/${selected.id}`, form)
      } else {
        await api.post("/api/employees", form)
      }
      setModalOpen(false)
      await loadEmployees()
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(emp) {
    if (!window.confirm(`Delete employee ${emp.name}?`)) return
    try {
      await api.delete(`/api/employees/${emp.id}`)
      await loadEmployees()
    } catch (e) {
      console.error(e)
    }
  }

  const totalEmployees = employees.length
  const activeEmployees = employees.filter((e) => e.status === "active").length
  const inactiveEmployees = employees.filter((e) => e.status === "inactive").length
  const topCallers = employees
    .slice()
    .sort((a, b) => (b.totalCalls || 0) - (a.totalCalls || 0))
    .slice(0, 8)

  const statusData = [
    { name: "Active", value: activeEmployees },
    { name: "Inactive", value: inactiveEmployees },
  ]

  const COLORS = ["#10b981", "#ef4444"]

  const filtered = employees.filter((e) => {
    const q = search.toLowerCase()
    return (
      e.name?.toLowerCase().includes(q) || e.employeeId?.toLowerCase().includes(q) || e.phone?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="main-content">
      <div className="page-header">
        <h1 className="page-title">Employees</h1>
        <button className="btn btn-primary" onClick={openAddModal} style={{ marginTop: "12px" }}>
          ➕ Add Employee
        </button>
      </div>

      <div className="grid-container">
        <div className="stat-card">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "14px" }}>👥</span>
            <div style={{ flex: 1 }}>
              <div className="stat-label">Total Employees</div>
              <div className="stat-value">{totalEmployees}</div>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "14px" }}>✓</span>
            <div style={{ flex: 1 }}>
              <div className="stat-label">Active Members</div>
              <div className="stat-value">{activeEmployees}</div>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "14px" }}>✕</span>
            <div style={{ flex: 1 }}>
              <div className="stat-label">Inactive Members</div>
              <div className="stat-value">{inactiveEmployees}</div>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "14px" }}>📊</span>
            <div style={{ flex: 1 }}>
              <div className="stat-label">Avg Calls/Employee</div>
              <div className="stat-value">
                {(employees.reduce((sum, e) => sum + (e.totalCalls || 0), 0) / Math.max(1, totalEmployees)).toFixed(1)}
              </div>
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
          <h3 className="chart-title">Employee Status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "6px" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Top Callers</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topCallers} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" stroke="#6b7280" fontSize={11} />
              <YAxis dataKey="name" type="category" stroke="#6b7280" width={80} fontSize={11} />
              <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "6px" }} />
              <Bar dataKey="totalCalls" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-card" style={{ marginBottom: "20px" }}>
        <input
          className="form-input"
          placeholder="🔍 Search by name, ID, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: "100%", fontSize: "12px" }}
        />
      </div>

      <div className="chart-card">
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>Loading employees...</div>
        ) : (
          <div className="table-container">
            <table style={{ fontSize: "12px" }}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Employee ID</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Total Calls</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: "20px" }}>
                      No employees found
                    </td>
                  </tr>
                ) : (
                  filtered.map((emp) => (
                    <tr key={emp.id}>
                      <td>{emp.name}</td>
                      <td>
                        <code style={{ fontSize: "11px" }}>{emp.id}</code>
                      </td>
                      <td style={{ fontSize: "11px" }}>{emp.phone}</td>
                      <td style={{ fontSize: "11px" }}>{emp.role || "—"}</td>
                      <td>
                        <span
                          className={`badge ${emp.status === "active" ? "badge-success" : "badge-danger"}`}
                          style={{ fontSize: "10px" }}
                        >
                          {emp.status === "active" ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>{emp.totalCalls || 0}</td>
                      <td>
                        <button
                          style={{
                            background: "none",
                            border: "none",
                            color: "#0ea5e9",
                            cursor: "pointer",
                            fontSize: "11px",
                            marginRight: "6px",
                            fontWeight: 600,
                          }}
                          onClick={() => openEditModal(emp)}
                        >
                          ✏️
                        </button>
                        <button
                          style={{
                            background: "none",
                            border: "none",
                            color: "#ef4444",
                            cursor: "pointer",
                            fontSize: "11px",
                            fontWeight: 600,
                          }}
                          onClick={() => handleDelete(emp)}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="modal active" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "20px", color: "#111827" }}>
              {selected ? "✏️ Edit Employee" : "➕ Add Employee"}
            </h3>

            <div className="form-group">
              <label className="form-label">Name</label>
              <input
                className="form-input"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="John Doe"
                style={{ fontSize: "12px" }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Employee ID</label>
              <input
                className="form-input"
                value={form.employeeId}
                onChange={(e) => setForm((f) => ({ ...f, employeeId: e.target.value }))}
                placeholder="EMP001"
                style={{ fontSize: "12px" }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone</label>
              <input
                className="form-input"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="+1 (555) 000-0000"
                style={{ fontSize: "12px" }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Role</label>
              <input
                className="form-input"
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                placeholder="Sales Manager"
                style={{ fontSize: "12px" }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                style={{ fontSize: "12px" }}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "24px" }}>
              <button
                className="btn btn-secondary"
                onClick={() => setModalOpen(false)}
                disabled={saving}
                style={{ fontSize: "12px" }}
              >
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ fontSize: "12px" }}>
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
