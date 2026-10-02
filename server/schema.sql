-- Enable foreign key support
PRAGMA foreign_keys = ON;

-- 1. Students Table
CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sr TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    class TEXT NOT NULL,
    mobile TEXT NOT NULL
);

-- 2. Attendance Records Table
CREATE TABLE IF NOT EXISTS attendance_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    status TEXT NOT NULL,
    FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE,
    UNIQUE(student_id, date)
);

-- 3. Fees Records Table
CREATE TABLE IF NOT EXISTS fees_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER UNIQUE NOT NULL,
    paid_amount REAL NOT NULL DEFAULT 0,
    notes TEXT,
    FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE
);