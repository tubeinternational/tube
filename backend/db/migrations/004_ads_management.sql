-- =========================
-- ADS MANAGEMENT TABLE
-- =========================

CREATE TABLE IF NOT EXISTS ads (
    id SERIAL PRIMARY KEY,

    name VARCHAR(255) NOT NULL,

    placement VARCHAR(50) NOT NULL,

    type VARCHAR(20) DEFAULT 'SCRIPT',

    code TEXT NOT NULL,

    device VARCHAR(20) DEFAULT 'ALL',

    is_active BOOLEAN DEFAULT TRUE,

    priority INT DEFAULT 0,

    start_date TIMESTAMP NULL,
    end_date TIMESTAMP NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- INDEXES (IMPORTANT)
-- =========================

CREATE INDEX IF NOT EXISTS idx_ads_placement ON ads(placement);
CREATE INDEX IF NOT EXISTS idx_ads_active ON ads(is_active);
CREATE INDEX IF NOT EXISTS idx_ads_priority ON ads(priority DESC);

-- =========================
-- OPTIONAL: AUTO UPDATE updated_at
-- =========================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS set_timestamp_ads ON ads;

CREATE TRIGGER set_timestamp_ads
BEFORE UPDATE ON ads
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();