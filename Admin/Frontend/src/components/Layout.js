"use client"
import { Link, useLocation, useNavigate } from "react-router-dom"
import "../styles/professional-dashboard.css"

export default function Layout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()

  const logout = () => {
    localStorage.removeItem("token")
    navigate("/login", { replace: true })
    window.location.reload()
  }

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">PropShop CRM</div>
          <div className="tagline">Reports</div>
        </div>

        <nav className="nav-menu">
          <Link to="/dashboard" className={`nav-link ${location.pathname === "/dashboard" ? "active" : ""}`}>
            📊 Dashboard
          </Link>
          <Link to="/calls" className={`nav-link ${location.pathname === "/calls" ? "active" : ""}`}>
            📞 Calls
          </Link>
          <Link to="/employees" className={`nav-link ${location.pathname === "/employees" ? "active" : ""}`}>
            👤 Employees
          </Link>
        </nav>

        <div className="sidebar-footer">
          <button
            onClick={logout}
            style={{
              background: "none",
              border: "none",
              color: "#ef4444",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: 600,
              width: "100%",
              padding: "8px 0",
            }}
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      <main className="main-content">{children}</main>
    </div>
  )
}
