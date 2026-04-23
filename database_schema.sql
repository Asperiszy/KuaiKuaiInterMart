-- ============================================================
-- KuaiKuaiInterMart — Database Schema
-- Version: 1.0 | Date: 2026-04-23
-- ============================================================

CREATE DATABASE IF NOT EXISTS kuaikuaiintermart CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE kuaikuaiintermart;

-- ------------------------------------------------------------
-- CURRENCIES
-- ------------------------------------------------------------
CREATE TABLE currencies (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code        VARCHAR(10)    NOT NULL UNIQUE,   -- e.g. USD, CNY, GBP
    name        VARCHAR(100)   NOT NULL,
    symbol      VARCHAR(10)    NOT NULL,
    exchange_rate DECIMAL(12,6) NOT NULL DEFAULT 1.000000, -- relative to base currency
    updated_at  DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- CATEGORIES
-- ------------------------------------------------------------
CREATE TABLE categories (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100)   NOT NULL UNIQUE,
    description TEXT
);

-- ------------------------------------------------------------
-- USERS
-- ------------------------------------------------------------
CREATE TABLE users (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username        VARCHAR(150)   NOT NULL UNIQUE,
    email           VARCHAR(254)   NOT NULL UNIQUE,
    password_hash   VARCHAR(255)   NOT NULL,
    first_name      VARCHAR(100),
    last_name       VARCHAR(100),
    is_admin        BOOLEAN        NOT NULL DEFAULT FALSE,
    preferred_currency_id INT UNSIGNED,
    created_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (preferred_currency_id) REFERENCES currencies(id) ON DELETE SET NULL
);

-- ------------------------------------------------------------
-- PRODUCTS
-- ------------------------------------------------------------
CREATE TABLE products (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(255)   NOT NULL,
    description     TEXT,
    base_price      DECIMAL(12,2)  NOT NULL,
    currency_id     INT UNSIGNED   NOT NULL,
    category_id     INT UNSIGNED,
    stock           INT UNSIGNED   NOT NULL DEFAULT 0,
    image_url       VARCHAR(500),
    region          VARCHAR(100),              -- origin region for cross-border display
    created_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (currency_id)  REFERENCES currencies(id),
    FOREIGN KEY (category_id)  REFERENCES categories(id) ON DELETE SET NULL
);

-- ------------------------------------------------------------
-- CART
-- ------------------------------------------------------------
CREATE TABLE cart (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id     INT UNSIGNED   NOT NULL UNIQUE, -- one cart per user
    created_at  DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE cart_items (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    cart_id     INT UNSIGNED   NOT NULL,
    product_id  INT UNSIGNED   NOT NULL,
    quantity    INT UNSIGNED   NOT NULL DEFAULT 1,
    added_at    DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_cart_product (cart_id, product_id),
    FOREIGN KEY (cart_id)    REFERENCES cart(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- ORDERS
-- ------------------------------------------------------------
CREATE TABLE orders (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id         INT UNSIGNED   NOT NULL,
    status          ENUM('pending','confirmed','shipped','delivered','cancelled')
                                   NOT NULL DEFAULT 'pending',
    total_amount    DECIMAL(12,2)  NOT NULL,
    currency_id     INT UNSIGNED   NOT NULL,
    shipping_address TEXT          NOT NULL,
    created_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)    REFERENCES users(id),
    FOREIGN KEY (currency_id) REFERENCES currencies(id)
);

CREATE TABLE order_items (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id    INT UNSIGNED   NOT NULL,
    product_id  INT UNSIGNED   NOT NULL,
    quantity    INT UNSIGNED   NOT NULL,
    unit_price  DECIMAL(12,2)  NOT NULL,  -- price at time of order
    FOREIGN KEY (order_id)   REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- ------------------------------------------------------------
-- PAYMENTS
-- ------------------------------------------------------------
CREATE TABLE payments (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id        INT UNSIGNED   NOT NULL UNIQUE,
    amount          DECIMAL(12,2)  NOT NULL,
    currency_id     INT UNSIGNED   NOT NULL,
    method          ENUM('credit_card','paypal','bank_transfer','simulated')
                                   NOT NULL DEFAULT 'simulated',
    status          ENUM('pending','completed','failed','refunded')
                                   NOT NULL DEFAULT 'pending',
    transaction_ref VARCHAR(255),
    created_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id)    REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (currency_id) REFERENCES currencies(id)
);

-- ------------------------------------------------------------
-- LOGISTICS
-- ------------------------------------------------------------
CREATE TABLE logistics (
    id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id            INT UNSIGNED   NOT NULL UNIQUE,
    tracking_number     VARCHAR(100),
    carrier             VARCHAR(100),
    status              ENUM('not_shipped','processing','in_transit','out_for_delivery','delivered')
                                       NOT NULL DEFAULT 'not_shipped',
    origin_region       VARCHAR(100),
    destination_region  VARCHAR(100),
    estimated_delivery  DATE,
    updated_at          DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- SEED DATA — Currencies
-- ------------------------------------------------------------
INSERT INTO currencies (code, name, symbol, exchange_rate) VALUES
    ('USD', 'US Dollar',        '$',  1.000000),
    ('CNY', 'Chinese Yuan',     '¥',  7.240000),
    ('GBP', 'British Pound',    '£',  0.790000),
    ('EUR', 'Euro',             '€',  0.920000),
    ('JPY', 'Japanese Yen',     '¥', 149.50000);

-- ------------------------------------------------------------
-- SEED DATA — Categories
-- ------------------------------------------------------------
INSERT INTO categories (name, description) VALUES
    ('Electronics',  'Phones, laptops, accessories'),
    ('Fashion',      'Clothing, shoes, bags'),
    ('Home & Living','Furniture, kitchenware, decor'),
    ('Beauty',       'Skincare, cosmetics, personal care'),
    ('Sports',       'Equipment, activewear, outdoor gear');
