#!/bin/bash
# Script para verificar alineación de tipos y estructuras con apps de profesionales y cliente

echo "🔍 Verificando alineación con apps de profesionales y cliente..."
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Directorios
PROFESSIONAL_APP="/Users/danielnuno/Sumee Pros/SumeePros"
CLIENT_APP="/Users/danielnuno/Documents/Sumee-Universe/SumeeClient"
WEB_APP="/Users/danielnuno/Documents/Sumee-Universe/Sumeeapp-B"

ERRORS=0

# Función para verificar tipos
check_types() {
    local type_name=$1
    local file_pattern=$2
    
    echo "📋 Verificando tipo: $type_name"
    
    # Buscar en app de profesionales
    PROF_RESULT=$(find "$PROFESSIONAL_APP" -name "$file_pattern" -type f 2>/dev/null | head -1)
    if [ -n "$PROF_RESULT" ]; then
        PROF_HAS_TYPE=$(grep -E "interface.*$type_name|type.*$type_name" "$PROF_RESULT" 2>/dev/null | wc -l)
        if [ "$PROF_HAS_TYPE" -gt 0 ]; then
            echo -e "  ${GREEN}✅${NC} Encontrado en app de profesionales"
        else
            echo -e "  ${YELLOW}⚠️${NC}  No encontrado en app de profesionales"
        fi
    fi
    
    # Buscar en app web
    WEB_RESULT=$(find "$WEB_APP" -name "$file_pattern" -type f 2>/dev/null | head -1)
    if [ -n "$WEB_RESULT" ]; then
        WEB_HAS_TYPE=$(grep -E "interface.*$type_name|type.*$type_name" "$WEB_RESULT" 2>/dev/null | wc -l)
        if [ "$WEB_HAS_TYPE" -gt 0 ]; then
            echo -e "  ${GREEN}✅${NC} Encontrado en app web"
        else
            echo -e "  ${RED}❌${NC} No encontrado en app web"
            ERRORS=$((ERRORS + 1))
        fi
    fi
    echo ""
}

# Verificar tipos comunes
check_types "Lead" "*.ts"
check_types "Profile" "*.ts"
check_types "Review" "*.ts"

# Verificar estructuras de Supabase
echo "📊 Verificando estructuras de Supabase..."
echo ""

# Verificar imports de Supabase
echo "🔗 Verificando imports de Supabase..."

PROF_SUPABASE_IMPORT=$(grep -r "from.*supabase" "$PROFESSIONAL_APP/services" 2>/dev/null | head -1 | cut -d: -f2)
WEB_SUPABASE_IMPORT=$(grep -r "from.*supabase" "$WEB_APP/src/app/verify" 2>/dev/null | head -1 | cut -d: -f2)

if [ -n "$PROF_SUPABASE_IMPORT" ] && [ -n "$WEB_SUPABASE_IMPORT" ]; then
    echo -e "  ${GREEN}✅${NC} Imports de Supabase presentes"
else
    echo -e "  ${YELLOW}⚠️${NC}  Verificar imports de Supabase"
fi
echo ""

# Verificar queries de profiles
echo "👤 Verificando queries de profiles..."
PROF_PROFILE_QUERY=$(grep -r "from('profiles')" "$PROFESSIONAL_APP/services" 2>/dev/null | head -1)
WEB_PROFILE_QUERY=$(grep -r "from('profiles')" "$WEB_APP/src/app/verify" 2>/dev/null | head -1)

if [ -n "$PROF_PROFILE_QUERY" ] && [ -n "$WEB_PROFILE_QUERY" ]; then
    echo -e "  ${GREEN}✅${NC} Queries de profiles presentes"
    
    # Verificar campos seleccionados
    PROF_FIELDS=$(echo "$PROF_PROFILE_QUERY" | grep -o "select([^)]*)" | head -1)
    WEB_FIELDS=$(echo "$WEB_PROFILE_QUERY" | grep -o "select([^)]*)" | head -1)
    
    if [ -n "$PROF_FIELDS" ] && [ -n "$WEB_FIELDS" ]; then
        echo "  📝 Campos en app profesional: ${PROF_FIELDS:0:50}..."
        echo "  📝 Campos en app web: ${WEB_FIELDS:0:50}..."
    fi
else
    echo -e "  ${YELLOW}⚠️${NC}  Verificar queries de profiles"
fi
echo ""

# Verificar queries de reviews
echo "⭐ Verificando queries de reviews..."
PROF_REVIEW_QUERY=$(grep -r "from('reviews')" "$PROFESSIONAL_APP/services" 2>/dev/null | head -1)
WEB_REVIEW_QUERY=$(grep -r "from('reviews')" "$WEB_APP/src/app/verify" 2>/dev/null | head -1)

if [ -n "$PROF_REVIEW_QUERY" ] && [ -n "$WEB_REVIEW_QUERY" ]; then
    echo -e "  ${GREEN}✅${NC} Queries de reviews presentes"
    
    # Verificar que ambos seleccionen 'rating'
    if echo "$PROF_REVIEW_QUERY" | grep -q "rating" && echo "$WEB_REVIEW_QUERY" | grep -q "rating"; then
        echo -e "  ${GREEN}✅${NC} Ambos seleccionan campo 'rating'"
    else
        echo -e "  ${RED}❌${NC} Inconsistencia en campos de reviews"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo -e "  ${YELLOW}⚠️${NC}  Verificar queries de reviews"
fi
echo ""

# Resumen
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ Verificación completada sin errores${NC}"
    exit 0
else
    echo -e "${RED}❌ Se encontraron $ERRORS inconsistencia(s)${NC}"
    exit 1
fi
