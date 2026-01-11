-- Environments table
CREATE TABLE IF NOT EXISTS environments (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  name TEXT NOT NULL,
  variables TEXT NOT NULL, -- JSON string
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(project_id) REFERENCES projects(uid) ON DELETE CASCADE
);

-- Collections (Folders) table
CREATE TABLE IF NOT EXISTS collections (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  parent_id TEXT, -- For nested folders (can be NULL)
  name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(project_id) REFERENCES projects(uid) ON DELETE CASCADE,
  FOREIGN KEY(parent_id) REFERENCES collections(id) ON DELETE CASCADE
);

-- Requests table
CREATE TABLE IF NOT EXISTS requests (
  id TEXT PRIMARY KEY,
  collection_id TEXT, -- Can be NULL if at root of project (but better organized in collections)
  project_id TEXT NOT NULL, -- To easily fetch all requests of a project
  name TEXT NOT NULL,
  method TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(collection_id) REFERENCES collections(id) ON DELETE SET NULL,
  FOREIGN KEY(project_id) REFERENCES projects(uid) ON DELETE CASCADE
);

-- Request Headers
CREATE TABLE IF NOT EXISTS request_headers (
  id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  is_active INTEGER DEFAULT 1,
  FOREIGN KEY(request_id) REFERENCES requests(id) ON DELETE CASCADE
);

-- Request Params (Query)
CREATE TABLE IF NOT EXISTS request_params (
  id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  is_active INTEGER DEFAULT 1,
  FOREIGN KEY(request_id) REFERENCES requests(id) ON DELETE CASCADE
);

-- Request Body
CREATE TABLE IF NOT EXISTS request_body (
  id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL,
  body_type TEXT NOT NULL, -- 'none', 'json', 'form-data', 'x-www-form-urlencoded', 'raw'
  raw_data TEXT, -- Content for raw/json
  FOREIGN KEY(request_id) REFERENCES requests(id) ON DELETE CASCADE
);

-- Request Auth
CREATE TABLE IF NOT EXISTS request_auth (
  id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL,
  auth_type TEXT NOT NULL, -- 'none', 'bearer', 'basic', 'apikey'
  auth_data TEXT, -- JSON configuration
  FOREIGN KEY(request_id) REFERENCES requests(id) ON DELETE CASCADE
);
