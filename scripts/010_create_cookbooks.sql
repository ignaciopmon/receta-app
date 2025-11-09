-- scripts/010_create_cookbooks.sql

-- 1. Crear la tabla de Cookbooks
CREATE TABLE IF NOT EXISTS public.cookbooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  is_public BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Crear la tabla pivote (unión) entre Cookbooks y Recipes
CREATE TABLE IF NOT EXISTS public.cookbook_recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cookbook_id uuid NOT NULL REFERENCES public.cookbooks(id) ON DELETE CASCADE,
  recipe_id uuid NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Asegurar que una receta solo pueda estar una vez en cada cookbook
  UNIQUE(cookbook_id, recipe_id)
);

-- 3. Crear índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_cookbooks_user_id ON public.cookbooks(user_id);
CREATE INDEX IF NOT EXISTS idx_cookbooks_is_public ON public.cookbooks(is_public);
CREATE INDEX IF NOT EXISTS idx_cookbook_recipes_cookbook_id ON public.cookbook_recipes(cookbook_id);
CREATE INDEX IF NOT EXISTS idx_cookbook_recipes_recipe_id ON public.cookbook_recipes(recipe_id);

-- 4. Habilitar RLS (Row Level Security)
ALTER TABLE public.cookbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cookbook_recipes ENABLE ROW LEVEL SECURITY;

-- 5. Políticas de RLS para 'cookbooks'
DROP POLICY IF EXISTS "Owners can manage their own cookbooks" ON public.cookbooks;
DROP POLICY IF EXISTS "Anyone can view public cookbooks" ON public.cookbooks;
DROP POLICY IF EXISTS "Owners can view their own private cookbooks" ON public.cookbooks;

CREATE POLICY "Owners can manage their own cookbooks"
  ON public.cookbooks FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view public cookbooks"
  ON public.cookbooks FOR SELECT
  USING (is_public = TRUE);

-- 6. Políticas de RLS para 'cookbook_recipes'
DROP POLICY IF EXISTS "Owners can manage recipes in their cookbooks" ON public.cookbook_recipes;
DROP POLICY IF EXISTS "Anyone can view recipes in public cookbooks" ON public.cookbook_recipes;

-- (Esta política usa un sub-SELECT para verificar que el usuario es dueño del cookbook)
CREATE POLICY "Owners can manage recipes in their cookbooks"
  ON public.cookbook_recipes FOR ALL
  USING (auth.uid() = (SELECT user_id FROM public.cookbooks WHERE id = cookbook_recipes.cookbook_id))
  WITH CHECK (auth.uid() = (SELECT user_id FROM public.cookbooks WHERE id = cookbook_recipes.cookbook_id));

-- (Esta política usa un sub-SELECT para verificar que el cookbook es público)
CREATE POLICY "Anyone can view recipes in public cookbooks"
  ON public.cookbook_recipes FOR SELECT
  USING ((SELECT is_public FROM public.cookbooks WHERE id = cookbook_recipes.cookbook_id) = TRUE);