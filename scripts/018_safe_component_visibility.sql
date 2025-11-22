-- scripts/018_safe_component_visibility.sql

-- 1. Hacer públicas TODAS las recetas que son componentes (sub-recetas)
-- Esto las hace visibles por RLS ("Public view access"), pero el frontend las ocultará de la lista principal.
UPDATE public.recipes
SET is_public = TRUE
WHERE is_component = TRUE;

-- 2. Crear un Trigger para mantener esto automáticamente en el futuro
-- Cada vez que alguien cree o actualice una receta como 'is_component = TRUE', se forzará 'is_public = TRUE'.

CREATE OR REPLACE FUNCTION public.force_component_public()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_component = TRUE THEN
    NEW.is_public := TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ensure_component_public ON public.recipes;

CREATE TRIGGER ensure_component_public
  BEFORE INSERT OR UPDATE ON public.recipes
  FOR EACH ROW
  EXECUTE FUNCTION public.force_component_public();