import React, { useState, useEffect } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();


  useEffect(() => {
    setUsername("");
    setPassword("");
    setError("");
  }, []);

  const submit = async () => {
    setError("");

    if (!username || !password) {
      setError("Please fill all fields");
      return;
    }

    try {
      const res = await api.post("/api/login", { username, password });
      localStorage.setItem("token", res.data.token);

      navigate("/dashboard", { replace: true });

    } catch (e) {
      setError("Invalid username or password");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.overlay}></div>

      <div style={styles.card}>
        <img
          src="/images/logo.png"
          alt="PropShop Logo"
          style={{
            width: "230px",
            margin: "0 auto 15px auto",
            display: "block",
            filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.25))"
          }}
        />

        {error && <div style={styles.error}>{error}</div>}

        <input
          type="text"
          placeholder="Username"
          style={styles.input}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="off"
        />

        <input
          type="password"
          placeholder="Password"
          style={styles.input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
        />

        <button style={styles.button} onClick={submit}>
          Login
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    width: "100%",
    backgroundImage: "url('/images/bg_building.jpg')",
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    position: "relative",
    backgroundattachment: "fixed",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    width: "100%",
    backdropFilter: "blur(2px)",
    background: "rgba(0,0,0,0.55)",
    zIndex: 0
  },

  card: {
    position: "relative",
    width: "300px",
    padding: "25px 25px",
    borderRadius: "15px",
    background: "rgba(255, 255, 255, 0.27)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0)",
    boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    zIndex: 2,
    alignItems: "center",
  },

  input: {
    padding: "12px",
    width: "90%",
    borderRadius: "10px",
    border: "1px solid rgba(255, 255, 255, 0)",
    background: "rgba(255, 255, 255, 0)",
    backdropFilter: "blur(20px)",
    color: "#ffffffff",
    fontSize: "15px",
  },

  button: {
    padding: "12px",
    width: "40%",
    background: "linear-gradient(90deg, #6200EE, #8B46FF)",
    border: "none",
    color: "#fff",
    fontWeight: "bold",
    fontSize: "16px",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "0.2s",
  },

  error: {
    width: "100%",
    background: "#ffdddd",
    padding: "10px",
    borderRadius: "8px",
    color: "#d8000c",
    fontSize: "14px",
    textAlign: "center",
  },
};
