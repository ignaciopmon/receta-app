-- scripts/008_public_profiles_rls.sql

-- 1. Añadir la columna 'is_public' a la tabla de recetas si no existe
ALTER TABLE public.recipes
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE;

-- 2. (Opcional) Crear un índice para búsquedas públicas rápidas
CREATE INDEX IF NOT EXISTS idx_recipes_public_user ON recipes (user_id, is_public, deleted_at);

--------------------------------------------------------------------------------
-- 3. ELIMINAR POLÍTICAS ANTIGUAS para rehacerlas (¡Importante!)
--------------------------------------------------------------------------------

-- --- Políticas de RECIPES ---
DROP POLICY IF EXISTS "Users can view their own recipes" ON public.recipes;
DROP POLICY IF EXISTS "Owners can view their own non-deleted recipes" ON public.recipes;
DROP POLICY IF EXISTS "Anyone can view public, non-deleted recipes" ON public.recipes;
DROP POLICY IF EXISTS "Users can insert their own recipes" ON public.recipes;
DROP POLICY IF EXISTS "Users can update their own recipes" ON public.recipes;
DROP POLICY IF EXISTS "Users can hard delete their own recipes" ON public.recipes;

-- --- Políticas de PROFILES ---
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;


--------------------------------------------------------------------------------
-- 4. CREAR NUEVAS POLÍTICAS PÚBLICAS
--------------------------------------------------------------------------------

-- --- Políticas de PROFILES (PERFILES) ---

-- 4.1. CUALQUIERA puede LEER (SELECT) todos los perfiles.
-- Esto es necesario para que la gente pueda buscar y ver perfiles públicos.
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

-- 4.2. Los usuarios solo pueden INSERTAR su propio perfil (esto ya lo hace el trigger)
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 4.3. Los usuarios solo pueden ACTUALIZAR su propio perfil (ej. cambiar username)
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 4.4. Los usuarios solo pueden BORRAR su propio perfil
CREATE POLICY "Users can delete their own profile"
  ON public.profiles FOR DELETE
  USING (auth.uid() = id);


-- --- Políticas de RECIPES (RECETAS) ---

-- 4.5. POLÍTICA DE LECTURA (SELECT) - COMBINADA
-- RLS usa 'OR' para políticas de SELECT. Si CUALQUIERA se cumple, la fila es visible.

-- (A) El DUEÑO puede ver sus propias recetas (públicas O privadas), siempre que no estén borradas.
CREATE POLICY "Owners can view their own non-deleted recipes"
  ON public.recipes FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

-- (B) CUALQUIERA puede ver recetas que estén marcadas como públicas Y no estén borradas.
CREATE POLICY "Anyone can view public, non-deleted recipes"
  ON public.recipes FOR SELECT
  USING (is_public = TRUE AND deleted_at IS NULL);


-- 4.6. Políticas de ESCRITURA (INSERT, UPDATE, DELETE) - Siguen siendo privadas

-- (C) Los usuarios logueados pueden crear recetas para sí mismos.
CREATE POLICY "Users can insert their own recipes"
  ON public.recipes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- (D) El dueño puede actualizar (editar, borrar suavemente, etc.) su propia receta.
CREATE POLICY "Users can update their own recipes"
  ON public.recipes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- (E) El dueño puede borrar PERMANENTEMENTE su propia receta (desde la papelera).
CREATE POLICY "Users can hard delete their own recipes"
  ON public.recipes FOR DELETE
  USING (auth.uid() = user_id);