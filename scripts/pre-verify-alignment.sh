#!/bin/bash
# Script de pre-verificación: Alineación con apps de profesionales y cliente
# Ejecutar antes de cada commit/push

echo "🔍 Pre-verificación: Alineación con apps de profesionales y cliente"
echo ""

ERRORS=0
WARNINGS=0

# Verificar que los tipos de datos coincidan
echo "📋 Verificando tipos de datos..."

# Verificar estructura de queries de profiles
PROF_PROFILE_QUERY=$(grep -r "from('profiles')" "/Users/danielnuno/Sumee Pros/SumeePros/services" 2>/dev/null | grep "select" | head -1)
WEB_PROFILE_QUERY=$(grep -r "from('profiles')" "/Users/danielnuno/Documents/Sumee-Universe/Sumeeapp-B/src/app/verify" 2>/dev/null | grep "select" | head -1)

if [ -z "$PROF_PROFILE_QUERY" ] || [ -z "$WEB_PROFILE_QUERY" ]; then
    echo "  ⚠️  No se pudo verificar queries de profiles"
    WARNINGS=$((WARNINGS + 1))
else
    echo "  ✅ Queries de profiles encontradas"
fi

# Verificar estructura de queries de reviews
PROF_REVIEW_QUERY=$(grep -r "from('reviews')" "/Users/danielnuno/Sumee Pros/SumeePros/services" 2>/dev/null | head -1)
WEB_REVIEW_QUERY=$(grep -r "from('reviews')" "/Users/danielnuno/Documents/Sumee-Universe/Sumeeapp-B/src/app/verify" 2>/dev/null | head -1)

if [ -z "$PROF_REVIEW_QUERY" ] || [ -z "$WEB_REVIEW_QUERY" ]; then
    echo "  ⚠️  No se pudo verificar queries de reviews"
    WARNINGS=$((WARNINGS + 1))
else
    # Verificar que ambos seleccionen 'rating'
    if echo "$PROF_REVIEW_QUERY" | grep -q "rating" && echo "$WEB_REVIEW_QUERY" | grep -q "rating"; then
        echo "  ✅ Queries de reviews alineadas (ambas seleccionan 'rating')"
    else
        echo "  ❌ Inconsistencia: queries de reviews no alineadas"
        ERRORS=$((ERRORS + 1))
    fi
fi

# Verificar imports de Supabase
echo ""
echo "🔗 Verificando imports de Supabase..."
WEB_SUPABASE_IMPORT=$(grep -r "from.*supabase" "/Users/danielnuno/Documents/Sumee-Universe/Sumeeapp-B/src/app/verify" 2>/dev/null | grep -v "node_modules" | head -1)

if echo "$WEB_SUPABASE_IMPORT" | grep -q "createSupabaseServerClient\|supabaseClient"; then
    echo "  ✅ Imports de Supabase correctos"
else
    echo "  ❌ Error: Imports de Supabase incorrectos"
    ERRORS=$((ERRORS + 1))
fi

# Verificar que no haya referencias a propiedades que no existen
echo ""
echo "🔍 Verificando referencias a propiedades..."

# Verificar que no se use 'lead.status' (solo existe 'lead.estado')
if grep -r "lead\.status" "/Users/danielnuno/Documents/Sumee-Universe/Sumeeapp-B/src/app" 2>/dev/null | grep -v "node_modules" | grep -v ".git"; then
    echo "  ❌ Error: Se encontró 'lead.status' (debe ser 'lead.estado')"
    ERRORS=$((ERRORS + 1))
else
    echo "  ✅ No se encontró uso incorrecto de 'lead.status'"
fi

# Resumen
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo "✅ Pre-verificación completada sin errores ni advertencias"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo "⚠️  Pre-verificación completada con $WARNINGS advertencia(s)"
    exit 0
else
    echo "❌ Pre-verificación falló: $ERRORS error(es), $WARNINGS advertencia(s)"
    exit 1
fi
