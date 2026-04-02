CREATE TABLE IF NOT EXISTS saved_responses (
  id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL,
  name TEXT NOT NULL,
  status INTEGER NOT NULL,
  status_text TEXT NOT NULL,
  headers TEXT NOT NULL,
  body TEXT,
  time_ms INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(request_id) REFERENCES requests(id) ON DELETE CASCADE
);
