-- Migration: Add role column to users table
-- Date: 2026-01-02
-- Run this migration to add missing columns to the users table

USE ta_menu;

-- Add role column (skip if exists)
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'role') > 0,
  "SELECT 'role column already exists' AS ''",
  "ALTER TABLE users ADD COLUMN role ENUM('admin', 'manager', 'staff') DEFAULT 'staff' AFTER password_hash"
));
PREPARE alterStatement FROM @preparedStatement;
EXECUTE alterStatement;
DEALLOCATE PREPARE alterStatement;

-- Add is_active column (skip if exists)
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'is_active') > 0,
  "SELECT 'is_active column already exists' AS ''",
  "ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE AFTER role"
));
PREPARE alterStatement FROM @preparedStatement;
EXECUTE alterStatement;
DEALLOCATE PREPARE alterStatement;

-- Add phone column (skip if exists)
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'phone') > 0,
  "SELECT 'phone column already exists' AS ''",
  "ALTER TABLE users ADD COLUMN phone VARCHAR(30) AFTER is_active"
));
PREPARE alterStatement FROM @preparedStatement;
EXECUTE alterStatement;
DEALLOCATE PREPARE alterStatement;

-- Add last_login_at column (skip if exists)
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'last_login_at') > 0,
  "SELECT 'last_login_at column already exists' AS ''",
  "ALTER TABLE users ADD COLUMN last_login_at DATETIME NULL AFTER created_at"
));
PREPARE alterStatement FROM @preparedStatement;
EXECUTE alterStatement;
DEALLOCATE PREPARE alterStatement;

-- Add updated_at column (skip if exists)
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'updated_at') > 0,
  "SELECT 'updated_at column already exists' AS ''",
  "ALTER TABLE users ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER last_login_at"
));
PREPARE alterStatement FROM @preparedStatement;
EXECUTE alterStatement;
DEALLOCATE PREPARE alterStatement;

SELECT 'Migration completed successfully!' AS '';
