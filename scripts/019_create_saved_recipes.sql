-- scripts/019_create_saved_recipes.sql

CREATE TABLE IF NOT EXISTS public.saved_recipes (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id uuid NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, recipe_id)
);

-- Habilitar seguridad (RLS)
ALTER TABLE public.saved_recipes ENABLE ROW LEVEL SECURITY;

-- Los usuarios solo pueden ver y gestionar sus propios "guardados"
CREATE POLICY "Users can manage their own saved recipes"
  ON public.saved_recipes
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);