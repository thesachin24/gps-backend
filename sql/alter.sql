
-- kyc_self_image, kyc_doc_front,  kyc_doc_back

ALTER TABLE public.users 
ADD COLUMN verification_code VARCHAR(255),
ADD COLUMN role VARCHAR(255) DEFAULT 'USER',
ADD COLUMN is_blocked BOOLEAN DEFAULT FALSE,
ADD COLUMN locality VARCHAR(255),
ADD COLUMN address VARCHAR(255),
ADD COLUMN city VARCHAR(255),
ADD COLUMN state VARCHAR(255),
ADD COLUMN pincode VARCHAR(255),
ADD COLUMN country VARCHAR(255),
ADD COLUMN latitude DOUBLE PRECISION,
ADD COLUMN longitude DOUBLE PRECISION,
ADD COLUMN profile_image VARCHAR(255),
ADD COLUMN kyc_self_image VARCHAR(255),
ADD COLUMN kyc_doc_front VARCHAR(255),
ADD COLUMN kyc_doc_back VARCHAR(255),
ADD COLUMN kyc_status VARCHAR(255)
;


------------------------------------------------------------------------------------------------------------------------

ALTER TABLE public.users 
ALTER COLUMN password DROP NOT NULL,
ALTER COLUMN last_login DROP NOT NULL,
ALTER COLUMN email DROP NOT NULL,
ALTER COLUMN name DROP NOT NULL,
ALTER COLUMN whatsapp DROP NOT NULL,
ALTER COLUMN address_line_1 DROP NOT NULL,
ALTER COLUMN address_line_2 DROP NOT NULL,
ALTER COLUMN external_id DROP NOT NULL,
ALTER COLUMN city_id DROP NOT NULL,
ALTER COLUMN state_id DROP NOT NULL,
ALTER COLUMN location DROP NOT NULL;

------------------------------------------------------------------------------------------------------------------------

ALTER TABLE public.device_locations
ADD COLUMN IF NOT EXISTS user_id INTEGER,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_device_locations_user_id
ON public.device_locations (user_id);

------------------------------------------------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.hardware_devices (
    id BIGSERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    device_id VARCHAR(255) NOT NULL UNIQUE,
    device_type VARCHAR(255) NOT NULL DEFAULT 'gps_tracker',
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

ALTER TABLE public.hardware_devices
ADD COLUMN IF NOT EXISTS latitude DECIMAL(9, 6),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(9, 6),
ADD COLUMN IF NOT EXISTS last_recorded_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_hardware_devices_user_id
ON public.hardware_devices (user_id);

CREATE INDEX IF NOT EXISTS idx_hardware_devices_is_active
ON public.hardware_devices (is_active);
