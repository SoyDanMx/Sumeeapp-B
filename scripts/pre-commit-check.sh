#!/bin/bash
#
# Script de pre-verificación para ejecutar antes de commits
# Uso: ./scripts/pre-commit-check.sh
#

set -e

echo "🔍 Pre-verificación: Compilando proyecto..."

# Ejecutar build
npm run build

# Verificar que el build fue exitoso
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build exitoso. Puedes proceder con el commit."
    exit 0
else
    echo ""
    echo "❌ ERROR: El build falló. Corrige los errores antes de hacer commit."
    exit 1
fi

