-- device_locations schema for PostgreSQL
-- Run this script once before starting GPS ingestion.

CREATE TABLE IF NOT EXISTS device_locations (
    id BIGSERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    device_id VARCHAR(255) NOT NULL,
    device_type VARCHAR(255) NOT NULL,
    latitude DECIMAL(9, 6) NOT NULL,
    longitude DECIMAL(9, 6) NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    accuracy FLOAT,
    speed FLOAT,
    heading FLOAT,
    altitude FLOAT,
    source VARCHAR(100)
);

CREATE INDEX IF NOT EXISTS idx_device_locations_device_recorded_at
    ON device_locations (device_id, recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_device_locations_recorded_at
    ON device_locations (recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_device_locations_user_id
    ON device_locations (user_id);
