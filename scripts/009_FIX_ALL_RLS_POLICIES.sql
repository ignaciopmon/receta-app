-- scripts/009_FIX_ALL_RLS_POLICIES.sql

-- 1. ASEGURARSE QUE LAS COLUMNAS EXISTEN (no falla si ya existen)
ALTER TABLE public.recipes ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE;
ALTER TABLE public.recipes ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

--------------------------------------------------------------------------------
-- 2. BORRAR TODAS LAS POLÍTICAS ANTIGUAS (Para empezar de cero)
--------------------------------------------------------------------------------

-- --- Políticas de PROFILES (PERFILES) ---
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;

-- --- Políticas de RECIPES (RECETAS) ---
DROP POLICY IF EXISTS "Users can view their own recipes" ON public.recipes;
DROP POLICY IF EXISTS "Owners can view their own non-deleted recipes" ON public.recipes;
DROP POLICY IF EXISTS "Anyone can view public, non-deleted recipes" ON public.recipes;
DROP POLICY IF EXISTS "Public recipes are viewable by everyone" ON public.recipes;
DROP POLICY IF EXISTS "Users can insert their own recipes" ON public.recipes;
DROP POLICY IF EXISTS "Users can update their own recipes" ON public.recipes;
DROP POLICY IF EXISTS "Users can soft delete their own recipes" ON public.recipes;
DROP POLICY IF EXISTS "Users can hard delete their own recipes" ON public.recipes;
DROP POLICY IF EXISTS "Users can delete their own recipes" ON public.recipes;


--------------------------------------------------------------------------------
-- 3. CREAR TODAS LAS POLÍTICAS CORRECTAS
--------------------------------------------------------------------------------

-- --- POLÍTICAS DE PROFILES (PERFILES) ---

-- 3.1. (LECTURA) CUALQUIERA puede LEER (SELECT) todos los perfiles.
-- ¡ESTA ES LA CORRECCIÓN CLAVE!
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

-- 3.2. (ESCRITURA) Los usuarios solo pueden GESTIONAR (insertar, actualizar, borrar) su propio perfil.
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
  
CREATE POLICY "Users can delete their own profile"
  ON public.profiles FOR DELETE
  USING (auth.uid() = id);


-- --- POLÍTICAS DE RECIPES (RECETAS) ---

-- 3.3. (LECTURA) Dos casos en los que alguien puede VER una receta:
-- (A) Eres el dueño Y la receta no está en la papelera.
CREATE POLICY "Owners can view their own non-deleted recipes"
  ON public.recipes FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

-- (B) La receta es pública Y no está en la papelera (no importa quién seas).
CREATE POLICY "Anyone can view public, non-deleted recipes"
  ON public.recipes FOR SELECT
  USING (is_public = TRUE AND deleted_at IS NULL);

-- 3.4. (ESCRITURA) Los usuarios solo pueden GESTIONAR sus propias recetas.
CREATE POLICY "Users can insert their own recipes"
  ON public.recipes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update (edit/soft-delete) their own recipes"
  ON public.recipes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can hard-delete their own recipes"
  ON public.recipes FOR DELETE
  USING (auth.uid() = user_id);