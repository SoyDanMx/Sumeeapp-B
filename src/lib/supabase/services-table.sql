-- Script para crear y poblar la tabla public.services
-- Ejecutar en Supabase SQL Editor

-- Crear la tabla public.services
CREATE TABLE IF NOT EXISTS public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  icon_name text NOT NULL, -- Nombre del icono de Font Awesome, ej. 'faWrench'
  is_popular boolean DEFAULT FALSE,
  category text NOT NULL -- Ej. 'Urgencias', 'Mantenimiento', 'Tecnología', 'Especializado', 'Construcción'
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Crear política para que todos puedan leer los servicios
CREATE POLICY "Public services are viewable by everyone."
ON public.services FOR SELECT
USING (true);

-- Crear función para actualizar 'updated_at' automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear trigger para la función de 'updated_at'
CREATE TRIGGER update_services_updated_at
BEFORE UPDATE ON public.services
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Insertar datos iniciales basados en la estructura proporcionada
INSERT INTO public.services (name, slug, description, icon_name, is_popular, category) VALUES
-- Servicios Populares
('Aire Acondicionado', 'aire-acondicionado', 'Instalación, mantenimiento y reparación de equipos de aire acondicionado.', 'faFan', TRUE, 'Mantenimiento'),
('Electricidad', 'electricidad', 'Instalaciones eléctricas, reparaciones de cortos circuitos y mantenimiento.', 'faLightbulb', TRUE, 'Urgencias'),
('Plomería', 'plomeria', 'Reparaciones, instalaciones y mantenimiento de sistemas de agua y drenaje.', 'faWrench', TRUE, 'Urgencias'),

-- Servicios de Construcción
('Albañilería', 'albanileria', 'Construcción, reparación y remodelación de muros y estructuras.', 'faTools', FALSE, 'Construcción'),
('Arquitectos & Ingenieros', 'arquitectos-ingenieros', 'Diseño, planificación y supervisión de proyectos de construcción y remodelación.', 'faHardHat', FALSE, 'Construcción'),
('Azulejos y Pisos', 'azulejos-pisos', 'Instalación y reparación de azulejos, pisos y recubrimientos.', 'faSquare', FALSE, 'Construcción'),
('Tablaroca', 'tablaroca', 'Instalación y reparación de muros y techos de tablaroca.', 'faBuilding', FALSE, 'Construcción'),

-- Servicios de Mantenimiento
('Carpintería', 'carpinteria', 'Fabricación y reparación de muebles, puertas y estructuras de madera.', 'faHammer', FALSE, 'Mantenimiento'),
('Impermeabilización', 'impermeabilizacion', 'Aplicación de impermeabilizantes para techos y terrazas.', 'faShieldAlt', FALSE, 'Mantenimiento'),
('Jardinería', 'jardineria', 'Diseño, mantenimiento y cuidado de jardines y áreas verdes.', 'faLeaf', FALSE, 'Mantenimiento'),
('Limpieza', 'limpieza', 'Servicios de limpieza profunda para hogares, oficinas y locales comerciales.', 'faBroom', FALSE, 'Mantenimiento'),
('Pintura', 'pintura', 'Servicios de pintura interior y exterior para hogares y oficinas.', 'faPaintRoller', FALSE, 'Mantenimiento'),

-- Servicios de Tecnología
('CCTV y Seguridad', 'cctv-seguridad', 'Instalación y mantenimiento de sistemas de cámaras de seguridad y alarmas.', 'faVideo', FALSE, 'Tecnología'),
('Redes y WiFi', 'redes-wifi', 'Instalación y configuración de redes, routers y optimización de WiFi.', 'faWifi', FALSE, 'Tecnología'),
('Sistemas de Audio', 'sistemas-audio', 'Instalación de sistemas de sonido para hogares y oficinas.', 'faVolumeUp', FALSE, 'Tecnología'),

-- Servicios de Urgencias
('Cerrajería', 'cerrajeria', 'Apertura de puertas, cambio de cerraduras y duplicado de llaves.', 'faKey', FALSE, 'Urgencias'),
('Gas', 'gas', 'Instalación y reparación de sistemas de gas natural y LP.', 'faFire', FALSE, 'Urgencias'),

-- Servicios Especializados
('Fumigación', 'fumigacion', 'Control de plagas para hogares y negocios.', 'faBug', FALSE, 'Especializado'),
('Lavado de Cisternas', 'lavado-cisternas', 'Limpieza y desinfección de cisternas y tinacos.', 'faTint', FALSE, 'Especializado'),
('Limpieza de Alfombras', 'limpieza-alfombras', 'Limpieza profunda y mantenimiento de alfombras y tapetes.', 'faCouch', FALSE, 'Especializado');

-- Verificar que los datos se insertaron correctamente
SELECT COUNT(*) as total_services FROM public.services;
SELECT name, category, is_popular FROM public.services ORDER BY is_popular DESC, name;
