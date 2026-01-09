#!/bin/bash

# Script de verificación previa al build
# Verifica errores comunes antes de compilar

echo "🔍 Verificando código antes del build..."

ERRORS=0

# 1. Verificar que no haya exports de metadata en componentes 'use client'
echo "1. Verificando exports de metadata en componentes client..."
CLIENT_FILES=$(find src/app -name "*.tsx" -exec grep -l "use client" {} \;)
for file in $CLIENT_FILES; do
    if grep -q "export.*metadata\|metadata.*export" "$file" 2>/dev/null; then
        echo "❌ ERROR: $file tiene 'use client' y export metadata"
        ERRORS=$((ERRORS + 1))
    fi
done

# 2. Verificar que los layout.tsx tengan metadata
echo "2. Verificando metadata en layouts..."
LAYOUT_FILES=$(find src/app -name "layout.tsx")
for file in $LAYOUT_FILES; do
    if ! grep -q "export.*metadata" "$file" 2>/dev/null; then
        echo "⚠️  WARNING: $file no tiene metadata export (puede ser intencional)"
    fi
done

# 3. Verificar imports de supabase correctos
echo "3. Verificando imports de Supabase..."
if grep -r "from '@/lib/supabaseClient'" src/app/verify src/app/verificacion 2>/dev/null | grep -v "page.tsx" | grep -v "use client"; then
    echo "⚠️  WARNING: Algunos archivos usan supabaseClient en lugar de server client"
fi

# 4. Verificar que no haya secretos en el código
echo "4. Verificando secretos en el código..."
if grep -r "hf_[A-Za-z0-9]\{30,\}\|sk_[A-Za-z0-9]\{30,\}\|pk_[A-Za-z0-9]\{30,\}" src/ supabase/functions/ 2>/dev/null | grep -v ".git"; then
    echo "❌ ERROR: Se detectaron posibles secretos en el código"
    ERRORS=$((ERRORS + 1))
fi

# 5. Verificar sintaxis TypeScript básica
echo "5. Verificando sintaxis TypeScript..."
if command -v npx &> /dev/null; then
    npx tsc --noEmit --skipLibCheck 2>&1 | head -20 || echo "⚠️  No se pudo verificar TypeScript (puede requerir node_modules)"
fi

if [ $ERRORS -eq 0 ]; then
    echo "✅ Verificación completada sin errores críticos"
    exit 0
else
    echo "❌ Se encontraron $ERRORS error(es). Corrígelos antes de hacer build."
    exit 1
fi
