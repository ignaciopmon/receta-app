-- scripts/016_EMERGENCY_FIX.sql

-- 1. Asegurar columna y REPARAR datos nulos (Vital para evitar errores en el frontend)
ALTER TABLE public.recipes 
ADD COLUMN IF NOT EXISTS is_component BOOLEAN DEFAULT FALSE;

-- Poner a FALSE cualquier receta que tenga esto a NULL para que no falle el filtro
UPDATE public.recipes 
SET is_component = FALSE 
WHERE is_component IS NULL;

-- 2. BORRAR TODAS las políticas conflictivas de RECIPES para empezar limpio
DROP POLICY IF EXISTS "Users can view their own recipes" ON public.recipes;
DROP POLICY IF EXISTS "Owners can view their own non-deleted recipes" ON public.recipes;
DROP POLICY IF EXISTS "Anyone can view public, non-deleted recipes" ON public.recipes;
DROP POLICY IF EXISTS "View recipe if linked to public parent" ON public.recipes;
DROP POLICY IF EXISTS "Public recipes are viewable by everyone" ON public.recipes;
DROP POLICY IF EXISTS "Users can insert their own recipes" ON public.recipes;
DROP POLICY IF EXISTS "Users can update their own recipes" ON public.recipes;
DROP POLICY IF EXISTS "Users can soft delete their own recipes" ON public.recipes;
DROP POLICY IF EXISTS "Users can hard delete their own recipes" ON public.recipes;
DROP POLICY IF EXISTS "Users can delete their own recipes" ON public.recipes;
DROP POLICY IF EXISTS "Owners full access" ON public.recipes;

-- 3. CREAR POLÍTICAS SIMPLIFICADAS (Sin bucles)

-- A) El DUEÑO puede hacer TODO con sus recetas (Ver, Editar, Borrar)
-- Esta es la política más importante para que tu panel funcione.
CREATE POLICY "Owners full access"
  ON public.recipes
  FOR ALL
  USING (auth.uid() = user_id);

-- B) EL PÚBLICO puede ver recetas si son públicas y no están borradas
CREATE POLICY "Public view access"
  ON public.recipes
  FOR SELECT
  USING (is_public = TRUE AND deleted_at IS NULL);

-- C) EL PÚBLICO puede ver recetas PRIVADAS (sub-recetas) SOLO SI están enlazadas a una receta PÚBLICA
-- Usamos una subconsulta directa para validar el acceso
CREATE POLICY "Component view access"
  ON public.recipes
  FOR SELECT
  USING (
    is_component = TRUE 
    AND EXISTS (
      SELECT 1 
      FROM public.recipe_components rc
      JOIN public.recipes parent ON rc.parent_recipe_id = parent.id
      WHERE rc.component_recipe_id = public.recipes.id
      AND parent.is_public = TRUE
      AND parent.deleted_at IS NULL
    )
  );

-- 4. Asegurar permisos en la tabla de componentes
DROP POLICY IF EXISTS "Manage components if owner of parent" ON public.recipe_components;
DROP POLICY IF EXISTS "View components if parent is visible" ON public.recipe_components;

-- Dueños gestionan componentes
CREATE POLICY "Manage components"
  ON public.recipe_components
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.recipes AS parent
      WHERE parent.id = parent_recipe_id
      AND parent.user_id = auth.uid()
    )
  );

-- Cualquiera ve componentes si la receta padre es visible
CREATE POLICY "View components"
  ON public.recipe_components
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.recipes AS parent
      WHERE parent.id = parent_recipe_id
      AND (parent.is_public = TRUE OR parent.user_id = auth.uid())
    )
  );