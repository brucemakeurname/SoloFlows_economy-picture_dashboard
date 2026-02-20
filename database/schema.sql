-- ============================================================
-- Economy Picture Dashboard - MySQL Schema
-- Solo Flows / aitemplate.co
-- Created: 2026-02-20
-- ============================================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- -----------------------------------------------------------
-- 1. categories
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    type        ENUM('revenue','cogs','opex','capex','cash') NOT NULL,
    color       VARCHAR(20)  DEFAULT '#6B7280',
    sort_order  INT UNSIGNED DEFAULT 0,
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_categories_type (type),
    INDEX idx_categories_sort (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- 2. accounts
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS accounts (
    id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code         VARCHAR(10)  NOT NULL UNIQUE,
    name         VARCHAR(150) NOT NULL,
    category_id  INT UNSIGNED NOT NULL,
    subcategory  VARCHAR(100) DEFAULT NULL,
    status       ENUM('active','inactive') DEFAULT 'active',
    notes        TEXT         DEFAULT NULL,
    created_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_accounts_category (category_id),
    INDEX idx_accounts_status (status),
    INDEX idx_accounts_code (code),

    CONSTRAINT fk_accounts_category
        FOREIGN KEY (category_id) REFERENCES categories(id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- 3. ledger_entries
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS ledger_entries (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    account_id  INT UNSIGNED   NOT NULL,
    period      VARCHAR(20)    NOT NULL,
    budget      DECIMAL(12,2)  DEFAULT 0.00,
    actual      DECIMAL(12,2)  DEFAULT 0.00,
    variance    DECIMAL(12,2)  GENERATED ALWAYS AS (actual - budget) STORED,
    status      ENUM('forecast','actual','closed') DEFAULT 'forecast',
    notes       TEXT           DEFAULT NULL,
    created_at  TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uq_account_period (account_id, period),
    INDEX idx_ledger_period (period),
    INDEX idx_ledger_status (status),
    INDEX idx_ledger_account (account_id),

    CONSTRAINT fk_ledger_account
        FOREIGN KEY (account_id) REFERENCES accounts(id)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- 4. kpi_metrics
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS kpi_metrics (
    id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name           VARCHAR(150)  NOT NULL,
    group_name     ENUM('finance','marketing','growth','product') NOT NULL,
    unit           VARCHAR(30)   DEFAULT NULL,
    target_value   DECIMAL(14,2) DEFAULT NULL,
    current_value  DECIMAL(14,2) DEFAULT NULL,
    period         VARCHAR(20)   DEFAULT NULL,
    status         ENUM('on_track','warning','off_track') DEFAULT 'on_track',
    notes          TEXT          DEFAULT NULL,
    created_at     TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_kpi_group (group_name),
    INDEX idx_kpi_period (period),
    INDEX idx_kpi_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- 5. periods
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS periods (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code        VARCHAR(20)  NOT NULL UNIQUE,
    label       VARCHAR(60)  NOT NULL,
    start_date  DATE         NOT NULL,
    end_date    DATE         NOT NULL,
    is_active   BOOLEAN      DEFAULT FALSE,
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_periods_code (code),
    INDEX idx_periods_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- 6. data_sources
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS data_sources (
    id                    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name                  VARCHAR(150) NOT NULL,
    type                  ENUM('manual','api','webhook','database') NOT NULL,
    endpoint              VARCHAR(500) DEFAULT NULL,
    auth_config           JSON         DEFAULT NULL,
    sync_interval_minutes INT UNSIGNED DEFAULT 60,
    last_sync_at          TIMESTAMP    NULL DEFAULT NULL,
    status                ENUM('active','inactive','error') DEFAULT 'active',
    config                JSON         DEFAULT NULL,
    created_at            TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_datasources_type (type),
    INDEX idx_datasources_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
