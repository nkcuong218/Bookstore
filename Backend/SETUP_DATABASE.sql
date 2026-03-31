-- =============================================
-- SQL SCRIPT: TẠO ADMIN USER CHO TEST
-- Database: tmdt_bookstore
-- =============================================

-- Tạo database (nếu chưa có)
CREATE DATABASE IF NOT EXISTS tmdt_bookstore 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE tmdt_bookstore;

-- Sau khi backend chạy lần đầu (tables đã được tạo tự động),
-- chạy câu lệnh này để tạo admin user:

-- PASSWORD: admin123 (đã được BCrypt hash)
-- Email: admin@bookstore.com
INSERT INTO user (id, full_name, email, password, phone, address, role, status, created_at, updated_at)
VALUES (
    1,
    'Admin',
    'admin@bookstore.com',
    '$2a$10$XPTYZmQfC4RXXJnZWE5vfOQzF9Y2gHXmZxqL3nJKpGlLHxqWY8C9G', -- admin123
    '0123456789',
    'Admin Address',
    'admin',
    'active',
    NOW(),
    NOW()
);

-- Tạo thêm một customer user để test
INSERT INTO user (id, full_name, email, password, phone, address, role, status, created_at, updated_at)
VALUES (
    2,
    'Test User',
    'user@bookstore.com',
    '$2a$10$XPTYZmQfC4RXXJnZWE5vfOQzF9Y2gHXmZxqL3nJKpGlLHxqWY8C9G', -- admin123
    '0987654321',
    'User Address',
    'customer',
    'active',
    NOW(),
    NOW()
);

-- =============================================
-- SAMPLE DATA: THÊM SÁCH MẪU
-- =============================================

INSERT INTO book (title, author, price, genre, description, cover_url, isbn, pages, publisher, language, rating, reviews, stock, in_stock, created_at, updated_at)
VALUES 
(
    'Clean Code',
    'Robert C. Martin',
    350000,
    'Technology',
    'A Handbook of Agile Software Craftsmanship',
    'https://m.media-amazon.com/images/I/51E2055ZGUL._SY344_BO1,204,203,200_.jpg',
    '978-0132350884',
    464,
    'Prentice Hall',
    'Tiếng Anh',
    4.7,
    1250,
    50,
    true,
    NOW(),
    NOW()
),
(
    'The Pragmatic Programmer',
    'David Thomas, Andrew Hunt',
    400000,
    'Technology',
    'Your Journey To Mastery',
    'https://m.media-amazon.com/images/I/51W1sBPO7tL._SY344_BO1,204,203,200_.jpg',
    '978-0135957059',
    352,
    'Addison-Wesley',
    'Tiếng Anh',
    4.8,
    980,
    30,
    true,
    NOW(),
    NOW()
),
(
    'Design Patterns',
    'Erich Gamma, Richard Helm',
    450000,
    'Technology',
    'Elements of Reusable Object-Oriented Software',
    'https://m.media-amazon.com/images/I/51szD9HC9pL._SY344_BO1,204,203,200_.jpg',
    '978-0201633610',
    395,
    'Addison-Wesley',
    'Tiếng Anh',
    4.6,
    850,
    25,
    true,
    NOW(),
    NOW()
),
(
    'Atomic Habits',
    'James Clear',
    250000,
    'Self-Help',
    'An Easy & Proven Way to Build Good Habits & Break Bad Ones',
    'https://m.media-amazon.com/images/I/51Tlm0GZTXL._SY344_BO1,204,203,200_.jpg',
    '978-0735211292',
    320,
    'Avery',
    'Tiếng Việt',
    4.8,
    3500,
    100,
    true,
    NOW(),
    NOW()
),
(
    'Sapiens',
    'Yuval Noah Harari',
    300000,
    'History',
    'A Brief History of Humankind',
    'https://m.media-amazon.com/images/I/51Sn8PEXwcL._SY344_BO1,204,203,200_.jpg',
    '978-0062316097',
    443,
    'Harper',
    'Tiếng Việt',
    4.6,
    5200,
    75,
    true,
    NOW(),
    NOW()
),
(
    'The Lean Startup',
    'Eric Ries',
    280000,
    'Business',
    'How Today\'s Entrepreneurs Use Continuous Innovation',
    'https://m.media-amazon.com/images/I/51Zymoq7UnL._SY344_BO1,204,203,200_.jpg',
    '978-0307887894',
    336,
    'Crown Business',
    'Tiếng Anh',
    4.5,
    1800,
    40,
    true,
    NOW(),
    NOW()
),
(
    'Thinking, Fast and Slow',
    'Daniel Kahneman',
    320000,
    'Psychology',
    'Understanding how we think',
    'https://m.media-amazon.com/images/I/41shZGS-G+L._SY344_BO1,204,203,200_.jpg',
    '978-0374533557',
    499,
    'Farrar, Straus and Giroux',
    'Tiếng Việt',
    4.7,
    2100,
    60,
    true,
    NOW(),
    NOW()
),
(
    'The Alchemist',
    'Paulo Coelho',
    200000,
    'Fiction',
    'A magical fable about following your dreams',
    'https://m.media-amazon.com/images/I/51Z0nLAfLmL._SY344_BO1,204,203,200_.jpg',
    '978-0062315007',
    208,
    'HarperOne',
    'Tiếng Việt',
    4.6,
    4500,
    120,
    true,
    NOW(),
    NOW()
);

-- =============================================
-- VERIFICATION: KIỂM TRA DỮ LIỆU
-- =============================================

-- Check users
SELECT id, full_name, email, role, status FROM user;

-- Check books
SELECT id, title, author, price, genre, stock FROM book;

-- =============================================
-- LOGIN CREDENTIALS ĐỂ TEST:
-- =============================================
-- Admin:
--   Email: admin@bookstore.com
--   Password: admin123
--
-- Customer:
--   Email: user@bookstore.com
--   Password: admin123
-- =============================================
