-- ============================================================
-- Economy Picture Dashboard - Seed Data
-- Solo Flows / aitemplate.co - Vietnamese SaaS Startup
-- Created: 2026-02-20
-- ============================================================

SET NAMES utf8mb4;

-- -----------------------------------------------------------
-- Categories (5)
-- -----------------------------------------------------------
INSERT INTO categories (id, name, type, color, sort_order) VALUES
(1, 'Doanh thu',              'revenue', '#10B981', 1),
(2, 'Gia von - COGS',         'cogs',    '#F59E0B', 2),
(3, 'Chi phi van hanh - OpEx', 'opex',    '#EF4444', 3),
(4, 'Dau tu - CapEx',         'capex',   '#8B5CF6', 4),
(5, 'Tien mat',               'cash',    '#3B82F6', 5);

-- -----------------------------------------------------------
-- Accounts (15)
-- -----------------------------------------------------------
INSERT INTO accounts (id, code, name, category_id, subcategory, status, notes) VALUES
-- Revenue accounts (category_id = 1)
(1,  'REV-001', 'Dat lich Influencer AI',       1, 'Booking',   'active', 'Thu nhap tu dat lich AI influencer tren aitemplate.co'),
(2,  'REV-002', 'Ban credit AI',                1, 'Credits',   'active', 'Ban credit cho nguoi dung tao noi dung AI'),
(3,  'REV-003', 'Affiliate IG/TikTok/Shopee',   1, 'Affiliate', 'active', 'Hoa hong tu lien ket ban hang tren cac nen tang'),
(4,  'REV-004', 'Tai tro thuong hieu',          1, 'Sponsored', 'active', 'Brand deal va tai tro cho Mylara Vey / Bruce'),

-- COGS accounts (category_id = 2)
(5,  'COG-001', 'Google Cloud / Vertex AI',     2, 'Cloud',     'active', 'Chi phi API Gemini, Imagen, Veo'),
(6,  'COG-002', 'API AI ben thu ba',            2, 'Cloud',     'active', 'Grok, Kling, MidJourney API costs'),
(7,  'COG-003', 'Cloudflare R2 Storage',        2, 'Storage',   'active', 'Luu tru media content CDN'),

-- OpEx accounts (category_id = 3)
(8,  'OPX-001', 'Vercel Hosting',               3, 'Hosting',   'active', 'Next.js deployment va bandwidth'),
(9,  'OPX-002', 'Domain va DNS',                3, 'Hosting',   'active', 'aitemplate.co domain va cac dich vu DNS'),
(10, 'OPX-003', 'Supabase',                     3, 'Database',  'active', 'PostgreSQL database va auth service'),
(11, 'OPX-004', 'Marketing va quang cao',       3, 'Marketing', 'active', 'Chi phi quang cao IG, TikTok, noi dung'),
(12, 'OPX-005', 'Phan mem va cong cu',          3, 'Tools',     'active', 'Figma, GitHub, cac tool dev khac'),

-- CapEx accounts (category_id = 4)
(13, 'CAP-001', 'Thiet bi AI - OpenClaw',       4, 'Hardware',  'active', '6 thiet bi AI local inference cluster'),
(14, 'CAP-002', 'Thiet bi van phong',           4, 'Hardware',  'active', 'Laptop, man hinh, phu kien'),

-- Cash accounts (category_id = 5)
(15, 'CSH-001', 'Tai khoan ngan hang chinh',    5, 'Bank',      'active', 'Tai khoan VND chinh de van hanh');

-- -----------------------------------------------------------
-- Periods (6)
-- -----------------------------------------------------------
INSERT INTO periods (id, code, label, start_date, end_date, is_active) VALUES
(1, '2026-01', 'Thang 01/2026', '2026-01-01', '2026-01-31', FALSE),
(2, '2026-02', 'Thang 02/2026', '2026-02-01', '2026-02-28', TRUE),
(3, '2026-03', 'Thang 03/2026', '2026-03-01', '2026-03-31', FALSE),
(4, '2026-04', 'Thang 04/2026', '2026-04-01', '2026-04-30', FALSE),
(5, '2026-05', 'Thang 05/2026', '2026-05-01', '2026-05-31', FALSE),
(6, '2026-06', 'Thang 06/2026', '2026-06-01', '2026-06-30', FALSE);

-- -----------------------------------------------------------
-- Ledger Entries (30) - Periods 2026-02 through 2026-04
-- -----------------------------------------------------------

-- === Period 2026-02 (actual - current month) ===
-- Revenue
INSERT INTO ledger_entries (account_id, period, budget, actual, status, notes) VALUES
(1,  '2026-02',  100.00,   45.00, 'actual',   'Booking dau tien - con it khach'),
(2,  '2026-02',  150.00,   80.00, 'actual',   'Ban credit dang tang dan'),
(3,  '2026-02',   50.00,   12.00, 'actual',   'Affiliate moi bat dau, chua nhieu don'),
(4,  '2026-02',  200.00,    0.00, 'actual',   'Chua co brand deal thang nay'),
-- COGS
(5,  '2026-02',   80.00,   65.00, 'actual',   'Google Cloud API usage thap hon du kien'),
(6,  '2026-02',   40.00,   35.00, 'actual',   'API calls vua phai'),
(7,  '2026-02',   10.00,    5.00, 'actual',   'Storage con it'),
-- OpEx
(8,  '2026-02',   20.00,   20.00, 'actual',   'Vercel Pro plan'),
(9,  '2026-02',   15.00,   12.00, 'actual',   'Domain renewal chia theo thang'),
(10, '2026-02',   25.00,   25.00, 'actual',   'Supabase Pro plan'),

-- === Period 2026-03 (forecast) ===
-- Revenue
(1,  '2026-03',  200.00,    0.00, 'forecast', 'Du kien tang gap doi tu marketing push'),
(2,  '2026-03',  250.00,    0.00, 'forecast', 'Credit sales tang theo user growth'),
(3,  '2026-03',  100.00,    0.00, 'forecast', 'Affiliate bat dau co traction'),
(4,  '2026-03',  300.00,    0.00, 'forecast', 'Dang deal voi 1 brand nho'),
-- COGS
(5,  '2026-03',  120.00,    0.00, 'forecast', 'Tang theo usage'),
(6,  '2026-03',   60.00,    0.00, 'forecast', 'Them nhieu AI adapter'),
(7,  '2026-03',   15.00,    0.00, 'forecast', 'Storage tang dan'),
-- OpEx
(8,  '2026-03',   20.00,    0.00, 'forecast', 'Vercel Pro'),
(9,  '2026-03',   15.00,    0.00, 'forecast', 'Domain/DNS'),
(10, '2026-03',   25.00,    0.00, 'forecast', 'Supabase Pro'),

-- === Period 2026-04 (forecast) ===
-- Revenue
(1,  '2026-04',  350.00,    0.00, 'forecast', 'Growth tu IG marketing campaign'),
(2,  '2026-04',  400.00,    0.00, 'forecast', 'Credit demand tang manh'),
(3,  '2026-04',  150.00,    0.00, 'forecast', 'Affiliate matured'),
(4,  '2026-04',  500.00,    0.00, 'forecast', 'Brand deal lon hon'),
-- COGS
(5,  '2026-04',  180.00,    0.00, 'forecast', 'Scale up AI infra'),
(6,  '2026-04',   80.00,    0.00, 'forecast', 'More API volume'),
(7,  '2026-04',   25.00,    0.00, 'forecast', 'Media library growing'),
-- OpEx
(8,  '2026-04',   20.00,    0.00, 'forecast', 'Vercel Pro'),
(9,  '2026-04',   15.00,    0.00, 'forecast', 'Domain/DNS'),
(10, '2026-04',   25.00,    0.00, 'forecast', 'Supabase Pro');

-- -----------------------------------------------------------
-- KPI Metrics (12) - 4 groups
-- -----------------------------------------------------------
INSERT INTO kpi_metrics (name, group_name, unit, target_value, current_value, period, status, notes) VALUES
-- Finance group
('Burn Rate',          'finance',   'USD/thang',  300.00,  162.00, '2026-02', 'on_track',  'COGS + OpEx thuc te thang 2'),
('Runway',             'finance',   'thang',       12.00,    8.00, '2026-02', 'warning',   'Tinh tren so du hien tai ~$1,300'),
('MRR',                'finance',   'USD',        500.00,  137.00, '2026-02', 'off_track', 'Monthly Recurring Revenue con thap'),
('Net Profit Margin',  'finance',   '%',           20.00,  -15.00, '2026-02', 'off_track', 'Chua co loi - giai doan dau tu'),

-- Marketing group
('IG Followers - Mylara Vey', 'marketing', 'followers', 10000.00,  1250.00, '2026-02', 'warning',   'Tang 250/thang, can day manh'),
('IG Engagement Rate',        'marketing', '%',             5.00,     3.80, '2026-02', 'on_track',  'Engagement tot cho tai khoan nho'),
('Cost per Follower',         'marketing', 'USD',           0.10,     0.05, '2026-02', 'on_track',  'Chi phi thap nho organic content'),

-- Growth group
('CAC',                'growth',    'USD',          5.00,    8.50, '2026-02', 'off_track', 'Customer Acquisition Cost con cao'),
('LTV',                'growth',    'USD',         50.00,   15.00, '2026-02', 'warning',   'Lifetime Value dang tang dan'),
('Conversion Rate',    'growth',    '%',            3.00,    1.20, '2026-02', 'off_track', 'Visitor to paying user'),

-- Product group
('Uptime',             'product',   '%',           99.90,   99.95, '2026-02', 'on_track',  'Platform stability tot'),
('AI Generation Speed','product',   'giay',         5.00,    7.20, '2026-02', 'warning',   'Can toi uu toc do generate');

-- -----------------------------------------------------------
-- Data Sources (2)
-- -----------------------------------------------------------
INSERT INTO data_sources (name, type, endpoint, auth_config, sync_interval_minutes, last_sync_at, status, config) VALUES
(
    'Nhap lieu thu cong',
    'manual',
    NULL,
    NULL,
    0,
    '2026-02-20 08:00:00',
    'active',
    '{"description": "Du lieu nhap tay qua dashboard UI", "responsible": "CEO"}'
),
(
    'Supabase API',
    'api',
    'https://your-project.supabase.co/rest/v1/',
    '{"type": "bearer", "token_env": "SUPABASE_SERVICE_ROLE_KEY", "headers": {"apikey": "SUPABASE_ANON_KEY"}}',
    60,
    NULL,
    'active',
    '{"tables": ["bookings", "credits_transactions", "user_profiles"], "description": "Dong bo du lieu tu Supabase production"}'
);
