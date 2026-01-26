CREATE INDEX IF NOT EXISTS idx_contact_requests_status
ON contact_requests(status);

CREATE INDEX IF NOT EXISTS idx_content_removal_status
ON content_removal_requests(status);
