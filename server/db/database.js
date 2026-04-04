const Database = require('better-sqlite3');
const path = require('path');

function initDB() {
  const db = new Database(path.join(__dirname, 'vibecheck.db'));

  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS scans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      repo_url TEXT NOT NULL,
      score INTEGER,
      verdict TEXT,
      issue_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS issues (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      scan_id INTEGER REFERENCES scans(id),
      scanner TEXT,
      severity TEXT,
      title TEXT,
      description TEXT,
      file_path TEXT,
      line_number INTEGER,
      code_snippet TEXT,
      fix_suggestion TEXT
    );

    CREATE TABLE IF NOT EXISTS patterns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      error_type TEXT UNIQUE,
      code_snippet TEXT,
      file_pattern TEXT,
      frequency INTEGER DEFAULT 1,
      fix_suggestion TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  return db;
}

module.exports = { initDB };
