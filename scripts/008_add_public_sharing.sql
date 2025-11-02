-- 1. Añadir la columna 'is_public' a la tabla de recetas (si no existe)
ALTER TABLE public.recipes
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE;

-- 2. Crear un índice para búsquedas rápidas de recetas públicas (si no existe)
CREATE INDEX IF NOT EXISTS idx_recipes_public ON public.recipes(id, is_public);

-- 3. ELIMINAR políticas de 'SELECT' (ver) en conflicto para empezar de cero
DROP POLICY IF EXISTS "Users can view their own recipes" ON public.recipes;
DROP POLICY IF EXISTS "Public recipes are viewable by everyone" ON public.recipes;

-- 4. CREAR la política para dueños:
-- Los usuarios pueden ver SUS PROPIAS recetas que NO estén borradas.
CREATE POLICY "Users can view their own recipes"
  ON public.recipes FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);
  
-- 5. CREAR la política pública:
-- CUALQUIERA puede ver recetas que sean públicas Y que NO estén borradas.
CREATE POLICY "Public recipes are viewable by everyone"
  ON public.recipes FOR SELECT
  USING (is_public = TRUE AND deleted_at IS NULL);