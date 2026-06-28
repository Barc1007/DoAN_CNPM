USE studentmoney;

CREATE TABLE IF NOT EXISTS password_resets (
  reset_id   INT          NOT NULL AUTO_INCREMENT,
  user_id    INT          NOT NULL,
  otp_hash   CHAR(64)     NOT NULL,
  expires_at DATETIME     NOT NULL,
  consumed   TINYINT(1)  NOT NULL DEFAULT 0,
  attempts   INT          NOT NULL DEFAULT 0,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (reset_id),
  CONSTRAINT FK_reset_user
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_reset_user (user_id, consumed, expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
