-- Migration: Create dynamic roles table
-- Date: 2026-01-02
-- Description: Convert roles from enum to database table for flexible role management

USE ta_menu;

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  color VARCHAR(50) DEFAULT 'default',
  is_system_role BOOLEAN DEFAULT FALSE COMMENT 'System roles cannot be deleted',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_name (name)
);

-- Insert the three default roles
INSERT INTO roles (name, title, description, color, is_system_role) VALUES
('admin', 'Administrator', 'Full access to all system features and settings', 'error', TRUE),
('manager', 'Manager', 'Manage products, orders, and view reports', 'warning', TRUE),
('staff', 'Staff', 'Basic access to view and create items', 'info', TRUE);

-- Update role_claims to reference roles table by name (keeping existing structure)
-- The role_claims table already uses VARCHAR for role, so it will work with this change

-- Note: The users.role column is still an ENUM, which is fine for now
-- Users will reference roles by name, and the roles table will store metadata
-- If you want to make it a foreign key in the future, you'll need to:
-- 1. ALTER TABLE users MODIFY COLUMN role VARCHAR(50)
-- 2. ADD FOREIGN KEY constraint to roles table

SELECT 'Roles table created successfully!' AS '';
SELECT * FROM roles;
