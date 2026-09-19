ALTER TABLE saved_responses ADD COLUMN body_encoding TEXT NOT NULL DEFAULT 'text';
ALTER TABLE saved_responses ADD COLUMN content_type TEXT NOT NULL DEFAULT '';
ALTER TABLE saved_responses ADD COLUMN size_bytes INTEGER;
