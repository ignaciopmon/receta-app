-- scripts/017_fix_and_simplify.sql

-- 1. Eliminar TODAS las políticas complejas que puedan causar bucles
DROP POLICY IF EXISTS "View recipe if linked to public parent" ON public.recipes;
DROP POLICY IF EXISTS "Component view access" ON public.recipes;
DROP POLICY IF EXISTS "View components if parent is visible" ON public.recipe_components;
DROP POLICY IF EXISTS "Manage components if owner of parent" ON public.recipe_components;
DROP POLICY IF EXISTS "Manage components" ON public.recipe_components;
DROP POLICY IF EXISTS "View components" ON public.recipe_components;

-- 2. Asegurar que la columna is_component existe (para que no falle el código si lo usas)
-- pero la pondremos por defecto a FALSE para todos si hay nulos.
ALTER TABLE public.recipes ADD COLUMN IF NOT EXISTS is_component BOOLEAN DEFAULT FALSE;
UPDATE public.recipes SET is_component = FALSE WHERE is_component IS NULL;

-- 3. REINICIAR POLÍTICAS DE RECETAS A LO BÁSICO Y SEGURO
DROP POLICY IF EXISTS "Owners full access" ON public.recipes;
DROP POLICY IF EXISTS "Public view access" ON public.recipes;

-- Política A: El dueño ve y edita TODO lo suyo
CREATE POLICY "Owners full access" ON public.recipes
USING (auth.uid() = user_id);

-- Política B: Todo el mundo ve lo que sea público
CREATE POLICY "Public view access" ON public.recipes FOR SELECT
USING (is_public = TRUE AND deleted_at IS NULL);

-- 4. POLÍTICAS SIMPLES PARA COMPONENTES (Sin bucles raros)
-- El dueño puede gestionar las relaciones
CREATE POLICY "Owner manage components" ON public.recipe_components
USING (
  EXISTS (SELECT 1 FROM public.recipes WHERE id = parent_recipe_id AND user_id = auth.uid())
);

-- Cualquiera puede ver las relaciones (esto es seguro y no causa bucles)
CREATE POLICY "Public view components" ON public.recipe_components FOR SELECT
USING (true);