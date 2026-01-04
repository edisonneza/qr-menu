-- Migration: Create tenant_currencies table for multi-currency support
-- This allows tenants to support multiple currencies for their products

CREATE TABLE tenant_currencies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  currency_code VARCHAR(10) NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_tenant_currency (tenant_id, currency_code),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  INDEX idx_tenant_id (tenant_id)
);

-- Optional: Remove currency column from tenants table and add a default_currency column instead
ALTER TABLE tenants DROP COLUMN currency;
-- ALTER TABLE tenants ADD COLUMN default_currency VARCHAR(10) DEFAULT 'USD';
