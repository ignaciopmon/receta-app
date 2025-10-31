-- Check if the soft delete column exists
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS deleted_at timestamp with time zone;

-- Drop existing policies to recreate them correctly
DROP POLICY IF EXISTS "Users can view their own recipes" ON public.recipes;
DROP POLICY IF EXISTS "Users can insert their own recipes" ON public.recipes;
DROP POLICY IF EXISTS "Users can update their own recipes" ON public.recipes;
DROP POLICY IF EXISTS "Users can delete their own recipes" ON public.recipes;

-- Recreate RLS Policies for recipes with explicit checking
CREATE POLICY "Users can view their own recipes"
  ON public.recipes FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can insert their own recipes"
  ON public.recipes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recipes"
  ON public.recipes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can soft delete their own recipes"
  ON public.recipes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can hard delete their own recipes"
  ON public.recipes FOR DELETE
  USING (auth.uid() = user_id);

-- Add indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_recipes_user_deleted ON recipes(user_id, deleted_at);
