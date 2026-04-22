-- Valora Bank – Seed Data for Testing
-- All three accounts use password: Test@1234

-- 1. Admin
INSERT IGNORE INTO users (first_name, last_name, email, phone, password_hash, role_id, is_active)
VALUES ('Admin', 'User', 'admin@valora.com', '1111111111',
        '$2b$12$fr8SmkAbgOs8QbBdCCb6iusWHPl2mmCW6UUEo9/.35Ht5TKxO8tt.', 1, TRUE);

-- 2. Employee (branch_id = 1, make sure a branch exists)
INSERT INTO branches (name, address, city, state, country, SWIFT_code)
VALUES ('Main Branch', 'Balkumari', 'Lalitpur', 'Bagmati', 'Nepal', 'VLRA0000001');

INSERT INTO users (first_name, last_name, email, phone, password_hash, role_id, branch_id, is_active)
VALUES ('Employee', 'User', 'employee@valora.com', '2222222222',
        '$2b$12$fr8SmkAbgOs8QbBdCCb6iusWHPl2mmCW6UUEo9/.35Ht5TKxO8tt.', 2, 1, TRUE);

-- 3. Customer
INSERT INTO users (first_name, last_name, email, phone, password_hash, role_id, is_active)
VALUES ('Test', 'Customer', 'customer@valora.com', '3333333333',
        '$2b$12$fr8SmkAbgOs8QbBdCCb6iusWHPl2mmCW6UUEo9/.35Ht5TKxO8tt.', 3, TRUE);

-- 4. Give the customer a savings account with Rs. 50,000 for testing fund transfers (make sure the user and branch exist)
INSERT INTO accounts (user_id, account_number, account_type, balance, branch_id, status)
VALUES (
  (SELECT id FROM users WHERE email = 'customer@valora.com'),
  '100000000001', 'savings', 50000.00, 1, 'active'
);

-- 5. Additional branches
INSERT IGNORE INTO branches (name, address, city, state, country, SWIFT_code)
VALUES
  ('Lalitpur Branch', 'Pulchowk, Patan', 'Lalitpur', 'Bagmati', 'Nepal', 'VLRA0000002'),
  ('Pokhara Branch', 'Lakeside, Ward 6', 'Pokhara', 'Gandaki', 'Nepal', 'VLRA0000003'),
  ('Bhaktapur Branch', 'Durbar Square', 'Bhaktapur', 'Bagmati', 'Nepal', 'VLRA0000004'),
  ('Biratnagar Branch', 'Main Road, Ward 10', 'Biratnagar', 'Koshi', 'Nepal', 'VLRA0000005'),
  ('Bharatpur Branch', 'Narayanghat Chowk', 'Bharatpur', 'Bagmati', 'Nepal', 'VLRA0000006');

-- 6. Additional test customers on Main Branch (branch_id = 1) — password: Test@1234
INSERT IGNORE INTO users (first_name, last_name, email, phone, password_hash, role_id, branch_id, is_active)
VALUES
  ('Arogya',  'Adhikari',  'arogya@valora.com',   '9801000001', '$2b$12$fr8SmkAbgOs8QbBdCCb6iusWHPl2mmCW6UUEo9/.35Ht5TKxO8tt.', 3, 1, TRUE),
  ('Pranish', 'Dhungana',  'pranish@valora.com',   '9801000002', '$2b$12$fr8SmkAbgOs8QbBdCCb6iusWHPl2mmCW6UUEo9/.35Ht5TKxO8tt.', 3, 1, TRUE),
  ('Ishwari', 'Shahi',     'ishwari@valora.com',   '9801000003', '$2b$12$fr8SmkAbgOs8QbBdCCb6iusWHPl2mmCW6UUEo9/.35Ht5TKxO8tt.', 3, 1, TRUE),
  ('Suman',   'Karki',     'suman@valora.com',     '9801000004', '$2b$12$fr8SmkAbgOs8QbBdCCb6iusWHPl2mmCW6UUEo9/.35Ht5TKxO8tt.', 3, 1, TRUE),
  ('Anisha',  'Tamang',    'anisha@valora.com',    '9801000005', '$2b$12$fr8SmkAbgOs8QbBdCCb6iusWHPl2mmCW6UUEo9/.35Ht5TKxO8tt.', 3, 1, TRUE),
  ('Bikash',  'Gurung',    'bikash@valora.com',    '9801000006', '$2b$12$fr8SmkAbgOs8QbBdCCb6iusWHPl2mmCW6UUEo9/.35Ht5TKxO8tt.', 3, 1, TRUE),
  ('Priya',   'Maharjan',  'priya@valora.com',     '9801000007', '$2b$12$fr8SmkAbgOs8QbBdCCb6iusWHPl2mmCW6UUEo9/.35Ht5TKxO8tt.', 3, 1, TRUE),
  ('Roshan',  'Thapa',     'roshan@valora.com',    '9801000008', '$2b$12$fr8SmkAbgOs8QbBdCCb6iusWHPl2mmCW6UUEo9/.35Ht5TKxO8tt.', 3, 1, TRUE);

-- 7. Savings accounts for the new customers (Rs. 25,000 each, Main Branch)
INSERT IGNORE INTO accounts (user_id, account_number, account_type, balance, branch_id, status)
VALUES
  ((SELECT id FROM users WHERE email = 'arogya@valora.com'),  '100000000002', 'savings', 25000.00, 1, 'active'),
  ((SELECT id FROM users WHERE email = 'pranish@valora.com'), '100000000003', 'savings', 25000.00, 1, 'active'),
  ((SELECT id FROM users WHERE email = 'ishwari@valora.com'), '100000000004', 'savings', 25000.00, 1, 'active'),
  ((SELECT id FROM users WHERE email = 'suman@valora.com'),   '100000000005', 'savings', 25000.00, 1, 'active'),
  ((SELECT id FROM users WHERE email = 'anisha@valora.com'),  '100000000006', 'savings', 25000.00, 1, 'active'),
  ((SELECT id FROM users WHERE email = 'bikash@valora.com'),  '100000000007', 'savings', 25000.00, 1, 'active'),
  ((SELECT id FROM users WHERE email = 'priya@valora.com'),   '100000000008', 'savings', 25000.00, 1, 'active'),
  ((SELECT id FROM users WHERE email = 'roshan@valora.com'),  '100000000009', 'savings', 25000.00, 1, 'active');
