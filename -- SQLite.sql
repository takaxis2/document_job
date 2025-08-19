-- SQLite//

-- 프리셋 생성
INSERT INTO presets (name, description, created_at, updated_at) VALUES ("test", "test입니다", datetime('now'), datetime('now'))

-- 프리셋 아이템 추가
INSERT INTO preset_items (preset_id, key, description) VALUES (1, "billing_year", "청구 년");
INSERT INTO preset_items (preset_id, key, description) VALUES (1, "billing_month", "청구 달");
INSERT INTO preset_items (preset_id, key, description) VALUES (1, "billing_date", "청구 일");