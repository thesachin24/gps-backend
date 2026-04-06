-- hardware_devices schema for PostgreSQL
-- Stores physical GPS tracker / hardware device mappings.

CREATE TABLE IF NOT EXISTS hardware_devices (
    id BIGSERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    device_id VARCHAR(255) NOT NULL UNIQUE,
    device_type VARCHAR(255) NOT NULL DEFAULT 'GPS_TRACKER',
    name VARCHAR(255),
    metadata JSONB,
    heartbeat JSONB,
    latitude DECIMAL(9, 6),
    longitude DECIMAL(9, 6),
    last_recorded_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_hardware_devices_user_id
    ON hardware_devices (user_id);

CREATE INDEX IF NOT EXISTS idx_hardware_devices_is_active
    ON hardware_devices (is_active);
