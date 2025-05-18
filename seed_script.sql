-- PostgreSQL Seed Script for Multi-Vendor Arabic E-commerce Platform (السوق الكبير)
-- This script creates tables and inserts initial data from all screenshots

-- Drop tables if they exist (comment out if you don't want to drop existing tables)
DROP TABLE IF EXISTS discount_coupons_products CASCADE;
DROP TABLE IF EXISTS discount_coupons CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS delivery_addresses CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS analytics CASCADE;
DROP TABLE IF EXISTS vendor_settings CASCADE;
DROP TABLE IF EXISTS vendors CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create tables
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vendors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    logo_url TEXT,
    description TEXT,
    primary_color VARCHAR(20) DEFAULT '#3F51B5',
    secondary_color VARCHAR(20) DEFAULT '#FFFFFF',
    accent_color VARCHAR(20) DEFAULT '#FF4081',
    user_id INTEGER REFERENCES users(id),
    last_seen TIMESTAMP WITH TIME ZONE,
    market_name VARCHAR(255),
    main_phone VARCHAR(20),
    sub_phone VARCHAR(20),
    whatsapp VARCHAR(20),
    address TEXT,
    main_email VARCHAR(255),
    sub_email VARCHAR(255),
    country VARCHAR(100),
    city VARCHAR(100),
    about_me TEXT,
    market_location TEXT,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vendor_settings (
    id SERIAL PRIMARY KEY,
    vendor_id INTEGER REFERENCES vendors(id) ON DELETE CASCADE,
    setting_key VARCHAR(100) NOT NULL,
    setting_value TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (vendor_id, setting_key)
);

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    vendor_id INTEGER REFERENCES vendors(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'SAR',
    stock INTEGER DEFAULT 0,
    image_url TEXT,
    additional_images TEXT[],
    classification VARCHAR(100),
    status VARCHAR(50) DEFAULT 'available',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (vendor_id, slug)
);

CREATE TABLE delivery_addresses (
    id SERIAL PRIMARY KEY,
    vendor_id INTEGER REFERENCES vendors(id) ON DELETE CASCADE,
    address TEXT NOT NULL,
    country VARCHAR(100),
    city VARCHAR(100),
    email VARCHAR(255),
    mobile VARCHAR(20),
    status VARCHAR(50) DEFAULT 'available',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(50) NOT NULL,
    vendor_id INTEGER REFERENCES vendors(id) ON DELETE CASCADE,
    customer_name VARCHAR(255),
    customer_email VARCHAR(255),
    total_amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'SAR',
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (vendor_id, order_number)
);

CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE discount_coupons (
    id SERIAL PRIMARY KEY,
    vendor_id INTEGER REFERENCES vendors(id) ON DELETE CASCADE,
    name VARCHAR(255),
    code VARCHAR(100) NOT NULL,
    discount_type VARCHAR(20) DEFAULT 'percentage', -- percentage or fixed
    discount_value DECIMAL(10, 2) NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'available',
    coupon_sort VARCHAR(50),
    target_audience VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (vendor_id, code)
);

CREATE TABLE discount_coupons_products (
    id SERIAL PRIMARY KEY,
    coupon_id INTEGER REFERENCES discount_coupons(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (coupon_id, product_id)
);

CREATE TABLE analytics (
    id SERIAL PRIMARY KEY,
    vendor_id INTEGER REFERENCES vendors(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_sales DECIMAL(10, 2) DEFAULT 0,
    active_sales DECIMAL(10, 2) DEFAULT 0,
    product_revenue DECIMAL(10, 2) DEFAULT 0,
    daily_income DECIMAL(10, 2) DEFAULT 0,
    deposit_income DECIMAL(10, 2) DEFAULT 0,
    spendings DECIMAL(10, 2) DEFAULT 0,
    day_of_week VARCHAR(3),
    month VARCHAR(20),
    year INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (vendor_id, date)
);

-- Insert seed data
-- 1. Insert admin user
INSERT INTO users (email, password, first_name, last_name, role)
VALUES ('admin@alsouqalkabeer.com', '$2a$10$randomhashedpassword', 'Admin', 'User', 'admin');

-- 2. Insert vendor user
INSERT INTO users (email, password, first_name, last_name, role)
VALUES ('teddy@alsouqalkabeer.com', '$2a$10$randomhashedpassword', 'Teddy', 'Manager', 'vendor');

-- 3. Insert Teddy vendor (from screenshots)
INSERT INTO vendors (
    name, 
    slug, 
    logo_url, 
    description, 
    primary_color, 
    user_id, 
    last_seen,
    market_name,
    main_phone,
    sub_phone,
    whatsapp,
    address,
    main_email,
    sub_email,
    country,
    city,
    about_me,
    market_location
)
VALUES (
    'Teddy store', 
    'teddy-store', 
    'https://example.com/logos/teddy.png', 
    'Specialty store for teddy bears and plush toys',
    '#3F51B5',
    (SELECT id FROM users WHERE email = 'teddy@alsouqalkabeer.com'),
    '2025-05-18 05:00:00+00',
    'Ahmed Amer',
    '+965-448-1516',
    '03141266662',
    '01021771999',
    'Lorem ipsum dolor sit amet consectetur.',
    'dgfjhagk@ji.it',
    'dgfjhagk@ji.it',
    'Egypt',
    'Cairo',
    'About me information for Teddy store vendor',
    'Lorem ipsum dolor sit amet consectetur.'
);

-- 4. Insert vendor settings
INSERT INTO vendor_settings (vendor_id, setting_key, setting_value)
VALUES
    ((SELECT id FROM vendors WHERE slug = 'teddy-store'), 'currency', 'SAR'),
    ((SELECT id FROM vendors WHERE slug = 'teddy-store'), 'language', 'ar'),
    ((SELECT id FROM vendors WHERE slug = 'teddy-store'), 'shipping_methods', 'standard,express'),
    ((SELECT id FROM vendors WHERE slug = 'teddy-store'), 'payment_methods', 'cash,credit_card,wallet');

-- 5. Insert delivery addresses (from image 1)
INSERT INTO delivery_addresses (vendor_id, address, country, city, email, mobile, status)
VALUES
    ((SELECT id FROM vendors WHERE slug = 'teddy-store'), 'First address', 'Egypt', 'Cairo', 'amer@gmail.com', '01118100461', 'available'),
    ((SELECT id FROM vendors WHERE slug = 'teddy-store'), 'First address', 'Egypt', 'Cairo', 'amer@gmail.com', '01118100461', 'unavailable'),
    ((SELECT id FROM vendors WHERE slug = 'teddy-store'), 'First address', 'Egypt', 'Cairo', 'amer@gmail.com', '01118100461', 'available'),
    ((SELECT id FROM vendors WHERE slug = 'teddy-store'), 'First address', 'Egypt', 'Cairo', 'amer@gmail.com', '01118100461', 'unavailable'),
    ((SELECT id FROM vendors WHERE slug = 'teddy-store'), 'First address', 'Egypt', 'Cairo', 'amer@gmail.com', '01118100461', 'available'),
    ((SELECT id FROM vendors WHERE slug = 'teddy-store'), 'First address', 'Egypt', 'Cairo', 'amer@gmail.com', '01118100461', 'unavailable'),
    ((SELECT id FROM vendors WHERE slug = 'teddy-store'), 'First address', 'Egypt', 'Cairo', 'amer@gmail.com', '01118100461', 'available'),
    ((SELECT id FROM vendors WHERE slug = 'teddy-store'), 'First address', 'Egypt', 'Cairo', 'amer@gmail.com', '01118100461', 'available');

-- 6. Insert products (from images 7 and 8)
INSERT INTO products (vendor_id, name, slug, description, price, stock, status, image_url, additional_images, classification)
VALUES
    ((SELECT id FROM vendors WHERE slug = 'teddy-store'), 'Black teddy bear large', 'black-teddy-bear-large', 'Large black teddy bear for children', 150, 150, 'available', 'https://example.com/products/black-teddy.jpg', ARRAY['https://example.com/products/black-teddy2.jpg', 'https://example.com/products/black-teddy3.jpg'], 'Bears'),
    ((SELECT id FROM vendors WHERE slug = 'teddy-store'), 'Black teddy bear large', 'black-teddy-bear-large-2', 'Large black teddy bear for children', 200, 300, 'available', 'https://example.com/products/black-teddy.jpg', ARRAY['https://example.com/products/black-teddy2.jpg', 'https://example.com/products/black-teddy3.jpg'], 'Bears'),
    ((SELECT id FROM vendors WHERE slug = 'teddy-store'), 'Black teddy bear large', 'black-teddy-bear-large-3', 'Large black teddy bear for children', 150, 150, 'available', 'https://example.com/products/black-teddy.jpg', ARRAY['https://example.com/products/black-teddy2.jpg', 'https://example.com/products/black-teddy3.jpg'], 'Bears'),
    ((SELECT id FROM vendors WHERE slug = 'teddy-store'), 'Black teddy bear large', 'black-teddy-bear-large-4', 'Large black teddy bear for children', 150, 150, 'available', 'https://example.com/products/black-teddy.jpg', ARRAY['https://example.com/products/black-teddy2.jpg', 'https://example.com/products/black-teddy3.jpg'], 'Bears'),
    ((SELECT id FROM vendors WHERE slug = 'teddy-store'), 'Black teddy bear large', 'black-teddy-bear-large-5', 'Large black teddy bear for children', 150, 150, 'available', 'https://example.com/products/black-teddy.jpg', ARRAY['https://example.com/products/black-teddy2.jpg', 'https://example.com/products/black-teddy3.jpg'], 'Bears'),
    ((SELECT id FROM vendors WHERE slug = 'teddy-store'), 'Black teddy bear large', 'black-teddy-bear-large-6', 'Large black teddy bear for children', 150, 150, 'available', 'https://example.com/products/black-teddy.jpg', ARRAY['https://example.com/products/black-teddy2.jpg', 'https://example.com/products/black-teddy3.jpg'], 'Bears'),
    ((SELECT id FROM vendors WHERE slug = 'teddy-store'), 'Brown teddy bear', 'brown-teddy-bear', 'Soft brown teddy bear with premium materials', 500, 75, 'available', 'https://example.com/products/brown-teddy.jpg', ARRAY['https://example.com/products/brown-teddy2.jpg', 'https://example.com/products/brown-teddy3.jpg'], 'Premium');

-- 7. Insert orders (from image 4)
INSERT INTO orders (vendor_id, order_number, customer_name, total_amount, currency, status, created_at)
VALUES
    ((SELECT id FROM vendors WHERE slug = 'teddy-store'), '#2010', 'KoHo Man', 300, 'SAR', 'complete', '2020-10-20 10:00:00+00'),
    ((SELECT id FROM vendors WHERE slug = 'teddy-store'), '#2011', 'KoHo Man', 300, 'SAR', 'complete', '2020-10-20 10:00:00+00'),
    ((SELECT id FROM vendors WHERE slug = 'teddy-store'), '#2012', 'KoHo Man', 300, 'SAR', 'cancelled', '2020-10-20 10:00:00+00'),
    ((SELECT id FROM vendors WHERE slug = 'teddy-store'), '#2013', 'KoHo Man', 300, 'SAR', 'pending', '2020-10-20 10:00:00+00'),
    ((SELECT id FROM vendors WHERE slug = 'teddy-store'), '#2014', 'KoHo Man', 300, 'SAR', 'shipping', '2020-10-20 10:00:00+00'),
    ((SELECT id FROM vendors WHERE slug = 'teddy-store'), '#2015', 'KoHo Man', 300, 'SAR', 'complete', '2020-10-20 10:00:00+00'),
    ((SELECT id FROM vendors WHERE slug = 'teddy-store'), '#2016', 'KoHo Man', 300, 'SAR', 'complete', '2020-10-20 10:00:00+00'),
    ((SELECT id FROM vendors WHERE slug = 'teddy-store'), '#2017', 'KoHo Man', 300, 'SAR', 'complete', '2020-10-20 10:00:00+00');

-- 8. Insert order items
INSERT INTO order_items (order_id, product_id, quantity, price)
VALUES
    (1, 1, 2, 150),
    (2, 2, 1, 300),
    (3, 3, 2, 150),
    (4, 4, 2, 150),
    (5, 5, 2, 150),
    (6, 6, 2, 150),
    (7, 1, 2, 150),
    (8, 2, 1, 300);

-- 9. Insert discount coupons (from image 5 and 6)
INSERT INTO discount_coupons (vendor_id, name, code, discount_type, discount_value, start_date, end_date, status, coupon_sort, target_audience)
VALUES
    ((SELECT id FROM vendors WHERE slug = 'teddy-store'), 'Lorem ipsum dolor sit amet consectetur.', 'Amer50', 'percentage', 30, '2020-10-20 10:00:00+00', '2020-10-20 10:00:00+00', 'available', 'ghjhjk', 'Only member'),
    ((SELECT id FROM vendors WHERE slug = 'teddy-store'), 'Lorem ipsum dolor sit amet consectetur.', 'Amer51', 'percentage', 30, '2020-10-20 10:00:00+00', '2020-10-20 10:00:00+00', 'available', 'ghjhjk', 'Only member'),
    ((SELECT id FROM vendors WHERE slug = 'teddy-store'), 'Lorem ipsum dolor sit amet consectetur.', 'Amer52', 'percentage', 50, '2020-10-20 10:00:00+00', '2020-10-20 10:00:00+00', 'available', 'ghjhjk', 'Only member'),
    ((SELECT id FROM vendors WHERE slug = 'teddy-store'), 'Lorem ipsum dolor sit amet consectetur.', 'Amer53', 'percentage', 30, '2020-10-20 10:00:00+00', '2020-10-20 10:00:00+00', 'available', 'ghjhjk', 'Only member'),
    ((SELECT id FROM vendors WHERE slug = 'teddy-store'), 'Lorem ipsum dolor sit amet consectetur.', 'Amer54', 'percentage', 40, '2020-10-20 10:00:00+00', '2020-10-20 10:00:00+00', 'available', 'ghjhjk', 'Only member'),
    ((SELECT id FROM vendors WHERE slug = 'teddy-store'), 'Lorem ipsum dolor sit amet consectetur.', 'Amer55', 'percentage', 30, '2020-10-20 10:00:00+00', '2020-10-20 10:00:00+00', 'available', 'ghjhjk', 'Only member'),
    ((SELECT id FROM vendors WHERE slug = 'teddy-store'), 'Lorem ipsum dolor sit amet consectetur.', 'Amer56', 'percentage', 60, '2020-10-20 10:00:00+00', '2020-10-20 10:00:00+00', 'available', 'ghjhjk', 'Only member'),
    ((SELECT id FROM vendors WHERE slug = 'teddy-store'), 'Lorem ipsum dolor sit amet consectetur.', 'Amer57', 'percentage', 10, '2020-10-20 10:00:00+00', '2020-10-20 10:00:00+00', 'available', 'ghjhjk', 'Only member'),
    ((SELECT id FROM vendors WHERE slug = 'teddy-store'), 'Lorem ipsum dolor sit amet consectetur.', 'Teddy_366', 'percentage', 50, '2020-10-20 10:00:00+00', '2020-10-20 10:00:00+00', 'available', 'ghjhjk', 'Only member');

-- 10. Connect coupons to products
INSERT INTO discount_coupons_products (coupon_id, product_id)
VALUES
    (1, 1),
    (2, 2),
    (3, 3),
    (4, 4),
    (5, 5),
    (6, 6),
    (7, 1),
    (8, 2),
    (9, 3);

-- 11. Insert analytics data matching the dashboard values in images 3 and 4
-- Insert for current month and previous months
INSERT INTO analytics (vendor_id, date, total_sales, active_sales, product_revenue, daily_income, deposit_income, spendings, day_of_week, month, year)
VALUES
    -- Current day data - Sunday (from screenshot)
    ((SELECT id FROM vendors WHERE slug = 'teddy-store'), '2025-05-18', 50000, 28000, 16000, 15000, 5000, 10000, 'SUN', 'May', 2025),
    
    -- Previous days data (for the weekday chart)
    ((SELECT id FROM vendors WHERE slug = 'teddy-store'), '2025-05-17', 49000, 27500, 15800, 14000, 4500, 9500, 'SAT', 'May', 2025),
    ((SELECT id FROM vendors WHERE slug = 'teddy-store'), '2025-05-16', 48000, 27000, 15600, 13500, 4800, 9200, 'FRI', 'May', 2025),
    ((SELECT id FROM vendors WHERE slug = 'teddy-store'), '2025-05-15', 47000, 26500, 15400, 13000, 4300, 8500, 'THU', 'May', 2025),
    ((SELECT id FROM vendors WHERE slug = 'teddy-store'), '2025-05-14', 46000, 26000, 15200, 12500, 4000, 8000, 'WED', 'May', 2025),
    ((SELECT id FROM vendors WHERE slug = 'teddy-store'), '2025-05-13', 45000, 25500, 15000, 12000, 3800, 7500, 'TUE', 'May', 2025),
    ((SELECT id FROM vendors WHERE slug = 'teddy-store'), '2025-05-12', 44000, 25000, 14800, 11500, 3500, 7000, 'MON', 'May', 2025),
    
    -- Previous months data (for trends)
    ((SELECT id FROM vendors WHERE slug = 'teddy-store'), '2025-04-30', 40000, 24000, 14800, 12000, 3200, 6500, 'TUE', 'April', 2025),
    ((SELECT id FROM vendors WHERE slug = 'teddy-store'), '2025-03-31', 38000, 22500, 14000, 11500, 3000, 6000, 'MON', 'March', 2025),
    ((SELECT id FROM vendors WHERE slug = 'teddy-store'), '2025-02-29', 35000, 21000, 13000, 10000, 2800, 5500, 'THU', 'February', 2025),
    ((SELECT id FROM vendors WHERE slug = 'teddy-store'), '2025-01-31', 32000, 19500, 12500, 9000, 2500, 5000, 'FRI', 'January', 2025);

-- Create indexes for better performance
CREATE INDEX idx_vendors_slug ON vendors(slug);
CREATE INDEX idx_products_vendor_id ON products(vendor_id);
CREATE INDEX idx_orders_vendor_id ON orders(vendor_id);
CREATE INDEX idx_analytics_vendor_date ON analytics(vendor_id, date);
CREATE INDEX idx_delivery_addresses_vendor_id ON delivery_addresses(vendor_id);
CREATE INDEX idx_discount_coupons_vendor_id ON discount_coupons(vendor_id);
CREATE INDEX idx_vendor_settings_vendor_id ON vendor_settings(vendor_id);

-- Grant permissions if needed (uncomment if necessary)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO doadmin;