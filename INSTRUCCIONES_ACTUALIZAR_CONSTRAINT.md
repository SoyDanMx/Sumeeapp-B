# 🔧 Instrucciones: Actualizar Constraint de leads.servicio

## ❌ Problema

El error `new row for relation "leads" violates check constraint "leads_servicio_check"` ocurre porque el constraint en la base de datos no incluye las nuevas disciplinas como "montaje-armado".

## ✅ Solución

### Paso 1: Ejecutar la Migración SQL

Ejecuta la siguiente migración en Supabase SQL Editor:

```sql
-- Actualizar constraint para servicio
ALTER TABLE public.leads
  DROP CONSTRAINT IF EXISTS leads_servicio_check;

ALTER TABLE public.leads
  ADD CONSTRAINT leads_servicio_check 
  CHECK (servicio IN (
    -- Disciplinas originales
    'plomeria',
    'electricidad',
    'carpinteria',
    'pintura',
    'limpieza',
    'jardineria',
    'albanileria',
    'remodelacion',
    'impermeabilizacion',
    'gas',
    'calentadores',
    'bombas_agua',
    'seguridad',
    'climatizacion',
    'electrodomesticos',
    -- 🆕 Nuevas disciplinas agregadas
    'montaje-armado',
    'aire-acondicionado',
    'cctv',
    'wifi',
    'fumigacion',
    'cerrajeria',
    'tablaroca',
    'construccion'
  ));
```

### Paso 2: Verificar

Después de ejecutar la migración, verifica que el constraint se aplicó correctamente:

```sql
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conname = 'leads_servicio_check';
```

### Paso 3: Probar

Intenta crear un lead con servicio "montaje-armado" para verificar que funciona.

---

## 📋 Disciplinas Permitidas (Actualizadas)

1. plomeria
2. electricidad
3. carpinteria
4. pintura
5. limpieza
6. jardineria
7. albanileria
8. remodelacion
9. impermeabilizacion
10. gas
11. calentadores
12. bombas_agua
13. seguridad
14. climatizacion
15. electrodomesticos
16. **montaje-armado** 🆕
17. **aire-acondicionado** 🆕
18. **cctv** 🆕
19. **wifi** 🆕
20. **fumigacion** 🆕
21. **cerrajeria** 🆕
22. **tablaroca** 🆕
23. **construccion** 🆕

---

*Documento creado el 17 de enero de 2025*
*Versión: 1.0*

