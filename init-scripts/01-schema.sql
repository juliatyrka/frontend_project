CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    daily_calories_goal INT NOT NULL DEFAULT 2000,
    protein_goal_g INT DEFAULT 150,
    carbs_goal_g INT DEFAULT 200,
    fat_goal_g INT DEFAULT 70,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    calories_100g INT NOT NULL,
    protein_100g NUMERIC(5,1) NOT NULL,
    carbs_100g NUMERIC(5,1) NOT NULL,
    fat_100g NUMERIC(5,1) NOT NULL,
    is_approved BOOLEAN NOT NULL DEFAULT FALSE,
    created_by_user_id INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE daily_logs (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
    CONSTRAINT unique_user_per_day UNIQUE(user_id, entry_date)
);

CREATE TABLE log_entries (
    id SERIAL PRIMARY KEY,
    daily_log_id INT NOT NULL REFERENCES daily_logs(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    meal_type VARCHAR(20) NOT NULL CHECK (meal_type IN ('BREAKFAST', 'LUNCH', 'DINNER', 'SNACK')),
    weight_g INT NOT NULL CHECK (weight_g > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_daily_logs_user_date ON daily_logs(user_id, entry_date);