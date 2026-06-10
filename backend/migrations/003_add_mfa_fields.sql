-- File: backend/migrations/003_add_mfa_fields.sql
ALTER TABLE UserTable 
ADD COLUMN MFA_Secret VARCHAR(128) NULL,
ADD COLUMN MFA_Enabled BOOLEAN NOT NULL DEFAULT FALSE;
