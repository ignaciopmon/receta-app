-- scripts/011_update_cookbook_covers.sql

-- 1. Eliminar la columna 'cover_url' que ya no usaremos
ALTER TABLE public.cookbooks
DROP COLUMN IF EXISTS cover_url;

-- 2. Añadir las nuevas columnas para portadas de color/texto
ALTER TABLE public.cookbooks
ADD COLUMN IF NOT EXISTS cover_color TEXT DEFAULT '#444444',
ADD COLUMN IF NOT EXISTS cover_text TEXT;

-- 3. (Opcional) Poner un texto por defecto a los cookbooks existentes
UPDATE public.cookbooks
SET cover_text = name
WHERE cover_text IS NULL;