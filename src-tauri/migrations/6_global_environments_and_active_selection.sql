-- Global environments independent of any project
CREATE TABLE IF NOT EXISTS global_environments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  variables TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS active_project_environments (
  project_id TEXT PRIMARY KEY,
  environment_id TEXT,
  FOREIGN KEY(project_id) REFERENCES projects(uid) ON DELETE CASCADE,
  FOREIGN KEY(environment_id) REFERENCES environments(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS active_global_environment (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  environment_id TEXT,
  FOREIGN KEY(environment_id) REFERENCES global_environments(id) ON DELETE SET NULL
);

INSERT OR IGNORE INTO active_global_environment (id, environment_id) VALUES (1, NULL);

