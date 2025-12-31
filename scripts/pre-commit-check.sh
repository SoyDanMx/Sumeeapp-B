#!/bin/bash

# Script de Pre-verificación antes de Commit
# Este script verifica que no haya errores antes de hacer commit

set -e  # Salir si hay errores

echo "🔍 Iniciando pre-verificación antes de commit..."
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Verificar que hay cambios para commitear
if [ -z "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠️  No hay cambios para commitear${NC}"
    exit 0
fi

echo "📝 Archivos modificados:"
git status --short
echo ""

# 2. Verificar TypeScript (solo archivos modificados)
echo "🔷 Verificando TypeScript..."
TS_ERRORS=0

# Obtener archivos TypeScript modificados
TS_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|tsx)$' || true)
UNSTAGED_TS_FILES=$(git diff --name-only --diff-filter=ACM | grep -E '\.(ts|tsx)$' || true)

if [ -n "$TS_FILES" ] || [ -n "$UNSTAGED_TS_FILES" ]; then
    # Intentar verificar TypeScript
    if command -v npx &> /dev/null; then
        if npx tsc --noEmit 2>&1 | tee /tmp/tsc-output.log; then
            echo -e "${GREEN}✅ TypeScript: Sin errores${NC}"
        else
            echo -e "${RED}❌ TypeScript: Errores encontrados${NC}"
            TS_ERRORS=1
        fi
    else
        echo -e "${YELLOW}⚠️  npx no disponible, saltando verificación TypeScript${NC}"
    fi
else
    echo -e "${GREEN}✅ No hay archivos TypeScript modificados${NC}"
fi
echo ""

# 3. Verificar linting (solo archivos modificados)
echo "🔷 Verificando ESLint..."
LINT_ERRORS=0

# Obtener archivos modificados
JS_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(js|jsx|ts|tsx)$' || true)
UNSTAGED_JS_FILES=$(git diff --name-only --diff-filter=ACM | grep -E '\.(js|jsx|ts|tsx)$' || true)

if [ -n "$JS_FILES" ] || [ -n "$UNSTAGED_JS_FILES" ]; then
    # Intentar ejecutar linting
    if command -v npm &> /dev/null; then
        if npm run lint 2>&1 | tee /tmp/lint-output.log; then
            echo -e "${GREEN}✅ ESLint: Sin errores${NC}"
        else
            echo -e "${RED}❌ ESLint: Errores encontrados${NC}"
            LINT_ERRORS=1
        fi
    else
        echo -e "${YELLOW}⚠️  npm no disponible, saltando verificación ESLint${NC}"
    fi
else
    echo -e "${GREEN}✅ No hay archivos JavaScript/TypeScript modificados${NC}"
fi
echo ""

# 4. Verificar que no hay archivos grandes sin gitignore
echo "🔷 Verificando archivos grandes..."
LARGE_FILES=$(find . -type f -size +10M -not -path "./node_modules/*" -not -path "./.git/*" -not -path "./.next/*" 2>/dev/null | head -5 || true)

if [ -n "$LARGE_FILES" ]; then
    echo -e "${YELLOW}⚠️  Archivos grandes encontrados (>10MB):${NC}"
    echo "$LARGE_FILES"
    echo -e "${YELLOW}   Verifica que estén en .gitignore${NC}"
else
    echo -e "${GREEN}✅ No hay archivos grandes sin gitignore${NC}"
fi
echo ""

# 5. Resumen final
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $TS_ERRORS -eq 0 ] && [ $LINT_ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ Pre-verificación completada exitosamente${NC}"
    echo -e "${GREEN}   Puedes proceder con el commit${NC}"
    exit 0
else
    echo -e "${RED}❌ Pre-verificación falló${NC}"
    echo -e "${RED}   Corrige los errores antes de hacer commit${NC}"
    if [ $TS_ERRORS -eq 1 ]; then
        echo -e "${RED}   - Errores de TypeScript encontrados${NC}"
    fi
    if [ $LINT_ERRORS -eq 1 ]; then
        echo -e "${RED}   - Errores de ESLint encontrados${NC}"
    fi
    exit 1
fi
