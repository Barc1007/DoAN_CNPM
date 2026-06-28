CREATE TABLE IF NOT EXISTS user_settings (
  user_id            INT          NOT NULL,
  dark_mode          TINYINT(1)   NOT NULL DEFAULT 0,
  tx_notifications   TINYINT(1)   NOT NULL DEFAULT 1,
  budget_reminders   TINYINT(1)   NOT NULL DEFAULT 1,
  auto_backup        TINYINT(1)   NOT NULL DEFAULT 0,
  updated_at         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
                      ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id),
  CONSTRAINT FK_settings_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO user_settings (user_id) SELECT user_id FROM users;
