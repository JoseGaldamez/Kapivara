-- Settings table
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default settings
INSERT OR IGNORE INTO settings (key, value, description) VALUES 
('theme', 'auto', 'Application theme (auto, light, dark)'),
('language', 'en', 'Application language'),
('editor_font_size', '14', 'Font size for code editors'),
('word_wrap', 'true', 'Toggle word wrap in editors'),
('ssl_verification', 'true', 'Verify SSL certificates'),
('request_timeout', '30000', 'Global request timeout in ms'),
('follow_redirects', 'true', 'Automatically follow HTTP redirects'),
('telemetry', 'false', 'Allow anonymous usage data');
