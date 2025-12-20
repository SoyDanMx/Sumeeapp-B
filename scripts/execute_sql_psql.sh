#!/bin/bash
# Script para ejecutar SQL en Supabase usando psql
# Requiere: psql instalado y credenciales de Supabase

SQL_FILE="supabase/migrations/20250120_import_truper_full_catalog.sql"

if [ ! -f "$SQL_FILE" ]; then
    echo "❌ Error: No se encontró el archivo $SQL_FILE"
    exit 1
fi

echo "📖 Ejecutando SQL desde: $SQL_FILE"
echo "📊 Tamaño: $(wc -l < "$SQL_FILE") líneas"
echo ""
echo "⚠️  Para ejecutar este SQL, necesitas:"
echo "   1. Las credenciales de conexión de Supabase"
echo "   2. psql instalado"
echo ""
echo "📋 Opción 1: Ejecutar manualmente en Supabase SQL Editor"
echo "   1. Ve a: https://supabase.com/dashboard/project/jkdvrwmanmwoyyoixmnt/sql"
echo "   2. Copia el contenido de: $SQL_FILE"
echo "   3. Pégalo en el editor SQL"
echo "   4. Ejecuta (Run)"
echo ""
echo "📋 Opción 2: Ejecutar con psql (si tienes credenciales)"
echo "   psql 'postgresql://postgres:[PASSWORD]@db.jkdvrwmanmwoyyoixmnt.supabase.co:5432/postgres' -f $SQL_FILE"
echo ""


