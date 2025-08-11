import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Database from 'better-sqlite3';
import nodemailer from 'nodemailer';
import cron from 'node-cron';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// SQLite setup
const db = new Database('./server/data.db');
db.pragma('journal_mode = WAL');
db.prepare(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)`).run();

db.prepare(`CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_email TEXT NOT NULL,
  text TEXT NOT NULL,
  due_iso TEXT,
  planned_time REAL,
  time_unit TEXT,
  completed INTEGER DEFAULT 0,
  notified INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)`).run();

db.prepare(`CREATE INDEX IF NOT EXISTS idx_tasks_user_due ON tasks(user_email, due_iso)`).run();

// Mail transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: false,
  auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined
});

function sendEmail(to, subject, html) {
  if (!process.env.SMTP_HOST) {
    console.log('[mail] SMTP not configured, skip send to', to, subject);
    return Promise.resolve();
  }
  return transporter.sendMail({ from: process.env.MAIL_FROM || process.env.SMTP_USER, to, subject, html });
}

// Helpers
function normalizeTask(body, email) {
  const { text, dueDate, dueTime, dueDateTimeISO, plannedTime, timeUnit, completed } = body;
  let iso = dueDateTimeISO;
  if (!iso && dueDate) {
    const computed = computeDueISO(dueDate, dueTime);
    iso = computed ? computed.toISOString() : null;
  }
  return {
    user_email: email,
    text: String(text || '').trim(),
    due_iso: iso || null,
    planned_time: plannedTime != null ? Number(plannedTime) : null,
    time_unit: timeUnit === 'minutes' ? 'minutes' : 'hours',
    completed: completed ? 1 : 0,
  };
}

function computeDueISO(dateStr, timeStr) {
  if (!dateStr) return null;
  let hours = 9, minutes = 0;
  if (timeStr) {
    const parsed = parseTime12h(timeStr);
    if (parsed) { hours = parsed.hours; minutes = parsed.minutes; }
  }
  const [y,m,d] = dateStr.split('-').map(Number);
  return new Date(y, m-1, d, hours, minutes, 0);
}

function parseTime12h(input) {
  const str = String(input).trim().toLowerCase().replace(/\s+/g,'');
  const match = str.match(/^(\d{1,2})(?::(\d{1,2}))?(am|pm)$/);
  if (!match) return null;
  let h = parseInt(match[1], 10);
  let m = match[2] ? parseInt(match[2], 10) : 0;
  const mer = match[3];
  if (h < 1 || h > 12 || m < 0 || m > 59) return null;
  if (mer === 'am') { if (h === 12) h = 0; } else { if (h !== 12) h += 12; }
  return { hours: h, minutes: m };
}

// Routes
app.post('/api/register', (req, res) => {
  const { email } = req.body;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Invalid email' });
  try {
    db.prepare('INSERT OR IGNORE INTO users(email) VALUES (?)').run(email);
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: 'DB error' });
  }
});

app.get('/api/tasks', (req, res) => {
  const email = req.query.email;
  if (!email) return res.status(400).json({ error: 'Missing email' });
  const rows = db.prepare('SELECT * FROM tasks WHERE user_email = ? ORDER BY id DESC').all(email);
  return res.json(rows);
});

app.post('/api/tasks', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Missing email' });
  const t = normalizeTask(req.body, email);
  if (!t.text) return res.status(400).json({ error: 'Task text required' });
  try {
    const info = db.prepare(`INSERT INTO tasks(user_email, text, due_iso, planned_time, time_unit, completed) VALUES(?,?,?,?,?,?)`)
      .run(t.user_email, t.text, t.due_iso, t.planned_time, t.time_unit, t.completed);
    const row = db.prepare('SELECT * FROM tasks WHERE id=?').get(info.lastInsertRowid);
    return res.json(row);
  } catch (e) {
    return res.status(500).json({ error: 'DB error' });
  }
});

app.put('/api/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Missing email' });
  const t = normalizeTask(req.body, email);
  try {
    db.prepare(`UPDATE tasks SET text=?, due_iso=?, planned_time=?, time_unit=?, completed=?, notified=0 WHERE id=? AND user_email=?`)
      .run(t.text, t.due_iso, t.planned_time, t.time_unit, t.completed, id, email);
    const row = db.prepare('SELECT * FROM tasks WHERE id=?').get(id);
    return res.json(row);
  } catch (e) {
    return res.status(500).json({ error: 'DB error' });
  }
});

app.delete('/api/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const email = req.query.email || req.body.email;
  if (!email) return res.status(400).json({ error: 'Missing email' });
  try {
    db.prepare('DELETE FROM tasks WHERE id=? AND user_email=?').run(id, email);
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: 'DB error' });
  }
});

// Cron: every 30 minutes, find tasks that are 24h away and not notified
cron.schedule('*/30 * * * *', () => {
  const now = new Date();
  const in24hStart = new Date(now.getTime() + 24*60*60*1000 - 30*60*1000); // 23.5h
  const in24hEnd = new Date(now.getTime() + 24*60*60*1000);
  const rows = db.prepare(`SELECT * FROM tasks WHERE due_iso IS NOT NULL AND completed=0 AND notified=0`).all();
  rows.forEach(row => {
    const due = new Date(row.due_iso);
    if (due >= in24hStart && due <= in24hEnd) {
      const html = `<p>Reminder: Your task <b>${escapeHtml(row.text)}</b> is due on ${due.toLocaleString()}</p>`;
      sendEmail(row.user_email, 'Task reminder - 1 day left', html)
        .then(() => {
          db.prepare('UPDATE tasks SET notified=1 WHERE id=?').run(row.id);
          console.log('Reminder sent to', row.user_email, 'for task', row.id);
        })
        .catch(err => console.warn('Mail error', err));
    }
  });
});

app.listen(process.env.PORT || 4000, () => {
  console.log('Server listening on', process.env.PORT || 4000);
});

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
}
