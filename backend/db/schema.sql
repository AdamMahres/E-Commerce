-- e-commerce database schema
-- Run against a fresh database with: psql -U postgres -d e-commerce -f backend/db/schema.sql

CREATE TABLE IF NOT EXISTS users (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(100) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    is_admin    BOOLEAN NOT NULL DEFAULT false,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id              SERIAL PRIMARY KEY,
    api_product_id  INTEGER NOT NULL UNIQUE,
    title           TEXT NOT NULL,
    price           NUMERIC(10, 2) NOT NULL,
    image           TEXT NOT NULL,
    description     TEXT,
    category        TEXT
);

CREATE TABLE IF NOT EXISTS carts (
    id       SERIAL PRIMARY KEY,
    user_id  INTEGER NOT NULL REFERENCES users(id),
    UNIQUE (user_id)
);

CREATE TABLE IF NOT EXISTS cart_items (
    id          SERIAL PRIMARY KEY,
    product_id  INTEGER NOT NULL REFERENCES products(id),
    cart_id     INTEGER NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    quantity    INTEGER NOT NULL CHECK (quantity > 0),
    UNIQUE (cart_id, product_id)
);

CREATE TABLE IF NOT EXISTS orders (
    id                  SERIAL PRIMARY KEY,
    user_id             INTEGER NOT NULL REFERENCES users(id),
    status              TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
    stripe_session_id   TEXT UNIQUE,
    full_name           VARCHAR(150) NOT NULL,
    address_line1       VARCHAR(200) NOT NULL,
    address_line2       VARCHAR(200),
    city                VARCHAR(100) NOT NULL,
    state               VARCHAR(100),
    postal_code         VARCHAR(20) NOT NULL,
    country             VARCHAR(100) NOT NULL,
    phone               VARCHAR(30),
    total_amount        NUMERIC(10, 2) NOT NULL,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- order_items snapshots product_title/product_image/unit_price at time of purchase
-- rather than joining live to `products`, so historical orders stay accurate even if
-- a product's price changes or the product is later removed from the catalog.
CREATE TABLE IF NOT EXISTS order_items (
    id              SERIAL PRIMARY KEY,
    order_id        INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id      INTEGER REFERENCES products(id) ON DELETE SET NULL,
    product_title   TEXT NOT NULL,
    product_image   TEXT,
    unit_price      NUMERIC(10, 2) NOT NULL,
    quantity        INTEGER NOT NULL CHECK (quantity > 0)
);
