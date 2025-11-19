-- scripts/013_add_subrecipes_support.sql

-- 1. Añadir flag para identificar sub-recetas (componentes)
-- Si es TRUE, no saldrá en el listado principal, solo dentro de otras recetas.
ALTER TABLE public.recipes
ADD COLUMN IF NOT EXISTS is_component BOOLEAN DEFAULT FALSE;

-- 2. Crear tabla de relación (Padre -> Hijo)
CREATE TABLE IF NOT EXISTS public.recipe_components (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_recipe_id uuid NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  component_recipe_id uuid NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  quantity_text TEXT, -- Ej: "200g" o "1 ración" (Opcional para el futuro)
  notes TEXT, -- Notas específicas de uso
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Evitar duplicados: un componente solo puede estar una vez en una receta padre
  UNIQUE(parent_recipe_id, component_recipe_id),
  -- Evitar que una receta se contenga a sí misma
  CHECK (parent_recipe_id <> component_recipe_id)
);

-- 3. Habilitar RLS
ALTER TABLE public.recipe_components ENABLE ROW LEVEL SECURITY;

-- 4. Políticas RLS
-- Permitir ver componentes si puedes ver la receta padre O si el componente es público
CREATE POLICY "View components if parent is visible"
  ON public.recipe_components FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.recipes AS parent
      WHERE parent.id = recipe_components.parent_recipe_id
      AND (parent.user_id = auth.uid() OR parent.is_public = TRUE)
    )
  );

-- Permitir gestionar componentes si eres el dueño de la receta padre
CREATE POLICY "Manage components if owner of parent"
  ON public.recipe_components FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.recipes AS parent
      WHERE parent.id = recipe_components.parent_recipe_id
      AND parent.user_id = auth.uid()
    )
  );

-- 5. Índices
CREATE INDEX IF NOT EXISTS idx_recipe_components_parent ON public.recipe_components(parent_recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipes_is_component ON public.recipes(is_component);