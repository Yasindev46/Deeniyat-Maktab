import express from 'express';
import multer from 'multer';
import cors from 'cors';
import dotenv from 'dotenv';
import { DatabaseSync } from 'node:sqlite';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(root, '.env') });

const databasePath = resolve(root, process.env.DATABASE_PATH || 'database.db');
const database = new DatabaseSync(databasePath);
const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024, files: 1 },
});
const port = Number(process.env.PORT) || 3001;
const fixedFee = 2400;
const allowedOrigins = new Set(
  (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
);

database.exec(`
  PRAGMA foreign_keys = ON;
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sr TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    class TEXT NOT NULL,
    mobile TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS attendance_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    status TEXT NOT NULL,
    FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE,
    UNIQUE(student_id, date)
  );
  CREATE TABLE IF NOT EXISTS fees_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER UNIQUE NOT NULL,
    paid_amount REAL NOT NULL DEFAULT 0,
    notes TEXT,
    FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE
  );
`);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) return callback(null, true);
    const error = new Error('This origin is not allowed to access the API.');
    error.status = 403;
    return callback(error);
  },
}));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok' });
});

function todayDate() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

function readStudentInput(body) {
  const values = {
    sr: String(body.sr ?? '').trim(),
    name: String(body.name ?? '').trim(),
    class: String(body.class ?? '').trim(),
    mobile: String(body.mobile ?? '').trim(),
  };
  if (!values.sr || !values.name || !values.class || !values.mobile) {
    const error = new Error('Serial number, name, class, and mobile number are required.');
    error.status = 400;
    throw error;
  }
  return values;
}

function parseCsvLine(line) {
  const fields = [];
  let field = '';
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"' && quoted && line[index + 1] === '"') {
      field += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === ',' && !quoted) {
      fields.push(field.trim());
      field = '';
    } else {
      field += char;
    }
  }
  fields.push(field.trim());
  if (quoted) {
    const error = new Error('The CSV contains an unclosed quoted field.');
    error.status = 400;
    throw error;
  }
  return fields;
}

function runTransaction(callback) {
  database.exec('BEGIN');
  try {
    const result = callback();
    database.exec('COMMIT');
    return result;
  } catch (error) {
    database.exec('ROLLBACK');
    throw error;
  }
}

app.get('/api/students', (_request, response) => {
  const students = database.prepare(`
    SELECT s.*, COALESCE(r.status, 'Absent') AS today_status
    FROM students s
    LEFT JOIN attendance_records r ON s.id = r.student_id AND r.date = ?
    ORDER BY s.sr COLLATE NOCASE ASC
  `).all(todayDate());
  response.json(students);
});

app.post('/api/students', (request, response) => {
  const student = readStudentInput(request.body);
  const result = database.prepare(`
    INSERT INTO students (sr, name, class, mobile) VALUES (@sr, @name, @class, @mobile)
    ON CONFLICT(sr) DO UPDATE SET name = excluded.name, class = excluded.class, mobile = excluded.mobile
  `).run(student);
  response.status(200).json({ success: true, id: Number(result.lastInsertRowid) || null });
});

app.put('/api/students/:id', (request, response) => {
  const id = Number(request.params.id);
  if (!Number.isSafeInteger(id) || id < 1) {
    return response.status(400).json({ error: 'A valid student ID is required.' });
  }
  const student = readStudentInput(request.body);
  const result = database.prepare(`
    UPDATE students SET sr = @sr, name = @name, class = @class, mobile = @mobile WHERE id = @id
  `).run({ ...student, id });
  if (result.changes === 0) return response.status(404).json({ error: 'Student not found.' });
  return response.json({ success: true });
});

app.post('/api/students/import', upload.single('csv_file'), (request, response) => {
  if (!request.file) return response.status(400).json({ error: 'Choose a CSV file to import.' });
  const contents = request.file.buffer.toString('utf8').replace(/^\uFEFF/, '');
  const rows = contents.split(/\r?\n/).filter((line) => line.trim());
  if (rows.length < 2) return response.status(400).json({ error: 'The CSV must include a header and at least one student.' });

  const insert = database.prepare(`
    INSERT INTO students (sr, name, class, mobile) VALUES (?, ?, ?, ?)
    ON CONFLICT(sr) DO UPDATE SET name = excluded.name, class = excluded.class, mobile = excluded.mobile
  `);
  const count = runTransaction(() => {
    let count = 0;
    for (const line of rows.slice(1)) {
      const [sr, name, className, mobile] = parseCsvLine(line);
      if (!sr || !name || !className || mobile === undefined) continue;
      insert.run(sr, name, className, mobile);
      count += 1;
    }
    return count;
  });
  response.json({ success: true, count });
});

app.get('/api/fees', (_request, response) => {
  response.json(database.prepare(`
    SELECT s.id AS student_id, COALESCE(f.id, 0) AS fee_id,
      s.sr, s.name, s.class, COALESCE(f.paid_amount, 0) AS paid_amount,
      COALESCE(f.notes, '') AS notes
    FROM students s
    LEFT JOIN fees_records f ON s.id = f.student_id
    ORDER BY s.sr COLLATE NOCASE ASC
  `).all());
});

app.put('/api/fees/:studentId', (request, response) => {
  const studentId = Number(request.params.studentId);
  const paidAmount = Number(request.body.paid_amount);
  const notes = String(request.body.notes ?? '').trim();
  if (!Number.isSafeInteger(studentId) || studentId < 1) {
    return response.status(400).json({ error: 'A valid student ID is required.' });
  }
  if (!Number.isFinite(paidAmount) || paidAmount < 0 || paidAmount > fixedFee) {
    return response.status(400).json({ error: `Paid amount must be between ₹0 and ₹${fixedFee}.` });
  }
  if (!database.prepare('SELECT 1 FROM students WHERE id = ?').get(studentId)) {
    return response.status(404).json({ error: 'Student not found.' });
  }
  database.prepare(`
    INSERT INTO fees_records (student_id, paid_amount, notes) VALUES (?, ?, ?)
    ON CONFLICT(student_id) DO UPDATE SET paid_amount = excluded.paid_amount, notes = excluded.notes
  `).run(studentId, paidAmount, notes);
  return response.json({ success: true });
});

function studentsInClass(className) {
  return className === 'All'
    ? database.prepare('SELECT id FROM students').all()
    : database.prepare('SELECT id FROM students WHERE class = ?').all(className);
}

app.post('/api/attendance/mark-all', (request, response) => {
  const className = String(request.body.class ?? 'All');
  const upsert = database.prepare(`
    INSERT INTO attendance_records (student_id, date, status) VALUES (?, ?, 'Present')
    ON CONFLICT(student_id, date) DO UPDATE SET status = 'Present'
  `);
  const targetStudents = studentsInClass(className);
  runTransaction(() => {
    const date = todayDate();
    for (const student of targetStudents) upsert.run(student.id, date);
  });
  response.json({ success: true });
});

app.post('/api/attendance/finalize', (request, response) => {
  const className = String(request.body.class ?? 'All');
  const upsertMissing = database.prepare(`
    INSERT INTO attendance_records (student_id, date, status)
    SELECT id, ?, 'Absent' FROM students
    WHERE (? = 'All' OR class = ?)
      AND id NOT IN (SELECT student_id FROM attendance_records WHERE date = ?)
  `);
  const date = todayDate();
  const result = upsertMissing.run(date, className, className, date);
  response.json({ success: true, count: result.changes });
});

app.post('/api/attendance/:studentId', (request, response) => {
  const studentId = Number(request.params.studentId);
  const { status } = request.body;
  if (!Number.isSafeInteger(studentId) || studentId < 1) {
    return response.status(400).json({ error: 'A valid student ID is required.' });
  }
  if (status !== 'Present' && status !== 'Absent') {
    return response.status(400).json({ error: 'Attendance status must be Present or Absent.' });
  }
  database.prepare(`
    INSERT INTO attendance_records (student_id, date, status) VALUES (?, ?, ?)
    ON CONFLICT(student_id, date) DO UPDATE SET status = excluded.status
  `).run(studentId, todayDate(), status);
  return response.json({ success: true });
});

app.get('/api/analytics', (request, response) => {
  const year = String(request.query.year ?? new Date().getFullYear());
  const month = String(request.query.month ?? 'All');
  const className = String(request.query.class ?? 'All');
  const filterType = String(request.query.filter_type ?? 'class');
  const studentId = Number(request.query.student_id);
  if (!/^\d{4}$/.test(year) || (month !== 'All' && !/^(?:[1-9]|1[0-2])$/.test(month))) {
    return response.status(400).json({ error: 'Choose a valid year and month.' });
  }
  const datePattern = `${year}-${month === 'All' ? '' : month.padStart(2, '0')}%`;
  if (filterType === 'student') {
    if (!Number.isSafeInteger(studentId) || studentId < 1) return response.json([]);
    return response.json(database.prepare(`
      SELECT s.sr, s.name, s.class, r.date, r.status
      FROM attendance_records r JOIN students s ON r.student_id = s.id
      WHERE s.id = ? AND r.date LIKE ? ORDER BY r.date DESC
    `).all(studentId, datePattern));
  }
  return response.json(database.prepare(`
    SELECT s.sr, s.name, s.class,
      SUM(CASE WHEN r.status = 'Present' THEN 1 ELSE 0 END) AS present_count,
      SUM(CASE WHEN r.status = 'Absent' THEN 1 ELSE 0 END) AS absent_count,
      COUNT(r.id) AS total_days
    FROM students s
    LEFT JOIN attendance_records r ON s.id = r.student_id AND r.date LIKE ?
    WHERE (? = 'All' OR s.class = ?)
    GROUP BY s.id ORDER BY s.sr COLLATE NOCASE ASC
  `).all(datePattern, className, className));
});

app.use('/api', (request, response) => {
  response.status(404).json({ error: `API route not found: ${request.method} ${request.path}` });
});

app.use((error, _request, response, _next) => {
  const status = error.status ?? (error instanceof multer.MulterError ? 400 : 500);
  if (status >= 500) console.error(error);
  response.status(status).json({ error: status >= 500 ? 'The server could not complete the request.' : error.message });
});

const server = app.listen(port, () => {
  console.log(`Deeniyat API listening on http://localhost:${port}`);
});

function closeServer() {
  server.close(() => {
    database.close();
    process.exit(0);
  });
}

process.on('SIGINT', closeServer);
process.on('SIGTERM', closeServer);
