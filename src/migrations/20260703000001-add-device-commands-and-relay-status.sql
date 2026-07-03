-- ============================================================
-- Migration: Add device_commands table + relay/ignition columns
-- Run once against your PostgreSQL database.
-- ============================================================

-- 1. Add new columns to device_state (safe – will skip if already present)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'device_state' AND column_name = 'heading'
  ) THEN
    ALTER TABLE device_state ADD COLUMN heading FLOAT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'device_state' AND column_name = 'ignition'
  ) THEN
    ALTER TABLE device_state
      ADD COLUMN ignition BOOLEAN DEFAULT NULL;
    COMMENT ON COLUMN device_state.ignition
      IS 'ACC/ignition state from heartbeat terminalInfo bit 1';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'device_state' AND column_name = 'relay_status'
  ) THEN
    ALTER TABLE device_state
      ADD COLUMN relay_status BOOLEAN DEFAULT NULL;
    COMMENT ON COLUMN device_state.relay_status
      IS 'Relay/immobilizer state from heartbeat terminalInfo bit 0 (armed)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'device_state' AND column_name = 'heartbeat'
  ) THEN
    ALTER TABLE device_state
      ADD COLUMN heartbeat JSONB DEFAULT NULL;
    COMMENT ON COLUMN device_state.heartbeat
      IS 'Latest decoded heartbeat packet';
  END IF;
END $$;

-- 2. Create the ENUM type for command status (safe – skip if exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_device_commands_status') THEN
    CREATE TYPE enum_device_commands_status AS ENUM (
      'pending',
      'sent',
      'acknowledged',
      'failed'
    );
  END IF;
END $$;

-- 3. Create device_commands table
CREATE TABLE IF NOT EXISTS device_commands (
  id             BIGSERIAL    PRIMARY KEY,
  device_id      BIGINT       NOT NULL
                   REFERENCES devices(id) ON UPDATE CASCADE ON DELETE CASCADE,
  device_string_id VARCHAR(255) NOT NULL,           -- IMEI / device string ID
  command        VARCHAR(255) NOT NULL,              -- ASCII command e.g. "RELAY,1"
  status         enum_device_commands_status NOT NULL DEFAULT 'pending',
  server_flag    VARCHAR(8)   DEFAULT NULL,          -- 4-byte hex used to match 0x17 response
  serial         INTEGER      DEFAULT NULL,          -- GT06 serial number in the packet
  response       TEXT         DEFAULT NULL,          -- Raw ASCII response from device
  sent_at        TIMESTAMPTZ  DEFAULT NULL,
  acked_at       TIMESTAMPTZ  DEFAULT NULL,
  error          TEXT         DEFAULT NULL,
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- 4. Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_device_commands_device_id
  ON device_commands (device_id);

CREATE INDEX IF NOT EXISTS idx_device_commands_device_string_id
  ON device_commands (device_string_id);

CREATE INDEX IF NOT EXISTS idx_device_commands_server_flag
  ON device_commands (server_flag);

CREATE INDEX IF NOT EXISTS idx_device_commands_status
  ON device_commands (status);

-- 5. Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_device_commands_updated_at ON device_commands;
CREATE TRIGGER trg_device_commands_updated_at
  BEFORE UPDATE ON device_commands
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
