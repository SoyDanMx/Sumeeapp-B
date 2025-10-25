CREATE TABLE IF NOT EXISTS public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  icon_name text NOT NULL,
  is_popular boolean DEFAULT FALSE,
  category text NOT NULL
);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public services are viewable by everyone."
ON public.services FOR SELECT
USING (true);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_services_updated_at
BEFORE UPDATE ON public.services
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

INSERT INTO public.services (name, slug, description, icon_name, is_popular, category) VALUES
('Aire Acondicionado', 'aire-acondicionado', 'Instalación, mantenimiento y reparación de equipos de aire acondicionado.', 'faFan', TRUE, 'Mantenimiento'),
('Electricidad', 'electricidad', 'Instalaciones eléctricas, reparaciones de cortos circuitos y mantenimiento.', 'faLightbulb', TRUE, 'Urgencias'),
('Plomería', 'plomeria', 'Reparaciones, instalaciones y mantenimiento de sistemas de agua y drenaje.', 'faWrench', TRUE, 'Urgencias'),
('Albañilería', 'albanileria', 'Construcción, reparación y remodelación de muros y estructuras.', 'faTools', FALSE, 'Construcción'),
('Arquitectos & Ingenieros', 'arquitectos-ingenieros', 'Diseño, planificación y supervisión de proyectos de construcción y remodelación.', 'faHardHat', FALSE, 'Construcción'),
('Azulejos y Pisos', 'azulejos-pisos', 'Instalación y reparación de azulejos, pisos y recubrimientos.', 'faSquare', FALSE, 'Construcción'),
('Tablaroca', 'tablaroca', 'Instalación y reparación de muros y techos de tablaroca.', 'faBuilding', FALSE, 'Construcción'),
('Carpintería', 'carpinteria', 'Fabricación y reparación de muebles, puertas y estructuras de madera.', 'faHammer', FALSE, 'Mantenimiento'),
('Impermeabilización', 'impermeabilizacion', 'Aplicación de impermeabilizantes para techos y terrazas.', 'faShieldAlt', FALSE, 'Mantenimiento'),
('Jardinería', 'jardineria', 'Diseño, mantenimiento y cuidado de jardines y áreas verdes.', 'faLeaf', FALSE, 'Mantenimiento'),
('Limpieza', 'limpieza', 'Servicios de limpieza profunda para hogares, oficinas y locales comerciales.', 'faBroom', FALSE, 'Mantenimiento'),
('Pintura', 'pintura', 'Servicios de pintura interior y exterior para hogares y oficinas.', 'faPaintRoller', FALSE, 'Mantenimiento'),
('CCTV y Seguridad', 'cctv-seguridad', 'Instalación y mantenimiento de sistemas de cámaras de seguridad y alarmas.', 'faVideo', FALSE, 'Tecnología'),
('Redes y WiFi', 'redes-wifi', 'Instalación y configuración de redes, routers y optimización de WiFi.', 'faWifi', FALSE, 'Tecnología'),
('Sistemas de Audio', 'sistemas-audio', 'Instalación de sistemas de sonido para hogares y oficinas.', 'faVolumeUp', FALSE, 'Tecnología'),
('Cerrajería', 'cerrajeria', 'Apertura de puertas, cambio de cerraduras y duplicado de llaves.', 'faKey', FALSE, 'Urgencias'),
('Gas', 'gas', 'Instalación y reparación de sistemas de gas natural y LP.', 'faFire', FALSE, 'Urgencias'),
('Fumigación', 'fumigacion', 'Control de plagas para hogares y negocios.', 'faBug', FALSE, 'Especializado'),
('Lavado de Cisternas', 'lavado-cisternas', 'Limpieza y desinfección de cisternas y tinacos.', 'faTint', FALSE, 'Especializado'),
('Limpieza de Alfombras', 'limpieza-alfombras', 'Limpieza profunda y mantenimiento de alfombras y tapetes.', 'faCouch', FALSE, 'Especializado');

SELECT COUNT(*) as total_services FROM public.services;
SELECT name, category, is_popular FROM public.services ORDER BY is_popular DESC, name;
