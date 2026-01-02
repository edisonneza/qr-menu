CREATE DATABASE IF NOT EXISTS ta_menu CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ta_menu;

-- Tenants table (for multi-tenant SaaS)
CREATE TABLE IF NOT EXISTS tenants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  phone VARCHAR(30),
  whatsapp_number VARCHAR(30),
  logo_url VARCHAR(255),
  color_theme VARCHAR(50),
  plan_id INT DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'manager', 'staff') DEFAULT 'staff',
  is_active BOOLEAN DEFAULT TRUE,
  phone VARCHAR(30),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login_at DATETIME NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  INDEX idx_tenant_id (tenant_id),
  INDEX idx_email (email)
);

CREATE TABLE IF NOT EXISTS stores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(30),
  logo VARCHAR(255),
  subscription_plan VARCHAR(50) DEFAULT 'Free',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  store_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  store_id INT NOT NULL,
  category_id INT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  image VARCHAR(255),
  variants JSON NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- sample store (password = demo1234)
INSERT INTO stores (name, slug, email, password, phone, logo, subscription_plan)
VALUES ('Demo Cafe', 'demo-cafe', 'demo@cafe.test', '$2y$10$KbQi7mQY5aRkQ9o1Fqv9..q1wCKmQb3yqY5R7xqH4ZP0OQ8pGZ8m6', '+35500000000', '', 'Free');
INSERT INTO categories (store_id, name) VALUES (1, 'Hot Drinks'), (1, 'Cold Drinks'), (1, 'Desserts');
INSERT INTO products (store_id, category_id, name, description, price, variants)
VALUES
(1, 1, 'Espresso', 'Single shot espresso', 1.50, NULL),
(1, 1, 'Cappuccino', 'With milk foam', 2.50, JSON_ARRAY(JSON_OBJECT('name','Small','price_diff',0), JSON_OBJECT('name','Large','price_diff',0.8))),
(1, 3, 'Chocolate Cake', 'Rich chocolate cake slice', 3.00, NULL);
