-- Create search_history table
CREATE TABLE IF NOT EXISTS search_history (
    id SERIAL PRIMARY KEY,
    city VARCHAR(100) NOT NULL,
    searched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_city_searched_at ON search_history(city, searched_at);

-- Insert sample data (optional)
INSERT INTO search_history (city) VALUES 
    ('London'),
    ('Paris'),
    ('Tokyo')
ON CONFLICT DO NOTHING;
