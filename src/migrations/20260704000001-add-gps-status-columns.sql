-- Migration: add GPS status columns to device_state
-- Run: psql -U <user> -d <db> -f this_file.sql

BEGIN;

ALTER TABLE device_state
  ADD COLUMN IF NOT EXISTS gps_fixed     BOOLEAN     DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS satellites    INTEGER     DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS gps_tracking  BOOLEAN     DEFAULT NULL;

COMMENT ON COLUMN device_state.gps_fixed    IS 'True if device has a valid GPS fix (courseStatus bit 12 from GPS packet)';
COMMENT ON COLUMN device_state.satellites   IS 'Number of satellites in use at last GPS fix';
COMMENT ON COLUMN device_state.gps_tracking IS 'True if GPS module is actively tracking (bit 6 of heartbeat terminalInfo)';

COMMIT;
