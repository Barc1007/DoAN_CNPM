-- Migration: Thêm cột hỗ trợ Google OAuth
-- Chạy file này một lần để cập nhật schema

USE studentmoney;

-- Thêm cột google_id để lưu Google User ID
ALTER TABLE users
  ADD COLUMN google_id VARCHAR(255) NULL UNIQUE AFTER full_name,
  ADD COLUMN auth_provider ENUM('local', 'google') NOT NULL DEFAULT 'local' AFTER google_id,
  ADD COLUMN google_secret VARCHAR(255) NULL AFTER auth_provider;

-- Cho phép password NULL (Google users không có password)
ALTER TABLE users
  MODIFY COLUMN password VARCHAR(255) NULL;

-- Index để tìm nhanh theo google_id
CREATE INDEX idx_users_google_id ON users (google_id);

-- Username cũng có thể NULL với Google users (sẽ tự tạo)
-- Tuy nhiên ta vẫn giữ NOT NULL và tự sinh username từ email
