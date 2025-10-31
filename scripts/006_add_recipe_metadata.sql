-- Add metadata fields to recipes table
ALTER TABLE recipes
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS prep_time INTEGER,
ADD COLUMN IF NOT EXISTS cook_time INTEGER,
ADD COLUMN IF NOT EXISTS servings INTEGER,
ADD COLUMN IF NOT EXISTS difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Add index for faster filtering
CREATE INDEX IF NOT EXISTS idx_recipes_category ON recipes(category);
CREATE INDEX IF NOT EXISTS idx_recipes_is_favorite ON recipes(is_favorite);
CREATE INDEX IF NOT EXISTS idx_recipes_tags ON recipes USING GIN(tags);
