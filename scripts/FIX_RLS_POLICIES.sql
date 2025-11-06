-- 1. Asegurarse de que las columnas 'deleted_at' y 'is_public' existen
ALTER TABLE public.recipes ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.recipes ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE;

-- 2. ELIMINAR TODAS las políticas existentes en la tabla 'recipes' para empezar de cero.
-- Esto limpia cualquier conflicto anterior de los otros scripts.
DROP POLICY IF EXISTS "Users can view their own recipes" ON public.recipes;
DROP POLICY IF EXISTS "Public recipes are viewable by everyone" ON public.recipes;
DROP POLICY IF EXISTS "Users can insert their own recipes" ON public.recipes;
DROP POLICY IF EXISTS "Users can update their own recipes" ON public.recipes;
DROP POLICY IF EXISTS "Users can delete their own recipes" ON public.recipes;
DROP POLICY IF EXISTS "Users can soft delete their own recipes" ON public.recipes;
DROP POLICY IF EXISTS "Users can hard delete their own recipes" ON public.recipes;
DROP POLICY IF EXISTS "Owners can view their own non-deleted recipes" ON public.recipes;
DROP POLICY IF EXISTS "Anyone can view public, non-deleted recipes" ON public.recipes;

--------------------------------------------------------------------------------
-- 3. CREAR LAS POLÍTICAS CORRECTAS (ELIMINANDO CUALQUIER OTRA)
--------------------------------------------------------------------------------

-- POLÍTICA DE INSERT:
-- Los usuarios logueados pueden crear recetas para sí mismos.
CREATE POLICY "Users can insert their own recipes"
  ON public.recipes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- POLÍTICA DE UPDATE:
-- El dueño puede actualizar (editar, marcar como favorito, o "borrar suavemente") su propia receta.
CREATE POLICY "Users can update their own recipes"
  ON public.recipes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- POLÍTICA DE DELETE:
-- El dueño puede borrar PERMANENTEMENTE su propia receta (desde la papelera).
CREATE POLICY "Users can hard delete their own recipes"
  ON public.recipes FOR DELETE
  USING (auth.uid() = user_id);

-- POLÍTICAS DE SELECT (LAS MÁS IMPORTANTES):
-- RLS usa 'OR' para las políticas de SELECT. Si CUALQUIERA de las dos se cumple,
-- la fila será visible.

-- POLÍTICA A: El dueño puede ver sus propias recetas (que no estén en la papelera).
CREATE POLICY "Owners can view their own non-deleted recipes"
  ON public.recipes FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);