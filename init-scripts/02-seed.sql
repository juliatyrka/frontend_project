INSERT INTO users (username, email, password_hash, role, daily_calories_goal, protein_goal_g, carbs_goal_g, fat_goal_g)
VALUES 
('admin', 'admin@app.com', 'scrypt_hashed_password', 'ADMIN', 2500, 180, 250, 80),
('jan_kowalski', 'jan@gmail.com', 'scrypt_hashed_password', 'USER', 2200, 160, 220, 70);

INSERT INTO products (name, calories_100g, protein_100g, carbs_100g, fat_100g, is_approved)
VALUES 
('Pierś z kurczaka (surowa)', 120, 22.5, 0.0, 2.6, TRUE),
('Ryż basmati (surowy)', 350, 8.5, 78.0, 0.5, TRUE),
('Oliwa z oliwek', 884, 0.0, 0.0, 100.0, TRUE),
('Jajko kurze (M)', 143, 12.6, 0.7, 9.5, TRUE),
('Skyr naturalny', 66, 12.0, 4.1, 0.2, TRUE),
('Banan', 89, 1.1, 22.8, 0.3, TRUE);

INSERT INTO products (name, calories_100g, protein_100g, carbs_100g, fat_100g, is_approved, created_by_user_id)
VALUES 
('Energetyk Monster Zero', 3, 0.0, 1.1, 0.0, FALSE, 2);

INSERT INTO daily_logs (user_id, entry_date) VALUES (2, CURRENT_DATE);

INSERT INTO log_entries (daily_log_id, product_id, meal_type, weight_g)
VALUES 
(1, 1, 'LUNCH', 200),
(1, 2, 'LUNCH', 100),
(1, 5, 'BREAKFAST', 150);