# 📋 Instrucciones: Ejecutar Migración de Catálogo de Servicios

## ✅ **PASO 1: Ejecutar en Supabase SQL Editor**

1. Abre tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Ve a **SQL Editor** (menú lateral izquierdo)
3. Haz clic en **New Query**
4. Copia y pega el contenido completo de `supabase/migrations/create-service-catalog-table.sql`
5. Haz clic en **Run** (o presiona `Ctrl/Cmd + Enter`)
6. Verifica que aparezca el mensaje: "Success. No rows returned"

---

## ✅ **PASO 2: Verificar que la Tabla se Creó**

Ejecuta esta consulta en el SQL Editor:

```sql
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'service_catalog'
ORDER BY ordinal_position;
```

**Resultado esperado:**
- `id` (UUID, PK)
- `discipline` (TEXT, NOT NULL)
- `service_name` (TEXT, NOT NULL)
- `price_type` (price_type_enum, NOT NULL)
- `min_price` (NUMERIC, NOT NULL)
- `max_price` (NUMERIC, nullable)
- `unit` (TEXT, NOT NULL, default: 'servicio')
- `includes_materials` (BOOLEAN, default: false)
- `description` (TEXT, nullable)
- `is_active` (BOOLEAN, default: true)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

---

## ✅ **PASO 3: Verificar Datos Iniciales**

Ejecuta esta consulta:

```sql
SELECT 
    discipline,
    COUNT(*) as total_servicios,
    COUNT(CASE WHEN is_active = true THEN 1 END) as servicios_activos
FROM public.service_catalog
GROUP BY discipline
ORDER BY discipline;
```

**Resultado esperado:**
- `electricidad`: 10 servicios
- `plomeria`: 10 servicios

---

## ✅ **PASO 4: Verificar Tipo ENUM**

Ejecuta esta consulta:

```sql
SELECT 
    typname as type_name,
    enumlabel as enum_value
FROM pg_type
JOIN pg_enum ON pg_enum.enumtypid = pg_type.oid
WHERE typname = 'price_type_enum';
```

**Resultado esperado:**
- `fixed`
- `range`
- `starting_at`

---

## ⚠️ **IMPORTANTE**

- ✅ Esta migración **SOLO CREA** una tabla nueva
- ✅ **NO MODIFICA** tablas existentes
- ✅ **NO AFECTA** el flujo actual de creación de leads
- ✅ Los datos iniciales son de ejemplo (puedes ajustarlos después)

---

## 🚀 **Siguiente Paso**

Una vez ejecutada la migración, continuar con la creación del componente `ServicePricingSelector.tsx`.

---

## 📊 **Datos Iniciales Incluidos**

### **Electricidad (10 servicios):**
- Instalación de Mufa: Desde $2,900
- Instalación de Contacto: Desde $150
- Instalación de Apagador: Desde $200
- Instalación de Lámpara: Desde $350
- Reparación de Corto Circuito: $800 - $2,500
- Instalación de Ventilador de Techo: Desde $1,200
- Cambio de Breaker: Desde $450
- Instalación de Luminaria LED: Desde $500
- Cableado Nuevo (Habitación): $3,500 - $8,000
- Actualización de Tablero Eléctrico: $5,000 - $15,000

### **Plomería (10 servicios):**
- Reparación de Fuga de Agua: $500 - $2,000
- Instalación de Llave de Agua: Desde $350
- Destape de Drenaje: $800 - $2,500
- Instalación de Regadera: Desde $1,200
- Cambio de Válvula de Escusado: Desde $450
- Instalación de Calentador de Agua: $3,000 - $8,000
- Reparación de Tubería Rota: $1,000 - $4,000
- Instalación de Lavabo: Desde $1,500
- Instalación de WC: Desde $2,500
- Sistema de Agua Caliente: $5,000 - $15,000

---

**Estado:** ✅ SQL listo para ejecutar

