#!/bin/bash
# Script para verificar alineación entre Sumeeapp-B, SumeePros y SumeeClient

echo "🔍 Verificando alineación entre repositorios..."
echo ""

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Rutas de los repositorios
SUMEAPP_B="/Users/danielnuno/Documents/Sumee-Universe/Sumeeapp-B"
SUMEEPROS="/Users/danielnuno/Sumee Pros/SumeePros"
SUMEECLIENT="/Users/danielnuno/Documents/Sumee-Universe/SumeeClient"

# Verificar que los repositorios existan
check_repo() {
    if [ ! -d "$1" ]; then
        echo -e "${RED}❌ Repositorio no encontrado: $1${NC}"
        return 1
    else
        echo -e "${GREEN}✅ Repositorio encontrado: $1${NC}"
        return 0
    fi
}

echo "📁 Verificando existencia de repositorios..."
check_repo "$SUMEAPP_B"
check_repo "$SUMEEPROS"
check_repo "$SUMEECLIENT"
echo ""

# Verificar tipos/interfaces compartidas
echo "🔍 Verificando tipos e interfaces compartidas..."

# Tipos críticos a verificar
TYPES_TO_CHECK=(
    "Lead"
    "Profile"
    "VerificationProfile"
    "VerificationStats"
    "VerificationStatus"
)

for type in "${TYPES_TO_CHECK[@]}"; do
    echo -n "  Verificando tipo: $type... "
    
    # Buscar en Sumeeapp-B
    found_b=$(grep -r "interface $type\|type $type" "$SUMEAPP_B/src/types" 2>/dev/null | wc -l | tr -d ' ')
    found_pros=$(grep -r "interface $type\|type $type" "$SUMEEPROS" 2>/dev/null | wc -l | tr -d ' ')
    found_client=$(grep -r "interface $type\|type $type" "$SUMEECLIENT" 2>/dev/null | wc -l | tr -d ' ')
    
    if [ "$found_b" -gt 0 ] && [ "$found_pros" -gt 0 ]; then
        echo -e "${GREEN}✅${NC}"
    elif [ "$found_b" -gt 0 ]; then
        echo -e "${YELLOW}⚠️  Solo en Sumeeapp-B${NC}"
    else
        echo -e "${RED}❌ No encontrado${NC}"
    fi
done
echo ""

# Verificar servicios compartidos
echo "🔍 Verificando servicios compartidos..."

SERVICES_TO_CHECK=(
    "verification"
    "badges"
    "reviews"
    "jobs"
)

for service in "${SERVICES_TO_CHECK[@]}"; do
    echo -n "  Verificando servicio: $service... "
    
    # Buscar archivos de servicio
    file_b=$(find "$SUMEAPP_B/src" -name "*$service*.ts" -o -name "*$service*.tsx" 2>/dev/null | head -1)
    file_pros=$(find "$SUMEEPROS/services" -name "*$service*.ts" 2>/dev/null | head -1)
    
    if [ -n "$file_b" ] && [ -n "$file_pros" ]; then
        echo -e "${GREEN}✅${NC}"
    elif [ -n "$file_b" ]; then
        echo -e "${YELLOW}⚠️  Solo en Sumeeapp-B${NC}"
    elif [ -n "$file_pros" ]; then
        echo -e "${YELLOW}⚠️  Solo en SumeePros${NC}"
    else
        echo -e "${RED}❌ No encontrado${NC}"
    fi
done
echo ""

# Verificar variables de entorno
echo "🔍 Verificando variables de entorno..."

ENV_VARS=(
    "NEXT_PUBLIC_SUPABASE_URL"
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    "SUPABASE_SERVICE_ROLE_KEY"
    "GOOGLE_GENERATIVE_AI_API_KEY"
)

for var in "${ENV_VARS[@]}"; do
    echo -n "  Verificando: $var... "
    
    # Verificar en .env.local de Sumeeapp-B
    if grep -q "^$var=" "$SUMEAPP_B/.env.local" 2>/dev/null; then
        echo -e "${GREEN}✅ En .env.local${NC}"
    else
        echo -e "${YELLOW}⚠️  No encontrado en .env.local${NC}"
    fi
done
echo ""

# Verificar estructura de rutas de verificación
echo "🔍 Verificando rutas de verificación..."

# Verificar que /verify/[id] existe en ambos
if [ -f "$SUMEAPP_B/src/app/verify/[id]/page.tsx" ]; then
    echo -e "${GREEN}✅ /verify/[id] existe en Sumeeapp-B${NC}"
else
    echo -e "${RED}❌ /verify/[id] NO existe en Sumeeapp-B${NC}"
fi

if [ -f "$SUMEEPROS/app/verify/[id].tsx" ]; then
    echo -e "${GREEN}✅ /verify/[id] existe en SumeePros${NC}"
else
    echo -e "${YELLOW}⚠️  /verify/[id] NO existe en SumeePros${NC}"
fi
echo ""

# Verificar imports de Supabase
echo "🔍 Verificando imports de Supabase..."

# Verificar que no haya imports incorrectos
incorrect_imports=$(grep -r "import.*supabase.*from.*@/lib/supabase/server" "$SUMEAPP_B/src" 2>/dev/null | grep -v "createSupabaseServerClient" | wc -l | tr -d ' ')

if [ "$incorrect_imports" -eq 0 ]; then
    echo -e "${GREEN}✅ Todos los imports de Supabase son correctos${NC}"
else
    echo -e "${RED}❌ Se encontraron $incorrect_imports imports incorrectos de Supabase${NC}"
    grep -r "import.*supabase.*from.*@/lib/supabase/server" "$SUMEAPP_B/src" 2>/dev/null | grep -v "createSupabaseServerClient"
fi
echo ""

# Verificar metadata en layouts
echo "🔍 Verificando metadata en layouts..."

# Verificar que no haya 'export metadata' en client components
client_with_metadata=$(grep -r "'use client'" "$SUMEAPP_B/src/app" -l 2>/dev/null | xargs grep -l "export.*metadata" 2>/dev/null | wc -l | tr -d ' ')

if [ "$client_with_metadata" -eq 0 ]; then
    echo -e "${GREEN}✅ No hay 'export metadata' en client components${NC}"
else
    echo -e "${RED}❌ Se encontraron $client_with_metadata client components con 'export metadata'${NC}"
    grep -r "'use client'" "$SUMEAPP_B/src/app" -l 2>/dev/null | xargs grep -l "export.*metadata" 2>/dev/null
fi
echo ""

# Resumen final
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Verificación de alineación completada"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Próximos pasos recomendados:"
echo "  1. Revisar diferencias en tipos/interfaces"
echo "  2. Sincronizar servicios compartidos si es necesario"
echo "  3. Verificar que variables de entorno estén configuradas"
echo "  4. Asegurar que rutas de verificación sean consistentes"
echo ""
