// server.js
const authMiddleware = require("./auth");
const pool = require("./db");
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

/* ============================
   UPLOAD SETUP
============================ */
const UPLOAD_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, UPLOAD_DIR),
  filename: (_, file, cb) => cb(null, Date.now() + "_" + file.originalname),
});
 const upload = multer({ storage });

/* ============================
   LOGIN
============================ */
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const result = await pool.query(
      "SELECT id, username, password_hash, role FROM users WHERE username=$1",
      [username]
    );

    if (!result.rows.length)
      return res.status(401).json({ error: "Invalid credentials" });

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match)
      return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "12h" }
    );

    res.json({
      token,
      user: { id: user.id, role: user.role },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ error: "login failed" });
  }
});

/* ============================
   CREATE USER (ADMIN)
============================ */
app.post("/api/users", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ error: "forbidden" });

  const { username, password, role } = req.body;

  const exists = await pool.query(
    "SELECT id FROM users WHERE username=$1",
    [username]
  );
  if (exists.rows.length)
    return res.status(400).json({ error: "exists" });

  const hash = await bcrypt.hash(password, 10);

  await pool.query(
    "INSERT INTO users (username, password_hash, role) VALUES ($1,$2,$3)",
    [username, hash, role || "employee"]
  );

  res.json({ ok: true });
});

/* ============================
   UPLOAD CALL
============================ */
app.post("/api/calls/upload", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "audio file missing" });
    }

    const meta = JSON.parse(req.body.metadata || "{}");

    const {
      employee_id,
      phone_number,
      call_type,
      start_ms,
      end_ms,
      duration_seconds,
    } = meta;

    if (!employee_id || !start_ms) {
      return res.status(400).json({ error: "invalid metadata" });
    }

    await pool.query(
      `INSERT INTO calls
       (employee_id, phone_number, call_type, start_ms, end_ms,
        duration_seconds, audio_file)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [
        employee_id,
        phone_number || "UNKNOWN",
        call_type || "outgoing",
        start_ms,
        end_ms || null,
        duration_seconds || 0,
        req.file.filename,
      ]
    );

    res.json({ ok: true });
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    res.status(500).json({ error: "upload failed" });
  }
});


/* ============================
   FETCH CALLS (ROLE BASED)
============================ */
app.get("/api/calls", authMiddleware, async (req, res) => {
  try {
    const result =
      req.user.role === "admin"
        ? await pool.query("SELECT * FROM calls ORDER BY uploaded_at DESC")
        : await pool.query(
            "SELECT * FROM calls WHERE employee_id=$1 ORDER BY uploaded_at DESC",
            [req.user.id]
          );

    res.json({ ok: true, calls: result.rows });
  } catch (err) {
    console.error("CALL FETCH ERROR:", err);
    res.status(500).json({ error: "fetch failed" });
  }
});

/* ============================
   DASHBOARD SUMMARY (ADMIN)
============================ */
app.get("/api/summary", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ error: "forbidden" });

  try {
    const total = await pool.query("SELECT COUNT(*) FROM calls");
    const incoming = await pool.query(
      "SELECT COUNT(*) FROM calls WHERE call_type='incoming'"
    );
    const outgoing = await pool.query(
      "SELECT COUNT(*) FROM calls WHERE call_type='outgoing'"
    );
    const duration = await pool.query(
      "SELECT COALESCE(SUM(duration_seconds),0) AS total FROM calls"
    );

    const byEmployeeRaw = await pool.query(`
      SELECT employee_id, COUNT(*) AS count
      FROM calls
      GROUP BY employee_id
    `);

    const byEmployee = {};
    byEmployeeRaw.rows.forEach(r => {
      byEmployee[r.employee_id] = Number(r.count);
    });

    res.json({
      total: Number(total.rows[0].count),
      incoming: Number(incoming.rows[0].count),
      outgoing: Number(outgoing.rows[0].count),
      totalDuration: Number(duration.rows[0].total) / 60,
      byEmployee,
    });
  } catch (err) {
    console.error("SUMMARY ERROR:", err);
    res.status(500).json({ error: "summary failed" });
  }
});

/* ============================
   TODAY CALL COUNT (EMPLOYEE)
============================ */
app.get("/api/today-calls", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT COUNT(*) 
      FROM calls
      WHERE employee_id = $1
        AND DATE(to_timestamp(start_ms / 1000)) = CURRENT_DATE
      `,
      [req.user.id]
    );

    res.json({ todayCalls: Number(result.rows[0].count) });
  } catch (err) {
    console.error("TODAY CALLS ERROR:", err);
    res.status(500).json({ error: "today calls failed" });
  }
});

/* ============================
   SERVE AUDIO FILE (SECURE)
============================ */
app.get("/files/:name", authMiddleware, async (req, res) => {
  try {
    const { name } = req.params;

    const result = await pool.query(
      "SELECT employee_id FROM calls WHERE audio_file=$1",
      [name]
    );

    if (!result.rows.length) return res.sendStatus(404);

    const owner = result.rows[0].employee_id;
    if (req.user.role !== "admin" && req.user.id !== owner)
      return res.sendStatus(403);

    const file = path.join(UPLOAD_DIR, name);
    if (!fs.existsSync(file)) return res.sendStatus(404);

    res.sendFile(file);
  } catch (err) {
    console.error("AUDIO ERROR:", err);
    res.sendStatus(500);
  }
});

/* ============================
   START SERVER
============================ */
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

