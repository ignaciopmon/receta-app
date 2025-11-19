-- scripts/012_restore_cover_url.sql

-- Restaurar la columna cover_url para permitir imágenes personalizadas
ALTER TABLE public.cookbooks
ADD COLUMN IF NOT EXISTS cover_url TEXT;