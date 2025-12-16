// server.js
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { createObjectCsvWriter } = require('csv-writer');
require('dotenv').config();

// ---------- PATHS ----------
const UPLOAD_DIR = path.join(__dirname, 'uploads');
const DATA_DIR = path.join(__dirname, 'data');
const CALLS_FILE = path.join(DATA_DIR, 'calls.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
if (!fs.existsSync(CALLS_FILE)) fs.writeFileSync(CALLS_FILE, '[]');

// ---------- FILE STORAGE ----------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, Date.now() + '_' + file.originalname)
});
const upload = multer({ storage });

const app = express();
app.use(cors());
app.use(express.json());

// ---------- USER INIT ----------
if (!fs.existsSync(USERS_FILE)) {
  const adminHash = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'admin1234', 10);
  fs.writeFileSync(
    USERS_FILE,
    JSON.stringify(
      [{ id: 1, username: 'admin', passwordHash: adminHash, role: 'admin' }],
      null,
      2
    )
  );
}

// ---- Helper Functions ----
const readUsers = () => JSON.parse(fs.readFileSync(USERS_FILE));
const writeUsers = (users) =>
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

const readCalls = () => JSON.parse(fs.readFileSync(CALLS_FILE));
const writeCalls = (calls) =>
  fs.writeFileSync(CALLS_FILE, JSON.stringify(calls, null, 2));

// ---------- AUTH MIDDLEWARE ----------
function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'missing token' });

  const token = header.split(' ')[1];
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (e) {
    return res.status(401).json({ error: 'invalid token' });
  }
}

// ---------- LOGIN ----------
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  const users = readUsers();
  const user = users.find((u) => u.username === username);

  if (!user) return res.status(401).json({ error: 'invalid' });

  if (!bcrypt.compareSync(password, user.passwordHash))
    return res.status(401).json({ error: 'invalid' });

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '12h' }
  );

  res.json({ token });
});

// ---------- ADD USER (Admin Only) ----------
app.post('/api/users', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin')
    return res.status(403).json({ error: 'forbidden' });

  const { username, password, role } = req.body;

  const users = readUsers();
  if (users.find((u) => u.username === username))
    return res.status(400).json({ error: 'exists' });

  const id = users.length ? users[users.length - 1].id + 1 : 1;

  users.push({
    id,
    username,
    passwordHash: bcrypt.hashSync(password, 10),
    role: role || 'user'
  });

  writeUsers(users);
  res.json({ ok: true });
});

// ---------- UPLOAD CALL & AUDIO ----------
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    const meta = JSON.parse(req.body.metadata || '{}');
    const file = req.file;

    if (!file) return res.status(400).json({ ok: false, error: 'no file' });

    const calls = readCalls();

    const entry = {
      id: Date.now(),
      employeeId: meta.employeeId || '',
      phoneNumber: meta.phoneNumber || '',
      callType: meta.callType || '',
      startMs: parseInt(meta.startMs) || 0,
      endMs: parseInt(meta.endMs) || 0,
      gpsLat: meta.gpsLat || '',
      gpsLng: meta.gpsLng || '',
      filename: file.filename,
      uploadedAt: Date.now()
    };

    calls.push(entry);
    writeCalls(calls);

    res.json({ ok: true, entry });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ---------- SERVE AUDIO ----------
app.get('/files/:name', authMiddleware, (req, res) => {
  const file = path.join(UPLOAD_DIR, req.params.name);
  if (!fs.existsSync(file)) return res.status(404).send('not found');
  res.sendFile(file);
});

// ---------- GET ALL CALLS ----------
app.get('/api/calls', authMiddleware, (req, res) => {
  let calls = readCalls();
  calls.sort((a, b) => b.startMs - a.startMs);
  res.json({ ok: true, calls });
});

// ---------- RECENT CALLS (last 10) ----------
app.get('/api/recent', authMiddleware, (req, res) => {
  let calls = readCalls();
  calls.sort((a, b) => b.startMs - a.startMs);
  res.json({ ok: true, recent: calls.slice(0, 10) });
});

// ---------- DASHBOARD SUMMARY ----------
app.get('/api/summary', authMiddleware, (req, res) => {
  const calls = readCalls();

  const total = calls.length;

  const incoming = calls.filter((c) => c.callType === 'incoming').length;
  const outgoing = calls.filter((c) => c.callType === 'outgoing').length;

  const totalDuration = calls.reduce(
    (sum, c) => sum + (c.endMs - c.startMs),
    0
  ) / 60000; // convert to minutes

  const byEmployee = {};
  calls.forEach((c) => {
    const id = c.employeeId || 'Unknown';
    byEmployee[id] = (byEmployee[id] || 0) + 1;
  });

  res.json({
    ok: true,
    total,
    incoming,
    outgoing,
    totalDuration,
    byEmployee
  });
});

// ---------- EXPORT CSV ----------
app.get('/api/export', authMiddleware, (req, res) => {
  const calls = readCalls();

  const csvWriter = createObjectCsvWriter({
    path: path.join(DATA_DIR, 'export.csv'),
    header: [
      { id: 'employeeId', title: 'Employee' },
      { id: 'phoneNumber', title: 'Phone Number' },
      { id: 'callType', title: 'Type' },
      { id: 'startMs', title: 'Start Time' },
      { id: 'endMs', title: 'End Time' },
      { id: 'gpsLat', title: 'Latitude' },
      { id: 'gpsLng', title: 'Longitude' },
      { id: 'filename', title: 'Audio File' }
    ]
  });

  csvWriter
    .writeRecords(calls)
    .then(() => res.download(path.join(DATA_DIR, 'export.csv')))
    .catch((err) => res.status(500).json({ error: err.message }));
});

// ---------- START SERVER ----------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server up on ${PORT}`));