# 📋 Instrucciones: Ejecutar Migración de Columnas de Pago

## ✅ **PASO 1: Ejecutar en Supabase SQL Editor**

1. Abre tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Ve a **SQL Editor** (menú lateral izquierdo)
3. Haz clic en **New Query**
4. Copia y pega el contenido completo de `supabase/migrations/add-payment-columns-to-leads.sql`
5. Haz clic en **Run** (o presiona `Ctrl/Cmd + Enter`)
6. Verifica que aparezca el mensaje: "Success. No rows returned"

## ✅ **PASO 2: Verificar que las Columnas se Agregaron**

Ejecuta esta consulta en el SQL Editor para verificar:

```sql
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'leads'
    AND column_name IN ('payment_method_id', 'payment_intent_id', 'payment_status')
ORDER BY column_name;
```

**Resultado esperado:**
- `payment_method_id` (TEXT, nullable)
- `payment_intent_id` (TEXT, nullable)
- `payment_status` (TEXT, nullable, default: 'pending')

## ✅ **PASO 3: Verificar Índices**

```sql
SELECT
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'leads'
    AND indexname IN ('idx_leads_payment_status', 'idx_leads_payment_intent_id');
```

**Resultado esperado:**
- `idx_leads_payment_status`
- `idx_leads_payment_intent_id`

## ⚠️ **IMPORTANTE**

- ✅ Esta migración **SOLO AGREGA** columnas nuevas
- ✅ **NO MODIFICA** columnas existentes
- ✅ **NO AFECTA** el flujo actual de creación de leads
- ✅ Las columnas son opcionales (nullable), así que leads existentes no se ven afectados

## 🚀 **Siguiente Paso**

Una vez ejecutada la migración, continúa con la creación de la Edge Function `stripe-service`.

