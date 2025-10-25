-- Script de migración para tabla services
-- Ejecutar en Supabase SQL Editor

-- Crear tabla services
CREATE TABLE IF NOT EXISTS public.services (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  icon_name text NOT NULL,
  is_popular boolean DEFAULT false,
  category text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_services_category ON public.services(category);
CREATE INDEX IF NOT EXISTS idx_services_popular ON public.services(is_popular);
CREATE INDEX IF NOT EXISTS idx_services_slug ON public.services(slug);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Política RLS: Permitir lectura pública
CREATE POLICY "Services are viewable by everyone" ON public.services
  FOR SELECT USING (true);

-- Insertar servicios populares
INSERT INTO public.services (name, slug, description, icon_name, is_popular, category) VALUES
('Plomería', 'plomeria', 'Reparaciones, instalaciones y mantenimiento de sistemas de agua', 'faWrench', true, 'Urgencias'),
('Electricidad', 'electricidad', 'Instalaciones eléctricas, reparaciones y mantenimiento', 'faBolt', true, 'Urgencias'),
('Aire Acondicionado', 'aire-acondicionado', 'Instalación, reparación y mantenimiento de sistemas de climatización', 'faSnowflake', true, 'Mantenimiento'),
('Cerrajería', 'cerrajeria', 'Apertura de cerraduras, duplicado de llaves y sistemas de seguridad', 'faKey', true, 'Urgencias');

-- Insertar servicios de urgencias
INSERT INTO public.services (name, slug, description, icon_name, is_popular, category) VALUES
('Fugas de Agua', 'fugas-agua', 'Reparación urgente de fugas y goteras', 'faTint', false, 'Urgencias'),
('Cortos Circuitos', 'cortos-circuitos', 'Reparación de problemas eléctricos urgentes', 'faExclamationTriangle', false, 'Urgencias'),
('Cerrajería de Emergencia', 'cerrajeria-emergencia', 'Apertura de puertas 24/7', 'faClock', false, 'Urgencias'),
('Desagües', 'desagues', 'Desazolve y limpieza de drenajes', 'faWater', false, 'Urgencias');

-- Insertar servicios de mantenimiento
INSERT INTO public.services (name, slug, description, icon_name, is_popular, category) VALUES
('Pintura', 'pintura', 'Pintura interior y exterior, acabados especiales', 'faPaintBrush', false, 'Mantenimiento'),
('Impermeabilización', 'impermeabilizacion', 'Protección contra humedad y filtraciones', 'faUmbrella', false, 'Mantenimiento'),
('Jardinería', 'jardineria', 'Diseño, mantenimiento y cuidado de jardines', 'faSeedling', false, 'Mantenimiento'),
('Limpieza', 'limpieza', 'Servicios de limpieza residencial y comercial', 'faSprayCan', false, 'Mantenimiento'),
('Carpintería', 'carpinteria', 'Muebles, reparaciones y trabajos en madera', 'faHammer', false, 'Mantenimiento');

-- Insertar servicios tecnológicos
INSERT INTO public.services (name, slug, description, icon_name, is_popular, category) VALUES
('CCTV', 'cctv', 'Instalación y mantenimiento de sistemas de videovigilancia', 'faVideo', false, 'Tecnología'),
('WiFi', 'wifi', 'Instalación y configuración de redes inalámbricas', 'faWifi', false, 'Tecnología'),
('Fumigación', 'fumigacion', 'Control de plagas y fumigación profesional', 'faBug', false, 'Mantenimiento');

-- Insertar servicios especializados
INSERT INTO public.services (name, slug, description, icon_name, is_popular, category) VALUES
('Arquitectos & Ingenieros', 'arquitectos-ingenieros', 'Proyectos de construcción y remodelación', 'faBuilding', false, 'Especializado'),
('Tablaroca', 'tablaroca', 'Instalación y reparación de sistemas de tablaroca', 'faSquare', false, 'Construcción');

-- Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para updated_at
CREATE TRIGGER handle_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Verificar datos insertados
SELECT 
  name, 
  slug, 
  category, 
  is_popular,
  description
FROM public.services 
ORDER BY is_popular DESC, category, name;
