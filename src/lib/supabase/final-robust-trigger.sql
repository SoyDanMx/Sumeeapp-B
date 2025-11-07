-- =========================================================================
-- TRIGGER FINAL Y COMPLETAMENTE ROBUSTO
-- =========================================================================
-- Esta es la versión final, más robusta del trigger function.
-- Maneja explícitamente todas las columnas NOT NULL para prevenir errores de inserción.

-- Eliminar trigger y función existentes
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Crear función final y robusta
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
    phone,
    whatsapp,
    membership_status, -- Explícitamente añadido
    role
  )
  VALUES (
    NEW.id,
    
    -- Fallback para full_name para satisfacer la restricción NOT NULL.
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Nuevo Usuario'),
    
    NEW.email,
    
    NULLIF(TRIM(NEW.raw_user_meta_data->>'profession'), ''),

    NULLIF(TRIM(NEW.raw_user_meta_data->>'phone'), ''),
    COALESCE(
      NULLIF(TRIM(NEW.raw_user_meta_data->>'whatsapp'), ''),
      NULLIF(TRIM(NEW.raw_user_meta_data->>'phone'), '')
    ),

    -- Explícitamente insertar el valor por defecto para membership_status.
    'free',
    
    -- Lógica condicional para el role.
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
'Función final y completamente robusta para manejar nuevos usuarios. Maneja explícitamente todas las columnas NOT NULL para prevenir errores de inserción.';

-- =========================================================================
-- TEST DE LA FUNCIÓN (OPCIONAL)
-- =========================================================================
-- Para probar la función manualmente (solo para debugging):
-- SELECT public.handle_new_user();
-- (Esto solo funcionará si hay un usuario en auth.users)
