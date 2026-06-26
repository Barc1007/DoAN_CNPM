-- Migration: Thêm cột hỗ trợ Google OAuth
-- Khuyến nghị dùng script idempotent:
-- cd backend && node scripts/migrate-google-oauth.js

USE studentmoney;

-- Thêm cột tra cứu email ổn định vì email chính đang được mã hóa
ALTER TABLE users
  ADD COLUMN email_lookup CHAR(64) NULL AFTER email;

-- Thêm cột google_id để lưu Google User ID
ALTER TABLE users
  ADD COLUMN google_id VARCHAR(255) NULL AFTER full_name,
  ADD COLUMN auth_provider ENUM('local', 'google', 'both') NOT NULL DEFAULT 'local' AFTER google_id,
  ADD COLUMN google_secret VARCHAR(255) NULL AFTER auth_provider;

-- Cho phép password NULL (Google users không có password)
ALTER TABLE users
  MODIFY COLUMN password VARCHAR(255) NULL;

-- Index để tìm nhanh theo google_id
CREATE UNIQUE INDEX uq_users_email_lookup ON users (email_lookup);
CREATE UNIQUE INDEX uq_users_google_id ON users (google_id);
CREATE INDEX idx_users_google_id ON users (google_id);

-- Username cũng có thể NULL với Google users (sẽ tự tạo)
-- Tuy nhiên ta vẫn giữ NOT NULL và tự sinh username từ email
