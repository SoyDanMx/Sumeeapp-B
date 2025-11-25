#!/bin/bash

# Script de Testing para Integración de Stripe
# Este script ayuda a probar ambos flujos (con y sin pago)

set -e

echo "🧪 Script de Testing - Integración de Stripe"
echo "=============================================="
echo ""

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: No se encontró package.json. Ejecuta este script desde la raíz del proyecto.${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Checklist de Pre-requisitos:${NC}"
echo ""

# 1. Verificar que las dependencias estén instaladas
echo "1. Verificando dependencias..."
if npm list @stripe/react-stripe-js > /dev/null 2>&1; then
    echo -e "   ${GREEN}✅ @stripe/react-stripe-js instalado${NC}"
else
    echo -e "   ${RED}❌ @stripe/react-stripe-js no encontrado${NC}"
    echo "   Ejecutando: npm install @stripe/react-stripe-js --legacy-peer-deps"
    npm install @stripe/react-stripe-js --legacy-peer-deps
fi

if npm list @stripe/stripe-js > /dev/null 2>&1; then
    echo -e "   ${GREEN}✅ @stripe/stripe-js instalado${NC}"
else
    echo -e "   ${YELLOW}⚠️  @stripe/stripe-js no encontrado${NC}"
fi

# 2. Verificar variables de entorno
echo ""
echo "2. Verificando variables de entorno..."
if [ -f ".env.local" ]; then
    if grep -q "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" .env.local; then
        echo -e "   ${GREEN}✅ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY configurada${NC}"
    else
        echo -e "   ${YELLOW}⚠️  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY no encontrada en .env.local${NC}"
    fi
    
    if grep -q "NEXT_PUBLIC_ENABLE_STRIPE_PAYMENT" .env.local; then
        STRIPE_ENABLED=$(grep "NEXT_PUBLIC_ENABLE_STRIPE_PAYMENT" .env.local | cut -d '=' -f2)
        echo -e "   ${YELLOW}⚠️  NEXT_PUBLIC_ENABLE_STRIPE_PAYMENT=$STRIPE_ENABLED${NC}"
    else
        echo -e "   ${GREEN}✅ NEXT_PUBLIC_ENABLE_STRIPE_PAYMENT no configurado (por defecto: false)${NC}"
    fi
else
    echo -e "   ${YELLOW}⚠️  .env.local no encontrado${NC}"
fi

# 3. Verificar que los archivos necesarios existan
echo ""
echo "3. Verificando archivos necesarios..."
FILES=(
    "src/components/client/RequestServiceModal.tsx"
    "src/components/client/PaymentForm.tsx"
    "src/lib/stripe/client.ts"
    "supabase/functions/stripe-service/index.ts"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "   ${GREEN}✅ $file${NC}"
    else
        echo -e "   ${RED}❌ $file no encontrado${NC}"
    fi
done

# 4. Verificar build
echo ""
echo "4. Verificando que el proyecto compile..."
if npm run build > /tmp/stripe-build-test.log 2>&1; then
    echo -e "   ${GREEN}✅ Build exitoso${NC}"
else
    echo -e "   ${RED}❌ Build falló. Revisa /tmp/stripe-build-test.log${NC}"
    echo ""
    echo "Últimas líneas del error:"
    tail -20 /tmp/stripe-build-test.log
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Pre-requisitos verificados${NC}"
echo ""
echo "=============================================="
echo ""
echo "📝 Instrucciones para Testing Manual:"
echo ""
echo "1. TESTING CON FEATURE FLAG DESACTIVADO (Flujo Actual):"
echo "   - Asegúrate de que NEXT_PUBLIC_ENABLE_STRIPE_PAYMENT no esté en .env.local"
echo "   - O configúralo como: NEXT_PUBLIC_ENABLE_STRIPE_PAYMENT=false"
echo "   - Ejecuta: npm run dev"
echo "   - Abre: http://localhost:3000"
echo "   - Prueba crear un lead (debería funcionar igual que antes)"
echo "   - Verifica que NO aparece paso de pago"
echo ""
echo "2. TESTING CON FEATURE FLAG ACTIVADO (Nuevo Flujo):"
echo "   - Agrega a .env.local: NEXT_PUBLIC_ENABLE_STRIPE_PAYMENT=true"
echo "   - Reinicia el servidor: npm run dev"
echo "   - Abre: http://localhost:3000"
echo "   - Prueba crear un lead"
echo "   - Verifica que aparece paso 4 (Pago)"
echo "   - Usa tarjeta de prueba: 4242 4242 4242 4242"
echo "   - Cualquier fecha futura, cualquier CVC"
echo "   - Verifica que se autoriza el hold de $350 MXN"
echo "   - Verifica que se crea el lead con datos de pago"
echo ""
echo "3. VERIFICAR EN SUPABASE:"
echo "   - Ve a la tabla 'leads' en Supabase Dashboard"
echo "   - Verifica que los nuevos leads tengan:"
echo "     * payment_method_id (pm_xxxx)"
echo "     * payment_intent_id (pi_xxxx)"
echo "     * payment_status ('authorized')"
echo ""
echo "=============================================="
echo ""
echo -e "${GREEN}✅ Script de verificación completado${NC}"

