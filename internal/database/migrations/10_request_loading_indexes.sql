CREATE INDEX IF NOT EXISTS idx_requests_project_id ON requests(project_id);
CREATE INDEX IF NOT EXISTS idx_collections_project_id ON collections(project_id);
CREATE INDEX IF NOT EXISTS idx_request_body_request_id ON request_body(request_id);
CREATE INDEX IF NOT EXISTS idx_request_params_request_id ON request_params(request_id);
CREATE INDEX IF NOT EXISTS idx_request_headers_request_id ON request_headers(request_id);
CREATE INDEX IF NOT EXISTS idx_request_auth_request_id ON request_auth(request_id);
