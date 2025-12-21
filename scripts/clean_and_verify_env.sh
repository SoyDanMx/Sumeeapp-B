#!/bin/bash
# Script para limpiar caché y verificar variables de entorno

echo "🧹 Limpiando caché de Next.js y Turbopack..."
rm -rf .next
rm -rf node_modules/.cache
rm -rf .turbo
rm -rf .swc

echo ""
echo "🔍 Verificando .env.local..."
if [ -f .env.local ]; then
    echo "✅ Archivo .env.local encontrado"
    echo ""
    echo "📋 Variables de Supabase:"
    grep -E "NEXT_PUBLIC_SUPABASE_URL|NEXT_PUBLIC_SUPABASE_ANON_KEY|SUPABASE_SERVICE_ROLE_KEY" .env.local | while IFS= read -r line; do
        if [[ $line == *"tu_url"* ]] || [[ $line == *"TU_PROJECT"* ]]; then
            echo "❌ $line (VALOR PLACEHOLDER - DEBE CAMBIARSE)"
        else
            key=$(echo "$line" | cut -d'=' -f1)
            value=$(echo "$line" | cut -d'=' -f2-)
            if [ ${#value} -gt 50 ]; then
                masked="${value:0:30}...${value: -10}"
            else
                masked="$value"
            fi
            echo "✅ $key=$masked"
        fi
    done
else
    echo "❌ Archivo .env.local NO encontrado"
fi

echo ""
echo "✅ Limpieza completada. Reinicia el servidor con: npm run dev"
