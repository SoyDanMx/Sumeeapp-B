-- =========================================================================
-- TRIGGER ROBUSTO Y A PRUEBA DE FALLOS
-- =========================================================================
-- Este trigger es robusto y maneja metadatos faltantes para prevenir errores

-- Eliminar trigger y función existentes
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Crear función robusta
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id, 
    full_name, 
    email, 
    profession,
    role
  )
  VALUES (
    NEW.id,
    
    -- ROBUSTNESS FIX: Use COALESCE to provide a fallback value if full_name is missing.
    -- If full_name is not provided in metadata from the frontend,
    -- it will use the placeholder 'Nuevo Usuario' to satisfy the NOT NULL constraint.
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Nuevo Usuario'),
    
    NEW.email,
    
    NEW.raw_user_meta_data->>'profession', -- This can be null, which is fine for this column.

    -- CRITICAL LOGIC: Set the role based on the presence of a 'profession'.
    CASE
      WHEN NEW.raw_user_meta_data->>'profession' IS NOT NULL AND TRIM(NEW.raw_user_meta_data->>'profession') <> ''
      THEN 'profesional'
      ELSE 'client'
    END
  );
  RETURN NEW;
END;
$$;

-- Crear el trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================================================
-- VERIFICAR QUE EL TRIGGER ESTÉ ACTIVO
-- =========================================================================
-- Ejecutar esta consulta para verificar que el trigger existe:
-- SELECT trigger_name, event_manipulation, action_statement 
-- FROM information_schema.triggers 
-- WHERE trigger_name = 'on_auth_user_created';

-- =========================================================================
-- COMENTARIOS Y DOCUMENTACIÓN
-- =========================================================================
COMMENT ON FUNCTION public.handle_new_user() IS 
'Función robusta para manejar nuevos usuarios. Usa COALESCE para manejar metadatos faltantes y prevenir errores de NOT NULL.';
