
USE studentmoney;
ALTER TABLE users
  ADD COLUMN google_id VARCHAR(255) NULL UNIQUE AFTER full_name,
  ADD COLUMN auth_provider ENUM('local', 'google') NOT NULL DEFAULT 'local' AFTER google_id,
  ADD COLUMN google_secret VARCHAR(255) NULL AFTER auth_provider;
ALTER TABLE users
  MODIFY COLUMN password VARCHAR(255) NULL;
CREATE INDEX idx_users_google_id ON users (google_id);

