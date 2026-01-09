#!/bin/bash
# Script de pre-commit para verificar alineación y errores comunes

echo "🔍 Pre-commit verification..."
echo ""

ERRORS=0

# 1. Verificar imports de Supabase
echo "1. Verificando imports de Supabase..."
incorrect=$(grep -r "import.*supabase.*from.*@/lib/supabase/server" src/ 2>/dev/null | grep -v "createSupabaseServerClient" | wc -l | tr -d ' ')
if [ "$incorrect" -gt 0 ]; then
    echo "❌ ERROR: Se encontraron imports incorrectos de Supabase"
    grep -r "import.*supabase.*from.*@/lib/supabase/server" src/ 2>/dev/null | grep -v "createSupabaseServerClient"
    ERRORS=$((ERRORS + 1))
else
    echo "✅ Imports de Supabase correctos"
fi
echo ""

# 2. Verificar metadata en client components
echo "2. Verificando metadata en client components..."
client_with_metadata=$(grep -r "'use client'" src/app -l 2>/dev/null | xargs grep -l "export.*metadata" 2>/dev/null | wc -l | tr -d ' ')
if [ "$client_with_metadata" -gt 0 ]; then
    echo "❌ ERROR: Client components con 'export metadata'"
    grep -r "'use client'" src/app -l 2>/dev/null | xargs grep -l "export.*metadata" 2>/dev/null
    ERRORS=$((ERRORS + 1))
else
    echo "✅ No hay metadata en client components"
fi
echo ""

# 3. Verificar tipos comunes
echo "3. Verificando uso de tipos..."
if grep -q "lead\.status" src/app 2>/dev/null; then
    echo "❌ ERROR: 'lead.status' no existe, usar 'lead.estado'"
    grep -rn "lead\.status" src/app 2>/dev/null
    ERRORS=$((ERRORS + 1))
else
    echo "✅ Uso correcto de tipos Lead"
fi
echo ""

# 4. Verificar iconos FontAwesome
echo "4. Verificando iconos FontAwesome..."
if grep -q "faShieldCheck" src/app 2>/dev/null; then
    echo "❌ ERROR: 'faShieldCheck' no existe, usar 'faShieldAlt'"
    grep -rn "faShieldCheck" src/app 2>/dev/null
    ERRORS=$((ERRORS + 1))
else
    echo "✅ Iconos FontAwesome correctos"
fi
echo ""

# 5. Verificar variables de entorno críticas
echo "5. Verificando variables de entorno..."
if [ -f ".env.local" ]; then
    if ! grep -q "^NEXT_PUBLIC_SUPABASE_URL=" .env.local 2>/dev/null; then
        echo "⚠️  WARNING: NEXT_PUBLIC_SUPABASE_URL no encontrada en .env.local"
    fi
    if ! grep -q "^NEXT_PUBLIC_SUPABASE_ANON_KEY=" .env.local 2>/dev/null; then
        echo "⚠️  WARNING: NEXT_PUBLIC_SUPABASE_ANON_KEY no encontrada en .env.local"
    fi
    echo "✅ .env.local existe"
else
    echo "⚠️  WARNING: .env.local no existe"
fi
echo ""

# Resumen
if [ $ERRORS -eq 0 ]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✅ Pre-commit verification: PASSED"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    exit 0
else
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "❌ Pre-commit verification: FAILED ($ERRORS errores)"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Corrige los errores antes de hacer commit."
    exit 1
fi
