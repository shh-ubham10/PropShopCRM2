// src/components/Layout.js
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
    window.location.reload();
  };

  return (
    <div style={styles.wrapper}>
      {/* SIDEBAR */}
      <aside style={styles.sidebar}>
        <div style={styles.brandWrap}>
          <div style={styles.logo}>PropShop</div>
          <div style={styles.subtitle}>CRM</div>
        </div>

        {/* NAVIGATION (if it ever gets long, only this part will scroll) */}
        <div style={styles.menuScroll}>
          <nav style={styles.nav}>
            <SidebarLink
              to="/dashboard"
              label="Dashboard"
              icon="📊"
              active={location.pathname === "/dashboard"}
            />
            <SidebarLink
              to="/calls"
              label="Calls"
              icon="📞"
              active={location.pathname === "/calls"}
            />
            <SidebarLink
              to="/employees"
              label="Employees"
              icon="👤"
              active={location.pathname === "/employees"}
            />
          </nav>
        </div>

        {/* LOGOUT – always fully visible, a bit above the bottom */}
        <button style={styles.logoutBtn} onClick={logout}>
          🚪 Logout
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main style={styles.content}>{children}</main>
    </div>
  );
}

/* ---------- SIDEBAR LINK ---------- */
function SidebarLink({ to, label, icon, active }) {
  return (
    <Link
      to={to}
      style={{
        ...styles.menuItem,
        ...(active ? styles.menuItemActive : {}),
      }}
    >
      <span style={{ marginRight: 10 }}>{icon}</span>
      {label}
    </Link>
  );
}

/* ---------- STYLES ---------- */
const SIDEBAR_WIDTH = 260;

const styles = {
  wrapper: {
    display: "flex",
    height: "100vh",
    background: "#f6f7f9",
    color: "#111827",
    fontFamily: "Inter, sans-serif",
    overflow: "hidden",
  },

  // Sidebar is fixed-height, not scrollable as a whole
  sidebar: {
    width: SIDEBAR_WIDTH,
    height: "100vh",
    padding: 24,
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    borderRight: "1px solid #e5e7eb",
    background: "#ffffff",
    overflow: "hidden", // sidebar itself never scrolls
  },

  // This part can scroll if you add many menu items
  menuScroll: {
    flex: 1,
    overflowY: "auto",
    paddingRight: 4,
  },

  brandWrap: { marginBottom: 20 },
  logo: { fontSize: 20, fontWeight: 800, color: "#111827" },
  subtitle: { fontSize: 12, color: "#6b7280" },

  nav: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    marginTop: 10,
  },

  menuItem: {
    padding: "12px 14px",
    borderRadius: 10,
    textDecoration: "none",
    fontWeight: 600,
    transition: "0.25s",
    border: "1px solid transparent",
    color: "#6b7280",
    background: "#f3f4f6",
  },

  menuItemActive: {
    background: "#e0ebff",
    color: "#111827",
    border: "1px solid #2563eb",
    boxShadow: "0 0 6px rgba(0,0,0,0.15)",
  },

  // No marginTop:auto anymore; instead we give a small bottom gap
  logoutBtn: {
    padding: "12px 14px",
    marginTop: 12,
    marginBottom: 8, // keeps it slightly above OS taskbar
    background: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 15,
    fontWeight: 600,
  },

  // Main content scrolls, sidebar stays fixed visually
  content: {
  flex: 1,
  padding: 28,
  background: "#f6f7f9",
  color: "#111827",
  marginLeft: 5,
  overflowY: "auto",
},
};
