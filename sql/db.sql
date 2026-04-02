
------------------------------------------------------------------------------------------------------------------------


-- Create a sequence for the `id` column
CREATE SEQUENCE users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- Create the table
CREATE TABLE users (
    id INT NOT NULL DEFAULT nextval('users_id_seq') PRIMARY KEY,
    email VARCHAR(254) UNIQUE,
    role VARCHAR(128) NOT NULL DEFAULT 'USER',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_blocked BOOLEAN NOT NULL DEFAULT FALSE,
    name VARCHAR(255),
    phone VARCHAR(128) NOT NULL,
    verification_code VARCHAR(255),
    locality VARCHAR(255),
    address VARCHAR(255),
    city VARCHAR(255),
    state VARCHAR(255),
    pincode VARCHAR(255),
    country VARCHAR(255),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    profile_image VARCHAR(255),
    kyc_self_image VARCHAR(255),
    kyc_doc_front VARCHAR(255),
    kyc_doc_back VARCHAR(255),
    kyc_status VARCHAR(255),
    dob TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Optionally, set sequence ownership
ALTER SEQUENCE users_id_seq OWNED BY users.id;

------------------------------------------------------------------------------------------------------------------------


-- Create a sequence for the `id` column
CREATE SEQUENCE access_token_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- Create the table
CREATE TABLE access_token (
    id INT NOT NULL DEFAULT nextval('access_token_id_seq') PRIMARY KEY,
    ttl INT DEFAULT 1209600,
    user_id INT NOT NULL,
    device_type VARCHAR(255),
    device_id VARCHAR(255),
    token VARCHAR(255),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Optionally, you can set the sequence to be owned by the `id` column
ALTER SEQUENCE access_token_id_seq OWNED BY access_token.id;

------------------------------------------------------------------------------------------------------------------------



------------------------------------------------------------------------------------------------------------------------

CREATE SEQUENCE user_device_id_seq START WITH 1 INCREMENT BY 1;

CREATE TABLE user_device (
    id INTEGER PRIMARY KEY DEFAULT nextval('user_device_id_seq'),
    device_type VARCHAR(255),
    device_id VARCHAR(255),
    user_id INTEGER NOT NULL,
    push_token VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER SEQUENCE user_device_id_seq OWNED BY user_device.id;

------------------------------------------------------------------------------------------------------------------------


CREATE TABLE hardware_devices (
    id BIGSERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    device_id VARCHAR(255) NOT NULL UNIQUE,
    device_type VARCHAR(255) NOT NULL DEFAULT 'GPS_TRACKER',
    name VARCHAR(255),
    metadata JSONB,
    latitude DECIMAL(9, 6),
    longitude DECIMAL(9, 6),
    last_recorded_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_hardware_devices_user_id
    ON hardware_devices (user_id);

CREATE INDEX idx_hardware_devices_is_active
    ON hardware_devices (is_active);

------------------------------------------------------------------------------------------------------------------------


CREATE TABLE options (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  value TEXT NOT NULL,
  type VARCHAR(255) NOT NULL,
  category VARCHAR(255) NOT NULL,
  data_type VARCHAR(10) CHECK (data_type IN ('VARCHAR', 'BOOLEAN', 'INT')) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER SEQUENCE options_id_seq RESTART WITH 36;


INSERT INTO options (id, name, value, type, category, data_type, created_at, updated_at) VALUES
(4, 'ACCOUNT_NUMBER', '', 'BANK', 'PAYMENT', 'VARCHAR', '2023-08-17 19:46:45', '2023-08-17 20:10:33'),
(5, 'NAME', '', 'BANK', 'PAYMENT', 'VARCHAR', '2023-08-17 19:46:45', '2023-08-17 20:10:33'),
(6, 'IFSC', '', 'BANK', 'PAYMENT', 'VARCHAR', '2023-08-17 19:46:45', '2023-08-17 20:10:33'),
(7, 'ACCOUNT_TYPE', '', 'BANK', 'PAYMENT', 'VARCHAR', '2023-08-17 19:46:45', '2023-08-17 20:10:33'),
(8, 'ID', 'CONTACT TO SUPPORT', 'UPI', 'PAYMENT', 'VARCHAR', '2023-08-17 19:46:45', '2023-08-17 20:10:33'),
(11, 'NAME', '', 'UPI', 'PAYMENT', 'VARCHAR', '2023-08-17 19:46:45', '2023-08-17 20:10:33'),
(13, 'MOBILE', '', 'CUSTOMER_SUPPORT', 'SUPPORT', 'VARCHAR', '2023-08-17 19:46:45', '2023-08-17 20:10:33'),
(14, 'WHATSAPP', '', 'CUSTOMER_SUPPORT', 'SUPPORT', 'VARCHAR', '2023-08-17 19:46:45', '2023-08-17 20:10:33'),
(15, 'EMAIL', '', 'CUSTOMER_SUPPORT', 'SUPPORT', 'VARCHAR', '2023-08-17 19:46:45', '2023-08-17 20:10:33'),
(16, 'FACEBOOK', '', 'CUSTOMER_SUPPORT', 'SUPPORT', 'VARCHAR', '2023-08-17 19:46:45', '2023-08-17 20:10:33'),
(17, 'WEBSITE', '', 'CUSTOMER_SUPPORT', 'SUPPORT', 'VARCHAR', '2023-08-17 19:46:45', '2023-08-17 20:10:33'),
(18, 'SHOW', 'true', 'ONGOING', 'MAINTENANCE', 'BOOLEAN', '2023-08-17 19:46:45', '2023-08-17 20:10:33'),
(19, 'ALERT', 'Server Upgrading', 'ONGOING', 'MAINTENANCE', 'VARCHAR', '2023-08-17 19:46:45', '2023-08-17 20:10:33'),
(20, 'SHOW', 'false', 'UPCOMING', 'MAINTENANCE', 'BOOLEAN', '2023-08-17 19:46:45', '2023-08-17 20:10:33'),
(21, 'ALERT', 'We are....', 'UPCOMING', 'MAINTENANCE', 'VARCHAR', '2023-08-17 19:46:45', '2023-08-17 20:10:33'),
(22, 'BRANCH', '', 'BANK', 'PAYMENT', 'VARCHAR', '2023-08-17 19:46:45', '2023-08-17 20:10:33'),
(28, 'MESSAGE', '', 'DASHBOARD_ALERT', 'ANNOUNCEMENT', 'VARCHAR', '2023-08-17 19:46:45', '2023-08-17 20:10:33'),
(29, 'SHOW', 'false', 'DASHBOARD_ALERT', 'ANNOUNCEMENT', 'BOOLEAN', '2023-08-17 19:46:45', '2023-08-17 20:10:33'),
(30, 'LATEST_VERSION', '1.5', 'ANDROID', 'APP_FORCE_UPDATE', 'INT', '2023-08-17 19:46:45', '2023-08-17 20:10:33'),
(31, 'MIN_VERSION', '1.5', 'ANDROID', 'APP_FORCE_UPDATE', 'INT', '2023-08-17 19:46:45', '2023-08-17 20:10:33'),
(32, 'LATEST_VERSION', '1.99', 'IOS', 'APP_FORCE_UPDATE', 'INT', '2023-08-17 19:46:45', '2023-08-17 20:10:33'),
(33, 'MIN_VERSION', '18.80', 'IOS', 'APP_FORCE_UPDATE', 'INT', '2023-08-17 19:46:45', '2023-08-17 20:10:33'),
(34, 'APP_NAME', 'GPS', 'APPLICATION', 'CONFIG', 'VARCHAR', '2023-08-17 19:46:45', '2023-08-17 20:10:33'),
(35, 'SLOGAN', 'GPS', 'APPLICATION', 'CONFIG', 'VARCHAR', '2023-08-17 19:46:45', '2023-08-17 20:10:33');



------------------------------------------------------------------------------------------------------------------------











------------------------------------------------------------------------------------------------------------------------

CREATE TABLE device_locations (
    id BIGSERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    device_id VARCHAR(255) NOT NULL,
    device_type VARCHAR(255) NOT NULL,
    latitude DECIMAL(9, 6) NOT NULL,
    longitude DECIMAL(9, 6) NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL,
    accuracy FLOAT,
    speed FLOAT,
    heading FLOAT,
    altitude FLOAT,
    source VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_device_locations_device_recorded_at
    ON device_locations (device_id, recorded_at DESC);

CREATE INDEX idx_device_locations_recorded_at
    ON device_locations (recorded_at DESC);

CREATE INDEX idx_device_locations_user_id
    ON device_locations (user_id);

------------------------------------------------------------------------------------------------------------------------
