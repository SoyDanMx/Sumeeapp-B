-- =========================================================================
-- REDISEÑO DE ESQUEMA DE BASE DE DATOS - SUMEE APP
-- =========================================================================
-- Este archivo contiene el rediseño completo del esquema para corregir
-- los problemas de registro de profesionales y estructura de tablas.
-- =========================================================================

-- 1. TABLA PROFILES (Usuarios base - tanto clientes como profesionales)
-- =========================================================================
-- Esta tabla almacena información básica de TODOS los usuarios
-- El campo 'role' determina si es 'client' o 'profesional'

-- Eliminar tabla profiles existente si existe
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Crear tabla profiles con estructura correcta
CREATE TABLE public.profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('client', 'profesional')),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABLA PROFESIONALES (Datos específicos de profesionales)
-- =========================================================================
-- Esta tabla almacena información específica SOLO de profesionales
-- Se relaciona con profiles a través de user_id

-- Eliminar tabla profesionales existente si existe
DROP TABLE IF EXISTS public.profesionales CASCADE;

-- Crear tabla profesionales con estructura completa
CREATE TABLE public.profesionales (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    profession TEXT NOT NULL,
    specialties TEXT[] DEFAULT '{}',
    experience_years INTEGER DEFAULT 0,
    calificacion_promedio DECIMAL(3,2) DEFAULT 0.00,
    ubicacion_lat DECIMAL(10, 8),
    ubicacion_lng DECIMAL(11, 8),
    ubicacion_direccion TEXT,
    whatsapp TEXT,
    descripcion_perfil TEXT,
    certificaciones TEXT[] DEFAULT '{}',
    disponibilidad TEXT DEFAULT 'disponible',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABLA LEADS (Solicitudes de clientes)
-- =========================================================================
-- Esta tabla almacena las solicitudes de servicios de clientes

-- Eliminar tabla leads existente si existe
DROP TABLE IF EXISTS public.leads CASCADE;

-- Crear tabla leads con estructura mejorada
CREATE TABLE public.leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cliente_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    profesional_asignado_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    servicio TEXT NOT NULL,
    descripcion_proyecto TEXT,
    ubicacion_lat DECIMAL(10, 8),
    ubicacion_lng DECIMAL(11, 8),
    ubicacion_direccion TEXT,
    whatsapp TEXT,
    nombre_cliente TEXT,
    estado TEXT DEFAULT 'nuevo' CHECK (estado IN ('nuevo', 'contactado', 'en_progreso', 'completado', 'cancelado')),
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_asignacion TIMESTAMP WITH TIME ZONE,
    fecha_completado TIMESTAMP WITH TIME ZONE
);

-- 4. ÍNDICES PARA OPTIMIZACIÓN
-- =========================================================================

-- Índices para profiles
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_email ON public.profiles(email);

-- Índices para profesionales
CREATE INDEX idx_profesionales_user_id ON public.profesionales(user_id);
CREATE INDEX idx_profesionales_profession ON public.profesionales(profession);
CREATE INDEX idx_profesionales_ubicacion ON public.profesionales(ubicacion_lat, ubicacion_lng);
CREATE INDEX idx_profesionales_disponibilidad ON public.profesionales(disponibilidad);

-- Índices para leads
CREATE INDEX idx_leads_cliente_id ON public.leads(cliente_id);
CREATE INDEX idx_leads_profesional_id ON public.leads(profesional_asignado_id);
CREATE INDEX idx_leads_estado ON public.leads(estado);
CREATE INDEX idx_leads_fecha_creacion ON public.leads(fecha_creacion);

-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profesionales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para profesionales
CREATE POLICY "Professionals can view their own data" ON public.profesionales
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Professionals can update their own data" ON public.profesionales
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Professionals can insert their own data" ON public.profesionales
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para leads
CREATE POLICY "Users can view their own leads" ON public.leads
    FOR SELECT USING (auth.uid() = cliente_id OR auth.uid() = profesional_asignado_id);

CREATE POLICY "Users can create leads" ON public.leads
    FOR INSERT WITH CHECK (auth.uid() = cliente_id);

CREATE POLICY "Professionals can update assigned leads" ON public.leads
    FOR UPDATE USING (auth.uid() = profesional_asignado_id);

-- 6. FUNCIONES DE UTILIDAD
-- =========================================================================

-- Función para crear perfil de usuario automáticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, role, full_name, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'role', 'client'),
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.email
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear perfil automáticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Función para crear datos de profesional automáticamente
CREATE OR REPLACE FUNCTION public.handle_professional_registration()
RETURNS TRIGGER AS $$
BEGIN
    -- Solo crear datos de profesional si el rol es 'profesional'
    IF NEW.role = 'profesional' THEN
        INSERT INTO public.profesionales (
            user_id,
            profession,
            whatsapp,
            descripcion_perfil
        )
        VALUES (
            NEW.user_id,
            COALESCE(NEW.raw_user_meta_data->>'profession', 'General'),
            COALESCE(NEW.raw_user_meta_data->>'whatsapp', ''),
            COALESCE(NEW.raw_user_meta_data->>'descripcion_perfil', '')
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. VISTAS PARA CONSULTAS COMUNES
-- =========================================================================

-- Vista para profesionales completos
CREATE VIEW public.profesionales_completos AS
SELECT 
    p.id as profile_id,
    p.user_id,
    p.full_name,
    p.email,
    p.avatar_url,
    p.created_at as profile_created_at,
    prof.id as profesional_id,
    prof.profession,
    prof.specialties,
    prof.experience_years,
    prof.calificacion_promedio,
    prof.ubicacion_lat,
    prof.ubicacion_lng,
    prof.ubicacion_direccion,
    prof.whatsapp,
    prof.descripcion_perfil,
    prof.certificaciones,
    prof.disponibilidad
FROM public.profiles p
LEFT JOIN public.profesionales prof ON p.user_id = prof.user_id
WHERE p.role = 'profesional';

-- Vista para leads con información de cliente y profesional
CREATE VIEW public.leads_completos AS
SELECT 
    l.*,
    c.full_name as cliente_nombre,
    c.email as cliente_email,
    p.full_name as profesional_nombre,
    p.email as profesional_email,
    prof.profession as profesional_profesion,
    prof.whatsapp as profesional_whatsapp
FROM public.leads l
LEFT JOIN public.profiles c ON l.cliente_id = c.user_id
LEFT JOIN public.profiles p ON l.profesional_asignado_id = p.user_id
LEFT JOIN public.profesionales prof ON l.profesional_asignado_id = prof.user_id;

-- 8. COMENTARIOS Y DOCUMENTACIÓN
-- =========================================================================

COMMENT ON TABLE public.profiles IS 'Tabla base para todos los usuarios (clientes y profesionales)';
COMMENT ON TABLE public.profesionales IS 'Datos específicos de profesionales';
COMMENT ON TABLE public.leads IS 'Solicitudes de servicios de clientes';

COMMENT ON COLUMN public.profiles.role IS 'Rol del usuario: client o profesional';
COMMENT ON COLUMN public.profesionales.profession IS 'Profesión principal del profesional';
COMMENT ON COLUMN public.profesionales.specialties IS 'Array de especialidades del profesional';
COMMENT ON COLUMN public.leads.estado IS 'Estado del lead: nuevo, contactado, en_progreso, completado, cancelado';
