

CREATE DATABASE IF NOT EXISTS studentmoney
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE studentmoney;
CREATE TABLE users (
  user_id       INT             NOT NULL AUTO_INCREMENT,
  username      VARCHAR(50)     NOT NULL,
  email         VARCHAR(100)    NOT NULL,
  email_lookup  CHAR(64)        NULL,
  password      VARCHAR(255)    NULL,
  full_name     TEXT            NOT NULL,
  google_id     VARCHAR(255)    NULL,
  auth_provider ENUM('local','google','both') NOT NULL DEFAULT 'local',
  google_secret VARCHAR(255)    NULL,
  created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
 
  PRIMARY KEY (user_id),
  UNIQUE KEY uq_users_username (username),
  UNIQUE KEY uq_users_email    (email),
  UNIQUE KEY uq_users_email_lookup (email_lookup),
  UNIQUE KEY uq_users_google_id (google_id),
  INDEX idx_users_google_id (google_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

 

CREATE TABLE categories (
  category_id INT          NOT NULL AUTO_INCREMENT,
  user_id     INT                   DEFAULT NULL,         
  name        VARCHAR(100) NOT NULL,
  type        VARCHAR(10)  NOT NULL,
 
  PRIMARY KEY (category_id),
  CONSTRAINT CK_cat_type CHECK (type IN ('income', 'expense')),
 
  CONSTRAINT FK_cat_user
    FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
 
 
CREATE TABLE wallets (
  wallet_id       INT           NOT NULL AUTO_INCREMENT,
  user_id         INT           NOT NULL,
  name            VARCHAR(255)  NOT NULL,
  initial_balance VARCHAR(255)  NOT NULL,
  wallet_type     VARCHAR(15)   NOT NULL,
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_active       TINYINT(1)    NOT NULL DEFAULT 1,
 
  PRIMARY KEY (wallet_id),
  CONSTRAINT CK_wallet_type
    CHECK (wallet_type IN ('cash', 'bank', 'e-wallet', 'credit', 'other')),
 
  CONSTRAINT FK_wallet_user
    FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
 
CREATE TABLE transactions (
  transaction_id   INT           NOT NULL AUTO_INCREMENT,
  user_id          INT           NOT NULL,
  wallet_id        INT           NOT NULL,
  category_id      INT           NOT NULL,
  amount           VARCHAR(255)  NOT NULL,
  transaction_date DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  note             TEXT                   DEFAULT NULL,
 
  PRIMARY KEY (transaction_id),
 
  CONSTRAINT FK_trans_user
    FOREIGN KEY (user_id)     REFERENCES users(user_id)       ON DELETE CASCADE,
  CONSTRAINT FK_trans_wallet
    FOREIGN KEY (wallet_id)   REFERENCES wallets(wallet_id),
  CONSTRAINT FK_trans_category
    FOREIGN KEY (category_id) REFERENCES categories(category_id),
 
  INDEX idx_trans_user_date     (user_id, transaction_date),
  INDEX idx_trans_category      (user_id, category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
 
 
CREATE TABLE budgets (
  budget_id    INT           NOT NULL AUTO_INCREMENT,
  user_id      INT           NOT NULL,
  category_id  INT                    DEFAULT NULL,
  name         VARCHAR(255)  NOT NULL,
  limit_amount VARCHAR(255)  NOT NULL,
  spent_amount VARCHAR(255)  NOT NULL,
  start_date   DATE          NOT NULL,
  end_date     DATE          NOT NULL,
  alert        DECIMAL(5,2)  NOT NULL DEFAULT 80.00,
 
  PRIMARY KEY (budget_id),
  CONSTRAINT CK_budget_dates     CHECK (end_date >= start_date),
  CONSTRAINT CK_budget_threshold CHECK (alert BETWEEN 1 AND 100),
 
  CONSTRAINT FK_budget_user
    FOREIGN KEY (user_id)     REFERENCES users(user_id)          ON DELETE CASCADE,
  CONSTRAINT FK_budget_category
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE SET NULL,
 
  INDEX idx_budget_user (user_id, end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
 
CREATE TABLE notifications (
  notification_id INT            NOT NULL AUTO_INCREMENT,
  user_id         INT            NOT NULL,
  type            VARCHAR(20)    NOT NULL,
  title           VARCHAR(255)   NOT NULL,
  message         TEXT           NOT NULL,
  is_read         TINYINT(1)     NOT NULL DEFAULT 0,
  created_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
 
  PRIMARY KEY (notification_id),
  CONSTRAINT CK_notif_type
    CHECK (type IN ('budget_alert', 'daily_reminder', 'system')),
 
  CONSTRAINT FK_notif_user
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
 
  INDEX idx_notif_user_unread (user_id, is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE user_settings (
  user_id            INT          NOT NULL,
  dark_mode          TINYINT(1)   NOT NULL DEFAULT 0,
  tx_notifications   TINYINT(1)   NOT NULL DEFAULT 1,
  budget_reminders   TINYINT(1)   NOT NULL DEFAULT 1,
  auto_backup        TINYINT(1)   NOT NULL DEFAULT 0,
  updated_at         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
                      ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (user_id),
  CONSTRAINT FK_settings_user
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
 
CREATE TABLE goals (
  goal_id        INT           NOT NULL AUTO_INCREMENT,
  user_id        INT           NOT NULL,
  wallet_id      INT                    DEFAULT NULL,
  name           TEXT          NOT NULL,
  target_amount  VARCHAR(255)  NOT NULL,
  current_amount VARCHAR(255)  NOT NULL,
  start_date     DATE                   DEFAULT NULL,
  end_date       DATE                   DEFAULT NULL,
  status         VARCHAR(20)   NOT NULL DEFAULT 'active',
  created_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
 
  PRIMARY KEY (goal_id),
  CONSTRAINT CK_goal_status
    CHECK (status IN ('active', 'completed', 'cancelled', 'paused')),
  CONSTRAINT CK_goal_dates
    CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date),
 
  CONSTRAINT FK_goal_user
    FOREIGN KEY (user_id)   REFERENCES users(user_id)     ON DELETE CASCADE,
  CONSTRAINT FK_goal_wallet
    FOREIGN KEY (wallet_id) REFERENCES wallets(wallet_id) ON DELETE SET NULL,
 
  INDEX idx_goal_user_status (user_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
 
 
CREATE TABLE goal_contributions (
  contribution_id INT           NOT NULL AUTO_INCREMENT,
  goal_id         INT           NOT NULL,
  wallet_id       INT           NOT NULL,
  amount          VARCHAR(255)  NOT NULL,
  note            TEXT                   DEFAULT NULL,
  contributed_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
 
  PRIMARY KEY (contribution_id),
 
  CONSTRAINT FK_contrib_goal
    FOREIGN KEY (goal_id)   REFERENCES goals(goal_id)     ON DELETE CASCADE,
  CONSTRAINT FK_contrib_wallet
    FOREIGN KEY (wallet_id) REFERENCES wallets(wallet_id),
 
  INDEX idx_contrib_goal (goal_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
 
 
CREATE OR REPLACE VIEW v_wallet_balance AS
SELECT
  w.wallet_id,
  w.user_id,
  w.name,
  w.wallet_type,
  w.is_active,
  w.initial_balance,
  w.initial_balance AS current_balance
FROM wallets w;
 
CREATE OR REPLACE VIEW v_transactions AS
SELECT
  t.transaction_id,
  t.user_id,
  t.wallet_id,
  t.category_id,
  c.type          AS type,
  c.name          AS category_name,
  t.amount,
  t.transaction_date,
  t.note
FROM transactions t
JOIN categories   c ON t.category_id = c.category_id;
