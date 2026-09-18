CREATE TABLE IF NOT EXISTS projects (
  uid TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  iconColor TEXT,
  lastOpenAt DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
