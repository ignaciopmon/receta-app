-- 1. Añadir la columna 'is_public' a la tabla de recetas
ALTER TABLE public.recipes
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE;

-- 2. Crear un índice para búsquedas rápidas de recetas públicas
CREATE INDEX IF NOT EXISTS idx_recipes_public ON public.recipes(id, is_public);

-- 3. Añadir una NUEVA política de RLS.
-- Esto permite a CUALQUIERA (incluso sin iniciar sesión)
-- LEER una receta, SÓLO SI 'is_public' es TRUE.
CREATE POLICY "Public recipes are viewable by everyone"
  ON public.recipes FOR SELECT
  USING (is_public = TRUE);
  
-- Nota: Tu política existente "Users can view their own recipes"
-- sigue funcionando, por lo que los usuarios pueden ver sus recetas
-- privadas Y también las públicas.