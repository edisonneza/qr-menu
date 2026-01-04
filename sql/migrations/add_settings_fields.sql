-- Migration: Add settings fields to tenants table
-- This adds additional fields for store configuration

ALTER TABLE tenants ADD COLUMN address VARCHAR(255) NULL;
ALTER TABLE tenants ADD COLUMN description TEXT NULL;
ALTER TABLE tenants ADD COLUMN business_hours VARCHAR(100) NULL;
ALTER TABLE tenants ADD COLUMN currency VARCHAR(10) DEFAULT 'USD';
ALTER TABLE tenants ADD COLUMN website VARCHAR(255) NULL;
ALTER TABLE tenants ADD COLUMN instagram VARCHAR(255) NULL;
ALTER TABLE tenants ADD COLUMN facebook VARCHAR(255) NULL;
ALTER TABLE tenants ADD COLUMN timezone VARCHAR(50) DEFAULT 'UTC';
ALTER TABLE tenants ADD COLUMN notifications_email VARCHAR(100) NULL;
