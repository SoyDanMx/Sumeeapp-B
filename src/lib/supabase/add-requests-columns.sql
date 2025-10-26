-- Script para agregar columnas de requests a la tabla profiles
-- Ejecutar en Supabase SQL Editor

-- Agregar columna requests_used
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS requests_used INTEGER DEFAULT 0;

-- Agregar columna last_free_request_date
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_free_request_date TIMESTAMP WITH TIME ZONE;

-- Actualizar todos los perfiles existentes para establecer requests_used = 0
UPDATE public.profiles 
SET requests_used = 0 
WHERE requests_used IS NULL;

-- Crear índice para mejorar performance en consultas de requests
CREATE INDEX IF NOT EXISTS idx_profiles_requests_used ON public.profiles(requests_used);
CREATE INDEX IF NOT EXISTS idx_profiles_last_free_request ON public.profiles(last_free_request_date);

-- Comentarios para documentación
COMMENT ON COLUMN public.profiles.requests_used IS 'Número de solicitudes gratuitas usadas por el usuario';
COMMENT ON COLUMN public.profiles.last_free_request_date IS 'Fecha de la última solicitud gratuita realizada';
