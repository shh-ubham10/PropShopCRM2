// src/components/AudioModal.js
import React from "react";

export default function AudioModal({ src, filename, meta = {}, onClose }) {
  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <div style={{ fontWeight: 700 }}>{filename}</div>
          <button onClick={onClose} style={styles.close}>✕</button>
        </div>

        <div style={{ marginTop: 12 }}>
          <audio controls style={{ width: "100%" }}>
            <source src={src} />
            Your browser does not support the audio element.
          </audio>
        </div>

        {meta.employeeId && (
          <div style={{ marginTop: 12, color: "#6b7280", fontSize: 13 }}>
            <div><b>Employee:</b> {meta.employeeId}</div>
            <div><b>Number:</b> {meta.phoneNumber}</div>
            <div><b>When:</b> {meta.when}</div>
          </div>
        )}

        <div style={{ marginTop: 12, textAlign: "right" }}>
          <a href={src} download style={{ color: "#2563eb", textDecoration: "none" }}>Download</a>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: { position: "fixed", inset: 0, background: "rgba(10,11,13,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 },
  modal: { width: 620, maxWidth: "95%", background: "#fff", borderRadius: 12, padding: 18, boxShadow: "0 10px 40px rgba(2,6,23,0.08)" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  close: { border: "none", background: "transparent", fontSize: 18, cursor: "pointer" }
};
