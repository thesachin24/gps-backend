
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
