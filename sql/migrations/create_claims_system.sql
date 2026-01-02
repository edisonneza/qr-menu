-- Migration: Create Claims-Based Permission System
-- Date: 2026-01-02
-- Description: Implements granular permission system with role-based defaults and user-specific overrides

USE ta_menu;

-- Claims table - stores all available permissions in the system
CREATE TABLE IF NOT EXISTS claims (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE COMMENT 'e.g., users.create, products.edit',
  resource VARCHAR(50) NOT NULL COMMENT 'e.g., users, products, orders',
  action VARCHAR(50) NOT NULL COMMENT 'e.g., view, create, edit, delete, export',
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_resource (resource),
  INDEX idx_name (name)
);

-- Role Claims - default permissions for each role
CREATE TABLE IF NOT EXISTS role_claims (
  id INT AUTO_INCREMENT PRIMARY KEY,
  role ENUM('admin', 'manager', 'staff') NOT NULL,
  claim_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (claim_id) REFERENCES claims(id) ON DELETE CASCADE,
  UNIQUE KEY unique_role_claim (role, claim_id),
  INDEX idx_role (role)
);

-- User Claims - user-specific permission overrides
CREATE TABLE IF NOT EXISTS user_claims (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  claim_id INT NOT NULL,
  granted BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'TRUE = explicitly granted, FALSE = explicitly denied',
  granted_by INT NULL COMMENT 'User ID who granted this permission',
  granted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (claim_id) REFERENCES claims(id) ON DELETE CASCADE,
  FOREIGN KEY (granted_by) REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE KEY unique_user_claim (user_id, claim_id),
  INDEX idx_user_id (user_id),
  INDEX idx_claim_id (claim_id)
);

-- Audit log for permission changes
CREATE TABLE IF NOT EXISTS claim_audit_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL COMMENT 'User whose permissions were modified',
  claim_id INT NOT NULL,
  action ENUM('granted', 'revoked') NOT NULL,
  modified_by INT NOT NULL COMMENT 'User who made the change',
  tenant_id INT NOT NULL,
  previous_value BOOLEAN NULL,
  new_value BOOLEAN NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (claim_id) REFERENCES claims(id) ON DELETE CASCADE,
  FOREIGN KEY (modified_by) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_tenant_id (tenant_id),
  INDEX idx_created_at (created_at)
);

-- Insert default claims grouped by resource
INSERT INTO claims (name, resource, action, description) VALUES
-- User Management Claims
('users.view', 'users', 'view', 'View users list and details'),
('users.create', 'users', 'create', 'Create new users'),
('users.edit', 'users', 'edit', 'Edit existing users'),
('users.delete', 'users', 'delete', 'Delete users'),
('users.manage_permissions', 'users', 'manage_permissions', 'Manage user permissions and claims'),

-- Product Management Claims
('products.view', 'products', 'view', 'View products list and details'),
('products.create', 'products', 'create', 'Create new products'),
('products.edit', 'products', 'edit', 'Edit existing products'),
('products.delete', 'products', 'delete', 'Delete products'),
('products.export', 'products', 'export', 'Export products data'),

-- Category Management Claims
('categories.view', 'categories', 'view', 'View categories list'),
('categories.create', 'categories', 'create', 'Create new categories'),
('categories.edit', 'categories', 'edit', 'Edit existing categories'),
('categories.delete', 'categories', 'delete', 'Delete categories'),

-- Order Management Claims
('orders.view', 'orders', 'view', 'View orders list and details'),
('orders.create', 'orders', 'create', 'Create new orders'),
('orders.edit', 'orders', 'edit', 'Edit existing orders'),
('orders.delete', 'orders', 'delete', 'Delete orders'),
('orders.export', 'orders', 'export', 'Export orders data'),

-- Tenant/Settings Claims
('tenant.view', 'tenant', 'view', 'View tenant settings'),
('tenant.edit', 'tenant', 'edit', 'Edit tenant settings'),

-- Reports Claims
('reports.view', 'reports', 'view', 'View reports and analytics'),
('reports.export', 'reports', 'export', 'Export reports data');

-- Assign default claims to roles
-- Admin role: Full access to everything
INSERT INTO role_claims (role, claim_id)
SELECT 'admin', id FROM claims;

-- Manager role: Most permissions except user management and critical settings
INSERT INTO role_claims (role, claim_id)
SELECT 'manager', id FROM claims 
WHERE name IN (
  'users.view',
  'products.view', 'products.create', 'products.edit', 'products.delete', 'products.export',
  'categories.view', 'categories.create', 'categories.edit', 'categories.delete',
  'orders.view', 'orders.create', 'orders.edit', 'orders.export',
  'tenant.view',
  'reports.view', 'reports.export'
);

-- Staff role: Basic view and create permissions
INSERT INTO role_claims (role, claim_id)
SELECT 'staff', id FROM claims 
WHERE name IN (
  'products.view', 'products.create',
  'categories.view',
  'orders.view', 'orders.create'
);

SELECT 'Claims system created successfully!' AS '';
SELECT CONCAT('Total claims: ', COUNT(*)) AS '' FROM claims;
SELECT role, COUNT(*) as claim_count FROM role_claims GROUP BY role;
