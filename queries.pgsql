-- -- Check vendor data
SELECT * FROM vendors;

-- -- Check user data
-- SELECT id, email, first_name, last_name, role FROM users;

-- -- Check product data
-- SELECT * FROM products;

-- -- Check order data
-- SELECT * FROM orders;

-- -- Check analytics data (verify dashboard numbers)
-- SELECT * FROM analytics WHERE date = '2025-05-18';

-- -- Count total records in each table
-- SELECT 
--     (SELECT COUNT(*) FROM users) AS user_count,
--     (SELECT COUNT(*) FROM vendors) AS vendor_count,
--     (SELECT COUNT(*) FROM products) AS product_count,
--     (SELECT COUNT(*) FROM orders) AS order_count,
--     (SELECT COUNT(*) FROM analytics) AS analytics_count;


-- SELECT table_name
-- FROM information_schema.tables
-- WHERE table_schema = 'public'
-- AND table_type = 'BASE TABLE'
-- ORDER BY table_name;